"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  size?: number;
}

export function ScoreGauge({ score, grade, size = 148 }: ScoreGaugeProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 85 ? "#22c55e" :
    score >= 70 ? "#4ade80" :
    score >= 50 ? "#f59e0b" :
    score >= 35 ? "#f97316" : "#ef4444";

  const gradeColor =
    grade === "A" ? "#22c55e" :
    grade === "B" ? "#4ade80" :
    grade === "C" ? "#f59e0b" :
    grade === "D" ? "#f97316" : "#ef4444";

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.4, ease: "easeOut", delay: 0.4 });
    return controls.stop;
  }, [score, count]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 12px ${color}50)` }}
        >
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <motion.span className="text-3xl font-bold text-white tabular-nums">
            {rounded}
          </motion.span>
          <span className="text-xs text-white/40">/ 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold"
        style={{
          background: `${gradeColor}18`,
          border: `1px solid ${gradeColor}40`,
          color: gradeColor,
        }}
      >
        Grade {grade}
      </motion.div>
    </div>
  );
}
