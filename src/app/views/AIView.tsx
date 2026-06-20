import { useState, useRef, useEffect } from "react"
import { motion } from "motion/react"
import { Bot, User, Send } from "lucide-react"
import { supabase } from "../supabaseClient"
import { AI_SUGGESTIONS } from "../mockData"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export function AIView() {
  const [books, setBooks] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load books from Supabase for context
  useEffect(() => {
    supabase.from("books").select("title, author, shelf, progress, status, pages").then(({ data }) => {
      if (data) {
        setBooks(data)
        setMessages([{
          id: 1,
          role: "assistant",
          content: `Welcome to Nexus AI. I have access to your library of ${data.length} book${data.length !== 1 ? "s" : ""}. What would you like to explore today?`,
          timestamp: now(),
        }])
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  async function handleSend(text?: string) {
    const msg = text || input.trim()
    if (!msg || isTyping) return
    setInput("")

    const userMsg: Message = { id: Date.now(), role: "user", content: msg, timestamp: now() }
    setMessages(m => [...m, userMsg])
    setIsTyping(true)

    // Build conversation history for the API (exclude the welcome message)
    const history = [...messages.slice(1), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    const libraryContext = books.length > 0
      ? `The user's library contains ${books.length} books:\n` +
        books.map(b => `- "${b.title}" by ${b.author} (${b.shelf}, ${b.progress}% read, ${b.status})`).join("\n")
      : "The user has no books in their library yet."

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are Nexus AI, an intelligent reading assistant embedded in a personal digital library app called Nexus. You help users explore their reading, find connections between books, generate insights, and suggest what to read next.

${libraryContext}

Keep responses concise and insightful. Use markdown bold (**text**) sparingly for emphasis. Don't use bullet points excessively — prefer flowing prose when possible.`,
          messages: history,
        }),
      })

      const data = await response.json()
      const content = data.content?.map((b: any) => b.text || "").join("") || "Sorry, I couldn't generate a response."

      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: "assistant",
        content,
        timestamp: now(),
      }])
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Something went wrong connecting to Nexus AI. Please try again.",
        timestamp: now(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "calc(100vh - 6rem)" }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Nexus AI</h1>
        <p className="text-sm text-white/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {books.length} book{books.length !== 1 ? "s" : ""} indexed · Second Brain active
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(45,140,255,0.2) transparent" }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{
                background: msg.role === "assistant" ? "rgba(45,140,255,0.15)" : "rgba(90,169,255,0.1)",
                border: `1px solid ${msg.role === "assistant" ? "rgba(45,140,255,0.3)" : "rgba(90,169,255,0.2)"}`,
              }}
            >
              {msg.role === "assistant" ? <Bot size={14} color="#2D8CFF" /> : <User size={14} color="#5AA9FF" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === "assistant" ? "rgba(17,24,39,0.8)" : "rgba(45,140,255,0.15)",
                  border: `1px solid ${msg.role === "assistant" ? "rgba(45,140,255,0.1)" : "rgba(45,140,255,0.25)"}`,
                  color: msg.role === "assistant" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)",
                  fontFamily: "'DM Sans', sans-serif",
                  borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  whiteSpace: "pre-line",
                }}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-white/25 px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{msg.timestamp}</span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(45,140,255,0.15)", border: "1px solid rgba(45,140,255,0.3)" }}>
              <Bot size={14} color="#2D8CFF" />
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: "rgba(17,24,39,0.8)", border: "1px solid rgba(45,140,255,0.1)", borderRadius: "4px 18px 18px 18px" }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#2D8CFF" }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
        {AI_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSend(s)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all hover:border-[#2D8CFF]/40 hover:text-white/80"
            style={{ background: "rgba(45,140,255,0.06)", border: "1px solid rgba(45,140,255,0.14)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask anything about your library…"
          className="w-full pr-12 pl-4 py-3.5 rounded-xl text-sm text-white/85 outline-none transition-colors"
          style={{ background: "rgba(17,24,39,0.85)", border: "1px solid rgba(45,140,255,0.18)", fontFamily: "'DM Sans', sans-serif" }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-40"
          style={{ background: input.trim() ? "#2D8CFF" : "rgba(45,140,255,0.2)" }}
        >
          <Send size={13} color="#fff" />
        </button>
      </div>
    </div>
  )
}