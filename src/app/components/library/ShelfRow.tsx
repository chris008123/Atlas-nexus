import { LibraryBookCard } from "./LibraryBookCard"
import type { Book } from "../../mockData"

export function ShelfRow({ shelfName, books, onOpen }: { shelfName: string, books: Book[], onOpen: (b: Book) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{shelfName}</h3>
        <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{books.length} books</span>
      </div>
      <div
        className="relative rounded-xl p-4 pb-6"
        style={{
          background: "linear-gradient(180deg, rgba(17,24,39,0.45) 0%, rgba(17,24,39,0.12) 100%)",
          border: "1px solid rgba(45,140,255,0.07)",
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {books.map((book, i) => (
            <div key={book.id} className="flex-shrink-0 w-32">
              <LibraryBookCard book={book} index={i} onOpen={onOpen} />
            </div>
          ))}
        </div>
        {/* Glass shelf ledge */}
        <div
          className="absolute bottom-2 left-4 right-4 h-2 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(45,140,255,0.2), transparent)",
            boxShadow: "0 6px 18px rgba(45,140,255,0.1)",
          }}
        />
      </div>
    </div>
  )
}
