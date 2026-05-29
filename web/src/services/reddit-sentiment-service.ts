import type {
  ExtractedProduct,
  RedditSentiment,
  CommunitySentiment
} from "@productsense/shared"
import { prisma } from "@/lib/db"

const CATEGORY_SUBREDDITS: Record<string, string[]> = {
  phone: ["IndiaTech", "GadgetsIndia", "Android"],
  laptop: ["IndianGaming", "laptops", "IndiaTech"],
  tv: ["4kTV", "hometheater", "IndiaTech"],
  fashion: ["malefashionadvice", "IndianFashionAddicts"],
  beauty: ["IndianSkincareAddicts", "IndianBeautyGurus"],
  default: ["BuyItForLife", "Frugal", "IndiaTech"]
}

export async function analyzeRedditSentiment(
  product: ExtractedProduct
): Promise<RedditSentiment> {
  const productKey = `${product.site}:${product.id}`

  try {
    const cached = await prisma.redditCache.findUnique({ where: { productKey } })
    if (cached && cached.expiresAt > new Date()) {
      const data = cached.consensusData as unknown as RedditSentiment
      if (data.regretSignals) return data
    }
  } catch {
    // DB optional
  }

  const live = await fetchLiveRedditSentiment(product)
  if (live) {
    await cacheSentiment(productKey, live)
    return live
  }

  const heuristic = buildHeuristicRedditSentiment(product)
  await cacheSentiment(productKey, heuristic)
  return heuristic
}

async function fetchLiveRedditSentiment(
  product: ExtractedProduct
): Promise<RedditSentiment | null> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  try {
    const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    })
    if (!tokenRes.ok) return null

    const { access_token } = (await tokenRes.json()) as { access_token: string }
    const query = encodeURIComponent(
      `${product.brand ?? ""} ${product.name}`.slice(0, 80)
    )
    const subreddits = pickSubreddits(product.category).join("+")
    const searchRes = await fetch(
      `https://oauth.reddit.com/r/${subreddits}/search.json?q=${query}&sort=relevance&limit=15&t=year`,
      { headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "ProductSenseAI/1.0" } }
    )
    if (!searchRes.ok) return null

    const data = (await searchRes.json()) as {
      data?: { children?: Array<{ data: { title: string; selftext: string; score: number; subreddit: string } }> }
    }
    const posts =
      data.data?.children?.map((c) => c.data).filter(Boolean) ?? []
    if (posts.length === 0) return null

    return synthesizeFromPosts(product, posts)
  } catch (e) {
    console.warn("[Reddit] Live fetch failed:", e)
    return null
  }
}

function synthesizeFromPosts(
  product: ExtractedProduct,
  posts: Array<{ title: string; selftext: string; score: number; subreddit: string }>
): RedditSentiment {
  const text = posts.map((p) => `${p.title} ${p.selftext}`.toLowerCase()).join(" ")
  const regretWords = ["regret", "don't buy", "avoid", "waste", "returned", "defect", "failed"]
  const praiseWords = ["worth", "recommend", "love", "great", "reliable", "value"]
  const regretSignals = regretWords.filter((w) => text.includes(w))
  const praiseHits = praiseWords.filter((w) => text.includes(w))

  let score = 0
  score += praiseHits.length * 12
  score -= regretSignals.length * 18
  score = Math.max(-100, Math.min(100, score))

  const sentiment: CommunitySentiment =
    score > 20 ? "Positive" : score < -20 ? "Negative" : "Neutral"

  return {
    overallSentiment: sentiment,
    sentimentScore: score,
    mostCommonPraise: praiseHits.length
      ? praiseHits.map((w) => `Community mentions "${w}"`)
      : ["Limited positive signals in sampled threads"],
    mostCommonComplaints: regretSignals.length
      ? regretSignals.map((w) => `Recurring concern: "${w}"`)
      : ["No strong negative patterns in sampled threads"],
    regretSignals: regretSignals.length
      ? regretSignals
      : ["No explicit regret language found"],
    authenticityFlags: posts.length < 3 ? ["Low sample size"] : [],
    summary: `Analyzed ${posts.length} Reddit threads across ${[...new Set(posts.map((p) => p.subreddit))].join(", ")}.`,
    subreddits: [...new Set(posts.map((p) => p.subreddit))],
    integrationStatus: "live"
  }
}

function buildHeuristicRedditSentiment(product: ExtractedProduct): RedditSentiment {
  const cat = product.category?.toLowerCase() ?? ""
  const rating = product.rating ?? 3
  let score = Math.round((rating - 3) * 35)

  const regretSignals: string[] = []
  if (rating < 3.8) regretSignals.push("Below-average marketplace rating")
  if ((product.reviewCount ?? 0) < 50)
    regretSignals.push("Thin review base — community consensus unclear")
  if (cat.includes("phone"))
    regretSignals.push("Rapid depreciation common in this category")
  if (cat.includes("fashion"))
    regretSignals.push("Fit/quality variance reported in similar listings")

  const praise: string[] = []
  if (rating >= 4) praise.push("Strong aggregate rating")
  if ((product.discount ?? 0) > 15) praise.push("Currently discounted vs MRP")

  score -= regretSignals.length * 8
  score = Math.max(-100, Math.min(100, score))

  return {
    overallSentiment: score > 15 ? "Positive" : score < -15 ? "Negative" : "Neutral",
    sentimentScore: score,
    mostCommonPraise: praise.length ? praise : ["Insufficient community data"],
    mostCommonComplaints: regretSignals,
    regretSignals,
    authenticityFlags: ["Heuristic mode — set REDDIT_CLIENT_ID for live threads"],
    summary: `Heuristic sentiment for ${product.name}. Configure Reddit API for live community analysis.`,
    subreddits: pickSubreddits(product.category),
    integrationStatus: "mock"
  }
}

function pickSubreddits(category?: string): string[] {
  const c = category?.toLowerCase() ?? ""
  if (c.includes("phone") || c.includes("mobile")) return CATEGORY_SUBREDDITS.phone
  if (c.includes("laptop")) return CATEGORY_SUBREDDITS.laptop
  if (c.includes("tv")) return CATEGORY_SUBREDDITS.tv
  if (c.includes("fashion")) return CATEGORY_SUBREDDITS.fashion
  if (c.includes("beauty")) return CATEGORY_SUBREDDITS.beauty
  return CATEGORY_SUBREDDITS.default
}

async function cacheSentiment(productKey: string, data: RedditSentiment) {
  try {
    await prisma.redditCache.upsert({
      where: { productKey },
      create: {
        productKey,
        consensusData: data as object,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      update: {
        consensusData: data as object,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
  } catch {
    // optional
  }
}
