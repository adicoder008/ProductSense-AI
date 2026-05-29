import type { ProductAlternative } from "@productsense/shared"
import { ArrowRight } from "lucide-react"
import { formatPrice } from "~lib/utils"

interface AlternativesProps {
  alternatives: ProductAlternative[]
}

export function Alternatives({ alternatives }: AlternativesProps) {
  if (alternatives.length === 0) {
    return (
      <div className="rounded-xl bg-ps-surface border border-ps-border p-4 text-center">
        <p className="text-xs text-ps-muted">No alternatives found yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-ps-text">Better Alternatives</h3>
      {alternatives.map((alt) => (
        <div
          key={alt.rank}
          className="rounded-xl bg-ps-surface border border-ps-border p-3 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ps-primary">#{alt.rank}</span>
                <span className="text-sm font-medium text-ps-text">{alt.name}</span>
              </div>
              {alt.brand && (
                <p className="text-xs text-ps-muted">{alt.brand}</p>
              )}
            </div>
            {alt.price && (
              <span className="text-sm font-semibold text-ps-text shrink-0">
                {formatPrice(alt.price, alt.currency)}
              </span>
            )}
          </div>
          <ul className="space-y-1">
            {(alt.whyBetter ?? alt.reasons).map((reason, i) => (
              <li key={i} className="text-xs text-ps-muted flex items-center gap-1">
                <ArrowRight size={10} className="text-ps-primary shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
          {(alt.tradeoffs?.length ?? 0) > 0 && (
            <p className="text-[10px] text-ps-muted mt-1">
              Tradeoff: {alt.tradeoffs!.slice(0, 2).join("; ")}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
