import type { ScoreBreakdown } from "@productsense/shared"
import { cn } from "~lib/utils"

interface ScoreCardsProps {
  scores: ScoreBreakdown
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 75 ? "bg-ps-buy" : score >= 50 ? "bg-ps-consider" : "bg-ps-avoid"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ps-muted">{label}</span>
        <span className="font-medium text-ps-text">{Math.round(score)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ps-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function ScoreCards({ scores }: ScoreCardsProps) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-ps-surface border border-ps-border">
      <h3 className="text-sm font-semibold text-ps-text">Scores</h3>
      <ScoreBar label="Buy Score" score={scores.buyScore} />
      <ScoreBar label="Value Score" score={scores.valueScore} />
      <ScoreBar label="Quality Score" score={scores.qualityScore} />
    </div>
  )
}
