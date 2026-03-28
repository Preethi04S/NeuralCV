"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Sparkles, Terminal, GitBranch, Zap, Shield, Brain,
  FileText, BarChart2, MessageSquare, BookOpen, Target,
  CheckCircle, ArrowRight, Upload, Clock, Star,
  Layers, Search, Award, Code2, Activity, CheckCircle2,
  AlertTriangle, PenLine, Mic2, CalendarDays, Shuffle,
  UserCircle, MessageCircle, Sun, Moon, TrendingUp, Lock,
  ChevronRight, LayoutDashboard, Home, Edit3
} from "lucide-react";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AgentPipeline } from "@/components/AgentPipeline";
import { FileUploadZone } from "@/components/FileUploadZone";
import { CareerChatbot } from "@/components/CareerChatbot";
import type { AnalysisResult, LiveJobsData, SkillCourse } from "@/types/analysis";
import { useTheme } from "@/hooks/useTheme";

const SAMPLE_RESUME = `John Smith
john@email.com | github.com/jsmith | linkedin.com/in/jsmith

EXPERIENCE
Software Engineer at Acme Corp (2022 to Present)
- Developed web applications using React and Node.js
- Worked on data processing scripts to handle user analytics
- Collaborated with cross-functional teams on product features
- Improved application performance by optimizing database queries

Junior Developer at Startup XYZ (2020 to 2022)
- Built REST APIs using Express.js
- Wrote unit tests and maintained code quality
- Participated in code reviews and agile ceremonies

SKILLS
JavaScript, TypeScript, React, Node.js, SQL, Git, AWS basics

EDUCATION
B.S. Computer Science, State University (2020)`;

const SAMPLE_JD = `Data Engineer at TechCorp

Requirements:
- 3+ years Python and data engineering
- ETL pipelines and data warehousing
- Apache Spark, dbt, Airflow
- AWS, GCP, or Azure
- SQL and NoSQL databases
- Kafka or event streaming (preferred)`;

const STATS = [
  { icon: Layers,   value: "7",    label: "AI Agents",      color: "#00d4aa", lightColor: "#037DD6" },
  { icon: Clock,    value: "<15s", label: "Analysis time",  color: "#6366f1", lightColor: "#5C21A1" },
  { icon: Award,    value: "10+",  label: "Output types",   color: "#f59e0b", lightColor: "#F6851B" },
  { icon: Shield,   value: "Zero", label: "Data stored",    color: "#22c55e", lightColor: "#1A6B3C" },
  { icon: Code2,    value: "Free", label: "Groq-powered",   color: "#00d4aa", lightColor: "#037DD6" },
  { icon: Star,     value: "A–F",  label: "Letter grading", color: "#a855f7", lightColor: "#5C21A1" },
];

const OUTPUTS: Array<{ icon: React.ElementType; label: string; color: string; lightColor: string }> = [
  { icon: Target,        label: "ATS Score /100",      color: "#00d4aa", lightColor: "#037DD6" },
  { icon: Award,         label: "Letter Grade A–F",    color: "#6366f1", lightColor: "#5C21A1" },
  { icon: Activity,      label: "6-axis Radar Chart",  color: "#00d4aa", lightColor: "#059669" },
  { icon: CheckCircle2,  label: "Matched Keywords",    color: "#22c55e", lightColor: "#059669" },
  { icon: AlertTriangle, label: "Missing Keywords",    color: "#ef4444", lightColor: "#D94F3D" },
  { icon: PenLine,       label: "Rewrite Suggestions", color: "#f59e0b", lightColor: "#d97706" },
  { icon: Mic2,          label: "6 Interview Qs",      color: "#6366f1", lightColor: "#5C21A1" },
  { icon: BookOpen,      label: "Course Links",        color: "#a855f7", lightColor: "#7C3AED" },
  { icon: CalendarDays,  label: "7-Day Action Plan",   color: "#00d4aa", lightColor: "#037DD6" },
  { icon: Shuffle,       label: "Alternative Roles",   color: "#f59e0b", lightColor: "#d97706" },
  { icon: UserCircle,    label: "Candidate Profile",   color: "#22c55e", lightColor: "#059669" },
  { icon: MessageCircle, label: "CareerAI Chatbot",    color: "#a855f7", lightColor: "#7C3AED" },
];

const STEPS = [
  { n: "01", icon: Upload,    title: "Upload or Paste",   desc: "Drop your PDF or DOCX resume. Paste the job description. Any format, any template accepted.",              color: "#00d4aa", lightColor: "#037DD6" },
  { n: "02", icon: Brain,     title: "7 Agents Fire",     desc: "Fast models extract structure. Smart 70B models score, gap-analyse, and generate coaching output.",          color: "#6366f1", lightColor: "#5C21A1" },
  { n: "03", icon: BarChart2, title: "Dashboard Unlocks", desc: "Full analytics dashboard with score, radar, keywords, rewrites, interview prep, courses, and action plan.",  color: "#a855f7", lightColor: "#7C3AED" },
];

