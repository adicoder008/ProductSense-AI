import type {
  ExtractedProduct,
  ProductReview,
  ProductSpecification,
  SupportedSite
} from "@productsense/shared"
import { detectSite, getSiteCurrency, isProductPage } from "@productsense/shared"

export abstract class BaseExtractor {
  abstract readonly site: SupportedSite

  canHandle(url: string): boolean {
    const site = detectSite(url)
    return site === this.site && isProductPage(url, site)
  }

  abstract extract(document: Document, url: string): ExtractedProduct | null

  protected parsePrice(text: string | null | undefined): number {
    if (!text) return 0
    const cleaned = text.replace(/[₹$,\s]/g, "").replace(/[^\d.]/g, "")
    return parseFloat(cleaned) || 0
  }

  protected parseRating(text: string | null | undefined): number | undefined {
    if (!text) return undefined
    const match = text.match(/(\d+\.?\d*)/)
    return match ? parseFloat(match[1]) : undefined
  }

  protected parseReviewCount(text: string | null | undefined): number | undefined {
    if (!text) return undefined
    const cleaned = text.replace(/,/g, "")
    const match = cleaned.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : undefined
  }

  protected getText(selector: string, root: Document | Element = document): string | undefined {
    const el = root.querySelector(selector)
    return el?.textContent?.trim() || undefined
  }

  protected getAttr(selector: string, attr: string, root: Document | Element = document): string | undefined {
    const el = root.querySelector(selector)
    return el?.getAttribute(attr) || undefined
  }

  protected getAllText(selector: string, root: Document | Element = document): string[] {
    return Array.from(root.querySelectorAll(selector))
      .map((el) => el.textContent?.trim())
      .filter((t): t is string => !!t)
  }

  protected buildProduct(
    partial: Omit<ExtractedProduct, "site" | "currency" | "extractedAt">
  ): ExtractedProduct {
    return {
      ...partial,
      site: this.site,
      currency: getSiteCurrency(this.site),
      extractedAt: new Date().toISOString()
    }
  }

  protected extractSpecsFromTable(
    tableSelector: string,
    root: Document | Element = document
  ): ProductSpecification[] {
    const specs: ProductSpecification[] = []
    const rows = root.querySelectorAll(`${tableSelector} tr`)
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th")
      if (cells.length >= 2) {
        specs.push({
          key: cells[0].textContent?.trim() ?? "",
          value: cells[1].textContent?.trim() ?? ""
        })
      }
    })
    return specs.filter((s) => s.key && s.value)
  }

  protected extractReviewsGeneric(
    reviewSelector: string,
    bodySelector: string,
    root: Document | Element = document,
    limit = 20
  ): ProductReview[] {
    const reviews: ProductReview[] = []
    const elements = root.querySelectorAll(reviewSelector)
    elements.forEach((el, i) => {
      if (i >= limit) return
      const body =
        el.querySelector(bodySelector)?.textContent?.trim() ??
        el.textContent?.trim() ??
        ""
      if (body.length > 10) {
        reviews.push({ body: body.slice(0, 500) })
      }
    })
    return reviews
  }
}
