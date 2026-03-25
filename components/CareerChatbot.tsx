"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  atsScore?: number;
  grade?: string;
  targetRole?: string;
  name?: string;
  topSkills?: string[];
  missingKeywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  experienceLevel?: string;
  experienceYears?: number;
}

interface Props {
  context?: ChatContext;
}

const QUICK_QUESTIONS = [
  "What skills should I focus on first?",
  "How do I negotiate a higher salary?",
  "How can I make my resume ATS-friendly?",
  "What's the best way to prepare for interviews?",
  "How do I switch careers into tech?",
];

export function CareerChatbot({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasContext, setHasContext] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasContext(context?.atsScore != null);
  }, [context]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: context ?? null,
        }),
      });
      const data = await res.json();
      const reply = data.reply ?? "Sorry, I couldn't respond. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)", boxShadow: "0 0 30px rgba(124,58,237,0.5)" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity, delay: 3 } }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
        {/* Notification dot when context is available */}
        {hasContext && !open && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-400 border-2"
            style={{ borderColor: "#111" }} />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: "500px",
              background: "#0f0f13",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.2)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/90">CareerAI</p>
                <p className="text-xs text-white/40">
                  {hasContext ? `Analysed your resume · ATS ${context?.atsScore}/100` : "Career coach & advisor"}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="flex-1 px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm text-white/75 leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      {hasContext
                        ? `Hi! I've reviewed your resume analysis. You scored ${context?.atsScore}/100 for ${context?.targetRole || "your target role"}. I can see your key gaps and strengths. What would you like help with?`
                        : "Hi! I'm CareerAI, your personal career advisor. Ask me anything about resumes, interviews, salary negotiation, or career transitions."}
                    </div>
                  </div>

                  {/* Quick questions */}
                  <div className="space-y-1.5 ml-8">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl text-white/55 hover:text-white/90 transition-all"
                        style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.15)" }}
                        whileHover={{ x: 3 }}>
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                      : "bg-white/10"
                  }`}>
                    {msg.role === "assistant" ? <Bot size={11} className="text-white" /> : <User size={11} className="text-white/70" />}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white/85"
                      : "rounded-tl-sm text-white/75"
                  }`}
                    style={{
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.4))"
                        : "rgba(255,255,255,0.05)",
                    }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600">
                    <Bot size={11} className="text-white" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <Loader2 size={14} className="text-purple-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your career..."
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? "linear-gradient(135deg, #7c3aed, #6366f1)" : "rgba(255,255,255,0.08)" }}>
                  <Send size={13} className="text-white" />
                </motion.button>
              </div>
              <p className="text-xs text-white/20 text-center mt-1.5">Enter to send · Context-aware with your resume</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
