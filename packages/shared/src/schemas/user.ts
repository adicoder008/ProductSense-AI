import { z } from "zod"

export const UserPrioritySchema = z.enum([
  "battery",
  "gaming",
  "portability",
  "camera",
  "build_quality",
  "value",
  "performance",
  "design"
])

export const UserPreferencesSchema = z.object({
  userId: z.string().optional(),
  budget: z.number().positive().optional(),
  currency: z.string().default("INR"),
  priorities: z.array(UserPrioritySchema).default([]),
  preferredBrands: z.array(z.string()).optional(),
  avoidBrands: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
  updatedAt: z.string().optional()
})

export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>
