import { z } from "zod"

export const RecommendationSchema = z.enum(["BUY", "CONSIDER", "AVOID"])
export const PriceFairnessSchema = z.enum([
  "Underpriced",
  "Fairly Priced",
  "Overpriced"
])
export const CommunitySentimentSchema = z.enum([
  "Positive",
  "Neutral",
  "Negative"
])

export const ScoreBreakdownSchema = z.object({
  buyScore: z.number().min(0).max(100),
  valueScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  regretProbability: z.number().min(0).max(100).optional(),
  confidenceScore: z.number().min(0).max(100).optional()
})

export const ReviewFlagSchema = z.object({
  type: z.enum([
    "repetitive",
    "suspicious_pattern",
    "extremely_biased",
    "potential_fake"
  ]),
  severity: z.enum(["low", "medium", "high"]),
  description: z.string(),
  count: z.number().optional()
})

export const ReviewTrustAnalysisSchema = z.object({
  trustScore: z.number().min(0).max(100),
  trustLabel: z.string(),
  flags: z.array(ReviewFlagSchema),
  reasoning: z.string()
})

export const ProConItemSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1).optional()
})

export const ProductAlternativeSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  rank: z.number().int().positive(),
  reasons: z.array(z.string()),
  comparisonPoints: z.array(z.string())
})

export const CostPerUseAnalysisSchema = z.object({
  price: z.number(),
  currency: z.string(),
  expectedLifeYears: z.number().positive(),
  expectedLifeMonths: z.number().positive().optional(),
  costPerDay: z.number(),
  costPerMonth: z.number(),
  costPerHour: z.number(),
  reasoning: z.string()
})

export const RedditConsensusSchema = z.object({
  mostCommonPraise: z.array(z.string()),
  mostCommonComplaints: z.array(z.string()),
  overallSentiment: CommunitySentimentSchema,
  summary: z.string(),
  sources: z.array(z.string()).optional(),
  integrationStatus: z.enum(["mock", "live", "unavailable"])
})

export const PriceHistorySummarySchema = z.object({
  productId: z.string(),
  currentPrice: z.number(),
  lowestPrice: z.number(),
  highestPrice: z.number(),
  averagePrice: z.number(),
  trend: z.enum(["rising", "falling", "stable"]),
  recommendation: z.enum([
    "Good Time To Buy",
    "Wait For Price Drop",
    "Neutral"
  ]),
  dataPoints: z.number(),
  lastUpdated: z.string()
})

export const ProductAnalysisSchema = z.object({
  scores: ScoreBreakdownSchema,
  priceFairness: PriceFairnessSchema,
  recommendation: RecommendationSchema,
  summary: z.string(),
  explanation: z.string(),
  reviewTrust: ReviewTrustAnalysisSchema,
  pros: z.array(ProConItemSchema),
  cons: z.array(ProConItemSchema),
  alternatives: z.array(ProductAlternativeSchema),
  costPerUse: CostPerUseAnalysisSchema,
  redditConsensus: RedditConsensusSchema,
  priceHistory: PriceHistorySummarySchema.optional(),
  analyzedAt: z.string(),
  modelUsed: z.string(),
  cacheHit: z.boolean().optional()
}).passthrough()

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string()
})

export const AnalyzeRequestSchema = z.object({
  product: z.any(), // validated separately with ExtractedProductSchema
  preferences: z.any().optional(),
  forceRefresh: z.boolean().optional()
})

export const ChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  product: z.any(),
  message: z.string().min(1).max(4000),
  history: z.array(ChatMessageSchema).optional(),
  preferences: z.any().optional()
})
