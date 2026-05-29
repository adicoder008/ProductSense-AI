import {
  ChatRequestSchema,
  ExtractedProductSchema
} from "@productsense/shared/schemas"
import {
  successResponse,
  errorResponse,
  handleOptions,
  parseJsonBody
} from "@/lib/api-response"
import { isAIConfigured } from "@/lib/ai-client"
import {
  handleChatMessage,
  generateMockChatResponse
} from "@/services/chat-service"
import { generateId } from "@/lib/utils"

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(request: Request) {
  const body = await parseJsonBody<unknown>(request)
  if (!body) {
    return errorResponse("INVALID_REQUEST", "Request body required", 400)
  }

  const result = ChatRequestSchema.safeParse(body)
  if (!result.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid chat request",
      400,
      result.error.flatten()
    )
  }

  const { sessionId, message, history, preferences } = result.data
  const productResult = ExtractedProductSchema.safeParse(result.data.product)
  if (!productResult.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid product data", 400)
  }

  const product = productResult.data

  try {
    if (isAIConfigured()) {
      const response = await handleChatMessage(
        message,
        product,
        sessionId,
        history ?? [],
        preferences ?? undefined
      )
      return successResponse(response)
    }

    const mockMessage = generateMockChatResponse(message, product)
    return successResponse({
      message: mockMessage,
      sessionId: sessionId ?? generateId()
    })
  } catch (error) {
    console.error("[Chat] Error:", error)
    return errorResponse(
      "CHAT_FAILED",
      error instanceof Error ? error.message : "Chat failed",
      500
    )
  }
}
