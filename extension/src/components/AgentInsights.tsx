import type { AgentFinding } from "@productsense/shared"
import { Users } from "lucide-react"
import { useState } from "react"

export function AgentInsights({ agents }: { agents?: AgentFinding[] }) {
  const [open, setOpen] = useState(false)
  if (!agents?.length) return null

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-ps-bg/50"
      >
        <div className="flex items-center gap-2">
          <Users size={14} className="text-ps-primary" />
          <span className="text-xs font-semibold text-ps-text">
            Multi-Agent Panel ({agents.length})
          </span>
        </div>
        <span className="text-ps-muted text-xs">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-ps-border pt-2">
          {agents.map((a, i) => (
            <div key={i} className="text-xs">
              <p className="font-medium text-ps-text">{a.label}</p>
              {a.concerns.length > 0 && (
                <p className="text-ps-avoid mt-1">
                  − {a.concerns.slice(0, 2).join("; ")}
                </p>
              )}
              {a.supportingPoints.length > 0 && (
                <p className="text-ps-buy mt-0.5">
                  + {a.supportingPoints.slice(0, 2).join("; ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
