import type { CostPerUseAnalysis } from "@productsense/shared"
import { Calendar, Clock, TrendingDown } from "lucide-react"
import { formatPrice } from "~lib/utils"

interface CostPerUseProps {
  costPerUse: CostPerUseAnalysis
}

export function CostPerUse({ costPerUse }: CostPerUseProps) {
  const items = [
    {
      icon: Calendar,
      label: "Per Day",
      value: formatPrice(costPerUse.costPerDay, costPerUse.currency)
    },
    {
      icon: TrendingDown,
      label: "Per Month",
      value: formatPrice(costPerUse.costPerMonth, costPerUse.currency)
    },
    {
      icon: Clock,
      label: "Per Hour",
      value: formatPrice(costPerUse.costPerHour, costPerUse.currency)
    }
  ]

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-ps-text">Cost Per Use</h3>
      <div className="text-center py-2">
        <p className="text-2xl font-bold text-ps-primary">
          {formatPrice(costPerUse.price, costPerUse.currency)}
        </p>
        <p className="text-xs text-ps-muted mt-1">
          over {costPerUse.expectedLifeYears} years
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-ps-bg"
          >
            <Icon size={14} className="text-ps-muted" />
            <span className="text-xs font-semibold text-ps-text">{value}</span>
            <span className="text-[10px] text-ps-muted">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-ps-muted leading-relaxed">{costPerUse.reasoning}</p>
    </div>
  )
}
