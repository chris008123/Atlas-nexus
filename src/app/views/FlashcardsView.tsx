import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { RotateCcw, Check, ArrowRight, Loader } from "lucide-react"
import { supabase } from "../supabaseClient"

type Flashcard = {
  id: string
  front: string
  back: string
  book: string
  difficulty: "easy" | "medium" | "hard"
}

export function FlashcardsView() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: true })
      if (!error && data) setCards(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader size={22} color="#2D8CFF" className="animate-spin" />
        <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading flashcards…</p>
      </div>
    </div>
  )

  if (cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>No flashcards yet.</p>
      <p className="text-xs text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Add some from the Supabase dashboard or via the AI view.</p>
    </div>
  )

  const card = cards[currentIdx]
  const diffColor = { easy: "#22C55E", medium: "#F59E0B", hard: "#EF4444" }[card.difficulty] ?? "#A855F7"

  function handleNext() {
    setFlipped(false)
    setTimeout(() => setCurrentIdx(i => (i + 1) % cards.length), 100)
  }

  function handleKnow() {
    setCompleted(s => new Set([...s, card.id]))
    handleNext()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Flashcards</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            AI-generated · Spaced repetition enabled
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: "#2D8CFF", fontFamily: "'Chakra Petch', sans-serif" }}>
            {completed.size}/{cards.length}
          </p>
          <p className="text-xs text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Mastered</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #2D8CFF, #5AA9FF)" }}
          animate={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <p className="text-xs text-center text-white/30 -mt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Card {currentIdx + 1} of {cards.length}
      </p>

      {/* Card */}
      <div className="flex justify-center">
        <motion.div
          className="w-full max-w-lg cursor-pointer select-none"
          style={{ perspective: "1000px" }}
          onClick={() => setFlipped(f => !f)}
        >
          <motion.div
            className="relative"
            style={{ transformStyle: "preserve-3d", minHeight: "280px" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-7 flex flex-col"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: "linear-gradient(135deg, #111827 0%, #0D1626 100%)",
                border: "1px solid rgba(45,140,255,0.18)",
                boxShadow: "0 20px 60px rgba(5,8,22,0.6)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${diffColor}30` }}>
                  {card.difficulty.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>QUESTION</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl font-semibold text-white text-center leading-relaxed" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                  {card.front}
                </p>
              </div>
              <div className="mt-6 text-center">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(45,140,255,0.08)", color: "#2D8CFF", fontFamily: "'DM Sans', sans-serif" }}>
                  {card.book}
                </span>
              </div>
              <p className="text-center text-xs text-white/20 mt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>tap to reveal</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl p-7 flex flex-col"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: "linear-gradient(135deg, #0D1F3C 0%, #0A1628 100%)",
                border: "1px solid rgba(45,140,255,0.3)",
                boxShadow: "0 20px 60px rgba(45,140,255,0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ANSWER</span>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {card.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-base text-white/90 text-center leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-line" }}>
                  {card.back}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontFamily: "'DM Sans', sans-serif" }}
        >
          <RotateCcw size={14} /> Again
        </button>
        <button
          onClick={handleKnow}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22C55E", fontFamily: "'DM Sans', sans-serif" }}
        >
          <Check size={14} /> Got it
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
          style={{ background: "rgba(45,140,255,0.12)", border: "1px solid rgba(45,140,255,0.25)", color: "#2D8CFF", fontFamily: "'DM Sans', sans-serif" }}
        >
          Skip <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}