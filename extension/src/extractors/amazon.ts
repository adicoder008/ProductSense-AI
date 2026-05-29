import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class AmazonExtractor extends BaseExtractor {
  readonly site = "amazon" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id =
      url.match(/\/dp\/([A-Z0-9]+)/i)?.[1] ??
      url.match(/\/gp\/product\/([A-Z0-9]+)/i)?.[1]
    if (!id) return null

    const name =
      this.getText("#productTitle") ??
      this.getText("#title") ??
      this.getText("h1#title")

    if (!name) return null

    const priceText =
      this.getText(".a-price .a-offscreen") ??
      this.getText("#priceblock_ourprice") ??
      this.getText(".a-price-whole")

    const originalPriceText =
      this.getText(".a-text-price .a-offscreen") ??
      this.getText("#listPrice")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("#acrPopover span.a-icon-alt") ??
        this.getAttr("#acrPopover", "title")
    )

    const reviewCount = this.parseReviewCount(
      this.getText("#acrCustomerReviewText")
    )

    const brand =
      this.getText("#bylineInfo")?.replace(/Visit the |Store|Brand: /gi, "").trim() ??
      this.getText("tr.po-brand td.a-span9")

    const description =
      this.getText("#productDescription p") ??
      this.getText("#feature-bullets ul")

    const images = Array.from(
      document.querySelectorAll("#altImages img, #landingImage")
    )
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs = this.extractSpecsFromTable(
      "#productDetails_techSpec_section_1 table, #prodDetails table"
    )

    const category =
      this.getText("#wayfinding-breadcrumbs_feature_div a:last-child") ??
      document
        .querySelector("#wayfinding-breadcrumbs_feature_div")
        ?.textContent?.trim()
        ?.split("›")
        .pop()
        ?.trim()

    const reviews = this.extractReviewsGeneric(
      "[data-hook='review']",
      "[data-hook='review-body'] span",
      document,
      15
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
      category,
      description,
      specifications: specs,
      images,
      reviews
    })
  }
}
