import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 90;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const FAST_MODEL  = "llama-3.1-8b-instant";
const SMART_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

// ── Token-efficient agent runner ──────────────────────────────────────────
async function runAgent<T>(
  agentName: string,
  systemPrompt: string,
  userContent: string,
  model: string,
  max_tokens: number
): Promise<T> {
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    max_tokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userContent  },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error(`${agentName} returned no content`);
  try { return JSON.parse(content) as T; }
  catch { throw new Error(`${agentName} returned invalid JSON`); }
}

// ──────────────────────────────────────────────────────────────────────────
// AGENT PROMPTS — kept precise, no filler sentences
// ──────────────────────────────────────────────────────────────────────────

// Agent 1 — Resume Extractor (~550 tokens output)
interface ResumeData {
  name: string; email: string; phone: string; location: string;
  linkedin: string; github: string;
  topSkills: string[]; allSkills: string[]; certifications: string[];
  languages: string[]; experienceYears: number;
  experienceLevel: "entry"|"mid"|"senior"|"lead"; educationLevel: string;
  institution: string; graduationYear: string; roles: string[];
  companies: string[]; projects: string[];
  summary: string; bulletPoints: string[];
}

const AGENT1_PROMPT = `Extract resume data. Return ONLY JSON, no extra text.
Use "" for missing strings, [] for missing arrays, 0 for missing numbers.
{"name":"","email":"","phone":"","location":"","linkedin":"","github":"",
"topSkills":[],"allSkills":[],"certifications":[],"languages":[],
"experienceYears":0,"experienceLevel":"entry",
"educationLevel":"","institution":"","graduationYear":"","roles":[],"companies":[],
"projects":[],"summary":"2-sentence profile","bulletPoints":[]}
Rules: topSkills=top 6 most relevant, allSkills=all tech/tools (no soft skills), bulletPoints=max 8 verbatim, experienceLevel: entry<2y mid 2-5y senior 5-10y lead 10+y`;

// Agent 2 — JD Analyzer (~300 tokens output)
interface JDData {
  title: string; requiredSkills: string[]; niceToHaveSkills: string[];
  experienceRequired: number; responsibilities: string[]; keywords: string[];
}

const AGENT2_PROMPT = `Extract job description data. Return ONLY JSON.
{"title":"","requiredSkills":[],"niceToHaveSkills":[],"experienceRequired":0,
"responsibilities":[],"keywords":[]}
Rules: requiredSkills=must-have only (max 10), niceToHaveSkills=max 5, responsibilities=top 3, keywords=top 8 technical terms only`;

// Agent 3 — Gap Analyzer + Scorer (~700 tokens output)
interface GapData {
  atsScore: number; grade: "A"|"B"|"C"|"D"|"F"; verdict: string;
  skillsMatchPercent: number; missingKeywords: string[]; matchedKeywords: string[];
  strengths: string[]; weaknesses: string[];
  alternativeRoles: Array<{title:string; matchPercent:number; reason:string}>;
  confidence: number;
}

const AGENT3_PROMPT = `You are an ATS scoring engine. Score: keyword match 25%, skills match 20%, experience 15%, education 10%, clarity 10%, quantified achievements 10%, role alignment 5%, certs 5%.
Return ONLY JSON:
{"atsScore":0,"grade":"A","verdict":"1 sentence","skillsMatchPercent":0,
"missingKeywords":[],"matchedKeywords":[],"strengths":[],"weaknesses":[],
"alternativeRoles":[],"confidence":0}
Rules: grade A≥85 B 70-84 C 50-69 D 35-49 F<35. missingKeywords=5 most impactful. matchedKeywords=top 8 matched only. strengths=3 specific. weaknesses=3 specific. alternativeRoles=3 with title+matchPercent+reason(8 words max). verdict=1 sentence. confidence=integer 0-100`;

// Agent 4 — Career Coach (~1100 tokens output)
interface CoachData {
  rewriteSuggestions: Array<{original:string; improved:string; reason:string}>;
  interviewQuestions: Array<{question:string; why:string; tip:string}>;
  actionPlan: Array<{day:string; task:string; impact:"high"|"medium"|"low"}>;
  confidence: number;
}

