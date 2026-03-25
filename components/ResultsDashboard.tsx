"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, MessageSquare, Zap, Target, BookOpen,
  CheckCircle, XCircle, Lightbulb, ArrowRight, Copy,
  Check, TrendingUp, Award, AlertTriangle, Layers,
  ChevronRight, Key
} from "lucide-react";
import { useState } from "react";
import { InterviewPrep } from "./InterviewPrep";
import { ActionPlan } from "./ActionPlan";
import { CourseRecommendations } from "./CourseRecommendations";
import { RadarChart } from "./RadarChart";
import type { AnalysisResult, SkillCourse } from "@/types/analysis";

// ---------- Props ----------
interface Props {
  result: AnalysisResult;
  skillCourses?: SkillCourse[];
  coursesLoading?: boolean;
}

type Tab = "overview" | "keywords" | "interview" | "action" | "courses" | "alternatives";

// ---------- Helpers ----------
function gradeColor(grade: string) {
  const map: Record<string, string> = { A: "#22c55e", B: "#00d4aa", C: "#f59e0b", D: "#f97316", F: "#ef4444" };
  return map[grade] ?? "#a855f7";
}

function scoreColor(n: number) {
  if (n >= 80) return "#22c55e";
  if (n >= 65) return "#00d4aa";
  if (n >= 45) return "#f59e0b";
  return "#ef4444";
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

// ---------- Sidebar nav ----------
const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview",     label: "Overview",    icon: BarChart2 },
  { key: "keywords",     label: "Keywords",    icon: Key },
  { key: "interview",    label: "Interview",   icon: MessageSquare },
  { key: "action",       label: "Action Plan", icon: Zap },
  { key: "courses",      label: "Courses",     icon: BookOpen },
  { key: "alternatives", label: "Other Roles", icon: Target },
];

