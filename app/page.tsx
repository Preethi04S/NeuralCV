"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, GitBranch, ArrowDown } from "lucide-react";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AgentPipeline } from "@/components/AgentPipeline";
import { FileUploadZone } from "@/components/FileUploadZone";
import type { AnalysisResult, LiveJobsData } from "@/types/analysis";

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
• Knowledge of data modeling and pipeline optimization

Nice to have:
• Experience with Kafka or event streaming
• Machine learning pipeline experience`;

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveJobsData, setLiveJobsData] = useState<LiveJobsData | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      // Fetch live jobs in background (non-blocking)
      setJobsLoading(true);
      fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeSkills: data.resumeProfile?.topSkills ?? [],
          targetRole: data.resumeProfile?.roles?.[0] ?? "",
          alternativeRoles: (data.alternativeRoles ?? []).map((r: { title: string }) => r.title),
        }),
      })
        .then(r => r.json())
        .then(jobs => setLiveJobsData(jobs))
        .catch(() => {})
        .finally(() => setJobsLoading(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [resume, jobDescription]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAnalyze(); },
    [handleAnalyze]
  );

  const loadSample = () => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); setResult(null); setError(null); };
  const reset = () => { setResume(""); setJobDescription(""); setResult(null); setError(null); setLiveJobsData(null); setJobsLoading(false); };

  return (
    <main className="min-h-screen" onKeyDown={handleKeyDown}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-15 rounded-full"
          style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(ellipse, #a855f7 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium text-purple-300"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)" }}>
            <Sparkles size={12} />
            4-Agent AI Pipeline · PDF &amp; DOCX Support
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-white">Know Your Score</span><br />
            <span className="text-gradient">Before They Do</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-8">
            Upload your resume (PDF/DOCX) or paste it. Our 4-agent AI pipeline gives you ATS score, skills gap, rewrite suggestions, interview prep, and a personalised action plan.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-white/30">
            <span>&#9889; 4 specialised AI agents</span>
            <span>&#128196; PDF &amp; DOCX upload</span>
            <span>&#128274; No data stored</span>
          </div>
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="inputs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-72">
                <FileUploadZone label="Your Resume" value={resume} onChange={setResume} placeholder="Paste your resume text here..." />
                <FileUploadZone label="Job Description" value={jobDescription} onChange={setJobDescription} placeholder="Paste the job description here..." />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-sm text-center mb-4">{error}</motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <motion.button onClick={handleAnalyze} disabled={!resume.trim() || !jobDescription.trim()}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}>
                  <Sparkles size={16} />
                  Run AI Pipeline
                  <span className="text-white/50 text-xs ml-1">&#8984;&#8629;</span>
                </motion.button>
                <button onClick={loadSample} className="px-6 py-3.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  Try with example
                </button>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AgentPipeline />
            </motion.div>
          )}

          {result && !loading && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ArrowDown size={16} className="text-purple-400" />
                  <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">Pipeline Complete</h2>
                </div>
                <button onClick={reset} className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  Analyze Another
                </button>
              </div>
              <ResultsDashboard result={result} liveJobsData={liveJobsData} jobsLoading={jobsLoading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-400/50" />
            <span>NeuralCV — Built for LovHack Season 2</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.npmjs.com/package/neuralcv" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white/50 transition-colors">
              <Terminal size={12} />npm install -g neuralcv
            </a>
            <a href="https://github.com/yourusername/neuralcv" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white/50 transition-colors">
              <GitBranch size={12} />GitHub
            </a>
          </div>
        </motion.footer>
      </div>
    </main>
  );
}
