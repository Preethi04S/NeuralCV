"use client";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { ResumeIntegrity } from "@/types/analysis";

interface Props {
  integrity: ResumeIntegrity;
}

const severityConfig = {
  low: { icon: Info, color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)", label: "Low Risk" },
  medium: { icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Medium Risk" },
  high: { icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "High Risk" },
};

function IntegrityGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "High Integrity" : score >= 60 ? "Moderate Integrity" : "Low Integrity";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white tabular-nums">{score}</span>
          <span className="text-xs" style={{ color }}>/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

export function ResumeIntegrityCheck({ integrity }: Props) {
  return (
    <div className="space-y-4">
      {/* Header with gauge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 p-5 rounded-xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <IntegrityGauge score={integrity.integrityScore} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white/80 mb-1">Resume Integrity Analysis</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-3">{integrity.verdict}</p>
          {(integrity.flags?.length ?? 0) === 0 && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <ShieldCheck size={14} />
              No integrity concerns detected. Resume appears authentic.
            </div>
          )}
        </div>
      </motion.div>

      {/* Flags */}
      {(integrity.flags ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 uppercase tracking-widest px-1">Flagged Issues</p>
          {integrity.flags.map((flag, i) => {
            const sc = severityConfig[flag.severity] ?? severityConfig.low;
            const Icon = sc.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
              >
                <Icon size={15} style={{ color: sc.color }} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
                    <span className="text-xs text-white/60 font-medium">{flag.issue}</span>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">{flag.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
