"use client";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, Info, FileCheck } from "lucide-react";
import type { ResumeIntegrity } from "@/types/analysis";

interface Props { integrity: ResumeIntegrity; isDark?: boolean; }

function IntegrityGauge({ score, isDark }: { score: number; isDark: boolean }) {
  const color = score >= 80 ? (isDark ? "#22c55e" : "#1A6B3C") : score >= 60 ? (isDark ? "#f59e0b" : "#F6851B") : "#ef4444";
  const label = score >= 80 ? "High Integrity" : score >= 60 ? "Moderate Integrity" : "Low Integrity";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const trackColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke={trackColor} strokeWidth="6" />
          <motion.circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular-nums" style={{ color: t1 }}>{score}</span>
          <span className="text-xs" style={{ color }}>/100</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

export function ResumeIntegrityCheck({ integrity, isDark = true }: Props) {
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.78)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const surface = isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const severityConfig = {
    low:    { icon: Info,          color: isDark ? "#60a5fa" : "#037DD6", bg: isDark ? "rgba(96,165,250,0.08)"  : "rgba(3,125,214,0.06)",  border: isDark ? "rgba(96,165,250,0.2)"  : "rgba(3,125,214,0.18)",  label: "Low Risk"    },
    medium: { icon: AlertCircle,   color: isDark ? "#f59e0b" : "#F6851B", bg: isDark ? "rgba(245,158,11,0.08)" : "rgba(246,133,27,0.06)", border: isDark ? "rgba(245,158,11,0.2)" : "rgba(246,133,27,0.18)", label: "Medium Risk" },
    high:   { icon: AlertTriangle, color: "#ef4444",                       bg: "rgba(239,68,68,0.08)",            border: "rgba(239,68,68,0.2)",                                                               label: "High Risk"   },
  };

  if (!integrity) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <FileCheck size={32} style={{ color: t3 }} />
      <p className="text-sm" style={{ color: t2 }}>No integrity report available.</p>
      <p className="text-xs" style={{ color: t3 }}>Re-run the analysis to generate an integrity check.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with gauge */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 p-5 rounded-xl"
        style={{ background: surface, border: `1px solid ${border}`, boxShadow: isDark ? "none" : "0 2px 10px rgba(0,0,0,0.06)" }}>
        <IntegrityGauge score={integrity.integrityScore} isDark={isDark} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1" style={{ color: t1 }}>Resume Integrity Analysis</h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: t2 }}>{integrity.verdict}</p>
          {(integrity.flags?.length ?? 0) === 0 && (
            <div className="flex items-center gap-2 text-xs" style={{ color: isDark ? "#4ade80" : "#1A6B3C" }}>
              <ShieldCheck size={14} /> No integrity concerns detected. Resume appears authentic.
            </div>
          )}
        </div>
      </motion.div>

      {/* Flags */}
      {(integrity.flags ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest px-1" style={{ color: t3 }}>Flagged Issues</p>
          {integrity.flags.map((flag, i) => {
            const sc = severityConfig[flag.severity] ?? severityConfig.low;
            const FlagIcon = sc.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }} className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
                <FlagIcon size={15} style={{ color: sc.color }} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                    <span className="text-xs font-medium" style={{ color: t2 }}>{flag.issue}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: t2 }}>{flag.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
