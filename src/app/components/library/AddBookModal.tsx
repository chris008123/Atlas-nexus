import { useState, useRef } from "react"
import { motion } from "motion/react"
import { X, Upload, FileText } from "lucide-react"
import { NEW_BOOK_COLORS } from "./libraryUtils"

export function AddBookModal({ onClose, onAdd, shelves }: {
  onClose: () => void, onAdd: (b: { title: string, author: string, shelf: string, pages: number, color: string, file?: File }) => void, shelves: string[]
}) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [shelf, setShelf] = useState(shelves[0] || "Psychology")
  const [pages, setPages] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (file.type !== "application/pdf") return
    setPdfFile(file)
    // Auto-fill title from filename (strip .pdf extension)
    if (!title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleSubmit() {
    if (!title.trim() || !author.trim()) return
    onAdd({
      title: title.trim(),
      author: author.trim(),
      shelf,
      pages: parseInt(pages, 10) || 200,
      color: NEW_BOOK_COLORS[Math.floor(Math.random() * NEW_BOOK_COLORS.length)],
      file: pdfFile ?? undefined,
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
        <p className="text-xs text-white/40 mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Upload a PDF and add it to your digital library.</p>

        {/* PDF Drop Zone */}
        <div
          className="w-full mb-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
          style={{
            border: `1.5px dashed ${isDragging ? "rgba(45,140,255,0.7)" : pdfFile ? "rgba(45,140,255,0.5)" : "rgba(45,140,255,0.2)"}`,
            background: isDragging ? "rgba(45,140,255,0.07)" : pdfFile ? "rgba(45,140,255,0.04)" : "rgba(17,24,39,0.5)",
            padding: pdfFile ? "12px 16px" : "20px 16px",
            minHeight: 72,
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {pdfFile ? (
            <div className="flex items-center gap-2.5 w-full">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(45,140,255,0.15)" }}>
                <FileText size={15} color="#2D8CFF" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{pdfFile.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {(pdfFile.size / 1024 / 1024).toFixed(1)} MB · Click to change
                </p>
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