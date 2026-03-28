"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Sparkles, Lock, Unlock, ChevronDown, ChevronUp,
  Plus, Trash2, RefreshCw, CheckCircle, Wand2, Crown,
  Eye, Edit3, ArrowUpRight, Zap, Maximize2, Minimize2, ChevronRight, X
} from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import { ALL_TEMPLATES, CATEGORIES, SECTION_DEFS, SAMPLE_DATA, type BuilderData } from "./ResumeTemplates";

// ── Company → ATS database ────────────────────────────────────────────────────
const COMPANY_ATS_DB: Record<string, { ats: string; templateId: number; badge: string; tips: string[] }> = {
  // Big Tech
  google:      { ats: "Proprietary (gHire)", templateId: 1,  badge: "⚡ Proprietary ATS", tips: ["Single column only — no sidebars","Standard section headings (Experience, Education, Skills)","STAR-format bullets preferred","No tables, images, or graphics","Plain Arial/Calibri 10-12pt"] },
  meta:        { ats: "Proprietary (Workday+)", templateId: 1, badge: "⚡ Proprietary ATS", tips: ["Clean single-column layout","Emphasize impact metrics (%, $, scale)","List all programming languages explicitly","Avoid headers/footers","Use standard date formats (Mon YYYY)"] },
  amazon:      { ats: "iCIMS / Custom", templateId: 9,  badge: "✓ iCIMS Safe",   tips: ["STAR-method bullets essential","Leadership Principles keywords matter (Ownership, Bias for Action)","Avoid graphics and tables","Chronological order, most recent first","Quantify everything — scale, %, dollars"] },
  microsoft:   { ats: "Workday",        templateId: 9,  badge: "✓ Workday Safe", tips: ["Workday parses ATS-standard layouts well","Standard headings (Work Experience, Education)","No text boxes or columns","Use Arial/Calibri fonts","Add GitHub link in contact section"] },
  apple:       { ats: "Workday",        templateId: 1,  badge: "✓ Workday Safe", tips: ["Single-column preferred","Emphasize design thinking and user focus","Mention specific Apple frameworks (SwiftUI, Core ML)","Keep to 1-2 pages","No graphics"] },
  netflix:     { ats: "Greenhouse",     templateId: 0,  badge: "✓ Greenhouse",   tips: ["Greenhouse parses sidebars cleanly","Culture fit narrative in summary","Emphasize decision-making at scale","Strong metrics focus","1 page for IC roles, 2 for senior+"] },
  // Finance
  goldman:     { ats: "Taleo",          templateId: 9,  badge: "✓ Taleo Safe",   tips: ["Classic single-column layout","GPA prominently if 3.5+","Internship experience is critical","Finance keywords: P&L, DCF, M&A, IPO","Calibri/Arial 11pt minimum"] },
  jpmorgan:    { ats: "Taleo",          templateId: 2,  badge: "✓ Taleo Safe",   tips: ["Two-column OK if simple","Include CFA/FRM if applicable","Bloomberg, Python, SQL skills important","Avoid creative formatting","Bullet length: 1-2 lines max"] },
  blackrock:   { ats: "Workday",        templateId: 9,  badge: "✓ Workday Safe", tips: ["AUM, returns, risk metrics in bullets","CFA strongly preferred mention","Technical skills section critical","Standard headings required","No color graphics"] },
  // Consulting
  mckinsey:    { ats: "Proprietary",    templateId: 9,  badge: "⚡ Proprietary",  tips: ["1 page strictly","Impact-first bullets (verb + metric + context)","Top-3 school / GPA visible","Avoid buzzwords without data","Consulting keywords: stakeholder, strategy, P&L"] },
  bcg:         { ats: "Workday",        templateId: 2,  badge: "✓ Workday Safe", tips: ["Similar to McKinsey — 1 page","Case-competition wins mentioned","Quantify every achievement","Clean executive layout preferred"] },
  deloitte:    { ats: "Workday",        templateId: 2,  badge: "✓ Workday Safe", tips: ["Multi-page OK for experienced","CPA/CFA mentioned prominently","Cloud certifications valued (AWS, Azure)","Standard headings — Workday-friendly"] },
  // Healthcare
  johnson:     { ats: "Workday",        templateId: 8,  badge: "✓ Workday Safe", tips: ["FDA, GMP, regulatory keywords","Clinical keywords (Phase I/II/III, IND, NDA)","Single-column mandatory","Certifications prominently listed","Healthcare compliance language"] },
  // Startups / VC-backed
  stripe:      { ats: "Greenhouse",     templateId: 0,  badge: "✓ Greenhouse",   tips: ["Greenhouse handles sidebars well","Financial tech keywords: payments, API, ledger","Scale metrics critical (TPS, uptime, %)","GitHub link valued highly","Systems design experience prominent"] },
  airbnb:      { ats: "Greenhouse",     templateId: 3,  badge: "✓ Greenhouse",   tips: ["User-centric impact metrics","Design sensitivity valued","Scale: MAU, conversion, latency","Open source contributions noteworthy","1-2 pages"] },
  uber:        { ats: "Greenhouse",     templateId: 0,  badge: "✓ Greenhouse",   tips: ["Reliability/availability keywords","Distributed systems experience","Data-driven bullets","Marketplace / platform experience valued"] },
  // India Tech
  tcs:         { ats: "Custom Oracle",  templateId: 9,  badge: "✓ Oracle Taleo", tips: ["Standard single-column mandatory","Skills section comprehensive","Certification numbers (like AWS) included","Education section with % or CGPA","Avoid graphics completely"] },
  infosys:     { ats: "SAP SuccessFactors", templateId: 9, badge: "✓ SAP SF",   tips: ["SAP SF parses standard layouts","CGPA or percentage mentioned","Training & certifications section valued","Technology stack list critical"] },
  wipro:       { ats: "SAP SuccessFactors", templateId: 9, badge: "✓ SAP SF",   tips: ["Project-based resume structure preferred","Domain expertise sections","Certifications prominently listed","No decorative elements"] },
  flipkart:    { ats: "Greenhouse",     templateId: 0,  badge: "✓ Greenhouse",   tips: ["Scale metrics (GMV, orders/day)","System design experience","Data structures & algorithms explicit","Performance impact bullets"] },
  zomato:      { ats: "Lever",          templateId: 3,  badge: "✓ Lever Safe",   tips: ["Growth metrics central","Product sense + technical depth","Startup culture — concise bullets","Side projects show initiative"] },
  swiggy:      { ats: "Lever",          templateId: 0,  badge: "✓ Lever Safe",   tips: ["Hyperlocal logistics keywords","ML/data experience valued","Impact on delivery metrics","Fast-paced execution culture"] },
};

