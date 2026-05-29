import type { RedditConsensus } from "@productsense/shared"
import type { ExtractedProduct } from "@productsense/shared"
import { prisma } from "@/lib/db"

/**
 * Reddit Consensus Engine
 *
 * Architecture for future Reddit API integration.
 * Currently returns AI-inferred or cached mock consensus.
 *
 * Future integration points:
 * - Reddit OAuth2 API for subreddit search
 * - Pushshift/Arctic Shift for historical data
 * - Qdrant for semantic deduplication of posts
 */
export interface RedditSearchParams {
  productName: string
  brand?: string
  category?: string
  subreddits?: string[]
}

export async function getRedditConsensus(
  product: ExtractedProduct,
  aiConsensus?: RedditConsensus
): Promise<RedditConsensus> {
  const productKey = `${product.site}:${product.id}`

  try {
    const cached = await prisma.redditCache.findUnique({
      where: { productKey }
    })
    if (cached && cached.expiresAt > new Date()) {
      return cached.consensusData as unknown as RedditConsensus
    }
  } catch {
    // DB optional
  }

  if (aiConsensus) {
    return aiConsensus
  }

  // Default mock consensus based on product category
  const consensus: RedditConsensus = {
    mostCommonPraise: inferPraise(product),
    mostCommonComplaints: inferComplaints(product),
    overallSentiment: (product.rating ?? 3) >= 4 ? "Positive" : (product.rating ?? 3) >= 3 ? "Neutral" : "Negative",
    summary: `Community discussions about ${product.brand ?? product.name} products generally reflect ${(product.rating ?? 3) >= 4 ? "positive" : "mixed"} sentiment. Connect Reddit API for live data.`,
    integrationStatus: "mock"
  }

  try {
    await prisma.redditCache.upsert({
      where: { productKey },
      create: {
        productKey,
        consensusData: consensus as object,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      update: {
        consensusData: consensus as object,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
  } catch {
    // DB optional
  }

  return consensus
}

function inferPraise(product: ExtractedProduct): string[] {
  const category = product.category?.toLowerCase() ?? ""
  if (category.includes("laptop") || category.includes("computer")) {
    return ["Good performance", "Reliable build", "Decent battery life"]
  }
  if (category.includes("phone") || category.includes("mobile")) {
    return ["Sharp display", "Fast performance", "Good camera"]
  }
  if (category.includes("fashion") || category.includes("clothing")) {
    return ["Comfortable fit", "Good fabric quality", "True to size"]
  }
  return ["Good value for money", "Reliable brand", "Fast delivery"]
}

function inferComplaints(product: ExtractedProduct): string[] {
  const category = product.category?.toLowerCase() ?? ""
  if (category.includes("laptop") || category.includes("computer")) {
    return ["Expensive upgrades", "Limited ports", "Runs warm under load"]
  }
  if (category.includes("phone") || category.includes("mobile")) {
    return ["Battery degradation over time", "Expensive repairs", "Bloatware"]
  }
  return ["Price higher than competitors", "Limited color options", "Slow customer support"]
}

/** Future: Search Reddit API */
export async function searchRedditPosts(
  _params: RedditSearchParams
): Promise<Array<{ title: string; body: string; score: number; subreddit: string }>> {
  // Placeholder for Reddit API integration
  // POST /api/reddit/search will use this when REDDIT_CLIENT_ID is configured
  return []
}
