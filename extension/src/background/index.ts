import type { ExtractedProduct } from "@productsense/shared"

export {}

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ProductSense AI] Extension installed")
  chrome.storage.local.set({
    preferences: { currency: "INR", priorities: [] },
    apiUrl: process.env.PLASMO_PUBLIC_API_URL ?? "http://localhost:3000"
  })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PRODUCT") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) {
        sendResponse({ product: null })
        return
      }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Inline extraction signal — content script handles full extraction
            return { url: window.location.href }
          }
        })
        sendResponse({ url: results[0]?.result?.url })
      } catch {
        sendResponse({ product: null })
      }
    })
    return true
  }

  if (message.type === "CACHE_ANALYSIS") {
    const { productId, analysis } = message as {
      productId: string
      analysis: unknown
    }
    chrome.storage.local.set({
      [`analysis:${productId}`]: {
        analysis,
        cachedAt: Date.now()
      }
    })
    sendResponse({ success: true })
    return true
  }

  if (message.type === "GET_CACHED_ANALYSIS") {
    const { productId } = message as { productId: string }
    chrome.storage.local.get(`analysis:${productId}`, (result) => {
      sendResponse(result[`analysis:${productId}`] ?? null)
    })
    return true
  }
})

// Badge update when analysis completes
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ANALYSIS_COMPLETE") {
    const { recommendation } = message as {
      recommendation: string
      product: ExtractedProduct
    }
    const colors: Record<string, string> = {
      BUY: "#10b981",
      CONSIDER: "#f59e0b",
      AVOID: "#ef4444"
    }
    chrome.action.setBadgeText({ text: recommendation[0] })
    chrome.action.setBadgeBackgroundColor({
      color: colors[recommendation] ?? "#8b5cf6"
    })
  }
})
