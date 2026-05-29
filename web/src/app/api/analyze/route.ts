import { NextRequest } from "next/server"
import type { AnalyzeResponse } from "@productsense/shared"
import {
  ExtractedProductSchema,
  UserPreferencesSchema
} from "@productsense/shared/schemas"
import {
  successResponse,
  errorResponse,
  handleOptions,
  parseJsonBody
} from "@/lib/api-response"
import {
  runProductEvaluation,
  toProductAnalysis
} from "@/services/evaluation-orchestrator"
import {
  upsertProduct,
  recordPriceSnapshot,
  getPriceHistory,
  getCachedAnalysis,
  cacheAnalysis
} from "@/services/price-service"

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: NextRequest) {
  const body = await parseJsonBody<{
    product: unknown
    preferences?: unknown
    forceRefresh?: boolean
  }>(request)

  if (!body?.product) {
    return errorResponse("INVALID_REQUEST", "Product data is required", 400)
  }

  const productResult = ExtractedProductSchema.safeParse(body.product)
  if (!productResult.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid product data",
      400,
      productResult.error.flatten()
    )
  }

  const product = productResult.data
  const preferences = body.preferences
    ? UserPreferencesSchema.safeParse(body.preferences).data
    : undefined

  try {
    let dbProduct = null
    try {
      dbProduct = await upsertProduct(product)
      await recordPriceSnapshot(
        dbProduct.id,
        product.price,
        product.originalPrice,
        product.discount,
        product.currency
      )
    } catch (dbError) {
      console.warn("[Analyze] Database unavailable:", dbError)
    }

    const priceHistory = dbProduct
      ? await getPriceHistory(product.site, product.id, product.price)
      : null

    if (dbProduct && !body.forceRefresh) {
      const cached = await getCachedAnalysis(dbProduct.id)
      if (cached) {
        const analysis = cached.analysisData as unknown as AnalyzeResponse["analysis"]
        return successResponse<AnalyzeResponse>({
          analysis: {
            ...analysis,
            priceHistory: priceHistory ?? analysis.priceHistory,
            cacheHit: true
          },
          productId: dbProduct.id
        })
      }
    }

    const evaluation = await runProductEvaluation({
      product,
      preferences: preferences ?? undefined,
      priceHistory
    })

    const analysis = toProductAnalysis(evaluation)

    if (dbProduct) {
      try {
        const ttlHours = parseInt(
          process.env.ANALYSIS_CACHE_TTL_HOURS ?? "24",
          10
        )
        await cacheAnalysis(
          dbProduct.id,
          analysis,
          evaluation.modelUsed,
          ttlHours
        )
      } catch {
        // non-fatal
      }
    }

    return successResponse<AnalyzeResponse>({
      analysis,
      productId: dbProduct?.id ?? product.id
    })
  } catch (error) {
    console.error("[Analyze] Error:", error)
    const message =
      error instanceof Error ? error.message : "Evaluation failed"
    return errorResponse("ANALYSIS_FAILED", message, 500)
  }
}
