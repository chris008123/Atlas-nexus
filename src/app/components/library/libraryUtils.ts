export function parseTimeSpent(timeSpent: string): number {
  if (!timeSpent) return 0
  const h = parseInt(timeSpent.match(/(\d+)h/)?.[1] || "0", 10)
  const m = parseInt(timeSpent.match(/(\d+)m/)?.[1] || "0", 10)
  return h + m / 60
}

export function formatHours(totalHours: number): number {
  return Math.round(totalHours)
}

export const NEW_BOOK_COLORS = ["#2D8CFF", "#5AA9FF", "#9B59B6", "#22C55E", "#F59E0B", "#E74C3C", "#1ABC9C", "#F1C40F"]
