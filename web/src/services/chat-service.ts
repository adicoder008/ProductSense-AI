import type {
  ExtractedProduct,
  ChatMessage,
  UserPreferences
} from "@productsense/shared"
import { chatWithAI } from "@/lib/ai-client"
import { prisma } from "@/lib/db"
import { generateId } from "@/lib/utils"

const CHAT_SYSTEM_PROMPT = `You are ProductSense AI — a skeptical consumer advocate, NOT a salesperson.

You have context about the product the user is viewing. Always lead with risks and reasons NOT to buy before any positives.

Answer questions about:
- Whether it's worth buying (default skeptical unless evidence is strong)
- Comparisons with alternatives
- Common complaints, regret risk, and bear case
- Long-term ownership and depreciation
- Price fairness vs historical/community benchmarks

Be concise (2-4 paragraphs max), specific, and actionable. Use ₹ for Indian prices.
If you don't have enough data, say so — uncertainty lowers confidence, it is not neutral.`

function buildProductContext(product: ExtractedProduct): string {
  return `Current Product Context:
Name: ${product.name}
Brand: ${product.brand ?? "Unknown"}
Price: ${product.currency} ${product.price}
Rating: ${product.rating ?? "N/A"} (${product.reviewCount ?? 0} reviews)
Category: ${product.category ?? "Unknown"}
URL: ${product.url}
Description: ${product.description?.slice(0, 500) ?? "N/A"}`
}

export async function handleChatMessage(
  message: string,
  product: ExtractedProduct,
  sessionId?: string,
  history: ChatMessage[] = [],
  preferences?: UserPreferences
): Promise<{ message: ChatMessage; sessionId: string }> {
  let prefNote = ""
  if (preferences?.budget) {
    prefNote = `\nUser budget: ₹${preferences.budget}. Priorities: ${preferences.priorities.join(", ")}.`
  }

  const systemPrompt = CHAT_SYSTEM_PROMPT + "\n\n" + buildProductContext(product) + prefNote

  const chatHistory = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content
  }))
  chatHistory.push({ role: "user", content: message })

  const { content, modelUsed } = await chatWithAI(systemPrompt, chatHistory)

  const assistantMessage: ChatMessage = {
    id: generateId(),
    role: "assistant",
    content: content || "I couldn't generate a response. Please try again.",
    timestamp: new Date().toISOString()
  }

  // Persist session if database available
  let resolvedSessionId = sessionId ?? generateId()
  try {
    if (sessionId) {
      await prisma.chatMessage.createMany({
        data: [
          { sessionId, role: "user", content: message },
          { sessionId, role: "assistant", content: assistantMessage.content }
        ]
      })
    } else {
      const session = await prisma.chatSession.create({
        data: {
          productUrl: product.url,
          messages: {
            create: [
              { role: "user", content: message },
              { role: "assistant", content: assistantMessage.content }
            ]
          }
        }
      })
      resolvedSessionId = session.id
    }
  } catch {
    // DB optional for chat — continue without persistence
  }

  void modelUsed
  return { message: assistantMessage, sessionId: resolvedSessionId }
}

export function generateMockChatResponse(
  message: string,
  product: ExtractedProduct
): ChatMessage {
  const lower = message.toLowerCase()
  let content: string

  if (lower.includes("worth") || lower.includes("buy")) {
    content = `Based on ${product.name}'s ${product.rating ?? "N/A"}★ rating and ₹${product.price.toLocaleString("en-IN")} price point, it's ${(product.rating ?? 0) >= 4 ? "likely a solid purchase" : "worth careful consideration"}. Enable AI API keys for a personalized recommendation tailored to your needs.`
  } else if (lower.includes("complaint")) {
    content = `Common concerns for products in the ${product.category ?? "this"} category often include pricing, warranty coverage, and accessory costs. Configure the full AI backend for review-sourced complaint analysis.`
  } else if (lower.includes("compare") || lower.includes("alternative")) {
    content = `I'd recommend comparing ${product.name} with 2-3 alternatives in the same price range. Use the Alternatives tab in the analysis panel for AI-ranked suggestions once API keys are configured.`
  } else if (lower.includes("last") || lower.includes("year")) {
    content = `Durability depends on category and usage. Electronics typically last 3-5 years, appliances 5-10 years. Check the Cost Per Use section for a breakdown based on ${product.name}'s price.`
  } else {
    content = `I'm ProductSense AI. Ask me about whether ${product.name} is worth buying, alternatives, complaints, or long-term value. Configure OpenAI/Gemini API keys for full contextual answers.`
  }

  return {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString()
  }
}
