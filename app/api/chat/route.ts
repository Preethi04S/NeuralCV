import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

const SYSTEM_PROMPT = `You are CareerAI, an expert career advisor, resume coach, and job search strategist. You work inside NeuralCV, an AI-powered resume intelligence tool.

You help users with:
- Resume improvement and ATS optimization
- Career transitions and growth paths
- Interview preparation and common questions
- Salary negotiation and benchmarks
- Skill gap analysis and learning paths
- Job search strategy and networking
- Job description analysis
- Career pivots and decisions

Guidelines:
- Be direct, specific, and actionable. No generic advice
- Give 3-5 bullet points when listing things
- Keep responses concise (under 200 words unless user asks for detail)
- If user has shared their resume context, reference it specifically
- Be warm but professional
- If you don't know a specific salary or statistic, say "typical range" and give a reasonable estimate`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], context } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Build context injection if resume was analyzed
    let contextMessage = "";
    if (context?.atsScore != null) {
      contextMessage = `\n\nUSER'S RESUME CONTEXT (from their NeuralCV analysis):
- Name: ${context.name || "Unknown"}
- ATS Score: ${context.atsScore}/100 (Grade ${context.grade})
- Target Role: ${context.targetRole || "Not specified"}
- Experience Level: ${context.experienceLevel || "Unknown"} (${context.experienceYears || "?"} years)
- Top Skills: ${(context.topSkills || []).join(", ")}
- Missing Keywords: ${(context.missingKeywords || []).join(", ")}
- Strengths: ${(context.strengths || []).slice(0, 2).join("; ")}
- Weaknesses: ${(context.weaknesses || []).slice(0, 2).join("; ")}

Use this context to give personalized advice when relevant.`;
    }

    const systemContent = SYSTEM_PROMPT + contextMessage;

    const completion = await client.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemContent },
        ...messages.slice(-10), // last 10 messages for context window
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
