export const BOOKS = [
  { id: 1, title: "Atomic Habits", author: "James Clear", shelf: "Psychology", progress: 78, color: "#4A90D9", status: "reading", pages: 320, highlights: 34, notes: 12, timeSpent: "6h 42m" },
  { id: 2, title: "The Art of War", author: "Sun Tzu", shelf: "Strategy", progress: 100, color: "#E5534B", status: "completed", pages: 272, highlights: 18, notes: 7, timeSpent: "3h 14m" },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", shelf: "Programming", progress: 45, color: "#57B77E", status: "reading", pages: 431, highlights: 22, notes: 9, timeSpent: "4h 20m" },
  { id: 4, title: "48 Laws of Power", author: "Robert Greene", shelf: "Strategy", progress: 100, color: "#9B59B6", status: "completed", pages: 452, highlights: 61, notes: 24, timeSpent: "11h 8m" },
  { id: 5, title: "Mastery", author: "Robert Greene", shelf: "Psychology", progress: 22, color: "#F39C12", status: "reading", pages: 352, highlights: 8, notes: 3, timeSpent: "2h 5m" },
  { id: 6, title: "Deep Work", author: "Cal Newport", shelf: "Psychology", progress: 100, color: "#1ABC9C", status: "completed", pages: 296, highlights: 29, notes: 11, timeSpent: "5h 50m" },
  { id: 7, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", shelf: "Psychology", progress: 65, color: "#3498DB", status: "reading", pages: 499, highlights: 47, notes: 18, timeSpent: "9h 12m" },
  { id: 8, title: "The Lean Startup", author: "Eric Ries", shelf: "Business", progress: 89, color: "#E74C3C", status: "reading", pages: 336, highlights: 31, notes: 14, timeSpent: "7h 30m" },
  { id: 9, title: "Zero to One", author: "Peter Thiel", shelf: "Business", progress: 100, color: "#2ECC71", status: "completed", pages: 224, highlights: 43, notes: 20, timeSpent: "4h 22m" },
  { id: 10, title: "Influence", author: "Robert Cialdini", shelf: "Psychology", progress: 33, color: "#F1C40F", status: "reading", pages: 368, highlights: 14, notes: 5, timeSpent: "3h 5m" },
  { id: 11, title: "The Pragmatic Programmer", author: "Hunt & Thomas", shelf: "Programming", progress: 15, color: "#9B59B6", status: "reading", pages: 352, highlights: 6, notes: 2, timeSpent: "1h 48m" },
  { id: 12, title: "Superintelligence", author: "Nick Bostrom", shelf: "AI", progress: 55, color: "#2D8CFF", status: "reading", pages: 390, highlights: 28, notes: 10, timeSpent: "5h 15m" },
  { id: 13, title: "The Innovator's Dilemma", author: "Clayton Christensen", shelf: "Business", progress: 72, color: "#FF6B6B", status: "reading", pages: 288, highlights: 19, notes: 8, timeSpent: "4h 45m" },
  { id: 14, title: "Human Compatible", author: "Stuart Russell", shelf: "AI", progress: 38, color: "#4ECDC4", status: "reading", pages: 352, highlights: 16, notes: 6, timeSpent: "3h 20m" },
]

export type Book = {
  id: string | number
  title: string
  author: string
  shelf: string
  progress: number
  color: string
  status: "reading" | "completed"
  pages: number
  highlights: number
  notes: number
  timeSpent: string
  pdf_url?: string | null
}

export const SHELVES = ["All", "Psychology", "Strategy", "Programming", "Business", "AI"]

export const READING_DATA = [
  { day: "Mon", pages: 42, minutes: 35 },
  { day: "Tue", pages: 28, minutes: 22 },
  { day: "Wed", pages: 65, minutes: 54 },
  { day: "Thu", pages: 18, minutes: 14 },
  { day: "Fri", pages: 84, minutes: 72 },
  { day: "Sat", pages: 120, minutes: 98 },
  { day: "Sun", pages: 95, minutes: 82 },
]

export const CATEGORY_DATA = [
  { name: "Psychology", value: 6, fill: "#4A90D9" },
  { name: "Strategy", value: 2, fill: "#E5534B" },
  { name: "Programming", value: 2, fill: "#57B77E" },
  { name: "Business", value: 3, fill: "#F39C12" },
  { name: "AI", value: 2, fill: "#2D8CFF" },
]

export const GRAPH_NODES = [
  { id: "atomic", label: "Atomic Habits", x: 220, y: 160, color: "#4A90D9", type: "book", size: 44 },
  { id: "influence", label: "Influence", x: 420, y: 110, color: "#F1C40F", type: "book", size: 40 },
  { id: "48laws", label: "48 Laws of Power", x: 590, y: 170, color: "#9B59B6", type: "book", size: 44 },
  { id: "deepwork", label: "Deep Work", x: 160, y: 320, color: "#1ABC9C", type: "book", size: 40 },
  { id: "mastery", label: "Mastery", x: 380, y: 290, color: "#F39C12", type: "book", size: 40 },
  { id: "artofwar", label: "The Art of War", x: 620, y: 330, color: "#E5534B", type: "book", size: 40 },
  { id: "zerotoone", label: "Zero to One", x: 470, y: 430, color: "#2ECC71", type: "book", size: 36 },
  { id: "super", label: "Superintelligence", x: 280, y: 430, color: "#2D8CFF", type: "book", size: 36 },
  { id: "habit", label: "Habit Formation", x: 310, y: 200, color: "#5AA9FF", type: "concept", size: 28 },
  { id: "power", label: "Power & Influence", x: 510, y: 230, color: "#C084FC", type: "concept", size: 28 },
  { id: "focus", label: "Deep Focus", x: 240, y: 370, color: "#34D399", type: "concept", size: 26 },
  { id: "strategy", label: "Strategy", x: 580, y: 430, color: "#FCA5A5", type: "concept", size: 26 },
]

export const GRAPH_EDGES = [
  { from: "atomic", to: "habit" },
  { from: "influence", to: "habit" },
  { from: "influence", to: "power" },
  { from: "48laws", to: "power" },
  { from: "mastery", to: "power" },
  { from: "mastery", to: "habit" },
  { from: "deepwork", to: "focus" },
  { from: "atomic", to: "focus" },
  { from: "artofwar", to: "strategy" },
  { from: "48laws", to: "strategy" },
  { from: "zerotoone", to: "strategy" },
  { from: "super", to: "focus" },
  { from: "deepwork", to: "mastery" },
  { from: "influence", to: "48laws" },
]

export const FLASHCARDS = [
  { id: 1, front: "What is the 4th Law of Behavior Change?", back: "Make it satisfying. We are more likely to repeat a behavior when the experience is satisfying — the final reward must align with the habit identity.", book: "Atomic Habits", difficulty: "medium" },
  { id: 2, front: "Define the Halo Effect", back: "Our overall impression of a person influences how we feel and think about their character. If someone is well-dressed, we assume they are also intelligent and competent.", book: "Thinking, Fast and Slow", difficulty: "easy" },
  { id: 3, front: "What is a Minimum Viable Product (MVP)?", back: "The version of a new product that allows a team to collect the maximum amount of validated learning about customers with the least effort.", book: "The Lean Startup", difficulty: "easy" },
  { id: 4, front: "Name the 3 stages of the Habit Loop", back: "Cue → Routine → Reward. The cue triggers a craving, the routine satisfies it, and the reward teaches the brain to repeat the loop.", book: "Atomic Habits", difficulty: "easy" },
  { id: 5, front: "What is 'Deep Work' as defined by Cal Newport?", back: "Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit, creating new value and improving your skill.", book: "Deep Work", difficulty: "medium" },
]

export const AI_MESSAGES_INIT = [
  {
    id: 1, role: "assistant",
    content: "Welcome to Nexus AI. I have indexed all 247 books across your library. What would you like to explore today?",
    timestamp: "9:41 AM"
  },
  {
    id: 2, role: "user",
    content: "What are the key themes in Atomic Habits?",
    timestamp: "9:42 AM"
  },
  {
    id: 3, role: "assistant",
    content: "Based on your 34 highlights and my full analysis of Atomic Habits, the four core themes are:\n\n**1. Identity-Based Habits** — You don't rise to the level of your goals, you fall to the level of your systems. Every habit vote casts is a vote for the person you want to become.\n\n**2. The Four Laws of Behavior Change** — Make it obvious, attractive, easy, and satisfying.\n\n**3. Compound Effects** — A 1% improvement every day results in 37× improvement over a year. Small habits don't add up — they compound.\n\n**4. Environment Design** — Your environment shapes your behavior more than motivation or willpower ever will.\n\nYou've highlighted 34 passages across these themes. Want me to generate flashcards from your highlights?",
    timestamp: "9:42 AM"
  },
]

export const AI_SUGGESTIONS = [
  "Summarize my last 3 completed books",
  "Find contradictions across my library",
  "Generate a reading roadmap for leadership",
  "What concepts appear in 3+ books?",
  "Create a study guide for this week",
]


