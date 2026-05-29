import type { ExtractedProduct, LifespanEstimate } from "@productsense/shared"
import { matchLifespanProfile } from "@productsense/shared"

export function estimateLifespan(product: ExtractedProduct): LifespanEstimate {
  const profile = matchLifespanProfile(product.category, product.name)

  let years = profile.typicalYears
  const rating = product.rating ?? 3.5
  const brand = (product.brand ?? "").toLowerCase()

  if (rating >= 4.3) years += 0.5
  if (rating < 3.5) years -= 0.5
  if (["apple", "sony", "samsung", "lg", "bosch"].some((b) => brand.includes(b))) {
    years += 0.25
  }

  years = Math.max(profile.minYears, Math.min(profile.maxYears, years))

  return {
    category: profile.category,
    expectedLifeYears: Math.round(years * 10) / 10,
    expectedLifeMonths: Math.round(years * 12),
    depreciationRate: profile.depreciationPerYear,
    categoryBenchmark: `${profile.category}: ${profile.minYears}–${profile.maxYears} years typical`,
    assumptions: [
      `Based on ${profile.category} category benchmarks`,
      `Adjusted for ${rating}★ rating and brand tier`,
      "Assumes normal daily use, not heavy commercial use"
    ]
  }
}

export function estimateResaleValue(
  price: number,
  yearsOwned: number,
  depreciationRate: number
): number {
  const remaining = Math.max(0.05, 1 - depreciationRate * yearsOwned)
  return Math.round(price * remaining)
}
