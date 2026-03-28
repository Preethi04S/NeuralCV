"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, AlertCircle, Lightbulb, ChevronDown, ChevronUp, Send, Star, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import type { InterviewQuestion } from "@/types/analysis";

interface Props {
  questions: InterviewQuestion[];
  isDark?: boolean;
}

interface PracticeResult {
  score: number;
  strongPoints: string[];
  weakPoints: string[];
  betterAnswer: string;
}

function PracticeModal({
  question, onClose, isDark
}: { question: InterviewQuestion; onClose: () => void; isDark: boolean }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [error, setError] = useState("");

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent = isDark ? "#a855f7" : "#5C21A1";
  const panelBg = isDark ? "#0f1117" : "#FFFFFF";
  const surfaceBg = isDark ? "rgba(255,255,255,0.04)" : "#F7F9FC";
  const borderCol = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";

  const evaluate = async () => {
    if (!answer.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/interview-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.question, why: question.why, tip: question.tip, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 8 ? "#22c55e" : s >= 6 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden"
        style={{ background: panelBg, border: `1px solid ${borderCol}`, maxHeight: "90vh", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: borderCol }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}>
              <MessageSquare size={13} style={{ color: accent }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: t1 }}>Interview Practice Mode</span>
          </div>
          <button onClick={onClose} style={{ color: t3 }} className="hover:opacity-70 transition-opacity text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Question */}
          <div className="rounded-xl p-4" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: t1 }}>{question.question}</p>
            <p className="text-xs mt-2" style={{ color: t3 }}>Tip: {question.tip}</p>
          </div>

          {/* Answer input */}
          {!result && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: t3 }}>
                Your Answer
              </label>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here. Aim for 2-3 minutes of speaking time (~200-300 words. Use the STAR method: Situation, Task, Action, Result."
                rows={7}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{ background: surfaceBg, border: `1px solid ${answer ? accent + "40" : borderCol}`, color: t1 }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs" style={{ color: t3 }}>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                <motion.button
                  onClick={evaluate}
                  disabled={loading || !answer.trim() || answer.trim().split(/\s+/).length < 20}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})`, color: "#fff" }}>
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Evaluating...</> : <><Send size={14} /> Get AI Feedback</>}
                </motion.button>
              </div>
              {answer.trim().split(/\s+/).length < 20 && answer.trim().length > 0 && (
                <p className="text-xs mt-1" style={{ color: isDark ? "#f59e0b" : "#F6851B" }}>Write at least 20 words for a meaningful evaluation</p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl p-3 text-sm" style={{ background: isDark ? "rgba(239,68,68,0.08)" : "#FADADD", border: "1px solid rgba(239,68,68,0.2)", color: isDark ? "#f87171" : "#c0392b" }}>
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: `${scoreColor(result.score)}15`, border: `1px solid ${scoreColor(result.score)}30` }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: t3 }}>AI Evaluation Score</p>
                  <p className="text-sm" style={{ color: t2 }}>
                    {result.score >= 8 ? "Excellent answer — ready to impress" :
                     result.score >= 6 ? "Good answer — a few things to polish" :
                     "Needs work — study the suggestions below"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black tabular-nums" style={{ color: scoreColor(result.score) }}>{result.score}</span>
                  <span className="text-sm ml-1" style={{ color: t3 }}>/10</span>
                </div>
              </div>

              {/* Feedback rows */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4" style={{ background: isDark ? "rgba(34,197,94,0.05)" : "#D1F7C4", border: isDark ? "1px solid rgba(34,197,94,0.15)" : "1px solid #A8EDAA" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle size={13} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? "#22c55e" : "#1A6B3C" }}>Strong Points</span>
                  </div>
                  <ul className="space-y-1.5">
                    {result.strongPoints.map((p, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(240,244,255,0.7)" : "#1A1D23" }}>✓ {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl p-4" style={{ background: isDark ? "rgba(239,68,68,0.05)" : "#FADADD", border: isDark ? "1px solid rgba(239,68,68,0.15)" : "1px solid #F5B8B8" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <XCircle size={13} style={{ color: isDark ? "#f87171" : "#c0392b" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? "#f87171" : "#c0392b" }}>Improve</span>
                  </div>
                  <ul className="space-y-1.5">
                    {result.weakPoints.map((p, i) => (
                      <li key={i} className="text-xs leading-relaxed" style={{ color: isDark ? "rgba(240,244,255,0.7)" : "#1A1D23" }}>✗ {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Better answer */}
              <div className="rounded-xl p-4" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={13} style={{ color: isDark ? "#f59e0b" : "#F6851B" }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? "#f59e0b" : "#F6851B" }}>Stronger Version</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: t2 }}>{result.betterAnswer}</p>
              </div>

              <button onClick={() => { setResult(null); setAnswer(""); }}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: t2 }}>
                Try Again
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function InterviewPrep({ questions, isDark = true }: Props) {
  const [practiceQ, setPracticeQ] = useState<InterviewQuestion | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent = isDark ? "#a855f7" : "#5C21A1";
  const surface = isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  if (!questions?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <MessageSquare size={32} style={{ color: t3 }} />
      <p className="text-sm" style={{ color: t2 }}>No interview questions generated.</p>
      <p className="text-xs" style={{ color: t3 }}>Try re-running the analysis with a more detailed job description.</p>
    </div>
  );

  return (
    <>
      <motion.div className="space-y-3" initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm" style={{ color: t2 }}>
            Based on your resume gaps — prepare these before your interview.
          </p>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
            {questions.length} questions · Click to Practice
          </span>
        </div>

        {questions.map((q, i) => (
          <motion.div key={i}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${expanded === i ? accent + "35" : border}` }}>

            {/* Question header */}
            <button className="w-full flex items-start gap-3 px-5 py-4 text-left"
              style={{ background: expanded === i ? `${accent}08` : surface }}
              onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
                style={{ background: `${accent}20`, color: accent }}>{i + 1}</div>
              <div className="flex items-start gap-2 flex-1">
                <MessageSquare size={15} style={{ color: accent }} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed" style={{ color: t1 }}>{q.question}</p>
              </div>
              <div className="shrink-0 mt-0.5" style={{ color: t3 }}>
                {expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {/* Body */}
            <AnimatePresence>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 py-4 space-y-3"
                    style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#FAFBFC", borderTop: `1px solid ${border}` }}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={13} style={{ color: isDark ? "#f59e0b" : "#F6851B" }} className="mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed" style={{ color: t2 }}>
                        <span className="font-semibold" style={{ color: isDark ? "#f59e0b" : "#F6851B" }}>Why they ask: </span>{q.why}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb size={13} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} className="mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed" style={{ color: t2 }}>
                        <span className="font-semibold" style={{ color: isDark ? "#22c55e" : "#1A6B3C" }}>How to answer: </span>{q.tip}
                      </p>
                    </div>
                    <button onClick={() => setPracticeQ(q)}
                      className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})`, color: "#fff" }}>
                      <MessageSquare size={12} /> Practice This Question with AI
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {practiceQ && (
          <PracticeModal question={practiceQ} onClose={() => setPracticeQ(null)} isDark={isDark} />
        )}
      </AnimatePresence>
    </>
  );
}
