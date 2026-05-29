import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState, useCallback, useRef } from "react"
import type {
  ExtractedProduct,
  ProductAnalysis,
  UserPreferences
} from "@productsense/shared"
import { extractProduct } from "~extractors"
import { analyzeProduct, getPreferences } from "~lib/api-client"
import { FloatingButton } from "~components/FloatingButton"
import { AnalysisPanel } from "~components/AnalysisPanel"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.amazon.in/*",
    "https://amazon.in/*",
    "https://www.amazon.com/*",
    "https://www.flipkart.com/*",
    "https://www.myntra.com/*",
    "https://www.nykaa.com/*",
    "https://www.reliancedigital.in/*",
    "https://www.croma.com/*"
  ],
  run_at: "document_idle"
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

function ProductSenseOverlay() {
  const [product, setProduct] = useState<ExtractedProduct | null>(null)
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "INR",
    priorities: []
  })
  const [panelOpen, setPanelOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const productIdRef = useRef<string | null>(null)

  const detectAndExtract = useCallback((): ExtractedProduct | null => {
    const extracted = extractProduct(document, window.location.href)
    setProduct(extracted)
    if (!extracted) {
      setAnalysis(null)
      setPanelOpen(false)
      productIdRef.current = null
    }
    return extracted
  }, [])

  const runAnalysis = useCallback(
    async (extracted: ExtractedProduct, forceRefresh = false) => {
      setLoading(true)
      setError(null)
      try {
        const prefs = await getPreferences().catch(() => preferences)
        setPreferences(prefs)
        const result = await analyzeProduct({
          product: extracted,
          preferences: prefs,
          forceRefresh
        })
        setAnalysis(result.analysis)
        chrome.runtime.sendMessage({
          type: "ANALYSIS_COMPLETE",
          recommendation: result.analysis.recommendation,
          product: extracted
        })
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Analysis failed. Start the API with npm run dev:web"
        )
      } finally {
        setLoading(false)
      }
    },
    [preferences]
  )

  useEffect(() => {
    const extracted = detectAndExtract()
    if (extracted) {
      productIdRef.current = extracted.id
      runAnalysis(extracted)
    }

    const observer = new MutationObserver(() => {
      const updated = detectAndExtract()
      if (updated && updated.id !== productIdRef.current) {
        productIdRef.current = updated.id
        runAnalysis(updated)
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  async function handleOpen() {
    if (!product) return
    setPanelOpen(true)
    if (!analysis && !loading) {
      await runAnalysis(product)
    }
  }

  function handleRefresh() {
    if (product) runAnalysis(product, true)
  }

  if (!product) return null

  return (
    <div id="productsense-root">
      <FloatingButton
        onClick={handleOpen}
        loading={loading && !panelOpen}
        score={analysis?.scores.buyScore}
      />
      {panelOpen && (
        <AnalysisPanel
          product={product}
          analysis={analysis}
          loading={loading}
          error={error}
          preferences={preferences}
          onClose={() => setPanelOpen(false)}
          onRefresh={handleRefresh}
          onPreferencesSave={setPreferences}
        />
      )}
    </div>
  )
}

export default ProductSenseOverlay
