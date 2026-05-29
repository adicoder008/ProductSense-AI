import type { ExtractedProduct } from "./product"
import type { ProductAnalysis, ChatMessage } from "./analysis"
import type { UserPreferences } from "./user"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface AnalyzeRequest {
  product: ExtractedProduct
  preferences?: UserPreferences
  forceRefresh?: boolean
}

export interface AnalyzeResponse {
  analysis: ProductAnalysis
  productId: string
}

export interface ChatRequest {
  sessionId?: string
  product: ExtractedProduct
  message: string
  history?: ChatMessage[]
  preferences?: UserPreferences
}

export interface ReviewAnalyzeRequest {
  product: Pick<ExtractedProduct, "name" | "reviews" | "rating" | "reviewCount">
}

export interface PriceHistoryRequest {
  productId: string
  site: string
  currentPrice: number
}

export interface HealthResponse {
  status: "ok" | "degraded"
  version: string
  services: {
    database: boolean
    openai: boolean
    gemini: boolean
  }
}
