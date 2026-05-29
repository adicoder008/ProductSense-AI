import { Sparkles } from "lucide-react"

interface FloatingButtonProps {
  onClick: () => void
  loading?: boolean
  score?: number
}

export function FloatingButton({ onClick, loading, score }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[2147483645] flex items-center gap-2 px-4 py-3 rounded-full bg-ps-primary text-white font-medium text-sm shadow-fab hover:bg-ps-primary-hover transition-all hover:scale-105 active:scale-95"
      title="Open ProductSense AI"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Sparkles size={18} />
      )}
      <span>ProductSense</span>
      {score !== undefined && !loading && (
        <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
          {Math.round(score)}
        </span>
      )}
    </button>
  )
}
