import type {
  ExtractedProduct,
  UserPreferences,
  ProductEvaluation,
  ProductAnalysis,
  AgentFinding,
  PriceHistorySummary
} from "@productsense/shared"
import { ProductEvaluationSchema } from "@productsense/shared/schemas"
import { completeWithAI, isAIConfigured } from "@/lib/ai-client"
import { analyzeReviewTrust } from "@/services/analysis-service"
import { estimateLifespan, estimateResaleValue } from "@/services/lifespan-service"
import { buildPriceAnalysis } from "@/services/price-analysis-service"
import { analyzeRedditSentiment } from "@/services/reddit-sentiment-service"
import { scoreToRecommendation, matchLifespanProfile } from "@productsense/shared"

const SKEPTICAL_SYSTEM_PROMPT = `You are ProductSense AI — a skeptical consumer advocate, NOT a salesperson.

Your job is to protect buyers from bad purchases. You MUST:
1. Actively search for reasons NOT to buy before recommending purchase
2. Weight negative evidence heavily — one serious flaw can outweigh many minor positives
3. Never assume a product is good because it has high ratings or discounts
4. Flag missing data as uncertainty, not as neutral

You run a multi-agent evaluation panel. Each agent reports concerns AND supporting points.
The SKEPTIC agent has veto power — if serious concerns exist, buyScore must stay below 70.

Return ONLY valid JSON matching the schema provided. Be specific to the product and Indian market.`

const EVALUATION_JSON_SCHEMA = `{
  "scores": { "buyScore": 0-100, "valueScore": 0-100, "regretProbability": 0-100, "confidenceScore": 0-100 },
  "recommendation": "BUY" | "CONSIDER" | "AVOID",
  "verdict": "1-2 sentence skeptical verdict",
  "bullCase": { "headline": "...", "points": [{ "claim": "...", "evidence": "...", "strength": "weak|moderate|strong" }], "summary": "..." },
  "bearCase": { "headline": "...", "points": [{ "claim": "...", "evidence": "...", "strength": "weak|moderate|strong" }], "summary": "..." },
  "regret": { "probability": 0-100, "label": "Low|Moderate|High|Very High", "triggers": ["..."], "reasoning": "..." },
  "confidence": { "score": 0-100, "label": "...", "dataGaps": ["..."], "reasoning": "..." },
  "pros": [{ "text": "...", "confidence": 0-1 }],
  "cons": [{ "text": "...", "confidence": 0-1 }],
  "alternatives": [{ "name": "...", "brand": "...", "price": number, "rank": 1, "whyBetter": ["..."], "tradeoffs": ["..."], "comparisonScore": 0-100 }],
  "longTermOwnership": {
    "verdict": "Recommended Long-Term" | "Mixed" | "Poor Long-Term Buy",
    "upgradeability": "...", "repairability": "...", "summary": "...", "risks": ["..."]
  },
  "agentFindings": [{
    "agent": "skeptic|value_analyst|community_analyst|ownership_analyst|synthesizer",
    "label": "...", "concerns": ["..."], "supportingPoints": ["..."], "confidence": 0-100
  }]
}

Scoring rules:
- regretProbability: likelihood buyer regrets purchase within 18 months (higher = worse)
- confidenceScore: how much we trust this evaluation given available data
- buyScore: only high if bear case is weak AND regret is low
- BUY requires buyScore>=75 AND regretProbability<40; AVOID if regretProbability>=65 or bear case has 2+ strong points`

export interface EvaluationContext {
  product: ExtractedProduct
  preferences?: UserPreferences
  priceHistory?: PriceHistorySummary | null
}