// ---------- Main component ----------
export function ResultsDashboard({ result, skillCourses = [], coursesLoading = false }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  // Compute radar dimensions from result
  const kwTotal = (result.matchedKeywords?.length ?? 0) + (result.missingKeywords?.length ?? 0);
  const kwScore = kwTotal > 0 ? Math.round(((result.matchedKeywords?.length ?? 0) / kwTotal) * 100) : 0;
  const expScore =
    result.resumeProfile?.experienceLevel === "senior" || result.resumeProfile?.experienceLevel === "lead" ? 85
    : result.resumeProfile?.experienceLevel === "mid" ? 65 : 45;
  const rewriteScore = Math.max(0, 100 - (result.rewriteSuggestions?.length ?? 0) * 15);

  const dimensions = [
    { label: "ATS",      value: result.atsScore,           color: scoreColor(result.atsScore) },
    { label: "Skills",   value: result.skillsMatchPercent, color: scoreColor(result.skillsMatchPercent) },
    { label: "Keywords", value: kwScore,                   color: scoreColor(kwScore) },
    { label: "Clarity",  value: rewriteScore,              color: scoreColor(rewriteScore) },
    { label: "Exp",      value: expScore,                  color: scoreColor(expScore) },
    { label: "Fit",      value: Math.round((result.atsScore + result.skillsMatchPercent) / 2), color: "#a855f7" },
  ];

  const gc = gradeColor(result.grade);
  const confidence = Math.round((result.atsScore * 0.5 + result.skillsMatchPercent * 0.5));

  // Dimension bar data
  const dimBars = [
    { label: "Technical Skills", value: result.skillsMatchPercent, color: "#00d4aa" },
    { label: "Keyword Coverage", value: kwScore,                   color: "#a855f7" },
    { label: "Experience Level", value: expScore,                  color: "#f59e0b" },
    { label: "Resume Clarity",   value: rewriteScore,              color: "#60a5fa" },
    { label: "Overall ATS Fit",  value: result.atsScore,           color: "#22c55e" },
  ];

  return (
    <div className="flex gap-6 w-full min-h-[600px]">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-52 shrink-0 flex flex-col gap-1 py-1">
        <p className="text-xs font-medium text-white/25 uppercase tracking-widest px-3 mb-2">Navigation</p>
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
              style={
                active
                  ? { background: "rgba(0,212,170,0.1)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.2)" }
                  : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
              }
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </button>
          );
        })}

        {/* Mini score card in sidebar */}
        <div className="mt-auto pt-4">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs text-white/30 mb-1">ATS Score</p>
            <p className="text-3xl font-bold" style={{ color: scoreColor(result.atsScore) }}>{result.atsScore}</p>
            <p className="text-xs text-white/30 mt-0.5">out of 100</p>
            <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: scoreColor(result.atsScore) }}
                initial={{ width: 0 }}
                animate={{ width: `${result.atsScore}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW TAB ══ */}
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* Header */}
              <div
                className="rounded-2xl px-5 py-4 flex items-start justify-between"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">
                      Analysis for {result.resumeProfile?.name !== "Unknown" ? result.resumeProfile?.name : "Your Resume"}
                    </h2>
                    <TrendingUp size={18} className={result.atsScore >= 60 ? "text-green-400" : "text-orange-400"} />
                  </div>
                  <p className="text-sm text-white/50 max-w-xl leading-relaxed">{result.verdict}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-xs text-white/40">{result.resumeProfile?.experienceLevel} level</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00d4aa" }} />
                  <span className="text-xs text-white/40">{result.resumeProfile?.experienceYears}y exp</span>
                </div>
              </div>

              {/* Metric cards grid + Radar chart */}
              <div className="grid grid-cols-3 gap-4">

                {/* Left 2 columns: metric cards */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {/* ATS Score */}
                  <div
                    className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">ATS Score</p>
                      <Award size={14} className="text-white/20" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold tabular-nums" style={{ color: scoreColor(result.atsScore) }}>
                        {result.atsScore}
                      </p>
                      <p className="text-xs text-white/30 mt-1">out of 100</p>
                    </div>
                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: scoreColor(result.atsScore) }}
                        initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Grade */}
                  <div
                    className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Grade</p>
                      <span className="text-xs text-white/30">{confidence}% confidence</span>
                    </div>
                    <div className="flex items-end gap-3">
                      <p className="text-5xl font-black" style={{ color: gc }}>{result.grade}</p>
                      <div className="mb-1">
                        <p className="text-sm font-semibold" style={{ color: gc }}>
                          {result.grade === "A" ? "Excellent" : result.grade === "B" ? "Good" : result.grade === "C" ? "Fair" : result.grade === "D" ? "Poor" : "Critical"}
                        </p>
                        <p className="text-xs text-white/30">resume grade</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: gc }}
                        initial={{ width: 0 }} animate={{ width: `${confidence}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>

                  {/* Skills Match */}
                  <div
                    className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Skills Match</p>
                      <Layers size={14} className="text-white/20" />
                    </div>
                    <p className="text-4xl font-bold tabular-nums" style={{ color: scoreColor(result.skillsMatchPercent) }}>
                      {result.skillsMatchPercent}<span className="text-2xl font-normal text-white/30">%</span>
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      {result.skillsMatchPercent >= 70 ? "Strong alignment" : result.skillsMatchPercent >= 45 ? "Partial — gaps exist" : "Major gaps present"}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div
                    className="rounded-2xl p-5 flex flex-col justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Keywords</p>
                      <AlertTriangle size={14} className="text-white/20" />
                    </div>
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-3xl font-bold text-green-400">{result.matchedKeywords?.length ?? 0}</p>
                        <p className="text-xs text-white/30">matched</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div>
                        <p className="text-3xl font-bold text-red-400">{result.missingKeywords?.length ?? 0}</p>
                        <p className="text-xs text-white/30">missing</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Radar chart */}
                <div
                  className="rounded-2xl p-4 flex flex-col items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-3">Profile Radar</p>
                  <RadarChart dimensions={dimensions} size={220} />
                </div>
              </div>

              {/* Dimension bars */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">Performance Dimensions</p>
                <div className="grid grid-cols-5 gap-4">
                  {dimBars.map((dim, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <p className="text-lg font-bold tabular-nums" style={{ color: dim.color }}>{dim.value}</p>
                      <div
                        className="w-full h-20 rounded-lg overflow-hidden flex items-end"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <motion.div
                          className="w-full rounded-lg"
                          style={{ background: `linear-gradient(to top, ${dim.color}, ${dim.color}88)` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${dim.value}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                        />
                      </div>
                      <p className="text-xs text-white/35 text-center leading-tight">{dim.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths + Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={14} className="text-green-400" />
                    <p className="text-xs font-medium text-green-400 uppercase tracking-widest">Strengths</p>
                  </div>
                  <ul className="space-y-2.5">
                    {(result.strengths ?? []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle size={14} className="text-red-400" />
                    <p className="text-xs font-medium text-red-400 uppercase tracking-widest">Weaknesses</p>
                  </div>
                  <ul className="space-y-2.5">
                    {(result.weaknesses ?? []).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-red-400 mt-0.5 shrink-0">✗</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ KEYWORDS TAB ══ */}
          {tab === "keywords" && (
            <motion.div
              key="keywords"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
                >
                  <p className="text-xs font-medium text-green-400 uppercase tracking-widest mb-4">✓ Matched Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {(result.matchedKeywords ?? []).map((kw, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <p className="text-xs font-medium text-red-400 uppercase tracking-widest mb-4">✗ Missing Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {(result.missingKeywords ?? []).map((kw, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rewrite suggestions */}
              <div
                className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb size={14} className="text-amber-400" />
                  <p className="text-xs font-medium text-amber-400 uppercase tracking-widest">AI Rewrite Suggestions</p>
                </div>
                <div className="space-y-5">
                  {(result.rewriteSuggestions ?? []).map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div
                        className="px-4 py-3 rounded-xl"
                        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        <p className="text-sm text-white/35 line-through leading-relaxed">{s.original}</p>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <ArrowRight size={12} className="text-amber-400 shrink-0" />
                        <span className="text-xs text-white/30 italic">{s.reason}</span>
                      </div>
                      <div
                        className="flex items-start justify-between gap-2 px-4 py-3 rounded-xl"
                        style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}
                      >
                        <p className="text-sm text-white/88 leading-relaxed">{s.improved}</p>
                        <CopyBtn text={s.improved} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ INTERVIEW TAB ══ */}
          {tab === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <InterviewPrep questions={result.interviewQuestions ?? []} />
            </motion.div>
          )}

          {/* ══ ACTION PLAN TAB ══ */}
          {tab === "action" && (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ActionPlan steps={result.actionPlan ?? []} />
            </motion.div>
          )}

          {/* ══ COURSES TAB ══ */}
          {tab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CourseRecommendations skillCourses={skillCourses} loading={coursesLoading} />
            </motion.div>
          )}

          {/* ══ ALTERNATIVE ROLES TAB ══ */}
          {tab === "alternatives" && (
            <motion.div
              key="alternatives"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-white/40 mb-5">Based on your resume, these roles may be a stronger fit than the one you applied for.</p>
              {(result.alternativeRoles ?? []).map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }}
                  >
                    {role.matchPercent}%
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-white/90 mb-1">{role.title}</p>
                    <p className="text-sm text-white/45 leading-relaxed">{role.reason}</p>
                  </div>
                  <div className="w-24">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-purple-500"
                        initial={{ width: 0 }} animate={{ width: `${role.matchPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
