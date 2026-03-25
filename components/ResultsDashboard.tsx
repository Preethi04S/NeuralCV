"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Copy, Check, BarChart2, MessageSquare, Zap, Target, TrendingUp, Shield, ShieldCheck, Briefcase, Loader2 } from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { InterviewPrep } from "./InterviewPrep";
import { ActionPlan } from "./ActionPlan";
import { ResumeProfile } from "./ResumeProfile";
import { CounterfactualSimulator } from "./CounterfactualSimulator";
import { JDBiasScanner } from "./JDBiasScanner";
import { ResumeIntegrityCheck } from "./ResumeIntegrityCheck";
import { AIPassport } from "./AIPassport";
import { LiveJobs } from "./LiveJobs";
import { MarketInsights } from "./MarketInsights";
import type { AnalysisResult, LiveJobsData } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
  liveJobsData?: LiveJobsData | null;
  jobsLoading?: boolean;
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0" title="Copy">
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

type Tab = "analysis" | "interview" | "action" | "whatif" | "bias" | "integrity" | "passport" | "jobs";

const TABS = [
  { key: "analysis" as Tab, label: "Analysis", icon: BarChart2 },
  { key: "interview" as Tab, label: "Interview", icon: MessageSquare },
  { key: "action" as Tab, label: "Action Plan", icon: Zap },
  { key: "whatif" as Tab, label: "What-If", icon: TrendingUp },
  { key: "bias" as Tab, label: "JD Bias", icon: Shield },
  { key: "integrity" as Tab, label: "Integrity", icon: ShieldCheck },
  { key: "passport" as Tab, label: "AI Passport", icon: Target },
  { key: "jobs" as Tab, label: "Live Jobs", icon: Briefcase },
];