export async function runProductEvaluation(
  ctx: EvaluationContext
): Promise<ProductEvaluation> {
  const { product, preferences, priceHistory } = ctx

  const reviewTrust = analyzeReviewTrust(product)
  const lifespan = estimateLifespan(product)
  const priceAnalysis = buildPriceAnalysis(product, priceHistory)
  const redditSentiment = await analyzeRedditSentiment(product)

  const heuristicAgents = runHeuristicAgents(
    product,
    reviewTrust.trustScore,
    priceAnalysis,
    redditSentiment,
    lifespan
  )

  const costPerUse = buildCostPerUse(product, lifespan)
  const resale = estimateResaleValue(
    product.price,
    lifespan.expectedLifeYears,
    lifespan.depreciationRate
  )
  const tco = Math.round(
    product.price + product.price * 0.08 * lifespan.expectedLifeYears
  )

  let aiPayload: Record<string, unknown> = {}
  let modelUsed = "heuristic-panel"
  let mode: ProductEvaluation["evaluationMode"] = "heuristic"

  if (isAIConfigured()) {
    try {
      const synthesis = await runAISynthesis(
        product,
        preferences,
        {
          reviewTrust,
          lifespan,
          priceAnalysis,
          redditSentiment,
          agentFindings: heuristicAgents
        }
      )
      aiPayload = synthesis.parsed
      modelUsed = synthesis.modelUsed
      mode = "hybrid"
    } catch (e) {
      console.warn("[Evaluation] AI synthesis failed, using heuristics:", e)
    }
  }

  const heuristicEval = buildHeuristicEvaluation(
    product,
    reviewTrust,
    lifespan,
    priceAnalysis,
    redditSentiment,
    heuristicAgents,
    costPerUse,
    tco,
    resale
  )

  const merged = mergeEvaluation(heuristicEval, aiPayload, mode)
  merged.priceHistory = priceHistory ?? undefined
  merged.evaluatedAt = new Date().toISOString()
  merged.modelUsed = modelUsed
  merged.evaluationMode = mode

  return ProductEvaluationSchema.parse(merged)
}

function runHeuristicAgents(
  product: ExtractedProduct,
  trustScore: number,
  price: ReturnType<typeof buildPriceAnalysis>,
  reddit: Awaited<ReturnType<typeof analyzeRedditSentiment>>,
  lifespan: ReturnType<typeof estimateLifespan>
): AgentFinding[] {
  const skepticConcerns: string[] = []
  if (trustScore < 65) skepticConcerns.push("Review authenticity concerns")
  if (price.priceFairness === "Overpriced") skepticConcerns.push("Price above fair value")
  if (reddit.regretSignals.length >= 2)
    skepticConcerns.push(`Community regret signals: ${reddit.regretSignals.slice(0, 2).join("; ")}`)
  if ((product.reviewCount ?? 0) < 20)
    skepticConcerns.push("Very few reviews to validate quality")
  if (reddit.sentimentScore < -15) skepticConcerns.push("Negative community sentiment")

  return [
    {
      agent: "skeptic",
      label: "Skeptic — reasons NOT to buy",
      concerns:
        skepticConcerns.length > 0
          ? skepticConcerns
          : ["No major red flags from heuristics — still verify warranty and return policy"],
      supportingPoints: [],
      confidence: 70
    },
    {
      agent: "value_analyst",
      label: "Value Analyst",
      concerns:
        price.priceFairness === "Overpriced"
          ? [`${price.vsHistoricalAvg}% above historical average`]
          : [],
      supportingPoints:
        price.timingAdvice === "Good Time To Buy"
          ? ["Near historical low or strong discount"]
          : ["Price appears fair for category"],
      confidence: priceHistoryConfidence(price)
    },
    {
      agent: "community_analyst",
      label: "Community Analyst",
      concerns: reddit.mostCommonComplaints.slice(0, 3),
      supportingPoints: reddit.mostCommonPraise.slice(0, 3),
      confidence: reddit.integrationStatus === "live" ? 80 : 45
    },
    {
      agent: "ownership_analyst",
      label: "Ownership Analyst",
      concerns:
        lifespan.depreciationRate > 0.3
          ? ["High depreciation category"]
          : [],
      supportingPoints: [
        `Typical lifespan: ${lifespan.expectedLifeYears} years for ${lifespan.category}`
      ],
      confidence: 75
    }
  ]
}

function priceHistoryConfidence(
  price: ReturnType<typeof buildPriceAnalysis>
): number {
  return price.reasoning.includes("Limited") ? 40 : 72
}

