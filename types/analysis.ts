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

export interface CounterfactualSkill {
  skill: string;
  currentScore: number;
  projectedScore: number;
  pointsGain: number;
  howToAdd: string;
}

export interface JDBiasPhrase {
  phrase: string;
  biasType: "gender" | "age" | "cultural" | "exclusionary" | "ableist";
  explanation: string;
  suggestion: string;
}

export interface JDBiasReport {
  overallRating: "clean" | "mild" | "moderate" | "severe";
  biasedPhrases: JDBiasPhrase[];
  summary: string;
}

export interface IntegrityFlag {
  issue: string;
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface ResumeIntegrity {
  integrityScore: number;
  verdict: string;
  flags: IntegrityFlag[];
}

export interface AgentPassportEntry {
  agentId: number;
  name: string;
  model: string;
  role: string;
  confidence: number;
  tokensUsed: string;
  outputSummary: string;
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
  // New USP features
  counterfactuals: CounterfactualSkill[];
  jdBiasReport: JDBiasReport;
  resumeIntegrity: ResumeIntegrity;
  agentPassport: AgentPassportEntry[];
  overallConfidence: number;
}

export interface AnalyzeRequest {
  resume: string;
  jobDescription: string;
}
