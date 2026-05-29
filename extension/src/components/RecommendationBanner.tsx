import type { Recommendation, PriceFairness } from "@productsense/shared"
import { RECOMMENDATION_CONFIG } from "@productsense/shared"
import { cn, getRecommendationBg, getRecommendationColor } from "~lib/utils"
import { Badge } from "./ui/badge"

interface RecommendationBannerProps {
  recommendation: Recommendation
  priceFairness: PriceFairness
  summary: string
}

export function RecommendationBanner({
  recommendation,
  priceFairness,
  summary
}: RecommendationBannerProps) {
  const config = RECOMMENDATION_CONFIG[recommendation]
  const variant =
    recommendation === "BUY"
      ? "buy"
      : recommendation === "CONSIDER"
        ? "consider"
        : "avoid"

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3",
        getRecommendationBg(recommendation)
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <p className={cn("text-xl font-bold", getRecommendationColor(recommendation))}>
              {config.label.toUpperCase()}
            </p>
            <p className="text-xs text-ps-muted">{config.description}</p>
          </div>
        </div>
        <Badge variant={variant}>{priceFairness}</Badge>
      </div>
      <p className="text-sm text-ps-text leading-relaxed">{summary}</p>
    </div>
  )
}
