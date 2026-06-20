import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { User, Mail, Lock, Save, Loader, Check, BookOpen, Clock, Star, Trash2, Eye, EyeOff } from "lucide-react"
import { supabase } from "../supabaseClient"
import { GlassCard, StatCard } from "../components/Shared"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function ProfileView() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, reading: 0, completed: 0, highlights: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setFullName(user.user_metadata?.full_name ?? "")
        setEmail(user.email ?? "")
      }
    })

    supabase.from("books").select("status, highlights").then(({ data }) => {
      if (data) {
        setStats({
          total: data.length,
          reading: data.filter(b => b.status === "reading").length,
          completed: data.filter(b => b.status === "completed").length,
          highlights: data.reduce((s, b) => s + (b.highlights ?? 0), 0),
        })
      }
    })
  }, [])

  async function handleSaveName() {
    setSaving(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
    if (error) setError(error.message)
    else { setNameSuccess(true); setTimeout(() => setNameSuccess(false), 2500) }
    setSaving(false)
  }

  async function handleSavePassword() {
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return }
    setSavingPassword(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setError(error.message)
    else { setPasswordSuccess(true); setNewPassword(""); setTimeout(() => setPasswordSuccess(false), 2500) }
    setSavingPassword(false)
  }

  async function handleDeleteAccount() {
    // Signs out — full deletion requires a Supabase edge function
    await supabase.auth.signOut()
  }

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—"

  const initials = fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || email[0]?.toUpperCase() || "U"

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Profile</h1>
        <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>Manage your account and preferences</p>
      </div>

      {/* Avatar + identity */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2D8CFF, #9B59B6)", boxShadow: "0 0 24px rgba(45,140,255,0.3)" }}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
              {fullName || email}
            </h2>
            <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: user?.email_confirmed_at ? "#22C55E" : "#F59E0B" }} />
              <span className="text-[10px]" style={{ color: user?.email_confirmed_at ? "#22C55E" : "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>
                {user?.email_confirmed_at ? "Email verified" : "Email not verified"}
              </span>
              <span className="text-[10px] text-white/20 mx-1">·</span>
              <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Joined {joinedDate}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Library stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Books" value={stats.total} icon={BookOpen} color="#2D8CFF" subtitle="In your library" />
        <StatCard label="In Progress" value={stats.reading} icon={Clock} color="#F59E0B" subtitle="Currently reading" />
        <StatCard label="Completed" value={stats.completed} icon={Check} color="#22C55E" subtitle="Finished" />
        <StatCard label="Highlights" value={stats.highlights} icon={Star} color="#A855F7" subtitle="Saved passages" />
      </div>

      {/* Edit name */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Personal Info</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Full Name</label>
            <div className="relative">
              <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white/85 outline-none"
                style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Email</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={email}
                disabled
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white/40 outline-none cursor-not-allowed"
                style={{ background: "rgba(17,24,39,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <p className="text-[10px] text-white/25 mt-1.5 pl-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Email cannot be changed here.</p>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}

        <motion.button
          onClick={handleSaveName}
          disabled={saving}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
        >
          {saving ? <Loader size={13} className="animate-spin" /> : nameSuccess ? <Check size={13} /> : <Save size={13} />}
          {nameSuccess ? "Saved!" : "Save changes"}
        </motion.button>
      </GlassCard>

      {/* Change password */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Change Password</h3>
        <div>
          <label className="text-[10px] text-white/30 uppercase tracking-wide mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>New Password</label>
          <div className="relative">
            <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === "Enter" && handleSavePassword()}
              className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-white/85 outline-none"
              style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
            />
            <button
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        <motion.button
          onClick={handleSavePassword}
          disabled={savingPassword || !newPassword}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
        >
          {savingPassword ? <Loader size={13} className="animate-spin" /> : passwordSuccess ? <Check size={13} /> : <Lock size={13} />}
          {passwordSuccess ? "Password updated!" : "Update password"}
        </motion.button>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard className="p-6" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
        <h3 className="text-sm font-bold mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif", color: "#EF4444" }}>Danger Zone</h3>
        <p className="text-xs text-white/30 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>These actions are permanent and cannot be undone.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontFamily: "'DM Sans', sans-serif" }}
          >
            <Trash2 size={13} /> Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-white/50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Are you sure? This will sign you out immediately.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "#EF4444", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
              >
                <Trash2 size={13} /> Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}