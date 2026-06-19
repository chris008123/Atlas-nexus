import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Home, BookOpen, Brain, Network, BarChart2,
  Layers, Search, Bell, Settings, ChevronRight,
  MessageSquare, Clock, Star, TrendingUp,
  Plus, Sparkles, Send, BookMarked, Highlighter,
  User, Menu, X, Play, RotateCcw,
  Check, ArrowRight, Bot, Zap, Filter,
  ChevronDown, Library, Compass, FlipHorizontal, Sun, Moon
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
  PieChart, Pie, Cell
} from "recharts"


// Add this right after your imports, before the BOOKS data:
const LIGHT_THEME = `
  :root {
    --bg: #F0F2F8;
    --bg2: #FFFFFF;
    --bg3: #E8ECF5;
    --border: rgba(30,80,180,0.14);
    --text: #0D1525;
    --text2: rgba(13,21,37,0.6);
    --text3: rgba(13,21,37,0.38);
    --sidebar-bg: linear-gradient(180deg, #FAFBFF 0%, #F0F3FC 100%);
    --card-bg: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(244,247,255,0.92) 100%);
    --input-bg: rgba(220,228,250,0.55);
    --header-border: rgba(30,80,180,0.09);
  }
`

const DARK_THEME = `
  :root {
    --bg: #050816;
    --bg2: #0A0F1F;
    --bg3: #111827;
    --border: rgba(45,140,255,0.12);
    --text: #FFFFFF;
    --text2: rgba(255,255,255,0.6);
    --text3: rgba(255,255,255,0.3);
    --sidebar-bg: linear-gradient(180deg, #0A0F1F 0%, #050816 100%);
    --card-bg: linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(10,15,31,0.6) 100%);
    --input-bg: rgba(17,24,39,0.7);
    --header-border: rgba(45,140,255,0.08);
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const BOOKS = [
  { id: 1, title: "Atomic Habits", author: "James Clear", shelf: "Psychology", progress: 78, color: "#4A90D9", status: "reading", pages: 320, highlights: 34, notes: 12, timeSpent: "6h 42m" },
  { id: 2, title: "The Art of War", author: "Sun Tzu", shelf: "Strategy", progress: 100, color: "#E5534B", status: "completed", pages: 272, highlights: 18, notes: 7, timeSpent: "3h 14m" },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", shelf: "Programming", progress: 45, color: "#57B77E", status: "reading", pages: 431, highlights: 22, notes: 9, timeSpent: "4h 20m" },
  { id: 4, title: "48 Laws of Power", author: "Robert Greene", shelf: "Strategy", progress: 100, color: "#9B59B6", status: "completed", pages: 452, highlights: 61, notes: 24, timeSpent: "11h 8m" },
  { id: 5, title: "Mastery", author: "Robert Greene", shelf: "Psychology", progress: 22, color: "#F39C12", status: "reading", pages: 352, highlights: 8, notes: 3, timeSpent: "2h 5m" },
  { id: 6, title: "Deep Work", author: "Cal Newport", shelf: "Psychology", progress: 100, color: "#1ABC9C", status: "completed", pages: 296, highlights: 29, notes: 11, timeSpent: "5h 50m" },
  { id: 7, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", shelf: "Psychology", progress: 65, color: "#3498DB", status: "reading", pages: 499, highlights: 47, notes: 18, timeSpent: "9h 12m" },
  { id: 8, title: "The Lean Startup", author: "Eric Ries", shelf: "Business", progress: 89, color: "#E74C3C", status: "reading", pages: 336, highlights: 31, notes: 14, timeSpent: "7h 30m" },
  { id: 9, title: "Zero to One", author: "Peter Thiel", shelf: "Business", progress: 100, color: "#2ECC71", status: "completed", pages: 224, highlights: 43, notes: 20, timeSpent: "4h 22m" },
  { id: 10, title: "Influence", author: "Robert Cialdini", shelf: "Psychology", progress: 33, color: "#F1C40F", status: "reading", pages: 368, highlights: 14, notes: 5, timeSpent: "3h 5m" },
  { id: 11, title: "The Pragmatic Programmer", author: "Hunt & Thomas", shelf: "Programming", progress: 15, color: "#9B59B6", status: "reading", pages: 352, highlights: 6, notes: 2, timeSpent: "1h 48m" },
  { id: 12, title: "Superintelligence", author: "Nick Bostrom", shelf: "AI", progress: 55, color: "#2D8CFF", status: "reading", pages: 390, highlights: 28, notes: 10, timeSpent: "5h 15m" },
  { id: 13, title: "The Innovator's Dilemma", author: "Clayton Christensen", shelf: "Business", progress: 72, color: "#FF6B6B", status: "reading", pages: 288, highlights: 19, notes: 8, timeSpent: "4h 45m" },
  { id: 14, title: "Human Compatible", author: "Stuart Russell", shelf: "AI", progress: 38, color: "#4ECDC4", status: "reading", pages: 352, highlights: 16, notes: 6, timeSpent: "3h 20m" },
]

const SHELVES = ["All", "Psychology", "Strategy", "Programming", "Business", "AI"]

const READING_DATA = [
  { day: "Mon", pages: 42, minutes: 35 },
  { day: "Tue", pages: 28, minutes: 22 },
  { day: "Wed", pages: 65, minutes: 54 },
  { day: "Thu", pages: 18, minutes: 14 },
  { day: "Fri", pages: 84, minutes: 72 },
  { day: "Sat", pages: 120, minutes: 98 },
  { day: "Sun", pages: 95, minutes: 82 },
]

const CATEGORY_DATA = [
  { name: "Psychology", value: 6, fill: "#4A90D9" },
  { name: "Strategy", value: 2, fill: "#E5534B" },
  { name: "Programming", value: 2, fill: "#57B77E" },
  { name: "Business", value: 3, fill: "#F39C12" },
  { name: "AI", value: 2, fill: "#2D8CFF" },
]

const GRAPH_NODES = [
  { id: "atomic", label: "Atomic Habits", x: 220, y: 160, color: "#4A90D9", type: "book", size: 44 },
  { id: "influence", label: "Influence", x: 420, y: 110, color: "#F1C40F", type: "book", size: 40 },
  { id: "48laws", label: "48 Laws of Power", x: 590, y: 170, color: "#9B59B6", type: "book", size: 44 },
  { id: "deepwork", label: "Deep Work", x: 160, y: 320, color: "#1ABC9C", type: "book", size: 40 },
  { id: "mastery", label: "Mastery", x: 380, y: 290, color: "#F39C12", type: "book", size: 40 },
  { id: "artofwar", label: "The Art of War", x: 620, y: 330, color: "#E5534B", type: "book", size: 40 },
  { id: "zerotoone", label: "Zero to One", x: 470, y: 430, color: "#2ECC71", type: "book", size: 36 },
  { id: "super", label: "Superintelligence", x: 280, y: 430, color: "#2D8CFF", type: "book", size: 36 },
  { id: "habit", label: "Habit Formation", x: 310, y: 200, color: "#5AA9FF", type: "concept", size: 28 },
  { id: "power", label: "Power & Influence", x: 510, y: 230, color: "#C084FC", type: "concept", size: 28 },
  { id: "focus", label: "Deep Focus", x: 240, y: 370, color: "#34D399", type: "concept", size: 26 },
  { id: "strategy", label: "Strategy", x: 580, y: 430, color: "#FCA5A5", type: "concept", size: 26 },
]

const GRAPH_EDGES = [
  { from: "atomic", to: "habit" },
  { from: "influence", to: "habit" },
  { from: "influence", to: "power" },
  { from: "48laws", to: "power" },
  { from: "mastery", to: "power" },
  { from: "mastery", to: "habit" },
  { from: "deepwork", to: "focus" },
  { from: "atomic", to: "focus" },
  { from: "artofwar", to: "strategy" },
  { from: "48laws", to: "strategy" },
  { from: "zerotoone", to: "strategy" },
  { from: "super", to: "focus" },
  { from: "deepwork", to: "mastery" },
  { from: "influence", to: "48laws" },
]

const FLASHCARDS = [
  { id: 1, front: "What is the 4th Law of Behavior Change?", back: "Make it satisfying. We are more likely to repeat a behavior when the experience is satisfying — the final reward must align with the habit identity.", book: "Atomic Habits", difficulty: "medium" },
  { id: 2, front: "Define the Halo Effect", back: "Our overall impression of a person influences how we feel and think about their character. If someone is well-dressed, we assume they are also intelligent and competent.", book: "Thinking, Fast and Slow", difficulty: "easy" },
  { id: 3, front: "What is a Minimum Viable Product (MVP)?", back: "The version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort.", book: "The Lean Startup", difficulty: "easy" },
  { id: 4, front: "Name the 3 stages of the Habit Loop", back: "Cue → Routine → Reward. The cue triggers a craving, the routine satisfies it, and the reward teaches the brain to repeat the loop.", book: "Atomic Habits", difficulty: "easy" },
  { id: 5, front: "What is 'Deep Work' as defined by Cal Newport?", back: "Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit, creating new value and improving your skill.", book: "Deep Work", difficulty: "medium" },
]

const AI_MESSAGES_INIT = [
  {
    id: 1, role: "assistant",
    content: "Welcome to Nexus AI. I have indexed all 247 books across your library. What would you like to explore today?",
    timestamp: "9:41 AM"
  },
  {
    id: 2, role: "user",
    content: "What are the key themes in Atomic Habits?",
    timestamp: "9:42 AM"
  },
  {
    id: 3, role: "assistant",
    content: "Based on your 34 highlights and my full analysis of Atomic Habits, the four core themes are:\n\n**1. Identity-Based Habits** — You don't rise to the level of your goals, you fall to the level of your systems. Every habit vote casts is a vote for the person you want to become.\n\n**2. The Four Laws of Behavior Change** — Make it obvious, attractive, easy, and satisfying.\n\n**3. Compound Effects** — A 1% improvement every day results in 37× improvement over a year. Small habits don't add up — they compound.\n\n**4. Environment Design** — Your environment shapes your behavior more than motivation or willpower ever will.\n\nYou've highlighted 34 passages across these themes. Want me to generate flashcards from your highlights?",
    timestamp: "9:42 AM"
  },
]

const AI_SUGGESTIONS = [
  "Summarize my last 3 completed books",
  "Find contradictions across my library",
  "Generate a reading roadmap for leadership",
  "What concepts appear in 3+ books?",
  "Create a study guide for this week",
]

type View = "home" | "library" | "ai" | "graph" | "learning" | "flashcards"

// ─── Sub-components ───────────────────────────────────────────────────────────

function BookCover({ book, className = "", size = "md" }: { book: typeof BOOKS[0], className?: string, size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-12 h-16" : size === "lg" ? "w-28 h-40" : "w-20 h-28"
  return (
    <div
      className={`${dims} ${className} rounded flex-shrink-0 relative overflow-hidden`}
      style={{
        background: `linear-gradient(155deg, ${book.color}28 0%, ${book.color}55 60%, ${book.color}22 100%)`,
        borderLeft: `3px solid ${book.color}`,
        boxShadow: `0 4px 20px ${book.color}22`
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(circle at 80% 20%, ${book.color} 0%, transparent 60%)` }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-1.5">
        <p className="text-[9px] font-bold leading-tight text-white line-clamp-3" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
          {book.title}
        </p>
        <p className="text-[7px] text-white/50 mt-0.5 truncate">{book.author}</p>
      </div>
      {book.status === "completed" && (
        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "#22C55E22", border: "1px solid #22C55E66" }}>
          <Check size={8} color="#22C55E" />
        </div>
      )}
    </div>
  )
}

