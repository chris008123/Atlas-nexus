import { motion } from "motion/react"
import { Library, Plus } from "lucide-react"

export function EmptyLibraryState({ onAdd }: { onAdd: () => void }) {
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