export function ResultsDashboard({ result, liveJobsData, jobsLoading }: Props) {
  const [tab, setTab] = useState<Tab>("analysis");

  const confidenceColor = (result.overallConfidence ?? 85) >= 85 ? "#22c55e" : (result.overallConfidence ?? 85) >= 70 ? "#f59e0b" : "#f97316";

  return (
    <div className="w-full">
      {result.resumeProfile && <ResumeProfile profile={result.resumeProfile} />}

      {/* Verdict + confidence banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="mb-5 px-5 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
        <Lightbulb size={16} className="text-purple-400 mt-0.5 shrink-0" />
        <p className="text-sm text-white/70 leading-relaxed flex-1">
          <span className="text-purple-300 font-semibold">AI Verdict: </span>{result.verdict}
        </p>
        {result.overallConfidence != null && (
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-xs font-bold tabular-nums" style={{ color: confidenceColor }}>{result.overallConfidence}%</span>
            <span className="text-xs text-white/25">confidence</span>
          </div>
        )}
      </motion.div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto scrollbar-none"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center min-w-0"
            style={tab === key
              ? { background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }
              : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }}>
            <Icon size={12} className="shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Analysis ── */}
        {tab === "analysis" && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5">
              <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-2xl p-6 flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">ATS Score</p>
                  <ScoreGauge score={result.atsScore} grade={result.grade} />
                </div>
                <div className="card-glass rounded-2xl p-6 flex flex-col justify-between">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Skills Match</p>
                  <div className="mt-4">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-4xl font-bold text-white tabular-nums">{result.skillsMatchPercent}</span>
                      <span className="text-white/40 text-lg mb-1">%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: result.skillsMatchPercent >= 70 ? "#22c55e" : result.skillsMatchPercent >= 45 ? "#f59e0b" : "#ef4444" }}
                        initial={{ width: 0 }} animate={{ width: `${result.skillsMatchPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }} />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-3">
                    {result.skillsMatchPercent >= 70 ? "Strong alignment" : result.skillsMatchPercent >= 45 ? "Partial — gaps addressable" : "Significant gaps present"}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-2xl p-5">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">&#10003; Matched Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.matchedKeywords ?? []).slice(0, 8).map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>{kw}</span>
                    ))}
                    {(result.matchedKeywords ?? []).length === 0 && <span className="text-xs text-white/25">None found</span>}
                  </div>
                </div>
                <div className="card-glass rounded-2xl p-5">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">&#10007; Missing Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingKeywords ?? []).map((kw, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 * i }}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", color: "#fca5a5" }}>{kw}</motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle size={15} className="text-green-400" /><p className="text-xs font-medium text-white/40 uppercase tracking-widest">Strengths</p></div>
                  <ul className="space-y-2.5">{(result.strengths ?? []).map((s, i) => (<li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="text-green-400 mt-0.5 shrink-0 text-xs">&#10003;</span>{s}</li>))}</ul>
                </div>
                <div className="card-glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><XCircle size={15} className="text-red-400" /><p className="text-xs font-medium text-white/40 uppercase tracking-widest">Weaknesses</p></div>
                  <ul className="space-y-2.5">{(result.weaknesses ?? []).map((w, i) => (<li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="text-red-400 mt-0.5 shrink-0 text-xs">&#10007;</span>{w}</li>))}</ul>
                </div>
              </motion.div>

              <motion.div variants={stagger.item} className="card-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5"><Lightbulb size={15} className="text-purple-400" /><p className="text-xs font-medium text-white/40 uppercase tracking-widest">Rewrite Suggestions</p></div>
                <div className="space-y-5">
                  {(result.rewriteSuggestions ?? []).map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.14)" }}>
                        <p className="text-sm text-white/35 line-through leading-relaxed">{s.original}</p>
                      </div>
                      <div className="flex items-center gap-2 px-1"><ArrowRight size={13} className="text-purple-400 shrink-0" /><span className="text-xs text-white/30">{s.reason}</span></div>
                      <div className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)" }}>
                        <p className="text-sm text-white/88 leading-relaxed">{s.improved}</p>
                        <CopyButton text={s.improved} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {tab === "interview" && (
          <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <InterviewPrep questions={result.interviewQuestions ?? []} />
          </motion.div>
        )}

        {tab === "action" && (
          <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <ActionPlan steps={result.actionPlan ?? []} />
          </motion.div>
        )}

        {tab === "whatif" && (
          <motion.div key="whatif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Counterfactual Skill Impact Simulator</h3>
              <p className="text-xs text-white/35">Based on USP #41 — Counterfactual Rejection Analyzer. See exactly how many points each missing skill would add to your ATS score if you added it to your resume.</p>
            </div>
            {(result.counterfactuals ?? []).length > 0
              ? <CounterfactualSimulator counterfactuals={result.counterfactuals} currentScore={result.atsScore} />
              : <p className="text-sm text-white/30 text-center py-8">No counterfactual data available</p>
            }
          </motion.div>
        )}

        {tab === "bias" && (
          <motion.div key="bias" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Job Description Bias Scanner</h3>
              <p className="text-xs text-white/35">Based on USP #225 — Job Description Bias Screener. Detects gender-coded, age-biased, exclusionary, and ableist language that could reduce candidate pool diversity or expose the company to legal risk.</p>
            </div>
            {result.jdBiasReport
              ? <JDBiasScanner report={result.jdBiasReport} />
              : <p className="text-sm text-white/30 text-center py-8">Bias scan data unavailable</p>
            }
          </motion.div>
        )}

        {tab === "integrity" && (
          <motion.div key="integrity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Resume Integrity Check</h3>
              <p className="text-xs text-white/35">Based on USP #331 — AI Fake Detection Agent. Analyzes your resume for keyword stuffing, skill-experience mismatches, implausible claims, and other credibility signals.</p>
            </div>
            {result.resumeIntegrity
              ? <ResumeIntegrityCheck integrity={result.resumeIntegrity} />
              : <p className="text-sm text-white/30 text-center py-8">Integrity data unavailable</p>
            }
          </motion.div>
        )}

        {tab === "passport" && (
          <motion.div key="passport" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Candidate AI Transparency Passport</h3>
              <p className="text-xs text-white/35">Based on USP #77 — Candidate AI Use Passport. Full transparency into every AI agent that analyzed your resume — which model, what it found, and confidence level. Downloadable as JSON.</p>
            </div>
            {result.agentPassport
              ? <AIPassport passport={result.agentPassport} overallConfidence={result.overallConfidence ?? 85} />
              : <p className="text-sm text-white/30 text-center py-8">Passport data unavailable</p>
            }
          </motion.div>
        )}

        {tab === "jobs" && (
          <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white/80 mb-1">Live Job Recommendations</h3>
              <p className="text-xs text-white/35">Real-time job listings from Remotive, matched against your resume skills. Jobs sorted by fit score — highest match first.</p>
            </div>
            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="text-purple-400 animate-spin" />
                <p className="text-sm text-white/40">Searching live job boards for your profile...</p>
                <p className="text-xs text-white/25">Scanning remote opportunities in real time</p>
              </div>
            ) : liveJobsData ? (
              <>
                <MarketInsights insights={liveJobsData.marketInsights} />
                <LiveJobs
                  targetRoleJobs={liveJobsData.targetRoleJobs}
                  alternativeRoleJobs={liveJobsData.alternativeRoleJobs}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <Briefcase size={32} className="mx-auto mb-3 text-white/15" />
                <p className="text-sm text-white/30">Run the analysis to see live job recommendations.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
