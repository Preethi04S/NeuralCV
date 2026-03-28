"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, MessageSquare, Zap, Target, BookOpen,
  CheckCircle, XCircle, Lightbulb, ArrowRight, Copy,
  Check, TrendingUp, Award, AlertTriangle, Layers,
  ChevronRight, Key, Brain, Shield,
  ExternalLink, Briefcase, FileText,
  GitBranch, Globe, Phone, Mail, MapPin, Star,
  FlaskConical, ScanSearch, FileCheck, Building2,
  Clock, Link2
} from "lucide-react";
import { useState, useEffect } from "react";
import { InterviewPrep } from "./InterviewPrep";
import { ActionPlan } from "./ActionPlan";
import { CourseRecommendations } from "./CourseRecommendations";
import { RadarChart } from "./RadarChart";
import { CoverLetterGenerator } from "./CoverLetterGenerator";
import { LinkedInOptimizer } from "./LinkedInOptimizer";
import { ScoreReveal } from "./ScoreReveal";
import { KeywordVisualizer } from "./KeywordVisualizer";
import { RewriteDiff } from "./RewriteDiff";
import { ScoreContext } from "./ScoreContext";
import { StrengthCompass } from "./StrengthCompass";
import { ResumeBuilder } from "./ResumeBuilder";
import type { AnalysisResult, SkillCourse, LiveJobsData } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  skillCourses?: SkillCourse[];
  coursesLoading?: boolean;
  isDark?: boolean;
  resume?: string;
  jobDescription?: string;
}

type Tab = "overview" | "keywords" | "interview" | "action" | "courses" | "alternatives" | "whatif" | "jdscan" | "integrity" | "jobs" | "coverletter" | "linkedin" | "builder";

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
function biasColor(type: string) {
  const map: Record<string, string> = { gender: "#f43f5e", age: "#f59e0b", cultural: "#8b5cf6", exclusionary: "#ef4444", ableist: "#f97316" };
  return map[type] ?? "#6366f1";
}
function biasRatingColor(r: string) {
  const map: Record<string, string> = { clean: "#22c55e", mild: "#f59e0b", moderate: "#f97316", severe: "#ef4444" };
  return map[r] ?? "#6366f1";
}

