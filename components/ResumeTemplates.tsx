// 30 Resume Templates — all accept BuilderData, all print-safe with inline styles
// Layouts: sidebar, single-col, two-col, header-band, timeline

export interface BuilderData {
  name: string; email: string; phone: string; location: string;
  linkedin: string; github: string; summary: string;
  experience: { id: string; title: string; company: string; dates: string; bullets: string[] }[];
  education: { id: string; degree: string; school: string; year: string }[];
  skills: string[];
  projects: { id: string; name: string; description: string }[];
  // Extended sections
  certifications: string[];
  languages: { language: string; proficiency: string }[];
  awards: string[];
  volunteerWork: string;
  customSections: { id: string; title: string; content: string }[];
}

export const SECTION_DEFS: { id: string; label: string; emoji: string; description: string }[] = [
  { id: "summary",       label: "Professional Summary",  emoji: "📝", description: "2-sentence pitch" },
  { id: "experience",    label: "Work Experience",        emoji: "💼", description: "Roles & bullets" },
  { id: "education",     label: "Education",              emoji: "🎓", description: "Degrees & schools" },
  { id: "skills",        label: "Skills & Technologies",  emoji: "⚡", description: "Tech stack" },
  { id: "projects",      label: "Projects & Portfolio",   emoji: "🚀", description: "Side projects" },
  { id: "certifications",label: "Certifications",         emoji: "🏆", description: "Certs & licenses" },
  { id: "languages",     label: "Languages",              emoji: "🌐", description: "Spoken languages" },
  { id: "awards",        label: "Awards & Achievements",  emoji: "⭐", description: "Recognitions" },
  { id: "volunteer",     label: "Volunteer Work",         emoji: "🤝", description: "Community work" },
  { id: "custom",        label: "Custom Section",         emoji: "➕", description: "Anything else" },
];

type TemplateFC = React.FC<{ d: BuilderData }>;

// ── Shared sub-components ────────────────────────────────────────────────────
const Base: React.CSSProperties = { fontFamily: "'Segoe UI',Arial,sans-serif", fontSize: 11, color: "#1a1a1a", minHeight: "100%", boxSizing: "border-box" };

function Contact({ d }: { d: BuilderData }) {
  const parts = [d.email, d.phone, d.location].filter(Boolean);
  const links = [d.linkedin, d.github].filter(Boolean);
  return <>
    {parts.length > 0 && <div style={{ fontSize: 10, color: "#555" }}>{parts.join("  ·  ")}</div>}
    {links.length > 0 && <div style={{ fontSize: 9.5, color: "#6366f1" }}>{links.join("  ·  ")}</div>}
  </>;
}

