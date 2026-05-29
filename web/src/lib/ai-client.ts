import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"

let openaiClient: OpenAI | null = null
let geminiClient: GoogleGenerativeAI | null = null

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

export function getGemini(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return geminiClient
}

export function getPrimaryModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o"
}

export function getFallbackModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
}

export interface AICompletionOptions {
  systemPrompt: string
  userPrompt: string
  jsonMode?: boolean
  temperature?: number
}

export async function completeWithAI(
  options: AICompletionOptions
): Promise<{ content: string; modelUsed: string }> {
  const { systemPrompt, userPrompt, jsonMode = true, temperature = 0.3 } = options

  const openai = getOpenAI()
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: getPrimaryModel(),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        ...(jsonMode && { response_format: { type: "json_object" } })
      })
      const content = response.choices[0]?.message?.content ?? ""
      return { content, modelUsed: getPrimaryModel() }
    } catch (error) {
      console.error("[OpenAI] Completion failed, trying Gemini:", error)
    }
  }

  const gemini = getGemini()
  if (gemini) {
    const model = gemini.getGenerativeModel({
      model: getFallbackModel(),
      generationConfig: {
        temperature,
        ...(jsonMode && { responseMimeType: "application/json" })
      }
    })
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ])
    const content = result.response.text()
    return { content, modelUsed: getFallbackModel() }
  }

  throw new Error("No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.")
}

export async function chatWithAI(
  systemPrompt: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<{ content: string; modelUsed: string }> {
  const openai = getOpenAI()
  if (openai) {
    const response = await openai.chat.completions.create({
      model: getPrimaryModel(),
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.5
    })
    return {
      content: response.choices[0]?.message?.content ?? "",
      modelUsed: getPrimaryModel()
    }
  }

  const gemini = getGemini()
  if (gemini) {
    const model = gemini.getGenerativeModel({ model: getFallbackModel() })
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }]
    }))
    const chat = model.startChat({
      history,
      systemInstruction: systemPrompt
    })
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    return { content: result.response.text(), modelUsed: getFallbackModel() }
  }

  throw new Error("No AI provider configured.")
}

export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY)
}
