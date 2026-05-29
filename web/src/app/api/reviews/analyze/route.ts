import { ExtractedProductSchema } from "@productsense/shared/schemas"
import {
  successResponse,
  errorResponse,
  handleOptions,
  parseJsonBody
} from "@/lib/api-response"
import { analyzeReviewTrust } from "@/services/analysis-service"

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: Request) {
  const body = await parseJsonBody<{ product: unknown }>(request)
  if (!body?.product) {
    return errorResponse("INVALID_REQUEST", "Product data required", 400)
  }

  const partial = body.product as Record<string, unknown>
  const productResult = ExtractedProductSchema.safeParse({
    id: partial.id ?? "unknown",
    site: partial.site ?? "unknown",
    url: partial.url ?? "https://example.com",
    name: partial.name ?? "Unknown",
    price: partial.price ?? 0,
    currency: partial.currency ?? "INR",
    reviews: partial.reviews ?? [],
    extractedAt: new Date().toISOString(),
    specifications: [],
    images: []
  })

  if (!productResult.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid product data", 400)
  }

  const reviewTrust = analyzeReviewTrust(productResult.data)
  return successResponse({ reviewTrust })
}
