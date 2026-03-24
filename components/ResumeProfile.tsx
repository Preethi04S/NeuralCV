"use client";
import { motion } from "framer-motion";
import { Code } from "lucide-react";
import type { ResumeProfile as ResumeProfileType } from "@/types/analysis";

interface Props {
  profile: ResumeProfileType;
}

const levelColors: Record<string, string> = {
  entry: "#60a5fa",
  mid: "#a78bfa",
  senior: "#f59e0b",
  lead: "#22c55e",
};

export function ResumeProfile({ profile }: Props) {
  const levelColor = levelColors[profile.experienceLevel] ?? "#a855f7";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass rounded-2xl p-5 mb-5"
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
          style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc" }}
        >
          {profile.name !== "Unknown" ? profile.name.charAt(0).toUpperCase() : "?"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-white">{profile.name}</h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
              style={{ background: `${levelColor}18`, border: `1px solid ${levelColor}40`, color: levelColor }}
            >
              {profile.experienceLevel}-level · {profile.experienceYears}y exp
            </span>
          </div>
          <p className="text-xs text-white/40 mb-3">{profile.educationLevel}</p>
          <p className="text-sm text-white/60 leading-relaxed mb-4">{profile.summary}</p>

          {/* Top skills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Code size={13} className="text-white/30 shrink-0" />
            {profile.topSkills.slice(0, 8).map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-lg text-white/60"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
