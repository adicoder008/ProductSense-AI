import { useState, useRef, useEffect } from "react"
import type { ExtractedProduct, ChatMessage, UserPreferences } from "@productsense/shared"
import { Send, Loader2 } from "lucide-react"
import { sendChatMessage } from "~lib/api-client"

interface ChatPanelProps {
  product: ExtractedProduct
  preferences?: UserPreferences
}

const SUGGESTED_QUESTIONS = [
  "Is this worth buying?",
  "What are the common complaints?",
  "Will this last 5 years?",
  "Compare with alternatives"
]

export function ChatPanel({ product, preferences }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(text: string) {
    if (!text.trim() || loading) return
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await sendChatMessage({
        sessionId,
        product,
        message: text.trim(),
        history: messages,
        preferences
      })
      setSessionId(response.sessionId)
      setMessages((prev) => [...prev, response.message])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Failed to get response. Is the API running?",
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ps-muted text-center py-4">
              Ask anything about {product.name.slice(0, 40)}...
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-ps-border text-ps-muted hover:border-ps-primary hover:text-ps-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-ps-primary text-white"
                  : "bg-ps-surface border border-ps-border text-ps-text"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-ps-muted text-xs">
            <Loader2 size={14} className="animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-ps-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about this product..."
            className="flex-1 bg-ps-bg border border-ps-border rounded-lg px-3 py-2 text-xs text-ps-text placeholder:text-ps-muted focus:outline-none focus:border-ps-primary"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-ps-primary text-white hover:bg-ps-primary-hover disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
