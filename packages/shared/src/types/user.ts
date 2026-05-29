export type UserPriority =
  | "battery"
  | "gaming"
  | "portability"
  | "camera"
  | "build_quality"
  | "value"
  | "performance"
  | "design"

export interface UserPreferences {
  userId?: string
  budget?: number
  currency: string
  priorities: UserPriority[]
  preferredBrands?: string[]
  avoidBrands?: string[]
  minRating?: number
  updatedAt?: string
}

export interface UserProfile {
  id: string
  clerkId: string
  email?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}
