import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, Search, Bell, Sun, Moon, Sparkles, Settings, LogOut, Loader } from "lucide-react"
import { LIGHT_THEME, DARK_THEME } from "./theme"
import type { View } from "./types"
import { NAV_ITEMS } from "./navConfig"
import { HomeView } from "./views/HomeView"
import { LibraryView } from "./views/LibraryView"
import { AIView } from "./views/AIView"
import { GraphView } from "./views/GraphView"
import { LearningView } from "./views/LearningView"
import { FlashcardsView } from "./views/FlashcardsView"
import { SignInView } from "./views/SignInView"
import { SignUpView } from "./views/SignUpView"
import { supabase } from "./supabaseClient"
import type { User } from "@supabase/supabase-js"

export default function App() {
  const [view, setView] = useState<View>("home")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authScreen, setAuthScreen] = useState<"signin" | "signup">("signin")

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  // Loading screen while checking auth
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050816" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", boxShadow: "0 0 20px rgba(45,140,255,0.4)" }}>
          <span className="text-white font-bold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>N</span>
        </div>
        <Loader size={16} color="#2D8CFF" className="animate-spin mt-1" />
      </div>
    </div>
  )

  // Auth screens
  if (!user) {
    return authScreen === "signin"
      ? <SignInView onSwitch={() => setAuthScreen("signup")} />
      : <SignUpView onSwitch={() => setAuthScreen("signin")} />
  }

  const displayName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "User"
  const initials = displayName[0]?.toUpperCase() ?? "U"

  return (
    <>
      <style>{isLight ? LIGHT_THEME : DARK_THEME}</style>
      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)" }}>

        {/* Background ambience */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(45,140,255,0.06)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]" style={{ background: "rgba(90,169,255,0.04)" }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(45,140,255,1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: "rgba(5,8,22,0.7)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          className="fixed md:relative z-40 md:z-auto flex-shrink-0 flex flex-col h-full"
          style={{ width: 220, background: "linear-gradient(180deg, #0A0F1F 0%, #050816 100%)", borderRight: "1px solid rgba(45,140,255,0.1)" }}
          initial={false}
          animate={{ x: sidebarOpen || typeof window !== "undefined" && window.innerWidth >= 768 ? 0 : -220 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Logo */}
          <div className="px-5 py-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", boxShadow: "0 0 16px rgba(45,140,255,0.4)" }}>
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>N</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "0.05em" }}>NEXUS</p>
              <p className="text-[9px] text-white/30 mt-0.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Knowledge OS</p>
            </div>
          </div>

          <div className="mx-4 h-px mb-4" style={{ background: "rgba(45,140,255,0.08)" }} />

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            {NAV_ITEMS.map(({ view: v, label, icon: Icon }) => {
              const active = view === v
              return (
                <button
                  key={v}
                  onClick={() => { setView(v); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
                  style={{ background: active ? "rgba(45,140,255,0.12)" : "transparent", border: `1px solid ${active ? "rgba(45,140,255,0.25)" : "transparent"}` }}
                >
                  <Icon size={16} color={active ? "#2D8CFF" : "rgba(255,255,255,0.35)"} style={{ flexShrink: 0 }} />
                  <span className="text-sm font-medium" style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
                    {label}
                  </span>
                  {active && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: "#2D8CFF" }} />}
                </button>
              )
            })}
          </nav>

          {/* Bottom user */}
          <div className="p-4">
            <div className="mx-0 h-px mb-4" style={{ background: "rgba(45,140,255,0.08)" }} />
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #2D8CFF, #9B59B6)" }}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white leading-none">{displayName}</p>
                <p className="text-[10px] text-white/30 mt-0.5 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.email}</p>
              </div>
              <button onClick={handleSignOut} title="Sign out" className="text-white/25 hover:text-white/60 transition-colors">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Top bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-6 py-4" style={{ borderBottom: "1px solid rgba(45,140,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <button
                className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                onClick={() => setSidebarOpen(s => !s)}
              >
                <Menu size={15} color="rgba(255,255,255,0.6)" />
              </button>
              <div className="relative hidden sm:block">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  placeholder="Quick search…"
                  className="pl-9 pr-4 py-2 rounded-xl text-xs text-white/70 outline-none w-56 transition-all focus:w-72"
                  style={{ background: "rgba(17,24,39,0.6)", border: "1px solid rgba(45,140,255,0.1)", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center relative hover:bg-white/[0.04] transition-colors" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <Bell size={14} color="rgba(255,255,255,0.45)" />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#2D8CFF" }} />
              </button>
              <button
                onClick={() => setIsLight(l => !l)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: "rgba(45,140,255,0.08)", border: "1px solid rgba(45,140,255,0.2)" }}
              >
                {isLight ? <Moon size={14} color="#5AA9FF" /> : <Sun size={14} color="#5AA9FF" />}
              </button>
              <button
                onClick={() => setView("ai")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-85"
                style={{ background: "rgba(45,140,255,0.12)", border: "1px solid rgba(45,140,255,0.22)", color: "#5AA9FF", fontFamily: "'DM Sans', sans-serif" }}
              >
                <Sparkles size={12} /> Ask AI
              </button>
            </div>
          </header>

          {/* View content */}
          <main className="flex-1 overflow-y-auto px-5 md:px-6 py-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(45,140,255,0.15) transparent" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="max-w-5xl mx-auto"
                style={{ minHeight: "100%" }}
              >
                {view === "home" && <HomeView onNavigate={setView} />}
                {view === "library" && <LibraryView />}
                {view === "ai" && <AIView />}
                {view === "graph" && <GraphView />}
                {view === "learning" && <LearningView />}
                {view === "flashcards" && <FlashcardsView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  )
}