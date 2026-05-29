export type Recommendation = "BUY" | "CONSIDER" | "AVOID"

export type PriceFairness = "Underpriced" | "Fairly Priced" | "Overpriced"

export type CommunitySentiment = "Positive" | "Neutral" | "Negative"

export type PriceTrend = "rising" | "falling" | "stable"

export interface ScoreBreakdown {
  buyScore: number
  valueScore: number
  qualityScore: number
  regretProbability?: number
  confidenceScore?: number
}

export interface ReviewTrustAnalysis {
  trustScore: number
  trustLabel: string
  flags: ReviewFlag[]
  reasoning: string
}

export interface ReviewFlag {
  type:
    | "repetitive"
    | "suspicious_pattern"
    | "extremely_biased"
    | "potential_fake"
  severity: "low" | "medium" | "high"
  description: string
  count?: number
}

export interface ProConItem {
  text: string
  confidence?: number
}

export interface ProductAlternative {
  name: string
  brand?: string
  price?: number
  currency?: string
  url?: string
  imageUrl?: string
  rank: number
  reasons: string[]
  comparisonPoints: string[]
  whyBetter?: string[]
  tradeoffs?: string[]
  comparisonScore?: number
}

export interface CostPerUseAnalysis {
  price: number
  currency: string
  expectedLifeYears: number
  expectedLifeMonths?: number
  costPerDay: number
  costPerMonth: number
  costPerHour: number
  reasoning: string
  categoryBenchmark?: string
}

export interface RedditConsensus {
  mostCommonPraise: string[]
  mostCommonComplaints: string[]
  overallSentiment: CommunitySentiment
  summary: string
  sources?: string[]
  sentimentScore?: number
  regretSignals?: string[]
  authenticityFlags?: string[]
  integrationStatus: "mock" | "live" | "unavailable"
}

export interface PriceHistorySummary {
  productId: string
  currentPrice: number
  lowestPrice: number
  highestPrice: number
  averagePrice: number
  trend: PriceTrend
  recommendation: "Good Time To Buy" | "Wait For Price Drop" | "Neutral"
  dataPoints: number
  lastUpdated: string
  fairValueEstimate?: number
  vsHistoricalLowPct?: number
  vsHistoricalAvgPct?: number
}

/** @deprecated Use ProductEvaluation — kept for backward compatibility */
export interface ProductAnalysis {
  scores: ScoreBreakdown
  priceFairness: PriceFairness
  recommendation: Recommendation
  summary: string
  explanation: string
  reviewTrust: ReviewTrustAnalysis
  pros: ProConItem[]
  cons: ProConItem[]
  alternatives: ProductAlternative[]
  costPerUse: CostPerUseAnalysis
  redditConsensus: RedditConsensus
  priceHistory?: PriceHistorySummary
  bullCase?: import("./evaluation").BullBearCase
  bearCase?: import("./evaluation").BullBearCase
  regret?: import("./evaluation").RegretAnalysis
  confidence?: import("./evaluation").ConfidenceAnalysis
  lifespan?: import("./evaluation").LifespanEstimate
  priceAnalysis?: import("./evaluation").PriceAnalysis
  longTermOwnership?: import("./evaluation").LongTermOwnership
  agentFindings?: import("./evaluation").AgentFinding[]
  evaluation?: import("./evaluation").ProductEvaluation
  analyzedAt: string
  modelUsed: string
  cacheHit?: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

export interface ChatResponse {
  message: ChatMessage
  sessionId: string
}
