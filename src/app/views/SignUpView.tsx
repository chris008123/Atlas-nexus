import { useState } from "react"
import { motion } from "motion/react"
import { Mail, Lock, User, Eye, EyeOff, Loader } from "lucide-react"
import { supabase } from "../supabaseClient"

export function SignUpView({ onSwitch }: { onSwitch: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #050816 0%, #0A0F1F 100%)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center p-8 rounded-2xl"
        style={{ background: "linear-gradient(135deg, #111827, #0A0F1F)", border: "1px solid rgba(45,140,255,0.2)" }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <Mail size={24} color="#22C55E" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Check your email</h2>
        <p className="text-sm text-white/50 mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          We sent a confirmation link to <span className="text-white/80">{email}</span>. Click it to activate your account.
        </p>
        <button
          onClick={onSwitch}
          className="text-xs text-[#2D8CFF] hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Back to Sign In
        </button>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #050816 0%, #0A0F1F 100%)" }}>
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(45,140,255,0.06)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px]" style={{ background: "rgba(90,169,255,0.04)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", boxShadow: "0 0 20px rgba(45,140,255,0.4)" }}>
            <span className="text-white font-bold" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>A-N</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "0.05em" }}>ATLAS NEXUS</p>
            <p className="text-[9px] text-white/30 mt-0.5 tracking-widest uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Knowledge OS</p>
          </div>
        </div>

        <div className="rounded-2xl p-7" style={{ background: "linear-gradient(135deg, #111827, #0A0F1F)", border: "1px solid rgba(45,140,255,0.18)", boxShadow: "0 0 60px rgba(45,140,255,0.08)" }}>
          <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>Create account</h2>
          <p className="text-xs text-white/40 mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>Start building your second brain.</p>

          <div className="space-y-3">
            {/* Name */}
            <div className="relative">
              <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white/85 outline-none transition-colors"
                style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white/85 outline-none transition-colors"
                style={{ background: "rgba(17,24,39,0.7)", border: "1px solid rgba(45,140,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                onKeyDown={e => e.key === "Enter" && handleSignUp()}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-white/85 outline-none transition-colors"
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

          {error && (
            <p className="mt-3 text-xs text-red-400 px-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
          )}

          <button
            onClick={handleSignUp}
            disabled={loading || !name.trim() || !email.trim() || !password.trim()}
            className="w-full mt-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #2D8CFF, #1a6fd4)", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}
          >
            {loading ? <Loader size={14} className="animate-spin" /> : "Create account"}
          </button>

          <p className="text-center text-xs text-white/30 mt-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Already have an account?{" "}
            <button onClick={onSwitch} className="text-[#2D8CFF] hover:opacity-80 transition-opacity">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}