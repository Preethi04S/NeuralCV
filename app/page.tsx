"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Terminal, GitBranch, Zap, Shield, Brain,
  FileText, BarChart2, MessageSquare, BookOpen, Target,
  CheckCircle, ArrowRight, Upload, Clock, Users, Star,
  TrendingUp, Code2, Layers, Search, Award
} from "lucide-react";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AgentPipeline } from "@/components/AgentPipeline";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CareerChatbot } from "@/components/CareerChatbot";
import type { AnalysisResult, LiveJobsData, SkillCourse } from "@/types/analysis";

// ─── Sample data ────────────────────────────────────────────────────
const SAMPLE_RESUME = `John Smith
john@email.com | github.com/jsmith | linkedin.com/in/jsmith

EXPERIENCE
Software Engineer — Acme Corp (2022–Present)
• Developed web applications using React and Node.js
• Worked on data processing scripts to handle user analytics
• Collaborated with cross-functional teams on product features
• Improved application performance by optimizing database queries

Junior Developer — Startup XYZ (2020–2022)
• Built REST APIs using Express.js
• Wrote unit tests and maintained code quality
• Participated in code reviews and agile ceremonies

SKILLS
JavaScript, TypeScript, React, Node.js, SQL, Git, AWS basics

EDUCATION
B.S. Computer Science — State University (2020)`;

const SAMPLE_JD = `Data Engineer — TechCorp

We're looking for a skilled Data Engineer to build and maintain our data infrastructure.

Requirements:
• 3+ years experience with Python and data engineering
• Strong knowledge of ETL pipelines and data warehousing
• Experience with Apache Spark, dbt, or similar tools
• Proficiency with cloud platforms (AWS, GCP, or Azure)
• Experience with SQL and NoSQL databases
• Familiarity with Airflow or similar orchestration tools

Nice to have:
• Experience with Kafka or event streaming
• Machine learning pipeline experience`;

// ─── Static content ──────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain,        title: "4-Agent AI Pipeline",     desc: "Resume Extractor → JD Analyzer → Gap Scorer → Career Coach — each agent specialised for its task." },
  { icon: FileText,     title: "PDF & DOCX Upload",        desc: "Drag-drop any resume format. Text is extracted server-side — no copy-pasting needed." },
  { icon: BarChart2,    title: "ATS Score & Grade",        desc: "Letter grade A–F with exact ATS score and animated radar chart across 6 performance dimensions." },
  { icon: Search,       title: "Keyword Intelligence",     desc: "Side-by-side matched vs missing keywords with one-click rewrite suggestions for each gap." },
  { icon: MessageSquare,"title": "Interview Prep",          desc: "6 targeted questions based on your skill gaps — with why they'll ask it and how to answer." },
  { icon: BookOpen,     title: "Course Recommendations",   desc: "Missing Python? We link to the exact free Coursera / freeCodeCamp course. No generic advice." },
  { icon: Target,       title: "Alternative Roles",        desc: "AI finds 3 roles your resume fits better — with match % and reasoning." },
  { icon: Zap,          title: "7-Day Action Plan",        desc: "Prioritised improvement tasks ranked by impact — High, Medium, Low — ready to execute." },
];

const STEPS = [
  { n: "01", icon: Upload,    title: "Upload or Paste",    desc: "Drop your PDF/DOCX resume and paste the job description. Supports any template or format." },
  { n: "02", icon: Brain,     title: "4 Agents Analyse",   desc: "Fast agents extract structure. Smart agents score compatibility and generate coaching output." },
  { n: "03", icon: BarChart2, title: "Get Your Dashboard", desc: "Full analytics dashboard — score, radar, keywords, rewrites, interview prep, courses, action plan." },
];

const STATS = [
  { icon: Layers,   value: "4",    label: "AI Agents" },
  { icon: Clock,    value: "<15s", label: "Analysis time" },
  { icon: Award,    value: "10+",  label: "Output dimensions" },
  { icon: Shield,   value: "0",    label: "Data stored" },
  { icon: Code2,    value: "Free", label: "Groq-powered" },
  { icon: Star,     value: "A–F",  label: "Letter grading" },
];

