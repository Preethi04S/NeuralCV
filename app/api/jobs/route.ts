import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number; // unix timestamp
}

// Strip HTML tags from description for text matching
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

// Match resume skills against job description text + tags
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
    if (needle.length > 1 && haystack.includes(needle)) {
      matched.push(skill);
    }
  }

  const matchRatio = matched.length / resumeSkills.length;
  // Scale: matching 30%+ of skills = strong score
  const score = Math.min(100, Math.round(matchRatio * 200));
  return { score: Math.max(score, matched.length > 0 ? 15 : 0), matched };
}

function isNew(unixTs: number): boolean {
  if (!unixTs) return false;
  const diffDays = (Date.now() / 1000 - unixTs) / 86400;
  return diffDays <= 7;
}

function formatDate(unixTs: number): string {
  if (!unixTs) return "";
  try {
    return new Date(unixTs * 1000).toISOString().substring(0, 10);
  } catch {
    return "";
  }
}

async function searchArbeitnow(query: string, limit = 10): Promise<ArbeitnowJob[]> {
  try {
    const encoded = encodeURIComponent(query.trim().substring(0, 60));
    const res = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?search=${encoded}&remote=true`,
      {
        headers: { "Accept": "application/json", "User-Agent": "NeuralCV/1.0" },
        signal: AbortSignal.timeout(9000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).slice(0, limit) as ArbeitnowJob[];
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

    const targetQuery = targetRole || resumeSkills.slice(0, 2).join(" ");
    const skillsQuery = resumeSkills.slice(0, 2).join(" ");
    const altRolesToSearch = (alternativeRoles as string[]).slice(0, 2);

    // Fetch all in parallel
    const fetchPromises: Promise<ArbeitnowJob[]>[] = [
      searchArbeitnow(targetQuery, 8),
      targetQuery.toLowerCase() !== skillsQuery.toLowerCase() ? searchArbeitnow(skillsQuery, 6) : Promise.resolve([]),
      ...altRolesToSearch.map((role: string) => searchArbeitnow(role, 5)),
    ];

    const [targetJobs, skillJobs, ...altJobArrays] = await Promise.all(fetchPromises);

    // Deduplicate target + skill jobs by slug
    const seenSlugs = new Set<string>();
    const combinedTarget: ArbeitnowJob[] = [];
    for (const job of [...targetJobs, ...skillJobs]) {
      if (!seenSlugs.has(job.slug)) {
        seenSlugs.add(job.slug);
        combinedTarget.push(job);
      }
    }

    const scoreJob = (job: ArbeitnowJob) => {
      const descText = stripHtml(job.description ?? "");
      const { score, matched } = computeMatchScore(resumeSkills, descText, job.tags ?? []);
      return {
        id: Math.abs(job.slug?.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 999999,
        title: job.title,
        company: job.company_name,
        url: job.url,
        salary: "",
        tags: (job.tags ?? []).filter(t => t !== "Remote").slice(0, 6),
        location: job.remote ? "Remote" : (job.location ?? "Remote"),
        postedDate: formatDate(job.created_at),
        jobType: (job.job_types ?? ["Full-time"])[0] ?? "Full-time",
        matchScore: score,
        matchedSkills: matched.slice(0, 5),
        isNew: isNew(job.created_at),
      };
    };

    const allScored = combinedTarget.map(scoreJob);
    // Prefer jobs with skill matches; fallback to top unmatched if needed
    const matched = allScored.filter(j => j.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    const unmatched = allScored.filter(j => j.matchScore === 0).slice(0, 3);
    const scoredTarget = matched.length >= 3 ? matched : [...matched, ...unmatched].slice(0, 6);

    const alternativeRoleJobs = altRolesToSearch
      .map((role, i) => ({
        query: role,
        roleCategory: role,
        jobs: (altJobArrays[i] ?? [])
          .map(scoreJob)
          .sort((a, b) => b.matchScore - a.matchScore),
        totalFound: altJobArrays[i]?.length ?? 0,
      }))
      .filter(r => r.jobs.length > 0);

    // Market insights from all jobs
    const allJobs = [...scoredTarget, ...alternativeRoleJobs.flatMap(r => r.jobs)];
    const companies = [...new Set(allJobs.map(j => j.company))].slice(0, 5);
    // Extract skill keywords from descriptions via matched skills frequency
    const skillFreq: Record<string, number> = {};
    allJobs.forEach(j => j.matchedSkills.forEach(s => { skillFreq[s] = (skillFreq[s] ?? 0) + 1; }));
    const topSkills = Object.entries(skillFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s]) => s);

    return NextResponse.json({
      targetRoleJobs: {
        query: targetQuery,
        roleCategory: targetRole || "Your Top Skills",
        jobs: scoredTarget,
        totalFound: scoredTarget.length,
      },
      alternativeRoleJobs,
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
