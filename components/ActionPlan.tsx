"use client";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Minus, CalendarDays } from "lucide-react";
import type { ActionStep } from "@/types/analysis";

interface Props {
  steps: ActionStep[];
  isDark?: boolean;
}

export function ActionPlan({ steps, isDark = true }: Props) {
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";

  const impactConfig = {
    high:   { icon: Zap,       color: isDark ? "#a855f7" : "#5C21A1", bg: isDark ? "rgba(168,85,247,0.10)" : "rgba(92,33,161,0.07)",   border: isDark ? "rgba(168,85,247,0.22)" : "rgba(92,33,161,0.2)",   label: "High Impact" },
    medium: { icon: TrendingUp, color: isDark ? "#f59e0b" : "#F6851B", bg: isDark ? "rgba(245,158,11,0.10)" : "rgba(246,133,27,0.07)",   border: isDark ? "rgba(245,158,11,0.22)" : "rgba(246,133,27,0.2)",   label: "Medium Impact" },
    low:    { icon: Minus,      color: t3,                             bg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",         border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",       label: "Low Impact" },
  };

  if (!steps?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <CalendarDays size={32} style={{ color: t3 }} />
      <p className="text-sm" style={{ color: t2 }}>No action plan generated.</p>
      <p className="text-xs" style={{ color: t3 }}>Re-run the analysis with a detailed job description for best results.</p>
    </div>
  );

  return (
    <motion.div className="space-y-3" initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <p className="text-sm mb-4" style={{ color: t2 }}>
        Your personalised 7-day resume improvement roadmap, prioritised by impact.
      </p>
      {steps.map((step, i) => {
        const cfg = impactConfig[step.impact] ?? impactConfig.low;
        const Icon = cfg.icon;
        return (
          <motion.div key={i}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}
            className="flex items-start gap-4 p-4 rounded-xl"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-xs font-bold tabular-nums" style={{ color: cfg.color }}>{String(i + 1).padStart(2, "0")}</span>
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold" style={{ color: t3 }}>{step.day}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(240,244,255,0.80)" : "#1A1D23" }}>{step.task}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