async function runAISynthesis(
  product: ExtractedProduct,
  preferences: UserPreferences | undefined,
  context: {
    reviewTrust: ReturnType<typeof analyzeReviewTrust>
    lifespan: ReturnType<typeof estimateLifespan>
    priceAnalysis: ReturnType<typeof buildPriceAnalysis>
    redditSentiment: Awaited<ReturnType<typeof analyzeRedditSentiment>>
    agentFindings: AgentFinding[]
  }
) {
  const userPrompt = `Evaluate this product as a skeptical consumer advocate panel.

Product: ${product.name}
Brand: ${product.brand ?? "Unknown"}
Price: ${product.currency} ${product.price}
Category: ${product.category ?? "Unknown"}
Rating: ${product.rating ?? "N/A"} (${product.reviewCount ?? 0} reviews)

Pre-computed agent signals (use these, do not ignore):
${JSON.stringify(context.agentFindings, null, 2)}

Review trust score: ${context.reviewTrust.trustScore}/100 — ${context.reviewTrust.reasoning}
Price analysis: ${JSON.stringify(context.priceAnalysis)}
Reddit sentiment (${context.redditSentiment.integrationStatus}): score ${context.redditSentiment.sentimentScore}, regret signals: ${context.redditSentiment.regretSignals.join(", ")}
Lifespan: ${context.lifespan.expectedLifeYears} years (${context.lifespan.category})

${preferences ? `User budget: ₹${preferences.budget ?? "flexible"}, priorities: ${preferences.priorities.join(", ")}` : ""}

Description: ${product.description?.slice(0, 800) ?? "N/A"}

Reviews sample:
${product.reviews
  .slice(0, 8)
  .map((r, i) => `${i + 1}. (${r.rating}★) ${r.body.slice(0, 200)}`)
  .join("\n")}

Return JSON schema:
${EVALUATION_JSON_SCHEMA}`

  const { content, modelUsed } = await completeWithAI({
    systemPrompt: SKEPTICAL_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true,
    temperature: 0.35
  })

  return { parsed: JSON.parse(content) as Record<string, unknown>, modelUsed }
}

function buildCostPerUse(
  product: ExtractedProduct,
  lifespan: ReturnType<typeof estimateLifespan>
) {
  const days = lifespan.expectedLifeYears * 365
  const costPerDay = product.price / days
  return {
    price: product.price,
    currency: product.currency,
    expectedLifeYears: lifespan.expectedLifeYears,
    expectedLifeMonths: lifespan.expectedLifeMonths,
    costPerDay: Math.round(costPerDay * 100) / 100,
    costPerMonth: Math.round(costPerDay * 30 * 100) / 100,
    costPerHour: Math.round((costPerDay / 8) * 100) / 100,
    reasoning: `Category-adjusted ${lifespan.category} lifespan estimate.`,
    categoryBenchmark: lifespan.categoryBenchmark
  }
}

