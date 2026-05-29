export interface CategoryLifespanProfile {
  category: string
  keywords: string[]
  minYears: number
  typicalYears: number
  maxYears: number
  depreciationPerYear: number
  repairability: "Low" | "Medium" | "High"
  maintenanceRisk: "Low" | "Medium" | "High"
}

export const LIFESPAN_PROFILES: CategoryLifespanProfile[] = [
  {
    category: "Smartphones",
    keywords: ["phone", "mobile", "smartphone", "iphone", "android"],
    minYears: 2,
    typicalYears: 3,
    maxYears: 5,
    depreciationPerYear: 0.28,
    repairability: "Low",
    maintenanceRisk: "Medium"
  },
  {
    category: "Laptops",
    keywords: ["laptop", "notebook", "macbook", "ultrabook", "chromebook"],
    minYears: 3,
    typicalYears: 4,
    maxYears: 7,
    depreciationPerYear: 0.22,
    repairability: "Medium",
    maintenanceRisk: "Medium"
  },
  {
    category: "Televisions",
    keywords: ["tv", "television", "oled", "qled", "smart tv"],
    minYears: 5,
    typicalYears: 7,
    maxYears: 10,
    depreciationPerYear: 0.15,
    repairability: "Low",
    maintenanceRisk: "Low"
  },
  {
    category: "Appliances",
    keywords: ["refrigerator", "washing", "microwave", "ac", "air conditioner", "appliance"],
    minYears: 5,
    typicalYears: 8,
    maxYears: 12,
    depreciationPerYear: 0.12,
    repairability: "Medium",
    maintenanceRisk: "Medium"
  },
  {
    category: "Audio",
    keywords: ["headphone", "earbuds", "speaker", "soundbar", "airpods"],
    minYears: 2,
    typicalYears: 3,
    maxYears: 5,
    depreciationPerYear: 0.25,
    repairability: "Low",
    maintenanceRisk: "Low"
  },
  {
    category: "Fashion",
    keywords: ["shirt", "dress", "shoe", "sneaker", "clothing", "apparel", "fashion"],
    minYears: 1,
    typicalYears: 2,
    maxYears: 4,
    depreciationPerYear: 0.45,
    repairability: "Medium",
    maintenanceRisk: "Low"
  },
  {
    category: "Beauty",
    keywords: ["skincare", "cosmetic", "beauty", "makeup", "serum", "fragrance"],
    minYears: 0.5,
    typicalYears: 1,
    maxYears: 2,
    depreciationPerYear: 0.6,
    repairability: "Low",
    maintenanceRisk: "Low"
  },
  {
    category: "Cameras",
    keywords: ["camera", "dslr", "mirrorless", "gopro"],
    minYears: 4,
    typicalYears: 6,
    maxYears: 10,
    depreciationPerYear: 0.18,
    repairability: "Medium",
    maintenanceRisk: "Low"
  },
  {
    category: "Tablets",
    keywords: ["tablet", "ipad", "tab"],
    minYears: 3,
    typicalYears: 4,
    maxYears: 6,
    depreciationPerYear: 0.24,
    repairability: "Low",
    maintenanceRisk: "Medium"
  },
  {
    category: "General Electronics",
    keywords: ["electronic", "gadget", "device"],
    minYears: 2,
    typicalYears: 3,
    maxYears: 5,
    depreciationPerYear: 0.25,
    repairability: "Medium",
    maintenanceRisk: "Medium"
  }
]

export function matchLifespanProfile(
  category?: string,
  productName?: string
): CategoryLifespanProfile {
  const haystack = `${category ?? ""} ${productName ?? ""}`.toLowerCase()
  for (const profile of LIFESPAN_PROFILES) {
    if (profile.keywords.some((kw) => haystack.includes(kw))) {
      return profile
    }
  }
  return LIFESPAN_PROFILES[LIFESPAN_PROFILES.length - 1]
}
