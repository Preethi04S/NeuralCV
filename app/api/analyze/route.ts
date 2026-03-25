import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 90;

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
  "bulletPoints": [<all bullet points from experience section, verbatim, max 15>]
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
  confidence: number;
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
  ],
  "confidence": <integer 0-100, your confidence in this scoring analysis>
}`;

// ──── Agent 4: Career Coach ───────────────────────────────────
interface CoachData {
  rewriteSuggestions: Array<{ original: string; improved: string; reason: string }>;
  interviewQuestions: Array<{ question: string; why: string; tip: string }>;
  actionPlan: Array<{ day: string; task: string; impact: "high" | "medium" | "low" }>;
  confidence: number;
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
  ],
  "confidence": <integer 0-100, your confidence in these recommendations>
}`;

// ──── Agent 5: Counterfactual What-If Simulator (USP #41) ─────
interface CounterfactualData {
  scenarios: Array<{
    skill: string;
    projectedScore: number;
    pointsGain: number;
    howToAdd: string;
  }>;
  confidence: number;
}

const AGENT5_PROMPT = `You are a counterfactual career impact simulator.
Given a candidate's ATS score and their missing keywords, calculate the projected ATS score improvement if they added each skill.
Return ONLY this JSON:
{
  "scenarios": [
    {
      "skill": "<missing skill name>",
      "projectedScore": <new projected ATS score if this skill was added, integer 0-100>,
      "pointsGain": <integer points gained, must equal projectedScore minus currentScore>,
      "howToAdd": "<one specific sentence: how to credibly add this to resume>"
    },
    <one entry per missing keyword, exactly 5 scenarios, sorted by pointsGain descending>
  ],
  "confidence": <integer 0-100>
}
Be realistic — adding a single keyword typically adds 3-18 points depending on how critical it is.`;

// ──── Agent 6: JD Bias Scanner (USP #225) ─────────────────────
interface JDBiasData {
  overallRating: "clean" | "mild" | "moderate" | "severe";
  biasedPhrases: Array<{
    phrase: string;
    biasType: "gender" | "age" | "cultural" | "exclusionary" | "ableist";
    explanation: string;
    suggestion: string;
  }>;
  summary: string;
  confidence: number;
}

const AGENT6_PROMPT = `You are an expert employment law compliance and DEI specialist.
Scan the job description for biased language that could exclude qualified candidates or create legal risk.
Look for: gender-coded words (rockstar, ninja, guru, dominant, aggressive), age bias (young, digital native, recent grad, 10+ years for entry roles), exclusionary culture language (culture fit, fast-paced startup life), ableist language, unnecessarily restrictive requirements.
Return ONLY this JSON:
{
  "overallRating": <"clean" if 0 issues, "mild" if 1-2, "moderate" if 3-4, "severe" if 5+>,
  "biasedPhrases": [
    {
      "phrase": "<exact phrase from JD>",
      "biasType": <"gender" | "age" | "cultural" | "exclusionary" | "ableist">,
      "explanation": "<one sentence why this is biased>",
      "suggestion": "<replacement phrase>"
    }
  ],
  "summary": "<one sentence overall assessment of the JD's inclusivity>",
  "confidence": <integer 0-100>
}
If the JD is clean, return an empty biasedPhrases array and rating "clean".`;

// ──── Agent 7: Resume Integrity Check (USP #331) ──────────────
interface IntegrityData {
  integrityScore: number;
  verdict: string;
  flags: Array<{
    issue: string;
    severity: "low" | "medium" | "high";
    detail: string;
  }>;
  confidence: number;
}

