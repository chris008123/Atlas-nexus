import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Loader } from "lucide-react"
import { GlassCard } from "../components/Shared"
import { supabase } from "../supabaseClient"
import type { Book } from "../mockData"

type Node = {
  id: string
  label: string
  x: number
  y: number
  color: string
  type: "book" | "concept"
  size: number
}

type Edge = { from: string; to: string }

// Derive concept nodes and edges from real books
function buildGraph(books: Book[]): { nodes: Node[], edges: Edge[] } {
  const WIDTH = 780
  const HEIGHT = 460
  const PADDING = 80

  // Place book nodes in a rough circle
  const bookNodes: Node[] = books.map((book, i) => {
    const angle = (i / books.length) * Math.PI * 2 - Math.PI / 2
    const rx = (WIDTH / 2 - PADDING) * 0.72
    const ry = (HEIGHT / 2 - PADDING) * 0.72
    return {
      id: `book-${book.id}`,
      label: book.title.length > 18 ? book.title.slice(0, 16) + "…" : book.title,
      x: Math.round(WIDTH / 2 + rx * Math.cos(angle)),
      y: Math.round(HEIGHT / 2 + ry * Math.sin(angle)),
      color: book.color,
      type: "book",
      size: 40,
    }
  })

  // Build concept nodes from shelf names
  const shelves = [...new Set(books.map(b => b.shelf))]
  const conceptNodes: Node[] = shelves.map((shelf, i) => {
    const angle = (i / shelves.length) * Math.PI * 2
    const rx = (WIDTH / 2 - PADDING) * 0.3
    const ry = (HEIGHT / 2 - PADDING) * 0.3
    return {
      id: `concept-${shelf}`,
      label: shelf,
      x: Math.round(WIDTH / 2 + rx * Math.cos(angle)),
      y: Math.round(HEIGHT / 2 + ry * Math.sin(angle)),
      color: books.find(b => b.shelf === shelf)?.color ?? "#5AA9FF",
      type: "concept",
      size: 28,
    }
  })

  // Edges: each book connects to its shelf concept
  const edges: Edge[] = books.map(book => ({
    from: `book-${book.id}`,
    to: `concept-${book.shelf}`,
  }))

  return { nodes: [...bookNodes, ...conceptNodes], edges }
}

export function GraphView() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("books").select("*")
      if (!error && data) setBooks(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Loader size={22} color="#2D8CFF" className="animate-spin" />
        <p className="text-xs text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>Building knowledge graph…</p>
      </div>
    </div>
  )

  const { nodes, edges } = buildGraph(books)
  const getNode = (id: string) => nodes.find(n => n.id === id)!
  const active = selectedNode || hoveredNode

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Knowledge Graph</h1>
          <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {nodes.filter(n => n.type === "book").length} books · {nodes.filter(n => n.type === "concept").length} concepts · {edges.length} connections
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2D8CFF" }} />
            <span className="text-white/40">Books</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-white/30" />
            <span className="text-white/40">Shelves</span>
          </div>
        </div>
      </div>

      <GlassCard className="relative overflow-hidden" style={{ height: "460px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(45,140,255,0.04) 0%, transparent 70%)"
        }} />

        {books.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/25" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Add books to your library to see the graph.
            </p>
          </div>
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 780 460" className="relative z-10">
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = getNode(edge.from)
              const to = getNode(edge.to)
              if (!from || !to) return null
              const isHighlighted = active === edge.from || active === edge.to
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isHighlighted ? "rgba(45,140,255,0.5)" : "rgba(45,140,255,0.12)"}
                  strokeWidth={isHighlighted ? 1.5 : 0.8}
                  strokeDasharray={isHighlighted ? "none" : "4,4"}
                  style={{ transition: "all 0.2s ease" }}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isActive = active === node.id
              const isDimmed = active && !isActive && !edges.some(e =>
                (e.from === active && e.to === node.id) || (e.to === active && e.from === node.id)
              )
              return (
                <g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  opacity={isDimmed ? 0.2 : 1}
                >
                  {isActive && (
                    <circle cx={node.x} cy={node.y} r={node.size * 1.6} fill={node.color} opacity={0.08} />
                  )}
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.type === "concept" ? node.size * 0.55 : node.size * 0.72}
                    fill={isActive ? node.color : `${node.color}22`}
                    stroke={isActive ? node.color : `${node.color}55`}
                    strokeWidth={node.type === "concept" ? 1 : 1.5}
                    style={{ transition: "all 0.2s ease" }}
                  />
                  {node.type === "book" && (
                    <circle
                      cx={node.x} cy={node.y} r={node.size * 0.3}
                      fill={isActive ? "#fff" : node.color}
                      opacity={isActive ? 0.9 : 0.4}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  )}
                  <text
                    x={node.x}
                    y={node.y + (node.type === "concept" ? node.size * 0.7 : node.size * 0.95)}
                    textAnchor="middle"
                    fontSize={node.type === "concept" ? 9 : 10}
                    fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)"}
                    fontFamily="'DM Sans', sans-serif"
                    fontWeight={isActive ? "600" : "400"}
                    style={{ transition: "all 0.2s ease", pointerEvents: "none" }}
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        )}

        {/* Selected node info */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-64 p-3.5 rounded-xl"
              style={{ background: "rgba(10,15,31,0.95)", border: "1px solid rgba(45,140,255,0.2)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs mb-1 font-medium" style={{ color: getNode(selectedNode)?.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {getNode(selectedNode)?.type.toUpperCase()}
                  </p>
                  <p className="font-bold text-white text-sm" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
                    {getNode(selectedNode)?.label}
                  </p>
                  <p className="text-xs text-white/40 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {edges.filter(e => e.from === selectedNode || e.to === selectedNode).length} connections
                  </p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <p className="text-xs text-center text-white/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Click nodes to explore connections · Hover to preview
      </p>
    </div>
  )
}