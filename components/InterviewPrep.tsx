"use client";
import { motion } from "framer-motion";
import { MessageSquare, AlertCircle, Lightbulb } from "lucide-react";
import type { InterviewQuestion } from "@/types/analysis";

interface Props {
  questions: InterviewQuestion[];
}

export function InterviewPrep({ questions }: Props) {
  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      <p className="text-sm text-white/40 mb-5">
        Based on your resume gaps, these are the questions you are most likely to face. Prepare for them before your interview.
      </p>
      {questions.map((q, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Question header */}
          <div
            className="flex items-start gap-3 px-5 py-4"
            style={{ background: "rgba(168, 85, 247, 0.07)" }}
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5"
              style={{ background: "rgba(168, 85, 247, 0.2)", color: "#c084fc" }}
            >
              {i + 1}
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare size={15} className="text-purple-400 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-white/90 leading-relaxed">{q.question}</p>
            </div>
          </div>

          {/* Why + Tip */}
          <div className="px-5 py-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-start gap-2">
              <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-amber-400/80 font-medium">Why they ask: </span>
                {q.why}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb size={13} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-green-400/80 font-medium">How to answer: </span>
                {q.tip}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