function ExpBlock({ exp, bullet, accent }: { exp: BuilderData["experience"][0]; bullet: string; accent: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong style={{ fontSize: 11 }}>{exp.title}</strong>
        <span style={{ fontSize: 9.5, color: "#888" }}>{exp.dates}</span>
      </div>
      {exp.company && <div style={{ fontSize: 10, color: accent }}>{exp.company}</div>}
      <div style={{ marginTop: 3 }}>
        {exp.bullets.filter(Boolean).map((b, j) => (
          <div key={j} style={{ display: "flex", gap: 5, fontSize: 10, lineHeight: 1.5, marginBottom: 1.5 }}>
            <span style={{ color: accent, flexShrink: 0 }}>{bullet}</span><span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillPills({ skills, bg, color }: { skills: string[]; bg: string; color: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
      {skills.slice(0, 14).map((s, i) => (
        <span key={i} style={{ background: bg, color, fontSize: 9.5, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{s}</span>
      ))}
    </div>
  );
}

// ── TEMPLATES 1-30 ────────────────────────────────────────────────────────────

// 1. Modern Teal (sidebar)
export const T1: TemplateFC = ({ d }) => (
  <div style={{ ...Base, display: "flex" }}>
    <div style={{ width: 200, background: "#0D9488", color: "#fff", padding: "28px 16px", flexShrink: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{d.name || "Your Name"}</div>
      {d.experience[0]?.title && <div style={{ fontSize: 9.5, opacity: 0.8, marginBottom: 16 }}>{d.experience[0].title}</div>}
      {([d.email,d.phone,d.location,d.linkedin,d.github]).filter(Boolean).map((v, k) => <div key={k} style={{ fontSize: 9.5, opacity: 0.85, marginBottom: 2 }}>{v}</div>)}
      {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 3, marginTop: 14, marginBottom: 6 }}>SKILLS</div>
        {d.skills.slice(0, 12).map((s, i) => <div key={i} style={{ fontSize: 10, paddingBottom: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{s}</div>)}</>}
      {d.education.map((e, i) => <div key={i} style={{ marginTop: 14, fontSize: 10 }}><strong>{e.degree}</strong><div style={{ opacity: 0.75 }}>{e.school} {e.year}</div></div>)}
    </div>
    <div style={{ flex: 1, padding: "28px 22px" }}>
      {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#0D9488", borderBottom: "2px solid #0D9488", paddingBottom: 2, marginBottom: 8 }}>SUMMARY</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#444", marginBottom: 18 }}>{d.summary}</p></>}
      {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#0D9488", borderBottom: "2px solid #0D9488", paddingBottom: 2, marginBottom: 10 }}>EXPERIENCE</div>
        {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="•" accent="#0D9488" />)}</>}
      {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#0D9488", borderBottom: "2px solid #0D9488", paddingBottom: 2, marginBottom: 8, marginTop: 4 }}>PROJECTS</div>
        {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
      <ExtraSections d={d} accent="#0D9488" />
    </div>
  </div>
);

// 2. Minimal Indigo (single col)
export const T2: TemplateFC = ({ d }) => (
  <div style={{ ...Base, padding: "36px 40px" }}>
    <div style={{ fontSize: 26, fontWeight: 900 }}>{d.name || "Your Name"}</div>
    <Contact d={d} />
    <hr style={{ border: "none", borderTop: "2.5px solid #6366f1", margin: "14px 0" }} />
    {d.summary && <p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#444", marginBottom: 18 }}>{d.summary}</p>}
    {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6366f1", borderLeft: "3px solid #6366f1", paddingLeft: 6, marginBottom: 8 }}>EXPERIENCE</div>
      {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="›" accent="#6366f1" />)}</>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
      {d.skills.length > 0 && <div><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6366f1", marginBottom: 5 }}>SKILLS</div><div style={{ fontSize: 10, lineHeight: 1.9 }}>{d.skills.slice(0, 14).join("  ·  ")}</div></div>}
      {d.education.map((e, i) => <div key={i}><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6366f1", marginBottom: 5 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.degree}</div><div style={{ fontSize: 10, color: "#555" }}>{e.school} {e.year}</div></div>)}
    </div>
    {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6366f1", borderLeft: "3px solid #6366f1", paddingLeft: 6, marginTop: 18, marginBottom: 8 }}>PROJECTS</div>
      {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9, paddingLeft: 6 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
    <ExtraSections d={d} accent="#6366f1" />
  </div>
);

// 3. Executive Navy (2-col with band)
export const T3: TemplateFC = ({ d }) => (
  <div style={{ ...Base }}>
    <div style={{ background: "#1e3a5f", color: "#fff", padding: "22px 32px" }}>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.5 }}>{(d.name || "Your Name").toUpperCase()}</div>
      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>{[d.email, d.phone, d.location, d.linkedin].filter(Boolean).join("   |   ")}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 0.55fr" }}>
      <div style={{ padding: "20px 24px 20px 32px", borderRight: "1px solid #e5e7eb" }}>
        {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#1e3a5f", marginBottom: 6 }}>SUMMARY</div><p style={{ fontSize: 10.5, lineHeight: 1.7, fontStyle: "italic", color: "#444", marginBottom: 18 }}>{d.summary}</p></>}
        {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#1e3a5f", borderBottom: "1px solid #1e3a5f", paddingBottom: 2, marginBottom: 10 }}>EXPERIENCE</div>
          {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="◆" accent="#1e3a5f" />)}</>}
        {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#1e3a5f", borderBottom: "1px solid #1e3a5f", paddingBottom: 2, marginBottom: 8, marginTop: 14 }}>PROJECTS</div>
          {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
        <ExtraSections d={d} accent="#1e3a5f" />
      </div>
      <div style={{ background: "#f8f9fa", padding: "20px 18px" }}>
        {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#1e3a5f", marginBottom: 6 }}>CORE SKILLS</div>
          {d.skills.slice(0, 14).map((s, i) => <div key={i} style={{ fontSize: 10, borderBottom: "1px solid #e5e7eb", padding: "3px 0" }}>{s}</div>)}</>}
        {d.education.map((e, i) => <div key={i} style={{ marginTop: 16 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#1e3a5f", marginBottom: 6 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.degree}</div><div style={{ fontSize: 10, color: "#555", fontStyle: "italic" }}>{e.school}</div><div style={{ fontSize: 9.5, color: "#888" }}>{e.year}</div></div>)}
      </div>
    </div>
  </div>
);

// 4. Bold Purple gradient
export const T4: TemplateFC = ({ d }) => (
  <div style={{ ...Base }}>
    <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "28px 32px" }}>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{d.name || "Your Name"}</div>
      {d.experience[0]?.title && <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, marginTop: 2 }}>{d.experience[0].title}</div>}
      <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 9.5, opacity: 0.85, flexWrap: "wrap" }}>{[d.email, d.phone, d.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 0.45fr" }}>
      <div style={{ padding: "20px 24px 20px 32px" }}>
        {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", marginBottom: 6, letterSpacing: 2 }}>ABOUT ME</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#374151", marginBottom: 18 }}>{d.summary}</p></>}
        {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", marginBottom: 8, letterSpacing: 2 }}>EXPERIENCE</div>
          {d.experience.filter(e => e.title).map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 8, borderLeft: "3px solid #7c3aed" }}>
              <strong style={{ fontSize: 11 }}>{e.title}</strong><span style={{ fontSize: 10, color: "#7c3aed" }}> @ {e.company}</span>
              <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{e.dates}</div>
              {e.bullets.filter(Boolean).map((b, j) => <div key={j} style={{ display: "flex", gap: 5, fontSize: 10, lineHeight: 1.5, marginBottom: 1.5, color: "#374151" }}><span style={{ color: "#7c3aed" }}>▸</span><span>{b}</span></div>)}
            </div>
          ))}</>}
        {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", marginBottom: 8, letterSpacing: 2, marginTop: 14 }}>PROJECTS</div>
          {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9, paddingLeft: 8, borderLeft: "3px solid #7c3aed" }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
        <ExtraSections d={d} accent="#7c3aed" />
      </div>
      <div style={{ background: "#f5f3ff", padding: "20px 18px" }}>
        {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", marginBottom: 8 }}>SKILLS</div><SkillPills skills={d.skills} bg="#7c3aed18" color="#5b21b6" /></>}
        {d.education.map((e, i) => <div key={i} style={{ marginTop: 18 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", marginBottom: 6 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.degree}</div><div style={{ fontSize: 10, color: "#6b7280" }}>{e.school}</div><div style={{ fontSize: 9.5, color: "#9ca3af" }}>{e.year}</div></div>)}
      </div>
    </div>
  </div>
);

// 5. Rose / Pink
export const T5: TemplateFC = ({ d }) => (
  <div style={{ ...Base, padding: "30px 36px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #f43f5e", paddingBottom: 12, marginBottom: 18 }}>
      <div><div style={{ fontSize: 24, fontWeight: 900 }}>{d.name || "Your Name"}</div>{d.experience[0]?.title && <div style={{ fontSize: 11, color: "#f43f5e" }}>{d.experience[0].title}</div>}</div>
      <div style={{ textAlign: "right", fontSize: 10, color: "#555" }}>{[d.email, d.phone, d.location].filter(Boolean).join("\n")}</div>
    </div>
    {d.summary && <p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#555", marginBottom: 18, borderLeft: "3px solid #f43f5e", paddingLeft: 10 }}>{d.summary}</p>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 0.4fr", gap: 24 }}>
      <div>
        {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#f43f5e", letterSpacing: 2, marginBottom: 8 }}>EXPERIENCE</div>
          {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="❯" accent="#f43f5e" />)}</>}
        {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#f43f5e", letterSpacing: 2, marginBottom: 8, marginTop: 14 }}>PROJECTS</div>
          {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
        <ExtraSections d={d} accent="#f43f5e" />
      </div>
      <div>
        {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#f43f5e", letterSpacing: 2, marginBottom: 6 }}>SKILLS</div><SkillPills skills={d.skills} bg="#fff0f2" color="#be123c" /></>}
        {d.education.map((e, i) => <div key={i} style={{ marginTop: 16 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#f43f5e", marginBottom: 5 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</div><div style={{ fontSize: 9.5, color: "#555" }}>{e.school} {e.year}</div></div>)}
      </div>
    </div>
  </div>
);

// 6. Forest Green
export const T6: TemplateFC = ({ d }) => (
  <div style={{ ...Base, display: "flex" }}>
    <div style={{ width: 210, background: "#14532d", color: "#fff", padding: "28px 16px", flexShrink: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{d.name || "Your Name"}</div>
      {d.experience[0]?.title && <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 16 }}>{d.experience[0].title}</div>}
      {[d.email, d.phone, d.location].filter(Boolean).map((v, i) => <div key={i} style={{ fontSize: 9.5, opacity: 0.85, marginBottom: 2 }}>{v}</div>)}
      {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: "#86efac", marginTop: 16, marginBottom: 6 }}>SKILLS</div>
        {d.skills.slice(0, 12).map((s, i) => <div key={i} style={{ fontSize: 9.5, paddingBottom: 2, borderBottom: "1px solid rgba(134,239,172,0.2)" }}>{s}</div>)}</>}
      {d.education.map((e, i) => <div key={i} style={{ marginTop: 16 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#86efac", marginBottom: 4 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</div><div style={{ fontSize: 9.5, opacity: 0.75 }}>{e.school} {e.year}</div></div>)}
    </div>
    <div style={{ flex: 1, padding: "28px 22px" }}>
      {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, color: "#15803d", letterSpacing: 2, borderBottom: "2px solid #15803d", paddingBottom: 2, marginBottom: 8 }}>SUMMARY</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#444", marginBottom: 18 }}>{d.summary}</p></>}
      {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#15803d", letterSpacing: 2, borderBottom: "2px solid #15803d", paddingBottom: 2, marginBottom: 10 }}>EXPERIENCE</div>
        {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="▹" accent="#15803d" />)}</>}
      {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#15803d", letterSpacing: 2, borderBottom: "2px solid #15803d", paddingBottom: 2, marginBottom: 8, marginTop: 4 }}>PROJECTS</div>
        {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
      <ExtraSections d={d} accent="#15803d" />
    </div>
  </div>
);

// 7. Charcoal Dark (print-safe dark)
export const T7: TemplateFC = ({ d }) => (
  <div style={{ ...Base, background: "#1c1c1e", color: "#f5f5f7" }}>
    <div style={{ padding: "28px 32px", borderBottom: "1px solid #333" }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{d.name || "Your Name"}</div>
      <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>{[d.email, d.phone, d.location].filter(Boolean).join("  ·  ")}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 0.45fr" }}>
      <div style={{ padding: "22px 24px 22px 32px", borderRight: "1px solid #2d2d2d" }}>
        {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, color: "#00d4aa", letterSpacing: 2, marginBottom: 6 }}>SUMMARY</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#ccc", marginBottom: 18 }}>{d.summary}</p></>}
        {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#00d4aa", letterSpacing: 2, marginBottom: 8 }}>EXPERIENCE</div>
          {d.experience.filter(e => e.title).map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 8, borderLeft: "2px solid #00d4aa" }}>
              <strong style={{ color: "#fff" }}>{e.title}</strong> <span style={{ fontSize: 10, color: "#00d4aa" }}>{e.company}</span>
              <div style={{ fontSize: 9.5, color: "#666" }}>{e.dates}</div>
              {e.bullets.filter(Boolean).map((b, j) => <div key={j} style={{ display: "flex", gap: 5, fontSize: 10, lineHeight: 1.5, color: "#bbb", marginBottom: 1.5 }}><span style={{ color: "#00d4aa" }}>›</span><span>{b}</span></div>)}
            </div>
          ))}</>}
        {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#00d4aa", letterSpacing: 2, marginBottom: 8, marginTop: 14 }}>PROJECTS</div>
          {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9, paddingLeft: 8, borderLeft: "2px solid #00d4aa" }}><div style={{ fontWeight: 700, fontSize: 10.5, color: "#fff" }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#bbb", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
        <ExtraSections d={d} accent="#00d4aa" textColor="#ccc" />
      </div>
      <div style={{ padding: "22px 20px", background: "#252527" }}>
        {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#00d4aa", marginBottom: 8 }}>SKILLS</div>
          {d.skills.slice(0, 14).map((s, i) => <div key={i} style={{ fontSize: 10, color: "#ccc", borderBottom: "1px solid #333", padding: "3px 0" }}>{s}</div>)}</>}
        {d.education.map((e, i) => <div key={i} style={{ marginTop: 18 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#00d4aa", marginBottom: 5 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10.5, color: "#fff" }}>{e.degree}</div><div style={{ fontSize: 10, color: "#888" }}>{e.school} {e.year}</div></div>)}
      </div>
    </div>
  </div>
);

// 8. Orange Warm
export const T8: TemplateFC = ({ d }) => (
  <div style={{ ...Base, padding: "30px 36px" }}>
    <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "3px solid #f97316" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {(d.name || "?").charAt(0)}
      </div>
      <div><div style={{ fontSize: 22, fontWeight: 900 }}>{d.name || "Your Name"}</div><Contact d={d} /></div>
    </div>
    {d.summary && <p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#555", marginBottom: 18 }}>{d.summary}</p>}
    {d.skills.length > 0 && <div style={{ marginBottom: 18 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#f97316", letterSpacing: 2, marginBottom: 6 }}>SKILLS</div><SkillPills skills={d.skills} bg="#fff7ed" color="#c2410c" /></div>}
    {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#f97316", letterSpacing: 2, marginBottom: 8 }}>EXPERIENCE</div>
      {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="•" accent="#f97316" />)}</>}
    {d.education.map((e, i) => <div key={i} style={{ marginTop: 14 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#f97316", marginBottom: 5 }}>EDUCATION</div><div style={{ fontWeight: 700 }}>{e.degree}</div><div style={{ fontSize: 10, color: "#555" }}>{e.school} {e.year}</div></div>)}
    {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#f97316", letterSpacing: 2, marginBottom: 8, marginTop: 18 }}>PROJECTS</div>
      {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
    <ExtraSections d={d} accent="#f97316" />
  </div>
);

// 9. Sky Blue
export const T9: TemplateFC = ({ d }) => (
  <div style={{ ...Base, display: "flex" }}>
    <div style={{ width: 200, background: "#0369a1", color: "#fff", padding: "28px 16px", flexShrink: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{d.name || "Your Name"}</div>
      {[d.email, d.phone, d.location, d.linkedin].filter(Boolean).map((v, i) => <div key={i} style={{ fontSize: 9.5, opacity: 0.85, marginBottom: 2 }}>{v}</div>)}
      {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: "#7dd3fc", marginTop: 16, marginBottom: 6 }}>SKILLS</div>
        {d.skills.slice(0, 12).map((s, i) => <div key={i} style={{ fontSize: 9.5, paddingBottom: 2.5, borderBottom: "1px solid rgba(125,211,252,0.2)" }}>{s}</div>)}</>}
      {d.education.map((e, i) => <div key={i} style={{ marginTop: 14 }}><div style={{ fontSize: 9, fontWeight: 800, color: "#7dd3fc", marginBottom: 4 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</div><div style={{ fontSize: 9.5, opacity: 0.75 }}>{e.school}</div></div>)}
    </div>
    <div style={{ flex: 1, padding: "28px 22px" }}>
      {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, color: "#0369a1", letterSpacing: 2, borderBottom: "2px solid #0369a1", paddingBottom: 2, marginBottom: 8 }}>SUMMARY</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#444", marginBottom: 18 }}>{d.summary}</p></>}
      {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#0369a1", letterSpacing: 2, borderBottom: "2px solid #0369a1", paddingBottom: 2, marginBottom: 10 }}>EXPERIENCE</div>
        {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="→" accent="#0369a1" />)}</>}
      {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: "#0369a1", letterSpacing: 2, borderBottom: "2px solid #0369a1", paddingBottom: 2, marginBottom: 8, marginTop: 4 }}>PROJECTS</div>
        {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
      <ExtraSections d={d} accent="#0369a1" />
    </div>
  </div>
);

// 10. Slate Classic
export const T10: TemplateFC = ({ d }) => (
  <div style={{ ...Base, padding: "36px 42px", fontFamily: "Georgia, serif" }}>
    <div style={{ textAlign: "center", marginBottom: 18 }}>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Arial" }}>{d.name || "Your Name"}</div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{[d.email, d.phone, d.location, d.linkedin].filter(Boolean).join("   |   ")}</div>
    </div>
    <hr style={{ border: "none", borderTop: "2px solid #374151", marginBottom: 18 }} />
    {d.summary && <p style={{ fontSize: 11, lineHeight: 1.7, color: "#444", marginBottom: 18, textAlign: "justify" }}>{d.summary}</p>}
    {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#374151", borderBottom: "1px solid #374151", paddingBottom: 3, marginBottom: 12 }}>Professional Experience</div>
      {d.experience.filter(e => e.title).map((e, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{e.title}, {e.company}</strong><em style={{ fontSize: 10, color: "#888" }}>{e.dates}</em></div>
          {e.bullets.filter(Boolean).map((b, j) => <div key={j} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.55 }}><span>•</span><span>{b}</span></div>)}
        </div>
      ))}</>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
      {d.education.length > 0 && <div><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#374151", borderBottom: "1px solid #374151", paddingBottom: 2, marginBottom: 8 }}>Education</div>
        {d.education.map((e, i) => <div key={i} style={{ marginBottom: 8 }}><strong style={{ fontSize: 10.5 }}>{e.degree}</strong><div style={{ fontSize: 10, color: "#555" }}>{e.school} · {e.year}</div></div>)}</div>}
      {d.skills.length > 0 && <div><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#374151", borderBottom: "1px solid #374151", paddingBottom: 2, marginBottom: 8 }}>Skills</div>
        <div style={{ fontSize: 10, lineHeight: 1.9 }}>{d.skills.slice(0, 14).join("  •  ")}</div></div>}
    </div>
    {d.projects?.length > 0 && <><div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#374151", borderBottom: "1px solid #374151", paddingBottom: 2, marginBottom: 10, marginTop: 18 }}>Projects</div>
      {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 10 }}><strong style={{ fontSize: 10.5 }}>{p.name}</strong>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.55, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
    <ExtraSections d={d} accent="#374151" />
  </div>
);

// 11-30: More color/layout variations

const makeSimple = (accent: string, bg: string = "#fff"): TemplateFC => ({ d }) => (
  <div style={{ ...Base, background: bg }}>
    <div style={{ background: accent, color: "#fff", padding: "22px 32px" }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>{d.name || "Your Name"}</div>
      <div style={{ fontSize: 10, opacity: 0.85, marginTop: 4 }}>{[d.email, d.phone, d.location].filter(Boolean).join("  ·  ")}</div>
    </div>
    <div style={{ padding: "22px 32px" }}>
      {d.summary && <p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#555", marginBottom: 18, borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>{d.summary}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.4fr", gap: 24 }}>
        <div>
          {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, marginBottom: 8 }}>EXPERIENCE</div>
            {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="▸" accent={accent} />)}</>}
          {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, marginBottom: 8, marginTop: 14 }}>PROJECTS</div>
            {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
          <ExtraSections d={d} accent={accent} />
        </div>
        <div>
          {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, marginBottom: 6 }}>SKILLS</div><SkillPills skills={d.skills} bg={`${accent}18`} color={accent} /></>}
          {d.education.map((e, i) => <div key={i} style={{ marginTop: 16 }}><div style={{ fontSize: 9, fontWeight: 800, color: accent, marginBottom: 5 }}>EDUCATION</div><strong style={{ fontSize: 10 }}>{e.degree}</strong><div style={{ fontSize: 9.5, color: "#555" }}>{e.school} {e.year}</div></div>)}
        </div>
      </div>
    </div>
  </div>
);

export const T11 = makeSimple("#dc2626");        // Red
export const T12 = makeSimple("#9333ea");        // Grape purple
export const T13 = makeSimple("#0891b2");        // Cyan
export const T14 = makeSimple("#16a34a");        // Grass green
export const T15 = makeSimple("#d97706");        // Amber
export const T16 = makeSimple("#0f766e");        // Dark teal
export const T17 = makeSimple("#7c2d12");        // Brown
export const T18 = makeSimple("#1d4ed8");        // Royal blue
export const T19 = makeSimple("#be185d");        // Fuchsia
export const T20 = makeSimple("#374151");        // Gunmetal

// 21-25: Sidebar variants with different colors
const makeSidebar = (sideColor: string, accentLight: string): TemplateFC => ({ d }) => (
  <div style={{ ...Base, display: "flex" }}>
    <div style={{ width: 195, background: sideColor, color: "#fff", padding: "26px 14px", flexShrink: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{d.name || "Your Name"}</div>
      {[d.email, d.phone, d.location, d.github].filter(Boolean).map((v, i) => <div key={i} style={{ fontSize: 9, opacity: 0.8, marginBottom: 2 }}>{v}</div>)}
      {d.skills.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accentLight, marginTop: 16, marginBottom: 5, letterSpacing: 1 }}>SKILLS</div>
        {d.skills.slice(0, 12).map((s, i) => <div key={i} style={{ fontSize: 9.5, paddingBottom: 2, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>{s}</div>)}</>}
      {d.education.map((e, i) => <div key={i} style={{ marginTop: 14 }}><div style={{ fontSize: 9, fontWeight: 800, color: accentLight, marginBottom: 4 }}>EDUCATION</div><div style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</div><div style={{ fontSize: 9.5, opacity: 0.75 }}>{e.school}</div><div style={{ fontSize: 9, opacity: 0.6 }}>{e.year}</div></div>)}
    </div>
    <div style={{ flex: 1, padding: "26px 20px" }}>
      {d.summary && <><div style={{ fontSize: 9, fontWeight: 800, color: sideColor, letterSpacing: 2, borderBottom: `2px solid ${sideColor}`, paddingBottom: 2, marginBottom: 8 }}>PROFILE</div><p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#444", marginBottom: 16 }}>{d.summary}</p></>}
      {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: sideColor, letterSpacing: 2, borderBottom: `2px solid ${sideColor}`, paddingBottom: 2, marginBottom: 10 }}>EXPERIENCE</div>
        {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="•" accent={sideColor} />)}</>}
      {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: sideColor, letterSpacing: 2, borderBottom: `2px solid ${sideColor}`, paddingBottom: 2, marginBottom: 8, marginTop: 4 }}>PROJECTS</div>
        {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 9 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
      <ExtraSections d={d} accent={sideColor} />
    </div>
  </div>
);

export const T21 = makeSidebar("#1e1b4b", "#c7d2fe"); // Deep indigo
export const T22 = makeSidebar("#064e3b", "#6ee7b7"); // Emerald dark
export const T23 = makeSidebar("#7f1d1d", "#fca5a5"); // Deep red
export const T24 = makeSidebar("#1e3a5f", "#93c5fd"); // Deep navy
export const T25 = makeSidebar("#4a044e", "#e9d5ff"); // Deep violet

// 26-30: Centered header single-column variants
const makeCentered = (accent: string): TemplateFC => ({ d }) => (
  <div style={{ ...Base, padding: "36px 44px" }}>
    <div style={{ textAlign: "center", borderBottom: `3px solid ${accent}`, paddingBottom: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{d.name || "Your Name"}</div>
      {d.experience[0]?.title && <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 2 }}>{d.experience[0].title}</div>}
      <div style={{ fontSize: 10, color: "#555", marginTop: 5 }}>{[d.email, d.phone, d.location, d.linkedin].filter(Boolean).join("   ·   ")}</div>
    </div>
    {d.summary && <p style={{ fontSize: 11, lineHeight: 1.7, color: "#444", marginBottom: 20, textAlign: "center", maxWidth: "85%", margin: "0 auto 20px" }}>{d.summary}</p>}
    {d.skills.length > 0 && <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, marginBottom: 6 }}>SKILLS</div><SkillPills skills={d.skills} bg={`${accent}15`} color={accent} /></div>}
    {d.experience.filter(e => e.title).length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}`, paddingBottom: 3, marginBottom: 12 }}>EXPERIENCE</div>
      {d.experience.filter(e => e.title).map((e, i) => <ExpBlock key={i} exp={e} bullet="◉" accent={accent} />)}</>}
    {d.education.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}`, paddingBottom: 3, marginTop: 16, marginBottom: 10 }}>EDUCATION</div>
      {d.education.map((e, i) => <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}><div><strong style={{ fontSize: 11 }}>{e.degree}</strong><div style={{ fontSize: 10, color: "#555" }}>{e.school}</div></div><div style={{ fontSize: 10, color: "#888" }}>{e.year}</div></div>)}</>}
    {d.projects?.length > 0 && <><div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}`, paddingBottom: 3, marginTop: 16, marginBottom: 10 }}>PROJECTS</div>
      {d.projects.map((p, i) => <div key={i} style={{ marginBottom: 10 }}><div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>{p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 2 }}>{p.description}</div>}</div>)}</>}
    <ExtraSections d={d} accent={accent} />
  </div>
);

export const T26 = makeCentered("#0D9488"); // Center teal
export const T27 = makeCentered("#7c3aed"); // Center violet
export const T28 = makeCentered("#dc2626"); // Center red
export const T29 = makeCentered("#0369a1"); // Center blue
export const T30 = makeCentered("#374151"); // Center slate

// ── Extra sections renderer (appended to any template) ───────────────────────
export function ExtraSections({ d, accent, textColor = "#444" }: { d: BuilderData; accent: string; textColor?: string }) {
  return (
    <>
      {d.certifications?.length > 0 && (
        <div style={{ marginTop: 14, paddingLeft: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}40`, paddingBottom: 2, marginBottom: 6 }}>CERTIFICATIONS</div>
          {d.certifications.map((c, i) => <div key={i} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.5, color: textColor }}><span style={{ color: accent }}>🏆</span><span>{c}</span></div>)}
        </div>
      )}
      {d.languages?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}40`, paddingBottom: 2, marginBottom: 6 }}>LANGUAGES</div>
          {d.languages.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: textColor }}><span>{l.language}</span><span style={{ opacity: 0.6 }}>{l.proficiency}</span></div>)}
        </div>
      )}
      {d.awards?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}40`, paddingBottom: 2, marginBottom: 6 }}>AWARDS & ACHIEVEMENTS</div>
          {d.awards.map((a, i) => <div key={i} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.5, color: textColor }}><span style={{ color: accent }}>⭐</span><span>{a}</span></div>)}
        </div>
      )}
      {d.volunteerWork && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}40`, paddingBottom: 2, marginBottom: 6 }}>VOLUNTEER WORK</div>
          <p style={{ fontSize: 10, lineHeight: 1.55, color: textColor }}>{d.volunteerWork}</p>
        </div>
      )}
      {d.customSections?.filter(s => s.title && s.content).map((s, i) => (
        <div key={i} style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent, letterSpacing: 2, borderBottom: `1px solid ${accent}40`, paddingBottom: 2, marginBottom: 6 }}>{s.title.toUpperCase()}</div>
          <p style={{ fontSize: 10, lineHeight: 1.55, color: textColor }}>{s.content}</p>
        </div>
      ))}
    </>
  );
}

// ── Sample resume data (pre-fills template previews) ─────────────────────────
export const SAMPLE_DATA: BuilderData = {
  name: "Alex Morgan",
  email: "alex.morgan@email.com",
  phone: "+1 (415) 555-0192",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  summary: "Full-Stack Engineer with 5+ years building scalable web applications at fintech and SaaS companies. Proven track record of reducing API latency by 40% and shipping features used by 2M+ users. Passionate about clean architecture and developer experience.",
  experience: [
    {
      id: "e1",
      title: "Senior Software Engineer",
      company: "Stripe",
      dates: "Jan 2022 – Present",
      bullets: [
        "Architected a distributed event-processing pipeline handling 500K transactions/day, reducing P99 latency by 38%",
        "Led migration of monolithic payments service to microservices, cutting deployment time from 2 hours to 8 minutes",
        "Mentored 4 junior engineers; introduced pair-programming that improved sprint velocity by 22%",
        "Collaborated with product to ship Stripe Radar 3.0, reducing false-positive fraud flags by 18%",
        "Designed A/B testing framework used by 12 product teams, accelerating feature release cadence by 30%",
      ],
    },
    {
      id: "e2",
      title: "Software Engineer",
      company: "Airbnb",
      dates: "Jun 2019 – Dec 2021",
      bullets: [
        "Built React/TypeScript search experience serving 12M daily active users; improved conversion rate by 9%",
        "Optimized PostgreSQL queries reducing average response time from 820ms to 145ms across 40+ endpoints",
        "Developed internal design-system component library adopted by 6 product teams, saving ~800 dev-hours/yr",
        "Integrated Elasticsearch for property listings, reducing search index time from 4s to 0.6s",
      ],
    },
    {
      id: "e3",
      title: "Junior Developer",
      company: "TechCorp Inc.",
      dates: "Aug 2018 – May 2019",
      bullets: [
        "Implemented REST APIs in Node.js/Express powering the company's mobile app (200K users)",
        "Wrote unit and integration tests bringing code coverage from 42% to 78%",
        "Automated CI/CD pipeline with GitHub Actions, cutting release cycle from 2 weeks to 3 days",
      ],
    },
  ],
  education: [
    { id: "edu1", degree: "B.S. Computer Science", school: "UC Berkeley", year: "2018" },
  ],
  skills: [
    "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Redis",
    "AWS", "Docker", "Kubernetes", "GraphQL", "REST APIs", "CI/CD",
    "System Design", "Agile / Scrum",
  ],
  projects: [
    { id: "p1", name: "OpenFin Dashboard", description: "Open-source real-time financial dashboard (React + WebSockets) with 1.2K GitHub stars." },
    { id: "p2", name: "NeuralSearch", description: "Semantic search engine using embeddings + FAISS; indexing 50M documents in under 3 seconds." },
  ],
  certifications: ["AWS Certified Solutions Architect – Associate", "Google Cloud Professional Data Engineer"],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Professional" },
  ],
  awards: ["Engineering Excellence Award — Stripe (2023)", "Hackathon 1st Place — Airbnb H1 2021"],
  volunteerWork: "Mentor at Code.org — weekly 1-on-1 sessions teaching Python to high-school students (2020–present).",
  customSections: [],
};

// ── T_PRO: ProFlex — clean two-column, fills A4 well, generous spacing ───────
function TProFlex({ d }: { d: BuilderData }) {
  const accent = "#0D9488";
  const g1 = "#111827";
  const g2 = "#374151";
  const g3 = "#9ca3af";
  const SH: React.CSSProperties = {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 2.5,
    color: accent,
    textTransform: "uppercase" as const,
    borderBottom: `1.5px solid ${accent}35`,
    paddingBottom: 4,
    marginBottom: 9,
    marginTop: 18,
  };
  return (
    <div style={{ ...Base, display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <div style={{ background: accent, padding: "22px 28px 16px", color: "#fff", flexShrink: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 0.3, lineHeight: 1.1 }}>{d.name || "Your Name"}</div>
        {d.experience[0]?.title && (
          <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 4, fontWeight: 500 }}>{d.experience[0].title}</div>
        )}
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 12, fontSize: 9.5, opacity: 0.92 }}>
          {d.email    && <span>✉ {d.email}</span>}
          {d.phone    && <span>📞 {d.phone}</span>}
          {d.location && <span>📍 {d.location}</span>}
          {d.linkedin && <span>🔗 {d.linkedin}</span>}
          {d.github   && <span>⌨ {d.github}</span>}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* LEFT column: Skills, Education, Certs, Languages, Awards */}
        <div style={{ width: 212, flexShrink: 0, padding: "16px 14px 24px 22px",
          borderRight: `2px solid ${accent}18`, background: "#fafafa" }}>

          {d.skills.length > 0 && <>
            <div style={{ ...SH, marginTop: 8 }}>Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {d.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 9.5, background: `${accent}14`, color: accent,
                  border: `1px solid ${accent}25`, borderRadius: 4, padding: "2.5px 6px", fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </>}

          {d.education.length > 0 && <>
            <div style={SH}>Education</div>
            {d.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: g1, lineHeight: 1.4 }}>{e.degree}</div>
                <div style={{ fontSize: 10, color: accent, marginTop: 2 }}>{e.school}</div>
                {e.year && <div style={{ fontSize: 9, color: g3, marginTop: 1 }}>{e.year}</div>}
              </div>
            ))}
          </>}

          {(d.certifications?.filter(Boolean).length ?? 0) > 0 && <>
            <div style={SH}>Certifications</div>
            {d.certifications.filter(Boolean).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 5, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: accent, fontSize: 8, marginTop: 2, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 10, lineHeight: 1.5, color: g2 }}>{c}</span>
              </div>
            ))}
          </>}

          {(d.languages?.length ?? 0) > 0 && <>
            <div style={SH}>Languages</div>
            {d.languages.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, color: g2 }}>{l.language}</span>
                <span style={{ color: g3 }}>{l.proficiency}</span>
              </div>
            ))}
          </>}

          {(d.awards?.filter(Boolean).length ?? 0) > 0 && <>
            <div style={SH}>Awards</div>
            {d.awards.filter(Boolean).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 5, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: "#f59e0b", fontSize: 10, flexShrink: 0 }}>⭐</span>
                <span style={{ fontSize: 10, lineHeight: 1.5, color: g2 }}>{a}</span>
              </div>
            ))}
          </>}
        </div>

        {/* RIGHT column: Summary, Experience, Projects, Volunteer */}
        <div style={{ flex: 1, padding: "16px 24px 24px 20px", minWidth: 0 }}>

          {d.summary && <>
            <div style={{ ...SH, marginTop: 8 }}>Professional Summary</div>
            <p style={{ fontSize: 11, lineHeight: 1.7, color: g2, margin: 0 }}>{d.summary}</p>
          </>}

          {d.experience.length > 0 && <>
            <div style={SH}>Work Experience</div>
            {d.experience.map((exp, i) => (
              <div key={exp.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: g1 }}>{exp.title}</span>
                  <span style={{ fontSize: 9.5, color: g3, flexShrink: 0 }}>{exp.dates}</span>
                </div>
                {exp.company && <div style={{ fontSize: 10.5, color: accent, fontWeight: 600, marginTop: 2 }}>{exp.company}</div>}
                <div style={{ marginTop: 5 }}>
                  {exp.bullets.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 6, fontSize: 10.5, lineHeight: 1.65, marginBottom: 2.5 }}>
                      <span style={{ color: accent, flexShrink: 0, fontWeight: 700 }}>▸</span>
                      <span style={{ color: g2 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>}

          {(d.projects?.length ?? 0) > 0 && <>
            <div style={SH}>Projects</div>
            {d.projects.map((p, i) => (
              <div key={p.id} style={{ marginBottom: 11 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: g1 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 10.5, lineHeight: 1.65, color: g2, marginTop: 2 }}>{p.description}</div>}
              </div>
            ))}
          </>}

          {d.volunteerWork && <>
            <div style={SH}>Volunteer Work</div>
            <p style={{ fontSize: 11, lineHeight: 1.65, color: g2, margin: 0 }}>{d.volunteerWork}</p>
          </>}

          {/* Custom sections */}
          {d.customSections?.filter(s => s.title && s.content).map((s, i) => (
            <div key={i}>
              <div style={SH}>{s.title}</div>
              <p style={{ fontSize: 11, lineHeight: 1.65, color: g2, margin: 0 }}>{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Template registry ────────────────────────────────────────────────────────
export const ALL_TEMPLATES: {
  id: number; name: string; category: string; accent: string; component: TemplateFC;
  atsBadges: string[]; bestFor: string;
}[] = [
  { id: 0,  name: "Modern Teal",       category: "Sidebar",   accent: "#0D9488", component: T1,  atsBadges: ["Greenhouse","Lever","SmartRecruiters"], bestFor: "Tech startups & SaaS" },
  { id: 1,  name: "Minimal Indigo",    category: "Minimal",   accent: "#6366f1", component: T2,  atsBadges: ["Workday","Greenhouse","iCIMS","Taleo"],  bestFor: "Fortune 500 / all ATS" },
  { id: 2,  name: "Executive Navy",    category: "Two-Column",accent: "#1e3a5f", component: T3,  atsBadges: ["Workday","Taleo","SuccessFactors"],      bestFor: "Finance & consulting" },
  { id: 3,  name: "Bold Purple",       category: "Bold",      accent: "#7c3aed", component: T4,  atsBadges: ["Greenhouse","Lever","Ashby"],            bestFor: "Design & creative tech" },
  { id: 4,  name: "Rose Modern",       category: "Modern",    accent: "#f43f5e", component: T5,  atsBadges: ["Greenhouse","Lever"],                    bestFor: "Marketing & growth" },
  { id: 5,  name: "Forest Green",      category: "Sidebar",   accent: "#14532d", component: T6,  atsBadges: ["Greenhouse","SmartRecruiters"],          bestFor: "Engineering & DevOps" },
  { id: 6,  name: "Charcoal Dark",     category: "Dark",      accent: "#00d4aa", component: T7,  atsBadges: ["Greenhouse","Lever"],                    bestFor: "AI/ML & data science" },
  { id: 7,  name: "Orange Warm",       category: "Modern",    accent: "#f97316", component: T8,  atsBadges: ["Greenhouse","Lever","Ashby"],            bestFor: "Product & UX" },
  { id: 8,  name: "Sky Blue",          category: "Sidebar",   accent: "#0369a1", component: T9,  atsBadges: ["Workday","iCIMS","Taleo"],               bestFor: "Healthcare & enterprise" },
  { id: 9,  name: "Slate Classic",     category: "Classic",   accent: "#374151", component: T10, atsBadges: ["Workday","Taleo","iCIMS","SuccessFactors","Greenhouse"], bestFor: "All industries · max ATS" },
  { id: 10, name: "Crimson Bold",      category: "Bold",      accent: "#dc2626", component: T11, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Sales & business dev" },
  { id: 11, name: "Grape Purple",      category: "Modern",    accent: "#9333ea", component: T12, atsBadges: ["Greenhouse","Lever","Ashby"],            bestFor: "Startups & VC-backed" },
  { id: 12, name: "Cyan Clean",        category: "Minimal",   accent: "#0891b2", component: T13, atsBadges: ["Workday","iCIMS","Taleo","Greenhouse"],  bestFor: "Software engineering" },
  { id: 13, name: "Grass Green",       category: "Modern",    accent: "#16a34a", component: T14, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Sustainability & impact" },
  { id: 14, name: "Amber Gold",        category: "Modern",    accent: "#d97706", component: T15, atsBadges: ["Greenhouse","Lever","SmartRecruiters"],  bestFor: "Management & leadership" },
  { id: 15, name: "Dark Teal",         category: "Bold",      accent: "#0f766e", component: T16, atsBadges: ["Greenhouse","iCIMS"],                    bestFor: "Cybersecurity & cloud" },
  { id: 16, name: "Warm Brown",        category: "Classic",   accent: "#7c2d12", component: T17, atsBadges: ["Workday","Taleo","SuccessFactors"],      bestFor: "Law, HR & compliance" },
  { id: 17, name: "Royal Blue",        category: "Modern",    accent: "#1d4ed8", component: T18, atsBadges: ["Workday","iCIMS","Greenhouse"],          bestFor: "Banking & fintech" },
  { id: 18, name: "Fuchsia Pro",       category: "Bold",      accent: "#be185d", component: T19, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Media & entertainment" },
  { id: 19, name: "Gunmetal",          category: "Classic",   accent: "#374151", component: T20, atsBadges: ["Workday","Taleo","iCIMS","SuccessFactors"], bestFor: "Government & defence" },
  { id: 20, name: "Deep Indigo",       category: "Sidebar",   accent: "#1e1b4b", component: T21, atsBadges: ["Greenhouse","Lever","Ashby"],            bestFor: "Product & engineering" },
  { id: 21, name: "Emerald Dark",      category: "Sidebar",   accent: "#064e3b", component: T22, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Biotech & life sciences" },
  { id: 22, name: "Deep Red",          category: "Sidebar",   accent: "#7f1d1d", component: T23, atsBadges: ["Greenhouse","SmartRecruiters"],          bestFor: "Consulting & strategy" },
  { id: 23, name: "Deep Navy",         category: "Sidebar",   accent: "#1e3a5f", component: T24, atsBadges: ["Workday","iCIMS"],                       bestFor: "Finance & banking" },
  { id: 24, name: "Deep Violet",       category: "Sidebar",   accent: "#4a044e", component: T25, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Creative & media" },
  { id: 25, name: "Center Teal",       category: "Centered",  accent: "#0D9488", component: T26, atsBadges: ["Workday","Greenhouse","iCIMS"],          bestFor: "Academia & research" },
  { id: 26, name: "Center Violet",     category: "Centered",  accent: "#7c3aed", component: T27, atsBadges: ["Greenhouse","Lever","Ashby"],            bestFor: "Design & art direction" },
  { id: 27, name: "Center Red",        category: "Centered",  accent: "#dc2626", component: T28, atsBadges: ["Greenhouse","Lever"],                    bestFor: "Marketing & PR" },
  { id: 28, name: "Center Blue",       category: "Centered",  accent: "#0369a1", component: T29, atsBadges: ["Workday","Taleo","iCIMS"],               bestFor: "Healthcare & nursing" },
  { id: 29, name: "Center Slate",      category: "Centered",  accent: "#374151", component: T30,       atsBadges: ["Workday","Taleo","iCIMS","SuccessFactors","Greenhouse"], bestFor: "All industries · ATS-safe" },
  { id: 30, name: "ProFlex Teal",      category: "Two-Column",accent: "#0D9488", component: TProFlex,  atsBadges: ["Greenhouse","Lever","Workday","iCIMS"], bestFor: "All industries · clean layout" },
];

export const CATEGORIES = ["All", "Sidebar", "Minimal", "Two-Column", "Bold", "Modern", "Classic", "Dark", "Centered"];
