"use client";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Play, Code2, FileText, Wrench, Loader2 } from "lucide-react";

interface Course {
  title: string;
  platform: string;
  url: string;
  cost: string;
  duration: string;
  type: string;
  description?: string;
}

interface SkillCourse {
  skill: string;
  courses: Course[];
}

interface Props {
  skillCourses: SkillCourse[];
  loading?: boolean;
}

const typeIcon = {
  video: Play,
  interactive: Code2,
  documentation: FileText,
  project: Wrench,
};

const costConfig = {
  Free: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
  "Free tier": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Paid: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
};

function CourseCard({ course, index }: { course: Course; index: number }) {
  const Icon = typeIcon[course.type as keyof typeof typeIcon] ?? BookOpen;
  const cc = costConfig[course.cost as keyof typeof costConfig] ?? costConfig.Paid;

  return (
    <motion.a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 group"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
      whileHover={{ scale: 1.01, borderColor: "rgba(168,85,247,0.25)" }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
        <Icon size={14} className="text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white/85 leading-tight group-hover:text-purple-300 transition-colors">{course.title}</p>
          <ExternalLink size={12} className="text-white/20 group-hover:text-purple-400 transition-colors shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-white/40 mb-2">{course.platform} · {course.duration}</p>
        {course.description && <p className="text-xs text-white/35 leading-relaxed">{course.description}</p>}
        <div className="flex gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cc.bg, border: `1px solid ${cc.border}`, color: cc.color }}>
            {course.cost}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full capitalize text-white/30"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {course.type}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export function CourseRecommendations({ skillCourses, loading }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 size={28} className="text-purple-400 animate-spin" />
        <p className="text-sm text-white/40">Finding the best courses for your skill gaps...</p>
      </div>
    );
  }

  if (!skillCourses?.length) {
    return (
      <div className="text-center py-12">
        <BookOpen size={32} className="mx-auto mb-3 text-white/15" />
        <p className="text-sm text-white/30">Run the analysis first to get course recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-white/35 mb-4">
        Curated learning resources for each skill gap identified in your resume. Free resources are prioritised.
      </p>
      {skillCourses.map((sc, si) => (
        <motion.div key={sc.skill}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400/60 shrink-0" />
            <h3 className="text-sm font-semibold text-white/70">Learn: {sc.skill}</h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full text-white/30"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
              missing skill
            </span>
          </div>
          <div className="space-y-2 ml-4">
            {sc.courses.map((course, ci) => (
              <CourseCard key={ci} course={course} index={ci} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
