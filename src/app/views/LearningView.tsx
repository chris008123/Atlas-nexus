import { useState, useEffect } from "react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import { BookOpen, Clock, Star, TrendingUp, Loader } from "lucide-react"
import { GlassCard, StatCard } from "../components/Shared"
import { supabase } from "../supabaseClient"
import type { Book } from "../mockData"

type ReadingActivity = {
  day: string
  pages: number
  minutes: number
  date: string
}

const SHELF_COLORS: Record<string, string> = {
  Psychology: "#4A90D9",
  Strategy: "#E5534B",
  Programming: "#57B77E",
  Business: "#F39C12",
  AI: "#2D8CFF",
}
const FALLBACK_COLORS = ["#9B59B6", "#1ABC9C", "#E74C3C", "#F1C40F", "#4ECDC4"]

export function LearningView() {
  const [books, setBooks] = useState<Book[]>([])
  const [activity, setActivity] = useState<ReadingActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: bookData }, { data: activityData }] = await Promise.all([
        supabase.from("books").select("*"),
        supabase.from("reading_activity").select("*").order("date", { ascending: true }).limit(7),
      ])
      if (bookData) setBooks(bookData)
      if (activityData) setActivity(activityData)
      setLoading(false)
    }
    load()
  }, [])

  // Derive category data from real books
  const categoryMap: Record<string, number> = {}
  books.forEach(b => {
    categoryMap[b.shelf] = (categoryMap[b.shelf] || 0) + 1
  })
  const categoryData = Object.entries(categoryMap).map(([name, value], i) => ({
    name,
    value,
    fill: SHELF_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }))

  const totalPages = activity.reduce((s, d) => s + d.pages, 0)
  const totalMinutes = activity.reduce((s, d) => s + d.minutes, 0)
  const completedBooks = books.filter(b => b.status === "completed")
  const completionRate = books.length > 0 ? Math.round((completedBooks.length / books.length) * 100) : 0
  const knowledgeScore = books.reduce((s, b) => s + (b.highlights ?? 0) * 12 + (b.notes ?? 0) * 18, 0)

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader size={22} color="#2D8CFF" className="animate-spin" />
        <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Learning Dashboard</h1>
        <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your knowledge metrics, weekly view</p>
      </div>

      {/* Weekly stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pages This Week" value={totalPages} icon={BookOpen} color="#2D8CFF" subtitle={activity.length > 0 ? `${activity.length} days tracked` : "No activity yet"} />
        <StatCard label="Minutes Read" value={totalMinutes} icon={Clock} color="#22C55E" subtitle={activity.length > 0 ? `Avg ${Math.round(totalMinutes / activity.length)} min/day` : "No activity yet"} />
        <StatCard label="Knowledge Score" value={knowledgeScore.toLocaleString()} icon={Star} color="#F59E0B" subtitle="From highlights & notes" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="#A855F7" subtitle={`${completedBooks.length} of ${books.length} books`} />
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
        {activity.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activity} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              No reading activity logged yet. Data will appear here as you read.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Category breakdown + streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-bold text-white mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Library by Category</h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx={65} cy={65}
                    innerRadius={40} outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat) => (
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
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>Add books to see your category breakdown.</p>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-bold text-white mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Reading Streak</h3>
          <p className="text-xs text-white/40 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }, (_, i) => {
              // Map grid cells to actual activity dates if available
              const activityDays = activity.map(a => new Date(a.date).getDate())
              const dayOfMonth = i + 1
              const hasActivity = activityDays.includes(dayOfMonth)
              const today = new Date().getDate()
              const isToday = dayOfMonth === today
              const colors = ["rgba(45,140,255,0.06)", "rgba(45,140,255,0.55)"]
              return (
                <div
                  key={i}
                  className={`w-full aspect-square rounded-sm ${isToday ? "ring-1 ring-[#5AA9FF]" : ""}`}
                  style={{ background: hasActivity ? colors[1] : colors[0], transition: "all 0.2s" }}
                  title={`Day ${dayOfMonth}`}
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