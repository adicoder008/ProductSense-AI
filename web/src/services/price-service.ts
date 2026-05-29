import type { ExtractedProduct, PriceHistorySummary } from "@productsense/shared"
import { prisma } from "@/lib/db"

export async function upsertProduct(product: ExtractedProduct) {
  return prisma.product.upsert({
    where: {
      site_externalId: {
        site: product.site,
        externalId: product.id
      }
    },
    create: {
      externalId: product.id,
      site: product.site,
      url: product.url,
      name: product.name,
      brand: product.brand,
      category: product.category,
      currentPrice: product.price,
      currency: product.currency,
      rating: product.rating,
      reviewCount: product.reviewCount,
      imageUrl: product.images[0],
      rawData: product as object
    },
    update: {
      url: product.url,
      name: product.name,
      brand: product.brand,
      category: product.category,
      currentPrice: product.price,
      rating: product.rating,
      reviewCount: product.reviewCount,
      imageUrl: product.images[0],
      rawData: product as object
    }
  })
}

export async function recordPriceSnapshot(
  productId: string,
  price: number,
  originalPrice?: number,
  discount?: number,
  currency = "INR"
) {
  return prisma.priceSnapshot.create({
    data: {
      productId,
      price,
      originalPrice,
      discount,
      currency
    }
  })
}

export async function getPriceHistory(
  site: string,
  externalId: string,
  currentPrice: number
): Promise<PriceHistorySummary | null> {
  const product = await prisma.product.findUnique({
    where: { site_externalId: { site, externalId } },
    include: {
      priceSnapshots: {
        orderBy: { recordedAt: "desc" },
        take: 90
      }
    }
  })

  if (!product || product.priceSnapshots.length === 0) {
    return null
  }

  const prices = product.priceSnapshots.map((s) => s.price)
  const lowestPrice = Math.min(...prices)
  const highestPrice = Math.max(...prices)
  const averagePrice =
    prices.reduce((a, b) => a + b, 0) / prices.length

  // Trend: compare recent 7 vs previous 7
  const recent = prices.slice(0, 7)
  const previous = prices.slice(7, 14)
  const recentAvg =
    recent.reduce((a, b) => a + b, 0) / (recent.length || 1)
  const previousAvg =
    previous.length > 0
      ? previous.reduce((a, b) => a + b, 0) / previous.length
      : recentAvg

  let trend: "rising" | "falling" | "stable" = "stable"
  const changePct = ((recentAvg - previousAvg) / previousAvg) * 100
  if (changePct > 3) trend = "rising"
  else if (changePct < -3) trend = "falling"

  let recommendation: PriceHistorySummary["recommendation"] = "Neutral"
  if (currentPrice <= lowestPrice * 1.05) {
    recommendation = "Good Time To Buy"
  } else if (trend === "rising" && currentPrice > averagePrice) {
    recommendation = "Wait For Price Drop"
  }

  return {
    productId: product.id,
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice: Math.round(averagePrice),
    trend,
    recommendation,
    dataPoints: prices.length,
    lastUpdated: product.priceSnapshots[0].recordedAt.toISOString()
  }
}

export async function getCachedAnalysis(productId: string) {
  const cached = await prisma.analysisCache.findFirst({
    where: {
      productId,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  })
  return cached
}

export async function cacheAnalysis(
  productId: string,
  analysisData: object,
  modelUsed: string,
  ttlHours = 24
) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000)
  return prisma.analysisCache.create({
    data: {
      productId,
      analysisData,
      modelUsed,
      expiresAt
    }
  })
}
