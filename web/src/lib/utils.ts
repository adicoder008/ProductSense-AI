import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function hashProductKey(site: string, externalId: string): string {
  return `${site}:${externalId}`
}

export function parsePrice(value: string | number): number {
  if (typeof value === "number") return value
  const cleaned = value.replace(/[^\d.]/g, "")
  return parseFloat(cleaned) || 0
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}
