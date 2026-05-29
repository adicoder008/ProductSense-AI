import { z } from "zod"
import {
  RecommendationSchema,
  CommunitySentimentSchema,
  ReviewTrustAnalysisSchema,
  ProConItemSchema,
  CostPerUseAnalysisSchema,
  PriceHistorySummarySchema
} from "./analysis"

export const CasePointSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  strength: z.enum(["weak", "moderate", "strong"])
})

export const BullBearCaseSchema = z.object({
  headline: z.string(),
  points: z.array(CasePointSchema),
  summary: z.string()
})

export const RegretAnalysisSchema = z.object({
  probability: z.number().min(0).max(100),
  label: z.enum(["Low", "Moderate", "High", "Very High"]),
  triggers: z.array(z.string()),
  reasoning: z.string()
})

export const ConfidenceAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string(),
  dataGaps: z.array(z.string()),
  reasoning: z.string()
})

export const LifespanEstimateSchema = z.object({
  category: z.string(),
  expectedLifeYears: z.number().positive(),
  expectedLifeMonths: z.number().positive().optional(),
  depreciationRate: z.number().min(0).max(1),
  categoryBenchmark: z.string(),
  assumptions: z.array(z.string())
})

export const PriceAnalysisSchema = z.object({
  currentPrice: z.number(),
  currency: z.string(),
  fairValueEstimate: z.number(),
  priceFairness: z.enum(["Underpriced", "Fairly Priced", "Overpriced"]),
  vsHistoricalLow: z.number(),
  vsHistoricalAvg: z.number(),
  trend: z.enum(["rising", "falling", "stable"]),
  timingAdvice: z.enum(["Good Time To Buy", "Wait For Price Drop", "Neutral"]),
  reasoning: z.string()
})

export const LongTermOwnershipSchema = z.object({
  verdict: z.enum(["Recommended Long-Term", "Mixed", "Poor Long-Term Buy"]),
  totalCostOfOwnership: z.number(),
  resaleValueEstimate: z.number(),
  maintenanceRisk: z.enum(["Low", "Medium", "High"]),
  upgradeability: z.string(),
  repairability: z.string(),
  ownershipYears: z.number().positive(),
  summary: z.string(),
  risks: z.array(z.string())
})

export const AlternativeComparisonSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  rank: z.number().int().positive(),
  whyBetter: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  comparisonScore: z.number().min(0).max(100)
})

export const RedditSentimentSchema = z.object({
  overallSentiment: CommunitySentimentSchema,
  sentimentScore: z.number().min(-100).max(100),
  mostCommonPraise: z.array(z.string()),
  mostCommonComplaints: z.array(z.string()),
  regretSignals: z.array(z.string()),
  authenticityFlags: z.array(z.string()),
  summary: z.string(),
  subreddits: z.array(z.string()).optional(),
  integrationStatus: z.enum(["mock", "live", "unavailable"])
})

export const AgentFindingSchema = z.object({
  agent: z.enum([
    "skeptic",
    "value_analyst",
    "community_analyst",
    "ownership_analyst",
    "synthesizer"
  ]),
  label: z.string(),
  concerns: z.array(z.string()),
  supportingPoints: z.array(z.string()),
  confidence: z.number().min(0).max(100)
})

export const EvaluationScoresSchema = z.object({
  buyScore: z.number().min(0).max(100),
  valueScore: z.number().min(0).max(100),
  regretProbability: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100)
})

export const ProductEvaluationSchema = z.object({
  scores: EvaluationScoresSchema,
  recommendation: RecommendationSchema,
  verdict: z.string(),
  bullCase: BullBearCaseSchema,
  bearCase: BullBearCaseSchema,
  regret: RegretAnalysisSchema,
  confidence: ConfidenceAnalysisSchema,
  lifespan: LifespanEstimateSchema,
  priceAnalysis: PriceAnalysisSchema,
  longTermOwnership: LongTermOwnershipSchema,
  alternatives: z.array(AlternativeComparisonSchema),
  redditSentiment: RedditSentimentSchema,
  agentFindings: z.array(AgentFindingSchema),
  reviewTrust: ReviewTrustAnalysisSchema,
  pros: z.array(ProConItemSchema),
  cons: z.array(ProConItemSchema),
  costPerUse: CostPerUseAnalysisSchema,
  priceHistory: PriceHistorySummarySchema.optional(),
  evaluatedAt: z.string(),
  modelUsed: z.string(),
  evaluationMode: z.enum(["multi-agent", "heuristic", "hybrid"]),
  cacheHit: z.boolean().optional()
})
