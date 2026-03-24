import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const FAST_MODEL = "llama-3.1-8b-instant";
const SMART_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

async function runAgent<T>(
  agentName: string,
  systemPrompt: string,
  userContent: string,
  model: string
): Promise<T> {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error(`${agentName} returned no content`);
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`${agentName} returned invalid JSON`);
  }
}

// ──── Agent 1: Resume Extractor ────────────────────────────────
interface ResumeData {
  name: string;
  email: string;
  topSkills: string[];
  allSkills: string[];
  experienceYears: number;
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  educationLevel: string;
  roles: string[];
  summary: string;
  bulletPoints: string[];
}

const AGENT1_PROMPT = `You are a precise resume data extractor.
Extract structured information from the resume text and return ONLY this JSON:
{
  "name": "<full name or 'Unknown'>",
  "email": "<email or 'Not provided'>",
  "topSkills": [<top 8 skills as strings>],
  "allSkills": [<all skills mentioned>],
  "experienceYears": <integer, total years of work experience>,
  "experienceLevel": <"entry" if 0-2 yrs, "mid" if 2-5, "senior" if 5-10, "lead" if 10+>,
  "educationLevel": "<highest degree, e.g. 'B.S. Computer Science'>",
  "roles": [<list of job titles held>],
  "summary": "<2-sentence summary of this candidate's profile>",
  "bulletPoints": [<all bullet points from experience section, verbatim>]
}`;

// ──── Agent 2: JD Analyzer ────────────────────────────────────
interface JDData {
  title: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceRequired: number;
  responsibilities: string[];
  keywords: string[];
}

const AGENT2_PROMPT = `You are a precise job description analyzer.
Extract structured requirements and return ONLY this JSON:
{
  "title": "<job title>",
  "requiredSkills": [<all must-have skills and technologies>],
  "niceToHaveSkills": [<preferred but optional skills>],
  "experienceRequired": <integer years required>,
  "responsibilities": [<top 5 key responsibilities>],
  "keywords": [<all important technical keywords and phrases>]
}`;

// ──── Agent 3: Gap Analyzer + Scorer ─────────────────────────
interface GapData {
  atsScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
  skillsMatchPercent: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  alternativeRoles: Array<{ title: string; matchPercent: number; reason: string }>;
}

const AGENT3_PROMPT = `You are an expert ATS scoring engine and career analyst.
Given structured resume data and job description data, perform deep gap analysis.
Return ONLY this JSON:
{
  "atsScore": <integer 0-100, realistic ATS score — most resumes score 35-75>,
  "grade": <"A" if 85+, "B" if 70-84, "C" if 50-69, "D" if 35-49, "F" if below 35>,
  "verdict": "<one punchy, specific sentence verdict about this resume for this specific role>",
  "skillsMatchPercent": <integer 0-100>,
  "missingKeywords": [<exactly 6 critical keywords from JD missing in resume>],
  "matchedKeywords": [<keywords present in both resume and JD>],
  "strengths": [<exactly 4 specific strengths of this resume for this role>],
  "weaknesses": [<exactly 4 critical weaknesses>],
  "alternativeRoles": [
    { "title": "<job role>", "matchPercent": <int>, "reason": "<why resume fits this better>" },
    <exactly 3 alternative roles this resume may be better suited for>
  ]
}`;

// ──── Agent 4: Career Coach ───────────────────────────────────
interface CoachData {
  rewriteSuggestions: Array<{ original: string; improved: string; reason: string }>;
  interviewQuestions: Array<{ question: string; why: string; tip: string }>;
  actionPlan: Array<{ day: string; task: string; impact: "high" | "medium" | "low" }>;
}

const AGENT4_PROMPT = `You are a world-class career coach and resume writer.
Given the full analysis context, produce actionable coaching output.
Return ONLY this JSON:
{
  "rewriteSuggestions": [
    {
      "original": "<exact bullet or phrase from the resume>",
      "improved": "<rewritten with impact language and JD keywords>",
      "reason": "<one sentence: why this change improves ATS score>"
    },
    <exactly 4 rewrite suggestions>
  ],
  "interviewQuestions": [
    {
      "question": "<likely interview question targeting a gap>",
      "why": "<one sentence: why they will ask this>",
      "tip": "<one concrete, specific tip to answer it well>"
    },
    <exactly 6 interview questions>
  ],
  "actionPlan": [
    {
      "day": "<e.g. 'Day 1-2'>",
      "task": "<specific actionable task to improve resume or prep>",
      "impact": "<'high', 'medium', or 'low'>"
    },
    <exactly 7 action steps forming a complete improvement plan>
  ]
}`;

