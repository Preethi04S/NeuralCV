"use client";
import { motion } from "framer-motion";
import { TrendingUp, Zap, FlaskConical } from "lucide-react";
import type { CounterfactualSkill } from "@/types/analysis";

interface Props {
  counterfactuals: CounterfactualSkill[];
  currentScore: number;
  isDark?: boolean;
}

function ScoreBar({ current, projected, isDark }: { current: number; projected: number; isDark: boolean }) {
  const currentPct  = current;
  const gainPct     = projected - current;
  const gainColor   = gainPct >= 15 ? (isDark ? "#22c55e" : "#1A6B3C") : gainPct >= 8 ? (isDark ? "#f59e0b" : "#F6851B") : (isDark ? "#60a5fa" : "#037DD6");
  return (
    <div className="relative h-2 w-full rounded-full overflow-hidden"
      style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
      <div className="absolute h-full rounded-full" style={{ width: `${currentPct}%`, background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)" }} />
      <motion.div className="absolute h-full rounded-full"
        style={{ left: `${currentPct}%`, background: `linear-gradient(90deg, ${gainColor}, ${gainColor}cc)` }}
        initial={{ width: 0 }} animate={{ width: `${gainPct}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} />
    </div>
  );
}

export function CounterfactualSimulator({ counterfactuals, currentScore, isDark = true }: Props) {
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.78)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent = isDark ? "#a855f7" : "#5C21A1";
  const green  = isDark ? "#22c55e" : "#1A6B3C";
  const surface = isDark ? "rgba(34,197,94,0.05)" : "#FFFFFF";
  const border  = isDark ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.08)";

  if (!counterfactuals?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <FlaskConical size={32} style={{ color: t3 }} />
      <p className="text-sm" style={{ color: t2 }}>No what-if simulations available.</p>
      <p className="text-xs" style={{ color: t3 }}>Re-run analysis to generate skill impact projections.</p>
    </div>
  );

  const maxGain = Math.max(...counterfactuals.map(c => c.pointsGain), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
          Current Score: {currentScore}/100
        </div>
        <span className="text-xs" style={{ color: t3 }}>→ See how each skill addition changes your score in real time</span>
      </div>

      {counterfactuals.map((cf, i) => {
        const gainColor = cf.pointsGain >= 15 ? green : cf.pointsGain >= 8 ? (isDark ? "#f59e0b" : "#F6851B") : (isDark ? "#60a5fa" : "#037DD6");
        const barWidth = Math.round((cf.pointsGain / maxGain) * 100);
        return (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl" style={{ background: surface, border: `1px solid ${border}`, boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: gainColor }} className="shrink-0" />
                <span className="text-sm font-semibold" style={{ color: t1 }}>Add: {cf.skill}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums" style={{ color: t3 }}>{cf.currentScore}</span>
                <TrendingUp size={13} style={{ color: gainColor }} />
                <span className="text-sm font-bold tabular-nums" style={{ color: gainColor }}>{cf.projectedScore}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${gainColor}18`, color: gainColor, border: `1px solid ${gainColor}30` }}>
                  +{cf.pointsGain} pts
                </span>
              </div>
            </div>

            <ScoreBar current={cf.currentScore} projected={cf.projectedScore} isDark={isDark} />

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs" style={{ color: t3 }}>{cf.howToAdd}</p>
              <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: j < Math.round((barWidth / 100) * 5) ? gainColor : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") }} />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
