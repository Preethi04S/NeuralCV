"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Copy, Check, BarChart2, MessageSquare, Zap, Target } from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { InterviewPrep } from "./InterviewPrep";
import { ActionPlan } from "./ActionPlan";
import { ResumeProfile } from "./ResumeProfile";
import type { AnalysisResult } from "@/types/analysis";

interface Props {
  result: AnalysisResult;
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.38 } } },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

type Tab = "analysis" | "interview" | "action" | "alternatives";

const TABS = [
  { key: "analysis" as Tab, label: "Analysis", icon: BarChart2 },
  { key: "interview" as Tab, label: "Interview", icon: MessageSquare },
  { key: "action" as Tab, label: "Action Plan", icon: Zap },
  { key: "alternatives" as Tab, label: "Other Roles", icon: Target },
];

export function ResultsDashboard({ result }: Props) {
  const [tab, setTab] = useState<Tab>("analysis");

  return (
    <div className="w-full">
      {/* Resume profile card */}
      {result.resumeProfile && <ResumeProfile profile={result.resumeProfile} />}

      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 px-5 py-3.5 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
      >
        <Lightbulb size={16} className="text-purple-400 mt-0.5 shrink-0" />
        <p className="text-sm text-white/70 leading-relaxed">
          <span className="text-purple-300 font-semibold">AI Verdict: </span>
          {result.verdict}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center"
            style={
              tab === key
                ? { background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }
                : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
            }
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* ── Tab: Analysis ── */}
        {tab === "analysis" && (
          <motion.div key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-5">

              {/* Score + Match */}
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
                        initial={{ width: 0 }}
                        animate={{ width: `${result.skillsMatchPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 mt-3">
                    {result.skillsMatchPercent >= 70 ? "Strong alignment" : result.skillsMatchPercent >= 45 ? "Partial — gaps addressable" : "Significant gaps present"}
                  </p>
                </div>
              </motion.div>

              {/* Matched vs Missing keywords */}
              <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-2xl p-5">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">&#10003; Matched Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.matchedKeywords ?? []).slice(0, 8).map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>{kw}</span>
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

              {/* Strengths + Weaknesses */}
              <motion.div variants={stagger.item} className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle size={15} className="text-green-400" /><p className="text-xs font-medium text-white/40 uppercase tracking-widest">Strengths</p></div>
                  <ul className="space-y-2.5">{(result.strengths ?? []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="text-green-400 mt-0.5 shrink-0 text-xs">&#10003;</span>{s}</li>
                  ))}</ul>
                </div>
                <div className="card-glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><XCircle size={15} className="text-red-400" /><p className="text-xs font-medium text-white/40 uppercase tracking-widest">Weaknesses</p></div>
                  <ul className="space-y-2.5">{(result.weaknesses ?? []).map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70"><span className="text-red-400 mt-0.5 shrink-0 text-xs">&#10007;</span>{w}</li>
                  ))}</ul>
                </div>
              </motion.div>

              {/* Rewrite Suggestions */}
              <motion.div variants={stagger.item} className="card-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb size={15} className="text-purple-400" />
                  <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Rewrite Suggestions</p>
                </div>
                <div className="space-y-5">
                  {(result.rewriteSuggestions ?? []).map((s, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="px-3 py-2.5 rounded-lg" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.14)" }}>
                        <p className="text-sm text-white/35 line-through leading-relaxed">{s.original}</p>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                        <ArrowRight size={13} className="text-purple-400 shrink-0" />
                        <span className="text-xs text-white/30">{s.reason}</span>
                      </div>
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

        {/* ── Tab: Interview ── */}
        {tab === "interview" && (
          <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <InterviewPrep questions={result.interviewQuestions ?? []} />
          </motion.div>
        )}

        {/* ── Tab: Action Plan ── */}
        {tab === "action" && (
          <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
            <ActionPlan steps={result.actionPlan ?? []} />
          </motion.div>
        )}

        {/* ── Tab: Alternative Roles ── */}
        {tab === "alternatives" && (
          <motion.div key="alternatives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="space-y-4">
            <p className="text-sm text-white/40 mb-5">Based on your resume, these roles may be a stronger natural fit than the one you applied for.</p>
            {(result.alternativeRoles ?? []).map((role, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", color: "#c084fc" }}>
                  {role.matchPercent}%
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white/90 mb-1">{role.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{role.reason}</p>
                </div>
                <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden shrink-0">
                  <motion.div className="h-full bg-purple-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${role.matchPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
