import { successResponse } from "@/lib/api-response"
import { isAIConfigured } from "@/lib/ai-client"
import { prisma } from "@/lib/db"

export async function GET() {
  let dbOk = false
  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    dbOk = false
  }

  return successResponse({
    status: dbOk && isAIConfigured() ? "ok" : "degraded",
    version: "1.0.0",
    services: {
      database: dbOk,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  })
}
