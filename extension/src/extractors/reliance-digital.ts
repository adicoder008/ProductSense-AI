import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class RelianceDigitalExtractor extends BaseExtractor {
  readonly site = "reliance-digital" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id =
      url.match(/\/p\/([^/?]+)/)?.[1] ??
      url.match(/\/product\/([^/?]+)/)?.[1]
    if (!id) return null

    const name =
      this.getText("h1.pdp__title") ??
      this.getText("h1[class*='product-title']") ??
      this.getText("h1")

    if (!name) return null

    const priceText =
      this.getText("span.pdp__offerPrice") ??
      this.getText("[class*='selling-price']") ??
      this.getText("[class*='price']")

    const originalPriceText =
      this.getText("span.pdp__mrp") ??
      this.getText("[class*='mrp']")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("[class*='rating'] span") ??
        document.querySelector("[class*='star']")?.textContent
    )

    const reviewCount = this.parseReviewCount(
      this.getText("[class*='review-count']")
    )

    const brand = this.getText("[class*='brand']") ?? name.split(" ")[0]

    const description = this.getAllText("[class*='description'], [class*='overview']").join(" ")

    const images = Array.from(
      document.querySelectorAll("[class*='product-image'] img, .pdp__img img")
    )
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs = this.extractSpecsFromTable("table[class*='spec'], .specifications table")

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
