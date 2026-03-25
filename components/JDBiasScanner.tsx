"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { JDBiasReport } from "@/types/analysis";

interface Props {
  report: JDBiasReport;
}

const biasTypeConfig = {
  gender: { label: "Gender Bias", color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.22)" },
  age: { label: "Age Bias", color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.22)" },
  cultural: { label: "Cultural Bias", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.22)" },
  exclusionary: { label: "Exclusionary", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.22)" },
  ableist: { label: "Ableist", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)" },
};

const ratingConfig = {
  clean: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", label: "No Bias Detected" },
  mild: { icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Mild Bias" },
  moderate: { icon: AlertTriangle, color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", label: "Moderate Bias" },
  severe: { icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "Severe Bias" },
};

export function JDBiasScanner({ report }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const rc = ratingConfig[report.overallRating] ?? ratingConfig.clean;
  const Icon = rc.icon;

  return (
    <div className="space-y-4">
      {/* Overall rating banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
      >
        <Icon size={20} style={{ color: rc.color }} className="shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold" style={{ color: rc.color }}>{rc.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
              {report.overallRating}
            </span>
          </div>
          <p className="text-xs text-white/50">{report.summary}</p>
        </div>
        {(report.biasedPhrases?.length ?? 0) > 0 && (
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold" style={{ color: rc.color }}>{report.biasedPhrases.length}</span>
            <p className="text-xs text-white/30">issue{report.biasedPhrases.length !== 1 ? "s" : ""}</p>
          </div>
        )}
      </motion.div>

      {/* Clean state */}
      {report.overallRating === "clean" && (
        <div className="py-8 text-center">
          <ShieldCheck size={36} className="mx-auto mb-3 text-green-400/60" />
          <p className="text-sm text-white/40">This job description passed all bias checks.</p>
          <p className="text-xs text-white/25 mt-1">No exclusionary or biased language detected.</p>
        </div>
      )}

      {/* Bias issues */}
      {(report.biasedPhrases ?? []).map((phrase, i) => {
        const bc = biasTypeConfig[phrase.biasType] ?? biasTypeConfig.exclusionary;
        const isOpen = expandedIdx === i;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${bc.border}` }}
          >
            <button
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-3 p-4 text-left"
              style={{ background: bc.bg }}
            >
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: `${bc.color}22`, color: bc.color, border: `1px solid ${bc.color}44` }}>
                {bc.label}
              </span>
              <span className="text-sm font-mono text-white/80 flex-1 truncate">&quot;{phrase.phrase}&quot;</span>
              <span className="text-white/30 text-xs shrink-0">{isOpen ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 space-y-2" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div>
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">Why it&apos;s biased</p>
                      <p className="text-sm text-white/70">{phrase.explanation}</p>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">Suggested replacement</p>
                        <p className="text-sm text-green-300/80 font-medium">&quot;{phrase.suggestion}&quot;</p>
                      </div>
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
