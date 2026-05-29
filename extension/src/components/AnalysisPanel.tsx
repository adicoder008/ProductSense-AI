import { useState } from "react"
import type {
  ExtractedProduct,
  ProductAnalysis,
  UserPreferences
} from "@productsense/shared"
import {
  X,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  Loader2
} from "lucide-react"
import { SkepticBanner } from "./SkepticBanner"
import { EvaluationScores } from "./EvaluationScores"
import { BullBearSection } from "./BullBearCase"
import { RegretConfidence } from "./RegretConfidence"
import { ProsCons } from "./ProsCons"
import { ReviewTrust } from "./ReviewTrust"
import { Alternatives } from "./Alternatives"
import { CostPerUse } from "./CostPerUse"
import { RedditConsensus } from "./RedditConsensus"
import { PriceHistory } from "./PriceHistory"
import { LongTermOwnership } from "./LongTermOwnership"
import { AgentInsights } from "./AgentInsights"
import { ChatPanel } from "./ChatPanel"
import { PreferencesPanel } from "./PreferencesPanel"
import { formatPrice } from "~lib/utils"

type Tab = "analysis" | "chat" | "settings"

interface AnalysisPanelProps {
  product: ExtractedProduct
  analysis: ProductAnalysis | null
  loading: boolean
  error: string | null
  preferences: UserPreferences
  onClose: () => void
  onRefresh: () => void
  onPreferencesSave: (prefs: UserPreferences) => void
}

export function AnalysisPanel({
  product,
  analysis,
  loading,
  error,
  preferences,
  onClose,
  onRefresh,
  onPreferencesSave
}: AnalysisPanelProps) {
  const [tab, setTab] = useState<Tab>("analysis")

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "analysis", label: "Evaluation", icon: BarChart3 },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings }
  ]

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-ps-bg border-l border-ps-border shadow-panel z-[2147483646] flex flex-col animate-slide-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-ps-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ps-primary flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ps-text">ProductSense AI</p>
            <p className="text-[10px] text-ps-muted">Skeptical product evaluation</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-ps-surface text-ps-muted hover:text-ps-text transition-colors"
            title="Re-run evaluation"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ps-surface text-ps-muted hover:text-ps-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-ps-border shrink-0">
        <p className="text-sm font-medium text-ps-text line-clamp-2">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-ps-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.rating && (
            <span className="text-xs text-ps-muted">
              ★ {product.rating} ({product.reviewCount?.toLocaleString() ?? 0})
            </span>
          )}
        </div>
      </div>

      <div className="flex border-b border-ps-border shrink-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              tab === id
                ? "text-ps-primary border-b-2 border-ps-primary"
                : "text-ps-muted hover:text-ps-text"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {tab === "chat" ? (
          <ChatPanel product={product} preferences={preferences} />
        ) : tab === "settings" ? (
          <div className="overflow-y-auto">
            <PreferencesPanel
              preferences={preferences}
              onSave={onPreferencesSave}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={32} className="animate-spin text-ps-primary" />
                <p className="text-sm text-ps-muted text-center px-4">
                  Running skeptical multi-agent evaluation…
                </p>
              </div>
            )}
            {error && !loading && (
              <div className="rounded-xl bg-ps-avoid/10 border border-ps-avoid/30 p-4">
                <p className="text-sm text-ps-avoid">{error}</p>
                <button
                  onClick={onRefresh}
                  className="mt-2 text-xs text-ps-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            {analysis && !loading && (
              <>
                <SkepticBanner
                  recommendation={analysis.recommendation}
                  verdict={analysis.summary}
                  evaluationMode={analysis.evaluation?.evaluationMode}
                />
                <EvaluationScores analysis={analysis} />
                <RegretConfidence
                  regret={analysis.regret}
                  confidence={analysis.confidence}
                />
                <BullBearSection
                  bullCase={analysis.bullCase}
                  bearCase={analysis.bearCase}
                />
                <ProsCons pros={analysis.pros} cons={analysis.cons} />
                <ReviewTrust reviewTrust={analysis.reviewTrust} />
                <CostPerUse costPerUse={analysis.costPerUse} />
                <LongTermOwnership data={analysis.longTermOwnership} />
                {analysis.priceHistory && (
                  <PriceHistory
                    priceHistory={analysis.priceHistory}
                    currency={product.currency}
                  />
                )}
                <RedditConsensus consensus={analysis.redditConsensus} />
                <Alternatives alternatives={analysis.alternatives} />
                <AgentInsights agents={analysis.agentFindings} />
                {analysis.cacheHit && (
                  <p className="text-[10px] text-ps-muted text-center italic">
                    Cached · {analysis.modelUsed}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
