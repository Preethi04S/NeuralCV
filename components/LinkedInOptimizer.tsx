"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Sparkles, RefreshCw, ChevronRight, DollarSign, Users, Briefcase, Star, MessageCircle, UserPlus, BarChart2, Link2 } from "lucide-react";

// LinkedIn "in" logo as inline SVG
const LiIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
import type { AnalysisResult } from "@/types/analysis";

interface Headline { text: string; strategy: string; why: string; }
interface LinkedInData {
  headlines: Headline[];
  about: string;
  skills: string[];
  connectionMessage: string;
  salaryRange: string;
  profileStrength: number;
}

interface Props { result: AnalysisResult; isDark?: boolean; }

function CopyButton({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="shrink-0 p-1.5 rounded-lg transition-colors"
      style={{ color: copied ? "#22c55e" : t3 }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ── LinkedIn mock profile card ──────────────────────────────────────────────
function LinkedInCard({ name, headline, skills, experienceLevel, isDark }: {
  name: string; headline: string; skills: string[]; experienceLevel: string; isDark: boolean;
}) {
  const initials = (name || "YN").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isDark ? "#1B1F2E" : "#FFFFFF",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.10)",
      }}>

      {/* Banner */}
      <div className="h-20 relative"
        style={{ background: "linear-gradient(135deg, #0A66C2 0%, #004182 60%, #0D9488 100%)" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)" }} />
        {/* LinkedIn watermark */}
        <div className="absolute top-2 right-3 flex items-center gap-1.5 opacity-60">
          <LiIcon size={14} color="#fff" />
          <span className="text-xs font-bold text-white">LinkedIn</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 pb-4 relative">
        <div className="absolute -top-8 left-5 w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-4 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0A66C2, #0D9488)",
            borderColor: isDark ? "#1B1F2E" : "#FFFFFF",
            color: "#fff",
          }}>
          {initials}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 pb-2">
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
            style={{ borderColor: "#0A66C2", color: "#0A66C2", background: "transparent" }}>
            <span className="flex items-center gap-1"><MessageCircle size={11} /> Message</span>
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: "#0A66C2" }}>
            <span className="flex items-center gap-1"><UserPlus size={11} /> Connect</span>
          </button>
        </div>

        {/* Name + headline */}
        <div className="mt-1">
          <h3 className="text-base font-bold" style={{ color: isDark ? "#E8EAED" : "#1A1D23" }}>{name || "Your Name"}</h3>
          <p className="text-sm mt-1 leading-snug" style={{ color: isDark ? "rgba(232,234,237,0.75)" : "rgba(26,29,35,0.70)" }}>
            {headline || "Your optimized headline will appear here"}
          </p>
          <p className="text-xs mt-1.5" style={{ color: isDark ? "rgba(232,234,237,0.45)" : "rgba(26,29,35,0.75)" }}>
            {experienceLevel?.charAt(0).toUpperCase()}{experienceLevel?.slice(1)} level · Open to opportunities
          </p>
        </div>

        {/* Skills tags */}
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.slice(0, 5).map((s, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: isDark ? "rgba(10,102,194,0.15)" : "rgba(10,102,194,0.08)",
                  color: isDark ? "#7BB5E8" : "#0A66C2",
                  border: "1px solid rgba(10,102,194,0.25)"
                }}>
                {s}
              </span>
            ))}
            {skills.length > 5 && (
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: isDark ? "rgba(232,234,237,0.45)" : "rgba(26,29,35,0.75)" }}>
                +{skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Profile strength meter ───────────────────────────────────────────────────
function StrengthMeter({ score, isDark }: { score: number; isDark: boolean }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#f87171";
  const label = score >= 80 ? "All-Star" : score >= 60 ? "Advanced" : "Intermediate";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-6" style={{ color }}>{score}</span>
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
        style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>{label}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function LinkedInOptimizer({ result, isDark = true }: Props) {
  const [loading, setLoading]               = useState(false);
  const [data, setData]                     = useState<LinkedInData | null>(null);
  const [error, setError]                   = useState("");
  const [selectedHeadline, setSelectedHeadline] = useState(0);
  const [aboutExpanded, setAboutExpanded]   = useState(false);
  const [copiedAbout, setCopiedAbout]       = useState(false);
  const [copiedMsg, setCopiedMsg]           = useState(false);

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent  = isDark ? "#00d4aa" : "#0A66C2";
  const surface = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)";

  const generate = async () => {
    setLoading(true); setError(""); setData(null); setSelectedHeadline(0);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.resumeProfile?.name,
          targetRole: result.resumeProfile?.roles?.[0] ?? "",
          experienceLevel: result.resumeProfile?.experienceLevel,
          experienceYears: result.resumeProfile?.experienceYears,
          topSkills: result.resumeProfile?.topSkills ?? [],
          matchedKeywords: result.matchedKeywords ?? [],
          missingKeywords: result.missingKeywords ?? [],
          strengths: result.strengths ?? [],
          atsScore: result.atsScore,
          grade: result.grade,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); }
  };

  // Auto-generate on first mount
  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyAbout = () => {
    if (!data?.about) return;
    navigator.clipboard.writeText(data.about);
    setCopiedAbout(true); setTimeout(() => setCopiedAbout(false), 2000);
  };

  const copyMsg = () => {
    if (!data?.connectionMessage) return;
    navigator.clipboard.writeText(data.connectionMessage);
    setCopiedMsg(true); setTimeout(() => setCopiedMsg(false), 2000);
  };

  const activeHeadline = data?.headlines?.[selectedHeadline]?.text ?? "";
  const profile = result.resumeProfile;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="rounded-2xl px-5 py-4 flex items-start justify-between"
        style={{ background: isDark ? "rgba(10,102,194,0.08)" : "rgba(10,102,194,0.06)", border: `1px solid ${isDark ? "rgba(10,102,194,0.25)" : "rgba(10,102,194,0.18)"}`, boxShadow: cardShadow }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LiIcon size={18} color={accent} />
            <h2 className="text-xl font-bold" style={{ color: t1 }}>LinkedIn Profile Optimizer</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: isDark ? "rgba(0,212,170,0.15)" : "rgba(10,102,194,0.12)", color: accent, border: `1px solid ${accent}30` }}>
              NEW
            </span>
          </div>
          <p className="text-sm" style={{ color: t2 }}>
            AI-generated LinkedIn headlines, About section, skills ranking, connection message, and salary estimate — tailored to your resume and target role.
          </p>
        </div>
        <motion.button onClick={generate} disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="shrink-0 ml-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: isDark ? "rgba(10,102,194,0.2)" : "rgba(10,102,194,0.1)", color: accent, border: `1px solid ${accent}40` }}>
          {loading
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={13} /></motion.div> Generating…</>
            : <><RefreshCw size={13} /> Regenerate</>
          }
        </motion.button>
      </div>

      {error && (
        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl p-10 flex flex-col items-center gap-4"
          style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="relative w-16 h-16">
            <motion.div className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${accent}30` }} />
            <motion.div className="absolute inset-0 rounded-full border-2 border-t-transparent"
              style={{ borderColor: accent }}
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <LiIcon size={20} color={accent} />
            </div>
          </div>
          <p className="text-sm font-medium" style={{ color: t2 }}>Crafting your LinkedIn profile kit…</p>
          <div className="flex flex-col gap-1.5 text-center">
            {["Analysing your skills & experience", "Writing optimised headlines", "Generating About section", "Calculating salary range"].map((step, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.4 }}
                className="text-xs" style={{ color: t3 }}>
                ✦ {step}
              </motion.p>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {data && !loading && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">

            {/* ── Salary + Strength row ── */}
            <div className="grid grid-cols-2 gap-4">
              {/* Salary range */}
              <div className="rounded-2xl p-5"
                style={{ background: isDark ? "rgba(34,197,94,0.06)" : "#D1F7C4", border: isDark ? "1px solid rgba(34,197,94,0.18)" : "1px solid #A8EDAA", boxShadow: cardShadow }}>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={14} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#22c55e" : "#1A6B3C" }}>Estimated Salary Range</p>
                </div>
                <p className="text-lg font-black" style={{ color: isDark ? "#86efac" : "#1A6B3C" }}>
                  {data.salaryRange || "Calculating…"}
                </p>
                <p className="text-xs mt-1" style={{ color: t3 }}>
                  Based on your role, {profile?.experienceYears}y exp & skill stack
                </p>
              </div>

              {/* Profile strength */}
              <div className="rounded-2xl p-5"
                style={{ background: isDark ? "rgba(10,102,194,0.07)" : "rgba(10,102,194,0.06)", border: isDark ? "1px solid rgba(10,102,194,0.2)" : "1px solid rgba(10,102,194,0.15)", boxShadow: cardShadow }}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={14} style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Profile Strength</p>
                </div>
                <StrengthMeter score={data.profileStrength} isDark={isDark} />
                <p className="text-xs mt-2" style={{ color: t3 }}>Based on resume content + keyword coverage</p>
              </div>
            </div>

            {/* ── LinkedIn mock card + headlines ── */}
            <div className="grid grid-cols-2 gap-5">
              {/* Mock profile */}
              <LinkedInCard
                name={profile?.name ?? ""}
                headline={activeHeadline}
                skills={data.skills}
                experienceLevel={profile?.experienceLevel ?? "mid"}
                isDark={isDark}
              />

              {/* Headline selector */}
              <div className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Headline Options</p>
                </div>
                <p className="text-xs mb-2" style={{ color: t3 }}>Click to preview on your profile card →</p>
                {data.headlines.length === 0 && (
                  <p className="text-xs py-4 text-center" style={{ color: t3 }}>Headlines generating — try Regenerate if this persists.</p>
                )}
                {data.headlines.map((h, i) => (
                  <motion.div key={i}
                    onClick={() => setSelectedHeadline(i)}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-xl p-3 cursor-pointer transition-all"
                    style={selectedHeadline === i
                      ? { background: isDark ? "rgba(10,102,194,0.15)" : "rgba(10,102,194,0.08)", border: `1px solid ${isDark ? "rgba(10,102,194,0.4)" : "rgba(10,102,194,0.3)"}` }
                      : { background: isDark ? "rgba(255,255,255,0.025)" : "#F7F9FC", border: `1px solid ${border}` }
                    }>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: isDark ? "rgba(10,102,194,0.2)" : "rgba(10,102,194,0.1)", color: accent }}>
                            {h.strategy}
                          </span>
                        </div>
                        <p className="text-sm leading-snug" style={{ color: selectedHeadline === i ? t1 : t2 }}>{h.text}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: t3 }}>{h.why}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <CopyButton text={h.text} isDark={isDark} />
                        {selectedHeadline === i && <ChevronRight size={13} style={{ color: accent }} />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── About section ── */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${border}`, background: isDark ? "rgba(255,255,255,0.02)" : "#F7F9FC" }}>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>About Section</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAboutExpanded(!aboutExpanded)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: t3, border: `1px solid ${border}` }}>
                    {aboutExpanded ? "Collapse" : "Expand"}
                  </button>
                  <button onClick={copyAbout}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{
                      background: copiedAbout ? (isDark ? "rgba(34,197,94,0.15)" : "#D1F7C4") : (isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF"),
                      color: copiedAbout ? "#22c55e" : t2,
                      border: `1px solid ${copiedAbout ? "rgba(34,197,94,0.3)" : border}`
                    }}>
                    {copiedAbout ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className={aboutExpanded ? "" : "max-h-32 overflow-hidden"}>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: t2, lineHeight: "1.8" }}>
                      {data.about}
                    </p>
                  </div>
                  {!aboutExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-10"
                      style={{ background: isDark ? "linear-gradient(transparent, rgba(26,29,35,0.95))" : "linear-gradient(transparent, rgba(255,255,255,0.95))" }} />
                  )}
                </div>
                {!aboutExpanded && (
                  <button onClick={() => setAboutExpanded(true)} className="mt-2 text-xs font-medium" style={{ color: accent }}>
                    Read full About section →
                  </button>
                )}
              </div>
            </div>

            {/* ── Skills + Connection message row ── */}
            <div className="grid grid-cols-2 gap-4">
              {/* Skills */}
              <div className="rounded-2xl p-5"
                style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} style={{ color: isDark ? "#f59e0b" : "#F6851B" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Skills to Add</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: isDark ? "rgba(245,158,11,0.12)" : "rgba(246,133,27,0.1)", color: isDark ? "#fcd34d" : "#F6851B" }}>
                    Priority order
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer group"
                      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#F7F9FC", border: `1px solid ${border}` }}
                      onClick={() => navigator.clipboard.writeText(skill)}>
                      <span className="text-[10px] font-bold w-4 tabular-nums" style={{ color: t3 }}>{i + 1}</span>
                      <span className="text-xs font-medium" style={{ color: t2 }}>{skill}</span>
                      <Copy size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: t3 }} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connection message */}
              <div className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} style={{ color: accent }} />
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Connection Request</p>
                  </div>
                  <button onClick={copyMsg}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                    style={{
                      background: copiedMsg ? (isDark ? "rgba(34,197,94,0.15)" : "#D1F7C4") : (isDark ? "rgba(255,255,255,0.05)" : "#F7F9FC"),
                      color: copiedMsg ? "#22c55e" : t2,
                      border: `1px solid ${copiedMsg ? "rgba(34,197,94,0.3)" : border}`
                    }}>
                    {copiedMsg ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                <div className="rounded-xl p-4 flex-1"
                  style={{ background: isDark ? "rgba(10,102,194,0.07)" : "rgba(10,102,194,0.05)", border: `1px solid ${isDark ? "rgba(10,102,194,0.2)" : "rgba(10,102,194,0.15)"}` }}>
                  <p className="text-sm leading-relaxed" style={{ color: t2, fontStyle: "italic" }}>
                    {data.connectionMessage
                      ? `"${data.connectionMessage}"`
                      : <span style={{ color: t3 }}>Connection message will appear here once generated.</span>
                    }
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: isDark ? "rgba(245,158,11,0.06)" : "rgba(246,133,27,0.05)", border: isDark ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(246,133,27,0.18)" }}>
                  <Briefcase size={11} className="mt-0.5 shrink-0" style={{ color: isDark ? "#fcd34d" : "#F6851B" }} />
                  <p className="text-[10px]" style={{ color: isDark ? "rgba(252,211,77,0.8)" : "#F6851B" }}>
                    Personalise with their name and a specific reason why you want to connect for best results.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
          style={{ background: surface, border: `1px dashed ${border}` }}>
          <LiIcon size={32} color={t3} />
          <p className="text-sm font-medium" style={{ color: t2 }}>Generating your LinkedIn profile kit…</p>
        </div>
      )}

    </div>
  );
}
