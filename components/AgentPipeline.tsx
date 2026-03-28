"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

const AGENTS = [
  { id: 1, name: "Resume Extractor",       desc: "Parsing resume structure, skills & experience",        model: "llama-3.1-8b-instant",   duration: 2500 },
  { id: 2, name: "JD Analyzer",            desc: "Extracting job requirements & keywords",                model: "llama-3.1-8b-instant",   duration: 2500 },
  { id: 3, name: "Gap Analyzer",           desc: "Scoring ATS compatibility (parallel)",                  model: "llama-3.3-70b-versatile", duration: 4000 },
  { id: 6, name: "JD Bias Scanner",        desc: "Scanning for biased language (parallel)",               model: "llama-3.1-8b-instant",   duration: 4000 },
  { id: 7, name: "Integrity Checker",      desc: "Verifying resume authenticity (parallel)",              model: "llama-3.1-8b-instant",   duration: 4000 },
  { id: 4, name: "Career Coach",           desc: "Generating rewrites, interview prep & action plan",     model: "llama-3.3-70b-versatile", duration: 5500 },
  { id: 5, name: "Counterfactual Simulator", desc: "Computing what-if skill impact scenarios",            model: "llama-3.1-8b-instant",   duration: 3000 },
];

const DISPLAY_ORDER_WITH_DELAYS = [
  { idx: 0, startAt: 0 },
  { idx: 1, startAt: 2500 },
  { idx: 2, startAt: 5000 },
  { idx: 3, startAt: 5200 },
  { idx: 4, startAt: 5400 },
  { idx: 5, startAt: 9000 },
  { idx: 6, startAt: 14500 },
];

interface Props {
  isDark?: boolean;
}

export function AgentPipeline({ isDark = true }: Props) {
  const [doneAgents, setDoneAgents]   = useState<number[]>([]);
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

  // Theme helpers
  const t1      = isDark ? "#f0f4ff"                 : "#1A1D23";
  const t2      = isDark ? "rgba(240,244,255,0.85)"  : "rgba(26,29,35,0.78)";
  const t3      = isDark ? "rgba(240,244,255,0.58)"  : "rgba(26,29,35,0.55)";
  const accent  = isDark ? "#a855f7"                 : "#5C21A1";
  const surface = isDark ? "rgba(255,255,255,0.02)"  : "#FFFFFF";
  const borderBase = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 w-full max-w-lg mx-auto">

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: t2 }}>
          7-Agent AI Pipeline Running
        </p>
        <p className="text-xs" style={{ color: t3 }}>
          Specialised agents working in parallel for maximum accuracy
        </p>
      </motion.div>

      <div className="w-full space-y-2.5">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgents.includes(i);
          const isDone   = doneAgents.includes(i);
          const isParallel = i === 2 || i === 3 || i === 4;

          return (
            <motion.div key={agent.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300"
              style={{
                background: isActive
                  ? isDark ? "rgba(168,85,247,0.08)" : "rgba(92,33,161,0.07)"
                  : isDone
                    ? isDark ? "rgba(34,197,94,0.05)" : "rgba(26,107,60,0.06)"
                    : surface,
                border: isActive
                  ? isDark ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(92,33,161,0.25)"
                  : isDone
                    ? isDark ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(26,107,60,0.2)"
                    : `1px solid ${borderBase}`,
                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)"
              }}>

              {/* Status icon */}
              <div className="shrink-0">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <CheckCircle size={18} style={{ color: isDark ? "#4ade80" : "#16a34a" }} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-[18px] h-[18px] rounded-full"
                    style={{ border: isDark ? "2px solid rgba(168,85,247,0.3)" : "2px solid rgba(92,33,161,0.25)", borderTopColor: accent }} />
                ) : (
                  <Circle size={18} style={{ color: t3 }} />
                )}
              </div>

              {/* Agent info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold" style={{
                    color: isDone ? (isDark ? "#4ade80" : "#16a34a")
                         : isActive ? accent
                         : t3
                  }}>
                    Agent {agent.id}: {agent.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: t3
                    }}>
                    {agent.model}
                  </span>
                  {isParallel && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        background: isDark ? "rgba(99,102,241,0.12)" : "rgba(92,33,161,0.10)",
                        color: isDark ? "#818cf8" : "#5C21A1",
                        border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(92,33,161,0.22)"
                      }}>
                      parallel
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: isActive ? t2 : t3 }}>{agent.desc}</p>
              </div>

              {/* Running indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }} exit={{ opacity: 0 }}
                    className="text-xs font-medium shrink-0" style={{ color: accent }}>
                    Running...
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="text-xs text-center" style={{ color: t3 }}>
        Agents 3, 6 &amp; 7 run in parallel · Each passes enriched context to the next
      </motion.p>
    </div>
  );
}
