"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Home, BarChart2, Sun, Moon } from "lucide-react";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import { useTheme } from "@/hooks/useTheme";

export default function EditorPage() {
  const router = useRouter();
  const { isDark, toggle } = useTheme();

  const navBg   = isDark ? "rgba(5,8,16,0.92)"   : "rgba(255,255,255,0.95)";
  const border  = isDark ? "rgba(0,212,170,0.15)" : "rgba(0,0,0,0.07)";
  const bg      = isDark ? "#050810"              : "#F2F4F6";
  const text1   = isDark ? "#FFFFFF"              : "#1A1D23";
  const text2   = isDark ? "rgba(255,255,255,0.60)":"rgba(26,29,35,0.65)";
  const btnBg   = isDark ? "rgba(255,255,255,0.06)":"#ffffff";
  const btnBd   = isDark ? "rgba(255,255,255,0.10)":"rgba(0,0,0,0.10)";
  const accent  = isDark ? "#00d4aa"              : "#037DD6";

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500" style={{ background: bg }}>

      {/* ── Top navbar ── */}
      <motion.nav initial={{ opacity:0,y:-12 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }}
        className="sticky top-0 z-50 w-full px-6 py-3 flex items-center gap-4"
        style={{ background:navBg, backdropFilter:"blur(20px)", borderBottom:`1px solid ${border}` }}>

        {/* Logo */}
        <button onClick={()=>router.push("/")} className="flex items-center gap-2 hover:opacity-75 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:`${accent}18`, border:`1px solid ${accent}35` }}>
            <Sparkles size={14} style={{ color:accent }}/>
          </div>
          <span className="font-black text-lg" style={{ color:text1 }}>NeuralCV</span>
        </button>

        <div className="h-5 w-px mx-1" style={{ background:border }}/>

        <div className="flex items-center gap-2 text-sm font-medium" style={{ color:text2 }}>
          <span>Resume Builder</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-0.5"
            style={{ background:isDark?"linear-gradient(135deg,#0d1420,#1a2540)":"linear-gradient(135deg,#e8f4fd,#dbeeff)",
              border:isDark?"1px solid rgba(0,212,170,0.30)":"1px solid rgba(3,125,214,0.25)" }}>
            <motion.div animate={{ x:isDark?0:24 }} transition={{ type:"spring",stiffness:500,damping:30 }}
              className="w-5 h-5 rounded-full flex items-center justify-center shadow"
              style={{ background:isDark?"linear-gradient(135deg,#1e3a5f,#0d1420)":"linear-gradient(135deg,#fff,#f0f7ff)" }}>
              {isDark?<Moon size={10} style={{ color:"#00d4aa" }}/>:<Sun size={10} style={{ color:"#F6851B" }}/>}
            </motion.div>
          </button>

          <button onClick={()=>router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-75"
            style={{ color:text2, border:`1px solid ${btnBd}`, background:btnBg }}>
            <BarChart2 size={14}/> Analyse Resume
          </button>
          <button onClick={()=>router.push("/")}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-75"
            style={{ color:text2, border:`1px solid ${btnBd}`, background:btnBg }}>
            <Home size={14}/> Home
          </button>
        </div>
      </motion.nav>

      <div className="flex-1">
        <ResumeBuilder isDark={isDark}/>
      </div>
    </div>
  );
}
