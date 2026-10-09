export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  mark: string;
  markClass: string;
  location: string | null;
  categories: string[];
  engagement?: string;
  department?: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryLabel: string;
  published: string | null;
  deadline: string;
  deadlineTime?: string;
  deadlineTimezone?: string;
  sourceUrl: string;
  destinationUrl: string;
  applyText?: string;
  applyLabel?: string;
  applyInstructions: string;
  experience?: string;
  summary: string;
  requirements?: string[];
  requirementsNote?: string;
  vanityPath?: string;
  // Enriched metadata for enhanced user experience in Rwanda
  sector?: string;
  district?: string;
  rwfSalaryEst?: string;
  workMode?: 'On-site' | 'Hybrid' | 'Remote';
  keySkills?: string[];
  submissionType?: 'Portal' | 'Email' | 'In-Person';
}

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'archived';

export interface ApplicationRecord {
  jobId: string;
  status: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
  interviewDate?: string;
  contacts?: string;
}

export interface UserProfile {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  education: string;
  experienceYears: number;
  skills: string[];
  bio: string;
}
