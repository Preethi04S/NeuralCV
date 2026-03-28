"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, ArrowRight } from "lucide-react";

interface DiffToken {
  word: string;
  type: "kept" | "removed" | "added";
}

function computeDiff(original: string, improved: string): { orig: DiffToken[]; impr: DiffToken[] } {
  const origWords = original.trim().split(/\s+/);
  const impWords  = improved.trim().split(/\s+/);

  const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const origNorm = new Set(origWords.map(normalize));
  const impNorm  = new Set(impWords.map(normalize));

  const orig: DiffToken[] = origWords.map(w => ({
    word: w,
    type: impNorm.has(normalize(w)) ? "kept" : "removed",
  }));
  const impr: DiffToken[] = impWords.map(w => ({
    word: w,
    type: origNorm.has(normalize(w)) ? "kept" : "added",
  }));
  return { orig, impr };
}

function DiffLine({ tokens, isDark }: { tokens: DiffToken[]; isDark: boolean }) {
  return (
    <p className="text-sm leading-relaxed">
      {tokens.map((t, i) => {
        if (t.type === "removed") return (
          <span key={i} className="inline-block mx-0.5 px-1 rounded"
            style={{
              background: isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.12)",
              color: isDark ? "#fca5a5" : "#dc2626",
              textDecoration: "line-through",
              textDecorationColor: isDark ? "#f87171" : "#dc2626",
            }}>
            {t.word}
          </span>
        );
        if (t.type === "added") return (
          <span key={i} className="inline-block mx-0.5 px-1 rounded font-semibold"
            style={{
              background: isDark ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.12)",
              color: isDark ? "#4ade80" : "#16a34a",
              boxShadow: isDark ? "0 0 8px rgba(34,197,94,0.3)" : "none",
            }}>
            {t.word}
          </span>
        );
        return <span key={i} className="mx-0.5" style={{ color: isDark ? "rgba(240,244,255,0.75)" : "rgba(26,29,35,0.70)" }}>{t.word}</span>;
      })}
    </p>
  );
}

interface RewriteItem {
  original: string;
  improved: string;
  reason: string;
}

interface Props {
  suggestions: RewriteItem[];
  isDark: boolean;
}

export function RewriteDiff({ suggestions, isDark }: Props) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!suggestions.length) return (
    <p className="text-sm text-center py-8" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
      No rewrite suggestions generated.
    </p>
  );

  return (
    <div className="space-y-3">
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 px-1"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(239,68,68,0.18)" }} />
          <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Removed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(34,197,94,0.18)" }} />
          <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>Added / improved</span>
        </div>
      </motion.div>

      {suggestions.map((s, i) => {
        const { orig, impr } = computeDiff(s.original, s.improved);
        const addedCount   = impr.filter(t => t.type === "added").length;
        const removedCount = orig.filter(t => t.type === "removed").length;
        const isOpen = expanded === i;

        return (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden"
            style={isDark
              ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }
              : { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }
            }
          >
            {/* Header */}
            <button
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
                  <Sparkles size={12} style={{ color: isDark ? "#a78bfa" : "#6366f1" }} />
                </div>
                <span className="text-sm font-semibold truncate" style={{ color: isDark ? "#f0f4ff" : "#1A1D23" }}>
                  Bullet {i + 1}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {removedCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(239,68,68,0.12)", color: isDark ? "#fca5a5" : "#dc2626" }}>
                      −{removedCount} words
                    </span>
                  )}
                  {addedCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "rgba(34,197,94,0.12)", color: isDark ? "#4ade80" : "#16a34a" }}>
                      +{addedCount} words
                    </span>
                  )}
                </div>
              </div>
              {isOpen
                ? <ChevronUp size={14} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} className="shrink-0 ml-2" />
                : <ChevronDown size={14} style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} className="shrink-0 ml-2" />
              }
            </button>

            {/* Expanded diff */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">

                    {/* Before */}
                    <div className="rounded-xl p-4 space-y-2"
                      style={{
                        background: isDark ? "rgba(239,68,68,0.05)" : "#fff5f5",
                        border: isDark ? "1px solid rgba(239,68,68,0.12)" : "1px solid rgba(239,68,68,0.15)"
                      }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: isDark ? "rgba(239,68,68,0.7)" : "#dc2626" }}>Before</span>
                      <DiffLine tokens={orig} isDark={isDark} />
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight size={16} style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} />
                    </div>

                    {/* After */}
                    <div className="rounded-xl p-4 space-y-2"
                      style={{
                        background: isDark ? "rgba(34,197,94,0.05)" : "#f0fdf4",
                        border: isDark ? "1px solid rgba(34,197,94,0.15)" : "1px solid rgba(34,197,94,0.25)"
                      }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: isDark ? "rgba(34,197,94,0.7)" : "#16a34a" }}>After</span>
                      <DiffLine tokens={impr} isDark={isDark} />
                    </div>

                    {/* Reason + copy */}
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs leading-relaxed flex-1"
                        style={{ color: isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)" }}>
                        <span className="font-semibold" style={{ color: isDark ? "rgba(240,244,255,0.8)" : "rgba(26,29,35,0.8)" }}>Why: </span>
                        {s.reason}
                      </p>
                      <button
                        onClick={() => copy(s.improved, i)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all"
                        style={{
                          background: copied === i
                            ? "rgba(34,197,94,0.15)"
                            : isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
                          border: copied === i ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(99,102,241,0.25)",
                          color: copied === i ? "#4ade80" : isDark ? "#a78bfa" : "#6366f1",
                        }}
                      >
                        {copied === i ? <Check size={11} /> : <Copy size={11} />}
                        {copied === i ? "Copied!" : "Copy improved"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
