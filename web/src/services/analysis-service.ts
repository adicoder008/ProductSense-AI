import type {
  ExtractedProduct,
  ProductAnalysis,
  UserPreferences,
  ReviewTrustAnalysis,
  ReviewFlag
} from "@productsense/shared"
import { ProductAnalysisSchema } from "@productsense/shared/schemas"
import { completeWithAI } from "@/lib/ai-client"
import { generateId } from "@/lib/utils"

const ANALYSIS_SYSTEM_PROMPT = `You are ProductSense AI, an expert consumer analyst combining Consumer Reports rigor, Reddit community wisdom, and price intelligence.

Analyze products objectively. Return ONLY valid JSON matching this structure:
{
  "scores": { "buyScore": 0-100, "valueScore": 0-100, "qualityScore": 0-100 },
  "priceFairness": "Underpriced" | "Fairly Priced" | "Overpriced",
  "recommendation": "BUY" | "CONSIDER" | "AVOID",
  "summary": "1-2 sentence verdict",
  "explanation": "2-3 paragraph detailed analysis",
  "pros": [{ "text": "...", "confidence": 0-1 }],
  "cons": [{ "text": "...", "confidence": 0-1 }],
  "alternatives": [{
    "name": "...", "brand": "...", "price": number, "currency": "INR",
    "rank": 1, "reasons": ["..."], "comparisonPoints": ["..."]
  }],
  "costPerUse": {
    "price": number, "currency": "INR", "expectedLifeYears": number,
    "costPerDay": number, "costPerMonth": number, "costPerHour": number,
    "reasoning": "..."
  },
  "redditConsensus": {
    "mostCommonPraise": ["..."],
    "mostCommonComplaints": ["..."],
    "overallSentiment": "Positive" | "Neutral" | "Negative",
    "summary": "...",
    "integrationStatus": "mock"
  }
}

Scoring guidelines:
- buyScore: Overall purchase recommendation strength
- valueScore: Price vs features/quality ratio
- qualityScore: Build quality, reliability, brand reputation
- recommendation: BUY (75+), CONSIDER (50-74), AVOID (<50)

Be specific, actionable, and honest. Use Indian market context when relevant.`

function buildAnalysisPrompt(
  product: ExtractedProduct,
  preferences?: UserPreferences
): string {
  const reviewSample = product.reviews
    .slice(0, 15)
    .map(
      (r, i) =>
        `Review ${i + 1} (${r.rating ?? "?"}★): ${r.title ? r.title + " — " : ""}${r.body.slice(0, 300)}`
    )
    .join("\n")

  const specs = product.specifications
    .slice(0, 20)
    .map((s) => `${s.key}: ${s.value}`)
    .join("\n")

  let prefContext = ""
  if (preferences) {
    prefContext = `
User Preferences:
- Budget: ${preferences.budget ? `₹${preferences.budget}` : "Not set"}
- Priorities: ${preferences.priorities.join(", ") || "None"}
- Min Rating: ${preferences.minRating ?? "None"}
`
  }

  return `Analyze this product:

Product: ${product.name}
Brand: ${product.brand ?? "Unknown"}
Site: ${product.site}
Price: ${product.currency} ${product.price}${product.originalPrice ? ` (was ${product.originalPrice})` : ""}
Rating: ${product.rating ?? "N/A"} (${product.reviewCount ?? 0} reviews)
Category: ${product.category ?? "Unknown"}

Description:
${product.description?.slice(0, 1000) ?? "No description"}

Specifications:
${specs || "None available"}

Sample Reviews:
${reviewSample || "No reviews available"}
${prefContext}

Provide comprehensive analysis with 3-5 pros, 3-5 cons, and 2-3 ranked alternatives.`
}

