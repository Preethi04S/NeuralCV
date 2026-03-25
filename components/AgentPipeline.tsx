"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

const AGENTS = [
  { id: 1, name: "Resume Extractor", desc: "Parsing resume structure, skills & experience", model: "llama-3.1-8b-instant", duration: 2500 },
  { id: 2, name: "JD Analyzer", desc: "Extracting job requirements & keywords", model: "llama-3.1-8b-instant", duration: 2500 },
  { id: 3, name: "Gap Analyzer", desc: "Scoring ATS compatibility (parallel)", model: "llama-3.3-70b-versatile", duration: 4000 },
  { id: 6, name: "JD Bias Scanner", desc: "Scanning for biased language (parallel)", model: "llama-3.1-8b-instant", duration: 4000 },
  { id: 7, name: "Integrity Checker", desc: "Verifying resume authenticity (parallel)", model: "llama-3.1-8b-instant", duration: 4000 },
  { id: 4, name: "Career Coach", desc: "Generating rewrites, interview prep & action plan", model: "llama-3.3-70b-versatile", duration: 5500 },
  { id: 5, name: "Counterfactual Simulator", desc: "Computing what-if skill impact scenarios", model: "llama-3.1-8b-instant", duration: 3000 },
];

// Visual order to show staggered start for parallel agents
const DISPLAY_ORDER_WITH_DELAYS = [
  { idx: 0, startAt: 0 },       // Agent 1
  { idx: 1, startAt: 2500 },    // Agent 2
  { idx: 2, startAt: 5000 },    // Agent 3 (parallel start)
  { idx: 3, startAt: 5200 },    // Agent 6 (parallel)
  { idx: 4, startAt: 5400 },    // Agent 7 (parallel)
  { idx: 5, startAt: 9000 },    // Agent 4
  { idx: 6, startAt: 14500 },   // Agent 5
];

export function AgentPipeline() {
  const [doneAgents, setDoneAgents] = useState<number[]>([]);
  const [activeAgents, setActiveAgents] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    DISPLAY_ORDER_WITH_DELAYS.forEach(({ idx, startAt }) => {
      timers.push(setTimeout(() => setActiveAgents(prev => [...prev, idx]), startAt));
      timers.push(setTimeout(() => {
        setActiveAgents(prev => prev.filter(i => i !== idx));
        setDoneAgents(prev => [...prev, idx]);
      }, startAt + AGENTS[idx].duration));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 w-full max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-1">7-Agent AI Pipeline Running</p>
        <p className="text-xs text-white/30">Specialized agents working in parallel for maximum accuracy</p>
      </motion.div>

      <div className="w-full space-y-2.5">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgents.includes(i);
          const isDone = doneAgents.includes(i);

          return (
            <motion.div key={agent.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300"
              style={{
                background: isActive ? "rgba(168,85,247,0.08)" : isDone ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
                border: isActive ? "1px solid rgba(168,85,247,0.25)" : isDone ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              <div className="shrink-0">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <CheckCircle size={18} className="text-green-400" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-[18px] h-[18px] rounded-full"
                    style={{ border: "2px solid rgba(168,85,247,0.3)", borderTopColor: "#a855f7" }} />
                ) : (
                  <Circle size={18} className="text-white/15" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`text-xs font-semibold ${isDone ? "text-green-400" : isActive ? "text-purple-300" : "text-white/25"}`}>
                    Agent {agent.id}: {agent.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}>
                    {agent.model}
                  </span>
                  {(i === 2 || i === 3 || i === 4) && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>parallel</span>
                  )}
                </div>
                <p className={`text-xs ${isActive ? "text-white/45" : "text-white/20"}`}>{agent.desc}</p>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }} exit={{ opacity: 0 }}
                    className="text-xs text-purple-400 font-medium shrink-0">
                    Running...
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="text-xs text-white/20 text-center">
        Agents 3, 6 &amp; 7 run in parallel · Each passes enriched context to the next
      </motion.p>
    </div>
  );
}
