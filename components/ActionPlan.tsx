"use client";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Minus } from "lucide-react";
import type { ActionStep } from "@/types/analysis";

interface Props {
  steps: ActionStep[];
}

const impactConfig = {
  high: { icon: Zap, color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.25)", label: "High Impact" },
  medium: { icon: TrendingUp, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", label: "Medium Impact" },
  low: { icon: Minus, color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", label: "Low Impact" },
};

export function ActionPlan({ steps }: Props) {
  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      <p className="text-sm text-white/40 mb-4">
        Your personalised 7-day resume improvement roadmap, prioritised by impact.
      </p>
      {steps.map((step, i) => {
        const cfg = impactConfig[step.impact] ?? impactConfig.low;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}
            className="flex items-start gap-4 p-4 rounded-xl"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-xs font-bold tabular-nums" style={{ color: cfg.color }}>{String(i + 1).padStart(2, "0")}</span>
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white/60">{step.day}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{step.task}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
