import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class NykaaExtractor extends BaseExtractor {
  readonly site = "nykaa" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id = url.match(/\/p\/(\d+)/)?.[1] ?? url.match(/\/(\d+)(?:\/|$)/)?.[1]
    if (!id) return null

    const name =
      this.getText("h1.css-1gc4x7i") ??
      this.getText("h1[class*='title']") ??
      this.getText("span[class*='product-title']")

    if (!name) return null

    const priceText =
      this.getText("span.css-1jczs19") ??
      this.getText("span[class*='price']") ??
      this.getText(".price-box .price")

    const originalPriceText =
      this.getText("span.css-wc3yql") ??
      this.getText("span[class*='mrp']")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("div.css-1qbvrn2") ??
        document.querySelector("[class*='rating']")?.textContent
    )

    const reviewCount = this.parseReviewCount(
      this.getText("span.css-1qbvrn2 + span") ??
        this.getText("[class*='review-count']")
    )

    const brand =
      this.getText("a.css-1h2t8mc") ??
      this.getText("a[class*='brand']")

    const description = this.getAllText("div.css-1hx3im8, div.description").join(" ")

    const images = Array.from(
      document.querySelectorAll("img.css-11uauvz, img[class*='product-image']")
    )
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs: { key: string; value: string }[] = []
    document.querySelectorAll("div.css-1k7n2w2 div, table tr").forEach((row) => {
      const children = row.querySelectorAll("div, td")
      if (children.length >= 2) {
        specs.push({
          key: children[0].textContent?.trim() ?? "",
          value: children[1].textContent?.trim() ?? ""
        })
      }
    })

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
      category: "Beauty & Personal Care",
      description: description.slice(0, 2000),
      specifications: specs.filter((s) => s.key),
      images,
      reviews: []
    })
  }
}
