import "~style.css"
import { useEffect, useState } from "react"
import { Sparkles, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { checkHealth, API_URL } from "~lib/api-client"

function IndexPopup() {
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    checkHealth().then(setApiHealthy)
  }, [])

  return (
    <div className="w-80 bg-ps-bg text-ps-text p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-ps-primary flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base">ProductSense AI</h1>
          <p className="text-xs text-ps-muted">Smarter shopping decisions</p>
        </div>
      </div>

      <div className="rounded-xl bg-ps-surface border border-ps-border p-3 space-y-2">
        <p className="text-xs font-medium text-ps-muted">API Status</p>
        <div className="flex items-center gap-2">
          {apiHealthy === null ? (
            <span className="text-xs text-ps-muted">Checking...</span>
          ) : apiHealthy ? (
            <>
              <CheckCircle size={14} className="text-ps-buy" />
              <span className="text-xs text-ps-buy">Connected</span>
            </>
          ) : (
            <>
              <XCircle size={14} className="text-ps-avoid" />
              <span className="text-xs text-ps-avoid">Offline — run npm run dev:web</span>
            </>
          )}
        </div>
        <p className="text-[10px] text-ps-muted font-mono truncate">{API_URL}</p>
      </div>

      <div className="rounded-xl bg-ps-surface border border-ps-border p-3">
        <p className="text-xs font-medium text-ps-muted mb-2">Supported Sites</p>
        <div className="flex flex-wrap gap-1">
          {["Amazon", "Flipkart", "Myntra", "Nykaa", "Reliance", "Croma"].map(
            (site) => (
              <span
                key={site}
                className="text-[10px] px-2 py-0.5 rounded-full bg-ps-bg border border-ps-border text-ps-muted"
              >
                {site}
              </span>
            )
          )}
        </div>
      </div>

      <p className="text-xs text-ps-muted leading-relaxed">
        Visit any product page on a supported site. The ProductSense button will
        appear — click it for AI-powered buy recommendations.
      </p>

      <a
        href={API_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-ps-border text-xs text-ps-muted hover:border-ps-primary hover:text-ps-primary transition-colors"
      >
        <ExternalLink size={14} />
        Open API Dashboard
      </a>
    </div>
  )
}

export default IndexPopup
