import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export async function POST(request: NextRequest) {
  try {
    const { question, why, tip, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    if (answer.trim().split(/\s+/).length < 15) {
      return NextResponse.json({ error: "Answer is too short to evaluate meaningfully" }, { status: 400 });
    }

    const prompt = `You are an expert interview coach evaluating a candidate's answer to an interview question.

QUESTION: ${question}
WHY ASKED: ${why}
IDEAL APPROACH: ${tip}

CANDIDATE'S ANSWER:
${answer}

Evaluate this answer and respond ONLY with valid JSON in exactly this structure:
{
  "score": <integer 1-10>,
  "strongPoints": [<2-3 specific things done well, each under 20 words>],
  "weakPoints": [<2-3 specific things to improve, each under 20 words>],
  "betterAnswer": "<a 2-3 sentence improved version of their answer using the STAR method>"
}

Scoring guide:
9-10: Outstanding — specific, quantified, perfect structure, compelling
7-8: Good — clear, relevant, mostly structured, minor gaps
5-6: Passable — relevant but vague, missing structure or specifics
3-4: Weak — off-topic, rambling, or missing key elements
1-2: Poor — irrelevant or far too short

Be specific and actionable in your feedback. Reference actual words from their answer.`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found");
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json({ error: "Could not parse evaluation. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      score: Math.max(1, Math.min(10, Number(parsed.score) || 5)),
      strongPoints: Array.isArray(parsed.strongPoints) ? parsed.strongPoints.slice(0, 3) : ["Clear communication"],
      weakPoints: Array.isArray(parsed.weakPoints) ? parsed.weakPoints.slice(0, 3) : ["Add more specific examples"],
      betterAnswer: parsed.betterAnswer || "Focus on the STAR method for a stronger answer.",
    });
  } catch (error) {
    console.error("Interview practice error:", error);
    return NextResponse.json({ error: "Evaluation service unavailable. Please try again." }, { status: 500 });
  }
}
