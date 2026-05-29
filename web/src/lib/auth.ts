/**
 * Clerk integration point.
 * Wire @clerk/nextjs middleware + ClerkProvider in layout when deploying.
 * Extension passes Clerk user ID via x-user-id header for preference persistence.
 */
export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get("x-user-id")
}
