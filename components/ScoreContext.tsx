"use client";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Zone {
  min: number;
  max: number;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}

const ZONES: Zone[] = [
  { min: 0,  max: 35, label: "Auto-Reject",   sublabel: "ATS filters before human review", color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: AlertTriangle },
  { min: 35, max: 50, label: "High Risk",      sublabel: "Likely filtered, low chance", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: AlertTriangle },
  { min: 50, max: 70, label: "Under Review",   sublabel: "Manual review, inconsistent results", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Info },
  { min: 70, max: 85, label: "Good Candidate", sublabel: "Likely passes to recruiter screen", color: "#00d4aa", bg: "rgba(0,212,170,0.12)", icon: TrendingUp },
  { min: 85, max: 101, label: "Strong Match",  sublabel: "High chance of interview callback", color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: CheckCircle },
];

function getZone(score: number): Zone {
  return ZONES.find(z => score >= z.min && score < z.max) ?? ZONES[ZONES.length - 1];
}

const INSIGHTS: Record<string, string[]> = {
  "Auto-Reject":   ["Resume is likely filtered before any human sees it", "ATS keyword match is critically low", "Consider rewriting for this specific role"],
  "High Risk":     ["Roughly 75% of resumes at this score are auto-rejected", "Missing several high-priority keywords", "A few targeted additions could push to review zone"],
  "Under Review":  ["You'll likely reach a recruiter, but competition is high", "Improving keywords could boost score significantly", "Focus on the missing keywords list"],
  "Good Candidate":["Your resume should pass most ATS systems", "Recruiters will likely see your application", "Addressing 1-2 gaps could push you to strong match"],
  "Strong Match":  ["Excellent keyword alignment with this job", "Your application is highly competitive", "Focus now on interview preparation"],
};

interface Props {
  score: number;
  grade: string;
  skillsMatch: number;
  isDark: boolean;
}

export function ScoreContext({ score, grade, skillsMatch, isDark }: Props) {
  const zone = getZone(score);
  const ZoneIcon = zone.icon;
  const pct = Math.min((score / 100) * 100, 100);

  // Gradient bar color stops
  const barGradient = "linear-gradient(90deg, #ef4444 0%, #f97316 25%, #f59e0b 45%, #00d4aa 65%, #22c55e 100%)";

  return (
    <div className="space-y-4">

      {/* Zone badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex items-center gap-4"
        style={isDark
          ? { background: zone.bg, border: `1px solid ${zone.color}30` }
          : { background: "#fff", border: `1px solid ${zone.color}35`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
        }
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${zone.color}18`, border: `1px solid ${zone.color}40` }}>
          <ZoneIcon size={18} style={{ color: zone.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold" style={{ color: zone.color }}>{zone.label}</p>
          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(240,244,255,0.65)" : "rgba(26,29,35,0.60)" }}>
            {zone.sublabel}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black tabular-nums" style={{ color: zone.color, textShadow: isDark ? `0 0 16px ${zone.color}60` : "none" }}>{score}</p>
          <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>/ 100</p>
        </div>
      </motion.div>

      {/* Score spectrum bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 space-y-3"
        style={isDark
          ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }
          : { background: "#fff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }
        }
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)" }}>
          Where you stand
        </p>

        {/* Bar */}
        <div className="relative h-4 rounded-full overflow-visible" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          {/* Gradient fill */}
          <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: barGradient, opacity: 0.3 }} />

          {/* Zone dividers */}
          {[35, 50, 70, 85].map(v => (
            <div key={v} className="absolute top-0 bottom-0 w-px"
              style={{ left: `${v}%`, background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }} />
          ))}

          {/* Score indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-10"
            initial={{ left: "0%" }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <div className="relative -translate-x-1/2">
              {/* Pin */}
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: zone.color,
                  borderColor: isDark ? "#060a12" : "#fff",
                  boxShadow: `0 0 12px ${zone.color}80, 0 2px 4px rgba(0,0,0,0.3)`
                }} />
              {/* Score label above */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ background: zone.color, color: "#fff" }}>
                {score}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Zone labels */}
        <div className="flex justify-between text-[10px] font-semibold pt-1">
          {ZONES.map(z => (
            <span key={z.label}
              className="text-center"
              style={{ color: score >= z.min && score < z.max ? z.color : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"), flex: 1 }}>
              {z.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 space-y-3"
        style={isDark
          ? { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }
          : { background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }
        }
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)" }}>
          What this means
        </p>
        {(INSIGHTS[zone.label] ?? []).map((insight, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-start gap-2.5"
          >
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: zone.color }} />
            <p className="text-sm" style={{ color: isDark ? "rgba(240,244,255,0.78)" : "rgba(26,29,35,0.75)" }}>{insight}</p>
          </motion.div>
        ))}

        {/* Skills match row */}
        <div className="mt-2 pt-3" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>Skills match</span>
            <span className="text-xs font-bold" style={{ color: skillsMatch >= 70 ? "#22c55e" : skillsMatch >= 45 ? "#f59e0b" : "#ef4444" }}>
              {skillsMatch}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: skillsMatch >= 70 ? "#22c55e" : skillsMatch >= 45 ? "#f59e0b" : "#ef4444" }}
              initial={{ width: 0 }}
              animate={{ width: `${skillsMatch}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
