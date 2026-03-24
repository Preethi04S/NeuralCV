export interface RewriteSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface InterviewQuestion {
  question: string;
  why: string;
  tip: string;
}

export interface ActionStep {
  day: string;
  task: string;
  impact: "high" | "medium" | "low";
}

export interface AlternativeRole {
  title: string;
  matchPercent: number;
  reason: string;
}

export interface ResumeProfile {
  name: string;
  topSkills: string[];
  experienceYears: number;
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  educationLevel: string;
  summary: string;
}

export interface AnalysisResult {
  atsScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: string;
  skillsMatchPercent: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  rewriteSuggestions: RewriteSuggestion[];
  interviewQuestions: InterviewQuestion[];
  actionPlan: ActionStep[];
  alternativeRoles: AlternativeRole[];
  resumeProfile: ResumeProfile;
  agentLogs: string[];
}

export interface AnalyzeRequest {
  resume: string;
  jobDescription: string;
}
