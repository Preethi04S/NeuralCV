"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Copy, Check, Zap } from "lucide-react";

interface Props {
  matched: string[];
  missing: string[];
  isDark: boolean;
}

export function KeywordVisualizer({ matched, missing, isDark }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const total = matched.length + missing.length;
  const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  const copy = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopied(kw);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="space-y-4">

      {/* Coverage bar header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5"
        style={isDark
          ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }
          : { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
        }
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: isDark ? "#f59e0b" : "#F6851B" }} />
            <span className="text-sm font-bold" style={{ color: isDark ? "#f0f4ff" : "#1A1D23" }}>
              Keyword Coverage
            </span>
          </div>
          <span className="text-xl font-black tabular-nums"
            style={{ color: pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#ef4444", textShadow: isDark ? `0 0 16px ${pct >= 70 ? "#22c55e80" : pct >= 45 ? "#f59e0b80" : "#ef444480"}` : "none" }}>
            {pct}%
          </span>
        </div>

        {/* Segmented progress bar */}
        <div className="h-3 rounded-full overflow-hidden flex gap-px"
          style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)" }}>
          <motion.div className="h-full rounded-l-full"
            style={{ background: "linear-gradient(90deg, #22c55e 0%, #00d4aa 100%)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium" style={{ color: "#22c55e" }}>
            {matched.length} matched
          </span>
          <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
            {total} total keywords
          </span>
          <span className="text-xs font-medium" style={{ color: "#ef4444" }}>
            {missing.length} missing
          </span>
        </div>
      </motion.div>

      {/* Dual column */}
      <div className="grid grid-cols-2 gap-4">

        {/* Matched column */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4"
          style={isDark
            ? { background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)" }
            : { background: "#f0fdf4", border: "1px solid rgba(34,197,94,0.3)" }
          }
        >
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(34,197,94,0.85)" : "#16a34a" }}>
              In your resume
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((kw, i) => (
              <motion.button key={kw}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.045, type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => copy(kw)}
                title="Click to copy"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 group transition-all"
                style={{
                  background: isDark ? "rgba(34,197,94,0.1)" : "#dcfce7",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: isDark ? "#4ade80" : "#16a34a",
                  boxShadow: "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 10px rgba(34,197,94,0.35)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {copied === kw
                  ? <Check size={9} className="shrink-0" />
                  : <Copy size={9} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                }
                {kw}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Missing column */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl p-4"
          style={isDark
            ? { background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }
            : { background: "#fff5f5", border: "1px solid rgba(239,68,68,0.25)" }
          }
        >
          <div className="flex items-center gap-1.5 mb-3">
            <XCircle size={13} style={{ color: "#ef4444" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(239,68,68,0.85)" : "#dc2626" }}>
              Add to resume
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((kw, i) => (
              <motion.button key={kw}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => copy(kw)}
                title="Click to copy"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 group transition-all"
                style={{
                  background: isDark ? "rgba(239,68,68,0.10)" : "#fee2e2",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: isDark ? "#f87171" : "#dc2626",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 10px rgba(239,68,68,0.35)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {copied === kw
                  ? <Check size={9} className="shrink-0" />
                  : <Copy size={9} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                }
                {kw}
              </motion.button>
            ))}
          </div>

          {/* Pro tip */}
          {missing.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + missing.length * 0.06 }}
              className="text-[10px] mt-3 leading-relaxed"
              style={{ color: isDark ? "rgba(239,68,68,0.55)" : "rgba(220,38,38,0.6)" }}
            >
              Click any keyword to copy it. Add to your resume bullet points and skills section.
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
