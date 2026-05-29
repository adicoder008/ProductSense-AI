import type { PriceHistorySummary } from "@productsense/shared"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import { formatPrice } from "~lib/utils"
import { Badge } from "./ui/badge"

interface PriceHistoryProps {
  priceHistory: PriceHistorySummary
  currency?: string
}

export function PriceHistory({ priceHistory, currency = "INR" }: PriceHistoryProps) {
  const TrendIcon =
    priceHistory.trend === "rising"
      ? TrendingUp
      : priceHistory.trend === "falling"
        ? TrendingDown
        : Minus

  const trendColor =
    priceHistory.trend === "rising"
      ? "text-ps-avoid"
      : priceHistory.trend === "falling"
        ? "text-ps-buy"
        : "text-ps-muted"

  const recVariant =
    priceHistory.recommendation === "Good Time To Buy"
      ? "buy"
      : priceHistory.recommendation === "Wait For Price Drop"
        ? "avoid"
        : "muted"

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ps-text">Price History</span>
        <Badge variant={recVariant}>{priceHistory.recommendation}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-ps-muted">Lowest</p>
          <p className="text-sm font-semibold text-ps-buy">
            {formatPrice(priceHistory.lowestPrice, currency)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-ps-muted">Average</p>
          <p className="text-sm font-semibold text-ps-text">
            {formatPrice(priceHistory.averagePrice, currency)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-ps-muted">Highest</p>
          <p className="text-sm font-semibold text-ps-avoid">
            {formatPrice(priceHistory.highestPrice, currency)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-ps-muted">
        <TrendIcon size={14} className={trendColor} />
        <span className={trendColor}>
          Price is {priceHistory.trend}
        </span>
        <span>· {priceHistory.dataPoints} data points</span>
      </div>
    </div>
  )
}
