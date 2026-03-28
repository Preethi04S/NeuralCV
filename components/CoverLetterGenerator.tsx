"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Download, Sparkles, RefreshCw, Mail, Eye, Edit3 } from "lucide-react";

interface Props {
  resume: string;
  jobDescription: string;
  candidateName?: string;
  targetRole?: string;
  isDark?: boolean;
}

type Tone = "professional" | "formal" | "confident" | "warm";

const TONES: { value: Tone; label: string; desc: string; color: string }[] = [
  { value: "professional", label: "Professional",  desc: "Balanced & clear",     color: "#037DD6" },
  { value: "formal",       label: "Formal",         desc: "Corporate & precise",  color: "#5C21A1" },
  { value: "confident",    label: "Confident",      desc: "Bold & assertive",     color: "#F6851B" },
  { value: "warm",         label: "Warm",           desc: "Personal & engaging",  color: "#1A6B3C" },
];

export function CoverLetterGenerator({ resume, jobDescription, candidateName, targetRole, isDark = true }: Props) {
  const [tone, setTone]             = useState<Tone>("professional");
  const [letter, setLetter]         = useState("");
  const [subjects, setSubjects]     = useState<string[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [copied, setCopied]         = useState(false);
  const [copiedIdx, setCopiedIdx]   = useState<number | null>(null);
  const [company, setCompany]       = useState("");
  const [isEditing, setIsEditing]   = useState(false);

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.78)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent  = isDark ? "#00d4aa" : "#037DD6";
  const surface = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)";

  const generate = async () => {
    if (!resume || !jobDescription) { setError("Resume and job description required."); return; }
    setLoading(true); setError(""); setLetter(""); setSubjects([]);
    try {
      const res = await fetch("/api/coverletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, candidateName, targetRole, company, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLetter(data.letter ?? "");
      setSubjects(data.subjectLines ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyLetter = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySubject = (i: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const downloadLetter = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${(candidateName || "mine").toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="rounded-2xl px-5 py-4 flex items-start justify-between"
        style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} style={{ color: accent }} />
            <h2 className="text-xl font-bold" style={{ color: t1 }}>Cover Letter Generator</h2>
          </div>
          <p className="text-sm" style={{ color: t2 }}>
            AI-crafted, personalised cover letter based on your resume and the job description.
            Tailored to the specific role — not a template.
          </p>
        </div>
      </div>

      {/* Config row */}
      <div className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>

        {/* Company input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: t3 }}>
            Company name (optional — improves personalisation)
          </label>
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Google, Stripe, Accenture..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "#F7F9FC",
              border: `1px solid ${border}`,
              color: t1,
            }}
          />
        </div>

        {/* Tone selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: t3 }}>
            Tone
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TONES.map(t => (
              <button key={t.value} onClick={() => setTone(t.value)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={tone === t.value
                  ? { background: t.color, color: "#FFFFFF", border: `1px solid ${t.color}`, boxShadow: `0 2px 12px ${t.color}40` }
                  : { background: isDark ? "rgba(255,255,255,0.03)" : "#F7F9FC", color: t2, border: `1px solid ${border}` }
                }>
                <p className="font-semibold text-xs">{t.label}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={generate}
          disabled={loading || !resume || !jobDescription}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          style={{
            background: isDark ? "linear-gradient(135deg, #00d4aa, #6366f1)" : "linear-gradient(135deg, #037DD6, #5C21A1)",
            color: "#FFFFFF",
            boxShadow: isDark ? "0 0 30px rgba(0,212,170,0.2)" : "0 4px 16px rgba(3,125,214,0.25)"
          }}>
          {loading
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={15} /></motion.div> Generating your letter...</>
            : <><Sparkles size={15} /> {letter ? "Regenerate Cover Letter" : "Generate Cover Letter"}</>
          }
        </motion.button>

        {error && <p className="text-sm text-center" style={{ color: isDark ? "#f87171" : "#D94F3D" }}>{error}</p>}
      </div>

      {/* Output */}
      <AnimatePresence>
        {letter && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col gap-4">

            {/* Subject lines */}
            {subjects.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t3 }}>Email Subject Lines</p>
                </div>
                <div className="flex flex-col gap-2">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#F7F9FC", border: `1px solid ${border}` }}>
                      <span className="text-sm flex-1" style={{ color: t1 }}>{s}</span>
                      <button onClick={() => copySubject(i, s)}
                        className="shrink-0 p-1.5 rounded-lg transition-colors"
                        style={{ color: copiedIdx === i ? "#22c55e" : t3 }}>
                        {copiedIdx === i ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Letter */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: cardShadow }}>

              {/* Letter toolbar */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${border}`, background: isDark ? "rgba(255,255,255,0.02)" : "#F7F9FC" }}>
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: accent }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Your Cover Letter</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: isDark ? "rgba(0,212,170,0.1)" : "rgba(3,125,214,0.08)", color: accent, border: `1px solid ${isDark ? "rgba(0,212,170,0.2)" : "rgba(3,125,214,0.2)"}` }}>
                    {letter.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit / Preview toggle */}
                  <button onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: isEditing ? (isDark ? "rgba(0,212,170,0.12)" : "rgba(3,125,214,0.1)") : (isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF"),
                      color: isEditing ? accent : t2,
                      border: `1px solid ${isEditing ? (isDark ? "rgba(0,212,170,0.25)" : "rgba(3,125,214,0.25)") : border}`
                    }}>
                    {isEditing ? <><Eye size={12} /> Preview</> : <><Edit3 size={12} /> Edit</>}
                  </button>
                  <button onClick={downloadLetter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF", color: t2, border: `1px solid ${border}` }}>
                    <Download size={12} /> Download
                  </button>
                  <button onClick={copyLetter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: copied ? (isDark ? "rgba(34,197,94,0.15)" : "#D1F7C4") : (isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF"),
                      color: copied ? "#22c55e" : t2,
                      border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : border}`
                    }}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy All</>}
                  </button>
                </div>
              </div>

              {/* Letter content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    /* ── EDIT MODE: raw textarea ── */
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <textarea
                        value={letter}
                        onChange={e => setLetter(e.target.value)}
                        className="w-full rounded-xl p-4 text-sm leading-relaxed resize-none outline-none transition-all"
                        rows={20}
                        style={{
                          background: isDark ? "rgba(255,255,255,0.025)" : "#FAFBFC",
                          border: `1px solid ${border}`,
                          color: t1,
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          lineHeight: "1.85",
                        }}
                      />
                    </motion.div>
                  ) : (
                    /* ── PREVIEW MODE: formatted letter document ── */
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Document paper card */}
                      <div className="rounded-xl p-8 mx-auto"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.10)",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          maxWidth: "720px",
                        }}>

                        {/* Letter meta header */}
                        <div className="flex items-center justify-between mb-6 pb-4"
                          style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` }}>
                          <div>
                            <p className="text-sm font-bold" style={{ color: t1, fontFamily: "system-ui, sans-serif" }}>
                              {candidateName || "Your Name"}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: t3, fontFamily: "system-ui, sans-serif" }}>
                              {targetRole ? `Applying for: ${targetRole}` : "Cover Letter"}
                              {company ? ` · ${company}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs" style={{ color: t3, fontFamily: "system-ui, sans-serif" }}>
                              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>

                        {/* Divider line */}
                        <div className="w-12 h-0.5 mb-6 rounded-full" style={{ background: accent }} />

                        {/* Letter body — split by paragraph */}
                        <div className="space-y-5">
                          {letter
                            .split(/\n{2,}/)
                            .map(p => p.trim())
                            .filter(Boolean)
                            .map((paragraph, i) => (
                              <p key={i}
                                className="text-sm leading-loose"
                                style={{
                                  color: isDark ? "rgba(240,244,255,0.90)" : "#1A1D23",
                                  lineHeight: "1.95",
                                  textAlign: "justify",
                                }}>
                                {paragraph}
                              </p>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl p-4"
              style={{ background: isDark ? "rgba(0,212,170,0.04)" : "rgba(3,125,214,0.04)", border: `1px solid ${isDark ? "rgba(0,212,170,0.15)" : "rgba(3,125,214,0.15)"}` }}>
              <p className="text-xs font-semibold mb-2" style={{ color: accent }}>Before you send</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Add today's date at the top",
                  "Replace [Company] with the actual name if needed",
                  "Verify the hiring manager's name if known",
                  "Paste into your email — keep formatting clean",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5" style={{ color: accent }}>✓</span>
                    <span className="text-xs" style={{ color: t2 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!letter && !loading && (
        <div className="rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center"
          style={{ background: surface, border: `1px dashed ${border}` }}>
          <FileText size={32} style={{ color: t3 }} />
          <p className="text-sm font-medium" style={{ color: t2 }}>
            Click Generate to create your personalised cover letter
          </p>
          <p className="text-xs" style={{ color: t3 }}>
            Built from your actual resume + this specific job description — not a template
          </p>
        </div>
      )}

    </div>
  );
}
