import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Plus, Library, BookOpen, Check, Clock, Sparkles,
  TrendingUp, Zap, Compass, Star, Search, X,
  Highlighter, MessageSquare,
} from "lucide-react"
import { GlassCard, StatCard, BookCover, ProgressBar } from "../components/Shared"
import { parseTimeSpent, formatHours } from "../components/library/libraryUtils"
import { AIInsightCard } from "../components/library/AIInsightCard"
import { ContinueReadingFeature } from "../components/library/ContinueReadingFeature"
import { LibraryBookCard } from "../components/library/LibraryBookCard"
import { ShelfRow } from "../components/library/ShelfRow"
import { EmptyLibraryState } from "../components/library/EmptyLibraryState"
import { AddBookModal } from "../components/library/AddBookModal"
import type { Book } from "../mockData"
import { supabase } from "../supabaseClient"
import { PDFReader } from "../components/library/PDFReader"
import { savePDFLocally, deleteLocalPDF } from "../utils/pdfStorage"

export const SHELVES = ["All", "Psychology", "Strategy", "Programming", "Business", "AI"]

export function LibraryView() {
  const [libraryBooks, setLibraryBooks] = useState<Book[]>([])
  const [activeShelf, setActiveShelf] = useState("All")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [readerBook, setReaderBook] = useState<Book | null>(null)

  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })
      console.log("books loaded:", data, error)
      if (!error && data) setLibraryBooks(data)
      else setLibraryBooks([])
    }
    loadBooks()
  }, [])

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
  const otherReading = inProgressBooks.filter(b => b.id !== continueReadingBook?.id).sort((a, b) => a.progress - b.progress)
  const suggestedNext = otherReading[0] || continueReadingBook
  const completionRate = totalBooks > 0 ? Math.round((completedBooks.length / totalBooks) * 100) : 0

  function commitSearch(value: string) {
    const v = value.trim()
    if (!v) return
    setRecentSearches(prev => [v, ...prev.filter(s => s.toLowerCase() !== v.toLowerCase())].slice(0, 4))
  }

  async function handleAddBook(data: { title: string, author: string, shelf: string, pages: number, color: string, file?: File, cover_url?: string }) {
    const { data: saved, error } = await supabase.from("books").insert([{
      title: data.title,
      author: data.author,
      shelf: data.shelf,
      pages: data.pages,
      color: data.color,
      pdf_url: null,
      cover_url: data.cover_url ?? null,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    }]).select().single()

    if (error) {
      console.error("Failed to save book:", error.message)
      return
    }

    // Save PDF locally immediately so user can read right away
    let local_pdf_url: string | null = null
    if (data.file) {
      local_pdf_url = await savePDFLocally(saved.id, data.file)
    }

    const newBook = {
      id: saved.id,
      title: saved.title,
      author: saved.author,
      shelf: saved.shelf,
      progress: 0,
      color: saved.color,
      status: "reading" as const,
      pages: saved.pages,
      highlights: 0,
      notes: 0,
      timeSpent: "0h 0m",
      pdf_url: local_pdf_url,  // use local URL immediately
      cover_url: saved.cover_url,
    }

    setLibraryBooks(prev => [newBook, ...prev])
    setShowAddModal(false)
    setActiveShelf("All")

    // Upload to Supabase in background
    if (data.file) {
      const fileName = `${Date.now()}-${data.file.name.replace(/\s+/g, "_")}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, data.file, { contentType: "application/pdf" })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(uploadData.path)
        const pdf_url = urlData.publicUrl

        // Update DB with permanent Supabase URL
        await supabase.from("books").update({ pdf_url }).eq("id", saved.id)

        // Swap local URL for permanent Supabase URL in state
        setLibraryBooks(prev => prev.map(b =>
          b.id === saved.id ? { ...b, pdf_url } : b
        ))

        // Clean up local storage since we now have the Supabase URL
        await deleteLocalPDF(saved.id)
      }
    }
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
                <button
                  onClick={() => { setSelectedBook(null); setReaderBook(selectedBook) }}
                  className="py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${selectedBook.color}, ${selectedBook.color}aa)`, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Continue Reading
                </button>
                <button
                  className="py-2.5 rounded-xl font-semibold text-sm transition-all hover:border-[#2D8CFF]/50"
                  style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}
                >
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

      {/* PDF Reader */}
      <AnimatePresence>
        {readerBook && (
          <PDFReader
            book={readerBook}
            onClose={() => setReaderBook(null)}
            onProgressUpdate={(bookId, progress, timeSpent) => {
              setLibraryBooks(prev => prev.map(b =>
                b.id === bookId
                  ? { ...b, progress, timeSpent, status: progress >= 100 ? "completed" : "reading" }
                  : b
              ))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}