export type AgentRole =
  | "skeptic"
  | "value_analyst"
  | "community_analyst"
  | "ownership_analyst"
  | "synthesizer"

export interface AgentFinding {
  agent: AgentRole
  label: string
  concerns: string[]
  supportingPoints: string[]
  confidence: number
}

export interface CasePoint {
  claim: string
  evidence: string
  strength: "weak" | "moderate" | "strong"
}

export interface BullBearCase {
  headline: string
  points: CasePoint[]
  summary: string
}

export interface RegretAnalysis {
  probability: number
  label: "Low" | "Moderate" | "High" | "Very High"
  triggers: string[]
  reasoning: string
}

export interface ConfidenceAnalysis {
  score: number
  label: string
  dataGaps: string[]
  reasoning: string
}

export interface LifespanEstimate {
  category: string
  expectedLifeYears: number
  expectedLifeMonths?: number
  depreciationRate: number
  categoryBenchmark: string
  assumptions: string[]
}

export interface PriceAnalysis {
  currentPrice: number
  currency: string
  fairValueEstimate: number
  priceFairness: "Underpriced" | "Fairly Priced" | "Overpriced"
  vsHistoricalLow: number
  vsHistoricalAvg: number
  trend: "rising" | "falling" | "stable"
  timingAdvice: "Good Time To Buy" | "Wait For Price Drop" | "Neutral"
  reasoning: string
}

export interface LongTermOwnership {
  verdict: "Recommended Long-Term" | "Mixed" | "Poor Long-Term Buy"
  totalCostOfOwnership: number
  resaleValueEstimate: number
  maintenanceRisk: "Low" | "Medium" | "High"
  upgradeability: string
  repairability: string
  ownershipYears: number
  summary: string
  risks: string[]
}

export interface AlternativeComparison {
  name: string
  brand?: string
  price?: number
  currency?: string
  rank: number
  whyBetter: string[]
  tradeoffs: string[]
  comparisonScore: number
}

export interface RedditSentiment {
  overallSentiment: "Positive" | "Neutral" | "Negative"
  sentimentScore: number
  mostCommonPraise: string[]
  mostCommonComplaints: string[]
  regretSignals: string[]
  authenticityFlags: string[]
  summary: string
  subreddits?: string[]
  integrationStatus: "mock" | "live" | "unavailable"
}

export interface EvaluationScores {
  buyScore: number
  valueScore: number
  regretProbability: number
  confidenceScore: number
}

export interface ProductEvaluation {
  scores: EvaluationScores
  recommendation: "BUY" | "CONSIDER" | "AVOID"
  verdict: string
  bullCase: BullBearCase
  bearCase: BullBearCase
  regret: RegretAnalysis
  confidence: ConfidenceAnalysis
  lifespan: LifespanEstimate
  priceAnalysis: PriceAnalysis
  longTermOwnership: LongTermOwnership
  alternatives: AlternativeComparison[]
  redditSentiment: RedditSentiment
  agentFindings: AgentFinding[]
  reviewTrust: import("./analysis").ReviewTrustAnalysis
  pros: import("./analysis").ProConItem[]
  cons: import("./analysis").ProConItem[]
  costPerUse: import("./analysis").CostPerUseAnalysis
  priceHistory?: import("./analysis").PriceHistorySummary
  evaluatedAt: string
  modelUsed: string
  evaluationMode: "multi-agent" | "heuristic" | "hybrid"
  cacheHit?: boolean
}
