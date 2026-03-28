"use client";
import { motion } from "framer-motion";

interface Ring {
  label: string;
  value: number;
  color: string;
  icon: string;
}

function scoreColor(n: number) {
  if (n >= 80) return "#22c55e";
  if (n >= 65) return "#00d4aa";
  if (n >= 45) return "#f59e0b";
  return "#ef4444";
}

function MiniRing({ label, value, color, size = 90, delay = 0, isDark }: {
  label: string; value: number; color: string; size?: number; delay?: number; isDark: boolean;
}) {
  const sw = 7;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}
            strokeWidth={sw} />
          {/* Glow blur */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={sw + 3} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ filter: "blur(4px)", opacity: 0.4 }} />
          {/* Animated arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }}
          />
        </svg>
        {/* Value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.4 }}
            className="text-base font-black tabular-nums"
            style={{ color, textShadow: isDark ? `0 0 10px ${color}70` : "none" }}
          >
            {value}
          </motion.span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.6 }}
        className="text-[10px] font-semibold uppercase tracking-wide text-center"
        style={{ color: isDark ? "rgba(240,244,255,0.88)" : "rgba(26,29,35,0.82)" }}
      >
        {label}
      </motion.span>
    </div>
  );
}

interface Props {
  atsScore: number;
  skillsMatch: number;
  kwScore: number;
  expScore: number;
  clarityScore: number;
  integrityScore: number;
  isDark: boolean;
}

export function StrengthCompass({
  atsScore, skillsMatch, kwScore, expScore, clarityScore, integrityScore, isDark
}: Props) {
  const rings: Array<{ label: string; value: number; color: string; delay: number }> = [
    { label: "ATS Fit",    value: atsScore,       color: scoreColor(atsScore),       delay: 0 },
    { label: "Skills",     value: skillsMatch,    color: scoreColor(skillsMatch),    delay: 0.08 },
    { label: "Keywords",   value: kwScore,        color: scoreColor(kwScore),        delay: 0.16 },
    { label: "Experience", value: expScore,       color: "#f59e0b",                  delay: 0.24 },
    { label: "Clarity",    value: clarityScore,   color: "#60a5fa",                  delay: 0.32 },
    { label: "Integrity",  value: integrityScore, color: scoreColor(integrityScore), delay: 0.40 },
  ];

  const avg = Math.round(rings.reduce((s, r) => s + r.value, 0) / rings.length);

  return (
    <div className="rounded-2xl p-6" style={isDark
      ? { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }
      : { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }
    }>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(240,244,255,0.90)" : "rgba(26,29,35,0.85)" }}>
            Strength Compass
          </p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: isDark ? "rgba(240,244,255,0.65)" : "rgba(26,29,35,0.60)" }}>
            6-dimension resume analysis
          </p>
        </div>
        <div className="flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="text-2xl font-black tabular-nums"
            style={{ color: scoreColor(avg), textShadow: isDark ? `0 0 16px ${scoreColor(avg)}60` : "none" }}
          >
            {avg}
          </motion.span>
          <span className="text-[10px] font-bold" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)" }}>
            avg score
          </span>
        </div>
      </div>

      {/* 6 rings — 3 per row */}
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {rings.map((r) => (
          <MiniRing key={r.label} label={r.label} value={r.value} color={r.color} delay={r.delay} isDark={isDark} size={92} />
        ))}
      </div>
    </div>
  );
}
