import { UserPreferencesSchema } from "@productsense/shared/schemas"
import {
  successResponse,
  errorResponse,
  handleOptions,
  parseJsonBody
} from "@/lib/api-response"
import { getUserIdFromRequest } from "@/lib/auth"
import {
  getUserPreferencesByClerkId,
  upsertUserPreferences
} from "@/services/user-service"

const DEFAULT_PREFERENCES = { currency: "INR" as const, priorities: [] as const }

export async function OPTIONS() {
  return handleOptions()
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return successResponse({ preferences: DEFAULT_PREFERENCES })
    }

    const preferences = await getUserPreferencesByClerkId(userId)
    return successResponse({
      preferences: preferences ?? DEFAULT_PREFERENCES
    })
  } catch {
    return successResponse({ preferences: DEFAULT_PREFERENCES })
  }
}

export async function POST(request: Request) {
  const body = await parseJsonBody<{ preferences: unknown }>(request)
  if (!body?.preferences) {
    return errorResponse("INVALID_REQUEST", "Preferences required", 400)
  }

  const parsed = UserPreferencesSchema.safeParse(body.preferences)
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid preferences",
      400,
      parsed.error.flatten()
    )
  }

  const prefs = parsed.data

  try {
    const userId = getUserIdFromRequest(request)

    if (!userId) {
      return successResponse({
        preferences: prefs,
        saved: false,
        message: "Pass x-user-id header (Clerk user ID) to persist preferences"
      })
    }

    await upsertUserPreferences(userId, undefined, prefs)
    return successResponse({ preferences: prefs, saved: true })
  } catch (error) {
    console.error("[Preferences] Error:", error)
    return successResponse({
      preferences: prefs,
      saved: false
    })
  }
}