function ProgressBar({ value, color }: { value: number, color: string }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
      />
    </div>
  )
}

function GlassCard({ children, className = "", hover = true, onClick }: {
  children: React.ReactNode, className?: string, hover?: boolean, onClick?: () => void
}) {
  return (
    <motion.div
      className={`rounded-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: "linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(10,15,31,0.6) 100%)",
        border: "1px solid rgba(45,140,255,0.12)",
        backdropFilter: "blur(12px)",
      }}
      whileHover={hover ? { borderColor: "rgba(45,140,255,0.3)", y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

function StatCard({ label, value, icon: Icon, color, subtitle }: {
  label: string, value: string | number, icon: React.FC<any>, color: string, subtitle?: string
}) {
  return (
    <GlassCard className="p-4 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} color={color} />
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color, fontFamily: "'JetBrains Mono', monospace" }}>
          LIVE
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
      <p className="text-xs text-white/60 font-medium">{label}</p>
      {subtitle && <p className="text-[10px] mt-1" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</p>}
    </GlassCard>
  )
}

// ─── Views ───────────────────────────────────────────────────────────────────

function HomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const inProgress = BOOKS.filter(b => b.status === "reading")
  const completed = BOOKS.filter(b => b.status === "completed")

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
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,140,255,1) 1px, transparent 0)", backgroundSize: "28px 28px" }}
          />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            <span className="text-xs text-white/40 font-medium tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Knowledge OS · Active
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-1.5" style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "-0.5px" }}>
            Good Evening, Chris.
          </h1>
          <p className="text-white/50 text-base mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Your library is growing. Knowledge compounds every day.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => onNavigate("library")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
            >
              <BookOpen size={15} />
              Open Library
            </button>
            <button
              onClick={() => onNavigate("ai")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:border-[#5AA9FF]/40"
              style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}
            >
              <Sparkles size={15} />
              Ask Nexus AI
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
          <StatCard label="Total Books" value="247" icon={Library} color="#2D8CFF" subtitle="+12 this month" />
          <StatCard label="In Progress" value={inProgress.length} icon={BookOpen} color="#F59E0B" subtitle="Across 4 shelves" />
          <StatCard label="Completed" value={completed.length} icon={Check} color="#22C55E" subtitle="This library" />
          <StatCard label="Day Streak" value="3" icon={Zap} color="#A855F7" subtitle="Keep it going!" />
        </div>
      </div>

      {/* Continue Reading */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Continue Reading
          </h2>
          <button onClick={() => onNavigate("library")} className="text-xs flex items-center gap-1 hover:text-white/80 transition-colors" style={{ color: "#2D8CFF" }}>
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
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
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                style={{ background: `${book.color}18`, border: `1px solid ${book.color}30`, color: book.color, fontFamily: "'DM Sans', sans-serif" }}
              >
                <Play size={10} fill="currentColor" />
                Continue
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Recent Highlights & AI suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Recent Highlights
          </h2>
          <div className="space-y-2">
            {[
              { text: "You do not rise to the level of your goals. You fall to the level of your systems.", book: "Atomic Habits", color: "#4A90D9" },
              { text: "The most effective leaders are those who can diagnose themselves accurately.", book: "Mastery", color: "#F39C12" },
              { text: "Build twice as fast, half as smart.", book: "The Lean Startup", color: "#E74C3C" },
            ].map((h, i) => (
              <GlassCard key={i} className="p-3.5">
                <div className="flex gap-2.5">
                  <div className="w-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: h.color, minHeight: "2.5rem" }} />
                  <div>
                    <p className="text-sm text-white/85 leading-relaxed mb-1.5 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      "{h.text}"
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${h.color}18`, color: h.color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {h.book}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Nexus AI Suggestions
          </h2>
          <div className="space-y-2">
            {AI_SUGGESTIONS.slice(0, 4).map((s, i) => (
              <GlassCard key={i} className="p-3.5 cursor-pointer" hover onClick={() => onNavigate("ai")}>
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

// ─── Library helpers (new — support the refined Library experience) ──────────

function parseTimeSpent(timeSpent: string): number {
  if (!timeSpent) return 0
  const h = parseInt(timeSpent.match(/(\d+)h/)?.[1] || "0", 10)
  const m = parseInt(timeSpent.match(/(\d+)m/)?.[1] || "0", 10)
  return h + m / 60
}

function formatHours(totalHours: number): number {
  return Math.round(totalHours)
}

const NEW_BOOK_COLORS = ["#2D8CFF", "#5AA9FF", "#9B59B6", "#22C55E", "#F59E0B", "#E74C3C", "#1ABC9C", "#F1C40F"]

function AIInsightCard({ icon: Icon, label, value, color }: {
  icon: React.FC<any>, label: string, value: string, color: string
}) {
  return (
    <GlassCard className="p-3.5 flex items-center gap-3" hover={false}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={14} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-white/35 uppercase tracking-wide truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
      </div>
    </GlassCard>
  )
}

function ContinueReadingFeature({ book, onOpen }: { book: typeof BOOKS[0], onOpen: (b: typeof BOOKS[0]) => void }) {
  const pagesRead = Math.round((book.progress / 100) * book.pages)
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ borderColor: `${book.color}55` }}
      className="relative rounded-2xl overflow-hidden p-5 sm:p-6 cursor-pointer"
      style={{
        background: `linear-gradient(120deg, ${book.color}14 0%, rgba(17,24,39,0.88) 55%, rgba(10,15,31,0.92) 100%)`,
        border: `1px solid ${book.color}30`,
      }}
      onClick={() => onOpen(book)}
    >
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full blur-3xl pointer-events-none" style={{ background: `${book.color}1a` }} />
      <div className="relative flex items-center gap-5">
        <BookCover book={book} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <BookMarked size={12} color={book.color} />
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
              Continue Reading
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{book.title}</h3>
          <p className="text-xs text-white/40 mb-3 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author} · Page {pagesRead} of {book.pages}</p>
          <ProgressBar value={book.progress} color={book.color} />
          <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
            <span className="text-[11px]" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>{book.progress}% complete · {book.timeSpent}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(book) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
              style={{ background: `${book.color}1f`, border: `1px solid ${book.color}40`, color: book.color, fontFamily: "'DM Sans', sans-serif" }}
            >
              <Play size={10} fill="currentColor" /> Continue Reading
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LibraryBookCard({ book, index, onOpen }: { book: typeof BOOKS[0], index: number, onOpen: (b: typeof BOOKS[0]) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.03 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <GlassCard className="p-3 cursor-pointer relative overflow-hidden" onClick={() => onOpen(book)}>
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${book.color}22 0%, transparent 70%)` }}
        />
        <div className="relative">
          <BookCover book={book} size="lg" className="mx-auto mb-3" />
          <p className="text-xs font-semibold text-white line-clamp-2 mb-0.5 leading-tight" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            {book.title}
          </p>
          <p className="text-[10px] text-white/40 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author}</p>
          <ProgressBar value={book.progress} color={book.color} />
          <div className="flex justify-between mt-1.5 text-[9px]" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
            <span>{book.progress}%</span>
            <span>{book.highlights} hl</span>
          </div>
        </div>

        {/* Hover reveal — shown without opening the modal */}
        <div
          className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(5,8,22,0.97) 38%)" }}
        >
          <div className="grid grid-cols-2 gap-1 text-[9px] mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-1 text-white/60"><Highlighter size={9} color={book.color} />{book.highlights}</div>
            <div className="flex items-center gap-1 text-white/60"><MessageSquare size={9} color={book.color} />{book.notes}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: book.color }}>
            <Play size={9} fill="currentColor" /> Continue Reading
          </div>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-white/40">
            <Sparkles size={8} /> AI Summary available
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function ShelfRow({ shelfName, books, onOpen }: { shelfName: string, books: typeof BOOKS, onOpen: (b: typeof BOOKS[0]) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{shelfName}</h3>
        <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{books.length} books</span>
      </div>
      <div
        className="relative rounded-xl p-4 pb-6"
        style={{
          background: "linear-gradient(180deg, rgba(17,24,39,0.45) 0%, rgba(17,24,39,0.12) 100%)",
          border: "1px solid rgba(45,140,255,0.07)",
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {books.map((book, i) => (
            <div key={book.id} className="flex-shrink-0 w-32">
              <LibraryBookCard book={book} index={i} onOpen={onOpen} />
            </div>
          ))}
        </div>
        {/* Glass shelf ledge */}
        <div
          className="absolute bottom-2 left-4 right-4 h-2 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(45,140,255,0.2), transparent)",
            boxShadow: "0 6px 18px rgba(45,140,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}

function EmptyLibraryState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl"
      style={{ background: "rgba(17,24,39,0.4)", border: "1px dashed rgba(45,140,255,0.18)" }}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(45,140,255,0.1)", border: "1px solid rgba(45,140,255,0.2)" }}>
        <Library size={26} color="#5AA9FF" />
      </div>
      <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>No books found</h3>
      <p className="text-white/40 text-sm max-w-xs mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Try a different search or shelf, or add a new title to start building your knowledge vault.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
      >
        <Plus size={14} /> Add Book
      </button>
    </motion.div>
  )
}

function AddBookModal({ onClose, onAdd, shelves }: {
  onClose: () => void, onAdd: (b: { title: string, author: string, shelf: string, pages: number, color: string }) => void, shelves: string[]
}) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [shelf, setShelf] = useState(shelves[0] || "Psychology")
  const [pages, setPages] = useState("")

  function handleSubmit() {
    if (!title.trim() || !author.trim()) return
    onAdd({
      title: title.trim(),
      author: author.trim(),
      shelf,
      pages: parseInt(pages, 10) || 200,
      color: NEW_BOOK_COLORS[Math.floor(Math.random() * NEW_BOOK_COLORS.length)],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,8,22,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{
          background: "linear-gradient(135deg, #111827, #0A0F1F)",
          border: "1px solid rgba(45,140,255,0.2)",
          boxShadow: "0 0 60px rgba(45,140,255,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
          onClick={onClose}
        >
          <X size={14} />
        </button>

        <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Add Book</h3>
        <p className="text-xs text-white/40 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add a new title to your digital library.</p>

        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Book title"
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none focus:border-[#2D8CFF]/40 transition-colors"
            style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
          />
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author"
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none focus:border-[#2D8CFF]/40 transition-colors"
            style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
          />
          <div className="flex gap-2">
            <select
              value={shelf}
              onChange={e => setShelf(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none focus:border-[#2D8CFF]/40 transition-colors"
              style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
            >
              {shelves.map(s => <option key={s} value={s} style={{ background: "#111827" }}>{s}</option>)}
            </select>
            <input
              value={pages}
              onChange={e => setPages(e.target.value)}
              placeholder="Pages"
              type="number"
              className="w-24 px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none focus:border-[#2D8CFF]/40 transition-colors"
              style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !author.trim()}
          className="w-full mt-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40"
          style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
        >
          Add to Library
        </button>
      </motion.div>
    </motion.div>
  )
}

function LibraryView() {
  const [libraryBooks, setLibraryBooks] = useState(BOOKS)
  const [activeShelf, setActiveShelf] = useState("All")
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const shelfNames = SHELVES.filter(s => s !== "All")

  const shelfCounts = shelfNames.reduce((acc: Record<string, number>, shelf) => {
    acc[shelf] = libraryBooks.filter(b => b.shelf === shelf).length
    return acc
  }, {})

  const totalBooks = libraryBooks.length
  const inProgressBooks = libraryBooks.filter(b => b.status === "reading")
  const completedBooks = libraryBooks.filter(b => b.status === "completed")
  const totalHours = libraryBooks.reduce((sum, b) => sum + parseTimeSpent(b.timeSpent), 0)

  const shelfFiltered = activeShelf === "All" ? libraryBooks : libraryBooks.filter(b => b.shelf === activeShelf)

  const query = searchQuery.trim().toLowerCase()
  const filtered = query
    ? shelfFiltered.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.shelf.toLowerCase().includes(query)
      )
    : shelfFiltered

  const searchSuggestions = query
    ? libraryBooks.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)).slice(0, 5)
    : []

  const continueReadingBook = [...inProgressBooks].sort((a, b) => b.progress - a.progress)[0] || null

  const mostReadShelf = Object.entries(shelfCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"

  const otherReading = inProgressBooks
    .filter(b => b.id !== continueReadingBook?.id)
    .sort((a, b) => a.progress - b.progress)
  const suggestedNext = otherReading[0] || continueReadingBook

  const completionRate = totalBooks > 0 ? Math.round((completedBooks.length / totalBooks) * 100) : 0

  function commitSearch(value: string) {
    const v = value.trim()
    if (!v) return
    setRecentSearches(prev => [v, ...prev.filter(s => s.toLowerCase() !== v.toLowerCase())].slice(0, 4))
  }

  function handleAddBook(data: { title: string, author: string, shelf: string, pages: number, color: string }) {
    const nextId = Math.max(0, ...libraryBooks.map(b => b.id)) + 1
    const newBook = {
      id: nextId,
      title: data.title,
      author: data.author,
      shelf: data.shelf,
      progress: 0,
      color: data.color,
      status: "reading" as const,
      pages: data.pages,
      highlights: 0,
      notes: 0,
      timeSpent: "0h 0m",
    }
    setLibraryBooks(prev => [newBook, ...prev])
    setShowAddModal(false)
    setActiveShelf("All")
  }

  const groupedByShelf = shelfNames
    .map(shelf => ({ shelf, books: shelfFiltered.filter(b => b.shelf === shelf) }))
    .filter(g => g.books.length > 0)

  const showShelfRows = activeShelf === "All" && !query

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Digital Library</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {totalBooks} books · {filtered.length} in this view
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(45,140,255,0.2), rgba(45,140,255,0.08))",
            border: "1px solid rgba(45,140,255,0.35)",
            color: "#5AA9FF",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 0 18px rgba(45,140,255,0.18)",
          }}
        >
          <Plus size={13} /> Add Book
        </motion.button>
      </div>

      {/* Library stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Books" value={totalBooks} icon={Library} color="#2D8CFF" subtitle={`${shelfNames.length} shelves`} />
        <StatCard label="In Progress" value={inProgressBooks.length} icon={BookOpen} color="#F59E0B" subtitle="Currently reading" />
        <StatCard label="Completed" value={completedBooks.length} icon={Check} color="#22C55E" subtitle="Finished titles" />
        <StatCard label="Reading Hours" value={`${formatHours(totalHours)}h`} icon={Clock} color="#A855F7" subtitle="All time" />
      </div>

      {/* Nexus AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={13} color="#2D8CFF" />
          <h2 className="text-xs font-semibold text-white/40 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Nexus AI Insights
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AIInsightCard icon={TrendingUp} label="Most Read Topic" value={mostReadShelf} color="#2D8CFF" />
          <AIInsightCard icon={Zap} label="Reading Streak" value="3 days" color="#F59E0B" />
          <AIInsightCard icon={Compass} label="Suggested Next" value={suggestedNext ? suggestedNext.title : "—"} color="#22C55E" />
          <AIInsightCard icon={Star} label="Knowledge Growth" value={`${completionRate}%`} color="#A855F7" />
        </div>
      </div>

      {/* Continue Reading featured card */}
      {continueReadingBook && (
        <ContinueReadingFeature book={continueReadingBook} onOpen={setSelectedBook} />
      )}

      {/* Search */}
      <div className="relative">
        <div className="relative">
          <motion.div
            animate={{ rotate: searchFocused ? -8 : 0, color: searchFocused ? "#5AA9FF" : "rgba(255,255,255,0.3)" }}
            transition={{ duration: 0.2 }}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 flex"
          >
            <Search size={15} />
          </motion.div>
          <motion.input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
            onKeyDown={e => { if (e.key === "Enter") commitSearch(searchQuery) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white/80 outline-none transition-colors"
            placeholder="Search books, authors, concepts, highlights…"
            animate={{
              boxShadow: searchFocused ? "0 0 0 3px rgba(45,140,255,0.15)" : "0 0 0 0px rgba(45,140,255,0)",
              borderColor: searchFocused ? "rgba(45,140,255,0.45)" : "rgba(45,140,255,0.12)",
            }}
            style={{
              background: "rgba(17,24,39,0.7)",
              border: "1px solid rgba(45,140,255,0.12)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <AnimatePresence>
          {searchFocused && (query.length > 0 ? searchSuggestions.length > 0 : recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-20 p-1.5"
              style={{ background: "rgba(10,15,31,0.97)", border: "1px solid rgba(45,140,255,0.18)", backdropFilter: "blur(12px)" }}
            >
              {query.length > 0 ? (
                searchSuggestions.map(b => (
                  <button
                    key={b.id}
                    onMouseDown={() => { setSearchQuery(b.title); commitSearch(b.title) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors"
                  >
                    <BookCover book={b} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/85 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{b.title}</p>
                      <p className="text-[10px] text-white/35 truncate">{b.author} · {b.shelf}</p>
                    </div>
                  </button>
                ))
              ) : (
                <>
                  <p className="text-[10px] text-white/30 px-3 py-1.5 uppercase tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Recent searches
                  </p>
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={() => setSearchQuery(s)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors"
                    >
                      <Clock size={12} className="text-white/25" />
                      <span className="text-xs text-white/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
                    </button>
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shelf filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {SHELVES.map(shelf => {
          const active = activeShelf === shelf
          const count = shelf === "All" ? totalBooks : (shelfCounts[shelf] || 0)
          return (
            <motion.button
              key={shelf}
              onClick={() => setActiveShelf(shelf)}
              whileHover={{ y: -1 }}
              className="relative flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: active ? "#5AA9FF" : "rgba(255,255,255,0.45)",
                border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {active && (
                <motion.div
                  layoutId="shelfActiveIndicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(45,140,255,0.2)", border: "1px solid rgba(45,140,255,0.5)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{shelf} <span className="opacity-50">({count})</span></span>
            </motion.button>
          )
        })}
      </div>

      {/* Book content */}
      {filtered.length === 0 ? (
        <EmptyLibraryState onAdd={() => setShowAddModal(true)} />
      ) : showShelfRows ? (
        <div className="space-y-8">
          {groupedByShelf.map(({ shelf, books }) => (
            <ShelfRow key={shelf} shelfName={shelf} books={books} onOpen={setSelectedBook} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((book, i) => (
            <LibraryBookCard key={book.id} book={book} index={i} onOpen={setSelectedBook} />
          ))}
        </div>
      )}

      {/* Book detail modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,8,22,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
              style={{
                background: "linear-gradient(135deg, #111827, #0A0F1F)",
                border: "1px solid rgba(45,140,255,0.2)",
                boxShadow: `0 0 60px ${selectedBook.color}22`,
                scrollbarWidth: "thin",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onClick={() => setSelectedBook(null)}
              >
                <X size={14} />
              </button>

              <div className="flex gap-5 mb-6">
                <div style={{ transform: "scale(1.1)", transformOrigin: "top left" }}>
                  <BookCover book={selectedBook} size="lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-1 font-medium px-2 py-0.5 rounded-full inline-block" style={{ background: `${selectedBook.color}18`, color: selectedBook.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {selectedBook.shelf}
                  </p>
                  <h3 className="text-lg font-bold text-white mt-1 leading-tight" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                    {selectedBook.title}
                  </h3>
                  <p className="text-sm text-white/50 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selectedBook.author}</p>
                  <ProgressBar value={selectedBook.progress} color={selectedBook.color} />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs" style={{ color: selectedBook.color, fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedBook.progress}% · {selectedBook.pages} pages
                    </p>
                    {selectedBook.status === "completed" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", fontFamily: "'JetBrains Mono', monospace" }}>
                        <Check size={9} /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Highlights", value: selectedBook.highlights, icon: Highlighter, color: "#F59E0B" },
                  { label: "Notes", value: selectedBook.notes, icon: MessageSquare, color: "#22C55E" },
                  { label: "Time Spent", value: selectedBook.timeSpent, icon: Clock, color: "#A855F7" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Icon size={14} color={color} className="mx-auto mb-1" />
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
                    <p className="text-[10px] text-white/40">{label}</p>
                  </div>
                ))}
              </div>

              {/* Reading insights — placeholder calculations from real book data */}
              {(() => {
                const hoursSpent = parseTimeSpent(selectedBook.timeSpent)
                const velocity = hoursSpent > 0 ? (selectedBook.pages * selectedBook.progress / 100) / hoursSpent : 0
                const pagesRemaining = selectedBook.pages - Math.round((selectedBook.pages * selectedBook.progress) / 100)
                const dailyPaceHours = 0.75
                const daysToFinish = velocity > 0 && pagesRemaining > 0 ? Math.ceil(pagesRemaining / (velocity * dailyPaceHours)) : 0
                const completionLabel = selectedBook.status === "completed"
                  ? "Finished"
                  : daysToFinish > 0
                    ? new Date(Date.now() + daysToFinish * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"
                const knowledgeScore = selectedBook.highlights * 12 + selectedBook.notes * 18 + Math.round(selectedBook.progress * 1.5)

                return (
                  <div className="mb-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Reading Insights
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-xs font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{completionLabel}</p>
                        <p className="text-[9px] text-white/40 mt-0.5">Est. Completion</p>
                      </div>
                      <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-xs font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{velocity > 0 ? `${velocity.toFixed(1)} pg/hr` : "—"}</p>
                        <p className="text-[9px] text-white/40 mt-0.5">Reading Velocity</p>
                      </div>
                      <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-xs font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{knowledgeScore.toLocaleString()}</p>
                        <p className="text-[9px] text-white/40 mt-0.5">Knowledge Score</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Notes preview */}
              <div className="mb-5 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Notes</p>
                  <span className="text-[10px]" style={{ color: selectedBook.color, fontFamily: "'JetBrains Mono', monospace" }}>{selectedBook.notes} saved</span>
                </div>
                <p className="text-xs text-white/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {selectedBook.notes > 0 ? "Open the reader to review your saved notes for this book." : "No notes yet — start annotating as you read."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${selectedBook.color}, ${selectedBook.color}aa)`, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
                  Continue Reading
                </button>
                <button className="py-2.5 rounded-xl font-semibold text-sm transition-all hover:border-[#2D8CFF]/50"
                  style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}>
                  Ask Nexus AI
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Book modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddBookModal onClose={() => setShowAddModal(false)} onAdd={handleAddBook} shelves={shelfNames} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AIView() {
  const [messages, setMessages] = useState(AI_MESSAGES_INIT)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(text?: string) {
    const msg = text || input.trim()
    if (!msg) return
    setInput("")
    const userMsg = { id: Date.now(), role: "user" as const, content: msg, timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
    setMessages(m => [...m, userMsg])
    setIsTyping(true)
    setTimeout(() => {
      const resp = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: `I'm analyzing your library for "${msg}". Based on your 247 books, I've found 14 relevant passages, 6 concept connections, and 3 books that directly address this topic. Would you like me to generate a detailed synthesis or create flashcards from these findings?`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(m => [...m, resp])
      setIsTyping(false)
    }, 1800)
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "calc(100vh - 6rem)" }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Nexus AI</h1>
        <p className="text-sm text-white/40" style={{ fontFamily: "'DM Sans', sans-serif" }}>247 books indexed · Second Brain active</p>
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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
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
          style={{
            background: "rgba(17,24,39,0.85)",
            border: "1px solid rgba(45,140,255,0.18)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <button
          onClick={() => handleSend()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: input.trim() ? "#2D8CFF" : "rgba(45,140,255,0.2)" }}
        >
          <Send size={13} color="#fff" />
        </button>
      </div>
    </div>
  )
}

function GraphView() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const getNode = (id: string) => GRAPH_NODES.find(n => n.id === id)!

  const active = selectedNode || hoveredNode

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Knowledge Graph</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {GRAPH_NODES.filter(n => n.type === "book").length} books · {GRAPH_NODES.filter(n => n.type === "concept").length} concepts · {GRAPH_EDGES.length} connections
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2D8CFF" }} />
            <span className="text-white/40">Books</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-white/30" />
            <span className="text-white/40">Concepts</span>
          </div>
        </div>
      </div>

      <GlassCard className="relative overflow-hidden" style={{ height: "460px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(45,140,255,0.04) 0%, transparent 70%)"
        }} />
        <svg width="100%" height="100%" viewBox="0 0 780 460" className="relative z-10">
          <defs>
            <radialGradient id="nodeGlow">
              <stop offset="0%" stopColor="#2D8CFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2D8CFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Edges */}
          {GRAPH_EDGES.map((edge, i) => {
            const from = getNode(edge.from)
            const to = getNode(edge.to)
            const isHighlighted = active === edge.from || active === edge.to
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isHighlighted ? "rgba(45,140,255,0.5)" : "rgba(45,140,255,0.12)"}
                strokeWidth={isHighlighted ? 1.5 : 0.8}
                strokeDasharray={isHighlighted ? "none" : "4,4"}
                style={{ transition: "all 0.2s ease" }}
              />
            )
          })}

          {/* Nodes */}
          {GRAPH_NODES.map((node) => {
            const isActive = active === node.id
            const connected = GRAPH_EDGES.some(e => e.from === node.id || e.to === node.id)
            const isDimmed = active && !isActive && !GRAPH_EDGES.some(e =>
              (e.from === active && e.to === node.id) || (e.to === active && e.from === node.id)
            )

            return (
              <g
                key={node.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                opacity={isDimmed ? 0.25 : 1}
              >
                {isActive && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.size * 1.6}
                    fill={node.color}
                    opacity={0.08}
                  />
                )}
                <circle
                  cx={node.x} cy={node.y}
                  r={node.type === "concept" ? node.size * 0.55 : node.size * 0.72}
                  fill={isActive ? node.color : `${node.color}22`}
                  stroke={isActive ? node.color : `${node.color}55`}
                  strokeWidth={node.type === "concept" ? 1 : 1.5}
                  style={{ transition: "all 0.2s ease" }}
                />
                {node.type === "book" && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.size * 0.3}
                    fill={isActive ? "#fff" : node.color}
                    opacity={isActive ? 0.9 : 0.4}
                    style={{ transition: "all 0.2s ease" }}
                  />
                )}
                <text
                  x={node.x}
                  y={node.y + (node.type === "concept" ? node.size * 0.7 : node.size * 0.95)}
                  textAnchor="middle"
                  fontSize={node.type === "concept" ? 9 : 10}
                  fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)"}
                  fontFamily="'DM Sans', sans-serif"
                  fontWeight={isActive ? "600" : "400"}
                  style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Selected node info */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-64 p-3.5 rounded-xl"
              style={{ background: "rgba(10,15,31,0.95)", border: "1px solid rgba(45,140,255,0.2)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs mb-1 font-medium" style={{ color: getNode(selectedNode).color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {getNode(selectedNode).type.toUpperCase()}
                  </p>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                    {getNode(selectedNode).label}
                  </p>
                  <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {GRAPH_EDGES.filter(e => e.from === selectedNode || e.to === selectedNode).length} connections
                  </p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <p className="text-xs text-center text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Click nodes to explore connections · Hover to preview
      </p>
    </div>
  )
}

function LearningView() {
  const totalPages = READING_DATA.reduce((s, d) => s + d.pages, 0)
  const totalMinutes = READING_DATA.reduce((s, d) => s + d.minutes, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#0A0F1F", border: "1px solid rgba(45,140,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
        <p className="text-white/60 mb-1">{label}</p>
        <p style={{ color: "#2D8CFF" }}>{payload[0]?.value} pages</p>
        <p style={{ color: "#22C55E" }}>{payload[1]?.value} min</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Learning Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your knowledge metrics, weekly view</p>
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pages This Week" value={totalPages} icon={BookOpen} color="#2D8CFF" subtitle="↑ 23% vs last week" />
        <StatCard label="Minutes Read" value={totalMinutes} icon={Clock} color="#22C55E" subtitle="Daily avg: 54 min" />
        <StatCard label="Knowledge Score" value="8,420" icon={Star} color="#F59E0B" subtitle="+340 this week" />
        <StatCard label="Completion Rate" value="68%" icon={TrendingUp} color="#A855F7" subtitle="Above average" />
      </div>

      {/* Reading activity chart */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Weekly Reading Activity</h3>
            <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Pages read and time spent per day</p>
          </div>
          <div className="flex gap-3 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 rounded" style={{ background: "#2D8CFF" }} /><span className="text-white/40">Pages</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-0.5 rounded" style={{ background: "#22C55E" }} /><span className="text-white/40">Minutes</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={READING_DATA} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="pageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D8CFF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2D8CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="pages" stroke="#2D8CFF" strokeWidth={2} fill="url(#pageGrad)" />
            <Area type="monotone" dataKey="minutes" stroke="#22C55E" strokeWidth={2} fill="url(#minGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Category breakdown + streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Library by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx={65} cy={65}
                  innerRadius={40} outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {CATEGORY_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {CATEGORY_DATA.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                    <span className="text-xs text-white/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: cat.fill, fontFamily: "'JetBrains Mono', monospace" }}>{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-bold text-white mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Reading Streak</h3>
          <p className="text-xs text-white/40 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>June 2026</p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }, (_, i) => {
              const intensity = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 3, 2, 1, 2, 3, 3, 2, 3, 3, 1][i % 20]
              const colors = ["rgba(45,140,255,0.06)", "rgba(45,140,255,0.2)", "rgba(45,140,255,0.45)", "rgba(45,140,255,0.85)"]
              const isToday = i === 18
              return (
                <div
                  key={i}
                  className={`w-full aspect-square rounded-sm ${isToday ? "ring-1 ring-[#5AA9FF]" : ""}`}
                  style={{ background: colors[intensity], transition: "all 0.2s" }}
                  title={`Day ${i + 1}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="text-white/30">Less</span>
            <div className="flex gap-1">
              {["rgba(45,140,255,0.06)", "rgba(45,140,255,0.2)", "rgba(45,140,255,0.45)", "rgba(45,140,255,0.85)"].map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="text-white/30">More</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function FlashcardsView() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  const card = FLASHCARDS[currentIdx]
  const diffColor = { easy: "#22C55E", medium: "#F59E0B", hard: "#EF4444" }[card.difficulty] ?? "#A855F7"

  function handleNext() {
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i + 1) % FLASHCARDS.length), 100)
  }

  function handleKnow() {
    setCompleted(s => new Set([...s, card.id]))
    handleNext()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Flashcards</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI-generated · Spaced repetition enabled
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: "#2D8CFF", fontFamily: "'Chakra Petch', sans-serif" }}>
            {completed.size}/{FLASHCARDS.length}
          </p>
          <p className="text-xs text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mastered</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #2D8CFF, #5AA9FF)" }}
          animate={{ width: `${((currentIdx + 1) / FLASHCARDS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-xs text-center text-white/30 -mt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Card {currentIdx + 1} of {FLASHCARDS.length}
      </p>

      {/* Card */}
      <div className="flex justify-center">
        <motion.div
          className="w-full max-w-lg cursor-pointer select-none"
          style={{ perspective: "1000px" }}
          onClick={() => setFlipped(f => !f)}
        >
          <motion.div
            className="relative"
            style={{ transformStyle: "preserve-3d", minHeight: "280px" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-7 flex flex-col"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: "linear-gradient(135deg, #111827 0%, #0D1626 100%)",
                border: "1px solid rgba(45,140,255,0.18)",
                boxShadow: "0 20px 60px rgba(5,8,22,0.6)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${diffColor}30` }}>
                  {card.difficulty.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  QUESTION
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-semibold text-white text-center leading-relaxed" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  {card.front}
                </p>
              </div>
              <div className="mt-6 text-center">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(45,140,255,0.08)", color: "#2D8CFF", fontFamily: "'DM Sans', sans-serif" }}>
                  {card.book}
                </span>
              </div>
              <p className="text-center text-xs text-white/20 mt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                tap to reveal
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl p-7 flex flex-col"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "linear-gradient(135deg, #0D1F3C 0%, #0A1628 100%)",
                border: "1px solid rgba(45,140,255,0.3)",
                boxShadow: "0 20px 60px rgba(45,140,255,0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ANSWER</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {card.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-base text-white/90 text-center leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-line" }}>
                  {card.back}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontFamily: "'DM Sans', sans-serif" }}
        >
          <RotateCcw size={14} /> Again
        </button>
        <button
          onClick={handleKnow}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22C55E", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Check size={14} /> Got it
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(45,140,255,0.12)", border: "1px solid rgba(45,140,255,0.25)", color: "#2D8CFF", fontFamily: "'DM Sans', sans-serif" }}
        >
          Skip <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Nav items config ─────────────────────────────────────────────────────────

const NAV_ITEMS: { view: View, label: string, icon: React.FC<any> }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "library", label: "Library", icon: Library },
  { view: "ai", label: "Nexus AI", icon: Brain },
  { view: "graph", label: "Knowledge", icon: Network },
  { view: "learning", label: "Analytics", icon: BarChart2 },
  { view: "flashcards", label: "Flashcards", icon: Layers },
]

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLight, setIsLight] = useState(false)

  return (
    <>
      <style>{isLight ? LIGHT_THEME : DARK_THEME}</style>
      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>

        {/* Background ambience */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(45,140,255,0.06)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]" style={{ background: "rgba(90,169,255,0.04)" }} />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,140,255,1) 1px, transparent 0)", backgroundSize: "32px 32px" }}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: "rgba(5,8,22,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className="fixed md:relative z-40 md:z-auto flex-shrink-0 flex flex-col h-full"
          style={{
            width: 220,
            background: "linear-gradient(180deg, #0A0F1F 0%, #050816 100%)",
            borderRight: "1px solid rgba(45,140,255,0.1)",
          }}
          initial={false}
          animate={{ x: sidebarOpen || typeof window !== "undefined" && window.innerWidth >= 768 ? 0 : -220 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Logo */}
          <div className="px-5 py-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", boxShadow: "0 0 16px rgba(45,140,255,0.4)" }}>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>N</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "0.05em" }}>NEXUS</p>
              <p className="text-[9px] text-white/30 mt-0.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Knowledge OS</p>
            </div>
          </div>

          <div className="mx-4 h-px mb-4" style={{ background: "rgba(45,140,255,0.08)" }} />

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => {
              const active = view === v
              return (
                <button
                  key={v}
                  onClick={() => { setView(v); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
                  style={{
                    background: active ? "rgba(45,140,255,0.12)" : "transparent",
                    border: `1px solid ${active ? "rgba(45,140,255,0.25)" : "transparent"}`,
                  }}
                >
                  <Icon
                    size={16}
                    color={active ? "#2D8CFF" : "rgba(255,255,255,0.35)"}
                    style={{ transition: "color 0.2s", flexShrink: 0 }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: active ? "#fff" : "rgba(255,255,255,0.45)",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "color 0.2s",
                    }}
                  >
                    {label}
                  </span>
                  {active && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: "#2D8CFF" }} />}
                </button>
              )
            })}
          </nav>

          {/* Bottom user */}
          <div className="p-4">
            <div className="mx-0 h-px mb-4" style={{ background: "rgba(45,140,255,0.08)" }} />
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #2D8CFF, #9B59B6)" }}>
                C
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white leading-none">Chris</p>
                <p className="text-[10px] text-white/30 mt-0.5 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Lvl 12 · Scholar</p>
              </div>
              <Settings size={13} color="rgba(255,255,255,0.25)" />
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Top bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-6 py-4"
            style={{ borderBottom: "1px solid rgba(45,140,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <button
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                onClick={() => setSidebarOpen(s => !s)}
              >
                <Menu size={15} color="rgba(255,255,255,0.6)" />
              </button>
              <div className="relative hidden sm:block">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  placeholder="Quick search…"
                  className="pl-9 pr-4 py-2 rounded-xl text-xs text-white/70 outline-none w-56 transition-all focus:w-72"
                  style={{
                    background: "rgba(17,24,39,0.6)",
                    border: "1px solid rgba(45,140,255,0.1)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center relative hover:bg-white/[0.04] transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <Bell size={14} color="rgba(255,255,255,0.45)" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#2D8CFF" }} />
              </button>

              {/* ── THEME TOGGLE ── */}
              <button
                onClick={() => setIsLight(l => !l)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)" }}
                title={isLight ? "Switch to dark mode" : "Switch to light mode"}
              >
                {isLight ? <Moon size={14} color="#5AA9FF" /> : <Sun size={14} color="#5AA9FF" />}
              </button>

              <button
                onClick={() => setView("ai")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-85"
                style={{ background: "rgba(45,140,255,0.12)", border: "1px solid rgba(45,140,255,0.22)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}
              >
                <Sparkles size={12} />
                Ask AI
              </button>
            </div>
          </header>

          {/* View content */}
          <main className="flex-1 overflow-y-auto px-5 md:px-6 py-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(45,140,255,0.15) transparent" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="max-w-5xl mx-auto"
                style={{ minHeight: "100%" }}
              >
                {view === "home" && <HomeView onNavigate={setView} />}
                {view === "library" && <LibraryView />}
                {view === "ai" && <AIView />}
                {view === "graph" && <GraphView />}
                {view === "learning" && <LearningView />}
                {view === "flashcards" && <FlashcardsView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  )
}