const FEATURES = [
  { icon: Brain,         title: "7-Agent Pipeline",     desc: "Specialised agents: Extractor, Analyzer, Scorer, Coach, Simulator, Bias Scanner, Integrity Checker.",   color: "#00d4aa", lightColor: "#037DD6" },
  { icon: FileText,      title: "PDF & DOCX Upload",    desc: "Server-side text extraction. Drag-drop any resume template, ATS-friendly or not.",                       color: "#6366f1", lightColor: "#5C21A1" },
  { icon: BarChart2,     title: "ATS Score & Grade",    desc: "Exact score out of 100, A–F letter grade, animated 6-axis radar chart across key performance areas.",     color: "#f59e0b", lightColor: "#F6851B" },
  { icon: Search,        title: "Keyword Intelligence", desc: "Green and red keyword split with one-click rewrite suggestions targeting your specific skill gaps.",      color: "#22c55e", lightColor: "#1A6B3C" },
  { icon: MessageSquare, title: "Interview Prep",       desc: "6 targeted questions based on your gaps, why they ask it, and a specific tip to answer well.",            color: "#a855f7", lightColor: "#7C3AED" },
  { icon: BookOpen,      title: "Course Links",         desc: "Missing Python? We surface the exact free Coursera or freeCodeCamp course for each missing skill.",       color: "#00d4aa", lightColor: "#037DD6" },
  { icon: Target,        title: "Alternative Roles",    desc: "AI identifies 3 roles your resume fits better, with match percentage and career path reasoning.",         color: "#6366f1", lightColor: "#5C21A1" },
  { icon: Zap,           title: "7-Day Action Plan",    desc: "Prioritised improvement tasks ranked High, Medium, and Low impact. Start executing from day one.",        color: "#f59e0b", lightColor: "#F6851B" },
];

const CHECKS = [
  { icon: "📄", cat: "Format",             items: ["File format & size", "Resume length", "Long bullets with shorten tips"] },
  { icon: "✍️", cat: "Content",            items: ["ATS parse rate", "Repetition detection", "Spelling & grammar", "Quantifying impact"] },
  { icon: "💡", cat: "Skills",             items: ["Hard skills detection", "Soft skills analysis"] },
  { icon: "📋", cat: "Resume Sections",    items: ["Contact information", "Essential sections", "Personality showcase & tips"] },
  { icon: "🎨", cat: "Style",              items: ["Resume design", "Email address check", "Active voice usage", "Avoid buzzwords & clichés"] },
  { icon: "🚀", cat: "Impact & Tone",      items: ["Action verb strength", "Achievement quantification", "Confident tone analysis", "Passive voice detection"] },
];

const TECH = ["Next.js 14", "TypeScript", "Groq API", "llama-3.3-70b", "llama-3.1-8b", "Tailwind CSS", "Framer Motion", "pdf-parse", "mammoth.js"];

/* ── Resume Scanner Mockup ── */
function ResumeScannerMockup({ isDark }: { isDark: boolean }) {
  const [scanPos, setScanPos] = useState(0);
  const H = 148;
  const LINES = [
    { text: "Software Engineer · 5 yrs experience", gap: false },
    { text: "React · TypeScript · Node.js · SQL",   gap: false },
    { text: "Led team of 8 · AWS Infrastructure",   gap: false },
    { text: "Python · Docker · Kafka · Airflow",    gap: true  },
    { text: "Increased throughput by 40%",           gap: false },
    { text: "B.S. Computer Science · 2020",         gap: false },
  ];
  useEffect(() => {
    const start = Date.now(), cycle = 2600;
    let raf = 0;
    const tick = () => { setScanPos(((Date.now()-start) % cycle) / cycle * H); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const lh = H / LINES.length;
  return (
    <div style={{ width:260, borderRadius:16, overflow:"hidden",
      background: isDark ? "rgba(5,8,16,0.97)" : "rgba(255,255,255,0.97)",
      border:`1px solid ${isDark?"rgba(99,102,241,0.38)":"rgba(99,102,241,0.20)"}`,
      boxShadow: isDark ? "0 24px 70px rgba(0,0,0,0.72),0 0 0 1px rgba(99,102,241,0.15)" : "0 16px 50px rgba(0,0,0,0.13)" }}>
      {/* header */}
      <div style={{ padding:"7px 14px", borderBottom:`1px solid ${isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)"}`,
        background: isDark?"rgba(99,102,241,0.07)":"rgba(99,102,241,0.03)",
        display:"flex", alignItems:"center", gap:8 }}>
        <motion.div animate={{ scale:[1,1.4,1], opacity:[0.6,1,0.6] }} transition={{ duration:1.2, repeat:Infinity }}
          style={{ width:7,height:7,borderRadius:"50%",background:"#6366f1",flexShrink:0 }}/>
        <span style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em",
          color: isDark?"#a78bfa":"#5C21A1" }}>AI Scanning Resume</span>
      </div>
      {/* scan area */}
      <div style={{ position:"relative", overflow:"hidden", padding:"10px 14px", height:H }}>
        {/* beam */}
        <div style={{ position:"absolute", left:0, right:0, top:scanPos-1, height:2, zIndex:10, pointerEvents:"none",
          background:"linear-gradient(90deg,transparent,rgba(0,212,170,0.9) 20%,#00d4aa 50%,rgba(0,212,170,0.9) 80%,transparent)",
          boxShadow:"0 0 10px rgba(0,212,170,0.85),0 0 22px rgba(0,212,170,0.45),0 0 44px rgba(0,212,170,0.20)" }}/>
        {/* glow trail */}
        <div style={{ position:"absolute", left:0, right:0, top:Math.max(0,scanPos-16), height:18, zIndex:9, pointerEvents:"none",
          background:"linear-gradient(180deg,transparent,rgba(0,212,170,0.07) 60%,rgba(0,212,170,0.10))" }}/>
        {LINES.map((ln,i) => {
          const cy = i*lh + lh/2;
          const sc = scanPos > cy;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, height:lh-2, marginBottom:2 }}>
              <div style={{ width:3, flexShrink:0, height:"60%", borderRadius:99, transition:"background .18s",
                background: sc ? (ln.gap?"#ef4444":"#00d4aa") : isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.09)" }}/>
              <span style={{ fontSize:9.5, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                flex:1, transition:"color .18s",
                color: sc ? (ln.gap ? "#f87171" : isDark?"rgba(240,244,255,0.82)":"rgba(26,29,35,0.82)")
                           : isDark?"rgba(240,244,255,0.20)":"rgba(26,29,35,0.20)" }}>
                {ln.text}
              </span>
              {sc && ln.gap && (
                <span style={{ fontSize:8, fontWeight:900, padding:"1px 5px", borderRadius:4, flexShrink:0,
                  background:"rgba(239,68,68,0.14)", color:"#f87171", border:"1px solid rgba(239,68,68,0.30)" }}>GAP</span>
              )}
            </div>
          );
        })}
      </div>
      {/* footer */}
      <div style={{ padding:"6px 14px", display:"flex", justifyContent:"space-between",
        borderTop:`1px solid ${isDark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"}`,
        background: isDark?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.01)" }}>
        <span style={{ fontSize:9.5, fontWeight:700, color:"#00d4aa" }}>✓ 487 tokens</span>
        <span style={{ fontSize:9.5, fontWeight:700, color:"#f59e0b" }}>1 keyword gap</span>
      </div>
    </div>
  );
}

