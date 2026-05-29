import type { ExtractedProduct } from "@productsense/shared"
import { detectSite, isProductPage } from "@productsense/shared"
import type { BaseExtractor } from "./base"
import { AmazonExtractor } from "./amazon"
import { FlipkartExtractor } from "./flipkart"
import { MyntraExtractor } from "./myntra"
import { NykaaExtractor } from "./nykaa"
import { RelianceDigitalExtractor } from "./reliance-digital"
import { CromaExtractor } from "./croma"

const extractors: BaseExtractor[] = [
  new AmazonExtractor(),
  new FlipkartExtractor(),
  new MyntraExtractor(),
  new NykaaExtractor(),
  new RelianceDigitalExtractor(),
  new CromaExtractor()
]

export function getExtractorForUrl(url: string): BaseExtractor | null {
  const site = detectSite(url)
  if (!isProductPage(url, site)) return null
  return extractors.find((e) => e.canHandle(url)) ?? null
}

export function extractProduct(
  document: Document,
  url: string
): ExtractedProduct | null {
  const extractor = getExtractorForUrl(url)
  if (!extractor) return null
  try {
    return extractor.extract(document, url)
  } catch (error) {
    console.error("[ProductSense] Extraction failed:", error)
    return null
  }
}

export { extractors }
export type { BaseExtractor }
