import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class CromaExtractor extends BaseExtractor {
  readonly site = "croma" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id =
      url.match(/\/p\/([^/?]+)/)?.[1] ??
      url.split("/").filter((s) => s.length > 3).pop()
    if (!id) return null

    const name =
      this.getText("h1.pdp-product-name") ??
      this.getText("h1[class*='product-name']") ??
      this.getText("h1")

    if (!name) return null

    const priceText =
      this.getText("span.amount") ??
      this.getText("[class*='new-price']") ??
      this.getText("[class*='selling-price']")

    const originalPriceText =
      this.getText("span.old-price") ??
      this.getText("[class*='old-price']")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("[class*='rating-number']") ??
        this.getText(".bv_avgRating_component_container")
    )

    const reviewCount = this.parseReviewCount(
      this.getText("[class*='review-count']") ??
        this.getText(".bv_numReviews_text")
    )

    const brand =
      this.getText("[class*='brand-name']") ??
      this.getText("a.brand-link")

    const description = this.getAllText("[class*='product-description'], #product-details").join(" ")

    const images = Array.from(
      document.querySelectorAll(".product-image img, [class*='gallery'] img")
    )
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs = this.extractSpecsFromTable(
      "#specifications table, [class*='specification'] table"
    )

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
      category: "Electronics",
      description: description.slice(0, 2000),
      specifications: specs,
      images,
      reviews: []
    })
  }
}