export async function analyzeProduct(
  product: ExtractedProduct,
  preferences?: UserPreferences
): Promise<ProductAnalysis> {
  const userPrompt = buildAnalysisPrompt(product, preferences)
  const { content, modelUsed } = await completeWithAI({
    systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    userPrompt,
    jsonMode: true,
    temperature: 0.3
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error("AI returned invalid JSON for product analysis")
  }

  const reviewTrust = analyzeReviewTrust(product)

  const validated = ProductAnalysisSchema.parse({
    ...(parsed as Record<string, unknown>),
    reviewTrust,
    analyzedAt: new Date().toISOString(),
    modelUsed
  })

  return validated
}

export function analyzeReviewTrust(
  product: ExtractedProduct
): ReviewTrustAnalysis {
  const reviews = product.reviews
  const flags: ReviewFlag[] = []

  if (reviews.length === 0) {
    return {
      trustScore: 50,
      trustLabel: "No Reviews Available",
      flags: [],
      reasoning: "Insufficient review data to assess authenticity."
    }
  }

  // Detect repetitive content
  const bodies = reviews.map((r) => r.body.toLowerCase().trim())
  const uniqueBodies = new Set(bodies)
  const repetitionRate = 1 - uniqueBodies.size / bodies.length
  if (repetitionRate > 0.2) {
    flags.push({
      type: "repetitive",
      severity: repetitionRate > 0.4 ? "high" : "medium",
      description: `${Math.round(repetitionRate * 100)}% of reviews contain duplicate or near-duplicate text`,
      count: bodies.length - uniqueBodies.size
    })
  }

  // Detect extreme rating bias
  const ratings = reviews.filter((r) => r.rating !== undefined).map((r) => r.rating!)
  if (ratings.length > 5) {
    const fives = ratings.filter((r) => r === 5).length
    const ones = ratings.filter((r) => r === 1).length
    const extremeRate = (fives + ones) / ratings.length
    if (extremeRate > 0.8) {
      flags.push({
        type: "extremely_biased",
        severity: "medium",
        description: `${Math.round(extremeRate * 100)}% of reviews are either 1★ or 5★ with few moderate ratings`
      })
    }
  }

  // Detect suspicious short reviews burst
  const shortReviews = reviews.filter((r) => r.body.length < 30).length
  if (shortReviews / reviews.length > 0.4) {
    flags.push({
      type: "suspicious_pattern",
      severity: "medium",
      description: `${shortReviews} reviews are unusually short (< 30 chars), suggesting potential incentivized reviews`
    })
  }

  // Detect unverified review concentration
  const unverified = reviews.filter((r) => r.verified === false).length
  if (unverified / reviews.length > 0.6) {
    flags.push({
      type: "potential_fake",
      severity: "low",
      description: "Majority of sampled reviews are unverified purchases"
    })
  }

  // Calculate trust score
  let trustScore = 85
  for (const flag of flags) {
    const penalty =
      flag.severity === "high" ? 25 : flag.severity === "medium" ? 15 : 8
    trustScore -= penalty
  }
  trustScore = Math.max(10, Math.min(98, trustScore))

  const trustLabel =
    trustScore >= 90
      ? "Highly Trustworthy"
      : trustScore >= 75
        ? "Mostly Trustworthy"
        : trustScore >= 60
          ? "Moderately Trustworthy"
          : trustScore >= 40
            ? "Questionable"
            : "Low Trust"

  const reasoning =
    flags.length === 0
      ? "Review patterns appear natural with good diversity in ratings and content length."
      : `Detected ${flags.length} concern(s): ${flags.map((f) => f.description).join("; ")}.`

  return { trustScore, trustLabel, flags, reasoning }
}

export function generateMockAnalysis(
  product: ExtractedProduct
): ProductAnalysis {
  const reviewTrust = analyzeReviewTrust(product)
  const buyScore = Math.min(
    95,
    Math.round(
      (product.rating ?? 3.5) * 18 +
        (product.discount ?? 0) * 0.3 +
        reviewTrust.trustScore * 0.2
    )
  )

  const years = product.category?.match(/laptop|phone|tv|appliance/i) ? 4 : 2
  const costPerDay = product.price / (years * 365)

  return ProductAnalysisSchema.parse({
    scores: {
      buyScore,
      valueScore: Math.min(95, buyScore + 5),
      qualityScore: Math.min(95, Math.round((product.rating ?? 3.5) * 19))
    },
    priceFairness:
      (product.discount ?? 0) > 20
        ? "Underpriced"
        : (product.discount ?? 0) > 5
          ? "Fairly Priced"
          : "Overpriced",
    recommendation:
      buyScore >= 75 ? "BUY" : buyScore >= 50 ? "CONSIDER" : "AVOID",
    summary: `${product.name} shows ${buyScore >= 75 ? "strong" : buyScore >= 50 ? "mixed" : "weak"} purchase signals based on available data.`,
    explanation: `Based on ${product.reviewCount ?? 0} reviews and a ${product.rating ?? "N/A"}★ rating, this product ${buyScore >= 75 ? "offers good value for its category" : "has notable concerns worth considering"}. Configure AI API keys for deeper analysis.`,
    reviewTrust,
    pros: [
      { text: "Competitive pricing for the category", confidence: 0.7 },
      { text: "Available on a trusted marketplace", confidence: 0.9 }
    ],
    cons: [
      { text: "Limited review data for deep analysis", confidence: 0.6 },
      { text: "Enable AI API for personalized insights", confidence: 0.8 }
    ],
    alternatives: [],
    costPerUse: {
      price: product.price,
      currency: product.currency,
      expectedLifeYears: years,
      costPerDay: Math.round(costPerDay * 100) / 100,
      costPerMonth: Math.round((costPerDay * 30) * 100) / 100,
      costPerHour: Math.round((costPerDay / 8) * 100) / 100,
      reasoning: `Estimated ${years}-year lifespan for ${product.category ?? "this category"}.`
    },
    redditConsensus: {
      mostCommonPraise: ["Good value", "Reliable brand"],
      mostCommonComplaints: ["Price fluctuations", "Limited warranty info"],
      overallSentiment: "Neutral",
      summary: "Community data unavailable — configure Reddit integration for live sentiment.",
      integrationStatus: "mock"
    },
    analyzedAt: new Date().toISOString(),
    modelUsed: "mock-analyzer"
  })
}

export { generateId }
