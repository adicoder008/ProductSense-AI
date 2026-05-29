import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatScore(score: number): string {
  return Math.round(score).toString()
}

export function getRecommendationColor(
  rec: "BUY" | "CONSIDER" | "AVOID"
): string {
  switch (rec) {
    case "BUY":
      return "text-ps-buy"
    case "CONSIDER":
      return "text-ps-consider"
    case "AVOID":
      return "text-ps-avoid"
  }
}

export function getRecommendationBg(
  rec: "BUY" | "CONSIDER" | "AVOID"
): string {
  switch (rec) {
    case "BUY":
      return "bg-ps-buy/10 border-ps-buy/30"
    case "CONSIDER":
      return "bg-ps-consider/10 border-ps-consider/30"
    case "AVOID":
      return "bg-ps-avoid/10 border-ps-avoid/30"
  }
}
