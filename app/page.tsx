"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Target, BarChart2, Zap, Shield, Star,
  ArrowRight, CheckCircle, TrendingUp, Award, FileText,
  Edit3, MessageSquare, ChevronRight, Users, Clock, Lock,
  Upload, Activity, Quote, RefreshCw, Sun, Moon, PenLine,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/* ─────────────────────────────────────────────────────────────
   THEME PALETTE
───────────────────────────────────────────────────────────── */
const DK = {
  bg:"#050810", bg2:"#080d1e",
  surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)",
  card:"rgba(12,19,38,0.97)", navBg:"rgba(5,8,16,0.85)",
  text1:"#FFFFFF", text2:"rgba(255,255,255,0.72)", text3:"rgba(255,255,255,0.42)",
  accent:"#00d4aa", accent2:"#6366f1", accentGlow:"rgba(0,212,170,0.22)",
  featureCard:"rgba(255,255,255,0.03)", featureBorder:"rgba(255,255,255,0.07)",
};
const LT = {
  bg:"#FFFFFF", bg2:"#F0F4FF",
  surface:"rgba(0,0,0,0.03)", border:"rgba(0,0,0,0.08)",
  card:"rgba(255,255,255,0.97)", navBg:"rgba(255,255,255,0.92)",
  text1:"#0F172A", text2:"rgba(15,23,42,0.68)", text3:"rgba(15,23,42,0.42)",
  accent:"#0052CC", accent2:"#6366f1", accentGlow:"rgba(0,82,204,0.16)",
  featureCard:"rgba(255,255,255,0.80)", featureBorder:"rgba(0,0,0,0.08)",
};

/* ─────────────────────────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────────────────────────── */
const ROLES = ["Software Engineer","Product Manager","Data Scientist","UX Designer","DevOps Engineer","Marketing Lead"];
function TypewriterRole({ color }: { color: string }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause) { const t = setTimeout(()=>setPause(false),1500); return ()=>clearTimeout(t); }
    const target = ROLES[idx];
    if (!del) {
      if (txt.length < target.length) { const t = setTimeout(()=>setTxt(target.slice(0,txt.length+1)),52); return ()=>clearTimeout(t); }
      setPause(true); setDel(true);
    } else {
      if (txt.length > 0) { const t = setTimeout(()=>setTxt(txt.slice(0,-1)),28); return ()=>clearTimeout(t); }
      setDel(false); setIdx((idx+1)%ROLES.length);
    }
  },[txt,del,idx,pause]);
  return (
    <span style={{ color }}>
      {txt}
      <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:0.9,repeat:Infinity }} style={{ display:"inline-block",marginLeft:2 }}>|</motion.span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   COUNT-UP
