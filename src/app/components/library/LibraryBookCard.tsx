import { motion } from "motion/react"
import { Highlighter, MessageSquare, Play, Sparkles } from "lucide-react"
import { GlassCard, BookCover, ProgressBar } from "../Shared"
import type { Book } from "../../mockData"

export function LibraryBookCard({ book, index, onOpen }: { book: Book, index: number, onOpen: (b: Book) => void }) {
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
          <p className="text-xs font-semibold line-clamp-2 mb-0.5 leading-tight text-[var(--text)]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            {book.title}
          </p>
          <p className="text-[10px] mb-2 text-[var(--text3)]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{book.author}</p>
          <ProgressBar value={book.progress} color={book.color} />
          <div className="flex justify-between mt-1.5 text-[9px]" style={{ color: book.color, fontFamily: "'JetBrains Mono', monospace" }}>
            <span>{book.progress}%</span>
            <span>{book.highlights} hl</span>
          </div>
        </div>

        {/* Hover reveal — shown without opening the modal */}
        <div
          className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, var(--card-scrim) 38%)" }}
        >
          <div className="grid grid-cols-2 gap-1 text-[9px] mb-1.5 text-[var(--text2)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="flex items-center gap-1"><Highlighter size={9} color={book.color} />{book.highlights}</div>
            <div className="flex items-center gap-1"><MessageSquare size={9} color={book.color} />{book.notes}</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: book.color }}>
            <Play size={9} fill="currentColor" /> Continue Reading
          </div>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-[var(--text3)]">
            <Sparkles size={8} /> AI Summary available
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}