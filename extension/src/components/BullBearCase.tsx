import type { BullBearCase as BullBearCaseType } from "@productsense/shared"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "~lib/utils"

function CaseCard({
  title,
  data,
  variant
}: {
  title: string
  data: BullBearCaseType
  variant: "bull" | "bear"
}) {
  const Icon = variant === "bull" ? TrendingUp : TrendingDown
  const color = variant === "bull" ? "text-ps-buy" : "text-ps-avoid"
  const border = variant === "bull" ? "border-ps-buy/30" : "border-ps-avoid/30"

  return (
    <div className={cn("rounded-xl border p-3 space-y-2", border)}>
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <span className={cn("text-xs font-semibold", color)}>{title}</span>
      </div>
      <p className="text-sm font-medium text-ps-text">{data.headline}</p>
      <ul className="space-y-2">
        {data.points.slice(0, 4).map((p, i) => (
          <li key={i} className="text-xs text-ps-muted">
            <span className="text-ps-text font-medium">{p.claim}</span>
            <span className="block mt-0.5 opacity-80">{p.evidence}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-ps-muted leading-relaxed">{data.summary}</p>
    </div>
  )
}

export function BullBearSection({
  bullCase,
  bearCase
}: {
  bullCase?: BullBearCaseType
  bearCase?: BullBearCaseType
}) {
  if (!bullCase && !bearCase) return null
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-ps-text">Bull vs Bear Case</p>
      {bearCase && <CaseCard title="Bear Case — why NOT to buy" data={bearCase} variant="bear" />}
      {bullCase && <CaseCard title="Bull Case — upside scenario" data={bullCase} variant="bull" />}
    </div>
  )
}
