import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// ── Remotive returns the DIRECT company application URL in job.url ──
interface RemotiveJob {
  id: number;
  url: string;           // <-- direct company job page / application link
  title: string;
  company_name: string;
  company_logo: string;
  company_url: string;   // company homepage
  category: string;
  tags: string[];
  job_type: string;      // "full_time" | "contract" | "part_time" | "freelance"
  publication_date: string; // ISO string
  candidate_required_location: string;
  salary: string;
  description: string;
}

// Strip HTML for skill matching
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function computeMatchScore(
  resumeSkills: string[],
  descriptionText: string,
  jobTags: string[]
): { score: number; matched: string[] } {
  if (!resumeSkills?.length) return { score: 0, matched: [] };
  const haystack = descriptionText + " " + (jobTags ?? []).join(" ").toLowerCase();
  const matched: string[] = [];
  for (const skill of resumeSkills) {
    const needle = skill.toLowerCase().trim();
    if (needle.length > 1 && haystack.includes(needle)) matched.push(skill);
  }
  const matchRatio = matched.length / resumeSkills.length;
  const score = Math.min(100, Math.round(matchRatio * 200));
  return { score: Math.max(score, matched.length > 0 ? 15 : 0), matched };
}

function isNew(isoDate: string): boolean {
  if (!isoDate) return false;
  try {
    const diffDays = (Date.now() - new Date(isoDate).getTime()) / 86400000;
    return diffDays <= 7;
  } catch { return false; }
}

function formatJobType(jt: string): string {
  const map: Record<string, string> = {
    full_time: "Full-time", contract: "Contract",
    part_time: "Part-time", freelance: "Freelance",
  };
  return map[jt] ?? jt ?? "Full-time";
}

async function searchRemotive(query: string, limit = 10): Promise<RemotiveJob[]> {
  try {
    const encoded = encodeURIComponent(query.trim().substring(0, 60));
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encoded}&limit=${limit}`,
      {
        headers: { "Accept": "application/json", "User-Agent": "NeuralCV/1.0" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs ?? []) as RemotiveJob[];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeSkills = [] as string[],
      targetRole = "",
      alternativeRoles = [] as string[],
    } = body;

    if (!targetRole && !resumeSkills?.length) {
      return NextResponse.json({ error: "Provide targetRole or resumeSkills" }, { status: 400 });
    }

    const targetQuery  = targetRole || resumeSkills.slice(0, 2).join(" ");
    const skillsQuery  = resumeSkills.slice(0, 3).join(" ");
    const altRoles     = (alternativeRoles as string[]).slice(0, 2);

    // Fetch all sources in parallel
    const [targetJobs, skillJobs, ...altJobArrays] = await Promise.all([
      searchRemotive(targetQuery, 10),
      targetQuery.toLowerCase() !== skillsQuery.toLowerCase()
        ? searchRemotive(skillsQuery, 8)
        : Promise.resolve([] as RemotiveJob[]),
      ...altRoles.map((role: string) => searchRemotive(role, 6)),
    ]);

    // Deduplicate by id
    const seen = new Set<number>();
    const combinedTarget: RemotiveJob[] = [];
    for (const job of [...targetJobs, ...skillJobs]) {
      if (!seen.has(job.id)) { seen.add(job.id); combinedTarget.push(job); }
    }

    const scoreJob = (job: RemotiveJob) => {
      const descText = stripHtml(job.description ?? "");
      const { score, matched } = computeMatchScore(resumeSkills, descText, job.tags ?? []);
      return {
        id: job.id,
        title: job.title,
        company: job.company_name,
        companyLogo: job.company_logo ?? "",
        companyUrl: job.company_url ?? "",       // company homepage
        url: job.url,                             // DIRECT application link
        salary: job.salary ?? "",
        tags: (job.tags ?? []).slice(0, 6),
        location: job.candidate_required_location || "Remote",
        postedDate: job.publication_date ? job.publication_date.substring(0, 10) : "",
        jobType: formatJobType(job.job_type),
        matchScore: score,
        matchedSkills: matched.slice(0, 5),
        isNew: isNew(job.publication_date),
        source: "remotive" as const,             // so UI can show source badge
      };
    };

    const allScored = combinedTarget.map(scoreJob);
    const withMatch    = allScored.filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    const withoutMatch = allScored.filter(j => j.matchScore === 0).slice(0, 3);
    const scoredTarget = withMatch.length >= 3 ? withMatch : [...withMatch, ...withoutMatch].slice(0, 8);

    const altRoleJobs = altRoles
      .map((role, i) => ({
        query: role,
        roleCategory: role,
        jobs: (altJobArrays[i] ?? [])
          .map(scoreJob)
          .filter((j, idx, arr) => !seen.has(j.id) || idx === arr.findIndex(x => x.id === j.id))
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5),
        totalFound: altJobArrays[i]?.length ?? 0,
      }))
      .filter(r => r.jobs.length > 0);

    const allJobs = [...scoredTarget, ...altRoleJobs.flatMap(r => r.jobs)];
    const companies = [...new Set(allJobs.map(j => j.company))].slice(0, 6);
    const skillFreq: Record<string, number> = {};
    allJobs.forEach(j => j.matchedSkills.forEach(s => { skillFreq[s] = (skillFreq[s] ?? 0) + 1; }));
    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s]) => s);

    return NextResponse.json({
      targetRoleJobs: {
        query: targetQuery,
        roleCategory: targetRole || "Matched Roles",
        jobs: scoredTarget,
        totalFound: scoredTarget.length,
      },
      alternativeRoleJobs: altRoleJobs,
      marketInsights: {
        totalJobsFound: allJobs.length,
        topCompanies: companies,
        salaryRanges: [],
        topSkillsInDemand: topSkills.length ? topSkills : resumeSkills.slice(0, 5),
        mostActiveCategory: targetRole || "Software Development",
      },
    });
  } catch (error) {
    console.error("Jobs API error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
