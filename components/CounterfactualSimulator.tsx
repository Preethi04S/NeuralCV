"use client";
import { motion } from "framer-motion";
import { TrendingUp, Zap } from "lucide-react";
import type { CounterfactualSkill } from "@/types/analysis";

interface Props {
  counterfactuals: CounterfactualSkill[];
  currentScore: number;
}

function ScoreBar({ current, projected, max = 100 }: { current: number; projected: number; max?: number }) {
  const currentPct = (current / max) * 100;
  const projectedPct = (projected / max) * 100;
  const gainPct = projectedPct - currentPct;

  return (
    <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="absolute h-full rounded-full bg-white/20" style={{ width: `${currentPct}%` }} />
      <motion.div
        className="absolute h-full rounded-full"
        style={{ left: `${currentPct}%`, background: "linear-gradient(90deg, #22c55e, #4ade80)" }}
        initial={{ width: 0 }}
        animate={{ width: `${gainPct}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

export function CounterfactualSimulator({ counterfactuals, currentScore }: Props) {
  const maxGain = Math.max(...counterfactuals.map(c => c.pointsGain), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-5">
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}>
          Current Score: {currentScore}/100
        </div>
        <span className="text-xs text-white/30">→ See how each skill addition changes your score</span>
      </div>

      {counterfactuals.map((cf, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="p-4 rounded-xl"
          style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-green-400 shrink-0" />
              <span className="text-sm font-semibold text-white/90">Add: {cf.skill}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 tabular-nums">{cf.currentScore}</span>
              <TrendingUp size={13} className="text-green-400" />
              <span className="text-sm font-bold text-green-400 tabular-nums">{cf.projectedScore}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                +{cf.pointsGain}
              </span>
            </div>
          </div>

          <ScoreBar current={cf.currentScore} projected={cf.projectedScore} />

          <div className="mt-2.5 flex items-start gap-1.5">
            <span className="text-white/20 text-xs mt-0.5 shrink-0">→</span>
            <p className="text-xs text-white/45 leading-relaxed">{cf.howToAdd}</p>
          </div>

          {/* Relative impact bar */}
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              className="h-full rounded-full bg-green-500/50"
              initial={{ width: 0 }}
              animate={{ width: `${(cf.pointsGain / maxGain) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
