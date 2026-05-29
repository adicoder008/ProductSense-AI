import type { LongTermOwnership as LTO } from "@productsense/shared"
import { Clock } from "lucide-react"
import { cn, formatPrice } from "~lib/utils"

export function LongTermOwnership({ data }: { data?: LTO }) {
  if (!data) return null

  const verdictColor =
    data.verdict === "Recommended Long-Term"
      ? "text-ps-buy"
      : data.verdict === "Poor Long-Term Buy"
        ? "text-ps-avoid"
        : "text-ps-consider"

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-ps-primary" />
        <span className="text-sm font-semibold text-ps-text">Long-Term Ownership</span>
      </div>
      <p className={cn("text-sm font-semibold", verdictColor)}>{data.verdict}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-lg bg-ps-bg">
          <p className="text-[10px] text-ps-muted">TCO ({data.ownershipYears}yr)</p>
          <p className="text-xs font-bold text-ps-text">
            {formatPrice(data.totalCostOfOwnership)}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-ps-bg">
          <p className="text-[10px] text-ps-muted">Resale Est.</p>
          <p className="text-xs font-bold text-ps-text">
            {formatPrice(data.resaleValueEstimate)}
          </p>
        </div>
      </div>
      <div className="flex gap-2 text-[10px] text-ps-muted">
        <span>Repair: {data.repairability}</span>
        <span>•</span>
        <span>Maint: {data.maintenanceRisk}</span>
      </div>
      <p className="text-xs text-ps-muted leading-relaxed">{data.summary}</p>
    </div>
  )
}
