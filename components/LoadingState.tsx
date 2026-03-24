"use client";
import { motion } from "framer-motion";

const steps = [
  "Parsing resume structure...",
  "Extracting job requirements...",
  "Running ATS simulation...",
  "Analyzing skills gap...",
  "Generating suggestions...",
];

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-purple-500/30"
            animate={{ scale: [1, 1.8 + i * 0.4], opacity: [0.6, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
        <motion.div
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{ background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16C8 11.6 11.6 8 16 8" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 8C20.4 8 24 11.6 24 16C24 20.4 20.4 24 16 24" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="space-y-2 text-center">
        {steps.map((step, i) => (
          <motion.p
            key={i}
            className="text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.3] }}
            transition={{
              duration: 1,
              delay: i * 0.7,
              times: [0, 0.2, 0.8, 1],
            }}
          >
            {step}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
