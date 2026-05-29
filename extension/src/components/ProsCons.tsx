import type { ProConItem } from "@productsense/shared"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ProsConsProps {
  pros: ProConItem[]
  cons: ProConItem[]
}

export function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-ps-surface border border-ps-border p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-ps-buy">
          <ThumbsUp size={14} />
          <span className="text-xs font-semibold">Pros</span>
        </div>
        <ul className="space-y-1.5">
          {pros.map((pro, i) => (
            <li key={i} className="text-xs text-ps-text flex gap-1.5">
              <span className="text-ps-buy shrink-0">+</span>
              {pro.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-ps-surface border border-ps-border p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-ps-avoid">
          <ThumbsDown size={14} />
          <span className="text-xs font-semibold">Cons</span>
        </div>
        <ul className="space-y-1.5">
          {cons.map((con, i) => (
            <li key={i} className="text-xs text-ps-text flex gap-1.5">
              <span className="text-ps-avoid shrink-0">−</span>
              {con.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
