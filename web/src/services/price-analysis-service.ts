import type {
  ExtractedProduct,
  PriceAnalysis,
  PriceHistorySummary
} from "@productsense/shared"

export function buildPriceAnalysis(
  product: ExtractedProduct,
  priceHistory?: PriceHistorySummary | null
): PriceAnalysis {
  const current = product.price
  const currency = product.currency

  if (!priceHistory || priceHistory.dataPoints < 2) {
    const discount = product.discount ?? 0
    const original = product.originalPrice ?? current
    const fairValue = discount > 0 ? original * 0.92 : current
    const fairness =
      discount > 25
        ? "Underpriced"
        : discount > 8
          ? "Fairly Priced"
          : current > original * 0.95
            ? "Overpriced"
            : "Fairly Priced"

    return {
      currentPrice: current,
      currency,
      fairValueEstimate: Math.round(fairValue),
      priceFairness: fairness,
      vsHistoricalLow: 0,
      vsHistoricalAvg: 0,
      trend: "stable",
      timingAdvice:
        discount > 20 ? "Good Time To Buy" : "Neutral",
      reasoning:
        "Limited price history — assessment based on listed MRP/discount only. More data will improve accuracy."
    }
  }

  const vsLow =
    priceHistory.lowestPrice > 0
      ? Math.round(((current - priceHistory.lowestPrice) / priceHistory.lowestPrice) * 100)
      : 0
  const vsAvg =
    priceHistory.averagePrice > 0
      ? Math.round(((current - priceHistory.averagePrice) / priceHistory.averagePrice) * 100)
      : 0

  const fairValue = Math.round(
    priceHistory.averagePrice * 0.95 + priceHistory.lowestPrice * 0.05
  )

  let fairness: PriceAnalysis["priceFairness"] = "Fairly Priced"
  if (current <= priceHistory.lowestPrice * 1.05) fairness = "Underpriced"
  else if (current > priceHistory.averagePrice * 1.08) fairness = "Overpriced"

  return {
    currentPrice: current,
    currency,
    fairValueEstimate: fairValue,
    priceFairness: fairness,
    vsHistoricalLow: vsLow,
    vsHistoricalAvg: vsAvg,
    trend: priceHistory.trend,
    timingAdvice: priceHistory.recommendation,
    reasoning: `Current price is ${vsLow}% vs lowest tracked (₹${priceHistory.lowestPrice}) and ${vsAvg}% vs average (₹${priceHistory.averagePrice}). Trend: ${priceHistory.trend}.`
  }
}
