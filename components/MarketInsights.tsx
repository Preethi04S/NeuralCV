"use client";
import { motion } from "framer-motion";
import { TrendingUp, Building2, DollarSign, Zap } from "lucide-react";

interface MarketInsightsData {
  totalJobsFound: number;
  topCompanies: string[];
  salaryRanges: string[];
  topSkillsInDemand: string[];
  mostActiveCategory: string;
}

interface Props {
  insights: MarketInsightsData;
}

export function MarketInsights({ insights }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 mb-6"
    >
      {/* Live openings */}
      <div className="col-span-2 flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)" }}>
        <TrendingUp size={16} className="text-purple-400 shrink-0" />
        <div>
          <p className="text-xs text-white/40">Live remote openings found for your profile</p>
          <p className="text-lg font-bold text-white">{insights.totalJobsFound} <span className="text-sm font-normal text-white/40">jobs</span></p>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live data
          </span>
        </div>
      </div>

      {/* Top skills in demand */}
      {insights.topSkillsInDemand?.length > 0 && (
        <div className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-yellow-400" />
            <p className="text-xs text-white/40 uppercase tracking-wide">Skills in demand</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {insights.topSkillsInDemand.slice(0, 5).map((skill, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded-md text-white/60"
                style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.18)" }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top companies */}
      {insights.topCompanies?.length > 0 && (
        <div className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={12} className="text-blue-400" />
            <p className="text-xs text-white/40 uppercase tracking-wide">Top hiring</p>
          </div>
          <div className="space-y-1">
            {insights.topCompanies.slice(0, 3).map((company, i) => (
              <p key={i} className="text-xs text-white/60 truncate">{company}</p>
            ))}
          </div>
        </div>
      )}

      {/* Salary ranges */}
      {insights.salaryRanges?.length > 0 && (
        <div className="col-span-2 p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign size={12} className="text-green-400" />
            <p className="text-xs text-white/40 uppercase tracking-wide">Salary ranges seen in listings</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.salaryRanges.slice(0, 3).map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-md text-green-300/70"
                style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
