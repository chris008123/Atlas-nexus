import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, BookOpen, Plus, X, Loader, Upload, FileText, Check } from "lucide-react"
import { GlassCard } from "../components/Shared"
import { supabase } from "../supabaseClient"
import { NEW_BOOK_COLORS } from "../components/library/libraryUtils"

type PublicBook = {
  id: string
  title: string
  author: string
  shelf: string
  pages: number
  color: string
  pdf_url: string | null
  cover_url: string | null
  description: string | null
  created_at: string
}

function BookCard({ book, onAdd, added, role }: {
  book: PublicBook
  onAdd: (book: PublicBook) => void
  added: boolean
  role: string
}) {
  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      {/* Cover */}
      <div
        className="w-full h-44 rounded-lg overflow-hidden flex-shrink-0 relative"
        style={{
          background: book.cover_url ? undefined : `linear-gradient(155deg, ${book.color}28 0%, ${book.color}55 60%, ${book.color}22 100%)`,
          borderLeft: book.cover_url ? undefined : `3px solid ${book.color}`,
        }}
      >
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <p className="text-xs font-bold text-white line-clamp-2" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{book.title}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{book.author}</p>
          </div>
        )}
        {/* Shelf badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${book.color}22`, color: book.color, border: `1px solid ${book.color}44`, fontFamily: "'JetBrains Mono', monospace" }}>
            {book.shelf}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white line-clamp-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{book.title}</p>
        <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author}</p>
        {book.description && (
          <p className="text-xs text-white/30 mt-2 line-clamp-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.description}</p>
        )}
        <p className="text-[10px] text-white/20 mt-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{book.pages} pages</p>
      </div>

      {/* Add button */}
      <button
        onClick={() => !added && onAdd(book)}
        disabled={added}
        className="w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        style={{
          background: added ? "rgba(34,197,94,0.1)" : `linear-gradient(135deg, ${book.color}33, ${book.color}15)`,
          border: `1px solid ${added ? "rgba(34,197,94,0.3)" : `${book.color}44`}`,
          color: added ? "#22C55E" : book.color,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {added ? <><Check size={12} /> Added to Library</> : <><Plus size={12} /> Add to My Library</>}
      </button>
    </GlassCard>
  )
}