const AGENT4_PROMPT = `You are a career coach. Return ONLY JSON:
{"rewriteSuggestions":[],"interviewQuestions":[],"actionPlan":[],"confidence":0}
Rules:
- rewriteSuggestions: exactly 3. original=verbatim bullet from list. improved=starts with strong action verb + metric. reason=10 words max.
- interviewQuestions: exactly 5. target the missing skills. tip=10 words max.
- actionPlan: exactly 5 steps. day=e.g."Day 1-2". task=15 words max. impact=high|medium|low.
- confidence: integer 0-100`;

// Agent 5 — Counterfactual Simulator (~380 tokens output)
interface CounterfactualData {
  scenarios: Array<{skill:string; projectedScore:number; pointsGain:number; howToAdd:string}>;
  confidence: number;
}

const AGENT5_PROMPT = `Compute ATS score impact of adding each missing skill. Return ONLY JSON:
{"scenarios":[],"confidence":0}
Rules: exactly 4 scenarios sorted by pointsGain desc. pointsGain=projectedScore-currentScore, range 3-15pts. howToAdd=max 12 words. confidence=integer 0-100`;

// Agent 6 — JD Bias Scanner (~350 tokens output)
interface JDBiasData {
  overallRating: "clean"|"mild"|"moderate"|"severe";
  biasedPhrases: Array<{phrase:string; biasType:"gender"|"age"|"cultural"|"exclusionary"|"ableist"; explanation:string; suggestion:string}>;
  summary: string; confidence: number;
}

const AGENT6_PROMPT = `Scan JD for biased language: gender-coded (rockstar/ninja/guru/aggressive/dominant), age bias (digital native/recent grad/10+ yrs for entry role), exclusionary, ableist.
Return ONLY JSON: {"overallRating":"clean","biasedPhrases":[],"summary":"","confidence":0}
Rules: overallRating clean=0 mild=1-2 moderate=3-4 severe=5+. Only flag real bias. biasedPhrases max 4. explanation=8 words. suggestion=8 words. summary=1 sentence. confidence=integer 0-100`;

// Agent 7 — Integrity Checker (~350 tokens output)
interface IntegrityData {
  integrityScore: number; verdict: string;
  flags: Array<{issue:string; severity:"low"|"medium"|"high"; detail:string}>;
  confidence: number;
}

const AGENT7_PROMPT = `Analyze resume for red flags: keyword stuffing, skill-experience mismatch, implausible claims, timeline gaps >6mo, generic filler phrases.
Return ONLY JSON: {"integrityScore":0,"verdict":"","flags":[],"confidence":0}
Rules: integrityScore 100=authentic, genuine resumes 70-95. flags max 3, only real concerns. severity=low|medium|high. detail=10 words max. verdict=1 sentence. confidence=integer 0-100`;

