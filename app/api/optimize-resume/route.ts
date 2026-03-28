import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const SMART_MODEL = process.env.AI_MODEL || "llama-3.3-70b-versatile";

function extractJSON(raw: string): unknown {
  const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(clean); } catch { /* continue */ }
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* continue */ } }
  throw new Error("Could not parse JSON from optimizer response");
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobDescription, missingKeywords, atsScore } = await request.json();

    const jdSnippet = (jobDescription || "").slice(0, 1500);
    const missing = (missingKeywords || []).slice(0, 8).join(", ");

    const bulletList = (resumeData.experience || [])
      .flatMap((exp: { title: string; bullets: string[] }) =>
        exp.bullets.map((b: string) => `[${exp.title}] ${b}`)
      )
      .slice(0, 12)
      .join("\n");

    const system = `You are an elite resume optimizer. Rewrite resume content to maximize ATS score. Output ONLY valid JSON. No markdown.`;

    const user = `JOB DESCRIPTION (first 1500 chars):
${jdSnippet}

MISSING KEYWORDS TO INCORPORATE: ${missing}

CURRENT ATS SCORE: ${atsScore}/100

CURRENT BULLETS TO REWRITE:
${bulletList}

CURRENT SUMMARY:
${resumeData.summary || ""}

Rewrite each bullet to:
1. Start with a strong action verb (Engineered, Optimized, Built, Led, Deployed, etc.)
2. Add a quantified metric (%, $, time, scale) where plausible
3. Naturally incorporate 1-2 missing keywords per bullet if relevant
4. Keep truth — only improve, do not invent facts

Return ONLY this JSON:
{
  "optimizedBullets": [{"original":"...","improved":"...","keywordsAdded":["..."]}],
  "optimizedSummary": "2 sentence summary with keywords woven in",
  "predictedScore": 0,
  "scoreGain": 0,
  "keywordsAdded": ["list of keywords added"],
  "changeCount": 0
}

Rules: predictedScore = realistic estimate between ${atsScore + 5} and ${Math.min(atsScore + 35, 95)}. scoreGain = predictedScore - ${atsScore}. changeCount = number of bullets improved.`;

    const completion = await client.chat.completions.create({
      model: SMART_MODEL,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const data = extractJSON(raw) as {
      optimizedBullets: { original: string; improved: string; keywordsAdded: string[] }[];
      optimizedSummary: string;
      predictedScore: number;
      scoreGain: number;
      keywordsAdded: string[];
      changeCount: number;
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("optimize-resume error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
