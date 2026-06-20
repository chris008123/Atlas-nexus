import { useState, useEffect } from "react"
import { BookOpen, ChevronRight, Play, Sparkles, ArrowRight, Library, Check, Zap } from "lucide-react"
import { GlassCard, StatCard, BookCover, ProgressBar } from "../components/Shared"
import { AI_SUGGESTIONS } from "../mockData"
import { supabase } from "../supabaseClient"
import type { Book } from "../mockData"
import type { View } from "../types"

export function HomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    supabase.from("books").select("*").then(({ data }) => {
      if (data) setBooks(data)
    })
  }, [])

  const inProgress = books.filter(b => b.status === "reading")
  const completed = books.filter(b => b.status === "completed")

  // Most highlighted books as "recent highlights" — fall back to placeholders if no books yet
  const highlightBooks = [...books].sort((a, b) => (b.highlights ?? 0) - (a.highlights ?? 0)).slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden p-8" style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A0F1F 100%)",
        border: "1px solid rgba(45,140,255,0.2)",
      }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(45,140,255,0.08)" }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(90,169,255,0.05)" }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,140,255,1) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            <span className="text-xs text-white/40 font-medium tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Knowledge OS · Active
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1.5" style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "-0.5px" }}>
            {greeting}, Chris.
          </h1>
          <p className="text-white/50 text-base mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {books.length > 0
              ? `You have ${inProgress.length} book${inProgress.length !== 1 ? "s" : ""} in progress. Knowledge compounds every day.`
              : "Your library is ready. Start by adding your first book."}
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => onNavigate("library")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
            >
              <BookOpen size={15} /> Open Library
            </button>
            <button
              onClick={() => onNavigate("ai")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:border-[#5AA9FF]/40"
              style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}
            >
              <Sparkles size={15} /> Ask Nexus AI
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Library Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Books" value={books.length} icon={Library} color="#2D8CFF" subtitle={`Across your shelves`} />
          <StatCard label="In Progress" value={inProgress.length} icon={BookOpen} color="#F59E0B" subtitle="Currently reading" />
          <StatCard label="Completed" value={completed.length} icon={Check} color="#22C55E" subtitle="Finished titles" />
          <StatCard label="Completion" value={`${books.length > 0 ? Math.round((completed.length / books.length) * 100) : 0}%`} icon={Zap} color="#A855F7" subtitle="Of your library" />
        </div>
      </div>

      {/* Continue Reading */}
      {inProgress.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Continue Reading
            </h2>
            <button onClick={() => onNavigate("library")} className="text-xs flex items-center gap-1 hover:text-white/80 transition-colors" style={{ color: "#2D8CFF" }}>
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {inProgress.map((book) => (
              <GlassCard key={book.id} className="flex-shrink-0 w-52 p-4">
                <div className="flex gap-3 mb-3">
                  <BookCover book={book} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                      {book.title}
                    </p>
                    <p className="text-xs text-white/40">{book.author}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>{book.progress}% complete</span>
                    <span>{book.timeSpent}</span>
                  </div>
                  <ProgressBar value={book.progress} color={book.color} />
                </div>
                <button
                  onClick={() => onNavigate("library")}
                  className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                  style={{ background: `${book.color}18`, border: `1px solid ${book.color}30`, color: book.color, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Play size={10} fill="currentColor" /> Continue
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Recent Highlights & AI suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Most Highlighted
          </h2>
          <div className="space-y-2">
            {highlightBooks.length > 0 ? highlightBooks.map((book) => (
              <GlassCard key={book.id} className="p-3.5">
                <div className="flex gap-2.5 items-center">
                  <div className="w-0.5 self-stretch rounded-full flex-shrink-0" style={{ background: book.color, minHeight: "2rem" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/85 leading-snug mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                      {book.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${book.color}18`, color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
                        {book.highlights ?? 0} highlights
                      </span>
                      <span className="text-[10px] text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )) : (
              <GlassCard className="p-3.5">
                <p className="text-sm text-white/30 text-center py-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Add books to see your highlights here.
                </p>
              </GlassCard>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Nexus AI Suggestions
          </h2>
          <div className="space-y-2">
            {AI_SUGGESTIONS.slice(0, 4).map((s, i) => (
              <GlassCard key={i} className="p-3.5 cursor-pointer" onClick={() => onNavigate("ai")}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(45,140,255,0.1)", border: "1px solid rgba(45,140,255,0.2)" }}>
                    <Sparkles size={13} color="#2D8CFF" />
                  </div>
                  <p className="text-sm text-white/75 flex-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s}</p>
                  <ArrowRight size={13} className="text-white/20 flex-shrink-0" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}