export async function POST(request: NextRequest) {
  const agentLogs: string[] = [];

  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: "Both resume and job description are required." }, { status: 400 });
    }

    if (resume.length > 10000 || jobDescription.length > 6000) {
      return NextResponse.json({ error: "Input too long. Resume max 10000 chars, JD max 6000 chars." }, { status: 400 });
    }

    // ── Agent 1: Extract resume structure ──
    agentLogs.push("Agent 1 (Resume Extractor): Parsing resume structure...");
    const resumeData = await runAgent<ResumeData>(
      "Agent 1",
      AGENT1_PROMPT,
      `RESUME TEXT:\n${resume}`,
      FAST_MODEL
    );
    agentLogs.push(`Agent 1 complete: Extracted ${resumeData.allSkills?.length ?? 0} skills, ${resumeData.experienceYears} years experience`);

    // ── Agent 2: Extract JD requirements ──
    agentLogs.push("Agent 2 (JD Analyzer): Parsing job requirements...");
    const jdData = await runAgent<JDData>(
      "Agent 2",
      AGENT2_PROMPT,
      `JOB DESCRIPTION:\n${jobDescription}`,
      FAST_MODEL
    );
    agentLogs.push(`Agent 2 complete: Found ${jdData.requiredSkills?.length ?? 0} required skills for ${jdData.title}`);

    // ── Agent 3: Score and analyze gap ──
    agentLogs.push("Agent 3 (Gap Analyzer): Scoring resume against job requirements...");
    const gapData = await runAgent<GapData>(
      "Agent 3",
      AGENT3_PROMPT,
      `RESUME PROFILE:\n${JSON.stringify(resumeData, null, 2)}\n\nJOB REQUIREMENTS:\n${JSON.stringify(jdData, null, 2)}`,
      SMART_MODEL
    );
    agentLogs.push(`Agent 3 complete: ATS Score ${gapData.atsScore}/100, Grade ${gapData.grade}`);

    // ── Agent 4: Generate coaching output ──
    agentLogs.push("Agent 4 (Career Coach): Generating personalised recommendations...");
    const coachData = await runAgent<CoachData>(
      "Agent 4",
      AGENT4_PROMPT,
      `CANDIDATE PROFILE:\n${JSON.stringify(resumeData, null, 2)}\n\nJOB REQUIREMENTS:\n${JSON.stringify(jdData, null, 2)}\n\nGAP ANALYSIS:\n${JSON.stringify(gapData, null, 2)}\n\nOriginal bullet points from resume:\n${resumeData.bulletPoints?.slice(0, 10).join("\n") ?? ""}`,
      SMART_MODEL
    );
    agentLogs.push("Agent 4 complete: Generated rewrite suggestions, interview prep, and 7-day action plan");

    // ── Assemble final result ──
    const result = {
      atsScore: gapData.atsScore,
      grade: gapData.grade,
      verdict: gapData.verdict,
      skillsMatchPercent: gapData.skillsMatchPercent,
      missingKeywords: gapData.missingKeywords ?? [],
      matchedKeywords: gapData.matchedKeywords ?? [],
      strengths: gapData.strengths ?? [],
      weaknesses: gapData.weaknesses ?? [],
      rewriteSuggestions: coachData.rewriteSuggestions ?? [],
      interviewQuestions: coachData.interviewQuestions ?? [],
      actionPlan: coachData.actionPlan ?? [],
      alternativeRoles: gapData.alternativeRoles ?? [],
      resumeProfile: {
        name: resumeData.name,
        topSkills: resumeData.topSkills ?? [],
        experienceYears: resumeData.experienceYears,
        experienceLevel: resumeData.experienceLevel,
        educationLevel: resumeData.educationLevel,
        summary: resumeData.summary,
      },
      agentLogs,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis pipeline error:", error);
    agentLogs.push(`Pipeline error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed", agentLogs },
      { status: 500 }
    );
  }
}
