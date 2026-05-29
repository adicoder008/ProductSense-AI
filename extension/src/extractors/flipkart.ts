import type { ExtractedProduct } from "@productsense/shared"
import { BaseExtractor } from "./base"

export class FlipkartExtractor extends BaseExtractor {
  readonly site = "flipkart" as const

  extract(document: Document, url: string): ExtractedProduct | null {
    const id = url.match(/pid=([^\&]+)/i)?.[1] ?? url.match(/\/p\/itm[a-z0-9]+/i)?.[0]?.split("/").pop()
    if (!id) return null

    const name =
      this.getText("span.B_NuCI") ??
      this.getText("h1.yhB1nd") ??
      this.getText("h1 span")

    if (!name) return null

    const priceText =
      this.getText("div._30jeq3._16Jk6d") ??
      this.getText("div._30jeq3") ??
      this.getText("[class*='price']")

    const originalPriceText =
      this.getText("div._3I9_wc._2p6lqe") ??
      this.getText("div._3I9_wc")

    const price = this.parsePrice(priceText)
    const originalPrice = this.parsePrice(originalPriceText) || undefined
    const discount =
      originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined

    const rating = this.parseRating(
      this.getText("div._3LWZlK") ?? this.getText("div[class*='rating']")
    )

    const reviewCount = this.parseReviewCount(
      this.getText("span._2_R_DZ span") ?? this.getText("span._13vcmD")
    )

    const brand = name.split(" ")[0]

    const description = this.getAllText("div._1mXcCf, div._2418kt").join(" ")

    const images = Array.from(document.querySelectorAll("img._396cs4, img.q6DClP"))
      .map((img) => img.getAttribute("src"))
      .filter((src): src is string => !!src)
      .slice(0, 5)

    const specs: { key: string; value: string }[] = []
    document.querySelectorAll("table._14cfVK tr, div._8x0f2a tr").forEach((row) => {
      const cells = row.querySelectorAll("td, li")
      if (cells.length >= 2) {
        specs.push({
          key: cells[0].textContent?.trim() ?? "",
          value: cells[1].textContent?.trim() ?? ""
        })
      }
    })

    const category = this.getText("a._2whKao:last-child")

    const reviews = this.extractReviewsGeneric(
      "div._27M-vq, div.col",
      "div.t-ZTKy, div",
      document,
      10
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
      description: description.slice(0, 2000),
      specifications: specs.filter((s) => s.key),
      images,
      reviews
    })
  }
}
