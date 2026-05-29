import { z } from "zod"

export const SupportedSiteSchema = z.enum([
  "amazon",
  "flipkart",
  "myntra",
  "nykaa",
  "reliance-digital",
  "croma",
  "unknown"
])

export const ProductSpecificationSchema = z.object({
  key: z.string(),
  value: z.string()
})

export const ProductReviewSchema = z.object({
  id: z.string().optional(),
  author: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  title: z.string().optional(),
  body: z.string().min(1),
  date: z.string().optional(),
  verified: z.boolean().optional(),
  helpfulCount: z.number().optional()
})

export const ExtractedProductSchema = z.object({
  id: z.string().min(1),
  site: SupportedSiteSchema,
  url: z.string().url(),
  name: z.string().min(1),
  brand: z.string().optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  currency: z.string().default("INR"),
  discount: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  specifications: z.array(ProductSpecificationSchema).default([]),
  images: z.array(z.string()).default([]),
  reviews: z.array(ProductReviewSchema).default([]),
  extractedAt: z.string(),
  metadata: z.record(z.unknown()).optional()
})

export type ExtractedProductInput = z.infer<typeof ExtractedProductSchema>
