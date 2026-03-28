"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink, MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import type { LiveJob, JobSearchResult } from "@/types/analysis";

interface Props {
  targetRoleJobs: JobSearchResult;
  alternativeRoleJobs: JobSearchResult[];
  isDark?: boolean;
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#94a3b8";
  const label = score >= 70 ? "Strong Fit" : score >= 45 ? "Partial Fit" : "Stretch Role";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
      style={{ background: `${color}18`, border: `1px solid ${color}44`, color }}>
      {score}% · {label}
    </span>
  );
}

function JobCard({ job, index, isDark }: { job: LiveJob; index: number; isDark: boolean }) {
  const [hovered, setHovered] = useState(false);
  const initials = job.company.slice(0, 2).toUpperCase();
  const colors = ["#a855f7", "#6366f1", "#22c55e", "#f59e0b", "#10b981", "#f472b6", "#60a5fa", "#fb923c"];
  const color = colors[job.id % colors.length];

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";

  const cardBg     = hovered
    ? (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)")
    : (isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF");
  const cardBorder = hovered
    ? (isDark ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(92,33,161,0.25)")
    : (isDark ? "1px solid rgba(255,255,255,0.07)"  : "1px solid rgba(0,0,0,0.08)");

  const applyBg     = hovered ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(92,33,161,0.08)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)");
  const applyBorder = hovered ? (isDark ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(92,33,161,0.3)") : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)");
  const applyColor  = hovered ? (isDark ? "#c084fc" : "#5C21A1") : t3;

  const skillBg     = isDark ? "rgba(34,197,94,0.08)"  : "rgba(34,197,94,0.07)";
  const skillColor  = isDark ? "#86efac" : "#1A6B3C";
  const skillBorder = isDark ? "rgba(34,197,94,0.15)"  : "rgba(34,197,94,0.25)";

  const tagBg     = isDark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.04)";
  const tagBorder = isDark ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.08)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-xl p-4 transition-all duration-200"
      style={{ background: cardBg, border: cardBorder, boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,0.05)" }}
    >
      {/* New badge */}
      {job.isNew && (
        <span className="absolute top-3 right-3 text-xs px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(34,197,94,0.15)", color: isDark ? "#4ade80" : "#1A6B3C", border: "1px solid rgba(34,197,94,0.3)" }}>
          NEW
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Company avatar */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: `${color}18`, border: `1px solid ${color}33`, color }}>
          {initials}
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h4 className="text-sm font-semibold leading-tight mb-0.5 truncate" style={{ color: t1 }}>{job.title}</h4>
          <p className="text-xs mb-2" style={{ color: t2 }}>{job.company}</p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: t3 }}>
              <MapPin size={10} />{job.location || "Remote"}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1 text-xs" style={{ color: t3 }}>
                <DollarSign size={10} />{job.salary.length > 25 ? job.salary.slice(0, 25) + "…" : job.salary}
              </span>
            )}
            {job.postedDate && (
              <span className="flex items-center gap-1 text-xs" style={{ color: t3 }}>
                <Clock size={10} />{job.postedDate}
              </span>
            )}
          </div>

          {/* Match info */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <MatchBadge score={job.matchScore} />
            {job.matchedSkills?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {job.matchedSkills.slice(0, 3).map((s, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{ background: skillBg, color: skillColor, border: `1px solid ${skillBorder}` }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {job.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ color: t3, background: tagBg, border: `1px solid ${tagBorder}` }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply button */}
      <motion.a
        href={job.url} target="_blank" rel="noopener noreferrer"
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
        style={{ background: applyBg, border: applyBorder, color: applyColor }}
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={11} />
        Apply on Remotive
      </motion.a>
    </motion.div>
  );
}

function JobSection({ result, delay = 0, isDark }: { result: JobSearchResult; delay?: number; isDark: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? result.jobs : result.jobs.slice(0, 3);

  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const showMoreBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  if (!result.jobs?.length) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
      className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase size={14} style={{ color: isDark ? "#a855f7" : "#5C21A1" }} className="shrink-0" />
        <h3 className="text-sm font-semibold" style={{ color: t2 }}>{result.roleCategory}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: isDark ? "rgba(168,85,247,0.1)" : "rgba(92,33,161,0.08)", color: isDark ? "#c084fc" : "#5C21A1", border: isDark ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(92,33,161,0.2)" }}>
          {result.totalFound} live
        </span>
      </div>

      <div className="grid gap-3">
        {displayed.map((job, i) => <JobCard key={job.id} job={job} index={i} isDark={isDark} />)}
      </div>

      {result.jobs.length > 3 && (
        <button onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2 text-xs transition-colors rounded-lg"
          style={{ color: t3, border: `1px solid ${showMoreBorder}` }}>
          {showAll ? "Show less" : `Show ${result.jobs.length - 3} more jobs`}
        </button>
      )}
    </motion.div>
  );
}

export function LiveJobs({ targetRoleJobs, alternativeRoleJobs, isDark = true }: Props) {
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";

  return (
    <div>
      {targetRoleJobs?.jobs?.length > 0 && (
        <JobSection result={targetRoleJobs} delay={0} isDark={isDark} />
      )}
      {alternativeRoleJobs?.filter(r => r.jobs?.length > 0).map((result, i) => (
        <JobSection key={result.query} result={result} delay={0.1 + i * 0.1} isDark={isDark} />
      ))}
      {!targetRoleJobs?.jobs?.length && !alternativeRoleJobs?.some(r => r.jobs?.length) && (
        <div className="text-center py-12">
          <Briefcase size={32} className="mx-auto mb-3" style={{ color: t3 }} />
          <p className="text-sm" style={{ color: t2 }}>No live jobs found for your profile right now.</p>
          <p className="text-xs mt-1" style={{ color: t3 }}>Try again after improving your resume score.</p>
        </div>
      )}
    </div>
  );
}
