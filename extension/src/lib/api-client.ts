import type {
  ApiResponse,
  AnalyzeRequest,
  AnalyzeResponse,
  ChatRequest,
  ChatResponse,
  UserPreferences
} from "@productsense/shared"

const API_URL =
  process.env.PLASMO_PUBLIC_API_URL ?? "http://localhost:3000"

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  })
  return response.json() as Promise<ApiResponse<T>>
}

export async function analyzeProduct(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const result = await apiFetch<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify(request)
  })
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? "Analysis failed")
  }
  return result.data
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const result = await apiFetch<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(request)
  })
  if (!result.success || !result.data) {
    throw new Error(result.error?.message ?? "Chat failed")
  }
  return result.data
}

export async function getPreferences(): Promise<UserPreferences> {
  const result = await apiFetch<{ preferences: UserPreferences }>(
    "/api/preferences"
  )
  if (!result.success || !result.data) {
    return { currency: "INR", priorities: [] }
  }
  return result.data.preferences
}

export async function savePreferences(
  preferences: UserPreferences
): Promise<void> {
  await apiFetch("/api/preferences", {
    method: "POST",
    body: JSON.stringify({ preferences })
  })
}

export async function checkHealth(): Promise<boolean> {
  try {
    const result = await apiFetch<{ status: string }>("/api/health")
    return result.success === true
  } catch {
    return false
  }
}

export { API_URL }
