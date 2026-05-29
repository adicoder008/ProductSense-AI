import type { ApiResponse, ApiError } from "@productsense/shared"
import { NextResponse } from "next/server"

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status })
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  const error: ApiError = { code, message, details }
  return NextResponse.json({ success: false, error }, { status })
}

export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  })
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}
