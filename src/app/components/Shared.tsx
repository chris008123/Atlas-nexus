import { motion } from "motion/react"
import { Check } from "lucide-react"
import type { Book } from "../mockData"

export function BookCover({ book, className = "", size = "md" }: { book: Book, className?: string, size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-12 h-16" : size === "lg" ? "w-28 h-40" : "w-20 h-28"

  if (book.cover_url) {
    return (
      <div
        className={`${dims} ${className} rounded flex-shrink-0 relative overflow-hidden`}
        style={{ boxShadow: `0 4px 20px ${book.color}22`, border: `1px solid ${book.color}33` }}
      >
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {book.status === "completed" && (
          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: "#22C55E22", border: "1px solid #22C55E66" }}>
            <Check size={8} color="#22C55E" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`${dims} ${className} rounded flex-shrink-0 relative overflow-hidden`}
      style={{
        background: `linear-gradient(155deg, ${book.color}28 0%, ${book.color}55 60%, ${book.color}22 100%)`,
        borderLeft: `3px solid ${book.color}`,
        boxShadow: `0 4px 20px ${book.color}22`
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 80% 20%, ${book.color} 0%, transparent 60%)` }} />
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

export function ProgressBar({ value, color }: { value: number, color: string }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(130,140,165,0.15)" }}>
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

export function GlassCard({ children, className = "", hover = true, onClick }: {
  children: React.ReactNode, className?: string, hover?: boolean, onClick?: () => void
}) {
  return (
    <motion.div
      className={`rounded-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
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

export function StatCard({ label, value, icon: Icon, color, subtitle }: {
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
      <p className="text-2xl font-bold mb-0.5 text-[var(--text)]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{value}</p>
      <p className="text-xs font-medium text-[var(--text2)]">{label}</p>
      {subtitle && <p className="text-[10px] mt-1" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</p>}
    </GlassCard>
  )
}