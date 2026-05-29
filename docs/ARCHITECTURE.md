# ProductSense AI — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Chrome MV3)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Content      │  │ Background   │  │ Popup                │ │
│  │ Script       │  │ Service      │  │ (settings/status)    │ │
│  │              │  │ Worker       │  │                      │ │
│  │ • Extractors │  │ • Cache      │  └──────────────────────┘ │
│  │ • FAB + Panel│  │ • Badge      │                           │
│  └──────┬───────┘  └──────────────┘                           │
└─────────┼───────────────────────────────────────────────────────┘
          │ HTTPS (REST)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API (Vercel)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ /analyze │ │ /chat    │ │ /prefs   │ │ /price-history   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │            │            │                 │            │
│  ┌────┴────────────┴────────────┴─────────────────┴─────────┐  │
│  │              Service Layer                                │  │
│  │  analysis-service │ chat-service │ price-service          │  │
│  │  reddit-service   │ review-trust (heuristic + AI)        │  │
│  └────┬───────────────────────────────┬──────────────────────┘  │
│       │                               │                          │
│  ┌────┴─────┐  ┌──────────┐  ┌───────┴────┐                   │
│  │ OpenAI   │  │ Gemini   │  │ PostgreSQL │                   │
│  │ GPT-4o   │  │ Flash    │  │ (Prisma)   │                   │
│  └──────────┘  └──────────┘  └────────────┘                   │
│       Clerk Auth (optional persistence)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

| Package | Purpose |
|---------|---------|
| `packages/shared` | Types, Zod schemas, site constants |
| `web` | Next.js API backend |
| `extension` | Plasmo browser extension |

## Data Flow

### 1. Product Detection

1. Content script loads on matched e-commerce URLs
2. `detectSite()` + `isProductPage()` validate URL
3. Site-specific extractor parses DOM → `ExtractedProduct`
4. MutationObserver handles SPA navigation (Flipkart, Myntra)

### 2. AI Analysis Pipeline

```
ExtractedProduct → POST /api/analyze
  → Validate (Zod)
  → Upsert Product + PriceSnapshot
  → Check AnalysisCache
  → AI Analysis (OpenAI → Gemini fallback)
  → Review Trust (heuristic)
  → Price History aggregation
  → Reddit Consensus (mock → future API)
  → Cache result → Response
```

### 3. Extension UI

- **FAB**: Shows buy score badge when analysis completes
- **Slide-out Panel**: 400px right panel with tabs (Analysis / Chat / Settings)
- **Design System**: Dark theme inspired by Linear/Stripe (`ps-*` tokens)

## Extractor Architecture

```typescript
abstract class BaseExtractor {
  abstract site: SupportedSite
  canHandle(url): boolean
  abstract extract(document, url): ExtractedProduct | null
  // Shared: parsePrice, parseRating, extractSpecsFromTable
}

Registry: extractors[] → getExtractorForUrl(url)
```

Each site implements resilient multi-selector fallbacks since e-commerce DOMs change frequently.

## Database Schema

| Model | Purpose |
|-------|---------|
| `Product` | Canonical product record (site + externalId unique) |
| `PriceSnapshot` | Time-series price data for history charts |
| `AnalysisCache` | TTL-cached AI results (24h default) |
| `User` + `UserPreference` | Clerk-linked personalization |
| `ChatSession` + `ChatMessage` | Chat persistence |
| `RedditCache` | Future Reddit API response cache |

## API Design

All endpoints return `ApiResponse<T>`:

```json
{ "success": true, "data": { ... }, "meta": { } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

CORS enabled for extension origin.

## Security

- API keys server-side only (never in extension bundle except public API URL)
- Clerk middleware on preferences (optional auth)
- Input validation via Zod on all POST endpoints
- No PII in extension storage

## Scalability Path

1. **Qdrant**: Embed product descriptions for semantic alternative search
2. **Reddit API**: Replace mock consensus with live subreddit scraping
3. **Price tracking cron**: Vercel cron → snapshot prices daily
4. **Rate limiting**: Upstash Redis on /analyze
5. **CDN cache**: Edge-cache analysis for popular products

## Interview Talking Points

- **Plasmo**: Modern extension DX with React HMR, file-based entrypoints
- **Extractor pattern**: Open/closed principle for new sites
- **AI fallback chain**: OpenAI primary → Gemini fallback → mock for dev
- **Cache strategy**: Multi-layer (extension chrome.storage + DB AnalysisCache)
- **Review trust**: Heuristic pre-processing + AI enrichment (cost optimization)
- **Monorepo**: Shared types prevent API/extension contract drift
