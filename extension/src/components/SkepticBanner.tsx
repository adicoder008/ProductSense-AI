import type { Recommendation } from "@productsense/shared"
import { RECOMMENDATION_CONFIG } from "@productsense/shared"
import { cn, getRecommendationBg, getRecommendationColor } from "~lib/utils"
import { ShieldAlert } from "lucide-react"

interface SkepticBannerProps {
  recommendation: Recommendation
  verdict: string
  evaluationMode?: string
}

export function SkepticBanner({
  recommendation,
  verdict,
  evaluationMode
}: SkepticBannerProps) {
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
        "rounded-xl border p-4 space-y-2",
        getRecommendationBg(recommendation)
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className={getRecommendationColor(recommendation)} />
          <span
            className={cn(
              "text-lg font-bold",
              getRecommendationColor(recommendation)
            )}
          >
            {config.emoji} {config.label.toUpperCase()}
          </span>
        </div>
        {evaluationMode && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-ps-bg text-ps-muted uppercase">
            {evaluationMode}
          </span>
        )}
      </div>
      <p className="text-xs text-ps-text leading-relaxed font-medium">{verdict}</p>
      <p className="text-[10px] text-ps-muted italic">
        Skeptical evaluation — we looked for reasons NOT to buy first.
      </p>
    </div>
  )
}
