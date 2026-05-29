import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class MyntraExtractor extends BaseExtractor {
  readonly site = "myntra" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id =
      url.match(/\/(\d+)\/buy/)?.[1] ??
      url.match(/\/p\/(\d+)/)?.[1] ??
      url.split("/").filter(Boolean).pop()

    const name =
      this.getText("h1.pdp-title") ??
      this.getText("h1[class*='title']") ??
      this.getText("span.pdp-name")

    if (!name || !id) return null

    const priceText =
      this.getText("span.pdp-price strong") ??
      this.getText("span.pdp-discount-container strong") ??
      this.getText("[class*='price'] strong")

    const originalPriceText =
      this.getText("span.pdp-mrp") ??
      this.getText("s.pdp-mrp")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("div.index-ratingsCount") ??
        document.querySelector("[class*='rating']")?.textContent
    )

    const reviewCount = this.parseReviewCount(
      this.getText("div.index-ratingsCount")
    )

    const brand =
      this.getText("h1.pdp-title")?.split(" ")[0] ??
      this.getText("a.pdp-brand-name")

    const description = this.getAllText("div.pdp-product-description-content, div.pdp-description").join(" ")

    const images = Array.from(
      document.querySelectorAll("img.image-grid-image, img[class*='product']")
    )
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs: { key: string; value: string }[] = []
    document.querySelectorAll("div.index-tableRow, div.pdp-productDescriptorsContainer li").forEach((row) => {
      const key = row.querySelector("td, b, span:first-child")?.textContent?.trim()
      const value = row.querySelector("td:last-child, span:last-child")?.textContent?.trim()
      if (key && value && key !== value) {
        specs.push({ key, value })
      }
    })

    const category = this.getText("a.breadcrumbs-link:last-child")

    return this.buildProduct({
      id,
      url,
      name,
      brand,
      price: price || 0,
      originalPrice,
      discount,
      rating,
      reviewCount,
      category,
      description: description.slice(0, 2000),
      specifications: specs,
      images,
      reviews: []
    })
  }
}
