import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

function extractJSON(raw: string): Record<string, unknown> {
  // Strip markdown code fences
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  // Try direct parse
  try { return JSON.parse(cleaned); } catch { /* continue */ }
  // Try extracting first {...} block
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* continue */ } }
  return {};
}

export async function POST(request: NextRequest) {
  try {
    const { name, targetRole, experienceLevel, experienceYears, topSkills, matchedKeywords, missingKeywords, strengths, atsScore, grade } = await request.json();

    const prompt = `You are a LinkedIn profile expert. Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Candidate info:
Name: ${name || "Candidate"}
Target Role: ${targetRole || "Software Engineer"}
Experience: ${experienceYears} years, ${experienceLevel} level
ATS Score: ${atsScore}/100, Grade ${grade}
Top Skills: ${(topSkills || []).slice(0, 8).join(", ")}
Matched Keywords: ${(matchedKeywords || []).slice(0, 6).join(", ")}
Missing Keywords: ${(missingKeywords || []).slice(0, 4).join(", ")}
Strengths: ${(strengths || []).slice(0, 3).join("; ")}

Return this exact JSON structure with real values filled in:

{"headlines":[{"text":"Software Engineer | JavaScript & React Specialist | 4Y Building Scalable Web Apps","strategy":"Keyword-Rich","why":"Packed with searchable terms recruiters use"},{"text":"Boosted App Performance 30% | Full-Stack Engineer | Seeking Data Engineering Opportunities","strategy":"Achievement-Led","why":"Opens with a quantified win to grab attention"},{"text":"Turning Code into Business Value | Software Engineer Transitioning to Data Engineering","strategy":"Value Proposition","why":"Highlights the 'why hire me' angle clearly"}],"about":"Opening hook line about impact or achievement.\\n\\nParagraph about technical background and key skills.\\n\\nParagraph about a specific project or achievement with result.\\n\\nClosing paragraph with genuine interest in target role. Open to ${targetRole} opportunities — feel free to connect.","skills":["JavaScript","TypeScript","React","Node.js","SQL","AWS","Python","Data Engineering","ETL Pipelines","Git","REST APIs","Agile"],"connectionMessage":"Hi [Name], I came across your profile while exploring ${targetRole} roles at [Company] — your work on [specific area] really stood out. I'd love to connect and learn more about the team.","salaryRange":"$75,000 – $105,000","profileStrength":68}

Now generate the SAME JSON structure but customised for the candidate above. Keep all field names identical. Output raw JSON only.`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You output ONLY valid JSON. No markdown. No explanation. No code fences. Just the raw JSON object."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1400,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const data = extractJSON(raw);

    // Validate and sanitise arrays
    const headlines = Array.isArray(data.headlines) ? data.headlines.slice(0, 3) : [];
    const skills    = Array.isArray(data.skills)    ? data.skills.slice(0, 12)   : [];

    return NextResponse.json({
      headlines,
      about:             typeof data.about             === "string" ? data.about             : "",
      skills,
      connectionMessage: typeof data.connectionMessage === "string" ? data.connectionMessage : "",
      salaryRange:       typeof data.salaryRange       === "string" ? data.salaryRange       : "",
      profileStrength:   typeof data.profileStrength   === "number" ? data.profileStrength   : 68,
    });

  } catch (error) {
    console.error("LinkedIn API error:", error);
    return NextResponse.json({ error: "Failed to generate LinkedIn profile kit" }, { status: 500 });
  }
}
