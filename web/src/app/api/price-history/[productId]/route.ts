import {
  successResponse,
  errorResponse,
  handleOptions
} from "@/lib/api-response"
import { getPriceHistory } from "@/services/price-service"

export async function OPTIONS() {
  return handleOptions()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const { searchParams } = new URL(request.url)
  const site = searchParams.get("site")
  const externalId = searchParams.get("externalId")
  const currentPrice = parseFloat(searchParams.get("currentPrice") ?? "0")

  if (!site || !externalId) {
    return errorResponse(
      "INVALID_REQUEST",
      "site and externalId query params required",
      400
    )
  }

  try {
    const history = await getPriceHistory(site, externalId, currentPrice)
    if (!history) {
      return successResponse({
        productId,
        message: "No price history yet — data accumulates over time",
        dataPoints: 0
      })
    }
    return successResponse(history)
  } catch (error) {
    console.error("[PriceHistory] Error:", error)
    return errorResponse("PRICE_HISTORY_FAILED", "Failed to fetch price history", 500)
  }
}
