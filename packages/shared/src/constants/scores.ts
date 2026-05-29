import type { Recommendation } from "../types/analysis"

export const SCORE_THRESHOLDS = {
  BUY: 75,
  CONSIDER: 50,
  AVOID: 0
} as const

export function scoreToRecommendation(buyScore: number): Recommendation {
  if (buyScore >= SCORE_THRESHOLDS.BUY) return "BUY"
  if (buyScore >= SCORE_THRESHOLDS.CONSIDER) return "CONSIDER"
  return "AVOID"
}

export const RECOMMENDATION_CONFIG = {
  BUY: {
    label: "Buy",
    emoji: "✅",
    color: "emerald",
    description: "Strong value proposition — recommended purchase"
  },
  CONSIDER: {
    label: "Consider",
    emoji: "⚠️",
    color: "amber",
    description: "Mixed signals — weigh pros and cons carefully"
  },
  AVOID: {
    label: "Avoid",
    emoji: "❌",
    color: "red",
    description: "Not recommended — significant concerns identified"
  }
} as const

export const TRUST_SCORE_LABELS = [
  { min: 90, label: "Highly Trustworthy" },
  { min: 75, label: "Mostly Trustworthy" },
  { min: 60, label: "Moderately Trustworthy" },
  { min: 40, label: "Questionable" },
  { min: 0, label: "Low Trust" }
] as const

export function getTrustLabel(score: number): string {
  const label = TRUST_SCORE_LABELS.find((t) => score >= t.min)
  return label?.label ?? "Unknown"
}

export const CACHE_TTL_MS = {
  ANALYSIS: 24 * 60 * 60 * 1000, // 24 hours
  PRICE: 60 * 60 * 1000, // 1 hour
  CHAT: 30 * 60 * 1000 // 30 minutes
} as const
