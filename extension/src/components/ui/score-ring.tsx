import { cn } from "~lib/utils"

interface ScoreRingProps {
  score: number
  label: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ScoreRing({ score, label, size = "md", className }: ScoreRingProps) {
  const radius = size === "sm" ? 28 : size === "lg" ? 44 : 36
  const stroke = size === "sm" ? 4 : 5
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const dimension = (radius + stroke) * 2

  const color =
    score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={dimension} height={dimension} className="-rotate-90">
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="#1e1e2e"
          strokeWidth={stroke}
        />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        <span className="text-lg font-bold text-ps-text">{Math.round(score)}</span>
      </div>
      <span className="text-xs text-ps-muted">{label}</span>
    </div>
  )
}