function buildHeuristicEvaluation(
  product: ExtractedProduct,
  reviewTrust: ReturnType<typeof analyzeReviewTrust>,
  lifespan: ReturnType<typeof estimateLifespan>,
  priceAnalysis: ReturnType<typeof buildPriceAnalysis>,
  reddit: Awaited<ReturnType<typeof analyzeRedditSentiment>>,
  agents: AgentFinding[],
  costPerUse: ReturnType<typeof buildCostPerUse>,
  tco: number,
  resale: number
): ProductEvaluation {
  const skeptic = agents.find((a) => a.agent === "skeptic")
  const concernCount = skeptic?.concerns.length ?? 0

  let regretProbability = 25 + concernCount * 12
  regretProbability += reddit.regretSignals.length * 8
  if (reviewTrust.trustScore < 60) regretProbability += 15
  if (priceAnalysis.priceFairness === "Overpriced") regretProbability += 12
  regretProbability = Math.min(92, Math.max(8, regretProbability))

  let buyScore = Math.round(
    (product.rating ?? 3.5) * 16 +
      (100 - regretProbability) * 0.25 +
      reviewTrust.trustScore * 0.2 +
      (priceAnalysis.priceFairness === "Underpriced" ? 10 : 0) -
      concernCount * 8
  )
  buyScore = Math.max(15, Math.min(88, buyScore))

  const valueScore = Math.round(
    buyScore * 0.4 +
      (priceAnalysis.priceFairness === "Underpriced" ? 85 : priceAnalysis.priceFairness === "Fairly Priced" ? 65 : 40) * 0.35 +
      (100 - regretProbability) * 0.25
  )

  const confidenceScore = Math.round(
    (reviewTrust.trustScore * 0.3 +
      (reddit.integrationStatus === "live" ? 80 : 40) * 0.25 +
      ((product.reviewCount ?? 0) > 100 ? 80 : 45) * 0.25 +
      (priceAnalysis.reasoning.includes("Limited") ? 35 : 70) * 0.2)
  )

  if (regretProbability >= 65) {
    // override to AVOID or CONSIDER
    if (buyScore >= 75) buyScore = 68
  }

  const regretLabel =
    regretProbability >= 70
      ? "Very High"
      : regretProbability >= 55
        ? "High"
        : regretProbability >= 35
          ? "Moderate"
          : "Low"

  return {
    scores: {
      buyScore,
      valueScore,
      regretProbability,
      confidenceScore
    },
    recommendation:
      regretProbability >= 70
        ? "AVOID"
        : regretProbability >= 55
          ? buyScore >= 60
            ? "CONSIDER"
            : "AVOID"
          : scoreToRecommendation(buyScore),
    verdict: buildVerdict(buyScore, regretProbability, product.name),
    bullCase: {
      headline: "Best-case scenario",
      points: [
        {
          claim: "Meets core needs at this price",
          evidence: `Rated ${product.rating ?? "N/A"}★ with ${product.reviewCount ?? 0} reviews`,
          strength: (product.rating ?? 0) >= 4 ? "moderate" : "weak"
        }
      ],
      summary: "Upside exists if reviews are genuine and price stays competitive."
    },
    bearCase: {
      headline: "What could go wrong",
      points: (skeptic?.concerns ?? ["Unknown long-term reliability"]).map((c) => ({
        claim: c,
        evidence: "Heuristic + community signals",
        strength: "moderate" as const
      })),
      summary: skeptic?.concerns.join(". ") ?? "Insufficient data to dismiss risks."
    },
    regret: {
      probability: regretProbability,
      label: regretLabel as "Low" | "Moderate" | "High" | "Very High",
      triggers: [
        ...reddit.regretSignals.slice(0, 3),
        ...(priceAnalysis.priceFairness === "Overpriced"
          ? ["Paying above fair market value"]
          : [])
      ],
      reasoning: `${regretProbability}% regret probability based on ${concernCount} skeptic flags and community signals.`
    },
    confidence: {
      score: confidenceScore,
      label:
        confidenceScore >= 75
          ? "High Confidence"
          : confidenceScore >= 55
            ? "Moderate Confidence"
            : "Low Confidence",
      dataGaps: [
        ...(reddit.integrationStatus !== "live"
          ? ["Live Reddit threads not loaded"]
          : []),
        ...(!isAIConfigured() ? ["Full AI synthesis unavailable"] : []),
        ...((product.reviewCount ?? 0) < 50 ? ["Limited review sample"] : [])
      ],
      reasoning: "Confidence reflects data completeness, not product quality."
    },
    lifespan,
    priceAnalysis,
    longTermOwnership: {
      verdict:
        lifespan.depreciationRate > 0.35
          ? "Mixed"
          : buyScore >= 70
            ? "Recommended Long-Term"
            : "Mixed",
      totalCostOfOwnership: tco,
      resaleValueEstimate: resale,
      maintenanceRisk: matchLifespanProfile(product.category, product.name)
        .maintenanceRisk,
      upgradeability:
        lifespan.category.includes("Laptop") || lifespan.category.includes("Phone")
          ? "Limited — plan for replacement"
          : "Moderate",
      repairability: matchLifespanProfile(product.category, product.name)
        .repairability,
      ownershipYears: lifespan.expectedLifeYears,
      summary: `Over ${lifespan.expectedLifeYears} years, expect ~${Math.round(lifespan.depreciationRate * 100)}% annual depreciation.`,
      risks: [
        "Category-typical obsolescence",
        ...(lifespan.depreciationRate > 0.3 ? ["High resale value loss"] : [])
      ]
    },
    alternatives: [],
    redditSentiment: reddit,
    agentFindings: agents,
    reviewTrust,
    pros: [
      { text: "Listed on established marketplace", confidence: 0.9 },
      ...(product.rating && product.rating >= 4
        ? [{ text: "Above-average star rating", confidence: 0.6 }]
        : [])
    ],
    cons: (skeptic?.concerns ?? []).map((c) => ({ text: c, confidence: 0.7 })),
    costPerUse,
    evaluatedAt: new Date().toISOString(),
    modelUsed: "heuristic-panel",
    evaluationMode: "heuristic"
  }
}