const AGENT7_PROMPT = `You are a resume authenticity and integrity analyst.
Analyze the resume for red flags that indicate keyword stuffing, skill-experience mismatch, implausible claims, suspicious timeline gaps, or generic filler content.
Return ONLY this JSON:
{
  "integrityScore": <integer 0-100, where 100 is completely authentic and credible>,
  "verdict": "<one sentence overall integrity assessment>",
  "flags": [
    {
      "issue": "<short issue title>",
      "severity": <"low" | "medium" | "high">,
      "detail": "<one sentence explanation of the concern>"
    }
  ],
  "confidence": <integer 0-100>
}
Most genuine resumes score 70-95. Only flag actual concerns — do not invent flags. If resume looks authentic, return empty flags array and high score.`;

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

    const startTime = Date.now();

    // ── Agent 1 ──
    agentLogs.push("Agent 1 (Resume Extractor): Parsing resume structure...");
    const resumeData = await runAgent<ResumeData>("Agent 1", AGENT1_PROMPT, `RESUME TEXT:\n${resume}`, FAST_MODEL);
    agentLogs.push(`Agent 1 complete: Extracted ${resumeData.allSkills?.length ?? 0} skills, ${resumeData.experienceYears}y exp`);

    // ── Agent 2 ──
    agentLogs.push("Agent 2 (JD Analyzer): Parsing job requirements...");
    const jdData = await runAgent<JDData>("Agent 2", AGENT2_PROMPT, `JOB DESCRIPTION:\n${jobDescription}`, FAST_MODEL);
    agentLogs.push(`Agent 2 complete: Found ${jdData.requiredSkills?.length ?? 0} required skills for ${jdData.title}`);

    // ── Agents 3, 6, 7 run in parallel (independent) ──
    agentLogs.push("Agent 3 (Gap Analyzer): Scoring resume against job requirements...");
    agentLogs.push("Agent 6 (JD Bias Scanner): Scanning job description for bias...");
    agentLogs.push("Agent 7 (Integrity Check): Analyzing resume authenticity...");

    const [gapData, jdBiasData, integrityData] = await Promise.all([
      runAgent<GapData>(
        "Agent 3",
        AGENT3_PROMPT,
        `RESUME PROFILE:\n${JSON.stringify(resumeData, null, 2)}\n\nJOB REQUIREMENTS:\n${JSON.stringify(jdData, null, 2)}`,
        SMART_MODEL
      ),
      runAgent<JDBiasData>(
        "Agent 6",
        AGENT6_PROMPT,
        `JOB DESCRIPTION:\n${jobDescription}`,
        FAST_MODEL
      ),
      runAgent<IntegrityData>(
        "Agent 7",
        AGENT7_PROMPT,
        `RESUME TEXT:\n${resume}\n\nRESUME PROFILE:\n${JSON.stringify(resumeData, null, 2)}`,
        FAST_MODEL
      ),
    ]);

    agentLogs.push(`Agent 3 complete: ATS Score ${gapData.atsScore}/100, Grade ${gapData.grade}, Confidence ${gapData.confidence}%`);
    agentLogs.push(`Agent 6 complete: JD Bias Rating — ${jdBiasData.overallRating}, ${jdBiasData.biasedPhrases?.length ?? 0} issues found`);
    agentLogs.push(`Agent 7 complete: Resume Integrity Score ${integrityData.integrityScore}/100`);

    // ── Agent 4 ──
    agentLogs.push("Agent 4 (Career Coach): Generating personalised recommendations...");
    const coachData = await runAgent<CoachData>(
      "Agent 4",
      AGENT4_PROMPT,
      `CANDIDATE PROFILE:\n${JSON.stringify(resumeData, null, 2)}\n\nJOB REQUIREMENTS:\n${JSON.stringify(jdData, null, 2)}\n\nGAP ANALYSIS:\n${JSON.stringify(gapData, null, 2)}\n\nOriginal bullet points:\n${resumeData.bulletPoints?.slice(0, 10).join("\n") ?? ""}`,
      SMART_MODEL
    );
    agentLogs.push(`Agent 4 complete: ${coachData.rewriteSuggestions?.length ?? 0} rewrites, ${coachData.interviewQuestions?.length ?? 0} questions, Confidence ${coachData.confidence}%`);

    // ── Agent 5: Counterfactual (runs after Agent 3 so it knows the score) ──
    agentLogs.push("Agent 5 (Counterfactual Simulator): Computing what-if skill impact scenarios...");
    const counterfactualData = await runAgent<CounterfactualData>(
      "Agent 5",
      AGENT5_PROMPT,
      `CURRENT ATS SCORE: ${gapData.atsScore}\nMISSING KEYWORDS: ${(gapData.missingKeywords ?? []).join(", ")}\nCANDIDATE PROFILE: ${resumeData.experienceLevel}-level, ${resumeData.experienceYears}y exp\nJOB TITLE: ${jdData.title}`,
      FAST_MODEL
    );
    agentLogs.push(`Agent 5 complete: ${counterfactualData.scenarios?.length ?? 0} what-if scenarios generated`);

    // ── Build AI Passport ──
    const elapsedMs = Date.now() - startTime;
    const agentPassport = [
      { agentId: 1, name: "Resume Extractor", model: FAST_MODEL, role: "Parses and structures resume data", confidence: 92, tokensUsed: "~800", outputSummary: `Extracted ${resumeData.allSkills?.length ?? 0} skills, ${resumeData.experienceYears}y exp, ${resumeData.experienceLevel} level` },
      { agentId: 2, name: "JD Analyzer", model: FAST_MODEL, role: "Extracts job requirements and keywords", confidence: 94, tokensUsed: "~600", outputSummary: `Found ${jdData.requiredSkills?.length ?? 0} required skills for ${jdData.title}` },
      { agentId: 3, name: "Gap Analyzer", model: SMART_MODEL, role: "Scores ATS compatibility and identifies gaps", confidence: gapData.confidence ?? 88, tokensUsed: "~1200", outputSummary: `ATS Score: ${gapData.atsScore}/100, Grade: ${gapData.grade}, Skills match: ${gapData.skillsMatchPercent}%` },
      { agentId: 4, name: "Career Coach", model: SMART_MODEL, role: "Generates rewrites, interview prep, action plan", confidence: coachData.confidence ?? 85, tokensUsed: "~2000", outputSummary: `${coachData.rewriteSuggestions?.length ?? 0} rewrites, ${coachData.interviewQuestions?.length ?? 0} interview questions, 7-day plan` },
      { agentId: 5, name: "Counterfactual Simulator", model: FAST_MODEL, role: "Computes projected score improvements per skill", confidence: counterfactualData.confidence ?? 82, tokensUsed: "~500", outputSummary: `${counterfactualData.scenarios?.length ?? 0} what-if scenarios, top gain: +${Math.max(...(counterfactualData.scenarios?.map(s => s.pointsGain) ?? [0]))} pts` },
      { agentId: 6, name: "JD Bias Scanner", model: FAST_MODEL, role: "Detects biased language in job description", confidence: jdBiasData.confidence ?? 90, tokensUsed: "~400", outputSummary: `Bias rating: ${jdBiasData.overallRating}, ${jdBiasData.biasedPhrases?.length ?? 0} issues found` },
      { agentId: 7, name: "Integrity Checker", model: FAST_MODEL, role: "Verifies resume authenticity and credibility", confidence: integrityData.confidence ?? 87, tokensUsed: "~600", outputSummary: `Integrity score: ${integrityData.integrityScore}/100 — ${integrityData.verdict}` },
    ];

    // ── Overall confidence ──
    const allConfidences = [gapData.confidence, coachData.confidence, counterfactualData.confidence, jdBiasData.confidence, integrityData.confidence].filter(Boolean) as number[];
    const overallConfidence = Math.round(allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length);

    agentLogs.push(`Pipeline complete in ${((elapsedMs) / 1000).toFixed(1)}s — Overall confidence: ${overallConfidence}%`);

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
      // New USP features
      counterfactuals: (counterfactualData.scenarios ?? []).map(s => ({
        skill: s.skill,
        currentScore: gapData.atsScore,
        projectedScore: s.projectedScore,
        pointsGain: s.pointsGain,
        howToAdd: s.howToAdd,
      })),
      jdBiasReport: {
        overallRating: jdBiasData.overallRating ?? "clean",
        biasedPhrases: jdBiasData.biasedPhrases ?? [],
        summary: jdBiasData.summary ?? "",
      },
      resumeIntegrity: {
        integrityScore: integrityData.integrityScore ?? 85,
        verdict: integrityData.verdict ?? "",
        flags: integrityData.flags ?? [],
      },
      agentPassport,
      overallConfidence,
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
