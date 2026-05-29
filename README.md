# ProductSense AI

> **ChatGPT + Consumer Reports + Reddit + Honey** — An AI-powered shopping assistant that helps you make better purchasing decisions.

ProductSense AI is a production-quality browser extension that analyzes products on major e-commerce sites and delivers actionable buy recommendations powered by AI.

## Supported Sites

| Site | Status |
|------|--------|
| Amazon | ✅ |
| Flipkart | ✅ |
| Myntra | ✅ |
| Nykaa | ✅ |
| Reliance Digital | ✅ |
| Croma | ✅ |

## Features

- **Product Detection** — Automatic extraction of product data from DOM
- **AI Analysis** — Buy Score, Value Score, Quality Score, Price Fairness
- **Review Trust Analysis** — Detect fake/suspicious review patterns
- **Pros & Cons** — AI-generated from product data and reviews
- **Better Alternatives** — Ranked comparison cards
- **Cost Per Use** — Daily/hourly cost breakdown
- **Reddit Consensus** — Community sentiment engine (API-ready)
- **Price History** — Historical tracking architecture
- **AI Shopping Chat** — Contextual Q&A about products
- **Personalized Recommendations** — Budget and priority preferences

## Architecture

```
ProductSenseAI/
├── packages/shared/     # Shared types, schemas, constants
├── web/                 # Next.js API backend (Vercel)
└── extension/           # Plasmo browser extension
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Extension | Plasmo, React, TypeScript, Tailwind CSS |
| Backend | Next.js 15 App Router, API Routes |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o, Google Gemini |
| Auth | Clerk |
| Vector DB | Qdrant (optional) |
| Deploy | Vercel |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Google Gemini API key (optional)
- Clerk account (for auth)

### 1. Install dependencies

```bash
npm install --ignore-scripts
npm rebuild sharp
node extension/scripts/generate-icons.js
```

On Windows, native modules (`sharp`, `@parcel/watcher`) may require Visual Studio Build Tools if `npm rebuild sharp` fails.

### 2. Configure environment

```bash
cp web/.env.example web/.env.local
cp extension/.env.example extension/.env
```

Fill in your API keys and database URL in `web/.env.local`.

### 3. Set up database

```bash
npm run db:push
```

### 4. Start development

```bash
# Terminal 1 — Backend API
npm run dev:web

# Terminal 2 — Extension (hot reload)
npm run dev:extension
```

Load the extension from `extension/build/chrome-mv3-dev` in Chrome → Extensions → Developer mode → Load unpacked.

### 5. Build for production

```bash
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Full product analysis |
| POST | `/api/chat` | AI shopping chat |
| GET/POST | `/api/preferences` | User preferences |
| GET | `/api/price-history/:productId` | Price history |
| POST | `/api/reviews/analyze` | Review trust analysis |

## Database Schema

See [web/prisma/schema.prisma](web/prisma/schema.prisma) for the full schema including:

- `Product` — Cached product data
- `PriceSnapshot` — Historical price tracking
- `AnalysisCache` — Cached AI analysis results
- `UserPreference` — Personalization settings
- `ChatSession` — Chat history

## Extension Architecture

```
extension/src/
├── contents/           # Content scripts (per-site injection)
├── background/         # Service worker
├── popup/              # Extension popup
├── components/         # React UI (panel, cards, chat)
├── extractors/         # Site-specific DOM extractors
│   ├── base.ts         # Abstract extractor interface
│   ├── amazon.ts
│   ├── flipkart.ts
│   ├── myntra.ts
│   ├── nykaa.ts
│   ├── reliance-digital.ts
│   └── croma.ts
├── lib/                # Utilities, API client
└── styles/             # Tailwind + design tokens
```

## License

MIT
