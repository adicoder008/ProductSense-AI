import type { RedditConsensus as RedditConsensusType } from "@productsense/shared"
import { MessageCircle } from "lucide-react"
import { Badge } from "./ui/badge"

interface RedditConsensusProps {
  consensus: RedditConsensusType
}

export function RedditConsensus({ consensus }: RedditConsensusProps) {
  const sentimentVariant =
    consensus.overallSentiment === "Positive"
      ? "buy"
      : consensus.overallSentiment === "Negative"
        ? "avoid"
        : "consider"

  return (
    <div className="rounded-xl bg-ps-surface border border-ps-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-ps-primary" />
          <span className="text-sm font-semibold text-ps-text">Community Sentiment</span>
        </div>
        <Badge variant={sentimentVariant}>{consensus.overallSentiment}</Badge>
      </div>
      <p className="text-xs text-ps-text leading-relaxed">{consensus.summary}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold text-ps-buy mb-1.5 uppercase tracking-wide">
            Praise
          </p>
          <ul className="space-y-1">
            {consensus.mostCommonPraise.map((item, i) => (
              <li key={i} className="text-xs text-ps-muted">• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-ps-avoid mb-1.5 uppercase tracking-wide">
            Complaints
          </p>
          <ul className="space-y-1">
            {consensus.mostCommonComplaints.map((item, i) => (
              <li key={i} className="text-xs text-ps-muted">• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      {consensus.regretSignals && consensus.regretSignals.length > 0 && (
        <div className="pt-2 border-t border-ps-border">
          <p className="text-[10px] font-semibold text-ps-avoid mb-1">Regret signals</p>
          <ul className="space-y-0.5">
            {consensus.regretSignals.slice(0, 4).map((s, i) => (
              <li key={i} className="text-[10px] text-ps-muted">• {s}</li>
            ))}
          </ul>
        </div>
      )}
      {consensus.integrationStatus !== "live" && (
        <p className="text-[10px] text-ps-muted italic">
          {consensus.integrationStatus === "mock"
            ? "Heuristic sentiment — set REDDIT_CLIENT_ID for live threads"
            : "Reddit unavailable"}
        </p>
      )}
    </div>
  )
}
