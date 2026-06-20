import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Users, BookOpen, Star, TrendingUp, Search, ChevronDown, ChevronUp, Loader, Shield, X } from "lucide-react"
import { GlassCard, StatCard } from "../components/Shared"
import { supabase } from "../supabaseClient"

type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: string
  created_at: string
}

type Book = {
  id: string
  title: string
  author: string
  shelf: string
  progress: number
  status: string
  color: string
  highlights: number
  notes: number
  pages: number
  pdf_url: string | null
}

type UserWithBooks = Profile & { books: Book[] }

export function AdminView() {
  const [users, setUsers] = useState<UserWithBooks[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  useEffect(() => {
    async function load() {
      // Load all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error || !profiles) { setLoading(false); return }

      // Load books for each user
      const usersWithBooks = await Promise.all(
        profiles.map(async (profile) => {
          const { data: books } = await supabase
            .from("books")
            .select("*")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
          return { ...profile, books: books ?? [] }
        })
      )

      setUsers(usersWithBooks)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = users.filter(u =>
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalUsers = users.length
  const totalBooks = users.reduce((s, u) => s + u.books.length, 0)
  const totalHighlights = users.reduce((s, u) => s + u.books.reduce((bs, b) => bs + (b.highlights ?? 0), 0), 0)
  const activeReaders = users.filter(u => u.books.some(b => b.status === "reading")).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader size={22} color="#2D8CFF" className="animate-spin" />
        <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading admin dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <Shield size={16} color="#EF4444" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Admin Dashboard</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Platform overview · All users</p>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={totalUsers} icon={Users} color="#2D8CFF" subtitle="Registered accounts" />
        <StatCard label="Active Readers" value={activeReaders} icon={BookOpen} color="#F59E0B" subtitle="Have books in progress" />
        <StatCard label="Total Books" value={totalBooks} icon={TrendingUp} color="#22C55E" subtitle="Across all users" />
        <StatCard label="Total Highlights" value={totalHighlights} icon={Star} color="#A855F7" subtitle="Across all books" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name or email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white/80 outline-none"
          style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Users list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <GlassCard className="p-6 text-center">
            <p className="text-sm text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>No users found.</p>
          </GlassCard>
        )}

        {filtered.map((user) => {
          const isExpanded = expandedUser === user.id
          const completedBooks = user.books.filter(b => b.status === "completed").length
          const inProgressBooks = user.books.filter(b => b.status === "reading").length
          const avgProgress = user.books.length > 0
            ? Math.round(user.books.reduce((s, b) => s + b.progress, 0) / user.books.length)
            : 0
          const initials = (user.full_name?.split(" ").map(n => n[0]).join("") || user.email?.[0] || "U").toUpperCase().slice(0, 2)
          const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

          return (
            <GlassCard key={user.id} className="overflow-hidden">
              {/* User row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedUser(isExpanded ? null : user.id)}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #2D8CFF, #9B59B6)" }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                      {user.full_name || "Unnamed user"}
                    </p>
                    {user.role === "admin" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/35 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{user.email}</p>
                  <p className="text-[10px] text-white/20 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Joined {joinedDate}</p>
                </div>

                {/* Quick stats */}
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{user.books.length}</p>
                    <p className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>books</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: "#F59E0B", fontFamily: "'Chakra Petch', sans-serif" }}>{inProgressBooks}</p>
                    <p className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>reading</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: "#22C55E", fontFamily: "'Chakra Petch', sans-serif" }}>{completedBooks}</p>
                    <p className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: "#2D8CFF", fontFamily: "'Chakra Petch', sans-serif" }}>{avgProgress}%</p>
                    <p className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>avg</p>
                  </div>
                </div>

                {/* Expand icon */}
                <div className="flex-shrink-0 ml-2 text-white/25">
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>
              </div>

              {/* Expanded books */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(45,140,255,0.08)" }}>
                      {user.books.length === 0 ? (
                        <p className="text-xs text-white/25 py-3 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          No books in library yet.
                        </p>
                      ) : (
                        <div className="space-y-2 mt-3">
                          <p className="text-[10px] text-white/30 uppercase tracking-wide mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Library · {user.books.length} books
                          </p>
                          {user.books.map((book) => (
                            <div
                              key={book.id}
                              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors"
                              style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                              onClick={() => setSelectedBook(book)}
                            >
                              {/* Color dot */}
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: book.color }} />

                              {/* Book info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white/85 truncate" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{book.title}</p>
                                <p className="text-[10px] text-white/35 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author} · {book.shelf}</p>
                              </div>

                              {/* Progress bar */}
                              <div className="w-24 flex-shrink-0">
                                <div className="flex justify-between text-[9px] mb-1" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
                                  <span>{book.progress}%</span>
                                  <span>{book.status}</span>
                                </div>
                                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${book.progress}%`, background: book.color }}
                                  />
                                </div>
                              </div>

                              {/* Highlights */}
                              <div className="text-center flex-shrink-0 w-12">
                                <p className="text-xs font-bold" style={{ color: "#F59E0B", fontFamily: "'Chakra Petch', sans-serif" }}>{book.highlights ?? 0}</p>
                                <p className="text-[9px] text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>hl</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          )
        })}
      </div>

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
              className="w-full max-w-sm rounded-2xl p-6 relative"
              style={{ background: "linear-gradient(135deg, #111827, #0A0F1F)", border: "1px solid rgba(45,140,255,0.2)", boxShadow: `0 0 60px ${selectedBook.color}22` }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onClick={() => setSelectedBook(null)}
              >
                <X size={14} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: selectedBook.color }} />
                <span className="text-[10px] font-medium" style={{ color: selectedBook.color, fontFamily: "'JetBrains Mono', monospace" }}>{selectedBook.shelf}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-0.5" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{selectedBook.title}</h3>
              <p className="text-sm text-white/40 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{selectedBook.author}</p>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: selectedBook.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>{selectedBook.progress}% complete</span>
                  <span>{selectedBook.pages} pages</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${selectedBook.progress}%`, background: `linear-gradient(90deg, ${selectedBook.color}, ${selectedBook.color}aa)` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Status", value: selectedBook.status, color: selectedBook.status === "completed" ? "#22C55E" : "#F59E0B" },
                  { label: "Highlights", value: selectedBook.highlights ?? 0, color: "#F59E0B" },
                  { label: "Notes", value: selectedBook.notes ?? 0, color: "#A855F7" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm font-bold capitalize" style={{ color, fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
                    <p className="text-[10px] text-white/30 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
                  </div>
                ))}
              </div>

              {selectedBook.pdf_url && (
                <button
                  onClick={() => window.open(selectedBook.pdf_url!, "_blank")}
                  className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${selectedBook.color}, ${selectedBook.color}aa)`, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                >
                  View PDF
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}