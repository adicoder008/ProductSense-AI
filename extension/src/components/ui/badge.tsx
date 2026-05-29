import { cn } from "~lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "buy" | "consider" | "avoid" | "muted"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-ps-primary/20 text-ps-primary border-ps-primary/30",
    buy: "bg-ps-buy/10 text-ps-buy border-ps-buy/30",
    consider: "bg-ps-consider/10 text-ps-consider border-ps-consider/30",
    avoid: "bg-ps-avoid/10 text-ps-avoid border-ps-avoid/30",
    muted: "bg-ps-border text-ps-muted border-ps-border"
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
