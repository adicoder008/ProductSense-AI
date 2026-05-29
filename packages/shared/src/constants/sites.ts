import type { SupportedSite } from "../types/product"

export interface SiteConfig {
  id: SupportedSite
  name: string
  domains: string[]
  currency: string
  productUrlPatterns: RegExp[]
}

export const SUPPORTED_SITES: SiteConfig[] = [
  {
    id: "amazon",
    name: "Amazon",
    domains: ["amazon.in", "amazon.com", "www.amazon.in", "www.amazon.com"],
    currency: "INR",
    productUrlPatterns: [/\/dp\/[A-Z0-9]+/, /\/gp\/product\/[A-Z0-9]+/]
  },
  {
    id: "flipkart",
    name: "Flipkart",
    domains: ["flipkart.com", "www.flipkart.com"],
    currency: "INR",
    productUrlPatterns: [/\/p\/itm[a-z0-9]+/, /\/[^/]+\/p\/itm[a-z0-9]+/i]
  },
  {
    id: "myntra",
    name: "Myntra",
    domains: ["myntra.com", "www.myntra.com"],
    currency: "INR",
    productUrlPatterns: [/\/[^/]+\/buy/, /\/[^/]+\/p\/\d+/]
  },
  {
    id: "nykaa",
    name: "Nykaa",
    domains: ["nykaa.com", "www.nykaa.com"],
    currency: "INR",
    productUrlPatterns: [/\/p\/\d+/, /\/[^/]+\/p\/\d+/]
  },
  {
    id: "reliance-digital",
    name: "Reliance Digital",
    domains: ["reliancedigital.in", "www.reliancedigital.in"],
    currency: "INR",
    productUrlPatterns: [/\/p\/[^/]+/, /\/product\/[^/]+/]
  },
  {
    id: "croma",
    name: "Croma",
    domains: ["croma.com", "www.croma.com"],
    currency: "INR",
    productUrlPatterns: [/\/p\/[^/]+/, /\/[^/]+\/p\/[^/]+/]
  }
]

export function detectSite(url: string): SupportedSite {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    const site = SUPPORTED_SITES.find((s) =>
      s.domains.some((d) => d.replace(/^www\./, "") === hostname)
    )
    return site?.id ?? "unknown"
  } catch {
    return "unknown"
  }
}

export function isProductPage(url: string, site: SupportedSite): boolean {
  if (site === "unknown") return false
  const config = SUPPORTED_SITES.find((s) => s.id === site)
  if (!config) return false
  return config.productUrlPatterns.some((pattern) => pattern.test(url))
}

export function getSiteCurrency(site: SupportedSite): string {
  const config = SUPPORTED_SITES.find((s) => s.id === site)
  return config?.currency ?? "INR"
}
