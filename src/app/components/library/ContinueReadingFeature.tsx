import { motion } from "motion/react"
import { BookMarked, Play } from "lucide-react"
import { BookCover, ProgressBar } from "../Shared"
import type { Book } from "../../mockData"

export function ContinueReadingFeature({ book, onOpen }: { book: Book, onOpen: (b: Book) => void }) {
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