export function PublicLibraryView({ role }: { role: string }) {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeShelf, setActiveShelf] = useState("All")
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [selectedBook, setSelectedBook] = useState<PublicBook | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)

  // Admin upload state
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadAuthor, setUploadAuthor] = useState("")
  const [uploadShelf, setUploadShelf] = useState("Psychology")
  const [uploadPages, setUploadPages] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCoverUrl, setUploadCoverUrl] = useState<string | null>(null)
  const [fetchingCover, setFetchingCover] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SHELVES = ["All", "Psychology", "Strategy", "Programming", "Business", "AI"]

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    const { data, error } = await supabase
      .from("public_books")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) setBooks(data)
    setLoading(false)
  }

  async function fetchCover(title: string, author: string) {
    if (!title.trim()) return
    setFetchingCover(true)
    try {
      const query = encodeURIComponent(`${title} ${author}`.trim())
      const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_i`)
      const data = await res.json()
      const coverId = data.docs?.[0]?.cover_i
      setUploadCoverUrl(coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null)
    } catch {
      setUploadCoverUrl(null)
    }
    setFetchingCover(false)
  }

  function handleTitleChange(val: string) {
    setUploadTitle(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCover(val, uploadAuthor), 800)
  }

  function handleAuthorChange(val: string) {
    setUploadAuthor(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCover(uploadTitle, val), 800)
  }

  function handleFile(file: File) {
    if (file.type !== "application/pdf") return
    setUploadFile(file)
    if (!uploadTitle.trim()) {
      const cleaned = file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").split(/[,\[\(]/)[0].trim().slice(0, 60)
      setUploadTitle(cleaned)
      setTimeout(() => fetchCover(cleaned, uploadAuthor), 100)
    }
  }

  async function handleUpload() {
    if (!uploadTitle.trim() || !uploadAuthor.trim()) return
    setUploading(true)

    let pdf_url: string | null = null

    if (uploadFile) {
      const fileName = `public/${Date.now()}-${uploadFile.name.replace(/\s+/g, "_")}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, uploadFile, { contentType: "application/pdf" })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(uploadData.path)
        pdf_url = urlData.publicUrl
      }
    }

    const color = NEW_BOOK_COLORS[Math.floor(Math.random() * NEW_BOOK_COLORS.length)]

    const { data, error } = await supabase.from("public_books").insert([{
      title: uploadTitle.trim(),
      author: uploadAuthor.trim(),
      shelf: uploadShelf,
      pages: parseInt(uploadPages) || 200,
      color,
      pdf_url,
      cover_url: uploadCoverUrl,
      description: uploadDescription.trim() || null,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
    }]).select().single()

    if (!error && data) {
      setBooks(prev => [data, ...prev])
      setShowUpload(false)
      setUploadTitle("")
      setUploadAuthor("")
      setUploadPages("")
      setUploadDescription("")
      setUploadFile(null)
      setUploadCoverUrl(null)
    }

    setUploading(false)
  }

  async function handleAddToLibrary(book: PublicBook) {
    setAddingId(book.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("books").insert([{
      title: book.title,
      author: book.author,
      shelf: book.shelf,
      pages: book.pages,
      color: book.color,
      pdf_url: book.pdf_url,
      cover_url: book.cover_url,
      progress: 0,
      status: "reading",
      highlights: 0,
      notes: 0,
      time_spent: "0h 0m",
      user_id: user.id,
    }])

    if (!error) {
      setAddedIds(prev => new Set([...prev, book.id]))
    }
    setAddingId(null)
  }

  const shelves = [...new Set(books.map(b => b.shelf))]
  const filtered = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
    const matchesShelf = activeShelf === "All" || b.shelf === activeShelf
    return matchesSearch && matchesShelf
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader size={22} color="#2D8CFF" className="animate-spin" />
        <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading public library…</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Public Library</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {books.length} books available to all users
          </p>
        </div>
        {role === "admin" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(45,140,255,0.2), rgba(45,140,255,0.08))",
              border: "1px solid rgba(45,140,255,0.35)",
              color: "#5AA9FF",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 0 18px rgba(45,140,255,0.18)",
            }}
          >
            <Upload size={13} /> Upload Book
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search books or authors…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white/80 outline-none"
          style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
        />
      </div>

      {/* Shelf filter */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {["All", ...shelves].map(shelf => {
          const active = activeShelf === shelf
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
                  layoutId="publicShelfIndicator"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(45,140,255,0.2)", border: "1px solid rgba(45,140,255,0.5)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{shelf}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Books grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <BookOpen size={32} color="rgba(45,140,255,0.2)" />
          <p className="text-sm text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {books.length === 0 ? "No books in the public library yet." : "No books match your search."}
          </p>
          {role === "admin" && books.length === 0 && (
            <button
              onClick={() => setShowUpload(true)}
              className="text-xs text-[#2D8CFF] hover:opacity-80 transition-opacity mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Upload the first book →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onAdd={handleAddToLibrary}
              added={addedIds.has(book.id)}
              role={role}
            />
          ))}
        </div>
      )}

      {/* Admin Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(5,8,22,0.85)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
              style={{
                background: "linear-gradient(135deg, #111827, #0A0F1F)",
                border: "1px solid rgba(45,140,255,0.2)",
                boxShadow: "0 0 60px rgba(45,140,255,0.12)",
                scrollbarWidth: "thin",
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onClick={() => setShowUpload(false)}
              >
                <X size={14} />
              </button>

              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Upload Public Book</h3>
              <p className="text-xs text-white/40 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>This book will be visible to all users.</p>

              {/* Cover preview */}
              {(uploadCoverUrl || fetchingCover) && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: "rgba(45,140,255,0.05)", border: "1px solid rgba(45,140,255,0.12)" }}>
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                    {fetchingCover ? <Loader size={14} color="#2D8CFF" className="animate-spin" /> : uploadCoverUrl ? <img src={uploadCoverUrl} alt="cover" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/70" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {fetchingCover ? "Fetching cover…" : "Cover found"}
                    </p>
                    {!fetchingCover && uploadCoverUrl && (
                      <button onClick={() => setUploadCoverUrl(null)} className="text-[10px] text-white/30 hover:text-white/60 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Drop Zone */}
              <div
                className="w-full mb-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{
                  border: `1.5px dashed ${isDragging ? "rgba(45,140,255,0.7)" : uploadFile ? "rgba(45,140,255,0.5)" : "rgba(45,140,255,0.2)"}`,
                  background: isDragging ? "rgba(45,140,255,0.07)" : uploadFile ? "rgba(45,140,255,0.04)" : "rgba(17,24,39,0.5)",
                  padding: uploadFile ? "12px 16px" : "20px 16px",
                  minHeight: 72,
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              >
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                {uploadFile ? (
                  <div className="flex items-center gap-2.5 w-full">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(45,140,255,0.15)" }}>
                      <FileText size={15} color="#2D8CFF" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{uploadFile.name}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB · Click to change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={18} color="rgba(45,140,255,0.6)" />
                    <p className="text-xs text-white/45 mt-2 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Drop a PDF here, or <span style={{ color: "#2D8CFF" }}>browse</span>
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <input value={uploadTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Book title" className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none" style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }} />
                <input value={uploadAuthor} onChange={e => handleAuthorChange(e.target.value)} placeholder="Author" className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none" style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }} />
                <textarea value={uploadDescription} onChange={e => setUploadDescription(e.target.value)} placeholder="Short description (optional)" rows={2} className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none resize-none" style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }} />
                <div className="flex gap-2">
                  <select value={uploadShelf} onChange={e => setUploadShelf(e.target.value)} className="flex-1 px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none" style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
                    {["Psychology", "Strategy", "Programming", "Business", "AI"].map(s => <option key={s} value={s} style={{ background: "#111827" }}>{s}</option>)}
                  </select>
                  <input value={uploadPages} onChange={e => setUploadPages(e.target.value)} placeholder="Pages" type="number" className="w-24 px-3.5 py-2.5 rounded-lg text-sm text-white/85 outline-none" style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }} />
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!uploadTitle.trim() || !uploadAuthor.trim() || uploading}
                className="w-full mt-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
              >
                {uploading ? <><Loader size={14} className="animate-spin" /> Uploading…</> : "Upload to Public Library"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}