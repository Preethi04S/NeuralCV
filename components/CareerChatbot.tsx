"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

interface ChatContext {
  atsScore?: number; grade?: string; targetRole?: string; name?: string;
  topSkills?: string[]; missingKeywords?: string[]; strengths?: string[];
  weaknesses?: string[]; experienceLevel?: string; experienceYears?: number;
}

interface Props { context?: ChatContext; isDark?: boolean; }

const QUICK_QUESTIONS = [
  "What skills should I focus on first?",
  "How do I negotiate a higher salary?",
  "How can I make my resume ATS-friendly?",
  "What's the best way to prepare for interviews?",
  "How do I switch careers into tech?",
];

export function CareerChatbot({ context, isDark = true }: Props) {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [hasContext, setHasContext] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { setHasContext(context?.atsScore != null); }, [context]);
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  // Theme
  const t1      = isDark ? "#f0f4ff"                 : "#1A1D23";
  const t2      = isDark ? "rgba(240,244,255,0.85)"  : "rgba(26,29,35,0.78)";
  const t3      = isDark ? "rgba(240,244,255,0.58)"  : "rgba(26,29,35,0.55)";
  const accent  = isDark ? "#7c3aed"                 : "#5C21A1";
  const panelBg = isDark ? "#0f1117"                 : "#FFFFFF";
  const headerBg = isDark ? "rgba(124,58,237,0.08)"  : "rgba(92,33,161,0.06)";
  const headerBorder = isDark ? "rgba(124,58,237,0.2)" : "rgba(92,33,161,0.15)";
  const msgAssistantBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const msgUserBg = isDark ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.4))" : `linear-gradient(135deg, ${accent}25, ${accent}15)`;
  const inputBg  = isDark ? "rgba(255,255,255,0.05)" : "#F7F9FC";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)";
  const quickBg  = isDark ? "rgba(124,58,237,0.07)"  : "rgba(92,33,161,0.06)";
  const quickBorder = isDark ? "rgba(124,58,237,0.15)" : "rgba(92,33,161,0.15)";
  const panelBorder = isDark ? "rgba(124,58,237,0.25)" : "rgba(92,33,161,0.2)";
  const notifBorder = isDark ? "#111" : "#FFFFFF";

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput(""); setError("");
    const userMsg: Message = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context: context ?? null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat service unavailable");
      const reply = data.reply ?? "Sorry, I couldn't respond right now. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error. Please check your connection and try again.");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})`, boxShadow: `0 0 30px ${accent}50` }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        animate={open ? {} : { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity, delay: 3 } }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} color="#fff" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} color="#fff" /></motion.div>
          }
        </AnimatePresence>
        {hasContext && !open && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-400 border-2"
            style={{ borderColor: notifBorder }} />
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
            style={{ height: "500px", background: panelBg, border: `1px solid ${panelBorder}`, boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ background: headerBg, borderColor: headerBorder }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})` }}>
                <Sparkles size={14} color="#fff" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: t1 }}>CareerAI</p>
                <p className="text-xs" style={{ color: t3 }}>
                  {hasContext ? `Analysed your resume · ATS ${context?.atsScore}/100` : "Career coach & advisor"}
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: t3 }} className="hover:opacity-70 transition-opacity">
                <X size={16} />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-3 mt-2 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: isDark ? "#f87171" : "#c0392b" }}>
                <AlertCircle size={12} className="shrink-0" /> {error}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})` }}>
                      <Bot size={12} color="#fff" />
                    </div>
                    <div className="flex-1 px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
                      style={{ background: msgAssistantBg, color: t2 }}>
                      {hasContext
                        ? `Hi! I've reviewed your analysis. You scored ${context?.atsScore}/100 for ${context?.targetRole || "your target role"}. What would you like help with?`
                        : "Hi! I'm CareerAI, your personal career advisor. Ask me anything about resumes, interviews, salary negotiation, or career transitions."}
                    </div>
                  </div>
                  <div className="space-y-1.5 ml-8">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl transition-all"
                        style={{ background: quickBg, border: `1px solid ${quickBorder}`, color: t2 }}
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: msg.role === "assistant" ? `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})` : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") }}>
                    {msg.role === "assistant"
                      ? <Bot size={11} color="#fff" />
                      : <User size={11} style={{ color: t2 }} />
                    }
                  </div>
                  <div className="max-w-[80%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: msg.role === "user" ? msgUserBg : msgAssistantBg,
                      borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      color: t1,
                    }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})` }}>
                    <Bot size={11} color="#fff" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                    style={{ background: msgAssistantBg }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: accent }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your career..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: t1 }}
                />
                <motion.button onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading} whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? `linear-gradient(135deg, ${accent}, ${isDark ? "#6366f1" : "#037DD6"})` : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") }}>
                  <Send size={13} color="#fff" />
                </motion.button>
              </div>
              <p className="text-xs text-center mt-1.5" style={{ color: t3 }}>
                Enter to send · Context-aware with your resume
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
