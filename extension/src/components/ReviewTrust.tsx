import type { ReviewTrustAnalysis } from "@productsense/shared"
import { Shield, AlertTriangle } from "lucide-react"
import { cn } from "~lib/utils"
import { Badge } from "./ui/badge"

interface ReviewTrustProps {
  reviewTrust: ReviewTrustAnalysis
}

export function ReviewTrust({ reviewTrust }: ReviewTrustProps) {
  const color =
    reviewTrust.trustScore >= 75
      ? "text-ps-buy"
      : reviewTrust.trustScore >= 50
        ? "text-ps-consider"
        : "text-ps-avoid"

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-ps-primary" />
          <span className="text-sm font-semibold text-ps-text">Review Trust</span>
        </div>
        <span className={cn("text-lg font-bold", color)}>
          {reviewTrust.trustScore}%
        </span>
      </div>
      <p className="text-xs text-ps-muted">{reviewTrust.trustLabel}</p>
      <p className="text-xs text-ps-text leading-relaxed">{reviewTrust.reasoning}</p>
      {reviewTrust.flags.length > 0 && (
        <div className="space-y-1.5">
          {reviewTrust.flags.map((flag, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-ps-muted"
            >
              <AlertTriangle size={12} className="text-ps-consider shrink-0 mt-0.5" />
              <span>{flag.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
