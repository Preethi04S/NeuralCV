"use client";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Play, Code2, FileText, Wrench, Loader2 } from "lucide-react";

interface Course {
  title: string; platform: string; url: string;
  cost: string; duration: string; type: string; description?: string;
}
interface SkillCourse { skill: string; courses: Course[]; }
interface Props { skillCourses: SkillCourse[]; loading?: boolean; isDark?: boolean; }

const typeIcon = { video: Play, interactive: Code2, documentation: FileText, project: Wrench };

function CourseCard({ course, index, isDark }: { course: Course; index: number; isDark: boolean }) {
  const Icon = typeIcon[course.type as keyof typeof typeIcon] ?? BookOpen;
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent = isDark ? "#a855f7" : "#5C21A1";
  const surface = isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF";
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  const costConfig: Record<string, { color: string; bg: string; border: string }> = {
    "Free":      { color: isDark ? "#22c55e" : "#1A6B3C", bg: isDark ? "rgba(34,197,94,0.1)"  : "#D1F7C4", border: isDark ? "rgba(34,197,94,0.25)"  : "#A8EDAA" },
    "Free tier": { color: isDark ? "#f59e0b" : "#F6851B", bg: isDark ? "rgba(245,158,11,0.1)" : "#FEF3C7", border: isDark ? "rgba(245,158,11,0.25)" : "#FCD34D" },
    "Paid":      { color: t3,                             bg: isDark ? "rgba(148,163,184,0.08)" : "#F3F4F6", border: isDark ? "rgba(148,163,184,0.2)" : "#E5E7EB" },
  };
  const cc = costConfig[course.cost] ?? costConfig.Paid;

  return (
    <motion.a href={course.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}
      className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 group"
      style={{ background: surface, border: `1px solid ${border}`, boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.05)" }}
      whileHover={{ scale: 1.01 }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}12`, border: `1px solid ${accent}22` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold leading-tight" style={{ color: t1 }}>{course.title}</p>
          <ExternalLink size={12} style={{ color: t3 }} className="shrink-0 mt-0.5 group-hover:opacity-100 opacity-50 transition-opacity" />
        </div>
        <p className="text-xs mb-2" style={{ color: t3 }}>{course.platform} · {course.duration}</p>
        {course.description && <p className="text-xs leading-relaxed mb-2" style={{ color: t2 }}>{course.description}</p>}
        <div className="flex gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cc.bg, border: `1px solid ${cc.border}`, color: cc.color }}>{course.cost}</span>
          <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#F3F4F6", border: `1px solid ${border}`, color: t3 }}>{course.type}</span>
        </div>
      </div>
    </motion.a>
  );
}

export function CourseRecommendations({ skillCourses, loading, isDark = true }: Props) {
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.75)";
  const t3 = isDark ? "rgba(240,244,255,0.58)" : "rgba(26,29,35,0.55)";
  const accent = isDark ? "#a855f7" : "#5C21A1";

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={28} style={{ color: accent }} className="animate-spin" />
      <p className="text-sm" style={{ color: t2 }}>Finding the best courses for your skill gaps...</p>
    </div>
  );

  if (!skillCourses?.length) return (
    <div className="text-center py-12">
      <BookOpen size={32} className="mx-auto mb-3" style={{ color: t3 }} />
      <p className="text-sm" style={{ color: t2 }}>No courses to show yet.</p>
      <p className="text-xs mt-1" style={{ color: t3 }}>Courses are generated based on your missing keywords.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-xs mb-4" style={{ color: t3 }}>
        Curated learning resources for each skill gap. Free resources are prioritised.
      </p>
      {skillCourses.map((sc, si) => (
        <motion.div key={sc.skill} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isDark ? "#f87171" : "#D94F3D" }} />
            <h3 className="text-sm font-semibold" style={{ color: t2 }}>Learn: {sc.skill}</h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: isDark ? "rgba(239,68,68,0.08)" : "#FADADD", border: isDark ? "1px solid rgba(239,68,68,0.15)" : "1px solid #F5B8B8", color: isDark ? "#f87171" : "#c0392b" }}>
              missing skill
            </span>
          </div>
          <div className="space-y-2 ml-4">
            {sc.courses.map((course, ci) => <CourseCard key={ci} course={course} index={ci} isDark={isDark} />)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