/* ── Live 7-Agent Status Row ── */
function LiveAgentsStatus({ isDark }: { isDark: boolean }) {
  const AGENTS = [
    { n:"Extr",  c:"#00d4aa", done:true  },
    { n:"Score", c:"#6366f1", done:true  },
    { n:"Analyz",c:"#a855f7", done:true  },
    { n:"Coach", c:"#f59e0b", done:false },
    { n:"Sim",   c:"#22c55e", done:false },
    { n:"Scan",  c:"#ef4444", done:false },
    { n:"Check", c:"#00d4aa", done:false },
  ];
  return (
    <div style={{ borderRadius:14, padding:"10px 14px",
      background: isDark?"rgba(6,10,18,0.95)":"rgba(255,255,255,0.97)",
      border:`1px solid ${isDark?"rgba(0,212,170,0.20)":"rgba(0,0,0,0.08)"}`,
      boxShadow: isDark?"0 12px 40px rgba(0,0,0,0.60)":"0 8px 28px rgba(0,0,0,0.10)",
      backdropFilter:"blur(20px)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ duration:1, repeat:Infinity }}
          style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e" }}/>
        <span style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em",
          color: isDark?"rgba(240,244,255,0.50)":"rgba(26,29,35,0.50)" }}>7 Agents Live</span>
        <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, color:"rgba(0,212,170,0.70)" }}>3 of 7 done</span>
      </div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
        {AGENTS.map((a,i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <motion.div
              animate={!a.done ? {
                scale:[1,1.35,1],
                boxShadow:[`0 0 0px ${a.c}00`,`0 0 12px ${a.c}90`,`0 0 0px ${a.c}00`]
              } : {}}
              transition={{ duration:1.1, repeat:Infinity, delay:i*0.18 }}
              style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:900,
                background: a.done ? `${a.c}22` : `${a.c}12`,
                border:`1.5px solid ${a.done ? a.c : `${a.c}55`}`,
                color: a.c }}>
              {a.done ? "✓" : "↻"}
            </motion.div>
            <span style={{ fontSize:7.5, fontWeight:600,
              color: isDark?"rgba(240,244,255,0.38)":"rgba(26,29,35,0.40)" }}>
              {a.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TiltCard({ children, className = "", style = {}, intensity = 10 }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rX = useSpring(useTransform(y, [-0.5, 0.5], [ intensity, -intensity]), { stiffness: 220, damping: 22 });
  const rY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity,  intensity]), { stiffness: 220, damping: 22 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ ...style, transformPerspective: 900, rotateX: rX, rotateY: rY, willChange: "transform" }}
      className={className}>{children}</motion.div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [resume, setResume]                 = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading]               = useState(false);
  const [result, setResult]                 = useState<AnalysisResult | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [liveJobsData, setLiveJobsData]     = useState<LiveJobsData | null>(null);
  const [jobsLoading, setJobsLoading]       = useState(false);
  const [skillCourses, setSkillCourses]     = useState<SkillCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();

  const t1       = isDark ? "#f0f4ff"                   : "#1A1D23";
  const t2       = isDark ? "rgba(240,244,255,0.85)"    : "rgba(26,29,35,0.75)";
  const t3       = isDark ? "rgba(240,244,255,0.58)"    : "rgba(26,29,35,0.55)";
  const accent   = isDark ? "#00d4aa"                   : "#037DD6";
  const borderCol   = isDark ? "rgba(0,212,170,0.22)"   : "rgba(0,0,0,0.09)";
  const footerBorder = isDark ? "rgba(0,212,170,0.15)"  : "rgba(0,0,0,0.07)";

  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX  = useMotionValue(0); const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 55, damping: 18 });
  const sy = useSpring(mouseY, { stiffness: 55, damping: 18 });
  const c1x = useTransform(sx, [-400, 400], [-18, 18]); const c1y = useTransform(sy, [-400, 400], [-12, 12]);
  const c2x = useTransform(sx, [-400, 400], [12, -12]); const c2y = useTransform(sy, [-400, 400], [10, -10]);
  const c3x = useTransform(sx, [-400, 400], [-8, 8]);   const c3y = useTransform(sy, [-400, 400], [14, -14]);
  const onHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const onHeroMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleAnalyze = useCallback(async () => {
    if (!resume.trim() || !jobDescription.trim()) { setError("Please provide both your resume and the job description."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res  = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume, jobDescription }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setJobsLoading(true);
      fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeSkills: data.resumeProfile?.topSkills ?? [], targetRole: "", alternativeRoles: (data.alternativeRoles ?? []).map((r: { title: string }) => r.title) }) })
        .then(r => r.json()).then(j => setLiveJobsData(j)).catch(() => {}).finally(() => setJobsLoading(false));
      setCoursesLoading(true);
      fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ missingSkills: data.missingKeywords ?? [], experienceLevel: data.resumeProfile?.experienceLevel ?? "mid" }) })
        .then(r => r.json()).then(c => setSkillCourses(c.skillCourses ?? [])).catch(() => {}).finally(() => setCoursesLoading(false));
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  }, [resume, jobDescription]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleAnalyze(); }, [handleAnalyze]);
  const loadSample = () => { setResume(SAMPLE_RESUME); setJobDescription(SAMPLE_JD); setResult(null); setError(null); };
  const reset      = () => { setResume(""); setJobDescription(""); setResult(null); setError(null); setLiveJobsData(null); setJobsLoading(false); setSkillCourses([]); setCoursesLoading(false); };
  const scrollToHero = () => { heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const loadSampleAndScroll = () => { loadSample(); setTimeout(() => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  const showDashboard = !!result && !loading;

  const ThemeToggle = () => (
    <button onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-0.5"
      style={{ background: isDark ? "linear-gradient(135deg,#0d1420,#1a2540)" : "linear-gradient(135deg,#e8f4fd,#dbeeff)", border: isDark ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(3,125,214,0.3)" }}>
      <motion.div animate={{ x: isDark ? 0 : 28 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: isDark ? "linear-gradient(135deg,#1e3a5f,#0d1420)" : "linear-gradient(135deg,#fff,#f0f7ff)" }}>
        {isDark ? <Moon size={12} style={{ color: "#00d4aa" }} /> : <Sun size={12} style={{ color: "#F6851B" }} />}
      </motion.div>
    </button>
  );

  return (
    <main className="min-h-screen w-full" onKeyDown={handleKeyDown}
      style={{ background: isDark ? "#060a12" : "#F2F4F6", transition: "background 0.3s ease" }}>
      <div className="glow-page-mid" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 3.5 }}
          style={{ background: isDark ? "radial-gradient(ellipse 70% 50% at 50% 10%,rgba(0,212,170,0.35) 0%,rgba(99,102,241,0.22) 40%,transparent 80%)" : "radial-gradient(ellipse 70% 50% at 50% 10%,rgba(3,125,214,0.28) 0%,rgba(92,33,161,0.18) 40%,transparent 70%)" }} />
      </div>

      <AnimatePresence mode="wait">
        {/* ── RESULTS DASHBOARD ── */}
        {showDashboard && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 w-full px-6 py-8">
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(0,212,170,0.15)" : "rgba(3,125,214,0.12)", border: isDark ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(3,125,214,0.25)" }}>
                  <Sparkles size={15} style={{ color: accent }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: t1 }}>Resume Intelligence Dashboard</h2>
                  <p className="text-sm" style={{ color: isDark ? "rgba(0,212,170,0.6)" : "rgba(3,125,214,0.7)" }}>
                    <span className="pulse-dot inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: accent }} />
                    7-agent AI pipeline · real-time analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <motion.button onClick={() => router.push('/editor')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2"
                  style={{ background: isDark ? "linear-gradient(135deg,#6366f1,#a855f7)" : "linear-gradient(135deg,#5C21A1,#7C3AED)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
                  <Edit3 size={14} /> Edit Resume
                </motion.button>
                <button onClick={reset} className="text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all"
                  style={{ color: t2, border: `1px solid ${borderCol}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)" }}>
                  <ArrowRight size={14} className="rotate-180" /> Analyse Another
                </button>
              </div>
            </div>
            <ResultsDashboard result={result!} skillCourses={skillCourses ?? []} coursesLoading={coursesLoading ?? false} isDark={isDark} resume={resume} jobDescription={jobDescription} />
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 max-w-xl mx-auto px-6 py-20">
            <AgentPipeline isDark={isDark} />
          </motion.div>
        )}

        {/* ── UPLOAD / LANDING SECTION ── */}
        {!result && !loading && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full">

            {/* NAVBAR */}
            <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="sticky top-0 z-50 w-full px-4 lg:px-8 py-4 flex items-center justify-between"
              style={{ background: isDark ? "rgba(6,10,18,0.90)" : "rgba(242,244,246,0.92)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${borderCol}` }}>
              <div className="flex items-center gap-2.5">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(0,212,170,0.15)" : "rgba(3,125,214,0.12)", border: `1px solid ${isDark ? "rgba(0,212,170,0.35)" : "rgba(3,125,214,0.28)"}` }}>
                    <Sparkles size={16} style={{ color: accent }} />
                  </div>
                  <span className="font-black text-xl tracking-tight" style={{ color: t1 }}>NeuralCV</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all hover:opacity-80" style={{ color: t2 }}>
                  <Home size={14} /> Home
                </button>
                <ThemeToggle />
                <motion.button onClick={() => router.push('/editor')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-xl text-sm font-black hidden sm:flex items-center gap-2"
                  style={{ background: isDark ? "rgba(99,102,241,0.15)" : "rgba(92,33,161,0.10)", color: isDark ? "#a78bfa" : "#5C21A1", border: isDark ? "1px solid rgba(99,102,241,0.30)" : "1px solid rgba(92,33,161,0.22)" }}>
                  <Edit3 size={13} /> Resume Builder
                </motion.button>
              </div>
            </motion.nav>

            {/* HERO */}
            <section ref={heroRef} onMouseMove={onHeroMouseMove} onMouseLeave={onHeroMouseLeave}
              className="relative w-full px-4 lg:px-8 pt-14 pb-20 min-h-[88vh] flex items-center">
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: isDark ? "radial-gradient(rgba(0,212,170,0.13) 1px, transparent 1px)" : "radial-gradient(rgba(3,125,214,0.10) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 75%)",
              }} />
              <div className="w-full grid lg:grid-cols-2 gap-6 xl:gap-8 items-center">
                <div>
                  <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-bold"
                    style={{ background: isDark ? "rgba(0,212,170,0.10)" : "rgba(3,125,214,0.08)", border: isDark ? "1px solid rgba(0,212,170,0.28)" : "1px solid rgba(3,125,214,0.22)", color: accent }}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse inline-block" />
                    AI RESUME CHECKER · FREE · NO SIGNUP
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
                    className="text-5xl lg:text-6xl xl:text-[4.5rem] 2xl:text-[5.25rem] font-black leading-[1.04] tracking-tight mb-6">
                    <span className="block whitespace-nowrap"><span style={{ color: t1 }}>Stop Getting </span><span className="text-gradient">Rejected.</span></span>
                    <span className="block whitespace-nowrap"><span style={{ color: t1 }}>Start Getting </span><span className="text-gradient">Selected.</span></span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    className="text-lg lg:text-xl font-medium leading-relaxed mb-8"
                    style={{ color: isDark ? "rgba(240,244,255,0.78)" : "rgba(26,29,35,0.72)" }}>
                    <strong style={{ color: t1 }}>7 AI agents</strong> analyse your resume in under 15 seconds — scoring ATS compatibility, keyword gaps, tone, and impact across 20+ checks.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="rounded-2xl p-3 mb-4" style={{ border: `2px dashed ${isDark ? "rgba(0,212,170,0.45)" : "rgba(3,125,214,0.28)"}`, background: isDark ? "rgba(0,212,170,0.04)" : "rgba(3,125,214,0.025)" }}>
                      <div className="grid md:grid-cols-2 gap-3" style={{ minHeight: 220 }}>
                        <FileUploadZone label="Your Resume" value={resume} onChange={setResume} placeholder="Paste resume text here, or switch to Upload to drop a PDF or DOCX..." isDark={isDark} />
                        <FileUploadZone label="Job Description" value={jobDescription} onChange={setJobDescription} placeholder="Paste the job description including role, requirements, and responsibilities..." isDark={isDark} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="text-base mb-3 font-medium" style={{ color: isDark ? "#f87171" : "#D94F3D" }}>{error}</motion.p>
                      )}
                    </AnimatePresence>
                    <div className="flex items-center gap-3 flex-wrap">
                      <motion.button onClick={handleAnalyze} disabled={!resume.trim() || !jobDescription.trim()}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className={`px-9 py-4 rounded-2xl font-black text-base flex items-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed btn-glow ${resume.trim() && jobDescription.trim() ? "btn-ready" : ""}`}
                        style={{ background: isDark ? "linear-gradient(135deg,#00d4aa,#6366f1)" : "linear-gradient(135deg,#037DD6,#5C21A1)", color: "#fff", boxShadow: isDark ? "0 0 40px rgba(0,212,170,0.28)" : "0 4px 24px rgba(3,125,214,0.38)" }}>
                        <Sparkles size={18} /> Analyse My Resume
                        <span className="text-xs font-normal ml-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Ctrl+Enter</span>
                      </motion.button>
                      <button onClick={loadSample} className="px-6 py-4 rounded-2xl text-base font-semibold transition-all"
                        style={{ color: t2, border: `1px solid ${borderCol}`, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)" }}>
                        Try with example
                      </button>
                    </div>
                    <p className="mt-4 text-sm flex items-center gap-1.5 font-medium" style={{ color: t3 }}>
                      <Shield size={13} style={{ color: accent }} /> Privacy guaranteed · No data stored · No account needed
                    </p>
                  </motion.div>
                </div>

                {/* Hero mockup — full right column with innovative effects */}
                <div className="hidden lg:flex items-center justify-center relative" style={{ minHeight: 560 }}>

                  {/* ── SVG Neural flow lines — hub-and-spoke from score card center ── */}
                  {/* viewBox 600×560 matches container dims; all paths origin from score-card centre (295,278) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 600 560" preserveAspectRatio="xMidYMid meet" style={{ zIndex:8 }}>
                    <defs>
                      {/* Score → ATS (teal→indigo) */}
                      <linearGradient id="fg1" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.15"/>
                        <stop offset="50%" stopColor="#00d4aa" stopOpacity="0.60"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15"/>
                      </linearGradient>
                      {/* Score → Scanner (purple→teal) */}
                      <linearGradient id="fg2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15"/>
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.55"/>
                        <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.15"/>
                      </linearGradient>
                      {/* Score → Agents (amber→indigo) */}
                      <linearGradient id="fg3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15"/>
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.50"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15"/>
                      </linearGradient>
                    </defs>

                    {/* Arc 1: Score centre (295,278) → ATS card centre (490,105)
                        Control point pulls the arc outward to the right */}
                    <motion.path d="M 295 270 Q 430 160 488 108"
                      fill="none" stroke="url(#fg1)" strokeWidth="1.5" strokeDasharray="5 5"
                      animate={{ strokeDashoffset:[0,-20] }}
                      transition={{ duration:1.8, repeat:Infinity, ease:"linear" }}/>

                    {/* Arc 2: Score centre (295,278) → Scanner card centre (138,447)
                        Control point pulls arc to the lower-left */}
                    <motion.path d="M 278 292 Q 185 365 140 442"
                      fill="none" stroke="url(#fg2)" strokeWidth="1.5" strokeDasharray="5 5"
                      animate={{ strokeDashoffset:[0,-20] }}
                      transition={{ duration:2.2, repeat:Infinity, ease:"linear", delay:0.5 }}/>

                    {/* Arc 3: Score centre (295,278) → Agents card centre (455,492)
                        Control point pulls arc to the lower-right */}
                    <motion.path d="M 308 292 Q 400 390 452 488"
                      fill="none" stroke="url(#fg3)" strokeWidth="1.5" strokeDasharray="5 5"
                      animate={{ strokeDashoffset:[0,-20] }}
                      transition={{ duration:2.5, repeat:Infinity, ease:"linear", delay:1.0 }}/>

                    {/* Hub dot — score card centre */}
                    <motion.circle cx="295" cy="278" r="4.5" fill="#00d4aa"
                      animate={{ opacity:[0.4,1,0.4], r:[3.5,5.5,3.5] }}
                      transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
                      style={{ filter:"drop-shadow(0 0 6px rgba(0,212,170,0.9))" }}/>

                    {/* Satellite dots */}
                    <motion.circle cx="488" cy="108" r="3.5" fill="#6366f1"
                      animate={{ opacity:[0.25,0.90,0.25], r:[2.5,4.5,2.5] }}
                      transition={{ duration:2, repeat:Infinity, ease:"easeInOut", delay:0.4 }}
                      style={{ filter:"drop-shadow(0 0 5px rgba(99,102,241,0.9))" }}/>
                    <motion.circle cx="140" cy="442" r="3.5" fill="#a855f7"
                      animate={{ opacity:[0.25,0.90,0.25], r:[2.5,4.5,2.5] }}
                      transition={{ duration:2, repeat:Infinity, ease:"easeInOut", delay:0.8 }}
                      style={{ filter:"drop-shadow(0 0 5px rgba(168,85,247,0.9))" }}/>
                    <motion.circle cx="452" cy="488" r="3.5" fill="#f59e0b"
                      animate={{ opacity:[0.25,0.90,0.25], r:[2.5,4.5,2.5] }}
                      transition={{ duration:2, repeat:Infinity, ease:"easeInOut", delay:1.2 }}
                      style={{ filter:"drop-shadow(0 0 5px rgba(245,158,11,0.9))" }}/>
                  </svg>

                  {/* ── CARD 1: NeuralCV Score (center, parallax) ── */}
                  <motion.div style={{ x: c1x, y: c1y, width: 330,
                    boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(0,212,170,0.35)" : "0 24px 80px rgba(0,0,0,0.18)",
                    background: isDark ? "#0d1420" : "#ffffff" }}
                    className="relative z-20 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.06)", background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb" }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,170,0.15)" }}><Sparkles size={12} style={{ color: "#00d4aa" }} /></div>
                      <span className="text-sm font-black" style={{ color: isDark ? "#f0f4ff" : "#1A1D23" }}>NeuralCV</span>
                      <div className="ml-auto flex gap-1.5">{["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}</div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-5">
                        <div className="relative flex-shrink-0">
                          <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" fill="none" stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"} strokeWidth="7" />
                            <motion.circle cx="40" cy="40" r="32" fill="none" stroke="#00d4aa" strokeWidth="7" strokeLinecap="round"
                              strokeDasharray={`${2*Math.PI*32}`} strokeDashoffset={`${2*Math.PI*32*(1-0.87)}`}
                              initial={{ strokeDashoffset:`${2*Math.PI*32}` }}
                              animate={{ strokeDashoffset:`${2*Math.PI*32*(1-0.87)}` }}
                              transition={{ duration:1.8, delay:0.6, ease:"easeOut" }}
                              transform="rotate(-90 40 40)" style={{ filter:"drop-shadow(0 0 6px rgba(0,212,170,0.7))" }} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-black" style={{ color:"#00d4aa" }}>87</span>
                            <span className="text-[9px] font-bold" style={{ color: isDark?"rgba(240,244,255,0.45)":"rgba(26,29,35,0.45)" }}>/100</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-black mb-0.5" style={{ color: isDark?"#f0f4ff":"#1A1D23" }}>Grade B+</p>
                          <div className="mt-2 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 text-xs font-bold" style={{ background:"rgba(0,212,170,0.12)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.25)" }}>
                            <TrendingUp size={10}/> +12 pts possible
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── CARD 2: ATS Parse Rate (top-right float) ── */}
                  <motion.div style={{ x: c2x, y: c2y }} className="absolute top-4 -right-2 z-30">
                    <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:4, repeat:Infinity }}
                      className="rounded-2xl p-4" style={{ width:200,
                        background: isDark?"rgba(13,20,32,0.95)":"rgba(255,255,255,0.98)",
                        boxShadow: isDark?"0 16px 48px rgba(0,0,0,0.6),0 0 0 1.5px rgba(99,102,241,0.40)":"0 12px 40px rgba(0,0,0,0.14)",
                        backdropFilter:"blur(16px)" }}>
                      <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: isDark?"rgba(240,244,255,0.55)":"rgba(26,29,35,0.55)" }}>ATS Parse Rate</p>
                      {[{label:"Content",w:"82%",color:"#00d4aa"},{label:"Format",w:"94%",color:"#6366f1"},{label:"Style",w:"71%",color:"#f59e0b"}].map(bar=>(
                        <div key={bar.label} className="mb-2.5">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: isDark?"rgba(240,244,255,0.65)":"rgba(26,29,35,0.65)" }}>{bar.label}</span>
                            <span className="text-xs font-black" style={{ color:bar.color }}>{bar.w}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.07)" }}>
                            <motion.div className="h-full rounded-full" style={{ background:bar.color }} initial={{ width:"0%" }} animate={{ width:bar.w }} transition={{ duration:1.2, delay:0.8 }}/>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* ── CARD 3: AI Resume Scanner (bottom-left) — UNIQUE scanning beam effect ── */}
                  <motion.div style={{ x: c3x, y: c3y }} className="absolute bottom-4 left-2 z-25">
                    <motion.div animate={{ y:[0,7,0] }} transition={{ duration:5.5, repeat:Infinity }}>
                      <ResumeScannerMockup isDark={isDark}/>
                    </motion.div>
                  </motion.div>

                  {/* ── CARD 4: Live 7-Agent Status (bottom-right) ── */}
                  <motion.div className="absolute bottom-4 right-0 z-25">
                    <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:4.8, repeat:Infinity, delay:1 }}>
                      <LiveAgentsStatus isDark={isDark}/>
                    </motion.div>
                  </motion.div>

                </div>
              </div>
            </section>

            {/* STATS */}
            <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="w-full px-4 lg:px-8 pb-20">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-5">
                {STATS.map(({ icon: Icon, value, label, color, lightColor }, i) => {
                  const c = isDark ? color : lightColor;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <TiltCard intensity={12} className="card-glow flex flex-col items-center gap-3 py-8 rounded-2xl"
                        style={{ background: isDark ? `${color}0d` : "#ffffff", border: `1.5px solid ${isDark ? `${color}45` : `${lightColor}28`}`, boxShadow: isDark ? `0 0 18px ${color}20` : "0 4px 16px rgba(0,0,0,0.07)" }}>
                        <Icon size={26} style={{ color: c }} />
                        <span className="text-3xl font-black" style={{ color: c }}>{value}</span>
                        <span className="text-sm font-semibold text-center px-2" style={{ color: isDark ? "rgba(240,244,255,0.60)" : "rgba(26,29,35,0.65)" }}>{label}</span>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* MARQUEE */}
            <div className="w-full overflow-hidden py-4 mb-8 border-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", background: isDark ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.7)" }}>
              <motion.div className="flex gap-12 whitespace-nowrap" animate={{ x: [0, "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
                {[...Array(2)].map((_, rep) => (
                  <div key={rep} className="flex gap-12 items-center shrink-0">
                    {["ATS Score out of 100","Letter Grade A–F","20+ Checks","7 AI Agents","PDF & DOCX Support","6-Axis Radar Chart","Interview Prep","Keyword Gap Analysis","7-Day Action Plan","Zero Data Stored"].map((item, i) => (
                      <span key={i} className="flex items-center gap-2.5 text-sm font-bold tracking-wide" style={{ color: isDark ? "rgba(240,244,255,0.45)" : "rgba(26,29,35,0.45)" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: i % 3 === 0 ? "#00d4aa" : i % 3 === 1 ? "#6366f1" : "#a855f7" }} />{item}
                      </span>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* WHAT YOU GET */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="w-full px-4 lg:px-8 pb-16">
              <div className="w-full rounded-3xl p-8 pb-10" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "1.5px solid rgba(0,212,170,0.22)" : "1.5px solid rgba(0,0,0,0.07)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(0,212,170,0.12)" : "rgba(0,212,170,0.08)" }}>
                      <CheckCircle size={16} style={{ color: accent }} />
                    </div>
                    <p className="text-xl font-black" style={{ color: t1 }}>What you get in every analysis</p>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full sm:ml-auto" style={{ background: isDark ? "rgba(0,212,170,0.10)" : "rgba(0,212,170,0.08)", color: accent, border: "1px solid rgba(0,212,170,0.22)" }}>12 outputs · instant</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {OUTPUTS.map(({ icon: Icon, label, color, lightColor }, i) => {
                    const c = isDark ? color : lightColor;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <TiltCard intensity={14} className="card-glow flex flex-col items-center gap-3 py-6 px-3 rounded-2xl text-center cursor-default h-full"
                          style={{ background: isDark ? `${color}0c` : "#ffffff", border: `1.5px solid ${isDark ? `${color}40` : `${lightColor}30`}`, boxShadow: isDark ? `0 0 22px ${color}18` : "0 4px 18px rgba(0,0,0,0.07)" }}>
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: isDark ? `${color}18` : `${lightColor}12`, border: `1.5px solid ${isDark ? `${color}35` : `${lightColor}28`}` }}>
                            <Icon size={20} style={{ color: c }} />
                          </div>
                          <span className="text-xs leading-snug font-bold" style={{ color: isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.82)" }}>{label}</span>
                        </TiltCard>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            {/* FEATURES */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="w-full px-4 lg:px-8 pb-16">
              <div className="text-center mb-10">
                <p className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: accent }}>Features</p>
                <h2 className="text-3xl lg:text-4xl font-black" style={{ color: t1 }}>Everything you need, nothing you don&apos;t</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {FEATURES.map(({ icon: Icon, title, desc, color, lightColor }, i) => {
                  const c = isDark ? color : lightColor;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <TiltCard intensity={13} className="card-glow p-7 rounded-3xl cursor-default h-full"
                        style={{ background: isDark ? `${color}07` : "#ffffff", border: isDark ? `1.5px solid ${color}44` : `1px solid ${lightColor}22`, boxShadow: isDark ? `0 0 22px ${color}15` : "0 4px 16px rgba(0,0,0,0.07)" }}>
                        <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-5 p-3" style={{ background: isDark ? `${color}14` : `${lightColor}12`, border: `1.5px solid ${c}30`, width: 52, height: 52 }}>
                          <Icon size={24} style={{ color: c }} />
                        </div>
                        <h3 className="text-base font-black mb-3" style={{ color: t1 }}>{title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(240,244,255,0.68)" : "rgba(26,29,35,0.62)" }}>{desc}</p>
                      </TiltCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* CTA */}
            <section className="w-full px-4 lg:px-8 pb-16">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                className="relative rounded-3xl overflow-hidden px-8 py-20 text-center"
                style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a0545 25%, #0d1b4b 55%, #0f2027 100%)" }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div animate={{ scale: [1,1.12,1], opacity: [0.55,0.75,0.55] }} transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.45) 0%, transparent 65%)", filter: "blur(60px)" }} />
                  <motion.div animate={{ scale: [1,1.08,1], opacity: [0.45,0.65,0.45] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                    className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.50) 0%, transparent 65%)", filter: "blur(70px)" }} />
                </div>
                <div className="relative z-10">
                  <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-4xl lg:text-6xl font-black mb-5 leading-tight" style={{ color: "#ffffff" }}>
                    Get your resume<br />
                    <span style={{ background: "linear-gradient(90deg, #a78bfa, #38bdf8, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>score in seconds</span>
                  </motion.h2>
                  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.button onClick={scrollToHero} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                      className="px-10 py-4 rounded-2xl font-black text-base flex items-center gap-2.5"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)", color: "#fff", boxShadow: "0 0 32px rgba(99,102,241,0.50)" }}>
                      <Upload size={18} /> Upload Your Resume
                    </motion.button>
                    <motion.button onClick={loadSampleAndScroll} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="px-8 py-4 rounded-2xl text-base font-semibold"
                      style={{ color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                      Try with example →
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            {/* FOOTER */}
            <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              className="w-full px-4 lg:px-8 pb-12 border-t" style={{ borderColor: footerBorder }}>
              <div className="flex items-center justify-center gap-2 mt-8 text-sm font-medium" style={{ color: t3 }}>
                <Sparkles size={12} style={{ color: isDark ? "rgba(0,212,170,0.5)" : "rgba(3,125,214,0.5)" }} />
                NeuralCV · Built for LovHack Season 2 · No data stored · Free forever
              </div>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>

      <CareerChatbot context={result ? {
        atsScore: result.atsScore, grade: result.grade,
        targetRole: result.resumeProfile?.summary?.split(" ").slice(0, 3).join(" "),
        name: result.resumeProfile?.name, topSkills: result.resumeProfile?.topSkills,
        missingKeywords: result.missingKeywords, strengths: result.strengths,
        weaknesses: result.weaknesses, experienceLevel: result.resumeProfile?.experienceLevel,
        experienceYears: result.resumeProfile?.experienceYears,
      } : undefined} />
    </main>
  );
}