const TECH = [
  "Next.js 14", "TypeScript", "Groq API", "llama-3.3-70b", "llama-3.1-8b",
  "Framer Motion", "Tailwind CSS", "pdf-parse", "mammoth.js", "npm CLI",
];

const OUTPUTS = [
  { icon: "🎯", label: "ATS Score /100" },
  { icon: "🅰️", label: "Letter Grade A–F" },
  { icon: "📊", label: "6-axis Radar Chart" },
  { icon: "🔑", label: "Matched Keywords" },
  { icon: "⚠️", label: "Missing Keywords" },
  { icon: "✍️", label: "Rewrite Suggestions" },
  { icon: "🎤", label: "6 Interview Questions" },
  { icon: "📚", label: "Course Links" },
  { icon: "🗓️", label: "7-Day Action Plan" },
  { icon: "🔀", label: "Alternative Roles" },
  { icon: "👤", label: "Candidate Profile" },
  { icon: "💬", label: "CareerAI Chatbot" },
];

// ─── Component ───────────────────────────────────────────────────────
export default function Home() {
  const [resume, setResume]                 = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState<AnalysisResult | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [liveJobsData, setLiveJobsData]     = useState<LiveJobsData | null>(null);
  const [jobsLoading, setJobsLoading]       = useState(false);
  const [skillCourses, setSkillCourses]     = useState<SkillCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const res  = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume, jobDescription }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      // Background: live jobs
      setJobsLoading(true);
      fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeSkills: data.resumeProfile?.topSkills ?? [], targetRole: "", alternativeRoles: (data.alternativeRoles ?? []).map((r: { title: string }) => r.title) }) })
        .then(r => r.json()).then(jobs => setLiveJobsData(jobs)).catch(() => {}).finally(() => setJobsLoading(false));
      // Background: courses
      setCoursesLoading(true);
      fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ missingSkills: data.missingKeywords ?? [], experienceLevel: data.resumeProfile?.experienceLevel ?? "mid" }) })
        .then(r => r.json()).then(c => setSkillCourses(c.skillCourses ?? [])).catch(() => {}).finally(() => setCoursesLoading(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [resume, jobDescription]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAnalyze(); }, [handleAnalyze]);
  const loadSample    = () => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); setResult(null); setError(null); };
  const reset         = () => { setResume(""); setJobDescription(""); setResult(null); setError(null); setLiveJobsData(null); setJobsLoading(false); setSkillCourses([]); setCoursesLoading(false); };

  const showDashboard = !!result && !loading;

  return (
    <main className="min-h-screen" onKeyDown={handleKeyDown}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-15 rounded-full"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(ellipse, #a855f7 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className={`relative z-10 mx-auto px-6 py-8 transition-all duration-500 ${showDashboard ? "max-w-screen-xl" : "max-w-6xl"}`}>

        {/* ══ DASHBOARD VIEW ══ */}
        <AnimatePresence mode="wait">
          {showDashboard && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)" }}>
                    <Sparkles size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Resume Intelligence Dashboard</h2>
                    <p className="text-xs text-white/40">Powered by 4-agent AI pipeline</p>
                  </div>
                </div>
                <button onClick={reset} className="text-sm text-white/40 hover:text-white/70 transition-colors px-4 py-2 rounded-xl flex items-center gap-2"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <ArrowRight size={13} className="rotate-180" /> Analyze Another
                </button>
              </div>
              <ResultsDashboard result={result!} skillCourses={skillCourses ?? []} coursesLoading={coursesLoading ?? false} />
            </motion.div>
          )}

          {/* ══ LOADING VIEW ══ */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="max-w-xl mx-auto">
              <AgentPipeline />
            </motion.div>
          )}

          {/* ══ LANDING + INPUT VIEW ══ */}
          {!result && !loading && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>

              {/* ── HERO ── */}
              <div className="text-center mb-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-medium text-purple-300"
                  style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}>
                  <Sparkles size={11} />
                  4-Agent AI Pipeline · PDF & DOCX · Free · No signup
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                  <span className="text-white">Know Your Score</span><br />
                  <span className="text-gradient">Before They Do</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-base text-white/50 max-w-2xl mx-auto">
                  Paste or upload your resume against any job description. Four specialised AI agents analyse, score, compare, and coach — in under 15 seconds.
                </motion.p>
              </div>

              {/* ── STATS BAR ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="grid grid-cols-6 gap-3 mb-8">
                {STATS.map(({ icon: Icon, value, label }, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Icon size={15} className="text-purple-400" />
                    <span className="text-sm font-bold text-white">{value}</span>
                    <span className="text-xs text-white/35 text-center leading-tight">{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* ── INPUT AREA ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="grid md:grid-cols-2 gap-4 mb-4" style={{ minHeight: "280px" }}>
                  <FileUploadZone label="Your Resume" value={resume} onChange={setResume} placeholder="Paste your resume text here — or switch to Upload to drop a PDF/DOCX..." />
                  <FileUploadZone label="Job Description" value={jobDescription} onChange={setJobDescription} placeholder="Paste the job description here — role, requirements, responsibilities..." />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-sm text-center mb-3">{error}</motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                  <motion.button onClick={handleAnalyze} disabled={!resume.trim() || !jobDescription.trim()}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}>
                    <Sparkles size={16} /> Run AI Pipeline
                    <span className="text-white/40 text-xs ml-1">⌘↵</span>
                  </motion.button>
                  <button onClick={loadSample}
                    className="px-6 py-3.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    Try with example
                  </button>
                </div>
              </motion.div>

              {/* ── WHAT YOU GET ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="mb-10 rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={14} className="text-green-400" />
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">What you get in every analysis</p>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                  {OUTPUTS.map(({ icon, label }, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.04 }}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center"
                      style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}>
                      <span className="text-lg">{icon}</span>
                      <span className="text-xs text-white/50 leading-tight">{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── HOW IT WORKS ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest text-center mb-5">How it works</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
                    <div key={i} className="relative p-5 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                          <Icon size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-purple-400/60 font-mono">{n}</span>
                            <h3 className="text-sm font-semibold text-white">{title}</h3>
                          </div>
                          <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                          <ArrowRight size={16} className="text-white/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ── FEATURES GRID ── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-10">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-widest text-center mb-5">Every feature, explained</p>
                <div className="grid md:grid-cols-4 gap-3">
                  {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                      className="p-4 rounded-2xl group hover:border-purple-500/30 transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.18)" }}>
                        <Icon size={15} className="text-purple-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white/90 mb-1.5">{title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── TECH STACK + FOOTER ── */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                className="border-t border-white/5 pt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <p className="text-xs text-white/25 uppercase tracking-widest mb-3">Built with</p>
                    <div className="flex flex-wrap gap-2">
                      {TECH.map((t, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg text-white/40 font-mono"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-white/25 shrink-0">
                    <a href="https://www.npmjs.com/package/neuralcv" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white/50 transition-colors">
                      <Terminal size={12} />npm install -g neuralcv
                    </a>
                    <a href="https://github.com/yourusername/neuralcv" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-white/50 transition-colors">
                      <GitBranch size={12} />GitHub
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-white/20">
                  <Sparkles size={10} className="text-purple-400/40" />
                  <span>NeuralCV — Built for LovHack Season 2 · No data stored · Free forever</span>
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Career chatbot — always floating */}
        <CareerChatbot context={result ? {
          atsScore: result.atsScore,
          grade: result.grade,
          targetRole: result.resumeProfile?.summary?.split(" ").slice(0, 3).join(" "),
          name: result.resumeProfile?.name,
          topSkills: result.resumeProfile?.topSkills,
          missingKeywords: result.missingKeywords,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          experienceLevel: result.resumeProfile?.experienceLevel,
          experienceYears: result.resumeProfile?.experienceYears,
        } : undefined} />

      </div>
    </main>
  );
}
