import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Document, Page, pdfjs } from "react-pdf"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader } from "lucide-react"
import type { Book } from "../../mockData"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { getLocalPDF } from "../../utils/pdfStorage"
import { supabase } from "../../supabaseClient"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

function formatTimeSpent(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}

function parseExistingTime(timeSpent: string): number {
  const match = timeSpent?.match(/(\d+)h\s*(\d+)m/)
  if (!match) return 0
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

export function PDFReader({ book, onClose, onProgressUpdate }: {
  book: Book
  onClose: () => void
  onProgressUpdate?: (bookId: string | number, progress: number, timeSpent: string) => void
}) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(book.pdf_url ?? null)

  // Tracking refs
  const sessionStartRef = useRef<number>(Date.now())
  const existingMinutesRef = useRef<number>(parseExistingTime(book.timeSpent ?? "0h 0m"))
  const lastSavedPageRef = useRef<number>(1)

  useEffect(() => {
    if (book.pdf_url) {
      setResolvedUrl(book.pdf_url)
      return
    }
    getLocalPDF(String(book.id)).then(url => {
      if (url) setResolvedUrl(url)
    })
  }, [book.pdf_url, book.id])

  // Save progress to Supabase
  async function saveProgress(page: number, totalPages: number) {
    if (totalPages === 0) return
    const progress = Math.round((page / totalPages) * 100)
    const sessionMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000)
    const totalMinutes = existingMinutesRef.current + sessionMinutes
    const timeSpent = formatTimeSpent(totalMinutes)
    const status = progress >= 100 ? "completed" : "reading"

    await supabase.from("books").update({
      progress,
      time_spent: timeSpent,
      status,
    }).eq("id", book.id)

    onProgressUpdate?.(book.id, progress, timeSpent)
    lastSavedPageRef.current = page
  }

  // Save on page change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function scheduleSave(page: number) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveProgress(page, numPages)
    }, 1500)
  }

  // Save when reader closes
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (numPages > 0) saveProgress(pageNumber, numPages)
    }
  }, [pageNumber, numPages])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    // Resume from saved progress
    if (book.progress && book.progress > 0) {
      const savedPage = Math.round((book.progress / 100) * numPages)
      setPageNumber(Math.max(1, savedPage))
    }
  }, [book.progress])

  function prev() {
    const p = Math.max(1, pageNumber - 1)
    setPageNumber(p)
    scheduleSave(p)
  }

  function next() {
    const p = Math.min(numPages, pageNumber + 1)
    setPageNumber(p)
    scheduleSave(p)
  }

  function zoomIn() { setScale(s => Math.min(2.5, +(s + 0.2).toFixed(1))) }
  function zoomOut() { setScale(s => Math.max(0.6, +(s - 0.2).toFixed(1))) }

  const progress = numPages > 0 ? Math.round((pageNumber / numPages) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "#05080E" }}
    >
      {/* Top toolbar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3 z-10"
        style={{
          background: "linear-gradient(180deg, #0A0F1F 0%, rgba(10,15,31,0.95) 100%)",
          borderBottom: "1px solid rgba(45,140,255,0.12)",
        }}
      >
        {/* Left — book info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-2 h-6 rounded-full flex-shrink-0"
            style={{ background: book.color, boxShadow: `0 0 10px ${book.color}88` }}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              {book.title}
            </p>
            <p className="text-[10px] text-white/35 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {book.author}
            </p>
          </div>
        </div>

        {/* Center — page controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={pageNumber <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 hover:bg-white/[0.06]"
            style={{ border: "1px solid rgba(45,140,255,0.15)" }}
          >
            <ChevronLeft size={14} color="#5AA9FF" />
          </button>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.18)" }}
          >
            <span className="text-xs font-mono text-white/80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {pageNumber}
            </span>
            <span className="text-xs text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>/</span>
            <span className="text-xs font-mono text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {numPages || "—"}
            </span>
          </div>

          <button
            onClick={next}
            disabled={pageNumber >= numPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25 hover:bg-white/[0.06]"
            style={{ border: "1px solid rgba(45,140,255,0.15)" }}
          >
            <ChevronRight size={14} color="#5AA9FF" />
          </button>
        </div>

        {/* Right — progress + zoom + close */}
        <div className="flex items-center gap-2">
          {/* Live progress indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: `${book.color}15`, border: `1px solid ${book.color}30` }}
          >
            <span className="text-[11px] font-bold" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {progress}%
            </span>
          </div>

          <button
            onClick={zoomOut}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <ZoomOut size={13} color="rgba(255,255,255,0.5)" />
          </button>
          <span className="text-[11px] text-white/30 w-9 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <ZoomIn size={13} color="rgba(255,255,255,0.5)" />
          </button>

          <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

          <button
            onClick={() => {
              if (numPages > 0) saveProgress(pageNumber, numPages)
              onClose()
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <X size={13} color="rgba(255,255,255,0.5)" />
          </button>
        </div>
      </div>

      {/* PDF canvas area */}
      <div className="flex-1 overflow-auto flex items-start justify-center py-8 px-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(45,140,255,0.2) transparent" }}>
        <AnimatePresence>
          {loading && resolvedUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader size={22} color="#2D8CFF" className="animate-spin" />
                <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading PDF…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {resolvedUrl ? (
          <Document file={resolvedUrl} onLoadSuccess={onDocumentLoadSuccess} loading="">
            <motion.div
              key={pageNumber}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,140,255,0.1)",
              }}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </motion.div>
          </Document>
        ) : (
          <div className="flex flex-col items-center gap-3 mt-24">
            <Loader size={22} color="#2D8CFF" className="animate-spin" />
            <p className="text-sm text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Preparing PDF…</p>
          </div>
        )}
      </div>

      {/* Bottom progress bar */}
      {numPages > 0 && (
        <div
          className="flex-shrink-0 px-5 py-3 flex items-center gap-3"
          style={{ borderTop: "1px solid rgba(45,140,255,0.08)", background: "rgba(10,15,31,0.95)" }}
        >
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${book.color}, ${book.color}aa)` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] text-white/25 flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {progress}%
          </span>
        </div>
      )}
    </motion.div>
  )
}