# API Reference

Base URL: `http://localhost:3000` (dev) | `https://your-app.vercel.app` (prod)

All responses use the envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## POST /api/analyze

Full AI product analysis.

**Request:**
```json
{
  "product": { /* ExtractedProduct */ },
  "preferences": { "budget": 50000, "priorities": ["battery", "value"] },
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "clx...",
    "analysis": {
      "scores": { "buyScore": 82, "valueScore": 78, "qualityScore": 85 },
      "recommendation": "BUY",
      "priceFairness": "Fairly Priced",
      "reviewTrust": { "trustScore": 82, "trustLabel": "Mostly Trustworthy" },
      "pros": [{ "text": "..." }],
      "cons": [{ "text": "..." }],
      "alternatives": [],
      "costPerUse": { "costPerDay": 54, "costPerHour": 2.25 },
      "redditConsensus": { "overallSentiment": "Positive" },
      "priceHistory": { "recommendation": "Good Time To Buy" }
    }
  }
}
```

## POST /api/chat

Contextual shopping Q&A.

**Request:**
```json
{
  "sessionId": "optional",
  "product": { /* ExtractedProduct */ },
  "message": "Is this worth buying?",
  "history": []
}
```

## GET/POST /api/preferences

**GET** — Returns default or user preferences.

**POST** — Save preferences. Pass `x-user-id` header (Clerk user ID) to persist to database.

## GET /api/price-history/:productId

Query params: `site`, `externalId`, `currentPrice`

## POST /api/reviews/analyze

Heuristic review trust analysis (no AI required).

## GET /api/health

Service status and provider availability.
