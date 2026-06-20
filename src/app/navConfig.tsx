import { Home, Library, Brain, Network, BarChart2, Layers, UserCircle } from "lucide-react"
import type { View } from "./types"

export const NAV_ITEMS: { view: View, label: string, icon: React.FC<any> }[] = [
  { view: "home", label: "Home", icon: Home },
  { view: "library", label: "Library", icon: Library },
  { view: "ai", label: "Nexus AI", icon: Brain },
  { view: "graph", label: "Knowledge", icon: Network },
  { view: "learning", label: "Analytics", icon: BarChart2 },
  { view: "flashcards", label: "Flashcards", icon: Layers },
  { view: "profile", label: "Profile", icon: UserCircle },
]