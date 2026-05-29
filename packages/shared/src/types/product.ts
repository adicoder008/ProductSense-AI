export type SupportedSite =
  | "amazon"
  | "flipkart"
  | "myntra"
  | "nykaa"
  | "reliance-digital"
  | "croma"
  | "unknown"

export interface ProductSpecification {
  key: string
  value: string
}

export interface ProductReview {
  id?: string
  author?: string
  rating?: number
  title?: string
  body: string
  date?: string
  verified?: boolean
  helpfulCount?: number
}

export interface ExtractedProduct {
  id: string
  site: SupportedSite
  url: string
  name: string
  brand?: string
  price: number
  originalPrice?: number
  currency: string
  discount?: number
  rating?: number
  reviewCount?: number
  category?: string
  description?: string
  specifications: ProductSpecification[]
  images: string[]
  reviews: ProductReview[]
  extractedAt: string
  metadata?: Record<string, unknown>
}

export interface ProductSnapshot extends ExtractedProduct {
  snapshotId?: string
}