function mergeEvaluation(
  base: ProductEvaluation,
  ai: Record<string, unknown>,
  mode: ProductEvaluation["evaluationMode"]
): ProductEvaluation {
  if (mode === "heuristic" || Object.keys(ai).length === 0) return base

  const scores = (ai.scores as ProductEvaluation["scores"]) ?? base.scores
  return {
    ...base,
    scores: { ...base.scores, ...scores },
    recommendation:
      (ai.recommendation as ProductEvaluation["recommendation"]) ??
      base.recommendation,
    verdict: (ai.verdict as string) ?? base.verdict,
    bullCase: (ai.bullCase as ProductEvaluation["bullCase"]) ?? base.bullCase,
    bearCase: (ai.bearCase as ProductEvaluation["bearCase"]) ?? base.bearCase,
    regret: (ai.regret as ProductEvaluation["regret"]) ?? base.regret,
    confidence: (ai.confidence as ProductEvaluation["confidence"]) ?? base.confidence,
    pros: (ai.pros as ProductEvaluation["pros"]) ?? base.pros,
    cons: (ai.cons as ProductEvaluation["cons"]) ?? base.cons,
    alternatives:
      (ai.alternatives as ProductEvaluation["alternatives"]) ?? base.alternatives,
    longTermOwnership:
      (ai.longTermOwnership as Partial<ProductEvaluation["longTermOwnership"]>)
        ? {
            ...base.longTermOwnership,
            ...(ai.longTermOwnership as object),
            totalCostOfOwnership: base.longTermOwnership.totalCostOfOwnership,
            resaleValueEstimate: base.longTermOwnership.resaleValueEstimate,
            ownershipYears: base.longTermOwnership.ownershipYears,
            maintenanceRisk: base.longTermOwnership.maintenanceRisk,
            repairability: base.longTermOwnership.repairability
          }
        : base.longTermOwnership,
    agentFindings:
      (ai.agentFindings as AgentFinding[])?.length > 0
        ? [
            ...(ai.agentFindings as AgentFinding[]),
            {
              agent: "synthesizer" as const,
              label: "Synthesizer",
              concerns: [],
              supportingPoints: [(ai.verdict as string) ?? base.verdict],
              confidence: (ai.confidence as { score?: number })?.score ?? 70
            }
          ]
        : base.agentFindings,
    evaluationMode: mode
  }
}

function buildVerdict(
  buyScore: number,
  regret: number,
  name: string
): string {
  if (regret >= 65)
    return `High regret risk (${regret}%) — ${name} has significant reasons to avoid.`
  if (buyScore >= 75 && regret < 40)
    return `Passes skeptical review with manageable regret risk — still compare alternatives.`
  if (buyScore >= 50)
    return `Mixed evaluation — ${name} has both valid reasons to buy and meaningful concerns.`
  return `Fails skeptical review — more reasons to skip than to buy.`
}

/** Map ProductEvaluation to legacy ProductAnalysis for extension backward compat */
export function toProductAnalysis(eval_: ProductEvaluation): ProductAnalysis {
  return {
    scores: {
      buyScore: eval_.scores.buyScore,
      valueScore: eval_.scores.valueScore,
      qualityScore: Math.round(
        (eval_.scores.buyScore + (100 - eval_.regret.probability)) / 2
      ),
      regretProbability: eval_.scores.regretProbability,
      confidenceScore: eval_.scores.confidenceScore
    },
    priceFairness: eval_.priceAnalysis.priceFairness,
    recommendation: eval_.recommendation,
    summary: eval_.verdict,
    explanation: `${eval_.bearCase.summary}\n\n${eval_.bullCase.summary}`,
    reviewTrust: eval_.reviewTrust,
    pros: eval_.pros,
    cons: eval_.cons,
    alternatives: eval_.alternatives.map((a) => ({
      name: a.name,
      brand: a.brand,
      price: a.price,
      currency: a.currency,
      rank: a.rank,
      reasons: a.whyBetter,
      comparisonPoints: a.tradeoffs,
      whyBetter: a.whyBetter,
      tradeoffs: a.tradeoffs,
      comparisonScore: a.comparisonScore
    })),
    costPerUse: eval_.costPerUse,
    redditConsensus: {
      mostCommonPraise: eval_.redditSentiment.mostCommonPraise,
      mostCommonComplaints: eval_.redditSentiment.mostCommonComplaints,
      overallSentiment: eval_.redditSentiment.overallSentiment,
      summary: eval_.redditSentiment.summary,
      sentimentScore: eval_.redditSentiment.sentimentScore,
      regretSignals: eval_.redditSentiment.regretSignals,
      authenticityFlags: eval_.redditSentiment.authenticityFlags,
      integrationStatus: eval_.redditSentiment.integrationStatus
    },
    priceHistory: eval_.priceHistory,
    bullCase: eval_.bullCase,
    bearCase: eval_.bearCase,
    regret: eval_.regret,
    confidence: eval_.confidence,
    lifespan: eval_.lifespan,
    priceAnalysis: eval_.priceAnalysis,
    longTermOwnership: eval_.longTermOwnership,
    agentFindings: eval_.agentFindings,
    evaluation: eval_,
    analyzedAt: eval_.evaluatedAt,
    modelUsed: eval_.modelUsed,
    cacheHit: eval_.cacheHit
  }
}
