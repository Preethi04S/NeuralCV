"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

const AGENTS = [
  { id: 1, name: "Resume Extractor", desc: "Parsing resume structure, skills & experience", model: "llama-3.1-8b-instant", duration: 3000 },
  { id: 2, name: "JD Analyzer", desc: "Extracting job requirements & keywords", model: "llama-3.1-8b-instant", duration: 3000 },
  { id: 3, name: "Gap Analyzer", desc: "Scoring resume, computing ATS compatibility", model: "llama-3.3-70b-versatile", duration: 5000 },
  { id: 4, name: "Career Coach", desc: "Generating rewrites, interview prep & action plan", model: "llama-3.3-70b-versatile", duration: 6000 },
];

export function AgentPipeline() {
  const [activeAgent, setActiveAgent] = useState(0);
  const [completedAgents, setCompletedAgents] = useState<number[]>([]);

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    AGENTS.forEach((agent, i) => {
      // Start agent
      timers.push(setTimeout(() => setActiveAgent(i), elapsed));
      elapsed += agent.duration;
      // Complete agent
      timers.push(setTimeout(() => setCompletedAgents((prev) => [...prev, i]), elapsed - 400));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 w-full max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-1">
          AI Pipeline Running
        </p>
        <p className="text-xs text-white/30">4 specialized agents analyzing your resume</p>
      </motion.div>

      {/* Agent pipeline */}
      <div className="w-full space-y-3">
        {AGENTS.map((agent, i) => {
          const isActive = activeAgent === i && !completedAgents.includes(i);
          const isDone = completedAgents.includes(i);

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{
                background: isActive
                  ? "rgba(168,85,247,0.08)"
                  : isDone
                  ? "rgba(34,197,94,0.05)"
                  : "rgba(255,255,255,0.02)",
                border: isActive
                  ? "1px solid rgba(168,85,247,0.25)"
                  : isDone
                  ? "1px solid rgba(34,197,94,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <CheckCircle size={20} className="text-green-400" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 rounded-full"
                    style={{ border: "2px solid rgba(168,85,247,0.3)", borderTopColor: "#a855f7" }}
                  />
                ) : (
                  <Circle size={20} className="text-white/20" />
                )}
              </div>

              {/* Agent info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${isDone ? "text-green-400" : isActive ? "text-purple-300" : "text-white/30"}`}>
                    Agent {agent.id}: {agent.name}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                    {agent.model}
                  </span>
                </div>
                <p className={`text-xs ${isActive ? "text-white/50" : "text-white/25"}`}>{agent.desc}</p>
              </div>

              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-purple-400 font-medium shrink-0"
                  >
                    Running...
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Connection lines visual */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-white/25 text-center"
      >
        Each agent passes enriched context to the next
      </motion.p>
    </div>
  );
}
