"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Eye, EyeOff, Mail, Lock, ChevronRight,
  Target, TrendingUp, CheckCircle, Shield, Brain, Star, ArrowLeft, Sun, Moon
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// ── Left panel floating preview cards ────────────────────────────────────────
function ScorePreviewCard({ isDark }: { isDark: boolean }) {
  const cardBg     = isDark ? "rgba(13,20,40,0.90)"      : "rgba(255,255,255,0.97)";
  const cardBorder = isDark ? "rgba(0,212,170,0.35)"      : "rgba(0,212,170,0.30)";
  const cardShadow = isDark ? "0 24px 60px rgba(0,0,0,0.60),0 0 30px rgba(0,212,170,0.12)" : "0 24px 60px rgba(0,0,0,0.10),0 0 30px rgba(0,212,170,0.08)";
  const titleCol   = isDark ? "#ffffff"                   : "#0F172A";
  const trackCol   = isDark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,0,0.07)";
  const labelCol   = isDark ? "rgba(255,255,255,0.55)"    : "rgba(15,23,42,0.55)";
  return (
    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="rounded-2xl p-5" style={{ width: 280, background: cardBg, border: `1.5px solid ${cardBorder}`, backdropFilter: "blur(20px)", boxShadow: cardShadow }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,170,0.18)" }}>
          <Sparkles size={13} style={{ color: "#00d4aa" }} />
        </div>
        <span className="text-sm font-black" style={{ color: titleCol }}>Resume Score</span>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,170,0.15)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.30)" }}>Live</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke={trackCol} strokeWidth="6" />
            <motion.circle cx="32" cy="32" r="26" fill="none" stroke="#00d4aa" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 26}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 26 * (1 - 0.87)}` }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              transform="rotate(-90 32 32)" style={{ filter: "drop-shadow(0 0 5px rgba(0,212,170,0.7))" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black" style={{ color: "#00d4aa" }}>87</span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: titleCol }}>Grade B+</p>
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa" }}>
            <TrendingUp size={9} /> +12 pts possible
          </div>
        </div>
      </div>
      {[
        { label: "ATS Compatibility", pct: 91, color: "#00d4aa" },
        { label: "Keyword Match",     pct: 74, color: "#6366f1" },
        { label: "Impact Score",      pct: 82, color: "#a855f7" },
      ].map(bar => (
        <div key={bar.label} className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: labelCol }}>{bar.label}</span>
            <span className="text-xs font-black" style={{ color: bar.color }}>{bar.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: trackCol }}>
            <motion.div className="h-full rounded-full" style={{ background: bar.color, width: `${bar.pct}%` }}
              initial={{ width: 0 }} animate={{ width: `${bar.pct}%` }} transition={{ duration: 1.2, delay: 0.8 }} />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function KeywordsCard({ isDark }: { isDark: boolean }) {
  const cardBg     = isDark ? "rgba(13,20,40,0.90)"   : "rgba(255,255,255,0.97)";
  const cardBorder = isDark ? "rgba(99,102,241,0.35)"  : "rgba(99,102,241,0.30)";
  const cardShadow = isDark ? "0 16px 48px rgba(0,0,0,0.55),0 0 24px rgba(99,102,241,0.12)" : "0 16px 48px rgba(0,0,0,0.08),0 0 24px rgba(99,102,241,0.06)";
  const labelCol   = isDark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.55)";
  const missingCol = isDark ? "rgba(255,255,255,0.40)" : "rgba(15,23,42,0.45)";
  return (
    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      className="rounded-2xl p-4" style={{ width: 240, background: cardBg, border: `1.5px solid ${cardBorder}`, backdropFilter: "blur(20px)", boxShadow: cardShadow }}>
      <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: labelCol }}>Keywords Found</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["React","TypeScript","Node.js","AWS","SQL"].map(kw => (
          <span key={kw} className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.25)" }}>✓ {kw}</span>
        ))}
      </div>
      <p className="text-xs font-bold mb-1.5" style={{ color: missingCol }}>Missing:</p>
      <div className="flex flex-wrap gap-1.5">
        {["Python","Docker"].map(kw => (
          <span key={kw} className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(239,68,68,0.10)", color: "#f87171", border: "1px solid rgba(239,68,68,0.22)" }}>✗ {kw}</span>
        ))}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggle } = useTheme();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!forgotMode && !password.trim()) { setError("Please enter your password."); return; }
    setLoading(true); setError("");
    // Simulate auth (replace with real auth)
    await new Promise(r => setTimeout(r, 1200));
    if (forgotMode) { setForgotSent(true); setLoading(false); return; }
    // Store session
    localStorage.setItem("ncv_user", JSON.stringify({ email, name: name || email.split("@")[0] }));
    router.push("/dashboard");
  };

  const handleGuest = () => {
    localStorage.setItem("ncv_user", JSON.stringify({ email: "guest@neuralcv.ai", name: "Guest" }));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex overflow-hidden transition-colors duration-500"
      style={{ background: isDark ? "#04080f" : "#F0F4FF" }}>
      {/* Theme toggle — fixed top right */}
      <button onClick={toggle}
        className="fixed top-4 right-4 z-50 w-12 h-6 rounded-full flex items-center px-0.5 transition-all duration-300"
        style={{ background:isDark?"linear-gradient(135deg,#0d1420,#1a2540)":"linear-gradient(135deg,#e8f4fd,#dbeeff)",
          border:isDark?"1px solid rgba(0,212,170,0.30)":"1px solid rgba(3,125,214,0.25)" }}>
        <motion.div animate={{ x:isDark?0:24 }} transition={{ type:"spring",stiffness:500,damping:30 }}
          className="w-5 h-5 rounded-full flex items-center justify-center shadow"
          style={{ background:isDark?"linear-gradient(135deg,#1e3a5f,#0d1420)":"linear-gradient(135deg,#fff,#f0f7ff)" }}>
          {isDark?<Moon size={10} style={{ color:"#00d4aa" }}/>:<Sun size={10} style={{ color:"#F6851B" }}/>}
        </motion.div>
      </button>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — branded, animated, theme-aware
      ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">

        {/* Gradient background */}
        <div className="absolute inset-0" style={{ background: isDark
          ? "linear-gradient(135deg,#04080f 0%,#0a0f2a 40%,#0d1833 70%,#06101e 100%)"
          : "linear-gradient(135deg,#f0f4ff 0%,#e8efff 40%,#f4f7ff 70%,#ffffff 100%)" }} />
        <motion.div animate={{ opacity:[0.15,0.28,0.15] }} transition={{ duration:8,repeat:Infinity }}
          className="absolute top-0 left-0 w-full h-1/2 rounded-full"
          style={{ background:isDark?"radial-gradient(ellipse,rgba(0,212,170,0.4) 0%,transparent 65%)":"radial-gradient(ellipse,rgba(0,212,170,0.18) 0%,transparent 65%)", filter:"blur(80px)", transform:"translate(-20%,-30%)" }} />
        <motion.div animate={{ opacity:[0.12,0.22,0.12] }} transition={{ duration:10,repeat:Infinity,delay:3 }}
          className="absolute bottom-0 right-0 w-full h-1/2 rounded-full"
          style={{ background:isDark?"radial-gradient(ellipse,rgba(99,102,241,0.45) 0%,transparent 65%)":"radial-gradient(ellipse,rgba(99,102,241,0.20) 0%,transparent 65%)", filter:"blur(100px)", transform:"translate(20%,30%)" }} />

        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: isDark?"radial-gradient(rgba(0,212,170,0.10) 1px,transparent 1px)":"radial-gradient(rgba(0,82,204,0.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 70%)",
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,212,170,0.18)",border:"1px solid rgba(0,212,170,0.40)" }}>
              <Sparkles size={18} style={{ color:"#00d4aa" }} />
            </div>
            <span className="font-black text-2xl tracking-tight" style={{ color:isDark?"#ffffff":"#0F172A" }}>NeuralCV</span>
          </button>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative w-full flex flex-col items-center gap-6">
            <ScorePreviewCard isDark={isDark} />
            <div className="self-end mr-4">
              <KeywordsCard isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="p-5 rounded-2xl" style={{
            background: isDark?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.85)",
            border: isDark?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(0,0,0,0.08)",
            backdropFilter:"blur(12px)"
          }}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="#f59e0b" style={{ color:"#f59e0b" }} />)}
            </div>
            <p className="text-sm italic mb-3" style={{ color:isDark?"rgba(255,255,255,0.75)":"rgba(15,23,42,0.72)" }}>
              &ldquo;NeuralCV boosted my ATS score from 52 to 91. I got 3 interview calls in the same week I applied after using it.&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black" style={{ background:"rgba(0,212,170,0.20)",color:"#00d4aa" }}>S</div>
              <div>
                <p className="text-sm font-black" style={{ color:isDark?"#ffffff":"#0F172A" }}>Sarah K.</p>
                <p className="text-xs" style={{ color:isDark?"rgba(255,255,255,0.45)":"rgba(15,23,42,0.50)" }}>Software Engineer · Hired at Meta</p>
              </div>
            </div>
          </div>

          {/* Feature bullets */}
          <div className="mt-5 flex flex-col gap-2.5">
            {[
              { icon:Brain,       text:"7 AI agents analyse every aspect" },
              { icon:Target,      text:"ATS score + actionable feedback" },
              { icon:Shield,      text:"Zero data stored · 100% private" },
              { icon:CheckCircle, text:"Free forever · No credit card" },
            ].map(({ icon:Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm font-medium" style={{ color:isDark?"rgba(255,255,255,0.65)":"rgba(15,23,42,0.65)" }}>
                <Icon size={14} style={{ color:"#00d4aa" }} /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — login form
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative" style={{ background: isDark ? "#04080f" : "#ffffff" }}>

        {/* Subtle top-right glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(3,125,214,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(3,125,214,0.12)", border: "1px solid rgba(3,125,214,0.25)" }}>
              <Sparkles size={16} style={{ color: "#037DD6" }} />
            </div>
            <span className="font-black text-xl" style={{ color: "#1A1D23" }}>NeuralCV</span>
          </div>

          <AnimatePresence mode="wait">
            {forgotSent ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(3,125,214,0.10)", border: "1.5px solid rgba(3,125,214,0.25)" }}>
                  <Mail size={28} style={{ color: "#037DD6" }} />
                </div>
                <h2 className="text-2xl font-black mb-3" style={{ color: "#1A1D23" }}>Check your inbox</h2>
                <p className="text-base mb-8" style={{ color: "rgba(26,29,35,0.65)" }}>We&apos;ve sent a reset link to <strong>{email}</strong></p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="text-sm font-bold flex items-center gap-1.5 mx-auto" style={{ color: "#037DD6" }}>
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* Heading */}
                <div className="mb-8">
                  <h1 className="text-3xl font-black mb-2" style={{ color: "#1A1D23" }}>
                    {forgotMode ? "Reset password" : tab === "signin" ? "Welcome back" : "Create account"}
                  </h1>
                  <p className="text-base" style={{ color: "rgba(26,29,35,0.60)" }}>
                    {forgotMode
                      ? "Enter your email and we'll send a reset link."
                      : tab === "signin"
                        ? "Sign in to access your resume analysis."
                        : "Start analysing resumes for free today."}
                  </p>
                </div>

                {/* Tab switch */}
                {!forgotMode && (
                  <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "rgba(0,0,0,0.05)" }}>
                    {(["signin", "signup"] as const).map(t => (
                      <button key={t} onClick={() => { setTab(t); setError(""); }}
                        className="flex-1 py-2.5 rounded-lg text-sm font-black transition-all"
                        style={{
                          background: tab === t ? "#ffffff" : "transparent",
                          color: tab === t ? "#1A1D23" : "rgba(26,29,35,0.50)",
                          boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                        }}>
                        {t === "signin" ? "Sign In" : "Sign Up"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  {tab === "signup" && !forgotMode && (
                    <div>
                      <label className="text-sm font-bold mb-1.5 block" style={{ color: "#1A1D23" }}>Full Name</label>
                      <div className="relative">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith"
                          className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "#F8F9FA", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1A1D23", outline: "none" }}
                          onFocus={e => { e.target.style.borderColor = "#037DD6"; e.target.style.boxShadow = "0 0 0 3px rgba(3,125,214,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.10)"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold mb-1.5 block" style={{ color: "#1A1D23" }}>Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,29,35,0.40)" }} />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                        style={{ background: "#F8F9FA", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1A1D23", outline: "none" }}
                        onFocus={e => { e.target.style.borderColor = "#037DD6"; e.target.style.boxShadow = "0 0 0 3px rgba(3,125,214,0.12)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.10)"; e.target.style.boxShadow = "none"; }} />
                    </div>
                  </div>

                  {!forgotMode && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-bold" style={{ color: "#1A1D23" }}>Password</label>
                        {tab === "signin" && (
                          <button type="button" onClick={() => { setForgotMode(true); setError(""); }} className="text-xs font-bold hover:underline" style={{ color: "#037DD6" }}>
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,29,35,0.40)" }} />
                        <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                          className="w-full pl-10 pr-12 py-3.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "#F8F9FA", border: "1.5px solid rgba(0,0,0,0.10)", color: "#1A1D23", outline: "none" }}
                          onFocus={e => { e.target.style.borderColor = "#037DD6"; e.target.style.boxShadow = "0 0 0 3px rgba(3,125,214,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.10)"; e.target.style.boxShadow = "none"; }} />
                        <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1" style={{ color: "rgba(26,29,35,0.40)" }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-sm font-medium" style={{ color: "#D94F3D" }}>{error}</motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2.5 mt-1 transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#037DD6,#5C21A1)", color: "#fff", boxShadow: "0 4px 20px rgba(3,125,214,0.35)" }}>
                    {loading ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Processing...</>
                    ) : (
                      <>{forgotMode ? "Send Reset Link" : tab === "signin" ? "Sign In" : "Create Account"} <ChevronRight size={17} /></>
                    )}
                  </motion.button>
                </form>

                {/* Forgot back */}
                {forgotMode && (
                  <button onClick={() => { setForgotMode(false); setError(""); }} className="mt-4 text-sm font-bold flex items-center gap-1.5 mx-auto" style={{ color: "rgba(26,29,35,0.55)" }}>
                    <ArrowLeft size={13} /> Back to sign in
                  </button>
                )}

                {!forgotMode && (
                  <>
                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                      <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.10)" }} />
                      <span className="text-xs font-semibold" style={{ color: "rgba(26,29,35,0.40)" }}>or continue with</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.10)" }} />
                    </div>

                    {/* OAuth + Guest buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-100"
                        style={{ border: "1.5px solid rgba(0,0,0,0.12)", color: "#1A1D23", background: "#ffffff" }}>
                        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                        Google
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:bg-blue-700"
                        style={{ border: "1.5px solid #0A66C2", color: "#ffffff", background: "#0A66C2" }}>
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </button>
                    </div>

                    {/* Guest access */}
                    <button onClick={handleGuest}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                      style={{ border: "1.5px dashed rgba(0,0,0,0.15)", color: "rgba(26,29,35,0.60)" }}>
                      Continue as Guest (no account needed)
                    </button>
                  </>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy note */}
          <p className="mt-8 text-xs text-center flex items-center justify-center gap-1.5" style={{ color: "rgba(26,29,35,0.40)" }}>
            <Shield size={11} /> No data stored · Privacy guaranteed · Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
