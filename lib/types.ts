// Domain types. Field names map 1:1 to snake_case columns in a future Supabase schema.

export type Priority = 'essential' | 'preferred';
export type FactorStatus = 'met' | 'partial' | 'gap';
export type WorkSetup = 'onsite' | 'hybrid' | 'remote';
export type FactorKey = 'skills' | 'experience' | 'compensation' | 'location' | 'workSetup';
export type EvidenceType = 'project' | 'internship' | 'certification' | 'portfolio';
export type SwipeDecision = 'pass' | 'like' | 'super';
export type Role = 'jobseeker' | 'employer';

export interface SalaryRange {
  min: number; // PHP per month
  max: number;
}

export interface Place {
  city: string;
  metro: string; // e.g. "Metro Manila", "Metro Cebu"
}

export interface Weighted<T> {
  value: T;
  priority: Priority;
}

export interface ProfileSkill {
  name: string;
  proficiency: 1 | 2 | 3; // 1 basic, 2 working, 3 strong
}

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  skills: string[];
  months?: number; // duration, mainly for internships
  url?: string;
}

export interface WorkExperience {
  role: string;
  org: string;
  months: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  headline: string;
  education: string;
  avatarHue: number; // drives the generated avatar color
  skills: ProfileSkill[];
  experience: WorkExperience[];
  evidence: EvidenceItem[];
  preferences: {
    salary: Weighted<SalaryRange>;
    locations: Weighted<Place[]>;
    workSetups: Weighted<WorkSetup[]>;
    openToRelocate: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  hue: number;
}

export interface Vacancy {
  id: string;
  companyId: string;
  title: string;
  level: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experience: Weighted<{ minMonths: number }>;
  salary: Weighted<SalaryRange>;
  location: Weighted<Place>;
  workSetup: Weighted<WorkSetup>;
  skillsPriority: Priority;
}

export interface FactorResult {
  key: FactorKey;
  label: string;
  score: number; // raw 0–100, before preferred softening
  priority: Priority;
  status: FactorStatus;
  note: string; // plain-language explanation, oriented to the viewer
}

export interface EvidenceBoost {
  evidenceId: string;
  title: string;
  type: EvidenceType;
  skills: string[];
}

export interface MatchResult {
  overall: number;
  hasEssentialGap: boolean;
  essentialsMet: number;
  essentialsTotal: number;
  factors: FactorResult[];
  evidenceBoosts: EvidenceBoost[];
  summary: string;
}

export interface Swipe {
  side: Role; // who swiped: the jobseeker or the employer on this pair
  candidateId: string;
  vacancyId: string;
  decision: SwipeDecision;
  at: number;
}

export interface Match {
  id: string;
  candidateId: string;
  vacancyId: string;
  createdAt: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  at: number;
}
