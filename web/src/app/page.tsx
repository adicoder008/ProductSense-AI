import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          ProductSense AI API
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          AI-Powered Shopping Intelligence
        </h1>
        <p className="text-lg text-muted-foreground">
          Backend API for the ProductSense browser extension. Analyze products,
          detect fake reviews, and get personalized buy recommendations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/api/health"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Health Check
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-8 text-left text-sm">
          {[
            ["POST /api/analyze", "Full product analysis"],
            ["POST /api/chat", "AI shopping chat"],
            ["GET/POST /api/preferences", "User preferences"],
            ["GET /api/price-history/:id", "Price history"],
            ["POST /api/reviews/analyze", "Review trust score"],
            ["GET /api/health", "Service health"]
          ].map(([endpoint, desc]) => (
            <div key={endpoint} className="rounded-lg border p-3">
              <code className="text-xs font-mono text-primary">{endpoint}</code>
              <p className="text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
