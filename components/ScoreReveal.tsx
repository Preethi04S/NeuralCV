"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function gradeColor(g: string) {
  const map: Record<string, string> = { A: "#22c55e", B: "#00d4aa", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
  return map[g] ?? "#a855f7";
}
function scoreColor(n: number) {
  if (n >= 80) return "#22c55e";
  if (n >= 65) return "#00d4aa";
  if (n >= 45) return "#f59e0b";
  return "#ef4444";
}

const GRADE_SEQ = ["F", "F", "D", "D", "C", "C", "B", "B", "A"] as const;

interface Props {
  score: number;
  grade: string;
  verdict: string;
  confidence: number;
  isDark: boolean;
}

export function ScoreReveal({ score, grade, verdict, confidence, isDark }: Props) {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayGrade, setDisplayGrade] = useState("F");
  const SIZE = 200;
  const SW = 12;
  const R = (SIZE - SW * 2) / 2;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    setDisplayScore(0);
    setDisplayGrade("F");
    let current = 0;
    const target = score;
    const duration = 1600;
    const steps = 80;
    const stepVal = target / steps;
    const stepMs = duration / steps;

    const t = setInterval(() => {
      current = Math.min(current + stepVal, target);
      setDisplayScore(Math.round(current));
      // Slot machine: grade cycles based on progress
      const idx = Math.min(Math.floor((current / 100) * GRADE_SEQ.length), GRADE_SEQ.length - 1);
      setDisplayGrade(GRADE_SEQ[idx]);
      if (current >= target) clearInterval(t);
    }, stepMs);
    return () => clearInterval(t);
  }, [score, grade]);

  const color = scoreColor(score);
  const gc = gradeColor(grade);
  const progressOffset = CIRC - (displayScore / 100) * CIRC;
  const label = grade === "A" ? "Excellent" : grade === "B" ? "Good" : grade === "C" ? "Fair" : grade === "D" ? "Poor" : "Critical";

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Ring + score */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"} strokeWidth={SW} />
          {/* Glow layer (blurred duplicate) */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={color} strokeWidth={SW + 4} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={progressOffset}
            style={{ filter: `blur(6px)`, opacity: 0.35 }} />
          {/* Main arc */}
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={color} strokeWidth={SW} strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-black tabular-nums leading-none"
            style={{ color, textShadow: `0 0 24px ${color}80` }}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs font-semibold mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>/ 100 ATS</span>
        </div>
      </div>

      {/* Grade slot machine */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: `${gc}15`,
            border: `2px solid ${gc}45`,
            boxShadow: `0 0 20px ${gc}30, inset 0 0 12px ${gc}10`
          }}>
          <AnimatePresence mode="wait">
            <motion.span key={displayGrade}
              initial={{ y: -28, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 28, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="text-4xl font-black absolute"
              style={{ color: gc, textShadow: `0 0 18px ${gc}90` }}
            >
              {displayGrade}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="text-xs font-semibold" style={{ color: gc }}>{label}</span>
        <span className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>{confidence}% confidence</span>
      </div>

      {/* Verdict */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="text-xs text-center leading-relaxed max-w-[200px]"
        style={{ color: isDark ? "rgba(240,244,255,0.65)" : "rgba(26,29,35,0.60)" }}
      >
        {verdict}
      </motion.p>
    </div>
  );
}
