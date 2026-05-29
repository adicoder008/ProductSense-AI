import type { RegretAnalysis, ConfidenceAnalysis } from "@productsense/shared"
import { AlertTriangle, ShieldQuestion } from "lucide-react"

export function RegretConfidence({
  regret,
  confidence
}: {
  regret?: RegretAnalysis
  confidence?: ConfidenceAnalysis
}) {
  if (!regret && !confidence) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {regret && (
        <div className="rounded-xl bg-ps-surface border border-ps-avoid/30 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-ps-avoid">
            <AlertTriangle size={14} />
            <span className="text-xs font-semibold">Regret Risk</span>
          </div>
          <p className="text-2xl font-bold text-ps-avoid">{regret.probability}%</p>
          <p className="text-[10px] text-ps-muted">{regret.label}</p>
          <ul className="space-y-1">
            {regret.triggers.slice(0, 3).map((t, i) => (
              <li key={i} className="text-[10px] text-ps-muted">
                • {t}
              </li>
            ))}
          </ul>
        </div>
      )}
      {confidence && (
        <div className="rounded-xl bg-ps-surface border border-ps-border p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-ps-primary">
            <ShieldQuestion size={14} />
            <span className="text-xs font-semibold">Confidence</span>
          </div>
          <p className="text-2xl font-bold text-ps-primary">{confidence.score}%</p>
          <p className="text-[10px] text-ps-muted">{confidence.label}</p>
          {confidence.dataGaps.length > 0 && (
            <p className="text-[10px] text-ps-muted italic">
              Gaps: {confidence.dataGaps.slice(0, 2).join("; ")}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
