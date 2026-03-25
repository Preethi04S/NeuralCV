"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Terminal, GitBranch, Zap, Shield, Brain,
  FileText, BarChart2, MessageSquare, BookOpen, Target,
  CheckCircle, ArrowRight, Upload, Clock, Star,
  Layers, Search, Award, Code2
} from "lucide-react";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AgentPipeline } from "@/components/AgentPipeline";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CareerChatbot } from "@/components/CareerChatbot";
import type { AnalysisResult, LiveJobsData, SkillCourse } from "@/types/analysis";

// ── Sample data ───────────────────────────────────────────────────────
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
Requirements:
• 3+ years Python and data engineering
• ETL pipelines and data warehousing
• Apache Spark, dbt, Airflow
• AWS, GCP, or Azure
• SQL and NoSQL databases
• Kafka or event streaming (nice to have)`;

// ── Static content ────────────────────────────────────────────────────
const STATS = [
  { icon: Layers,   value: "4",    label: "AI Agents",       color: "#00d4aa" },
  { icon: Clock,    value: "<15s", label: "Analysis time",   color: "#6366f1" },
  { icon: Award,    value: "10+",  label: "Output types",    color: "#f59e0b" },
  { icon: Shield,   value: "Zero", label: "Data stored",     color: "#22c55e" },
  { icon: Code2,    value: "Free", label: "Groq-powered",    color: "#00d4aa" },
  { icon: Star,     value: "A–F",  label: "Letter grading",  color: "#a855f7" },
];

const OUTPUTS = [
  { icon: "🎯", label: "ATS Score /100",       color: "rgba(0,212,170,0.08)",  border: "rgba(0,212,170,0.2)"  },
  { icon: "🅰️", label: "Letter Grade A–F",     color: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
  { icon: "📊", label: "6-axis Radar Chart",   color: "rgba(0,212,170,0.08)",  border: "rgba(0,212,170,0.2)"  },
  { icon: "✅", label: "Matched Keywords",     color: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"  },
  { icon: "⚠️", label: "Missing Keywords",     color: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
  { icon: "✍️", label: "Rewrite Suggestions",  color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  { icon: "🎤", label: "6 Interview Qs",       color: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
  { icon: "📚", label: "Course Links",         color: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
  { icon: "🗓️", label: "7-Day Action Plan",    color: "rgba(0,212,170,0.08)",  border: "rgba(0,212,170,0.2)"  },
  { icon: "🔀", label: "Alternative Roles",    color: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  { icon: "👤", label: "Candidate Profile",    color: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)"  },
  { icon: "💬", label: "CareerAI Chatbot",     color: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)" },
];

const STEPS = [
  { n: "01", icon: Upload,    title: "Upload or Paste",   desc: "Drop your PDF or DOCX resume. Paste the job description. Any format, any template accepted.",     color: "#00d4aa" },
  { n: "02", icon: Brain,     title: "4 Agents Fire",     desc: "Fast models extract structure. Smart 70B models score, gap-analyse, and generate coaching output.", color: "#6366f1" },
  { n: "03", icon: BarChart2, title: "Dashboard Unlocks", desc: "Full analytics dashboard — score, radar, keywords, rewrites, interview prep, courses, action plan.", color: "#a855f7" },
];

const FEATURES = [
  { icon: Brain,        title: "4-Agent Pipeline",      desc: "Specialised agents: Extractor → Analyzer → Scorer → Coach. Each model chosen by task complexity.",   color: "#00d4aa" },
  { icon: FileText,     title: "PDF & DOCX Upload",     desc: "Server-side extraction. Drag-drop any resume template — ATS-friendly or not.",                       color: "#6366f1" },
  { icon: BarChart2,    title: "ATS Score + Grade",     desc: "Exact /100 score, A–F letter grade, animated 6-axis radar chart across key performance dimensions.",  color: "#f59e0b" },
  { icon: Search,       title: "Keyword Intelligence",  desc: "Green/red keyword split with one-click rewrite suggestions — directly targeting your skill gaps.",    color: "#22c55e" },
  { icon: MessageSquare,"title":"Interview Prep",        desc: "6 targeted questions based on your gaps — why they ask it, and a specific tip to answer well.",       color: "#a855f7" },
  { icon: BookOpen,     title: "Course Links",          desc: "Missing Python? We surface the exact free Coursera / freeCodeCamp / official docs course for it.",    color: "#00d4aa" },
  { icon: Target,       title: "Alternative Roles",     desc: "AI identifies 3 roles your resume already fits better — with match % and career reasoning.",          color: "#6366f1" },
  { icon: Zap,          title: "7-Day Action Plan",     desc: "Prioritised improvement tasks ranked High / Medium / Low impact. Start executing from day one.",      color: "#f59e0b" },
];

const TECH = ["Next.js 14","TypeScript","Groq API","llama-3.3-70b","llama-3.1-8b","Tailwind CSS","Framer Motion","pdf-parse","mammoth.js","npm CLI"];

// ── Component ──────────────────────────────────────────────────────────
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
    if (!resume.trim() || !jobDescription.trim()) { setError("Please provide both your resume and the job description."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res  = await fetch("/api/analyze", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resume, jobDescription }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setJobsLoading(true);
      fetch("/api/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ resumeSkills: data.resumeProfile?.topSkills ?? [], targetRole:"", alternativeRoles:(data.alternativeRoles??[]).map((r:{title:string})=>r.title) }) })
        .then(r=>r.json()).then(j=>setLiveJobsData(j)).catch(()=>{}).finally(()=>setJobsLoading(false));
      setCoursesLoading(true);
      fetch("/api/courses", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ missingSkills: data.missingKeywords??[], experienceLevel: data.resumeProfile?.experienceLevel??"mid" }) })
        .then(r=>r.json()).then(c=>setSkillCourses(c.skillCourses??[])).catch(()=>{}).finally(()=>setCoursesLoading(false));
    } catch(err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }, [resume, jobDescription]);

  const handleKeyDown = useCallback((e:React.KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&&e.key==="Enter") handleAnalyze(); },[handleAnalyze]);
  const loadSample    = () => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); setResult(null); setError(null); };
  const reset         = () => { setResume(""); setJobDescription(""); setResult(null); setError(null); setLiveJobsData(null); setJobsLoading(false); setSkillCourses([]); setCoursesLoading(false); };

  const showDashboard = !!result && !loading;

  return (
    <main className="min-h-screen w-full" onKeyDown={handleKeyDown}>

      {/* Full-width background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,170,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 opacity-10 rounded-full"
          style={{ background: "radial-gradient(ellipse, #6366f1, transparent 70%)", filter:"blur(80px)" }} />
        <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 opacity-10 rounded-full"
          style={{ background: "radial-gradient(ellipse, #00d4aa, transparent 70%)", filter:"blur(80px)" }} />
      </div>

      <AnimatePresence mode="wait">

        {/* ══════ DASHBOARD ══════ */}
        {showDashboard && (
          <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="relative z-10 w-full max-w-screen-xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(0,212,170,0.15)", border:"1px solid rgba(0,212,170,0.3)" }}>
                  <Sparkles size={15} style={{color:"#00d4aa"}} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Resume Intelligence Dashboard</h2>
                  <p className="text-xs" style={{color:"rgba(0,212,170,0.6)"}}>4-agent AI pipeline · real-time analysis</p>
                </div>
              </div>
              <button onClick={reset}
                className="text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:border-white/20"
                style={{color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.1)"}}>
                <ArrowRight size={13} className="rotate-180" /> Analyze Another
              </button>
            </div>
            <ResultsDashboard result={result!} skillCourses={skillCourses??[]} coursesLoading={coursesLoading??false} />
          </motion.div>
        )}

        {/* ══════ LOADING ══════ */}
        {loading && (
          <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="relative z-10 max-w-xl mx-auto px-6 py-20">
            <AgentPipeline />
          </motion.div>
        )}

        {/* ══════ LANDING ══════ */}
        {!result && !loading && (
          <motion.div key="landing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,y:-20}}
            className="relative z-10 w-full">

            {/* ── HERO ─────────────────────────────────────────────── */}
            <div className="w-full px-6 pt-10 pb-8 text-center">
              <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
                style={{background:"rgba(0,212,170,0.1)", border:"1px solid rgba(0,212,170,0.25)", color:"#00d4aa"}}>
                <Sparkles size={11} /> 4-Agent AI Pipeline · PDF & DOCX · Free · No signup
              </motion.div>
              <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-tight">
                <span className="text-white">Know Your Score</span><br />
                <span className="text-gradient">Before They Do</span>
              </motion.h1>
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
                className="text-lg max-w-2xl mx-auto" style={{color:"rgba(255,255,255,0.5)"}}>
                Paste or upload your resume. Four specialised AI agents analyse, score, compare, and coach — in under 15 seconds.
              </motion.p>
            </div>

            {/* ── STATS BAR — full width ───────────────────────────── */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
              className="w-full px-6 mb-6">
              <div className="grid grid-cols-6 gap-3 w-full">
                {STATS.map(({icon:Icon,value,label,color},i)=>(
                  <div key={i} className="flex flex-col items-center gap-2 py-4 rounded-2xl"
                    style={{background:"rgba(255,255,255,0.03)", border:`1px solid ${color}22`}}>
                    <Icon size={16} style={{color}} />
                    <span className="text-lg font-black" style={{color}}>{value}</span>
                    <span className="text-xs text-center" style={{color:"rgba(255,255,255,0.35)"}}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── INPUT AREA — full width ──────────────────────────── */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
              className="w-full px-6 mb-4">
              <div className="grid md:grid-cols-2 gap-4 w-full" style={{minHeight:"260px"}}>
                <FileUploadZone label="Your Resume" value={resume} onChange={setResume}
                  placeholder="Paste your resume text here — or switch to Upload to drop a PDF/DOCX..." />
                <FileUploadZone label="Job Description" value={jobDescription} onChange={setJobDescription}
                  placeholder="Paste the job description here — role, requirements, responsibilities..." />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  className="text-red-400 text-sm text-center mb-3 px-6">{error}</motion.p>
              )}
            </AnimatePresence>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}
              className="flex items-center justify-center gap-3 mb-8 px-6">
              <motion.button onClick={handleAnalyze} disabled={!resume.trim()||!jobDescription.trim()}
                whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                className="px-10 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-base"
                style={{background:"linear-gradient(135deg, #00d4aa, #6366f1)", boxShadow:"0 0 40px rgba(0,212,170,0.25)"}}>
                <Sparkles size={17}/> Run AI Pipeline
                <span className="text-white/40 text-xs ml-1">⌘↵</span>
              </motion.button>
              <button onClick={loadSample}
                className="px-6 py-3.5 rounded-xl text-sm font-medium transition-colors hover:border-white/20"
                style={{color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.1)"}}>
                Try with example
              </button>
            </motion.div>

            {/* ── WHAT YOU GET — full width ────────────────────────── */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="w-full px-6 mb-6">
              <div className="w-full rounded-2xl p-6"
                style={{background:"rgba(0,212,170,0.03)", border:"1px solid rgba(0,212,170,0.12)"}}>
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle size={14} style={{color:"#00d4aa"}}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{color:"rgba(0,212,170,0.7)"}}>
                    What you get in every analysis
                  </p>
                </div>
                <div className="grid grid-cols-6 lg:grid-cols-12 gap-3">
                  {OUTPUTS.map(({icon,label,color,border},i)=>(
                    <motion.div key={i} initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{delay:0.4+i*0.04}}
                      className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl text-center"
                      style={{background:color, border:`1px solid ${border}`}}>
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs leading-tight" style={{color:"rgba(255,255,255,0.6)"}}>{label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── HOW IT WORKS — full width ────────────────────────── */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
              className="w-full px-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-5"
                style={{color:"rgba(255,255,255,0.25)"}}>How it works</p>
              <div className="grid md:grid-cols-3 gap-4 w-full">
                {STEPS.map(({n,icon:Icon,title,desc,color},i)=>(
                  <div key={i} className="relative p-5 rounded-2xl"
                    style={{background:"rgba(255,255,255,0.03)", border:`1px solid ${color}22`}}>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{background:`${color}15`, border:`1px solid ${color}30`}}>
                        <Icon size={19} style={{color}}/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black font-mono" style={{color:`${color}80`}}>{n}</span>
                          <h3 className="text-sm font-bold text-white">{title}</h3>
                        </div>
                        <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.45)"}}>{desc}</p>
                      </div>
                    </div>
                    {i<STEPS.length-1&&(
                      <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight size={15} style={{color:"rgba(255,255,255,0.2)"}}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── FEATURES GRID — full width ───────────────────────── */}
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
              className="w-full px-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-5"
                style={{color:"rgba(255,255,255,0.25)"}}>Every feature, explained</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                {FEATURES.map(({icon:Icon,title,desc,color},i)=>(
                  <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.05}}
                    className="p-5 rounded-2xl group transition-all duration-200 cursor-default"
                    style={{background:"rgba(255,255,255,0.02)", border:`1px solid ${color}18`}}
                    whileHover={{borderColor:`${color}44`, background:"rgba(255,255,255,0.04)"}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{background:`${color}12`, border:`1px solid ${color}28`}}>
                      <Icon size={16} style={{color}}/>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                    <p className="text-xs leading-relaxed" style={{color:"rgba(255,255,255,0.4)"}}>{desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── TECH STACK + FOOTER — full width ─────────────────── */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
              className="w-full px-6 pb-10 border-t mt-4" style={{borderColor:"rgba(255,255,255,0.05)"}}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8">
                <div className="w-full md:w-auto">
                  <p className="text-xs uppercase tracking-widest mb-3" style={{color:"rgba(255,255,255,0.2)"}}>Built with</p>
                  <div className="flex flex-wrap gap-2">
                    {TECH.map((t,i)=>(
                      <span key={i} className="text-xs px-3 py-1.5 rounded-lg font-mono"
                        style={{background:"rgba(0,212,170,0.05)", border:"1px solid rgba(0,212,170,0.15)", color:"rgba(0,212,170,0.7)"}}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs shrink-0" style={{color:"rgba(255,255,255,0.3)"}}>
                  <a href="https://www.npmjs.com/package/neuralcv" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
                    <Terminal size={12}/>npm install -g neuralcv
                  </a>
                  <a href="https://github.com/yourusername/neuralcv" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
                    <GitBranch size={12}/>GitHub
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{color:"rgba(255,255,255,0.18)"}}>
                <Sparkles size={10} style={{color:"rgba(0,212,170,0.5)"}}/>
                NeuralCV — Built for LovHack Season 2 · No data stored · Free forever
              </div>
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* Career chatbot — always floating */}
      <CareerChatbot context={result ? {
        atsScore: result.atsScore, grade: result.grade,
        targetRole: result.resumeProfile?.summary?.split(" ").slice(0,3).join(" "),
        name: result.resumeProfile?.name,
        topSkills: result.resumeProfile?.topSkills,
        missingKeywords: result.missingKeywords,
        strengths: result.strengths, weaknesses: result.weaknesses,
        experienceLevel: result.resumeProfile?.experienceLevel,
        experienceYears: result.resumeProfile?.experienceYears,
      } : undefined} />

    </main>
  );
}
