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
    const { resume, jobDescription, candidateName, targetRole, company, tone } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json({ error: "Resume and job description are required" }, { status: 400 });
    }

    const toneInstruction =
      tone === "formal"     ? "Write in a formal, professional tone." :
      tone === "confident"  ? "Write in a confident, assertive tone that shows ambition." :
      tone === "warm"       ? "Write in a warm, personable tone that shows personality." :
                              "Write in a professional but approachable tone.";

    const prompt = `You are an expert cover letter writer. Generate a compelling, personalised cover letter.

CANDIDATE RESUME:
${resume.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

INSTRUCTIONS:
- Candidate name: ${candidateName || "extract from resume"}
- Target role: ${targetRole || "extract from JD"}
- Company: ${company || "extract from JD"}
- ${toneInstruction}
- Length: 3-4 paragraphs, ~300-380 words
- Opening: Hook with a specific achievement or insight, NOT "I am writing to apply for..."
- Body paragraph 1: Connect 2-3 of the candidate's strongest skills directly to the JD requirements
- Body paragraph 2: Highlight 1 specific project/achievement with a quantifiable result
- Closing: Express genuine interest, call to action, professional sign-off with "Sincerely," followed by the candidate's name on a new line
- Do NOT use clichés: "passionate", "team player", "hard worker", "results-driven"
- Do use specific details from both the resume and the JD
- IMPORTANT: Separate each paragraph with a blank line (double newline \\n\\n)
- Start with "Dear Hiring Manager," (or the specific name if known) on its own line
- Output ONLY the cover letter text, no preamble or notes`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 700,
    });

    const letter = completion.choices[0]?.message?.content?.trim() ?? "";

    // Generate 3 subject line options
    const subjectPrompt = `Given this cover letter opening, write 3 different email subject line options (vary from formal to bold). Output as JSON array of strings only.

Cover letter start: ${letter.slice(0, 200)}
Role: ${targetRole || "the position"}
Company: ${company || "the company"}`;

    const subjectCompletion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: subjectPrompt }],
      temperature: 0.8,
      max_tokens: 150,
    });

    let subjectLines: string[] = [];
    try {
      const raw = subjectCompletion.choices[0]?.message?.content ?? "[]";
      const match = raw.match(/\[[\s\S]*\]/);
      subjectLines = match ? JSON.parse(match[0]) : [];
    } catch { subjectLines = []; }

    return NextResponse.json({ letter, subjectLines });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
