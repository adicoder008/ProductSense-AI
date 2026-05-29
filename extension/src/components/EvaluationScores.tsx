import type { ProductAnalysis } from "@productsense/shared"
import { cn } from "~lib/utils"

interface EvaluationScoresProps {
  analysis: ProductAnalysis
}

function ScoreBar({
  label,
  score,
  invert
}: {
  label: string
  score: number
  invert?: boolean
}) {
  const display = invert ? 100 - score : score
  const color =
    display >= 70 ? "bg-ps-buy" : display >= 45 ? "bg-ps-consider" : "bg-ps-avoid"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ps-muted">{label}</span>
        <span className="font-semibold text-ps-text">{Math.round(score)}</span>
      </div>
      <div className="h-2 rounded-full bg-ps-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  )
}

export function EvaluationScores({ analysis }: EvaluationScoresProps) {
  const regret =
    analysis.regret?.probability ?? analysis.scores.regretProbability ?? 30
  const confidence =
    analysis.confidence?.score ?? analysis.scores.confidenceScore ?? 50

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <p className="text-xs font-semibold text-ps-text uppercase tracking-wide">
        Evaluation Scores
      </p>
      <ScoreBar label="Buy Score" score={analysis.scores.buyScore} />
      <ScoreBar label="Value Score" score={analysis.scores.valueScore} />
      <ScoreBar label="Regret Risk" score={regret} invert />
      <ScoreBar label="Confidence" score={confidence} />
    </div>
  )
}
