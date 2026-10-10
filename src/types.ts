export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  mark?: string;
  markClass?: string;
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
  sector?: string;
  district?: string;
  rwfSalaryEst?: string;
  workMode?: 'On-site' | 'Hybrid' | 'Remote';
  keySkills?: string[];
  submissionType?: 'Portal' | 'Email' | 'In-Person';
  status?: 'published' | 'draft' | 'pending_review' | 'archived';
  isAiDiscovered?: boolean;
  isVerified?: boolean;
  verifiedAt?: string;
  customLogoUrl?: string;
}

export type UserRole = 'seeker' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface CVDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  isDefault: boolean;
  fileDataUrl?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  headline: string;
  location: string;
  district?: string;
  phone: string;
  education: string;
  experienceYears: number;
  skills: string[];
  languages?: string[];
  bio: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  profile?: UserProfile;
}

export type ApplicationStatus =
  | 'draft'
  | 'payment_pending'
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'
  | 'closed'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'archived'
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Accepted'
  | 'Rejected'
  | 'Closed';

export interface ApplicationRecord {
  id: string;
  jobId: string;
  applicationRef?: string;
  referenceNumber?: string;
  userId?: string;
  seekerName?: string;
  seekerEmail?: string;
  seekerPhone?: string;
  jobTitle?: string;
  company?: string;
  cvId?: string;
  cvName?: string;
  cvFileName?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedDate?: string;
  submissionDate?: string;
  updatedDate?: string;
  feeAmountRwf?: number;
  applicationFeeFrw?: number;
  paymentRef?: string;
  paymentReference?: string;
  paymentStatus?: 'successful' | 'pending' | 'failed' | 'refunded' | 'confirmed';
  notes?: string;
  interviewDate?: string;
  contacts?: string;
}

export type PaymentProvider = 'mtn_momo' | 'airtel_money' | 'bank_card' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'CARD';
export type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded' | 'cancelled' | 'confirmed';

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  applicationRef?: string;
  userId: string;
  userEmail: string;
  userName: string;
  jobId: string;
  jobTitle: string;
  company: string;
  amountRwf?: number;
  amountFrw?: number;
  pricingCategory?: 'entry' | 'mid' | 'upper' | 'senior' | 'custom' | string;
  salaryCategory?: string;
  provider: PaymentProvider;
  providerPhone?: string;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  refundReason?: string;
}

export interface PricingTier {
  name: string;
  feeFrw: number;
  maxMonthlySalaryFrw: number;
  description: string;
}

export interface PricingConfig {
  entryFeeRwf: number;
  entryMaxSalary: number;
  midFeeRwf: number;
  midMaxSalary: number;
  upperFeeRwf: number;
  upperMaxSalary: number;
  seniorFeeRwf: number;
  fallbackFeeRwf: number;
  minFeeRwf: number;
  maxFeeRwf: number;
  tiers?: PricingTier[];
  exemptJobIds: string[];
  activeProviders: {
    mtn_momo: boolean;
    airtel_money: boolean;
    bank_card: boolean;
  };
  termsNoticeEn: string;
  termsNoticeRw: string;
  updatedAt: string;
}

export interface BrandingConfig {
  appName: string;
  tagline: string;
  logoUrl?: string | null;
  appLogoSvg?: string | null;
  headerIconSvg?: string | null;
  companyLogos: Record<string, string>;
  themeColor: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  totalInternalClicks: number;
  internalClicksCount?: number;
  revenueSummary?: {
    totalCollectedFrw: number;
    confirmedCount: number;
  };
  jobViewsCount: Record<string, number>;
  companyClicksCount: Record<string, number>;
  recentEvents: Array<{
    id: string;
    type: string;
    target?: string;
    path?: string;
    timestamp: string;
  }>;
  dailyVisits: Record<string, number>;
}

export interface AiJobDiscoveryRun {
  id: string;
  timestamp: string;
  jobsDiscovered: number;
  jobsVerified: number;
  jobsPublished: number;
  status: 'success' | 'partial' | 'failed';
  sourceSummary: string;
  discoveredJobs?: Job[];
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}