function CopyBtn({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-md transition-colors shrink-0"
      style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(26,29,35,0.3)" }}
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

const NAV: { key: Tab; label: string; icon: React.ElementType; group: "core" | "usp" | "market" }[] = [
  { key: "overview",     label: "Overview",        icon: BarChart2,     group: "core"   },
  { key: "keywords",     label: "Keywords",        icon: Key,           group: "core"   },
  { key: "interview",    label: "Interview",        icon: MessageSquare, group: "core"   },
  { key: "action",       label: "Action Plan",     icon: Zap,           group: "core"   },
  { key: "courses",      label: "Courses",         icon: BookOpen,      group: "core"   },
  { key: "alternatives", label: "Alt Roles",       icon: Target,        group: "core"   },
  { key: "whatif",       label: "What-If Score",   icon: FlaskConical,  group: "usp"    },
  { key: "jdscan",       label: "JD Bias Scan",    icon: ScanSearch,    group: "usp"    },
  { key: "integrity",    label: "Integrity Check", icon: FileCheck,     group: "usp"    },
  { key: "jobs",         label: "Live Jobs",       icon: Briefcase,     group: "market" },
  { key: "coverletter",  label: "Cover Letter",    icon: FileText,      group: "market" },
  { key: "linkedin",     label: "LinkedIn Kit",    icon: Link2,         group: "market" },
  { key: "builder",      label: "Resume Builder",  icon: Star,          group: "market" },
];

// Bento accent colors — only used for the number/accent, NOT the card background
// Cards always use the same dark semi-transparent base for visual consistency
const BENTO_ACCENT = [
  { num: "#00d4aa", glow: "rgba(0,212,170,0.12)",   border: "rgba(0,212,170,0.22)"   },  // teal
  { num: "#a78bfa", glow: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.22)" },  // purple
  { num: "#6366f1", glow: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.22)"  },  // indigo
  { num: "#38bdf8", glow: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.22)"  },  // sky
];

export function ResultsDashboard({ result, skillCourses = [], coursesLoading = false, isDark = true, resume = "", jobDescription = "" }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [jobsData, setJobsData] = useState<LiveJobsData | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  useEffect(() => {
    if (tab !== "jobs" || jobsData || jobsLoading) return;
    setJobsLoading(true);
    setJobsError("");
    const altRoleTitles = (result.alternativeRoles ?? []).slice(0, 2).map(r => r.title);
    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeSkills: result.resumeProfile?.allSkills?.length
          ? result.resumeProfile.allSkills.slice(0, 8)
          : result.resumeProfile?.topSkills ?? [],
        targetRole: result.resumeProfile?.roles?.[0] ?? "",
        alternativeRoles: altRoleTitles,
      }),
    })
      .then(r => r.json())
      .then(d => { setJobsData(d); setJobsLoading(false); })
      .catch(() => { setJobsError("Failed to load jobs."); setJobsLoading(false); });
  }, [tab, jobsData, jobsLoading, result]);

  const kwTotal = (result.matchedKeywords?.length ?? 0) + (result.missingKeywords?.length ?? 0);
  const kwScore = kwTotal > 0 ? Math.round(((result.matchedKeywords?.length ?? 0) / kwTotal) * 100) : 0;
  const expScore = result.resumeProfile?.experienceLevel === "senior" || result.resumeProfile?.experienceLevel === "lead" ? 85
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

  const dimBars = [
    { label: "Technical Skills", value: result.skillsMatchPercent, color: isDark ? "#00d4aa" : "#037DD6" },
    { label: "Keyword Coverage", value: kwScore,                   color: "#a855f7" },
    { label: "Experience Level", value: expScore,                  color: isDark ? "#f59e0b" : "#F6851B" },
    { label: "Resume Clarity",   value: rewriteScore,              color: isDark ? "#60a5fa" : "#5C21A1" },
    { label: "Overall ATS Fit",  value: result.atsScore,           color: "#22c55e" },
  ];

  // Theme helpers
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent  = isDark ? "#00d4aa" : "#037DD6";
  const accent2 = isDark ? "#6366f1" : "#5C21A1";
  const accent3 = isDark ? "#f59e0b" : "#F6851B";

  // Card style factory
  const card = (overrideLight?: { bg: string; text?: string; border?: string }) =>
    isDark
      ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", transition: "box-shadow 0.25s ease, transform 0.2s ease" }
      : overrideLight
        ? {
            background: overrideLight.bg,
            border: `1px solid ${overrideLight.border ?? overrideLight.bg}`,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          }
        : {
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          };

  const coreNav = NAV.filter(n => n.group === "core");
  const uspNav  = NAV.filter(n => n.group === "usp");
  const mktNav  = NAV.filter(n => n.group === "market");

  const sectionLabel = (text: string) => (
    <p className="text-xs font-bold uppercase tracking-widest px-3 mb-1" style={{ color: t2 }}>{text}</p>
  );

  const navBtn = (n: typeof NAV[number]) => {
    const active = tab === n.key;
    return (
      <button key={n.key} onClick={() => setTab(n.key)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full ${active ? "tab-active-glow" : ""}`}
        style={active
          ? isDark
            ? { background: `${accent}18`, color: accent, border: `1px solid ${accent}35` }
            : { background: accent2, color: "#fff", border: `1px solid ${accent2}`, boxShadow: `0 2px 8px ${accent2}40` }
          : isDark
            ? { color: "rgba(255,255,255,0.72)", border: "1px solid transparent" }
            : { color: t2, border: "1px solid transparent" }
        }
      >
        <n.icon size={15} />
        {n.label}
        {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
      </button>
    );
  };

  return (
    <div className="flex w-full" style={{ minHeight: "calc(100vh - 100px)", alignItems: "stretch" }}>

      {/* ── LEFT SIDEBAR — full-height sticky panel ── */}
      <div className="w-64 shrink-0 flex flex-col gap-1 py-4 px-2 overflow-y-auto sticky top-0 self-start rounded-2xl"
        style={{
          height: "calc(100vh - 100px)",
          background: isDark
            ? "linear-gradient(180deg, rgba(0,212,170,0.04) 0%, rgba(99,102,241,0.03) 40%, rgba(255,255,255,0.015) 100%)"
            : "#FFFFFF",
          border: isDark ? "1px solid rgba(0,212,170,0.12)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "0 0 30px rgba(0,212,170,0.04), inset 0 1px 0 rgba(0,212,170,0.08)" : "0 2px 16px rgba(0,0,0,0.06)",
          marginRight: "24px",
        }}>
        {sectionLabel("Analysis")}
        {coreNav.map(navBtn)}
        <div className="mt-4">{sectionLabel("AI Intelligence")}</div>
        {uspNav.map(navBtn)}
        <div className="mt-4">{sectionLabel("Market")}</div>
        {mktNav.map(navBtn)}

        {/* Skill Priority Panel */}
        {(result.counterfactuals?.length ?? 0) > 0 && (
          <div className="mt-4">
            <div className="mb-2">{sectionLabel("Skill Priority")}</div>
            <div className="flex flex-col gap-1.5">
              {(result.counterfactuals ?? []).slice(0, 5).map((cf, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="card-glow flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
                  style={{ border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.02)" : "#fff" }}
                  onClick={() => setTab("whatif")}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{ background: isDark ? "rgba(0,212,170,0.12)" : `${accent2}15`, color: isDark ? "#00d4aa" : accent2, border: `1px solid ${isDark ? "rgba(0,212,170,0.25)" : accent2 + "30"}` }}>
                    +{cf.pointsGain}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate" style={{ color: t1 }}>{cf.skill}</p>
                    <p className="text-[10px] truncate" style={{ color: t3 }}>{cf.projectedScore}/100 projected</p>
                  </div>
                </motion.div>
              ))}
              <button onClick={() => setTab("whatif")} className="text-[10px] px-3 py-1 text-left transition-colors" style={{ color: accent }}>
                View full What-If analysis
              </button>
            </div>
          </div>
        )}

        {/* Sidebar bottom cards */}
        <div className="mt-4 flex flex-col gap-3">
          {/* ATS Score */}
          <div className="card-glow rounded-2xl p-4 text-center" style={isDark
            ? { background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.18)" }
            : { background: "#0D9488", border: "1px solid #0D9488", boxShadow: "0 4px 16px rgba(13,148,136,0.3)" }
          }>
            <p className="text-xs font-bold mb-1" style={{ color: isDark ? t2 : "rgba(255,255,255,0.9)" }}>ATS Score</p>
            <p className={`text-3xl font-bold ${isDark ? (result.atsScore >= 80 ? "score-glow-green" : result.atsScore >= 65 ? "score-glow-teal" : result.atsScore >= 45 ? "score-glow-amber" : "score-glow-red") : ""}`} style={{ color: isDark ? scoreColor(result.atsScore) : "#fff" }}>{result.atsScore}</p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? t3 : "rgba(255,255,255,0.65)" }}>out of 100</p>
            <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.25)" }}>
              <motion.div className="h-full rounded-full" style={{ background: isDark ? scoreColor(result.atsScore) : "#DBC8FF" }}
                initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} />
            </div>
          </div>

          {/* Integrity */}
          {result.resumeIntegrity && (
            <div className="rounded-2xl p-3 flex items-center gap-3" style={isDark
              ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
              : { background: result.resumeIntegrity.integrityScore >= 80 ? "#E0F7F5" : "#FEF3C7", border: result.resumeIntegrity.integrityScore >= 80 ? "1px solid #99E8E0" : "1px solid #FCD34D", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
            }>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: result.resumeIntegrity.integrityScore >= 80 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", border: result.resumeIntegrity.integrityScore >= 80 ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(245,158,11,0.3)" }}>
                <Shield size={16} style={{ color: result.resumeIntegrity.integrityScore >= 80 ? "#16a34a" : "#b45309" }} />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: t2 }}>Integrity</p>
                <p className="text-sm font-bold" style={{ color: result.resumeIntegrity.integrityScore >= 80 ? "#16a34a" : "#b45309" }}>
                  {result.resumeIntegrity.integrityScore}/100
                </p>
              </div>
              <button onClick={() => setTab("integrity")} className="ml-auto transition-colors" style={{ color: t3 }}>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Quick stats */}
          <div className="rounded-2xl p-4" style={isDark
            ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
            : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
          }>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t2 }}>Quick Stats</p>
            <div className="space-y-2.5">
              {[
                { label: "Skills Match",  value: `${result.skillsMatchPercent}%`,  color: scoreColor(result.skillsMatchPercent) },
                { label: "Keywords Hit",  value: `${result.matchedKeywords?.length ?? 0}/${kwTotal}`, color: "#22c55e" },
                { label: "Grade",         value: result.grade,                      color: gradeColor(result.grade) },
                { label: "Confidence",    value: `${result.overallConfidence ?? confidence}%`, color: isDark ? "#a855f7" : "#5C21A1" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: t2 }}>{stat.label}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">

              {/* Header card */}
              <div className="card-glow rounded-2xl px-5 py-4 flex items-start justify-between" style={
                isDark
                  ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                  : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }
              }>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold" style={{ color: t1 }}>
                      Analysis for {result.resumeProfile?.name !== "Unknown" ? result.resumeProfile?.name : "Your Resume"}
                    </h2>
                    <TrendingUp size={18} className={result.atsScore >= 60 ? "text-green-500" : "text-orange-500"} />
                  </div>
                  <p className="text-sm leading-relaxed max-w-xl" style={{ color: t2 }}>{result.verdict}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-xs" style={{ color: t3 }}>{result.resumeProfile?.experienceLevel} level</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                  <span className="text-xs" style={{ color: t3 }}>{result.resumeProfile?.experienceYears}y exp</span>
                </div>
              </div>

              {/* Score Hero — 3-column dense layout, no dead space */}
              <div className="rounded-2xl p-5 glow-border-top grid gap-5 items-stretch" style={{
                gridTemplateColumns: "auto 1fr auto",
                ...(isDark
                  ? { background: "linear-gradient(135deg, rgba(0,212,170,0.07) 0%, rgba(99,102,241,0.07) 100%)", border: "1px solid rgba(0,212,170,0.18)", boxShadow: "0 0 40px rgba(0,212,170,0.06)" }
                  : { background: "linear-gradient(135deg, #f0fdfa 0%, #ede9fe 100%)", border: "1px solid rgba(13,148,136,0.2)", boxShadow: "0 4px 24px rgba(13,148,136,0.08)" })
                }}>

                {/* Col 1 — Ring + grade */}
                <div className="flex items-center justify-center pr-4" style={{ borderRight: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
                  <ScoreReveal
                    score={result.atsScore}
                    grade={result.grade}
                    verdict={result.verdict}
                    confidence={result.overallConfidence ?? confidence}
                    isDark={isDark}
                  />
                </div>

                {/* Col 2 — Zone bar + insights (fills all middle space) */}
                <div className="flex flex-col justify-between py-1">
                  <ScoreContext
                    score={result.atsScore}
                    grade={result.grade}
                    skillsMatch={result.skillsMatchPercent}
                    isDark={isDark}
                  />
                </div>

                {/* Col 3 — 2×3 quick-stat mini grid */}
                <div className="flex flex-col gap-2 justify-center pl-4 min-w-[140px]" style={{ borderLeft: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)" }}>
                  {[
                    { label: "Skills",      value: `${result.skillsMatchPercent}%`,                                    color: scoreColor(result.skillsMatchPercent) },
                    { label: "Keywords",    value: `${result.matchedKeywords?.length ?? 0}/${kwTotal}`,                 color: "#22c55e" },
                    { label: "Experience",  value: result.resumeProfile?.experienceLevel ?? "—",                        color: isDark ? "#f59e0b" : "#b45309" },
                    { label: "Integrity",   value: `${result.resumeIntegrity?.integrityScore ?? 80}/100`,               color: result.resumeIntegrity?.integrityScore ?? 80 >= 75 ? "#22c55e" : "#f59e0b" },
                    { label: "Confidence",  value: `${result.overallConfidence ?? confidence}%`,                        color: isDark ? "#a855f7" : "#7c3aed" },
                    { label: "Alt Roles",   value: `${result.alternativeRoles?.length ?? 0} found`,                    color: isDark ? "#60a5fa" : "#2563eb" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl"
                      style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                      <span className="text-[11px]" style={{ color: isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)" }}>{stat.label}</span>
                      <span className="text-[11px] font-bold tabular-nums capitalize" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unified dark bento grid — 4 cards same base style */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">

                  {/* ── ATS Score ── */}
                  {(() => { const a = BENTO_ACCENT[0]; return (
                  <div className="card-glow rounded-2xl p-5 flex flex-col gap-3" style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                    border: isDark ? `1px solid ${a.border}` : `1px solid rgba(0,0,0,0.09)`,
                    boxShadow: isDark ? `0 0 20px ${a.glow}` : "0 2px 14px rgba(0,0,0,0.07)",
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>ATS Score</p>
                      <Award size={14} style={{ color: a.num }} />
                    </div>
                    <div className="flex items-end gap-2">
                      <p className={`text-4xl font-black tabular-nums ${result.atsScore >= 80 ? "score-glow-green" : result.atsScore >= 65 ? "score-glow-teal" : result.atsScore >= 45 ? "score-glow-amber" : "score-glow-red"}`}
                        style={{ color: scoreColor(result.atsScore) }}>{result.atsScore}</p>
                      <span className="text-sm mb-1 font-semibold" style={{ color: t3 }}>/100</span>
                      <span className="mb-1 ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: result.atsScore >= 85 ? "rgba(34,197,94,0.15)" : result.atsScore >= 70 ? "rgba(0,212,170,0.15)" : result.atsScore >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                          color: result.atsScore >= 85 ? "#22c55e" : result.atsScore >= 70 ? "#00d4aa" : result.atsScore >= 50 ? "#f59e0b" : "#ef4444",
                          border: `1px solid ${result.atsScore >= 85 ? "rgba(34,197,94,0.3)" : result.atsScore >= 70 ? "rgba(0,212,170,0.3)" : result.atsScore >= 50 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                        }}>
                        {result.atsScore >= 85 ? "Strong" : result.atsScore >= 70 ? "Good" : result.atsScore >= 50 ? "Review" : result.atsScore >= 35 ? "Risk" : "Critical"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: scoreColor(result.atsScore) }}
                        initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
                    </div>
                    {(result.matchedKeywords?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(result.matchedKeywords ?? []).slice(0, 3).map((kw, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                            ✓ {kw}
                          </span>
                        ))}
                        {(result.matchedKeywords?.length ?? 0) > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: t3 }}>
                            +{(result.matchedKeywords?.length ?? 0) - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  ); })()}

                  {/* ── Grade ── */}
                  {(() => { const a = BENTO_ACCENT[1]; return (
                  <div className="card-glow rounded-2xl p-5 flex flex-col gap-3" style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                    border: isDark ? `1px solid ${a.border}` : `1px solid rgba(0,0,0,0.09)`,
                    boxShadow: isDark ? `0 0 20px ${a.glow}` : "0 2px 14px rgba(0,0,0,0.07)",
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Grade</p>
                      <span className="text-xs font-semibold" style={{ color: t3 }}>{confidence}% confidence</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-5xl font-black leading-none score-glow-teal" style={{ color: gc }}>{result.grade}</p>
                      <div>
                        <p className="text-sm font-bold" style={{ color: gc }}>
                          {result.grade === "A" ? "Excellent" : result.grade === "B" ? "Good" : result.grade === "C" ? "Fair" : result.grade === "D" ? "Poor" : "Critical"}
                        </p>
                        <p className="text-[10px] mt-0.5 font-medium" style={{ color: t3 }}>resume grade</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: gc }}
                        initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} />
                    </div>
                    <p className="text-[11px] leading-relaxed line-clamp-2 font-medium" style={{ color: t2 }}>
                      {result.verdict}
                    </p>
                  </div>
                  ); })()}

                  {/* ── Skills Match ── */}
                  {(() => { const a = BENTO_ACCENT[2]; return (
                  <div className="card-glow rounded-2xl p-5 flex flex-col gap-3" style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                    border: isDark ? `1px solid ${a.border}` : `1px solid rgba(0,0,0,0.09)`,
                    boxShadow: isDark ? `0 0 20px ${a.glow}` : "0 2px 14px rgba(0,0,0,0.07)",
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Skills Match</p>
                      <Layers size={14} style={{ color: a.num }} />
                    </div>
                    <div className="flex items-end gap-1">
                      <p className="text-4xl font-black tabular-nums" style={{ color: scoreColor(result.skillsMatchPercent) }}>
                        {result.skillsMatchPercent}
                      </p>
                      <span className="text-xl mb-0.5 font-semibold" style={{ color: t3 }}>%</span>
                    </div>
                    <p className="text-xs font-bold" style={{ color: scoreColor(result.skillsMatchPercent) }}>
                      {result.skillsMatchPercent >= 70 ? "Strong alignment" : result.skillsMatchPercent >= 45 ? "Partial — gaps exist" : "Major gaps present"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(result.resumeProfile?.topSkills ?? []).slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(99,102,241,0.12)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.25)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: scoreColor(result.skillsMatchPercent) }}
                        initial={{ width: 0 }} animate={{ width: `${result.skillsMatchPercent}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                    </div>
                  </div>
                  ); })()}

                  {/* ── Keywords ── */}
                  {(() => { const a = BENTO_ACCENT[3]; return (
                  <div className="card-glow rounded-2xl p-5 flex flex-col gap-3" style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                    border: isDark ? `1px solid ${a.border}` : `1px solid rgba(0,0,0,0.09)`,
                    boxShadow: isDark ? `0 0 20px ${a.glow}` : "0 2px 14px rgba(0,0,0,0.07)",
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>Keywords</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}>
                        {kwScore}% hit
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-black" style={{ color: "#22c55e" }}>{result.matchedKeywords?.length ?? 0}</p>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: "rgba(34,197,94,0.8)" }}>matched</p>
                      </div>
                      <div className="w-px h-10 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }} />
                      <div className="text-center">
                        <p className="text-3xl font-black" style={{ color: isDark ? "#f87171" : "#FADADD" }}>{result.missingKeywords?.length ?? 0}</p>
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: isDark ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.6)" }}>missing</p>
                      </div>
                    </div>
                    {/* Keyword ratio bar */}
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#22c55e,#38bdf8)" }}
                        initial={{ width: 0 }} animate={{ width: `${kwScore}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                    </div>
                    {(result.missingKeywords?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(result.missingKeywords ?? []).slice(0, 2).map((kw, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}>
                            ✗ {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  ); })()}
                </div>

                {/* Radar chart */}
                <div className="rounded-2xl p-4 flex flex-col items-center justify-center" style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.09)",
                  boxShadow: isDark ? "none" : "0 2px 14px rgba(0,0,0,0.07)",
                }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: t2 }}>Profile Radar</p>
                  <RadarChart dimensions={dimensions} size={220} isDark={isDark} />
                </div>
              </div>

              {/* Strength Compass + Performance Dimensions — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <StrengthCompass
                  atsScore={result.atsScore}
                  skillsMatch={result.skillsMatchPercent}
                  kwScore={kwScore}
                  expScore={expScore}
                  clarityScore={rewriteScore}
                  integrityScore={result.resumeIntegrity?.integrityScore ?? 80}
                  isDark={isDark}
                />

              {/* Performance dimension bars */}
              <div className="rounded-2xl p-5 flex flex-col" style={isDark
                ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
              }>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t2 }}>Performance Dimensions</p>
                <div className="grid grid-cols-5 gap-3 flex-1">
                  {dimBars.map((dim, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <p className="text-lg font-bold tabular-nums" style={{ color: dim.color }}>{dim.value}</p>
                      <div className="w-full flex-1 min-h-[80px] rounded-xl overflow-hidden flex items-end" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                        <motion.div className="w-full rounded-xl" style={{ background: `linear-gradient(to top, ${dim.color}, ${dim.color}88)` }}
                          initial={{ height: 0 }} animate={{ height: `${dim.value}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 + i * 0.1 }} />
                      </div>
                      <p className="text-[10px] text-center leading-tight font-medium" style={{ color: t2 }}>{dim.label}</p>
                    </div>
                  ))}
                </div>
                {/* Summary footer row */}
                <div className="mt-4 pt-3 grid grid-cols-5 gap-3" style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                  {dimBars.map((dim, i) => (
                    <div key={i} className="text-center">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: dim.value >= 70 ? "rgba(34,197,94,0.12)" : dim.value >= 45 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                          color: dim.value >= 70 ? "#22c55e" : dim.value >= 45 ? "#f59e0b" : "#ef4444"
                        }}>
                        {dim.value >= 70 ? "Good" : dim.value >= 45 ? "Fair" : "Weak"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>{/* end Compass + DimBars grid */}

              {/* Strengths + Weaknesses */}
              <div className="grid grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl p-5 flex flex-col" style={isDark
                  ? { background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }
                  : { background: "#D1F7C4", border: "1px solid #A8EDAA", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
                }>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#22c55e" : "#1A6B3C" }}>Strengths</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                      {result.strengths?.length ?? 0} found
                    </span>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {(result.strengths ?? []).map((s, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-2 text-sm" style={{ color: isDark ? t2 : "#1A1D23" }}>
                        <span style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} className="mt-0.5 shrink-0 font-bold">✓</span>{s}
                      </motion.li>
                    ))}
                  </ul>
                  {/* Top matched skills footer */}
                  {(result.resumeProfile?.topSkills?.length ?? 0) > 0 && (
                    <div className="mt-4 pt-3 flex flex-wrap gap-1.5" style={{ borderTop: isDark ? "1px solid rgba(34,197,94,0.12)" : "1px solid rgba(26,107,60,0.15)" }}>
                      {(result.resumeProfile?.topSkills ?? []).slice(0, 4).map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: isDark ? "rgba(34,197,94,0.1)" : "rgba(26,107,60,0.1)", color: isDark ? "#4ade80" : "#1A6B3C", border: isDark ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(26,107,60,0.2)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setTab("interview")}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: isDark ? "rgba(34,197,94,0.7)" : "#1A6B3C" }}>
                    <Brain size={11} /> Prep interview questions <ArrowRight size={10} />
                  </button>
                </div>
                <div className="rounded-2xl p-5 flex flex-col" style={isDark
                  ? { background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }
                  : { background: "#FADADD", border: "1px solid #F5B8B8", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
                }>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <XCircle size={14} style={{ color: isDark ? "#f87171" : "#c0392b" }} />
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? "#f87171" : "#c0392b" }}>Weaknesses</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                      {result.weaknesses?.length ?? 0} gaps
                    </span>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {(result.weaknesses ?? []).map((w, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-2 text-sm" style={{ color: isDark ? t2 : "#1A1D23" }}>
                        <span style={{ color: isDark ? "#f87171" : "#c0392b" }} className="mt-0.5 shrink-0 font-bold">✗</span>{w}
                      </motion.li>
                    ))}
                  </ul>
                  {/* Top missing keywords footer */}
                  {(result.missingKeywords?.length ?? 0) > 0 && (
                    <div className="mt-4 pt-3 flex flex-wrap gap-1.5" style={{ borderTop: isDark ? "1px solid rgba(239,68,68,0.12)" : "1px solid rgba(192,57,43,0.15)" }}>
                      {(result.missingKeywords ?? []).slice(0, 4).map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: isDark ? "rgba(239,68,68,0.1)" : "rgba(192,57,43,0.1)", color: isDark ? "#fca5a5" : "#c0392b", border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(192,57,43,0.2)" }}>
                          + {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setTab("keywords")}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: isDark ? "rgba(248,113,113,0.7)" : "#c0392b" }}>
                    <Key size={11} /> Fix missing keywords <ArrowRight size={10} />
                  </button>
                </div>
              </div>

              {/* Score Improvement Projection */}
              {(result.counterfactuals?.length ?? 0) > 0 && (() => {
                const topGains = (result.counterfactuals ?? []).slice(0, 3).reduce((s, c) => s + c.pointsGain, 0);
                const projectedScore = Math.min(99, result.atsScore + topGains);
                const rewriteBoost = Math.min(8, (result.rewriteSuggestions?.length ?? 0) * 2);
                const fullProjected = Math.min(99, projectedScore + rewriteBoost);
                return (
                  <div className="rounded-2xl p-5" style={isDark
                    ? { background: "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(99,102,241,0.06))", border: "1px solid rgba(0,212,170,0.15)" }
                    : { background: "linear-gradient(135deg, #037DD620, #5C21A115)", border: "1px solid rgba(3,125,214,0.2)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }
                  }>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb size={14} style={{ color: accent }} />
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t2 }}>
                          Score Improvement Projection
                        </p>
                      </div>
                      <button onClick={() => setTab("whatif")}
                        className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all hover:opacity-80"
                        style={{ background: isDark ? "rgba(0,212,170,0.12)" : "rgba(3,125,214,0.1)", color: accent, border: `1px solid ${accent}30` }}>
                        Full Simulator <ArrowRight size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: t3 }}>Current Score</p>
                        <p className="text-4xl font-black tabular-nums" style={{ color: scoreColor(result.atsScore) }}>{result.atsScore}</p>
                        <p className="text-xs mt-1" style={{ color: t3 }}>Grade {result.grade}</p>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                            <motion.div className="h-full rounded-full" style={{ background: scoreColor(result.atsScore) }}
                              initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                          </div>
                          <span className="text-xs tabular-nums w-8 text-right" style={{ color: t3 }}>{result.atsScore}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center">
                          <ArrowRight size={12} style={{ color: accent }} />
                          <span className="text-xs font-medium" style={{ color: t2 }}>add top 3 skills</span>
                          <ArrowRight size={12} style={{ color: accent }} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                            <motion.div className="h-full rounded-full" style={{ background: scoreColor(fullProjected) }}
                              initial={{ width: `${result.atsScore}%` }} animate={{ width: `${fullProjected}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                          </div>
                          <span className="text-xs tabular-nums w-8 text-right font-bold" style={{ color: scoreColor(fullProjected) }}>{fullProjected}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs mb-1" style={{ color: t3 }}>Projected Score</p>
                        <p className="text-4xl font-black tabular-nums" style={{ color: scoreColor(fullProjected) }}>{fullProjected}</p>
                        <p className="text-xs mt-1 font-semibold" style={{ color: accent }}>+{fullProjected - result.atsScore} pts</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(result.counterfactuals ?? []).slice(0, 3).map((cf, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: isDark ? "rgba(0,212,170,0.1)" : "rgba(3,125,214,0.1)", color: accent, border: `1px solid ${accent}30` }}>
                          +{cf.pointsGain} if you add {cf.skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Parsed Resume Profile */}
              {result.resumeProfile && (
                <div className="rounded-2xl p-5" style={isDark
                  ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                  : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
                }>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: t2 }}>Parsed Resume Profile</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: isDark ? "rgba(0,212,170,0.12)" : `${accent2}15`, border: `1px solid ${isDark ? "rgba(0,212,170,0.2)" : accent2 + "30"}` }}>
                          <span className="text-sm font-bold" style={{ color: isDark ? "#00d4aa" : accent2 }}>{(result.resumeProfile.name ?? "?")[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: t1 }}>{result.resumeProfile.name}</p>
                          <p className="text-xs capitalize" style={{ color: t3 }}>{result.resumeProfile.experienceLevel} · {result.resumeProfile.experienceYears}y exp</p>
                        </div>
                      </div>
                      {[
                        { icon: Mail,    val: result.resumeProfile.email },
                        { icon: Phone,   val: result.resumeProfile.phone },
                        { icon: MapPin,  val: result.resumeProfile.location },
                        { icon: Globe,   val: result.resumeProfile.linkedin },
                        { icon: GitBranch, val: result.resumeProfile.github },
                        { icon: Globe,   val: result.resumeProfile.portfolio },
                      ].filter(r => r.val && r.val !== "Not found").map(({ icon: Icon, val }, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: t2 }}>
                          <Icon size={12} style={{ color: t3 }} className="shrink-0" />
                          <span className="truncate">{val}</span>
                        </div>
                      ))}
                      {result.resumeProfile.gpa && result.resumeProfile.gpa !== "Not found" && (
                        <div className="flex items-center gap-2 text-xs" style={{ color: t2 }}>
                          <Star size={12} style={{ color: accent3 }} className="shrink-0" />
                          <span>GPA: {result.resumeProfile.gpa}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: t3 }}>Education</p>
                        <p className="text-sm" style={{ color: t1 }}>{result.resumeProfile.educationLevel}</p>
                        {result.resumeProfile.institution && result.resumeProfile.institution !== "Not found" && (
                          <p className="text-xs" style={{ color: t3 }}>{result.resumeProfile.institution}{result.resumeProfile.graduationYear && result.resumeProfile.graduationYear !== "Not found" ? ` · ${result.resumeProfile.graduationYear}` : ""}</p>
                        )}
                      </div>
                      {(result.resumeProfile.companies?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: t3 }}>Companies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(result.resumeProfile.companies ?? []).map((c, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: isDark ? "rgba(99,102,241,0.1)" : "#DBC8FF", border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #C4A8FF", color: isDark ? "#818cf8" : "#5C21A1" }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(result.resumeProfile.certifications?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: t3 }}>Certifications</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(result.resumeProfile.certifications ?? []).map((c, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: isDark ? "rgba(245,158,11,0.1)" : "#FFE4C2", border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid #FFBB73", color: isDark ? "#fbbf24" : "#b45309" }}>{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(result.resumeProfile.projects?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: t3 }}>Projects</p>
                          <ul className="space-y-1">
                            {(result.resumeProfile.projects ?? []).slice(0, 3).map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: t2 }}>
                                <GitBranch size={11} style={{ color: t3 }} className="shrink-0" />{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}` }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: t3 }}>Top Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.resumeProfile.topSkills ?? []).map((s, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: isDark ? "rgba(0,212,170,0.08)" : `${accent}12`, border: isDark ? "1px solid rgba(0,212,170,0.2)" : `1px solid ${accent}30`, color: isDark ? "#5eead4" : accent }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══ KEYWORDS ══ */}
          {tab === "keywords" && (
            <motion.div key="keywords" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">

              {/* Score context banner */}
              <ScoreContext
                score={result.atsScore}
                grade={result.grade}
                skillsMatch={result.skillsMatchPercent}
                isDark={isDark}
              />

              {/* Visual keyword heatmap */}
              <KeywordVisualizer
                matched={result.matchedKeywords ?? []}
                missing={result.missingKeywords ?? []}
                isDark={isDark}
              />
              {/* Word-diff rewrite panel */}
              <div className="rounded-2xl p-5" style={isDark
                ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
              }>
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb size={14} style={{ color: accent3 }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: accent3 }}>AI Rewrite Suggestions</p>
                </div>
                <RewriteDiff suggestions={result.rewriteSuggestions ?? []} isDark={isDark} />
              </div>
            </motion.div>
          )}

          {tab === "interview" && (
            <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <InterviewPrep questions={result.interviewQuestions ?? []} isDark={isDark} />
            </motion.div>
          )}
          {tab === "action" && (
            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ActionPlan steps={result.actionPlan ?? []} isDark={isDark} />
            </motion.div>
          )}
          {tab === "courses" && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <CourseRecommendations skillCourses={skillCourses} loading={coursesLoading} isDark={isDark} />
            </motion.div>
          )}

          {/* ══ ALT ROLES ══ */}
          {tab === "alternatives" && (
            <motion.div key="alternatives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
              <p className="text-sm mb-5" style={{ color: t2 }}>Based on your resume, these roles may be a stronger fit.</p>
              {(result.alternativeRoles ?? []).map((role, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="card-glow rounded-2xl p-5 flex items-center gap-4"
                  style={isDark
                    ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                    : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                  }
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: isDark ? "rgba(168,85,247,0.12)" : "#DBC8FF", border: isDark ? "1px solid rgba(168,85,247,0.25)" : "1px solid #C4A8FF", color: isDark ? "#c084fc" : "#5C21A1" }}>
                    {role.matchPercent}%
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold mb-1" style={{ color: t1 }}>{role.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: t2 }}>{role.reason}</p>
                  </div>
                  <div className="w-24">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: isDark ? "#a855f7" : "#5C21A1" }}
                        initial={{ width: 0 }} animate={{ width: `${role.matchPercent}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ══ WHAT-IF SIMULATOR ══ */}
          {tab === "whatif" && (
            <motion.div key="whatif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div className="rounded-2xl p-5" style={isDark
                ? { background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)" }
                : { background: "#DBC8FF", border: "1px solid #C4A8FF", boxShadow: "0 2px 12px rgba(92,33,161,0.12)" }
              }>
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical size={16} style={{ color: isDark ? "#818cf8" : "#5C21A1" }} />
                  <p className="text-base font-bold" style={{ color: isDark ? "#f0f4ff" : "#1A1D23" }}>Counterfactual What-If Simulator</p>
                </div>
                <p className="text-sm" style={{ color: t2 }}>If you added each missing skill to your resume, your projected ATS score would change by:</p>
              </div>
              <div className="space-y-3">
                {(result.counterfactuals ?? []).map((cf, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="card-glow rounded-2xl p-5" style={isDark
                      ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                      : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                    }
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: isDark ? "rgba(0,212,170,0.1)" : `${accent}12`, border: isDark ? "1px solid rgba(0,212,170,0.25)" : `1px solid ${accent}30` }}>
                          <Brain size={16} style={{ color: accent }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: t1 }}>{cf.skill}</p>
                          <p className="text-xs" style={{ color: t3 }}>Missing from your resume</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold" style={{ color: isDark ? "#00d4aa" : "#1A6B3C" }}>+{cf.pointsGain} pts</p>
                        <p className="text-xs" style={{ color: t3 }}>{cf.currentScore} to {cf.projectedScore}</p>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden mb-3" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                      <motion.div className="absolute top-0 left-0 h-full rounded-full" style={{ background: scoreColor(cf.currentScore) }}
                        initial={{ width: 0 }} animate={{ width: `${cf.currentScore}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }} />
                      <motion.div className="absolute top-0 left-0 h-full rounded-full opacity-40" style={{ background: accent }}
                        initial={{ width: 0 }} animate={{ width: `${cf.projectedScore}%` }} transition={{ duration: 1, delay: 0.4 + i * 0.06 }} />
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: isDark ? "rgba(99,102,241,0.07)" : "#DBC8FF", border: isDark ? "1px solid rgba(99,102,241,0.15)" : "1px solid #C4A8FF" }}>
                      <ArrowRight size={12} style={{ color: isDark ? "#818cf8" : "#5C21A1" }} className="shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed" style={{ color: isDark ? t2 : "#1A1D23" }}>{cf.howToAdd}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ JD BIAS SCAN ══ */}
          {tab === "jdscan" && (
            <motion.div key="jdscan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div className="rounded-2xl p-5 flex items-center justify-between" style={isDark
                ? { background: result.jdBiasReport?.overallRating === "clean" ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${biasRatingColor(result.jdBiasReport?.overallRating ?? "clean")}30` }
                : { background: result.jdBiasReport?.overallRating === "clean" ? "#D1F7C4" : "#FADADD", border: `1px solid ${result.jdBiasReport?.overallRating === "clean" ? "#A8EDAA" : "#F5B8B8"}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
              }>
                <div className="flex items-center gap-3">
                  <ScanSearch size={20} style={{ color: biasRatingColor(result.jdBiasReport?.overallRating ?? "clean") }} />
                  <div>
                    <p className="text-base font-bold" style={{ color: t1 }}>JD Bias Scanner</p>
                    <p className="text-sm" style={{ color: t2 }}>{result.jdBiasReport?.summary}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: t3 }}>Rating</p>
                  <p className="text-lg font-bold capitalize" style={{ color: biasRatingColor(result.jdBiasReport?.overallRating ?? "clean") }}>
                    {result.jdBiasReport?.overallRating ?? "clean"}
                  </p>
                </div>
              </div>
              {(result.jdBiasReport?.biasedPhrases?.length ?? 0) === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={isDark
                  ? { background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }
                  : { background: "#D1F7C4", border: "1px solid #A8EDAA" }
                }>
                  <CheckCircle size={32} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} className="mx-auto mb-3" />
                  <p className="font-medium" style={{ color: t1 }}>No biased language detected</p>
                  <p className="text-sm mt-1" style={{ color: t2 }}>This job description meets inclusive language standards.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(result.jdBiasReport?.biasedPhrases ?? []).map((phrase, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="card-glow rounded-2xl p-5 space-y-3"
                      style={isDark
                        ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                        : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-sm px-3 py-1 rounded-lg font-mono"
                          style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#FADADD", border: isDark ? "1px solid rgba(239,68,68,0.2)" : "1px solid #F5B8B8", color: isDark ? "#fca5a5" : "#c0392b" }}>
                          &quot;{phrase.phrase}&quot;
                        </code>
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize font-medium"
                          style={{ background: `${biasColor(phrase.biasType)}18`, border: `1px solid ${biasColor(phrase.biasType)}35`, color: biasColor(phrase.biasType) }}>
                          {phrase.biasType}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: t2 }}>{phrase.explanation}</p>
                      <div className="flex items-center gap-2 p-3 rounded-xl"
                        style={{ background: isDark ? "rgba(34,197,94,0.06)" : "#D1F7C4", border: isDark ? "1px solid rgba(34,197,94,0.15)" : "1px solid #A8EDAA" }}>
                        <CheckCircle size={12} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} className="shrink-0" />
                        <p className="text-xs" style={{ color: t2 }}>Replace with: <span className="font-medium" style={{ color: isDark ? "#22c55e" : "#1A6B3C" }}>&quot;{phrase.suggestion}&quot;</span></p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ INTEGRITY CHECK ══ */}
          {tab === "integrity" && (
            <motion.div key="integrity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div className="card-glow rounded-2xl p-5" style={isDark
                ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }
              }>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileCheck size={20} style={{ color: accent }} />
                    <div>
                      <p className="text-base font-bold" style={{ color: t1 }}>Resume Integrity Check</p>
                      <p className="text-sm" style={{ color: t2 }}>{result.resumeIntegrity?.verdict}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: (result.resumeIntegrity?.integrityScore ?? 85) >= 80 ? "#16a34a" : "#b45309" }}>
                      {result.resumeIntegrity?.integrityScore ?? 85}
                    </p>
                    <p className="text-xs" style={{ color: t3 }}>/ 100 integrity</p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: (result.resumeIntegrity?.integrityScore ?? 85) >= 80 ? "#22c55e" : "#f59e0b" }}
                    initial={{ width: 0 }} animate={{ width: `${result.resumeIntegrity?.integrityScore ?? 85}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
                </div>
              </div>
              {(result.resumeIntegrity?.flags?.length ?? 0) === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={isDark
                  ? { background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }
                  : { background: "#D1F7C4", border: "1px solid #A8EDAA" }
                }>
                  <Shield size={32} style={{ color: isDark ? "#22c55e" : "#1A6B3C" }} className="mx-auto mb-3" />
                  <p className="font-medium" style={{ color: t1 }}>Resume passes all integrity checks</p>
                  <p className="text-sm mt-1" style={{ color: t2 }}>No red flags, keyword stuffing, or suspicious claims detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest" style={{ color: t3 }}>Issues Found</p>
                  {(result.resumeIntegrity?.flags ?? []).map((flag, i) => {
                    const sevColor = flag.severity === "high" ? "#ef4444" : flag.severity === "medium" ? "#f59e0b" : "#60a5fa";
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="rounded-2xl p-4 flex gap-4"
                        style={isDark
                          ? { background: "rgba(255,255,255,0.03)", border: `1px solid ${sevColor}25` }
                          : { background: "#FFFFFF", border: `1px solid ${sevColor}40`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                        }
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${sevColor}12`, border: `1px solid ${sevColor}30` }}>
                          <AlertTriangle size={14} style={{ color: sevColor }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold" style={{ color: t1 }}>{flag.issue}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${sevColor}15`, color: sevColor }}>{flag.severity}</span>
                          </div>
                          <p className="text-sm" style={{ color: t2 }}>{flag.detail}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ══ LIVE JOBS ══ */}
          {tab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
              {jobsLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <motion.div className="w-10 h-10 rounded-full border-2 border-t-transparent"
                    style={{ borderColor: `${accent}40`, borderTopColor: accent }}
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  <p className="text-sm" style={{ color: t2 }}>Searching live job boards...</p>
                </div>
              )}
              {jobsError && (
                <div className="rounded-2xl p-5 text-center" style={{ background: isDark ? "rgba(239,68,68,0.06)" : "#FADADD", border: isDark ? "1px solid rgba(239,68,68,0.15)" : "1px solid #F5B8B8" }}>
                  <p style={{ color: isDark ? "#f87171" : "#c0392b" }}>{jobsError}</p>
                </div>
              )}
              {jobsData && !jobsLoading && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl p-4 text-center" style={isDark
                      ? { background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.15)" }
                      : { background: "#037DD6", border: "1px solid #037DD6", boxShadow: "0 4px 16px rgba(3,125,214,0.25)" }
                    }>
                      <p className="text-2xl font-bold" style={{ color: isDark ? "#00d4aa" : "#fff" }}>{jobsData.marketInsights.totalJobsFound}</p>
                      <p className="text-xs mt-1" style={{ color: isDark ? t3 : "rgba(255,255,255,0.65)" }}>Live Jobs Found</p>
                    </div>
                    <div className="rounded-2xl p-4" style={isDark
                      ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                      : { background: "#DBC8FF", border: "1px solid #C4A8FF", boxShadow: "0 2px 8px rgba(92,33,161,0.12)" }
                    }>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: isDark ? t3 : "#5C21A1" }}>Top Skills in Demand</p>
                      <div className="flex flex-wrap gap-1">
                        {(jobsData.marketInsights.topSkillsInDemand ?? []).slice(0, 4).map((s, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: isDark ? "rgba(99,102,241,0.12)" : "rgba(92,33,161,0.12)", color: isDark ? "#818cf8" : "#5C21A1" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl p-4" style={isDark
                      ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                      : { background: "#D1F7C4", border: "1px solid #A8EDAA", boxShadow: "0 2px 8px rgba(26,107,60,0.1)" }
                    }>
                      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: isDark ? t3 : "#1A6B3C" }}>Top Hiring Companies</p>
                      <div className="space-y-1">
                        {(jobsData.marketInsights.topCompanies ?? []).slice(0, 3).map((c, i) => (
                          <p key={i} className="text-xs flex items-center gap-1" style={{ color: isDark ? t2 : "#1A1D23" }}>
                            <Building2 size={10} style={{ color: isDark ? t3 : "#1A6B3C" }} />{c}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: t3 }}>
                      {jobsData.targetRoleJobs.roleCategory} — {jobsData.targetRoleJobs.jobs.length} jobs
                    </p>
                    <div className="space-y-3">
                      {jobsData.targetRoleJobs.jobs.map((job, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          className="rounded-2xl p-4" style={isDark
                            ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
                            : { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                              style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#F2F4F6", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                              {job.companyLogo ? (
                                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <Building2 size={16} style={{ color: t3 }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold truncate" style={{ color: t1 }}>{job.title}</p>
                                {job.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: isDark ? "rgba(0,212,170,0.15)" : `${accent}15`, color: accent }}>NEW</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: t3 }}>
                                <span className="font-medium" style={{ color: t2 }}>{job.company}</span>
                                <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase size={10} />{job.jobType}</span>
                                {job.postedDate && <span className="flex items-center gap-1"><Clock size={10} />{job.postedDate}</span>}
                                {job.salary && <span style={{ color: accent3 }} className="font-medium">{job.salary}</span>}
                              </div>
                              {job.matchedSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {job.matchedSkills.map((s, j) => (
                                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded"
                                      style={{ background: isDark ? "rgba(34,197,94,0.1)" : "#D1F7C4", color: isDark ? "#86efac" : "#1A6B3C" }}>{s}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {job.matchScore > 0 && (
                                <div className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: `${scoreColor(job.matchScore)}18`, color: scoreColor(job.matchScore) }}>
                                  {job.matchScore}% match
                                </div>
                              )}
                              <a href={job.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 whitespace-nowrap"
                                style={isDark
                                  ? { background: "rgba(0,212,170,0.15)", border: "1px solid rgba(0,212,170,0.3)", color: "#00d4aa" }
                                  : { background: "#037DD6", color: "#fff", border: "1px solid #037DD6", boxShadow: "0 2px 8px rgba(3,125,214,0.25)" }
                                }>
                                Apply Directly <ExternalLink size={11} />
                              </a>
                              {job.companyUrl && (
                                <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] flex items-center gap-0.5 transition-colors" style={{ color: t3 }}>
                                  <Globe size={9} /> Company site
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {(jobsData.alternativeRoleJobs ?? []).map((category, ci) => (
                    <div key={ci}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: t3 }}>
                        {category.roleCategory} — {category.jobs.length} jobs
                      </p>
                      <div className="space-y-3">
                        {category.jobs.slice(0, 4).map((job, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            className="rounded-2xl p-4" style={isDark
                              ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.1)" }
                              : { background: "#FFFFFF", border: "1px solid #DBC8FF", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                                style={{ background: isDark ? "rgba(168,85,247,0.08)" : "#DBC8FF", border: isDark ? "1px solid rgba(168,85,247,0.15)" : "1px solid #C4A8FF" }}>
                                {job.companyLogo ? (
                                  <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                ) : (
                                  <Building2 size={14} style={{ color: isDark ? "rgba(168,85,247,0.4)" : "#5C21A1" }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate mb-1" style={{ color: t1 }}>{job.title}</p>
                                <div className="flex items-center gap-3 text-xs" style={{ color: t3 }}>
                                  <span className="font-medium" style={{ color: t2 }}>{job.company}</span>
                                  <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                                  {job.salary && <span style={{ color: isDark ? "#a855f7" : "#5C21A1" }}>{job.salary}</span>}
                                </div>
                              </div>
                              <a href={job.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 shrink-0"
                                style={isDark
                                  ? { background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }
                                  : { background: "#5C21A1", color: "#fff", border: "1px solid #5C21A1", boxShadow: "0 2px 8px rgba(92,33,161,0.25)" }
                                }>
                                Apply Directly <ExternalLink size={11} />
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ══ COVER LETTER ══ */}
          {tab === "coverletter" && (
            <motion.div key="coverletter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <CoverLetterGenerator
                resume={resume}
                jobDescription={jobDescription}
                candidateName={result.resumeProfile?.name}
                targetRole={result.resumeProfile?.roles?.[0] ?? ""}
                isDark={isDark}
              />
            </motion.div>
          )}

          {tab === "linkedin" && (
            <motion.div key="linkedin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <LinkedInOptimizer result={result} isDark={isDark} />
            </motion.div>
          )}

          {tab === "builder" && (
            <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <ResumeBuilder result={result} jobDescription={jobDescription} isDark={isDark} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
