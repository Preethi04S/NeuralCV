"use client";
import { motion } from "framer-motion";
import { Cpu, CheckCircle, Shield, Download } from "lucide-react";
import type { AgentPassportEntry } from "@/types/analysis";

interface Props {
  passport: AgentPassportEntry[];
  overallConfidence: number;
  analysisTimestamp?: string;
}

const agentColors = ["#a855f7", "#6366f1", "#22c55e", "#f59e0b", "#10b981", "#f472b6", "#60a5fa"];

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? "#22c55e" : value >= 70 ? "#f59e0b" : "#f97316";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
      <span className="text-xs tabular-nums font-medium" style={{ color }}>{value}%</span>
    </div>
  );
}

export function AIPassport({ passport, overallConfidence, analysisTimestamp }: Props) {
  const handleDownload = () => {
    const data = {
      title: "NeuralCV AI Analysis Passport",
      generatedAt: analysisTimestamp ?? new Date().toISOString(),
      overallConfidence: `${overallConfidence}%`,
      agents: passport.map(a => ({
        id: a.agentId,
        name: a.name,
        model: a.model,
        role: a.role,
        confidence: `${a.confidence}%`,
        outputSummary: a.outputSummary,
      })),
      note: "This passport documents every AI agent that analyzed your resume, which models were used, and the confidence level of each analysis.",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "neuralcv-ai-passport.json";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-purple-400" />
          <div>
            <p className="text-sm font-semibold text-white/80">AI Transparency Passport</p>
            <p className="text-xs text-white/40">{passport.length} agents · Overall confidence: <span className="text-purple-300 font-semibold">{overallConfidence}%</span></p>
          </div>
        </div>
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white/50 hover:text-white/80 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <Download size={12} /> Download
        </button>
      </motion.div>

      <p className="text-xs text-white/30 px-1">
        Every AI agent that analyzed your resume is documented here: which model was used, what it analyzed, and how confident it was. You can download this as proof of AI transparency.
      </p>

      {/* Agent cards */}
      <div className="space-y-3">
        {passport.map((agent, i) => {
          const color = agentColors[i % agentColors.length];
          return (
            <motion.div key={agent.agentId}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: `${color}18`, border: `1px solid ${color}33`, color }}>
                  {agent.agentId}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-white/85">Agent {agent.agentId}: {agent.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                      {agent.model}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{agent.role}</p>
                </div>
                <CheckCircle size={14} className="text-green-400/70 shrink-0 mt-0.5" />
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-white/30 mb-1.5">Confidence</p>
                  <ConfidenceBar value={agent.confidence} />
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Output</p>
                  <p className="text-xs text-white/55 leading-relaxed">{agent.outputSummary}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-white/30"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <Cpu size={12} className="mt-0.5 shrink-0" />
        <span>Analysis generated at {analysisTimestamp ?? new Date().toLocaleString()}. No data is stored. Each analysis is ephemeral and private.</span>
      </div>
    </div>
  );
}