function lookupCompany(name: string) {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  return (
    COMPANY_ATS_DB[key] ??
    Object.entries(COMPANY_ATS_DB).find(([k]) => key.includes(k) || k.includes(key))?.[1] ??
    null
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface ExpEntry { id: string; title: string; company: string; dates: string; bullets: string[] }
interface EduEntry { id: string; degree: string; school: string; year: string }
interface ProjEntry { id: string; name: string; description: string }

interface OptimizeResult {
  optimizedBullets: { original: string; improved: string; keywordsAdded: string[] }[];
  optimizedSummary: string;
  predictedScore: number;
  scoreGain: number;
  keywordsAdded: string[];
  changeCount: number;
}


// ── REMOVED: Template renderers moved to ResumeTemplates.tsx ─────────────────
// Keeping only small helpers used by ResumeBuilder UI:
function _unused_TemplateModern({ d }: { d: BuilderData }) {
  return (
    <div style={{ display: "flex", minHeight: "100%", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 11, color: "#1a1a2e" }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: "#0D9488", padding: "28px 18px", color: "#fff", flexShrink: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{d.name || "Your Name"}</div>
          {d.experience[0]?.title && <div style={{ fontSize: 10, opacity: 0.8 }}>{d.experience[0].title}</div>}
        </div>
        <SideSection label="CONTACT" color="#fff">
          {d.email && <SideItem label="Email" value={d.email} />}
          {d.phone && <SideItem label="Phone" value={d.phone} />}
          {d.location && <SideItem label="Location" value={d.location} />}
          {d.linkedin && <SideItem label="LinkedIn" value={d.linkedin} />}
          {d.github && <SideItem label="GitHub" value={d.github} />}
        </SideSection>
        {d.skills.length > 0 && (
          <SideSection label="SKILLS" color="#fff">
            {d.skills.slice(0, 12).map((s, i) => (
              <div key={i} style={{ fontSize: 10, padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>{s}</div>
            ))}
          </SideSection>
        )}
        {d.education.length > 0 && (
          <SideSection label="EDUCATION" color="#fff">
            {d.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 10 }}>{e.degree}</div>
                <div style={{ fontSize: 9, opacity: 0.8 }}>{e.school}</div>
                {e.year && <div style={{ fontSize: 9, opacity: 0.7 }}>{e.year}</div>}
              </div>
            ))}
          </SideSection>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "28px 24px" }}>
        {d.summary && (
          <div style={{ marginBottom: 20 }}>
            <TplSection label="SUMMARY" accent="#0D9488" />
            <p style={{ fontSize: 10.5, lineHeight: 1.6, color: "#444", marginTop: 6 }}>{d.summary}</p>
          </div>
        )}
        {d.experience.filter(e => e.title || e.company).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <TplSection label="EXPERIENCE" accent="#0D9488" />
            {d.experience.filter(e => e.title || e.company).map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{exp.title}</span>
                  <span style={{ fontSize: 9.5, color: "#888" }}>{exp.dates}</span>
                </div>
                {exp.company && <div style={{ fontSize: 10, color: "#0D9488", marginBottom: 4 }}>{exp.company}</div>}
                {exp.bullets.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.5, marginBottom: 2 }}>
                    <span style={{ color: "#0D9488", flexShrink: 0 }}>•</span><span>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {d.projects.filter(p => p.name).length > 0 && (
          <div>
            <TplSection label="PROJECTS" accent="#0D9488" />
            {d.projects.filter(p => p.name).map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{p.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateMinimal({ d }: { d: BuilderData }) {
  return (
    <div style={{ padding: "36px 40px", fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 11, color: "#1a1a1a", minHeight: "100%" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{d.name || "Your Name"}</div>
        <div style={{ fontSize: 10.5, color: "#555", marginTop: 4 }}>
          {[d.email, d.phone, d.location].filter(Boolean).join("  ·  ")}
        </div>
        {(d.linkedin || d.github) && (
          <div style={{ fontSize: 10, color: "#6366f1", marginTop: 2 }}>
            {[d.linkedin, d.github].filter(Boolean).join("  ·  ")}
          </div>
        )}
      </div>
      <hr style={{ border: "none", borderTop: "2px solid #6366f1", marginBottom: 16 }} />
      {d.summary && (
        <div style={{ marginBottom: 18 }}>
          <MinSection label="SUMMARY" />
          <p style={{ fontSize: 10.5, lineHeight: 1.6, color: "#444", marginTop: 5 }}>{d.summary}</p>
        </div>
      )}
      {d.experience.filter(e => e.title || e.company).length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <MinSection label="EXPERIENCE" />
          {d.experience.filter(e => e.title || e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, fontSize: 11 }}>{exp.title}</span>
                <span style={{ fontSize: 9.5, color: "#888" }}>{exp.dates}</span>
              </div>
              {exp.company && <div style={{ fontSize: 10, color: "#6366f1" }}>{exp.company}</div>}
              <div style={{ marginTop: 3 }}>
                {exp.bullets.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.5, marginBottom: 1 }}>
                    <span style={{ color: "#6366f1" }}>›</span><span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {d.education.length > 0 && (
          <div>
            <MinSection label="EDUCATION" />
            {d.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.degree}</div>
                <div style={{ fontSize: 10, color: "#555" }}>{e.school}{e.year ? ` · ${e.year}` : ""}</div>
              </div>
            ))}
          </div>
        )}
        {d.skills.length > 0 && (
          <div>
            <MinSection label="SKILLS" />
            <div style={{ fontSize: 10, lineHeight: 1.8, color: "#444" }}>
              {d.skills.slice(0, 14).join("  ·  ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateExecutive({ d }: { d: BuilderData }) {
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 11, color: "#1a1a1a", minHeight: "100%" }}>
      {/* Header bar */}
      <div style={{ background: "#1e40af", color: "#fff", padding: "22px 32px" }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, fontFamily: "Arial, sans-serif" }}>
          {(d.name || "Your Name").toUpperCase()}
        </div>
        <div style={{ fontSize: 10.5, marginTop: 5, opacity: 0.85, fontFamily: "Arial, sans-serif" }}>
          {[d.email, d.phone, d.location, d.linkedin].filter(Boolean).join("   |   ")}
        </div>
      </div>
      {/* Body: two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.55fr", gap: 0 }}>
        {/* Left */}
        <div style={{ padding: "22px 24px 22px 32px", borderRight: "1px solid #e5e7eb" }}>
          {d.summary && (
            <div style={{ marginBottom: 18 }}>
              <ExecSection label="PROFESSIONAL SUMMARY" />
              <p style={{ fontSize: 10.5, lineHeight: 1.7, color: "#444", marginTop: 5, fontStyle: "italic" }}>{d.summary}</p>
            </div>
          )}
          {d.experience.filter(e => e.title || e.company).length > 0 && (
            <div>
              <ExecSection label="PROFESSIONAL EXPERIENCE" />
              {d.experience.filter(e => e.title || e.company).map((exp, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 11, fontFamily: "Arial, sans-serif" }}>{exp.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#1e40af", marginBottom: 3 }}>
                    <span style={{ fontStyle: "italic" }}>{exp.company}</span>
                    <span style={{ color: "#888", fontFamily: "Arial, sans-serif" }}>{exp.dates}</span>
                  </div>
                  {exp.bullets.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.55, marginBottom: 2 }}>
                      <span style={{ color: "#1e40af", flexShrink: 0, fontFamily: "Arial" }}>◆</span><span>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right sidebar */}
        <div style={{ padding: "22px 24px 22px 20px", background: "#f9fafb" }}>
          {d.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <ExecSection label="CORE SKILLS" />
              {d.skills.slice(0, 14).map((s, i) => (
                <div key={i} style={{ fontSize: 10, padding: "3px 0", borderBottom: "1px solid #e5e7eb", color: "#374151" }}>{s}</div>
              ))}
            </div>
          )}
          {d.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <ExecSection label="EDUCATION" />
              {d.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, fontFamily: "Arial" }}>{e.degree}</div>
                  <div style={{ fontSize: 9.5, color: "#555", fontStyle: "italic" }}>{e.school}</div>
                  {e.year && <div style={{ fontSize: 9, color: "#888" }}>{e.year}</div>}
                </div>
              ))}
            </div>
          )}
          {d.projects.filter(p => p.name).length > 0 && (
            <div>
              <ExecSection label="PROJECTS" />
              {d.projects.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, fontFamily: "Arial" }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.4 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateBold({ d }: { d: BuilderData }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 11, minHeight: "100%" }}>
      {/* Bold header */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)", color: "#fff", padding: "28px 32px" }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{d.name || "Your Name"}</div>
        {d.experience[0]?.title && (
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.9 }}>{d.experience[0].title}</div>
        )}
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 9.5, flexWrap: "wrap", opacity: 0.85 }}>
          {[d.email, d.phone, d.location, d.linkedin, d.github].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.45fr" }}>
        {/* Main left */}
        <div style={{ padding: "20px 24px 20px 32px" }}>
          {d.summary && (
            <div style={{ marginBottom: 18 }}>
              <BoldSection label="ABOUT ME" accent="#7c3aed" />
              <p style={{ fontSize: 10.5, lineHeight: 1.65, color: "#374151", marginTop: 6 }}>{d.summary}</p>
            </div>
          )}
          {d.experience.filter(e => e.title || e.company).length > 0 && (
            <div>
              <BoldSection label="EXPERIENCE" accent="#7c3aed" />
              {d.experience.filter(e => e.title || e.company).map((exp, i) => (
                <div key={i} style={{ marginBottom: 14, paddingLeft: 8, borderLeft: "3px solid #7c3aed" }}>
                  <div style={{ fontWeight: 800, fontSize: 11 }}>{exp.title}</div>
                  <div style={{ fontSize: 10, color: "#7c3aed", marginBottom: 3 }}>{exp.company}  {exp.dates && <span style={{ color: "#9ca3af", fontWeight: 400 }}>· {exp.dates}</span>}</div>
                  {exp.bullets.filter(Boolean).map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 6, fontSize: 10, lineHeight: 1.5, marginBottom: 2 }}>
                      <span style={{ color: "#7c3aed", flexShrink: 0 }}>▸</span><span style={{ color: "#374151" }}>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right sidebar */}
        <div style={{ background: "#f5f3ff", padding: "20px 20px 20px 16px" }}>
          {d.skills.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <BoldSection label="SKILLS" accent="#7c3aed" />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                {d.skills.slice(0, 14).map((s, i) => (
                  <span key={i} style={{ background: "#7c3aed18", color: "#5b21b6", fontSize: 9.5, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {d.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <BoldSection label="EDUCATION" accent="#7c3aed" />
              {d.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 10.5 }}>{e.degree}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{e.school}</div>
                  {e.year && <div style={{ fontSize: 9.5, color: "#9ca3af" }}>{e.year}</div>}
                </div>
              ))}
            </div>
          )}
          {d.projects.filter(p => p.name).length > 0 && (
            <div>
              <BoldSection label="PROJECTS" accent="#7c3aed" />
              {d.projects.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ fontWeight: 700, fontSize: 10 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 9.5, color: "#6b7280", lineHeight: 1.4 }}>{p.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helper renderers ────────────────────────────────────────────────────
function SideSection({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, borderBottom: `1px solid ${color}50`, paddingBottom: 3, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
function SideItem({ label, value }: { label: string; value: string }) {
  return <div style={{ fontSize: 9.5, marginBottom: 2, opacity: 0.9 }}><span style={{ opacity: 0.6 }}>{label}: </span>{value}</div>;
}
function TplSection({ label, accent }: { label: string; accent: string }) {
  return <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 3, marginBottom: 6 }}>{label}</div>;
}
function MinSection({ label }: { label: string }) {
  return <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6366f1", marginBottom: 5, borderLeft: "3px solid #6366f1", paddingLeft: 6 }}>{label}</div>;
}
function ExecSection({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#1e40af", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>{label}</div>
      <hr style={{ border: "none", borderTop: "1px solid #1e40af", marginTop: 2, marginBottom: 8 }} />
    </div>
  );
}
function BoldSection({ label, accent }: { label: string; accent: string }) {
  return <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: accent, marginBottom: 8, textTransform: "uppercase" }}>{label}</div>;
}

// ── Smart fill suggestions from analysis result ───────────────────────────────
interface SmartFillSuggestion {
  id: string;
  section: string;
  label: string;
  description: string;
  preview: string;
  impactPts: number;
  apply: (d: BuilderData) => BuilderData;
}

function buildSmartFills(result?: AnalysisResult): SmartFillSuggestion[] {
  if (!result) return [];
  const fills: SmartFillSuggestion[] = [];
  const p = result.resumeProfile;

  // 1. Summary — use AI summary
  if (p?.summary && p.summary.length > 20) {
    fills.push({
      id: "fill-summary",
      section: "summary",
      label: "AI-Optimized Summary",
      description: "Replace summary with ATS-tuned version from analysis",
      preview: p.summary,
      impactPts: 4,
      apply: d => ({ ...d, summary: p.summary }),
    });
  }

  // 2. Skills — add matched + missing keywords
  const atsSkills = [...new Set([
    ...(result.matchedKeywords ?? []),
    ...(p?.topSkills ?? []),
    ...(result.missingKeywords ?? []).slice(0, 5),
  ])];
  if (atsSkills.length > 0) {
    fills.push({
      id: "fill-skills",
      section: "skills",
      label: "Add ATS Keywords to Skills",
      description: `Adds ${atsSkills.length} ATS-matched + missing keywords`,
      preview: atsSkills.join(", "),
      impactPts: 8,
      apply: d => ({
        ...d,
        skills: [...new Set([...d.skills, ...atsSkills])],
      }),
    });
  }

  // 3. Experience bullets — apply rewrite suggestions
  if ((result.rewriteSuggestions?.length ?? 0) > 0) {
    const map = new Map((result.rewriteSuggestions ?? []).map(r => [r.original.trim(), r.improved]));
    fills.push({
      id: "fill-bullets",
      section: "experience",
      label: "Apply Optimized Bullet Points",
      description: `Rewrites ${result.rewriteSuggestions?.length} bullets with metrics & keywords`,
      preview: result.rewriteSuggestions?.[0]?.improved ?? "",
      impactPts: 12,
      apply: d => ({
        ...d,
        experience: d.experience.map(exp => ({
          ...exp,
          bullets: exp.bullets.map(b => map.get(b.trim()) ?? b),
        })),
      }),
    });
  }

  // 4. Certifications from profile
  const certs = p?.certifications ?? [];
  if (certs.length > 0) {
    fills.push({
      id: "fill-certs",
      section: "certifications",
      label: "Import Certifications",
      description: `Adds ${certs.length} certs from your resume`,
      preview: certs.join(", "),
      impactPts: 3,
      apply: d => ({ ...d, certifications: [...new Set([...d.certifications, ...certs])] }),
    });
  }

  // 5. Languages
  const langs = p?.languages ?? [];
  if (langs.length > 0) {
    fills.push({
      id: "fill-langs",
      section: "languages",
      label: "Import Languages",
      description: `Adds ${langs.length} languages from your resume`,
      preview: langs.join(", "),
      impactPts: 2,
      apply: d => ({
        ...d,
        languages: langs.map(l => ({ language: l, proficiency: "Professional" })),
      }),
    });
  }

  // 6. ATS action plan — add as certifications/skills todo
  if ((result.actionPlan?.length ?? 0) > 0) {
    const highImpact = result.actionPlan.filter(a => a.impact === "high").map(a => a.task);
    if (highImpact.length > 0) {
      fills.push({
        id: "fill-goals",
        section: "skills",
        label: "Add High-Impact Missing Skills",
        description: `${highImpact.length} skills from your action plan that boost score most`,
        preview: highImpact.join("; "),
        impactPts: 6,
        apply: d => ({
          ...d,
          skills: [...new Set([...d.skills, ...(result.missingKeywords ?? [])])],
        }),
      });
    }
  }

  return fills;
}

// ── Init from analysis ────────────────────────────────────────────────────────
// Strategy: SAMPLE_DATA is the visual base (full template).
// Real extracted data REPLACES sections only when substantial (like Zety/Resume.io).
function initData(result?: AnalysisResult): BuilderData {
  // No result → show fully populated sample template
  if (!result) return { ...SAMPLE_DATA };

  const p = result.resumeProfile;

  // ── Build real experience entries ──────────────────────────────────────────
  const roles     = p?.roles     ?? [];
  const companies = p?.companies ?? [];
  // Collect ALL bullet originals — from rewrite suggestions
  const allBullets = (result.rewriteSuggestions?.map(r => r.original) ?? []).filter(Boolean);

  const bpr = Math.ceil(allBullets.length / Math.max(roles.length, 1));
  const realExp: ExpEntry[] = roles
    .filter(Boolean)
    .map((t, i) => ({
      id: `e${i}`,
      title: t,
      company: companies[i] ?? "",
      dates: "",
      bullets: allBullets.slice(i * bpr, (i + 1) * bpr).slice(0, 5),
    }))
    .filter(e => e.title);

  // ── ALWAYS use the user's real experience if ANY roles were detected ────────
  // Even if sparse — it's their data. They can edit it. Never replace with fake sample jobs.
  const useRealExp = realExp.length >= 1;

  // ── Real skills: put real skills FIRST, pad with sample only after ─────────
  const realSkills = p?.allSkills ?? p?.topSkills ?? [];
  const mergedSkills = [...new Set([...realSkills, ...SAMPLE_DATA.skills])].slice(0, 16);

  // ── Real projects ──────────────────────────────────────────────────────────
  const realProjects = (p?.projects ?? [])
    .filter(Boolean)
    .map((n, i) => ({ id: `p${i}`, name: n as string, description: "" }));

  // ── Build base: start from SAMPLE_DATA for visual richness ─────────────────
  // Then overlay with real data — real data ALWAYS wins when present.
  return {
    ...SAMPLE_DATA,

    // Contact — real data always wins; only use sample text if completely missing
    name:     p?.name?.trim()     || SAMPLE_DATA.name,
    email:    p?.email?.trim()    || SAMPLE_DATA.email,
    phone:    p?.phone?.trim()    || SAMPLE_DATA.phone,
    location: p?.location?.trim() || SAMPLE_DATA.location,
    linkedin: p?.linkedin?.trim() || SAMPLE_DATA.linkedin,
    github:   p?.github?.trim()   || SAMPLE_DATA.github,

    // Summary — use real if non-trivial
    summary: (p?.summary && p.summary.trim().length > 20)
      ? p.summary.trim()
      : SAMPLE_DATA.summary,

    // Experience — ALWAYS use real when any role was detected
    // Fall back to SAMPLE_DATA only when the AI extracted zero roles
    experience: useRealExp ? realExp : SAMPLE_DATA.experience,

    // Education — real if available
    education: (p?.educationLevel || p?.institution)
      ? [{ id: "edu0", degree: p?.educationLevel ?? "", school: p?.institution ?? "", year: p?.graduationYear ?? "" }]
      : SAMPLE_DATA.education,

    // Skills — real first, padded with sample tech stack
    skills: mergedSkills,

    // Projects — real if detected, else sample
    projects: realProjects.length > 0 ? realProjects : SAMPLE_DATA.projects,

    // Extended sections: use real if available, sample as visual filler otherwise
    certifications: (p?.certifications ?? []).length > 0
      ? p!.certifications!
      : SAMPLE_DATA.certifications,
    languages: (p?.languages ?? []).length > 0
      ? p!.languages!.map(l => ({ language: l, proficiency: "Professional" }))
      : SAMPLE_DATA.languages,
    awards:        SAMPLE_DATA.awards,
    volunteerWork: SAMPLE_DATA.volunteerWork,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  result?: AnalysisResult;
  jobDescription?: string;
  isDark?: boolean;
}

export function ResumeBuilder({ result, jobDescription, isDark = true }: Props) {
  const [data, setData] = useState<BuilderData>(() => initData(result));
  // Show hint when no resume uploaded, or when experience fell back to sample (no roles extracted)
  const hasRealRoles = (result?.resumeProfile?.roles ?? []).length >= 1;
  const hasSampleFill = !result || !hasRealRoles;
  const [templateIdx, setTemplateIdx] = useState(30); // default: ProFlex Teal
  const [templateCategory, setTemplateCategory] = useState("All");
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("smartfill");
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [modalSection, setModalSection] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  // Company ATS search
  const [companyInput, setCompanyInput] = useState("");
  const [companyRec, setCompanyRec] = useState<ReturnType<typeof lookupCompany> | null>(null);
  // Full template preview modal
  const [fullPreviewId, setFullPreviewId] = useState<number | null>(null);
  // Section management
  const [enabledSections, setEnabledSections] = useState<Set<string>>(
    () => new Set(["summary","experience","education","skills","projects","certifications","languages","awards","volunteer"])
  );
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    () => ["summary","experience","education","skills","projects","certifications","languages","awards","volunteer","custom"]
  );
  // Smart fill
  const smartFills = buildSmartFills(result);
  const [appliedFills, setAppliedFills] = useState<Set<string>>(new Set());
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.75);

  // Scale so the FULL A4 page (794×1123) fits inside the preview container — no scroll needed
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w < 100 || h < 50) return;
      // 24px padding each side (48px total) — compact but no overflow
      const scaleW = (w - 48) / 794;
      const scaleH = (h - 48) / 1123;
      setPreviewScale(Math.min(1, Math.max(0.35, Math.min(scaleW, scaleH))));
    };
    const t = setTimeout(compute, 60);
    const obs = new ResizeObserver(compute);
    obs.observe(el);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  // Always scroll preview back to top when loaded data changes
  useEffect(() => {
    if (previewContainerRef.current) {
      previewContainerRef.current.scrollTop = 0;
    }
  }, [data]);

  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t2 = isDark ? "rgba(240,244,255,0.85)" : "rgba(26,29,35,0.80)";
  const t3 = isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.09)";
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 14,
    background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
    border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.12)",
    color: t1, outline: "none",
  };

  // Update a field in the top-level data
  const setField = (key: keyof BuilderData, val: string) =>
    setData(d => ({ ...d, [key]: val }));

  // Experience helpers
  const setExp = (i: number, key: keyof ExpEntry, val: string) =>
    setData(d => ({ ...d, experience: d.experience.map((e, j) => j === i ? { ...e, [key]: val } : e) }));
  const setExpBullet = (ei: number, bi: number, val: string) =>
    setData(d => ({
      ...d, experience: d.experience.map((e, j) => j === ei
        ? { ...e, bullets: e.bullets.map((b, k) => k === bi ? val : b) } : e)
    }));
  const addExpBullet = (ei: number) =>
    setData(d => ({ ...d, experience: d.experience.map((e, j) => j === ei ? { ...e, bullets: [...e.bullets, ""] } : e) }));
  const removeExpBullet = (ei: number, bi: number) =>
    setData(d => ({ ...d, experience: d.experience.map((e, j) => j === ei ? { ...e, bullets: e.bullets.filter((_, k) => k !== bi) } : e) }));
  const addExp = () =>
    setData(d => ({ ...d, experience: [...d.experience, { id: `e${Date.now()}`, title: "", company: "", dates: "", bullets: [""] }] }));
  const removeExp = (i: number) =>
    setData(d => ({ ...d, experience: d.experience.filter((_, j) => j !== i) }));

  // Education helpers
  const setEdu = (i: number, key: keyof EduEntry, val: string) =>
    setData(d => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, [key]: val } : e) }));
  const addEdu = () =>
    setData(d => ({ ...d, education: [...d.education, { id: `edu${Date.now()}`, degree: "", school: "", year: "" }] }));
  const removeEdu = (i: number) =>
    setData(d => ({ ...d, education: d.education.filter((_, j) => j !== i) }));

  // Project helpers
  const setProj = (i: number, key: keyof ProjEntry, val: string) =>
    setData(d => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, [key]: val } : p) }));
  const addProj = () =>
    setData(d => ({ ...d, projects: [...d.projects, { id: `p${Date.now()}`, name: "", description: "" }] }));
  const removeProj = (i: number) =>
    setData(d => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }));

  // Skills helpers
  const [skillInput, setSkillInput] = useState("");
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !data.skills.includes(s)) { setData(d => ({ ...d, skills: [...d.skills, s] })); }
    setSkillInput("");
  };
  const removeSkill = (i: number) => setData(d => ({ ...d, skills: d.skills.filter((_, j) => j !== i) }));

  // Premium unlock
  const tryUnlock = () => {
    if (promoCode.toUpperCase() === "NEURAL2026" || promoCode.toUpperCase() === "FREE") {
      setIsPremium(true); setShowPayModal(false); setPromoCode(""); setPromoError("");
    } else {
      setPromoError("Invalid code. Try NEURAL2026 for a free demo.");
    }
  };

  // AI Optimize
  const optimize = useCallback(async () => {
    if (!isPremium) { setShowPayModal(true); return; }
    setIsOptimizing(true);
    try {
      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          jobDescription,
          missingKeywords: result?.missingKeywords ?? [],
          atsScore: result?.atsScore ?? 50,
        }),
      });
      const json: OptimizeResult = await res.json();
      setOptimizeResult(json);
      // Apply optimized bullets back to data
      if (json.optimizedSummary) setField("summary", json.optimizedSummary);
      if (json.optimizedBullets?.length) {
        const bulletMap = new Map(json.optimizedBullets.map(b => [b.original.trim(), b.improved]));
        setData(prev => ({
          ...prev,
          experience: prev.experience.map(exp => ({
            ...exp,
            bullets: exp.bullets.map(b => bulletMap.get(b.trim()) ?? b),
          })),
        }));
      }
    } catch { /* silent */ }
    finally { setIsOptimizing(false); }
  }, [isPremium, data, jobDescription, result]);

  // Print/Download
  const downloadPDF = () => {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Resume - ${data.name}</title>
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 210mm; min-height: 297mm; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>${content}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); w.close(); };
  };

  const TemplateComp = ALL_TEMPLATES[templateIdx]?.component ?? ALL_TEMPLATES[0].component;

  const sect = (key: string, label: string) => ({
    isOpen: activeSection === key,
    toggle: () => setActiveSection(activeSection === key ? "" : key),
    label,
  });

  return (
    <div style={{ display: "flex", height: "calc(100vh - 96px)", overflow: "hidden", gap: 0, position: "relative" }}>

      {/* ── Left: Editor Panel ── */}
      {/* Outer = scroll container (fixed height, overflow scroll) */}
      {/* Inner wrapper = flex column (grows to natural height so scroll triggers) */}
      <div style={{
        width: editorCollapsed ? 0 : 308,
        flexShrink: 0,
        height: "100%",
        overflowY: editorCollapsed ? "hidden" : "scroll",
        overflowX: "hidden",
        borderRight: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
        transition: "width 0.22s ease",
      }}>
      {/* Inner wrapper — flex column, not constrained in height so overflow works */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: editorCollapsed ? 0 : "6px 12px 32px 0",
        minWidth: 308,
      }}>

        {/* Template picker */}
        <div className="rounded-2xl p-4" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: t2 }}>Template</p>
            <button onClick={() => setShowTemplateGallery(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg,#059669,#0D9488)", color: "#fff", boxShadow: "0 3px 10px rgba(5,150,105,0.35)", border: "none" }}>
              <Sparkles size={10} /> Browse All {ALL_TEMPLATES.length}
            </button>
          </div>

          {/* Company ATS Search */}
          <div className="mb-3">
            <div className="relative">
              <input
                value={companyInput}
                onChange={e => {
                  setCompanyInput(e.target.value);
                  const rec = lookupCompany(e.target.value);
                  setCompanyRec(rec);
                  if (rec) setTemplateIdx(rec.templateId);
                }}
                placeholder="🏢 Target company (e.g. Google, Stripe...)"
                style={{ ...inputStyle, fontSize: 13 }}
              />
            </div>
            {companyRec && companyInput.length > 1 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 rounded-xl p-3"
                style={{ background: isDark ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.22)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,170,0.15)", color: "#00d4aa" }}>{companyRec.badge}</span>
                  <span className="text-[11px] font-semibold" style={{ color: t3 }}>ATS: {companyRec.ats}</span>
                </div>
                <p className="text-[11px] font-bold mb-1" style={{ color: t2 }}>ATS Formatting Tips:</p>
                <ul className="space-y-0.5">
                  {companyRec.tips.map((tip, i) => (
                    <li key={i} className="text-[11px] flex items-start gap-1" style={{ color: t3 }}>
                      <span style={{ color: "#00d4aa", flexShrink: 0, marginTop: 1 }}>›</span>{tip}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] mt-1.5 font-semibold" style={{ color: "#00d4aa" }}>
                  ✓ Template auto-switched to best match
                </p>
              </motion.div>
            )}
          </div>

          {/* Currently selected — mini A4 preview */}
          {(() => {
            const tpl = ALL_TEMPLATES[templateIdx];
            if (!tpl) return null;
            return (
              <div className="rounded-xl overflow-hidden cursor-pointer group"
                style={{ border: `2px solid ${tpl.accent}40`, background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", boxShadow: `0 4px 14px ${tpl.accent}18` }}
                onClick={() => setShowTemplateGallery(true)}>
                {/* Mini A4 thumbnail */}
                <div className="relative overflow-hidden" style={{ height: 120, background: "#fff" }}>
                  <div style={{ transform: "scale(0.145)", transformOrigin: "top left", width: 794, height: 1123, pointerEvents: "none", position: "absolute", top: 0, left: 0 }}>
                    <tpl.component d={SAMPLE_DATA} />
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(transparent, rgba(255,255,255,0.9))", pointerEvents: "none" }} />
                  {/* Hover: change template */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.40)" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: "rgba(5,150,105,0.9)", padding: "5px 12px", borderRadius: 8 }}>Change Template</span>
                  </div>
                </div>
                {/* Template info */}
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 2, background: tpl.accent, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: t1, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tpl.name}</p>
                    <button onClick={e => { e.stopPropagation(); setFullPreviewId(templateIdx); }}
                      style={{ padding: "3px 5px", borderRadius: 6, background: isDark ? "rgba(255,255,255,0.08)" : "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <Eye size={10} style={{ color: t3 }} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {tpl.atsBadges?.slice(0, 3).map(b => (
                      <span key={b} style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: "rgba(0,212,170,0.10)", color: "#00d4aa" }}>✓ {b}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* ── Full Preview Modal ── */}
        <AnimatePresence>
          {fullPreviewId !== null && (() => {
            const tpl = ALL_TEMPLATES[fullPreviewId];
            if (!tpl) return null;
            const PreviewComp = tpl.component;
            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
                onClick={() => setFullPreviewId(null)}>
                <motion.div initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 24 }}
                  onClick={e => e.stopPropagation()}
                  className="flex flex-col rounded-3xl overflow-hidden"
                  style={{ width: "min(900px, 96vw)", maxHeight: "94vh", background: isDark ? "#0d1420" : "#f3f4f6", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* Header */}
                  <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                    <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: tpl.accent }} />
                    <p className="font-black text-sm" style={{ color: t1 }}>{tpl.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${tpl.accent}18`, color: tpl.accent }}>{tpl.category}</span>
                    <span className="text-[10px] flex-1 truncate" style={{ color: t3 }}>{tpl.bestFor ?? ""}</span>
                    <div className="flex flex-wrap gap-1 mr-2">
                      {(tpl.atsBadges ?? []).slice(0, 4).map(b => (
                        <span key={b} className="text-[8.5px] px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa" }}>✓ {b}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => { setTemplateIdx(fullPreviewId); setShowTemplateGallery(false); setFullPreviewId(null); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
                      style={{ background: tpl.accent, color: "#fff", boxShadow: `0 4px 12px ${tpl.accent}40` }}>
                      Use Template
                    </button>
                    <button onClick={() => setFullPreviewId(null)}
                      className="ml-1 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: t2 }}>
                      ×
                    </button>
                  </div>
                  {/* A4 Preview — full scale scrollable */}
                  <div className="flex-1 overflow-auto p-6 flex justify-center"
                    style={{ background: isDark ? "rgba(0,0,0,0.35)" : "#e5e7eb" }}>
                    <div style={{ width: 794, flexShrink: 0, boxShadow: "0 8px 48px rgba(0,0,0,0.35)", borderRadius: 4, overflow: "hidden" }}>
                      <PreviewComp d={data.name ? data : SAMPLE_DATA} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* ── Smart Fill Panel ── */}
        {smartFills.length > 0 && (
          <EditorSection {...sect("smartfill", `⚡ Smart Fill  •  ${smartFills.length - appliedFills.size} suggestions`)} isDark={isDark}>
            <div className="space-y-2">
              {/* Total impact bar */}
              <div className="rounded-xl p-3 mb-1"
                style={{ background: isDark ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.04)", border: "1px solid rgba(0,212,170,0.2)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold" style={{ color: "#00d4aa" }}>Apply all suggestions</span>
                  <span className="text-sm font-black" style={{ color: "#00d4aa" }}>
                    +{smartFills.filter(f => !appliedFills.has(f.id)).reduce((s, f) => s + f.impactPts, 0)} pts projected
                  </span>
                </div>
                <button
                  onClick={() => {
                    let d = data;
                    smartFills.forEach(f => { if (!appliedFills.has(f.id)) d = f.apply(d); });
                    setData(d);
                    setAppliedFills(new Set(smartFills.map(f => f.id)));
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#00d4aa,#0D9488)", color: "#fff", boxShadow: "0 4px 12px rgba(0,212,170,0.3)" }}>
                  <Zap size={12} /> Apply All to Resume
                </button>
              </div>

              {/* Individual suggestions */}
              {smartFills.map(fill => {
                const applied = appliedFills.has(fill.id);
                const sectionDef = SECTION_DEFS.find(s => s.id === fill.section);
                return (
                  <motion.div key={fill.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3"
                    style={{
                      background: applied
                        ? (isDark ? "rgba(34,197,94,0.08)" : "#f0fdf4")
                        : (isDark ? "rgba(255,255,255,0.03)" : "#fafafa"),
                      border: applied
                        ? "1px solid rgba(34,197,94,0.25)"
                        : (isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)"),
                    }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span style={{ fontSize: 14 }}>{sectionDef?.emoji ?? "📌"}</span>
                          <span className="text-[12px] font-bold" style={{ color: t1 }}>{fill.label}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto"
                            style={{ background: "rgba(0,212,170,0.12)", color: "#00d4aa" }}>
                            +{fill.impactPts} pts
                          </span>
                        </div>
                        <p className="text-[11px] mb-1.5" style={{ color: t3 }}>{fill.description}</p>
                        <p className="text-[11px] italic line-clamp-2 leading-relaxed" style={{ color: isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.50)" }}>
                          {fill.preview}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!applied) {
                          setData(fill.apply(data));
                          setAppliedFills(prev => new Set([...prev, fill.id]));
                          setActiveSection(fill.section);
                        }
                      }}
                      className="mt-2 w-full py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: applied ? "rgba(34,197,94,0.12)" : (isDark ? "rgba(0,212,170,0.10)" : "rgba(0,212,170,0.08)"),
                        color: applied ? "#4ade80" : "#00d4aa",
                        border: applied ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(0,212,170,0.2)",
                      }}>
                      {applied ? <><CheckCircle size={10} /> Applied!</> : <><Zap size={10} /> Apply to Resume</>}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </EditorSection>
        )}

        {/* ── Section Manager ── */}
        <EditorSection {...sect("sections", "📋 Section Manager")} isDark={isDark}>
          <div className="space-y-1">
            <p className="text-[12px] mb-2" style={{ color: t3 }}>Toggle sections and drag to reorder. Enabled sections appear in your resume.</p>
            {sectionOrder.map((sid, idx) => {
              const def = SECTION_DEFS.find(s => s.id === sid);
              if (!def) return null;
              const enabled = enabledSections.has(sid);
              return (
                <div key={sid}
                  className="flex items-center gap-2 p-2 rounded-xl"
                  style={{
                    background: enabled ? (isDark ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.04)") : (isDark ? "rgba(255,255,255,0.02)" : "#fafafa"),
                    border: enabled ? "1px solid rgba(0,212,170,0.18)" : (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"),
                  }}>
                  {/* Toggle */}
                  <button
                    onClick={() => setEnabledSections(prev => {
                      const next = new Set(prev);
                      next.has(sid) ? next.delete(sid) : next.add(sid);
                      return next;
                    })}
                    className="w-8 h-4 rounded-full relative transition-all flex-shrink-0"
                    style={{ background: enabled ? "#00d4aa" : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)") }}>
                    <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all"
                      style={{ left: enabled ? "calc(100% - 14px)" : 2 }} />
                  </button>
                  <span style={{ fontSize: 15 }}>{def.emoji}</span>
                  <span className="text-sm font-semibold flex-1" style={{ color: enabled ? t1 : t3 }}>{def.label}</span>
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button disabled={idx === 0} onClick={() => {
                      const arr = [...sectionOrder];
                      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                      setSectionOrder(arr);
                    }} className="text-[11px] px-1 rounded" style={{ color: idx === 0 ? "transparent" : t3 }}>▲</button>
                    <button disabled={idx === sectionOrder.length - 1} onClick={() => {
                      const arr = [...sectionOrder];
                      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                      setSectionOrder(arr);
                    }} className="text-[11px] px-1 rounded" style={{ color: idx === sectionOrder.length - 1 ? "transparent" : t3 }}>▼</button>
                  </div>
                </div>
              );
            })}
          </div>
        </EditorSection>

        {/* ── Section Quick-Open Buttons → open popup modal ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: cardBorder, boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "11px 14px 9px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 6 }}>
            <Edit3 size={13} style={{ color: "#00d4aa" }} />
            <p style={{ fontSize: 11.5, fontWeight: 800, color: t3, textTransform: "uppercase", letterSpacing: 1.8, margin: 0 }}>Edit Sections</p>
          </div>
          {[
            { key: "contact",        emoji: "📋", label: "Contact Info" },
            { key: "summary",        emoji: "📝", label: "Summary" },
            { key: "experience",     emoji: "💼", label: `Experience (${data.experience.length})` },
            { key: "education",      emoji: "🎓", label: `Education (${data.education.length})` },
            { key: "skills",         emoji: "⚡", label: `Skills (${data.skills.length})` },
            { key: "projects",       emoji: "🚀", label: `Projects (${data.projects.length})` },
            { key: "certifications", emoji: "🏆", label: `Certifications (${data.certifications.length})` },
            { key: "languages",      emoji: "🌐", label: `Languages (${data.languages.length})` },
            { key: "awards",         emoji: "⭐", label: `Awards (${data.awards.length})` },
            { key: "volunteer",      emoji: "🤝", label: "Volunteer Work" },
            ...data.customSections.map(s => ({ key: `custom-${s.id}`, emoji: "➕", label: s.title || "Custom Section" })),
          ].map((item, idx, arr) => (
            <button key={item.key}
              onClick={() => setModalSection(item.key)}
              className="w-full flex items-center gap-2.5 text-left transition-all"
              style={{
                padding: "13px 14px",
                background: "transparent",
                borderBottom: idx < arr.length - 1 ? (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)") : "none",
                borderLeft: modalSection === item.key ? "3px solid #00d4aa" : "3px solid transparent",
              }}>
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: t1, flex: 1 }}>{item.label}</span>
              <ChevronRight size={15} style={{ color: t3 }} />
            </button>
          ))}
          {/* Add custom section */}
          <button
            onClick={() => setModalSection("add-section")}
            className="w-full flex items-center gap-2.5 text-left transition-all"
            style={{ padding: "13px 14px", background: isDark ? "rgba(0,212,170,0.04)" : "rgba(0,212,170,0.03)", borderTop: "1px dashed rgba(0,212,170,0.25)" }}>
            <span style={{ fontSize: 16 }}>➕</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#00d4aa", flex: 1 }}>Add New Section</span>
            <Plus size={15} style={{ color: "#00d4aa" }} />
          </button>
        </div>

        {/* AI Optimizer (premium) */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
          border: isPremium ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(124,58,237,0.18)",
          boxShadow: isPremium ? "0 0 24px rgba(124,58,237,0.18)" : "none",
        }}>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isPremium ? <Unlock size={13} style={{ color: "#a78bfa" }} /> : <Lock size={13} style={{ color: "#a78bfa" }} />}
              <p className="text-sm font-bold" style={{ color: t1 }}>AI Auto-Optimizer</p>
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: isPremium ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.15)", color: isPremium ? "#4ade80" : "#c084fc" }}>
                {isPremium ? <><CheckCircle size={8} /> Unlocked</> : <><Crown size={8} /> Premium</>}
              </span>
            </div>
            <p className="text-[12px] mb-3" style={{ color: t3 }}>
              {isPremium
                ? "AI will rewrite all bullets and your summary to maximize ATS score for this job."
                : "Rewrites every bullet point with job keywords, action verbs, and metrics to maximize your ATS score."}
            </p>

            {optimizeResult && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 mb-3 flex items-center gap-3"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <Zap size={14} style={{ color: "#4ade80" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#4ade80" }}>
                    +{optimizeResult.scoreGain} pts → {optimizeResult.predictedScore}/100 predicted
                  </p>
                  <p className="text-[12px]" style={{ color: t3 }}>{optimizeResult.changeCount} bullets rewritten · {optimizeResult.keywordsAdded?.length ?? 0} keywords added</p>
                </div>
              </motion.div>
            )}

            <button
              onClick={optimize}
              disabled={isOptimizing}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: isPremium
                  ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                  : "rgba(124,58,237,0.12)",
                color: isPremium ? "#fff" : "#a78bfa",
                border: isPremium ? "none" : "1px solid rgba(124,58,237,0.3)",
                opacity: isOptimizing ? 0.7 : 1,
                boxShadow: isPremium ? "0 4px 14px rgba(124,58,237,0.35)" : "none",
              }}
            >
              {isOptimizing
                ? <><RefreshCw size={12} className="animate-spin" /> Optimizing…</>
                : isPremium
                  ? <><Wand2 size={12} /> Auto-Optimize Resume</>
                  : <><Crown size={12} /> Unlock & Optimize — ₹299/mo</>
              }
            </button>
          </div>
        </div>
      </div>{/* end inner flex wrapper */}
      </div>{/* end outer scroll container */}

      {/* ── Right: Preview Panel ── */}
      <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", gap: 0, paddingLeft: editorCollapsed ? 0 : 12 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, paddingBottom: 10, flexWrap: "wrap" }}>
          {/* Collapse/expand editor toggle */}
          <button
            onClick={() => setEditorCollapsed(v => !v)}
            title={editorCollapsed ? "Show editor" : "Hide editor — maximize preview"}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: editorCollapsed ? "rgba(0,212,170,0.12)" : (isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"),
              color: editorCollapsed ? "#00d4aa" : t2,
              border: editorCollapsed ? "1px solid rgba(0,212,170,0.3)" : cardBorder,
            }}>
            {editorCollapsed ? <><Maximize2 size={14} /> Show Editor</> : <><Minimize2 size={14} /> Full Preview</>}
          </button>

          {/* Template quick-pick pill */}
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6", color: t2, border: cardBorder, maxWidth: 220 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: ALL_TEMPLATES[templateIdx]?.accent ?? "#0D9488", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ALL_TEMPLATES[templateIdx]?.name ?? "Template"}</span>
            <ChevronDown size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Scale info */}
          <span style={{ fontSize: 12, color: t3, padding: "0 6px" }}>
            A4 · {Math.round(previewScale * 100)}%
          </span>

          {!isPremium && (
            <button onClick={() => setShowPayModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(124,58,237,0.10)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.22)" }}>
              <Crown size={13} /> Upgrade
            </button>
          )}

          <button onClick={downloadPDF}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black transition-all"
            style={{
              background: "linear-gradient(135deg,#00d4aa,#0D9488)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(0,212,170,0.38)",
              letterSpacing: 0.2,
            }}>
            <Download size={14} /> Download PDF
          </button>
        </div>

        {/* A4 Preview — auto-scales to fit full page, centered, no scroll */}
        <div ref={previewContainerRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            background: isDark
              ? "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.04) 0%, rgba(0,0,0,0.45) 60%)"
              : "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.06) 0%, #d1d5db 60%)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.10)",
          }}>
          {/* Sample-data hint banner */}
          {hasSampleFill && (
            <div style={{
              padding: "7px 14px",
              borderRadius: 10,
              background: "rgba(0,212,170,0.10)",
              border: "1px solid rgba(0,212,170,0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: 794 * previewScale,
              width: "100%",
              boxSizing: "border-box",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 13 }}>💡</span>
              <span style={{ fontSize: 13, color: "#00d4aa", fontWeight: 600 }}>
                {result
                  ? "Sections below couldn't be extracted — click any section to edit your real data."
                  : "Preview shows sample data. Upload your resume or edit sections to fill in your real details."}
              </span>
            </div>
          )}

          {/* Clip-box: full A4 scaled to fit the container, always showing from the top */}
          <div style={{
            width:  794 * previewScale,
            height: 1123 * previewScale,
            flexShrink: 0,
            position: "relative",
            boxShadow: `0 16px 64px rgba(0,0,0,${isDark ? "0.65" : "0.22"})`,
            borderRadius: 4,
            overflow: "hidden",
          }}>
            <div ref={previewRef}
              style={{
                width: 794,
                height: 1123,
                background: "#ffffff",
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                position: "absolute",
                top: 0,
                left: 0,
              }}>
              <TemplateComp d={data} />
            </div>
          </div>
        </div>
      </div>

        {/* ── Template Gallery Full-Screen Popup ── */}
        <AnimatePresence>
          {showTemplateGallery && (
            <motion.div
              key="tpl-gallery-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 75, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 28px" }}
              onClick={e => { if (e.target === e.currentTarget) setShowTemplateGallery(false); }}
            >
              <motion.div
                key="tpl-gallery-card"
                initial={{ scale: 0.96, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.96, y: 24, opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={e => e.stopPropagation()}
                style={{ width: "100%", maxWidth: 1240, maxHeight: "92vh", background: "#ffffff", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.55)" }}
              >
                {/* Header */}
                <div style={{ padding: "22px 28px 18px", background: "#fff", borderBottom: "1px solid #f0f0f0", flexShrink: 0, display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#111827", letterSpacing: -0.5 }}>Choose a Template</h2>
                    <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#6b7280" }}>{ALL_TEMPLATES.length} ATS-optimised templates — click any to apply instantly.</p>
                  </div>
                  {/* Category filter tabs */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setTemplateCategory(cat)}
                        style={{ padding: "5px 13px", borderRadius: 100, fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.15s", background: templateCategory === cat ? "#059669" : "#f3f4f6", color: templateCategory === cat ? "#fff" : "#374151" }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowTemplateGallery(false)}
                    style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <X size={16} style={{ color: "#374151" }} />
                  </button>
                </div>

                {/* Template grid */}
                <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 32px", background: "#f9fafb" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
                    {ALL_TEMPLATES.filter(t => templateCategory === "All" || t.category === templateCategory).map(tpl => {
                      const isSel = templateIdx === tpl.id;
                      return (
                        <div key={tpl.id} className="group"
                          style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: `2px solid ${isSel ? "#059669" : "transparent"}`, boxShadow: isSel ? "0 0 0 3px rgba(5,150,105,0.12), 0 4px 16px rgba(0,0,0,0.09)" : "0 2px 10px rgba(0,0,0,0.07)", transition: "box-shadow 0.18s, border-color 0.18s", cursor: "pointer" }}>
                          {/* A4 Preview */}
                          <div className="relative overflow-hidden" style={{ height: 215, background: "#fff" }}
                            onClick={() => { setTemplateIdx(tpl.id); setShowTemplateGallery(false); }}>
                            <div style={{ transform: "scale(0.29)", transformOrigin: "top left", width: 794, height: 1123, pointerEvents: "none", position: "absolute", top: 0, left: 0 }}>
                              <tpl.component d={SAMPLE_DATA} />
                            </div>
                            {/* Bottom fade */}
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, rgba(255,255,255,0.92))", pointerEvents: "none" }} />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
                              style={{ background: "rgba(0,0,0,0.40)" }}>
                              <span style={{ padding: "9px 18px", borderRadius: 10, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 800, boxShadow: "0 4px 14px rgba(5,150,105,0.45)" }}>
                                Use this template
                              </span>
                            </div>
                            {/* Selected badge */}
                            {isSel && (
                              <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(5,150,105,0.5)" }}>
                                <CheckCircle size={13} style={{ color: "#fff" }} />
                              </div>
                            )}
                          </div>
                          {/* Card footer */}
                          <div style={{ padding: "11px 13px 13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 3, background: tpl.accent, flexShrink: 0 }} />
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#111827", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tpl.name}</p>
                              {isSel && <span style={{ fontSize: 9, fontWeight: 700, color: "#059669", background: "rgba(5,150,105,0.10)", padding: "2px 6px", borderRadius: 100, flexShrink: 0 }}>Active</span>}
                            </div>
                            <p style={{ margin: "0 0 7px", fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tpl.bestFor ?? ""}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 9 }}>
                              {(tpl.atsBadges ?? []).slice(0, 2).map(b => (
                                <span key={b} style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: "rgba(5,150,105,0.08)", color: "#059669" }}>✓ {b}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button
                                onClick={() => { setTemplateIdx(tpl.id); setShowTemplateGallery(false); }}
                                style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, background: isSel ? "#059669" : "#f3f4f6", color: isSel ? "#fff" : "#374151", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
                                {isSel ? "✓ Selected" : "Use Template"}
                              </button>
                              <button
                                onClick={() => setFullPreviewId(tpl.id)}
                                style={{ padding: "6px 9px", borderRadius: 8, background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Eye size={12} style={{ color: "#6b7280" }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section Edit Modal ── */}
        <AnimatePresence>
          {modalSection && (
            <motion.div
              key="section-modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={e => { if (e.target === e.currentTarget) setModalSection(null); }}
              style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <motion.div
                key="section-modal-card"
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                style={{ background: isDark ? "#0d1420" : "#ffffff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 100px rgba(0,0,0,0.5)", border: cardBorder }}>

                {/* Modal header */}
                {(() => {
                  const sectionMeta: Record<string, { emoji: string; title: string }> = {
                    contact: { emoji: "📋", title: "Contact Info" },
                    summary: { emoji: "📝", title: "Professional Summary" },
                    experience: { emoji: "💼", title: "Work Experience" },
                    education: { emoji: "🎓", title: "Education" },
                    skills: { emoji: "⚡", title: "Skills & Technologies" },
                    projects: { emoji: "🚀", title: "Projects & Portfolio" },
                    certifications: { emoji: "🏆", title: "Certifications" },
                    languages: { emoji: "🌐", title: "Languages" },
                    awards: { emoji: "⭐", title: "Awards & Achievements" },
                    volunteer: { emoji: "🤝", title: "Volunteer Work" },
                    "add-section": { emoji: "➕", title: "Add New Section" },
                  };
                  const meta = sectionMeta[modalSection] ?? { emoji: "➕", title: modalSection.replace("custom-", "Custom: ") };
                  return (
                    <div style={{ padding: "18px 24px 14px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa" }}>
                      <span style={{ fontSize: 20 }}>{meta.emoji}</span>
                      <span style={{ fontSize: 17, fontWeight: 800, color: t1, flex: 1 }}>{meta.title}</span>
                      <button onClick={() => setModalSection(null)} className="p-1.5 rounded-lg transition-all" style={{ color: t3, background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}>
                        <X size={16} />
                      </button>
                    </div>
                  );
                })()}

                {/* Modal body — scrollable */}
                <div style={{ overflowY: "auto", padding: "20px 24px 28px", flex: 1 }} className="space-y-4">

                  {/* CONTACT */}
                  {modalSection === "contact" && (
                    <div className="space-y-3">
                      {(["name", "email", "phone", "location", "linkedin", "github"] as (keyof BuilderData)[]).map(k => (
                        <div key={k}>
                          <label className="text-[13px] font-semibold capitalize block mb-1" style={{ color: t3 }}>{k}</label>
                          <input value={data[k] as string} onChange={e => setField(k, e.target.value)} placeholder={k} style={inputStyle} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUMMARY */}
                  {modalSection === "summary" && (
                    <div>
                      <p className="text-[13px] mb-2" style={{ color: t3 }}>Write 2–3 sentences summarising your experience, strengths, and career goal.</p>
                      <textarea rows={6} value={data.summary} onChange={e => setField("summary", e.target.value)}
                        placeholder="Full-Stack Engineer with 5+ years building..."
                        style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                  )}

                  {/* EXPERIENCE */}
                  {modalSection === "experience" && (
                    <div className="space-y-4">
                      {data.experience.map((exp, ei) => (
                        <div key={exp.id} className="rounded-xl p-4 space-y-3"
                          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Job Title</label>
                              <input value={exp.title} onChange={e => setExp(ei, "title", e.target.value)} placeholder="Software Engineer" style={inputStyle} />
                            </div>
                            <div>
                              <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Company</label>
                              <input value={exp.company} onChange={e => setExp(ei, "company", e.target.value)} placeholder="Acme Corp" style={inputStyle} />
                            </div>
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Dates</label>
                            <input value={exp.dates} onChange={e => setExp(ei, "dates", e.target.value)} placeholder="Jan 2022 – Present" style={inputStyle} />
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Bullet Points</label>
                            <div className="space-y-2">
                              {exp.bullets.map((b, bi) => (
                                <div key={bi} className="flex gap-2">
                                  <input value={b} onChange={e => setExpBullet(ei, bi, e.target.value)}
                                    placeholder={`Achievement ${bi + 1}...`} style={{ ...inputStyle, flex: 1 }} />
                                  <button onClick={() => removeExpBullet(ei, bi)} style={{ color: "#ef4444", padding: 6 }}><Trash2 size={13} /></button>
                                </div>
                              ))}
                              <button onClick={() => addExpBullet(ei)} className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-lg"
                                style={{ background: "rgba(0,212,170,0.08)", color: "#00d4aa", border: "1px dashed rgba(0,212,170,0.3)" }}>
                                <Plus size={11} /> Add bullet
                              </button>
                            </div>
                          </div>
                          {data.experience.length > 1 && (
                            <button onClick={() => removeExp(ei)} className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                              style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                              <Trash2 size={11} /> Remove this role
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={addExp} className="flex items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl w-full justify-center"
                        style={{ background: "rgba(0,212,170,0.08)", border: "1px dashed rgba(0,212,170,0.35)", color: "#00d4aa" }}>
                        <Plus size={13} /> Add Work Experience
                      </button>
                    </div>
                  )}

                  {/* EDUCATION */}
                  {modalSection === "education" && (
                    <div className="space-y-3">
                      {data.education.map((edu, i) => (
                        <div key={edu.id} className="rounded-xl p-4 space-y-3"
                          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Degree</label>
                            <input value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)} placeholder="B.S. Computer Science" style={inputStyle} />
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>School / University</label>
                            <input value={edu.school} onChange={e => setEdu(i, "school", e.target.value)} placeholder="MIT" style={inputStyle} />
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Graduation Year</label>
                            <input value={edu.year} onChange={e => setEdu(i, "year", e.target.value)} placeholder="2022" style={inputStyle} />
                          </div>
                          {data.education.length > 1 && (
                            <button onClick={() => removeEdu(i)} className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                              style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                              <Trash2 size={11} /> Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={addEdu} className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full justify-center"
                        style={{ background: "rgba(99,102,241,0.08)", border: "1px dashed rgba(99,102,241,0.35)", color: "#a78bfa" }}>
                        <Plus size={13} /> Add Education
                      </button>
                    </div>
                  )}

                  {/* SKILLS */}
                  {modalSection === "skills" && (
                    <div className="space-y-3">
                      <p className="text-[13px]" style={{ color: t3 }}>Type a skill and press Enter or click + to add it.</p>
                      <div className="flex gap-2">
                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addSkill()}
                          placeholder="e.g. TypeScript, React, Docker..."
                          style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={addSkill} className="px-4 py-2 rounded-xl text-sm font-bold"
                          style={{ background: "rgba(0,212,170,0.15)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.3)" }}>+</button>
                      </div>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[80px]"
                        style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                        {data.skills.length === 0 && <p className="text-[11px] italic" style={{ color: t3 }}>No skills yet — add some above.</p>}
                        {data.skills.map((s, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-semibold"
                            style={{ background: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.10)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.25)" }}>
                            {s}
                            <button onClick={() => removeSkill(i)} style={{ opacity: 0.7 }}><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROJECTS */}
                  {modalSection === "projects" && (
                    <div className="space-y-3">
                      {data.projects.map((p, i) => (
                        <div key={p.id} className="rounded-xl p-4 space-y-3"
                          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Project Name</label>
                            <input value={p.name} onChange={e => setProj(i, "name", e.target.value)} placeholder="My Awesome Project" style={inputStyle} />
                          </div>
                          <div>
                            <label className="text-[12px] font-semibold block mb-1" style={{ color: t3 }}>Description</label>
                            <textarea rows={2} value={p.description} onChange={e => setProj(i, "description", e.target.value)}
                              placeholder="Short description with impact..." style={{ ...inputStyle, resize: "none" }} />
                          </div>
                          <button onClick={() => removeProj(i)} className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                            style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      ))}
                      <button onClick={addProj} className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full justify-center"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px dashed rgba(245,158,11,0.35)", color: "#f59e0b" }}>
                        <Plus size={13} /> Add Project
                      </button>
                    </div>
                  )}

                  {/* CERTIFICATIONS */}
                  {modalSection === "certifications" && (
                    <div className="space-y-3">
                      {data.certifications.map((c, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={c} onChange={e => setData(d => ({ ...d, certifications: d.certifications.map((x, j) => j === i ? e.target.value : x) }))}
                            placeholder="e.g. AWS Solutions Architect" style={{ ...inputStyle, flex: 1 }} />
                          <button onClick={() => setData(d => ({ ...d, certifications: d.certifications.filter((_, j) => j !== i) }))} style={{ color: "#ef4444" }}><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => setData(d => ({ ...d, certifications: [...d.certifications, ""] }))}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full justify-center"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px dashed rgba(245,158,11,0.35)", color: "#f59e0b" }}>
                        <Plus size={13} /> Add Certification
                      </button>
                    </div>
                  )}

                  {/* LANGUAGES */}
                  {modalSection === "languages" && (
                    <div className="space-y-3">
                      {data.languages.map((l, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input value={l.language} onChange={e => setData(d => ({ ...d, languages: d.languages.map((x, j) => j === i ? { ...x, language: e.target.value } : x) }))}
                            placeholder="Language" style={{ ...inputStyle, flex: 1 }} />
                          <select value={l.proficiency} onChange={e => setData(d => ({ ...d, languages: d.languages.map((x, j) => j === i ? { ...x, proficiency: e.target.value } : x) }))}
                            style={{ ...inputStyle, width: 150 }}>
                            {["Native","Fluent","Professional","Conversational","Basic"].map(p => <option key={p}>{p}</option>)}
                          </select>
                          <button onClick={() => setData(d => ({ ...d, languages: d.languages.filter((_, j) => j !== i) }))} style={{ color: "#ef4444" }}><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => setData(d => ({ ...d, languages: [...d.languages, { language: "", proficiency: "Professional" }] }))}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full justify-center"
                        style={{ background: "rgba(56,189,248,0.08)", border: "1px dashed rgba(56,189,248,0.35)", color: "#38bdf8" }}>
                        <Plus size={13} /> Add Language
                      </button>
                    </div>
                  )}

                  {/* AWARDS */}
                  {modalSection === "awards" && (
                    <div className="space-y-3">
                      {data.awards.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={a} onChange={e => setData(d => ({ ...d, awards: d.awards.map((x, j) => j === i ? e.target.value : x) }))}
                            placeholder="e.g. Employee of the Year 2024" style={{ ...inputStyle, flex: 1 }} />
                          <button onClick={() => setData(d => ({ ...d, awards: d.awards.filter((_, j) => j !== i) }))} style={{ color: "#ef4444" }}><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => setData(d => ({ ...d, awards: [...d.awards, ""] }))}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl w-full justify-center"
                        style={{ background: "rgba(234,179,8,0.08)", border: "1px dashed rgba(234,179,8,0.35)", color: "#eab308" }}>
                        <Plus size={13} /> Add Award
                      </button>
                    </div>
                  )}

                  {/* VOLUNTEER */}
                  {modalSection === "volunteer" && (
                    <div>
                      <p className="text-[11px] mb-2" style={{ color: t3 }}>Describe any volunteer work, community involvement, or pro-bono projects.</p>
                      <textarea rows={5} value={data.volunteerWork}
                        onChange={e => setData(d => ({ ...d, volunteerWork: e.target.value }))}
                        placeholder="Mentor at Code.org — weekly 1-on-1 sessions teaching Python..."
                        style={{ ...inputStyle, resize: "vertical" }} />
                    </div>
                  )}

                  {/* CUSTOM SECTION EDITOR */}
                  {modalSection?.startsWith("custom-") && (() => {
                    const sid = modalSection.replace("custom-", "");
                    const idx = data.customSections.findIndex(s => s.id === sid);
                    if (idx === -1) return null;
                    const sec = data.customSections[idx];
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold block mb-1" style={{ color: t3 }}>Section Title</label>
                          <input value={sec.title}
                            onChange={e => setData(d => ({ ...d, customSections: d.customSections.map((x, j) => j === idx ? { ...x, title: e.target.value } : x) }))}
                            placeholder="e.g. Publications, Patents, Hobbies..." style={inputStyle} />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold block mb-1" style={{ color: t3 }}>Content</label>
                          <textarea rows={5}
                            value={sec.content}
                            onChange={e => setData(d => ({ ...d, customSections: d.customSections.map((x, j) => j === idx ? { ...x, content: e.target.value } : x) }))}
                            placeholder="Write the section content here..."
                            style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                        <button onClick={() => { setData(d => ({ ...d, customSections: d.customSections.filter((_, j) => j !== idx) })); setModalSection(null); }}
                          className="text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                          style={{ color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                          <Trash2 size={11} /> Delete this section
                        </button>
                      </div>
                    );
                  })()}

                  {/* ADD NEW SECTION */}
                  {modalSection === "add-section" && (
                    <div className="space-y-4">
                      <p className="text-[14px]" style={{ color: t3 }}>Give your new section a name. It will appear on your resume and you can write its content after adding it.</p>
                      <div>
                        <label className="text-[13px] font-semibold block mb-1.5" style={{ color: t3 }}>Section Name</label>
                        <input
                          value={newSectionName}
                          onChange={e => setNewSectionName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && newSectionName.trim()) {
                              const id = `cs${Date.now()}`;
                              setData(d => ({ ...d, customSections: [...d.customSections, { id, title: newSectionName.trim(), content: "" }] }));
                              setModalSection(`custom-${id}`);
                              setNewSectionName("");
                            }
                          }}
                          placeholder="e.g. Publications, Patents, Languages, Hobbies..."
                          style={{ ...inputStyle, fontSize: 16 }}
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Publications", "Patents", "Hobbies", "References", "Achievements", "Conferences"].map(preset => (
                          <button key={preset} onClick={() => setNewSectionName(preset)}
                            className="text-sm px-4 py-1.5 rounded-full font-semibold transition-all"
                            style={{ background: newSectionName === preset ? "rgba(0,212,170,0.15)" : (isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"), color: newSectionName === preset ? "#00d4aa" : t3, border: newSectionName === preset ? "1px solid rgba(0,212,170,0.3)" : "1px solid transparent" }}>
                            {preset}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!newSectionName.trim()}
                        onClick={() => {
                          if (!newSectionName.trim()) return;
                          const id = `cs${Date.now()}`;
                          setData(d => ({ ...d, customSections: [...d.customSections, { id, title: newSectionName.trim(), content: "" }] }));
                          setModalSection(`custom-${id}`);
                          setNewSectionName("");
                        }}
                        className="w-full py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ background: newSectionName.trim() ? "linear-gradient(135deg,#00d4aa,#0D9488)" : (isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"), color: newSectionName.trim() ? "#fff" : t3, boxShadow: newSectionName.trim() ? "0 4px 14px rgba(0,212,170,0.3)" : "none" }}>
                        <Plus size={15} /> Create "{newSectionName || "…"}" Section
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* ── Premium Modal ── */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowPayModal(false)}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="rounded-3xl p-8 w-full max-w-md"
              style={{ background: isDark ? "#0d1420" : "#fff", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 60px rgba(124,58,237,0.2)" }}>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                  <Wand2 size={22} style={{ color: "#fff" }} />
                </div>
                <div>
                  <h2 className="text-xl font-black" style={{ color: t1 }}>AI Auto-Optimizer</h2>
                  <p className="text-xs" style={{ color: t3 }}>Maximize your ATS score instantly</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 my-5">
                {[
                  "Rewrites every bullet with action verbs + metrics",
                  "Weaves in missing keywords naturally",
                  "Predicts ATS score boost before applying",
                  "Unlimited optimizations per month",
                  "All 4 resume templates included",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: t2 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="rounded-2xl p-4 mb-4 text-center"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <p className="text-3xl font-black" style={{ color: "#a78bfa" }}>₹299<span className="text-sm font-medium">/mo</span></p>
                <p className="text-xs mt-1" style={{ color: t3 }}>Cancel anytime · Instant access</p>
              </div>

              <button className="w-full py-3 rounded-2xl text-sm font-black mb-3 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", boxShadow: "0 6px 20px rgba(124,58,237,0.4)" }}>
                <ArrowUpRight size={14} /> Upgrade Now — ₹299/mo
              </button>

              <div className="relative mb-3">
                <hr style={{ border: "none", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-[10px]"
                  style={{ background: isDark ? "#0d1420" : "#fff", color: t3 }}>or enter demo code</span>
              </div>

              <div className="flex gap-2">
                <input value={promoCode} onChange={e => setPromoCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && tryUnlock()}
                  placeholder="Enter code (try: NEURAL2026)"
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={tryUnlock} className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] mt-1.5" style={{ color: "#ef4444" }}>{promoError}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Editor Section (Accordion) ────────────────────────────────────────────────
function EditorSection({
  label, isOpen, toggle, isDark, children
}: {
  label: string; isOpen: boolean; toggle: () => void; isDark: boolean; children: React.ReactNode;
}) {
  const t1 = isDark ? "#f0f4ff" : "#1A1D23";
  const t3 = isDark ? "rgba(240,244,255,0.55)" : "rgba(26,29,35,0.55)";
  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.09)",
    }}>
      <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="text-sm font-bold tracking-wide" style={{ color: t1 }}>{label}</span>
        {isOpen
          ? <ChevronUp size={16} style={{ color: t3 }} />
          : <ChevronDown size={16} style={{ color: t3 }} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