───────────────────────────────────────────────────────────── */
function CountUp({ target, suffix="" }: { target:number; suffix?:string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now-t0)/1800,1);
          setVal(Math.round((1-Math.pow(1-p,3))*target));
          if(p<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },{threshold:0.3});
    obs.observe(el);
    return ()=>obs.disconnect();
  },[target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────
   SPOTLIGHT CURSOR
───────────────────────────────────────────────────────────── */
function SpotlightCursor({ x,y,isDark }: { x:number; y:number; isDark:boolean }) {
  const c = isDark ? "rgba(0,212,170,0.06)" : "rgba(0,82,204,0.05)";
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex:3 }}>
      <div style={{ position:"absolute", left:x-400, top:y-400, width:800, height:800,
        borderRadius:"50%", background:`radial-gradient(circle,${c} 0%,transparent 60%)`,
        pointerEvents:"none", transition:"left 0.07s ease-out,top 0.07s ease-out" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D GLOBE EXPLOSION  — the hero canvas centrepiece
   Phases: idle → exploding → assembling → done
───────────────────────────────────────────────────────────── */
type GPhase = "idle"|"exploding"|"assembling"|"done";

function GlobeExplosion({ isDark }: { isDark:boolean }) {
  const router     = useRouter();
  const cvRef      = useRef<HTMLCanvasElement>(null);
  const phRef      = useRef<GPhase>("idle");
  const expRef     = useRef<()=>void>(()=>{});
  const resetRef   = useRef<()=>void>(()=>{});
  const timers     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isDarkRef  = useRef(isDark);
  const [uiPh,  setUiPh]  = useState<GPhase>("idle");
  const [score, setScore] = useState(0);
  const [barV,  setBarV]  = useState([0,0,0,0,0]);

  /* Pre-generated explosion particles — stable across renders */
  const explosionParticles = useMemo(()=>{
    const cols=["#00d4aa","#6366f1","#a855f7","#f59e0b","#22c55e","#ef4444","#3b82f6","#ec4899"];
    return Array.from({length:80},(_,i)=>{
      const spread = (i/80)*Math.PI*2 + (i%7)*0.13;
      const dist   = 280 + (i%3)*180 + (i%11)*22;
      return {
        color: cols[i%cols.length],
        tx: Math.cos(spread)*dist,
        ty: Math.sin(spread)*dist,
        sz:  1.5 + (i%5)*0.9,
        delay: (i%13)*0.022,
        dur:  1.0 + (i%7)*0.14,
      };
    });
  },[]);

  /* keep isDarkRef in sync without re-running the canvas effect */
  useEffect(()=>{ isDarkRef.current = isDark; },[isDark]);

  useEffect(()=>{
    const cv = cvRef.current; if(!cv) return;

    /* ── Canvas setup — render at full CSS display resolution to avoid blur ── */
    const DPR = Math.min(window.devicePixelRatio||1,2);
    const W=460, H=430;
    const parentW = cv.parentElement?.getBoundingClientRect().width || W;
    const cssW = Math.min(Math.max(parentW, W), 560);
    const cssH = Math.round(cssW*H/W);
    /* Physical pixels = CSS size × DPR so canvas is never upscaled */
    cv.width=cssW*DPR; cv.height=cssH*DPR;
    cv.style.width=cssW+"px"; cv.style.height=cssH+"px";
    const ctx = cv.getContext("2d")!;
    /* Scale so drawing coords stay at W×H regardless of actual CSS size */
    ctx.scale(DPR*cssW/W, DPR*cssH/H);
    const CX=W/2, CY=H*0.40;

    /* ── Fibonacci sphere — smaller radius so it fits canvas ── */
    const N=220, PHI=Math.PI*(3-Math.sqrt(5));
    const R=108;   // sphere radius
    const FOV=360, CAM=300; // CAM=300 → less aggressive perspective → sphere not clipped
    const BAR_COLS=["#00d4aa","#06b6d4","#3b82f6","#8b5cf6","#d946ef"];

    interface Pt {
      sx:number;sy:number;sz:number;
      x:number;y:number;z:number;
      vx:number;vy:number;vz:number;
      tx:number;ty:number;tz:number;
      hue:number; bc:string;
      trX:number[];trY:number[];
    }

    const pts:Pt[] = Array.from({length:N},(_,i)=>{
      const yN = 1-(i/(N-1))*2;
      const rr = Math.sqrt(Math.max(0,1-yN*yN));
      const th = PHI*i;
      const sx=rr*Math.cos(th)*R, sy=yN*R, sz=rr*Math.sin(th)*R;
      return { sx,sy,sz, x:sx,y:sy,z:sz,
               vx:0,vy:0,vz:0, tx:0,ty:0,tz:0,
               hue:160+(i/N)*110, bc:BAR_COLS[i%BAR_COLS.length],
               trX:[],trY:[] };
    });

    /* ── Score-bar assembly targets (flat z=0, no rotation applied) ── */
    const BARS=[{pct:.91,y:-70,c:"#00d4aa"},{pct:.74,y:-38,c:"#06b6d4"},{pct:.82,y:-6,c:"#3b82f6"},{pct:.87,y:26,c:"#8b5cf6"},{pct:.68,y:58,c:"#d946ef"}];
    const BTARGETS=[91,74,82,87,68];
    const setTargets=()=>{
      const pb=Math.floor(N/BARS.length);
      pts.forEach((p,i)=>{
        const bi=i%BARS.length, bar=BARS[bi];
        const pos=Math.floor(i/BARS.length);
        const bw=230*bar.pct;
        /* tz=0 so rotation won't skew them */
        p.tx=-bw/2+(pos/pb)*bw+(Math.random()-.5)*3;
        p.ty=bar.y+(Math.random()-.5)*5;
        p.tz=0;
      });
    };

    /* ── State ── */
    let rot=0, raf=0;
    phRef.current="idle"; // ALWAYS reset to idle on (re)mount

    /* ── Draw loop ── */
    const draw=()=>{
      /* Dark mode: fill canvas so globe dots show on dark; light mode: clear to transparent so page bg shows through */
      if(isDarkRef.current){
        ctx.fillStyle="#050810";
        ctx.fillRect(0,0,W,H);
      } else {
        ctx.clearRect(0,0,W,H);
      }
      const ph=phRef.current;

      /* Rotation: only in idle + exploding, ZERO during assembly so bars stay horizontal */
      if(ph==="idle")      rot+=0.007;
      else if(ph==="exploding") rot+=0.003;
      /* assembling/done: rot frozen */

      /* ── Update positions ── */
      if(ph==="idle"){
        pts.forEach(p=>{ p.x=p.sx; p.y=p.sy; p.z=p.sz; });
      } else if(ph==="exploding"){
        pts.forEach(p=>{
          p.x+=p.vx; p.y+=p.vy; p.z+=p.vz;
          p.vx*=.95; p.vy*=.95; p.vz*=.95;
          p.vy+=.06; // gravity
        });
      } else {
        // assembling / done: spring toward targets (tx,ty,tz=0)
        pts.forEach(p=>{
          p.x+=(p.tx-p.x)*.06;
          p.y+=(p.ty-p.y)*.06;
          p.z+=(p.tz-p.z)*.06; // converges toward 0
        });
      }

      /* ── Project: rotation ONLY for idle/exploding ── */
      const useRot = ph==="idle"||ph==="exploding";
      const cosR = useRot ? Math.cos(rot) : 1;
      const sinR = useRot ? Math.sin(rot) : 0;

      const proj=pts.map(p=>{
        const rx = p.x*cosR - p.z*sinR;
        const rz = p.x*sinR + p.z*cosR;
        const dz = Math.max(rz+CAM, 5);
        const s  = FOV/dz;
        return {px:CX+rx*s, py:CY+p.y*s, s, rz, p};
      });

      /* Back-to-front painter sort */
      proj.sort((a,b)=>b.rz-a.rz);

      /* ── Sphere silhouette ring (idle) ── */
      if(ph==="idle"){
        const projR = R*(FOV/CAM)*0.98;
        ctx.beginPath(); ctx.arc(CX,CY,projR,0,Math.PI*2);
        ctx.strokeStyle="rgba(0,212,170,0.07)"; ctx.lineWidth=1.2; ctx.stroke();
        // Equator ellipse hint
        ctx.beginPath(); ctx.ellipse(CX,CY,projR,projR*0.22,0,0,Math.PI*2);
        ctx.strokeStyle="rgba(99,102,241,0.06)"; ctx.lineWidth=0.8; ctx.stroke();
      }

      /* ── Connections (idle: only front hemisphere) ── */
      if(ph==="idle"){
        const front=proj.filter(d=>d.rz<30).slice(0,50);
        front.forEach((a,ai)=>{
          front.slice(ai+1).forEach(b=>{
            const d=Math.hypot(a.px-b.px,a.py-b.py);
            if(d<50){
              ctx.beginPath(); ctx.moveTo(a.px,a.py); ctx.lineTo(b.px,b.py);
              ctx.strokeStyle=`rgba(99,102,241,${(0.11*(1-d/50)).toFixed(3)})`;
              ctx.lineWidth=0.55; ctx.stroke();
            }
          });
        });
      }

      /* ── Assembled canvas header + bar labels ── */
      if(ph==="assembling"||ph==="done"){
        /* ─ HEADER BLOCK — theme-aware, no duplicate score ─ */
        const dk = isDarkRef.current;
        const headText  = dk ? "rgba(255,255,255,1.00)" : "rgba(15,23,42,1.00)";
        const subText   = dk ? "rgba(255,255,255,0.60)" : "rgba(15,23,42,0.70)";

        // Glow behind header
        const gr=ctx.createRadialGradient(CX,62,0,CX,62,70);
        gr.addColorStop(0,"rgba(0,212,170,0.10)"); gr.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(CX,62,70,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

        // Badge
        ctx.font="bold 10px -apple-system,sans-serif";
        ctx.textAlign="center";
        ctx.fillStyle="rgba(0,212,170,0.90)";
        ctx.fillText("RESUME SCAN COMPLETE", CX, 32);

        // Divider
        ctx.beginPath(); ctx.moveTo(CX-90,42); ctx.lineTo(CX+90,42);
        ctx.strokeStyle="rgba(0,212,170,0.20)"; ctx.lineWidth=0.7; ctx.stroke();

        // Header label
        ctx.font="bold 14px -apple-system,sans-serif";
        ctx.fillStyle=headText;
        ctx.fillText("AI Score Breakdown", CX, 68);

        // Subtitle hint
        ctx.font="10px -apple-system,sans-serif";
        ctx.fillStyle=subText;
        ctx.fillText("5 dimensions · 220 data points analysed", CX, 88);

        // Second divider
        ctx.beginPath(); ctx.moveTo(CX-90,98); ctx.lineTo(CX+90,98);
        ctx.strokeStyle=dk?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"; ctx.lineWidth=0.6; ctx.stroke();

        /* ─ DONE: clean solid bars — fixed layout, theme-aware ─ */
        if(ph==="done"){
          const dk2=isDarkRef.current;
          const labelCol  = dk2 ? "rgba(255,255,255,1.00)" : "rgba(15,23,42,1.00)";
          const trackCol  = dk2 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
          /* Fixed layout: label(LX) | bar(BAR_X → BAR_X+BAR_W) | pct(PCT_X) */
          const LX=18, BAR_X=118, BAR_W=262, PCT_X=388;
          const BAR_NAMES=["ATS Compat","Keywords","Impact","Style","ATS Pass"];
          BARS.forEach((bar,bi)=>{
            const barCY=CY+bar.y, bh=8;
            /* Label — left-aligned from LX */
            ctx.font="700 12px -apple-system,sans-serif";
            ctx.fillStyle=labelCol;
            ctx.textAlign="left";
            ctx.fillText(BAR_NAMES[bi], LX, barCY+4);
            /* Track */
            ctx.beginPath(); ctx.roundRect(BAR_X, barCY-bh/2, BAR_W, bh, 4);
            ctx.fillStyle=trackCol; ctx.fill();
            /* Fill */
            ctx.beginPath(); ctx.roundRect(BAR_X, barCY-bh/2, BAR_W*bar.pct, bh, 4);
            ctx.fillStyle=bar.c; ctx.fill();
            /* Percentage — right of bar */
            ctx.font="800 12px -apple-system,sans-serif";
            ctx.fillStyle=bar.c;
            ctx.textAlign="left";
            ctx.fillText(`${Math.round(bar.pct*100)}%`, PCT_X, barCY+4);
          });
          ctx.textAlign="left"; ctx.shadowBlur=0;

          /* ── Score + ring row drawn in canvas below bars ── */
          const scoreY = CY + 68;
          // Divider
          ctx.beginPath(); ctx.moveTo(18, scoreY); ctx.lineTo(W-18, scoreY);
          ctx.strokeStyle = dk2?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)";
          ctx.lineWidth=0.7; ctx.stroke();
          // Centered score layout
          const sLeft=CX-100, sRight=CX+60;
          // Label
          ctx.font="bold 9px -apple-system,sans-serif";
          ctx.fillStyle="#00d4aa"; ctx.textAlign="left";
          ctx.fillText("AI SCORE", sLeft, scoreY+18);
          // Big number
          ctx.font="900 40px -apple-system,sans-serif";
          ctx.fillStyle="#00d4aa";
          ctx.fillText("87", sLeft, scoreY+62);
          // /100
          ctx.font="12px -apple-system,sans-serif";
          ctx.fillStyle=dk2?"rgba(255,255,255,0.38)":"rgba(15,23,42,0.42)";
          ctx.fillText("/ 100", sLeft+52, scoreY+62);
          // Grade ring
          const rCX=sRight+28, rCY=scoreY+42, rR=28;
          ctx.beginPath(); ctx.arc(rCX,rCY,rR,0,Math.PI*2);
          ctx.strokeStyle=dk2?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)";
          ctx.lineWidth=7; ctx.stroke();
          const rGrad=ctx.createLinearGradient(rCX-rR,rCY,rCX+rR,rCY);
          rGrad.addColorStop(0,"#00d4aa"); rGrad.addColorStop(0.5,"#3b82f6"); rGrad.addColorStop(1,"#d946ef");
          ctx.beginPath(); ctx.arc(rCX,rCY,rR,-Math.PI/2,-Math.PI/2+2*Math.PI*0.87);
          ctx.strokeStyle=rGrad; ctx.lineWidth=7; ctx.lineCap="round"; ctx.stroke(); ctx.lineCap="butt";
          ctx.font="bold 13px -apple-system,sans-serif";
          ctx.fillStyle="#00d4aa"; ctx.textAlign="center";
          ctx.fillText("B+",rCX,rCY+5); ctx.textAlign="left";

          /* ── Keyword gap row below score ── */
          const kY = scoreY + 82;
          // Section label — centred
          ctx.font="700 9px -apple-system,sans-serif";
          ctx.fillStyle=dk2?"rgba(255,255,255,0.45)":"rgba(15,23,42,0.50)";
          ctx.textAlign="center";
          ctx.fillText("KEYWORD SNAPSHOT", CX, kY);
          ctx.textAlign="left";
          // Tag pills — centred row
          const KTAGS=[
            {t:"React",   ok:true }, {t:"AWS",   ok:true },
            {t:"TypeScript",ok:true},{t:"Python",ok:false},
            {t:"Docker",  ok:false}, {t:"Kafka", ok:false},
          ];
          // measure total width first
          ctx.font="600 9px -apple-system,sans-serif";
          const tagWidths=KTAGS.map(tag=>ctx.measureText((tag.ok?"✓ ":"✗ ")+tag.t).width+14);
          const totalW=tagWidths.reduce((a,b)=>a+b,0)+(KTAGS.length-1)*5;
          let kx=CX-totalW/2;
          const kPY=kY+10;
          KTAGS.forEach((tag,ti)=>{
            const tw=tagWidths[ti];
            ctx.beginPath(); ctx.roundRect(kx,kPY,tw,17,8);
            ctx.fillStyle=tag.ok?"rgba(0,212,170,0.13)":"rgba(239,68,68,0.10)"; ctx.fill();
            ctx.strokeStyle=tag.ok?"rgba(0,212,170,0.28)":"rgba(239,68,68,0.22)";
            ctx.lineWidth=0.8; ctx.stroke();
            ctx.font="600 9px -apple-system,sans-serif";
            ctx.fillStyle=tag.ok?"#00d4aa":"#f87171"; ctx.textAlign="left";
            ctx.fillText((tag.ok?"✓ ":"✗ ")+tag.t, kx+7, kPY+11.5);
            kx+=tw+5;
          });
          ctx.textAlign="left";
        }

        /* ─ ASSEMBLING: faint labels while dots still moving ─ */
        if(ph==="assembling"){
          const dk2=isDarkRef.current;
          const labelCol = dk2 ? "rgba(255,255,255,0.50)" : "rgba(15,23,42,0.50)";
          const BAR_NAMES=["ATS Compat","Keywords","Impact","Style","ATS Pass"];
          const LX=18, PCT_X=388;
          BARS.forEach((bar,bi)=>{
            const barCY=CY+bar.y;
            ctx.font="600 10px -apple-system,sans-serif";
            ctx.fillStyle=labelCol; ctx.textAlign="left";
            ctx.fillText(BAR_NAMES[bi], LX, barCY+4);
            ctx.fillStyle=bar.c;
            ctx.fillText(`${Math.round(bar.pct*100)}%`, PCT_X, barCY+4);
          });
          ctx.textAlign="left";
        }
      }

      /* ── Draw particles (idle / exploding / assembling only — NOT done) ── */
      if(ph!=="done") proj.forEach(({px,py,s,rz,p})=>{
        const depth=(rz+CAM)/(CAM*2);
        const isAssembled=ph==="assembling";

        /* IDLE: strong depth contrast — front bright & large, back faint & tiny */
        const dk3 = isDarkRef.current;
        const dotL = dk3 ? 65 : 38;  /* darker dots in light mode for visibility */
        const alpha = ph==="idle" ? Math.max(dk3?0.10:0.22, 1-depth*(dk3?0.88:0.72)) : 1;
        const sz    = ph==="idle" ? Math.max(0.5, s*2.5*(1-depth*0.5))
                    : Math.max(0.7, s*2.0);

        /* Explosion trails */
        if(ph==="exploding"){
          p.trX.unshift(px); p.trY.unshift(py);
          if(p.trX.length>10){p.trX.pop();p.trY.pop();}
          p.trX.forEach((tx,ti)=>{
            ctx.beginPath();
            ctx.arc(tx,p.trY[ti],sz*Math.max(.05,1-ti/10)*.8,0,Math.PI*2);
            ctx.fillStyle=`hsla(${p.hue},90%,${dotL}%,${((1-ti/10)*0.30).toFixed(3)})`;
            ctx.fill();
          });
        }

        /* Glow halo — front-facing idle particles only */
        if(ph==="idle" && depth<0.22){
          const g=ctx.createRadialGradient(px,py,0,px,py,sz*3.8);
          g.addColorStop(0,`hsla(${p.hue},90%,${dotL}%,${dk3?0.35:0.20})`);
          g.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(px,py,sz*3.8,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        }

        /* Assembled glow */
        if(isAssembled){
          ctx.shadowBlur=sz>1.2?10:0;
          ctx.shadowColor=p.bc;
        }

        /* Main dot */
        ctx.beginPath(); ctx.arc(px,py,sz,0,Math.PI*2);
        ctx.fillStyle = isAssembled
          ? p.bc
          : `hsla(${p.hue},90%,${dotL}%,${alpha.toFixed(3)})`;
        ctx.fill();
        ctx.shadowBlur=0;
      });

      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);

    /* ── Explosion trigger ── */
    expRef.current=()=>{
      if(phRef.current!=="idle") return;
      phRef.current="exploding"; setUiPh("exploding");
      pts.forEach(p=>{
        const mag=Math.sqrt(p.x*p.x+p.y*p.y+p.z*p.z)||1;
        const spd=13+Math.random()*18;
        p.vx=(p.x/mag)*spd*(0.75+Math.random()*.55);
        p.vy=(p.y/mag)*spd*(0.75+Math.random()*.55)-3;
        p.vz=(p.z/mag)*spd*(0.75+Math.random()*.55);
        p.trX=[]; p.trY=[];
      });
      const t1=setTimeout(()=>{
        setTargets();
        phRef.current="assembling"; setUiPh("assembling");
        pts.forEach(p=>{ p.vx=0; p.vy=0; p.vz=0; });
        const t0=performance.now();
        const tick=(now:number)=>{
          const pct=Math.min((now-t0)/2200,1);
          const e=1-Math.pow(1-pct,3);
          setScore(Math.round(e*87));
          setBarV(BTARGETS.map(t=>Math.round(e*t)));
          if(pct<1) requestAnimationFrame(tick);
          else{ phRef.current="done"; setUiPh("done"); }
        };
        const t2=setTimeout(()=>requestAnimationFrame(tick),150);
        timers.current.push(t2);
      },1400);
      timers.current.push(t1);
    };

    /* ── Reset ── */
    resetRef.current=()=>{
      timers.current.forEach(clearTimeout); timers.current=[];
      phRef.current="idle"; setUiPh("idle"); setScore(0); setBarV([0,0,0,0,0]);
      pts.forEach(p=>{ p.x=p.sx;p.y=p.sy;p.z=p.sz; p.vx=0;p.vy=0;p.vz=0; p.trX=[];p.trY=[]; });
    };

    /* ── Cleanup (fixes React StrictMode double-invoke) ── */
    return ()=>{
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout); timers.current=[];
      phRef.current="idle";          // reset canvas phase
      /* CRITICAL: also reset React UI state so second mount starts idle */
      setUiPh("idle"); setScore(0); setBarV([0,0,0,0,0]);
    };
  },[]);

  const th = isDark ? DK : LT;
  const BARLABELS=["ATS Compatibility","Keyword Match","Impact Score","Style & Format","ATS Passrate"];
  const BARCOLS=["#00d4aa","#6366f1","#a855f7","#f59e0b","#22c55e"];

  return (
    <div className="relative w-full flex items-center justify-center"
      style={{ minHeight:420, background:"transparent" }}>
      {/* Ambient glow — very subtle in light mode so it doesn't tint the bg */}
      <motion.div animate={{ opacity:[.10,.22,.10],scale:[1,1.08,1] }} transition={{ duration:4.5,repeat:Infinity }}
        className="absolute rounded-full pointer-events-none"
        style={{ width:420,height:420,
          background: isDark
            ? "radial-gradient(circle,rgba(0,212,170,0.18) 0%,rgba(99,102,241,0.12) 40%,transparent 70%)"
            : "radial-gradient(circle,rgba(0,212,170,0.06) 0%,rgba(99,102,241,0.04) 40%,transparent 70%)",
          filter:"blur(80px)" }} />

      {/* Canvas — transparent, edges fade into page bg via mask */}
      <canvas ref={cvRef} className="relative z-10" style={{
        WebkitMaskImage:"radial-gradient(ellipse 94% 90% at 50% 46%, black 55%, transparent 86%)",
        maskImage:"radial-gradient(ellipse 94% 90% at 50% 46%, black 55%, transparent 86%)"
      }}/>

      {/* ── FULL-SCREEN EXPLOSION OVERLAY — dots fly to every corner ── */}
      <AnimatePresence>
        {uiPh==="exploding" && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:9998 }}>
            {explosionParticles.map((p,i)=>(
              <motion.div key={i}
                initial={{ left:"50vw", top:"50vh", opacity:1, scale:1.4 }}
                animate={{ left:`calc(50vw + ${p.tx}px)`, top:`calc(50vh + ${p.ty}px)`, opacity:0, scale:0.2 }}
                transition={{ duration:p.dur, delay:p.delay, ease:[0.2,0.8,0.4,1] }}
                style={{ position:"absolute", width:p.sz*2, height:p.sz*2, borderRadius:"50%",
                  background:p.color, boxShadow:`0 0 ${p.sz*4}px ${p.color}`,
                  transform:"translate(-50%,-50%)" }}/>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── IDLE overlay: scan button ── */}
      <AnimatePresence>
        {uiPh==="idle" && (
          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }}
            className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3 z-20">
            <p className="text-xs font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.45)" }}>Click to watch 7 AI agents analyse a resume live</p>
            <motion.button onClick={()=>expRef.current()}
              whileHover={{ scale:1.06, boxShadow:"0 0 60px rgba(0,212,170,0.70)" }}
              whileTap={{ scale:0.96 }}
              animate={{ boxShadow:["0 0 22px rgba(0,212,170,0.28)","0 0 45px rgba(0,212,170,0.55)","0 0 22px rgba(0,212,170,0.28)"] }}
              transition={{ boxShadow:{ duration:2.2,repeat:Infinity } }}
              className="flex items-center gap-3 px-9 py-4 rounded-2xl font-black text-sm text-white"
              style={{ background:"linear-gradient(135deg,#00d4aa 0%,#6366f1 60%,#a855f7 100%)",
                boxShadow:"0 0 28px rgba(0,212,170,0.35)" }}>
              <Brain size={17}/> ▶ Scan Resume Free — See the Blast
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPLODING overlay: dramatic text ── */}
      <AnimatePresence>
        {uiPh==="exploding" && (
          <motion.div initial={{ opacity:0,scale:.8 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.p animate={{ scale:[1,1.06,1],opacity:[.7,1,.7] }} transition={{ duration:.6,repeat:Infinity }}
              className="text-2xl font-black"
              style={{ color: isDark?"#ffffff":"#0a0f2a", textShadow:`0 0 30px rgba(0,212,170,${isDark?1:0.7})` }}>
              💥 Analysing…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DONE: CTA buttons only — score+ring drawn in canvas above ── */}
      <AnimatePresence>
        {uiPh==="done" && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:.3 }}
            className="absolute bottom-4 left-4 right-4 z-20 flex gap-2 justify-center">
            <button onClick={()=>router.push("/login")}
              className="py-2.5 px-10 rounded-xl font-black text-xs text-white"
              style={{ background:"linear-gradient(135deg,#00d4aa,#6366f1)",
                boxShadow:"0 0 16px rgba(0,212,170,0.30)" }}>
              Analyse My Resume →
            </button>
            <button onClick={()=>resetRef.current()}
              className="p-2.5 rounded-xl transition"
              style={{ background: isDark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",
                border: isDark?"1px solid rgba(255,255,255,0.10)":"1px solid rgba(0,0,0,0.08)",
                color: isDark?"rgba(255,255,255,0.45)":"rgba(15,23,42,0.45)" }}>
              <RefreshCw size={14}/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT SHOWCASE  — 3D tilting dashboard
───────────────────────────────────────────────────────────── */
function ProductShowcase({ sx, sy, isDark }: { sx:ReturnType<typeof useSpring>; sy:ReturnType<typeof useSpring>; isDark:boolean }) {
  const th = isDark ? DK : LT;
  const rX = useTransform(sy,[-400,400],[5,-5]);
  const rY = useTransform(sx,[-600,600],[-7,7]);
  const MATCHED=["React","TypeScript","Node.js","AWS","SQL","REST API"];
  const MISSING=["Python","Docker","Kafka"];
  const BARS=[
    {label:"ATS Compatibility",pct:91,color:"#00d4aa"},
    {label:"Keyword Match",pct:74,color:"#6366f1"},
    {label:"Content Quality",pct:82,color:"#a855f7"},
    {label:"Style & Format",pct:87,color:"#f59e0b"},
    {label:"Impact Score",pct:68,color:"#22c55e"},
  ];
  const cardBg = isDark?"rgba(13,20,40,0.96)":"rgba(255,255,255,0.97)";
  const cardBorder = isDark?"rgba(0,212,170,0.22)":"rgba(0,0,0,0.10)";

  return (
    <div className="relative w-full flex justify-center" style={{ perspective:1400 }}>
      <motion.div animate={{ opacity:[.35,.60,.35],scale:[1,1.07,1] }} transition={{ duration:5,repeat:Infinity }}
        className="absolute rounded-full pointer-events-none"
        style={{ bottom:-60,left:"50%",transform:"translateX(-50%)",width:720,height:200,
          background:`radial-gradient(ellipse,${isDark?"rgba(0,212,170,0.20)":"rgba(0,82,204,0.12)"} 0%,transparent 70%)`,
          filter:"blur(44px)",zIndex:0 }} />
      <motion.div style={{ rotateX:rX,rotateY:rY,transformStyle:"preserve-3d",zIndex:2 }}
        className="relative w-full rounded-2xl overflow-hidden"
        initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.9 }}>
        <div className="w-full rounded-2xl overflow-hidden"
          style={{ background:cardBg,border:`1.5px solid ${cardBorder}`,
            boxShadow:isDark?"0 40px 100px rgba(0,0,0,0.80),0 0 50px rgba(0,212,170,0.06)":"0 40px 100px rgba(0,0,0,0.12),0 0 50px rgba(0,82,204,0.06)" }}>
          {/* Title bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor:th.border,background:th.surface }}>
            <div className="flex gap-1.5">{["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} className="w-3 h-3 rounded-full" style={{ background:c }}/>)}</div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium" style={{ background:th.surface,color:th.text3,border:`1px solid ${th.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                neuralcv.ai — Resume Intelligence Dashboard
              </div>
            </div>
          </div>
          {/* 3 columns */}
          <div className="grid grid-cols-12 gap-0">
            {/* LEFT */}
            <div className="col-span-4 p-5 border-r" style={{ borderColor:th.border }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:"rgba(0,212,170,0.70)" }}>Resume Preview</p>
              {/* Name + title */}
              <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background:"rgba(0,212,170,0.06)",border:"1px solid rgba(0,212,170,0.15)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 font-black" style={{ background:"rgba(0,212,170,0.18)",color:"#00d4aa" }}>JD</div>
                <div>
                  <p className="text-xs font-black" style={{ color:th.text1 }}>James Davidson</p>
                  <p className="text-[10px]" style={{ color:"#00d4aa" }}>Senior Software Engineer</p>
                </div>
              </div>
              {/* Experience */}
              <p className="text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:th.text3 }}>Experience</p>
              {[
                {role:"Software Engineer II",co:"Google · 2021–Present",lines:[72,58]},
                {role:"Frontend Developer",  co:"Stripe · 2019–2021",  lines:[65,50]},
              ].map((job,i)=>(
                <div key={i} className="mb-2.5 pl-2.5" style={{ borderLeft:`2px solid ${i===0?"#00d4aa":"rgba(99,102,241,0.50)"}` }}>
                  <p className="text-[10px] font-black" style={{ color:th.text1 }}>{job.role}</p>
                  <p className="text-[9px] mb-1" style={{ color:th.text3 }}>{job.co}</p>
                  {job.lines.map((w,li)=><div key={li} className="h-1 rounded-full mb-1" style={{ width:`${w}%`,background:isDark?"rgba(255,255,255,0.10)":"rgba(0,0,0,0.08)" }}/>)}
                </div>
              ))}
              {/* Skills */}
              <p className="text-[9px] font-black uppercase tracking-wider mb-1.5" style={{ color:th.text3 }}>Skills</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {["React","TypeScript","Node.js","AWS","SQL","Docker"].map(s=>(
                  <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)",color:th.text2 }}>{s}</span>
                ))}
              </div>
              {/* Education */}
              <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color:th.text3 }}>Education</p>
              <div className="mb-3 pl-2.5" style={{ borderLeft:"2px solid rgba(168,85,247,0.50)" }}>
                <p className="text-[10px] font-black" style={{ color:th.text1 }}>B.S. Computer Science</p>
                <p className="text-[9px]" style={{ color:th.text3 }}>MIT · 2015–2019 · GPA 3.8</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black" style={{ background:"rgba(0,212,170,0.10)",border:"1.5px solid rgba(0,212,170,0.30)",color:"#00d4aa" }}>
                <CheckCircle size={11}/> ATS Parse: 94% — Ready
              </div>
            </div>
            {/* CENTER */}
            <div className="col-span-4 p-5 border-r" style={{ borderColor:th.border }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color:"rgba(99,102,241,0.80)" }}>AI Analysis</p>
              <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl" style={{ background:th.surface,border:`1px solid ${th.border}` }}>
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke={isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"} strokeWidth="7"/>
                    <motion.circle cx="40" cy="40" r="32" fill="none" stroke="#00d4aa" strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*32}`} initial={{ strokeDashoffset:`${2*Math.PI*32}` }}
                      animate={{ strokeDashoffset:`${2*Math.PI*32*.13}` }} transition={{ duration:2,delay:.3,ease:"easeOut" }}
                      transform="rotate(-90 40 40)" style={{ filter:"drop-shadow(0 0 6px rgba(0,212,170,0.8))" }}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black" style={{ color:"#00d4aa",lineHeight:1 }}>87</span>
                    <span className="text-[9px]" style={{ color:th.text3 }}>/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black" style={{ color:th.text1 }}>B+</p>
                  <p className="text-xs" style={{ color:th.text3 }}>Above average</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background:"rgba(0,212,170,0.12)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.25)" }}>
                    <TrendingUp size={9}/> +12 pts achievable
                  </div>
                </div>
              </div>
              {BARS.map(b=>(
                <div key={b.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-bold" style={{ color:th.text2 }}>{b.label}</span>
                    <span className="text-[11px] font-black" style={{ color:b.color }}>{b.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full mb-2.5" style={{ background:isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background:b.color }}
                      initial={{ width:0 }} whileInView={{ width:`${b.pct}%` }} viewport={{ once:true }} transition={{ duration:1.2,delay:.4 }}/>
                  </div>
                </div>
              ))}
            </div>
            {/* RIGHT */}
            <div className="col-span-4 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color:"rgba(168,85,247,0.80)" }}>Keywords & Actions</p>
              <div className="mb-3">
                <p className="text-[10px] font-bold mb-2" style={{ color:"rgba(0,212,170,0.85)" }}>✓ Matched ({MATCHED.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {MATCHED.map(k=><span key={k} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background:"rgba(0,212,170,0.10)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.22)" }}>✓ {k}</span>)}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-bold mb-2" style={{ color:"rgba(239,68,68,0.85)" }}>✗ Missing ({MISSING.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {MISSING.map(k=><span key={k} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background:"rgba(239,68,68,0.10)",color:"#f87171",border:"1px solid rgba(239,68,68,0.20)" }}>✗ {k}</span>)}
                </div>
              </div>
              {[{text:"Add Python to skills",c:"#00d4aa"},{text:"Quantify 3 achievements",c:"#6366f1"},{text:"Add Docker experience",c:"#f59e0b"}].map((a,i)=>(
                <motion.div key={i} initial={{ opacity:0,x:10 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }} transition={{ delay:.5+i*.1 }}
                  className="flex items-start gap-2 p-2 rounded-lg text-[10px] mb-1.5"
                  style={{ background:th.surface,border:`1px solid ${th.border}` }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{ background:`${a.c}20`,border:`1px solid ${a.c}50` }}/>
                  <span style={{ color:th.text2 }}>{a.text}</span>
                </motion.div>
              ))}
              <div className="mt-3 p-3 rounded-xl" style={{ background:"rgba(99,102,241,0.08)",border:"1.5px solid rgba(99,102,241,0.22)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <PenLine size={10} style={{ color:"#6366f1" }}/>
                  <span className="text-[10px] font-black" style={{ color:"#6366f1" }}>AI Rewrite</span>
                </div>
                <p className="text-[9px] leading-relaxed" style={{ color:th.text3 }}>
                  <span style={{ color:"rgba(239,68,68,0.75)",textDecoration:"line-through" }}>Worked on data scripts</span>
                  {" → "}
                  <span style={{ color:"rgba(0,212,170,0.85)" }}>Built ETL pipelines processing 2M+ records daily</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BEFORE / AFTER SLIDER
───────────────────────────────────────────────────────────── */
function BeforeAfterSection({ isDark }: { isDark:boolean }) {
  const th = isDark ? DK : LT;
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const update = useCallback((cx:number)=>{
    const el=containerRef.current; if(!el) return;
    const r=el.getBoundingClientRect();
    setPos(Math.min(Math.max(((cx-r.left)/r.width)*100,5),95));
  },[]);
  useEffect(()=>{
    const onUp=()=>{dragging.current=false;};
    const onMove=(e:MouseEvent)=>{ if(dragging.current) update(e.clientX); };
    window.addEventListener("mouseup",onUp); window.addEventListener("mousemove",onMove);
    return ()=>{ window.removeEventListener("mouseup",onUp); window.removeEventListener("mousemove",onMove); };
  },[update]);
  return (
    <section className="w-full px-4 lg:px-8 pt-14 pb-16" style={{ background:isDark?"linear-gradient(180deg,#080d1e,#050810)":th.bg2 }}>
      <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-8">
        <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color:"#f59e0b" }}>Real transformation</p>
        <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color:th.text1 }}>
          See what <span style={{ background:"linear-gradient(135deg,#00d4aa,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>NeuralCV changes</span>
        </h2>
        <p className="mt-4 text-base font-medium max-w-xl mx-auto" style={{ color:th.text3 }}>Drag the divider to compare before &amp; after AI rewrite.</p>
      </motion.div>
      <motion.div ref={containerRef} initial={{ opacity:0,scale:.97 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }}
        className="relative w-full rounded-2xl overflow-hidden select-none mx-auto"
        style={{ maxWidth:900,border:`2px solid rgba(0,212,170,0.50)`,boxShadow:"0 0 0 1px rgba(0,212,170,0.18), 0 24px 60px rgba(0,0,0,0.40)",cursor:"ew-resize" }}
        onMouseDown={e=>{dragging.current=true;update(e.clientX);}}
        onTouchMove={e=>update(e.touches[0].clientX)} onTouchStart={e=>update(e.touches[0].clientX)}>
        {/* BEFORE — base layer, determines box height */}
        <div className="w-full px-8 pt-5 pb-5 flex flex-col gap-0" style={{ background:isDark?"#110a0a":"#fff5f5", fontFamily:"'Courier New',monospace", fontSize:11.5, lineHeight:1.6, color:isDark?"rgba(255,200,200,0.70)":"rgba(80,0,0,0.60)" }}>
          {/* header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-0.5 rounded-full text-xs font-black" style={{ background:"rgba(239,68,68,0.22)",color:"#f87171",border:"1px solid rgba(239,68,68,0.45)" }}>✗ BEFORE</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(239,68,68,0.12)",color:"#f87171",border:"1px solid rgba(239,68,68,0.30)" }}>ATS 41/100</span>
            <span className="text-xs font-semibold ml-auto" style={{ color:isDark?"rgba(255,120,120,0.50)":"rgba(180,40,40,0.40)" }}>❌ Likely rejected by ATS</span>
          </div>
          {/* name */}
          <p className="font-bold text-sm mb-0" style={{ color:isDark?"rgba(255,180,180,0.90)":"rgba(100,20,20,0.85)" }}>John Smith — Software Developer</p>
          <p className="text-xs mb-2.5" style={{ color:isDark?"rgba(255,150,150,0.45)":"rgba(120,40,40,0.45)" }}>john.smith@gmail.com | +1 234 567 8900</p>
          {/* exp */}
          <div className="mb-0.5 font-bold text-[10px] uppercase tracking-widest" style={{ color:isDark?"rgba(255,100,100,0.55)":"rgba(160,40,40,0.50)" }}>Experience</div>
          <p className="mb-0.5 font-semibold text-xs" style={{ color:isDark?"rgba(255,180,180,0.80)":"rgba(100,20,20,0.75)" }}>Software Developer — XYZ Corp (2019 – Present)</p>
          <p className="text-xs">• Worked on various projects and did coding stuff.</p>
          <p className="text-xs mb-2">• Made improvements to the system when required.</p>
          <p className="font-semibold text-xs mb-0.5" style={{ color:isDark?"rgba(255,180,180,0.70)":"rgba(100,20,20,0.65)" }}>Junior Dev — StartupABC (2017 – 2019)</p>
          <p className="text-xs">• Helped with tasks and attended meetings regularly.</p>
          <p className="text-xs mb-2.5">• Did some database work and fixed bugs sometimes.</p>
          {/* skills */}
          <div className="mb-0.5 font-bold text-[10px] uppercase tracking-widest" style={{ color:isDark?"rgba(255,100,100,0.55)":"rgba(160,40,40,0.50)" }}>Skills</div>
          <p className="text-xs mb-3">Java, Python, some web stuff, databases, agile, communication</p>
          {/* badges */}
          <div className="flex flex-wrap gap-1.5 pt-2.5" style={{ borderTop:`1px solid rgba(239,68,68,0.20)` }}>
            {["Missing keywords","Weak verbs","No metrics","Poor formatting"].map(w=>(
              <span key={w} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(239,68,68,0.14)",color:"#f87171",border:"1px solid rgba(239,68,68,0.28)" }}>⚠ {w}</span>
            ))}
          </div>
        </div>
        {/* AFTER — absolute overlay clipped to left */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath:`inset(0 ${100-pos}% 0 0)` }}>
          <div className="w-full h-full px-8 pt-5 pb-5 flex flex-col" style={{ background:isDark?"#051510":"#f0fff8", fontFamily:"'Courier New',monospace", fontSize:11.5, lineHeight:1.6, color:isDark?"rgba(200,255,240,0.75)":"rgba(0,60,40,0.70)" }}>
            {/* header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-0.5 rounded-full text-xs font-black" style={{ background:"rgba(0,212,170,0.22)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.45)" }}>✓ AFTER NeuralCV</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(0,212,170,0.12)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.30)" }}>ATS 91/100</span>
              <span className="text-xs font-semibold ml-auto" style={{ color:"rgba(0,212,170,0.65)" }}>✅ Top 5% of applicants</span>
            </div>
            {/* name */}
            <p className="font-bold text-sm mb-0" style={{ color:isDark?"#e0fff5":"#0F4A35" }}>John Smith — Senior Full-Stack Engineer</p>
            <p className="text-xs mb-2.5" style={{ color:isDark?"rgba(0,212,170,0.60)":"rgba(0,120,90,0.55)" }}>john.smith@gmail.com | linkedin.com/in/johnsmith | github.com/jsmith</p>
            {/* exp */}
            <div className="mb-0.5 font-bold text-[10px] uppercase tracking-widest" style={{ color:isDark?"rgba(0,212,170,0.70)":"rgba(0,120,90,0.65)" }}>Experience</div>
            <p className="mb-0.5 font-semibold text-xs" style={{ color:isDark?"rgba(180,255,235,0.90)":"#0F4A35" }}>Senior Full-Stack Engineer — XYZ Corp (2019 – Present)</p>
            <p className="text-xs">• Engineered distributed microservices handling <strong>2M+ req/day</strong> on AWS.</p>
            <p className="text-xs mb-2">• Reduced infrastructure costs by <strong>34%</strong> and cut deployment time by <strong>60%</strong>.</p>
            <p className="font-semibold text-xs mb-0.5" style={{ color:isDark?"rgba(160,255,220,0.80)":"rgba(0,80,55,0.75)" }}>Full-Stack Developer — StartupABC (2017 – 2019)</p>
            <p className="text-xs">• Delivered 3 product features used by <strong>12,000+ users</strong> within 6 months.</p>
            <p className="text-xs mb-2.5">• Optimised PostgreSQL queries reducing load time by <strong>45%</strong>.</p>
            {/* skills */}
            <div className="mb-1 font-bold text-[10px] uppercase tracking-widest" style={{ color:isDark?"rgba(0,212,170,0.70)":"rgba(0,120,90,0.65)" }}>Skills</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {["Java","Python","React","PostgreSQL","AWS","Docker","REST APIs","CI/CD","Kubernetes","Redis"].map(s=>(
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(0,212,170,0.12)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.28)" }}>{s}</span>
              ))}
            </div>
            {/* badges */}
            <div className="flex flex-wrap gap-1.5 pt-2.5 mt-auto" style={{ borderTop:`1px solid rgba(0,212,170,0.20)` }}>
              {["34 keywords matched","Strong action verbs","Quantified impact","ATS-optimised"].map(w=>(
                <span key={w} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:"rgba(0,212,170,0.14)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.28)" }}>✓ {w}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Drag handle */}
        <div className="absolute inset-y-0 flex items-center justify-center pointer-events-none" style={{ left:`${pos}%`,transform:"translateX(-50%)",zIndex:20 }}>
          <div className="w-px h-full" style={{ background:"linear-gradient(180deg,transparent,rgba(0,212,170,.80),rgba(99,102,241,.80),transparent)" }}/>
          <div className="absolute w-10 h-10 rounded-full flex items-center justify-center cursor-ew-resize pointer-events-auto"
            style={{ background:"rgba(13,20,40,.95)",border:"2px solid rgba(0,212,170,.80)",boxShadow:"0 0 20px rgba(0,212,170,.50)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────────── */
const TESTIMONIALS=[
  {name:"Arjun Sharma",  role:"Got offer at Google",  avatar:"🧑‍💻",quote:"NeuralCV flagged 9 missing keywords. Added them in 20 min. Google called in 3 days.",stars:5,score:"34→91"},
  {name:"Priya Mehta",   role:"Placed at Amazon",     avatar:"👩‍💼",quote:"Had a 39/100 ATS score. The rewrite tool turned every bullet into a quantified win.",stars:5,score:"39→89"},
  {name:"David Chen",    role:"Hired at McKinsey",    avatar:"🧑‍🎓",quote:"Interview prep gave me 6 questions based on my gaps. 4 were asked in the real interview.",stars:5,score:"52→94"},
  {name:"Sara Williams", role:"Joined Stripe",        avatar:"👩‍🔬",quote:"Went from no callbacks to 4 interviews in 2 weeks. ATS score alone was worth it.",stars:5,score:"48→92"},
  {name:"Rahul Gupta",   role:"Senior Eng at Meta",   avatar:"👨‍🔧",quote:"Found bias in my wording, weak verbs, and 3 formatting issues Workday would reject instantly.",stars:5,score:"61→96"},
  {name:"Aiko Tanaka",   role:"Joined Shopify",       avatar:"👩‍💻",quote:"Best free tool I've found. Keyword gap report is worth 10x what they don't charge.",stars:5,score:"44→90"},
];
function TestimonialsSection({ isDark }: { isDark:boolean }) {
  const th = isDark ? DK : LT;
  return (
    <section className="w-full py-24 overflow-hidden" style={{ background:isDark?th.bg:th.bg2 }}>
      <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-12 px-6">
        <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color:"#a855f7" }}>Real results</p>
        <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color:th.text1 }}>
          Hired at companies{" "}
          <span style={{ background:"linear-gradient(135deg,#a855f7,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>you dream about.</span>
        </h2>
      </motion.div>
      {[TESTIMONIALS.slice(0,3),TESTIMONIALS.slice(3)].map((row,ri)=>(
        <div key={ri} className="overflow-hidden mb-5">
          <motion.div className="flex gap-5" style={{ width:"max-content" }}
            animate={{ x:ri===0?["0%","-50%"]:["-50%","0%"] }}
            transition={{ duration:30,repeat:Infinity,ease:"linear" }}>
            {[...row,...row].map((t,i)=>(
              <div key={i} className="w-80 flex-shrink-0 p-6 rounded-2xl"
                style={{ background:isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.90)",
                  border:`1px solid ${th.border}`,backdropFilter:"blur(12px)",
                  boxShadow:isDark?"none":"0 4px 20px rgba(0,0,0,0.06)" }}>
                <Quote size={18} style={{ color:"rgba(99,102,241,0.35)",marginBottom:8 }}/>
                <p className="text-sm leading-relaxed mb-4" style={{ color:th.text2 }}>&quot;{t.quote}&quot;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background:th.surface }}>{t.avatar}</div>
                    <div>
                      <p className="text-sm font-black" style={{ color:th.text1 }}>{t.name}</p>
                      <p className="text-xs font-semibold" style={{ color:"#00d4aa" }}>{t.role}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl text-xs font-black" style={{ background:"rgba(0,212,170,0.10)",color:"#00d4aa",border:"1px solid rgba(0,212,170,0.22)" }}>{t.score}</span>
                </div>
                <div className="flex gap-0.5 mt-3">{Array(t.stars).fill(0).map((_,si)=><Star key={si} size={11} fill="#fbbf24" style={{ color:"#fbbf24" }}/>)}</div>
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────────────────────── */
const FEATURES=[
  {icon:Brain,        title:"7-Agent AI Pipeline", desc:"Extractor, Scorer, Gap Analyser, Coach, Simulator, Bias Scanner, Integrity Check — all parallel in under 15 seconds.", color:"#00d4aa"},
  {icon:Edit3,        title:"Resume Builder",      desc:"30+ ATS-optimised templates. Click any element to edit inline — no form, no friction. One-click PDF export.",          color:"#6366f1"},
  {icon:MessageSquare,title:"Career AI Coach",     desc:"A chatbot that knows your exact resume, score and gaps — personalised interview and career advice instantly.",          color:"#a855f7"},
  {icon:Target,       title:"ATS Intelligence",    desc:"Reverse-engineered 20+ ATS systems. Know exactly what Google, Amazon and McKinsey's software sees first.",             color:"#f59e0b"},
  {icon:BarChart2,    title:"Keyword Gap Analysis",desc:"Side-by-side matched vs missing keywords with one-click rewrite suggestions that add the exact phrases employers need.", color:"#22c55e"},
  {icon:Award,        title:"Interview Prep",      desc:"6 targeted questions based on your specific gaps — plus why they ask it and how to answer with your background.",       color:"#f43f5e"},
];

/* ─────────────────────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router   = useRouter();
  const { isDark, toggle } = useTheme();
  const th       = isDark ? DK : LT;
  const mouseX   = useMotionValue(0);
  const mouseY   = useMotionValue(0);
  const sx       = useSpring(mouseX, { stiffness:50, damping:22 });
  const sy       = useSpring(mouseY, { stiffness:50, damping:22 });
  const [cursor, setCursor] = useState({ x:-1000, y:-1000 });

  const onMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - window.innerWidth/2);
    mouseY.set(e.clientY - window.innerHeight/2);
    setCursor({ x:e.clientX, y:e.clientY });
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden transition-colors duration-500"
      style={{ background:th.bg }} onMouseMove={onMouseMove}>
      <SpotlightCursor x={cursor.x} y={cursor.y} isDark={isDark}/>

      {/* ═══ NAVBAR ═══ */}
      <motion.nav initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ duration:.6 }}
        className="sticky top-0 w-full px-6 lg:px-14 py-4 flex items-center justify-between"
        style={{ zIndex:50,background:th.navBg,backdropFilter:"blur(24px)",borderBottom:`1px solid ${th.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background:`${th.accent}22`,border:`1px solid ${th.accent}44`,boxShadow:`0 0 16px ${th.accentGlow}` }}>
            <Sparkles size={18} style={{ color:th.accent }}/>
          </div>
          <span className="font-black text-2xl tracking-tight" style={{ color:th.text1 }}>NeuralCV</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Features","How It Works","Resume Builder","Pricing"].map(l=>(
            <button key={l} className="text-sm font-semibold transition-all hover:opacity-100" style={{ color:th.text3 }}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-0.5"
            style={{ background:isDark?"linear-gradient(135deg,#0d1420,#1a2540)":"linear-gradient(135deg,#e8f4fd,#dbeeff)",
              border:isDark?"1px solid rgba(0,212,170,0.3)":"1px solid rgba(0,82,204,0.25)" }}>
            <motion.div animate={{ x:isDark?0:28 }} transition={{ type:"spring",stiffness:500,damping:30 }}
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
              style={{ background:isDark?"linear-gradient(135deg,#1e3a5f,#0d1420)":"linear-gradient(135deg,#fff,#f0f7ff)" }}>
              {isDark?<Moon size={12} style={{ color:"#00d4aa" }}/>:<Sun size={12} style={{ color:"#F6851B" }}/>}
            </motion.div>
          </button>
          <button onClick={()=>router.push("/login")}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{ color:th.text2,border:`1px solid ${th.border}`,background:th.surface }}>
            Sign In
          </button>
          <motion.button onClick={()=>router.push("/login")}
            whileHover={{ scale:1.05,boxShadow:`0 0 28px ${th.accentGlow}` }} whileTap={{ scale:.97 }}
            className="text-sm font-black px-6 py-2.5 rounded-xl flex items-center gap-2 text-white"
            style={{ background:"linear-gradient(135deg,#00d4aa,#6366f1)",boxShadow:`0 0 18px ${th.accentGlow}` }}>
            <Sparkles size={13}/> Get Started Free
          </motion.button>
        </div>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section className="relative w-full overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex:0 }}>
          <motion.div animate={{ opacity:[.12,.22,.12],scale:[1,1.10,1] }} transition={{ duration:9,repeat:Infinity }}
            className="absolute rounded-full"
            style={{ top:"-20%",left:"-10%",width:"55vw",height:"55vw",
              background:`radial-gradient(circle,${isDark?"rgba(0,212,170,0.50)":"rgba(0,212,170,0.20)"} 0%,transparent 65%)`,filter:"blur(90px)" }}/>
          <motion.div animate={{ opacity:[.10,.18,.10],scale:[1,1.08,1] }} transition={{ duration:11,repeat:Infinity,delay:3 }}
            className="absolute rounded-full"
            style={{ bottom:"-15%",right:"-10%",width:"50vw",height:"50vw",
              background:`radial-gradient(circle,${isDark?"rgba(99,102,241,0.50)":"rgba(99,102,241,0.15)"} 0%,transparent 65%)`,filter:"blur(100px)" }}/>
        </div>

        <div className="relative w-full flex flex-col lg:flex-row items-center justify-between gap-10 px-4 lg:px-8 py-16 lg:py-20"
          style={{ zIndex:5 }}>
          {/* ── LEFT: headline + CTA ── */}
          <div className="flex-1 flex flex-col items-start max-w-xl">
            <motion.div initial={{ opacity:0,y:-16 }} animate={{ opacity:1,y:0 }} transition={{ delay:.2 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8 text-sm font-bold"
              style={{ background:`${th.accent}14`,border:`1px solid ${th.accent}38`,color:th.accent,backdropFilter:"blur(12px)" }}>
              <motion.span animate={{ scale:[1,1.5,1] }} transition={{ duration:2,repeat:Infinity }} className="w-2 h-2 rounded-full bg-current"/>
              7 AI Agents · Free Forever · No Signup
            </motion.div>
            <motion.div initial={{ opacity:0,y:32 }} animate={{ opacity:1,y:0 }} transition={{ delay:.3,duration:.9,ease:[.22,1,.36,1] }}
              className="font-black tracking-tight leading-[1.05] mb-6"
              style={{ fontSize:"clamp(2.4rem,4.2vw,4rem)" }}>
              <div style={{ color:th.text1 }} className="mb-1">
                Stop Getting{" "}
                <span style={{ backgroundImage:"linear-gradient(135deg,#00d4aa 0%,#6366f1 50%,#a855f7 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>Rejected.</span>
              </div>
              <div style={{ color:th.text1 }}>
                Land as a{" "}<TypewriterRole color={th.accent2}/>
              </div>
            </motion.div>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.5 }}
              className="text-base lg:text-lg font-medium leading-relaxed mb-9"
              style={{ color:th.text2 }}>
              Upload your resume. Our <strong style={{ color:th.accent }}>7 AI agents</strong> deliver an ATS score, keyword gaps, rewrites &amp; interview prep in under{" "}
              <strong style={{ color:th.accent2 }}>15 seconds</strong>. Completely free.
            </motion.p>
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:.6 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-8 w-full">
              <motion.button onClick={()=>router.push("/login")}
                whileHover={{ scale:1.05,boxShadow:"0 0 50px rgba(0,212,170,0.50),0 8px 40px rgba(0,0,0,0.40)" }} whileTap={{ scale:.97 }}
                className="px-9 py-4 rounded-2xl font-black text-base flex items-center gap-3 group text-white"
                style={{ background:"linear-gradient(135deg,#00d4aa,#6366f1)",boxShadow:"0 0 28px rgba(0,212,170,0.28)" }}>
                <Upload size={17}/> Analyse My Resume — Free
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform"/>
              </motion.button>
              <motion.button onClick={()=>router.push("/dashboard")}
                whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                className="px-7 py-4 rounded-2xl text-base font-semibold flex items-center gap-2 transition-all"
                style={{ color:th.text2,border:`1px solid ${th.border}`,background:th.surface,backdropFilter:"blur(14px)" }}>
                Try Demo →
              </motion.button>
            </motion.div>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.75 }}
              className="flex flex-wrap items-center gap-6">
              {[{icon:Users,v:"50k+",l:"Resumes"},{icon:TrendingUp,v:"87%",l:"Score boost"},{icon:Star,v:"4.9★",l:"Rating"},{icon:Clock,v:"<15s",l:"Speed"}].map(({icon:Ic,v,l})=>(
                <div key={l} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color:th.text3 }}>
                  <Ic size={12} style={{ color:th.accent }}/> <strong style={{ color:th.text2 }}>{v}</strong> {l}
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: 3D Globe Explosion ── */}
          <motion.div initial={{ opacity:0,x:50 }} animate={{ opacity:1,x:0 }} transition={{ delay:.5,duration:1,ease:[.22,1,.36,1] }}
            className="flex-1 w-full flex items-center justify-center">
            <GlobeExplosion isDark={isDark}/>
          </motion.div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="w-full overflow-hidden py-5 border-y" style={{ borderColor:th.border,background:th.surface }}>
        <motion.div className="flex gap-14 whitespace-nowrap" animate={{ x:[0,"-50%"] }} transition={{ duration:30,repeat:Infinity,ease:"linear" }}>
          {[...Array(2)].map((_,r)=>(
            <div key={r} className="flex gap-14 items-center shrink-0">
              {["ATS Score /100","Grade A–F","20+ AI Checks","PDF & DOCX","Radar Chart","Interview Prep","Keyword Gap","7-Day Plan","Zero Data Stored","Free Forever"].map((item,i)=>(
                <span key={i} className="flex items-center gap-2.5 text-sm font-bold tracking-wide" style={{ color:th.text3 }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background:["#00d4aa","#6366f1","#a855f7","#f59e0b","#22c55e"][i%5] }}/>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ═══ DASHBOARD SHOWCASE ═══ */}
      <section className="w-full px-4 lg:px-8 py-24" style={{ background:isDark?"linear-gradient(180deg,#050810,#080d1e)":th.bg }}>
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color:th.accent }}>See every insight</p>
          <h2 className="text-3xl lg:text-4xl font-black" style={{ color:th.text1 }}>
            Your complete{" "}
            <span style={{ backgroundImage:"linear-gradient(135deg,#00d4aa,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>intelligence dashboard</span>
          </h2>
        </motion.div>
        <ProductShowcase sx={sx} sy={sy} isDark={isDark}/>

        {/* ── Stats strip below dashboard ── */}
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { val:"50k+",  label:"Resumes Analysed",   color:"#00d4aa", icon:"📄" },
            { val:"87%",   label:"Avg. Score Boost",    color:"#6366f1", icon:"📈" },
            { val:"4.9★",  label:"User Rating",         color:"#f59e0b", icon:"⭐" },
            { val:"<5s",   label:"Analysis Speed",      color:"#a855f7", icon:"⚡" },
          ].map((s,i)=>(
            <motion.div key={i} initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:.35+i*.07 }}
              className="flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl text-center"
              style={{ background:isDark?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.80)",
                border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.07)"}`,
                backdropFilter:"blur(12px)" }}>
              <span className="text-xl">{s.icon}</span>
              <span className="text-2xl font-black" style={{ color:s.color }}>{s.val}</span>
              <span className="text-xs font-semibold" style={{ color:isDark?"rgba(255,255,255,0.45)":"rgba(15,23,42,0.50)" }}>{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Feature tag strip ── */}
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:.5 }}
          className="flex flex-wrap justify-center gap-2.5 mt-6">
          {["ATS Score /100","Grade A–F","20+ AI Checks","Keyword Gap","Interview Prep","AI Rewrite","7-Day Plan","PDF & DOCX","Zero Data Stored"].map(tag=>(
            <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background:isDark?"rgba(0,212,170,0.08)":"rgba(0,212,170,0.10)",
                color:isDark?"rgba(0,212,170,0.80)":"rgba(0,130,100,0.90)",
                border:`1px solid ${isDark?"rgba(0,212,170,0.18)":"rgba(0,212,170,0.25)"}` }}>
              {tag}
            </span>
          ))}
        </motion.div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="w-full px-4 lg:px-8 py-24" style={{ background:isDark?th.bg:th.bg2 }}>
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color:th.accent }}>What&apos;s inside</p>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color:th.text1 }}>
            Everything you need to{" "}
            <span style={{ backgroundImage:"linear-gradient(135deg,#00d4aa,#6366f1,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>get hired faster.</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({icon:Icon,title,desc,color},i)=>(
            <motion.div key={i} initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.08,duration:.55 }}
              style={{ perspective:900 }}>
              <motion.div
                whileHover={{ rotateX:-5,rotateY:6,scale:1.03,borderColor:`${color}55`,
                  boxShadow:`0 28px 64px rgba(0,0,0,0.15),0 0 32px ${color}22` }}
                transition={{ type:"spring",stiffness:260,damping:20 }}
                className="p-7 rounded-2xl h-full cursor-default"
                style={{ background:th.featureCard,border:`1px solid ${th.featureBorder}`,
                  boxShadow:isDark?"none":"0 2px 12px rgba(0,0,0,0.06)",transformStyle:"preserve-3d" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background:`${color}16`,border:`1.5px solid ${color}35`,boxShadow:`0 0 16px ${color}22` }}>
                  <Icon size={22} style={{ color }}/>
                </div>
                <h3 className="text-lg font-black mb-3" style={{ color:th.text1 }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:th.text3 }}>{desc}</p>
                <button onClick={()=>router.push("/login")} className="mt-5 flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-2.5" style={{ color }}>
                  Get started <ArrowRight size={13}/>
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="w-full px-4 lg:px-8 py-24" style={{ background:isDark?"linear-gradient(180deg,#050810,#080d1e)":th.bg }}>
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color:th.accent2 }}>How it works</p>
          <h2 className="text-4xl lg:text-5xl font-black" style={{ color:th.text1 }}>
            Four steps.{" "}
            <span style={{ backgroundImage:"linear-gradient(135deg,#6366f1,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>One hired candidate.</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            {n:"01",title:"Upload Resume",desc:"PDF, DOCX, or paste. Any template works.",   icon:FileText, color:"#00d4aa"},
            {n:"02",title:"AI Analyses",  desc:"7 agents fire in parallel — done in 15s.",   icon:Brain,    color:"#6366f1"},
            {n:"03",title:"Get Score",    desc:"ATS score, grade, radar, keywords, rewrites.",icon:Target,   color:"#a855f7"},
            {n:"04",title:"Fix & Export", desc:"Edit templates, export PDF. Apply with confidence.",icon:Award,color:"#f59e0b"},
          ].map(({n,title,desc,icon:Icon,color},i)=>(
            <motion.div key={i} initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*.12 }}
              className="relative text-center">
              {i<3&&<div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-[-calc(50%-2.5rem)] h-px" style={{ background:`linear-gradient(90deg,${color}60,${color}10)` }}/>}
              <motion.div whileHover={{ scale:1.08,boxShadow:`0 0 28px ${color}40` }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all"
                style={{ background:`${color}16`,border:`1.5px solid ${color}38`,boxShadow:`0 0 16px ${color}20` }}>
                <Icon size={24} style={{ color }}/>
              </motion.div>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color }}>Step {n}</div>
              <h3 className="text-lg font-black mb-2" style={{ color:th.text1 }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:th.text3 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ BEFORE / AFTER ═══ */}
      <BeforeAfterSection isDark={isDark}/>

      {/* ═══ STATS ═══ */}
      <section className="w-full py-24 px-4 lg:px-8" style={{ background:`${th.accent}07`,borderTop:`1px solid ${th.accent}14`,borderBottom:`1px solid ${th.accent}14` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[{t:50000,s:"+",l:"Resumes analysed",c:"#00d4aa"},{t:87,s:"%",l:"Avg score boost",c:"#6366f1"},{t:20,s:"+",l:"AI-powered checks",c:"#a855f7"},{t:15,s:"s",l:"Full analysis speed",c:"#f59e0b"}].map(({t,s,l,c},i)=>(
            <motion.div key={i} initial={{ opacity:0,scale:.88 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ delay:i*.1 }}>
              <div className="text-4xl lg:text-5xl font-black mb-2" style={{ color:c }}>
                {t===15&&"<"}<CountUp target={t} suffix={s}/>
              </div>
              <div className="text-sm font-semibold" style={{ color:th.text3 }}>{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <TestimonialsSection isDark={isDark}/>

      {/* ═══ CTA ═══ */}
      <section className="w-full px-4 lg:px-8 py-16" style={{ background:isDark?th.bg:th.bg2 }}>
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          className="relative w-full rounded-3xl overflow-hidden px-8 py-20 text-center"
          style={{ background:"linear-gradient(135deg,#0f0c29 0%,#1a0545 25%,#0d1b4b 55%,#0f2027 100%)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {([{c:"rgba(99,102,241,0.55)",top:"-30%",left:"-10%",dur:8},{c:"rgba(139,92,246,0.55)",bottom:"-30%",right:"-10%",dur:10,delay:2},{c:"rgba(14,165,233,0.40)",top:"20%",right:"25%",dur:7,delay:4}] as {c:string;top?:string;bottom?:string;left?:string;right?:string;dur:number;delay?:number}[]).map((o,i)=>(
              <motion.div key={i} animate={{ scale:[1,1.15,1],opacity:[.45,.70,.45] }} transition={{ duration:o.dur,repeat:Infinity,delay:o.delay||0 }}
                className="absolute w-3/4 h-3/4 rounded-full"
                style={{ background:`radial-gradient(ellipse,${o.c} 0%,transparent 65%)`,filter:"blur(70px)",
                  top:o.top,bottom:o.bottom,left:o.left,right:o.right }}/>
            ))}
          </div>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.95) 40%,rgba(99,102,241,1) 60%,transparent)" }}/>
          <div className="relative z-10">
            <motion.div initial={{ scale:.8,opacity:0 }} whileInView={{ scale:1,opacity:1 }} viewport={{ once:true }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
              style={{ background:"rgba(99,102,241,0.25)",border:"1.5px solid rgba(167,139,250,0.55)",boxShadow:"0 0 36px rgba(99,102,241,0.45)" }}>
              <Sparkles size={28} style={{ color:"#a78bfa" }}/>
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Your dream job is<br/>
              <span style={{ backgroundImage:"linear-gradient(90deg,#a78bfa,#38bdf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>one resume away.</span>
            </h2>
            <p className="text-lg lg:text-xl font-medium mb-10 max-w-2xl mx-auto" style={{ color:"rgba(255,255,255,0.58)" }}>
              Join 50,000+ job seekers who beat ATS systems and landed interviews at top companies — completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button onClick={()=>router.push("/login")}
                whileHover={{ scale:1.06,boxShadow:"0 0 70px rgba(167,139,250,0.70)" }} whileTap={{ scale:.96 }}
                className="px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 text-white"
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)",boxShadow:"0 0 40px rgba(99,102,241,0.60)" }}>
                <Sparkles size={21}/> Start Free — No Signup
              </motion.button>
              <motion.button onClick={()=>router.push("/editor")}
                whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
                className="px-10 py-5 rounded-2xl font-semibold text-base flex items-center gap-2 transition-all"
                style={{ color:"rgba(255,255,255,0.75)",border:"1px solid rgba(255,255,255,0.18)",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(14px)" }}>
                <Edit3 size={17}/> Build Resume →
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full px-4 lg:px-8 py-12" style={{ borderTop:`1px solid ${th.border}`,background:isDark?th.bg:th.bg2 }}>
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${th.accent}20`,border:`1px solid ${th.accent}35` }}>
              <Sparkles size={14} style={{ color:th.accent }}/>
            </div>
            <span className="font-black text-xl" style={{ color:th.text1 }}>NeuralCV</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold" style={{ color:th.text3 }}>
            {["Features","How It Works","Privacy","Terms","Contact"].map(l=>(
              <button key={l} className="hover:opacity-80 transition-opacity">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color:th.text3 }}>
            <Lock size={12} style={{ color:th.accent }}/>
            <span>Zero data stored. <strong style={{ color:th.text2 }}>Free forever.</strong></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
