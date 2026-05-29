import type { UserPreferences } from "@productsense/shared"
import { prisma } from "@/lib/db"

export async function getUserPreferencesByClerkId(
  clerkId: string
): Promise<UserPreferences | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { preferences: true }
    })

    if (!user?.preferences) return null

    const prefs = user.preferences
    return {
      userId: user.id,
      budget: prefs.budget ?? undefined,
      currency: prefs.currency,
      priorities: prefs.priorities as UserPreferences["priorities"],
      preferredBrands: prefs.preferredBrands,
      avoidBrands: prefs.avoidBrands,
      minRating: prefs.minRating ?? undefined,
      updatedAt: prefs.updatedAt.toISOString()
    }
  } catch {
    return null
  }
}

export async function upsertUserPreferences(
  clerkId: string,
  email: string | undefined,
  preferences: UserPreferences
) {
  const user = await prisma.user.upsert({
    where: { clerkId },
    create: { clerkId, email },
    update: { email }
  })

  return prisma.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      budget: preferences.budget,
      currency: preferences.currency ?? "INR",
      priorities: preferences.priorities ?? [],
      preferredBrands: preferences.preferredBrands ?? [],
      avoidBrands: preferences.avoidBrands ?? [],
      minRating: preferences.minRating
    },
    update: {
      budget: preferences.budget,
      currency: preferences.currency ?? "INR",
      priorities: preferences.priorities ?? [],
      preferredBrands: preferences.preferredBrands ?? [],
      avoidBrands: preferences.avoidBrands ?? [],
      minRating: preferences.minRating
    }
  })
}