// ──────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
// ──────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const agentLogs: string[] = [];
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: "Both resume and job description are required." }, { status: 400 });
    }

    // ── Trim inputs to save tokens ─────────────────────────────────────────
    const resumeText = resume.slice(0, 4000);
    const jdText     = jobDescription.slice(0, 2500);

    const startTime = Date.now();

    // ── Agent 1 & 2 — sequential (cheap fast model) ───────────────────────
    agentLogs.push("Agent 1 (Resume Extractor): Parsing resume...");
    const resumeData = await runAgent<ResumeData>(
      "Agent 1", AGENT1_PROMPT,
      `RESUME:\n${resumeText}`,
      FAST_MODEL, 420
    );
    agentLogs.push(`Agent 1: ${resumeData.allSkills?.length ?? 0} skills, ${resumeData.experienceYears}y exp`);

    agentLogs.push("Agent 2 (JD Analyzer): Parsing job requirements...");
    const jdData = await runAgent<JDData>(
      "Agent 2", AGENT2_PROMPT,
      `JD:\n${jdText}`,
      FAST_MODEL, 220
    );
    agentLogs.push(`Agent 2: ${jdData.requiredSkills?.length ?? 0} required skills for ${jdData.title}`);

    // ── Build compact context strings (no pretty-print JSON) ──────────────
    const candidateCtx =
      `CANDIDATE: ${resumeData.experienceYears}y ${resumeData.experienceLevel} | Skills: ${(resumeData.allSkills ?? []).join(", ")} | Certs: ${(resumeData.certifications ?? []).join(", ")} | Education: ${resumeData.educationLevel}`;

    const jobCtx =
      `JOB: ${jdData.title} | Required: ${(jdData.requiredSkills ?? []).join(", ")} | Nice-to-have: ${(jdData.niceToHaveSkills ?? []).join(", ")} | Keywords: ${(jdData.keywords ?? []).join(", ")} | Exp required: ${jdData.experienceRequired}y`;

    // ── Agents 3, 6, 7 — parallel ─────────────────────────────────────────
    agentLogs.push("Agents 3+6+7 running in parallel...");
    const [gapData, jdBiasData, integrityData] = await Promise.all([
      runAgent<GapData>(
        "Agent 3", AGENT3_PROMPT,
        `${candidateCtx}\n${jobCtx}`,
        SMART_MODEL, 580
      ),
      runAgent<JDBiasData>(
        "Agent 6", AGENT6_PROMPT,
        `JD:\n${jdText}`,
        FAST_MODEL, 260
      ),
      runAgent<IntegrityData>(
        "Agent 7", AGENT7_PROMPT,
        `RESUME:\n${resumeText}`,
        FAST_MODEL, 220
      ),
    ]);
    agentLogs.push(`Agent 3: ATS ${gapData.atsScore}/100 Grade ${gapData.grade}`);
    agentLogs.push(`Agent 6: Bias ${jdBiasData.overallRating}, ${jdBiasData.biasedPhrases?.length ?? 0} issues`);
    agentLogs.push(`Agent 7: Integrity ${integrityData.integrityScore}/100`);

    // ── Agent 4 — Career Coach (smart model, compact context) ─────────────
    agentLogs.push("Agent 4 (Career Coach): Generating recommendations...");
    const coachCtx =
      `ROLE: ${jdData.title}\nREQUIRED: ${(jdData.requiredSkills ?? []).slice(0, 8).join(", ")}\nCANDIDATE: ${(resumeData.topSkills ?? []).join(", ")}\nMISSING: ${(gapData.missingKeywords ?? []).join(", ")}\nATS: ${gapData.atsScore}/100\nBULLETS:\n${(resumeData.bulletPoints ?? []).slice(0, 6).join("\n")}`;

    const coachData = await runAgent<CoachData>(
      "Agent 4", AGENT4_PROMPT,
      coachCtx,
      SMART_MODEL, 820
    );
    agentLogs.push(`Agent 4: ${coachData.rewriteSuggestions?.length ?? 0} rewrites, ${coachData.interviewQuestions?.length ?? 0} questions`);

    // ── Agent 5 — Counterfactual (fast model, minimal context) ───────────
    agentLogs.push("Agent 5 (Counterfactual): Computing what-if scenarios...");
    const counterfactualData = await runAgent<CounterfactualData>(
      "Agent 5", AGENT5_PROMPT,
      `CURRENT SCORE: ${gapData.atsScore}\nMISSING SKILLS: ${(gapData.missingKeywords ?? []).join(", ")}\nJOB: ${jdData.title}\nLEVEL: ${resumeData.experienceLevel}`,
      FAST_MODEL, 240
    );
    agentLogs.push(`Agent 5: ${counterfactualData.scenarios?.length ?? 0} scenarios`);

    // ── Build result ───────────────────────────────────────────────────────
    const elapsedMs = Date.now() - startTime;
    const allConf = [gapData.confidence, coachData.confidence, counterfactualData.confidence, jdBiasData.confidence, integrityData.confidence].filter(Boolean) as number[];
    const overallConfidence = Math.round(allConf.reduce((a, b) => a + b, 0) / allConf.length);

    agentLogs.push(`Done in ${(elapsedMs / 1000).toFixed(1)}s — confidence ${overallConfidence}%`);

    const agentPassport = [
      { agentId: 1, name: "Resume Extractor",       model: FAST_MODEL,  role: "Parses resume structure",           confidence: 92, tokensUsed: "~420",  outputSummary: `${resumeData.allSkills?.length ?? 0} skills, ${resumeData.experienceYears}y exp` },
      { agentId: 2, name: "JD Analyzer",             model: FAST_MODEL,  role: "Extracts job requirements",         confidence: 94, tokensUsed: "~220",  outputSummary: `${jdData.requiredSkills?.length ?? 0} required skills for ${jdData.title}` },
      { agentId: 3, name: "Gap Analyzer",            model: SMART_MODEL, role: "Scores ATS compatibility",          confidence: gapData.confidence ?? 88, tokensUsed: "~580", outputSummary: `Score: ${gapData.atsScore}/100, Grade: ${gapData.grade}` },
      { agentId: 4, name: "Career Coach",            model: SMART_MODEL, role: "Rewrites, interview prep, actions", confidence: coachData.confidence ?? 85, tokensUsed: "~820", outputSummary: `${coachData.rewriteSuggestions?.length ?? 0} rewrites, 5-day plan` },
      { agentId: 5, name: "Counterfactual Simulator",model: FAST_MODEL,  role: "What-if skill impact",              confidence: counterfactualData.confidence ?? 82, tokensUsed: "~240", outputSummary: `Top gain: +${Math.max(...(counterfactualData.scenarios?.map(s => s.pointsGain) ?? [0]))} pts` },
      { agentId: 6, name: "JD Bias Scanner",         model: FAST_MODEL,  role: "Detects biased JD language",        confidence: jdBiasData.confidence ?? 90, tokensUsed: "~260", outputSummary: `${jdBiasData.overallRating}, ${jdBiasData.biasedPhrases?.length ?? 0} issues` },
      { agentId: 7, name: "Integrity Checker",       model: FAST_MODEL,  role: "Verifies resume authenticity",      confidence: integrityData.confidence ?? 87, tokensUsed: "~220", outputSummary: `Score: ${integrityData.integrityScore}/100` },
    ];

    return NextResponse.json({
      atsScore:          gapData.atsScore,
      grade:             gapData.grade,
      verdict:           gapData.verdict,
      skillsMatchPercent:gapData.skillsMatchPercent,
      missingKeywords:   gapData.missingKeywords   ?? [],
      matchedKeywords:   gapData.matchedKeywords   ?? [],
      strengths:         gapData.strengths         ?? [],
      weaknesses:        gapData.weaknesses        ?? [],
      rewriteSuggestions:coachData.rewriteSuggestions ?? [],
      interviewQuestions:coachData.interviewQuestions ?? [],
      actionPlan:        coachData.actionPlan       ?? [],
      alternativeRoles:  gapData.alternativeRoles  ?? [],
      resumeProfile: {
        name:            resumeData.name,
        email:           resumeData.email,
        phone:           resumeData.phone,
        location:        resumeData.location,
        linkedin:        resumeData.linkedin,
        github:          resumeData.github,
        topSkills:       resumeData.topSkills       ?? [],
        allSkills:       resumeData.allSkills       ?? [],
        certifications:  resumeData.certifications  ?? [],
        languages:       resumeData.languages       ?? [],
        experienceYears: resumeData.experienceYears,
        experienceLevel: resumeData.experienceLevel,
        educationLevel:  resumeData.educationLevel,
        institution:     resumeData.institution,
        graduationYear:  resumeData.graduationYear,
        roles:           resumeData.roles           ?? [],
        companies:       resumeData.companies       ?? [],
        projects:        resumeData.projects        ?? [],
        summary:         resumeData.summary,
      },
      counterfactuals: (counterfactualData.scenarios ?? []).map(s => ({
        skill:          s.skill,
        currentScore:   gapData.atsScore,
        projectedScore: s.projectedScore,
        pointsGain:     s.pointsGain,
        howToAdd:       s.howToAdd,
      })),
      jdBiasReport: {
        overallRating:  jdBiasData.overallRating  ?? "clean",
        biasedPhrases:  jdBiasData.biasedPhrases  ?? [],
        summary:        jdBiasData.summary        ?? "",
      },
      resumeIntegrity: {
        integrityScore: integrityData.integrityScore ?? 85,
        verdict:        integrityData.verdict        ?? "",
        flags:          integrityData.flags          ?? [],
      },
      agentPassport,
      overallConfidence,
      agentLogs,
    });

  } catch (error: unknown) {
    console.error("Pipeline error:", error);
    agentLogs.push(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed", agentLogs },
      { status: 500 }
    );
  }
}
