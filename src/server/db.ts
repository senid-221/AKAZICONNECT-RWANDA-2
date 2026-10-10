import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import rawJobsData from '../jobs-data.json';
import {
  Job,
  UserProfile,
  CVDocument,
  ApplicationRecord,
  PaymentTransaction,
  PricingConfig,
  BrandingConfig,
  AnalyticsSummary,
  AiJobDiscoveryRun,
  AuditLog,
} from '../types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'akazi_database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helpers
export function hashPassword(password: string, salt: string = 'akazi_rwanda_salt_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

interface DatabaseSchema {
  users: Array<UserProfile & { passwordHash: string }>;
  cvs: CVDocument[];
  jobs: Job[];
  applications: ApplicationRecord[];
  payments: PaymentTransaction[];
  pricing: PricingConfig;
  branding: BrandingConfig;
  analytics: AnalyticsSummary;
  aiRuns: AiJobDiscoveryRun[];
  auditLogs: AuditLog[];
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@akazi.rw';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminAkaziRwanda2026!';

// Default initial state
function createInitialDatabase(): DatabaseSchema {
  const adminId = 'usr-admin-01';
  const now = new Date().toISOString();

  // Enriched metadata dictionary for initial 21 jobs
  const initialJobs: Job[] = (rawJobsData as any[]).map((raw) => {
    let rwfEst = '800,000 - 1,400,000 RWF / month';
    let workMode: 'On-site' | 'Hybrid' | 'Remote' = 'On-site';
    let district = 'Kigali';
    let sector = 'Professional Services';
    let keySkills = ['Teamwork', 'Communication', 'Execution', 'Rwandan Regulatory Awareness'];

    if (raw.id.startsWith('ra-')) {
      sector = 'Aviation & Technology';
      district = 'Kigali (Kicukiro/Airport)';
      rwfEst = '1,400,000 - 2,400,000 RWF / month';
      keySkills = ['Systems Architecture', 'High Availability', 'Database Operations', 'Security'];
    } else if (raw.company?.includes('One Acre Fund')) {
      sector = 'Agriculture & Social Enterprise';
      district = 'Rubengera / Kigali';
      rwfEst = '950,000 - 1,600,000 RWF / month';
      keySkills = ['Rural Development', 'Agricultural Operations', 'Team Leadership', 'Field Coordination'];
    } else if (raw.company?.includes('Embassy')) {
      sector = 'Diplomatic & International Relations';
      district = 'Kigali (Kacyiru)';
      rwfEst = '1,800,000 - 3,200,000 RWF / month';
      keySkills = ['Diplomatic Protocol', 'Administrative Excellence', 'Compliance', 'English & Kinyarwanda'];
    } else if (raw.company?.includes('DP World')) {
      sector = 'Logistics & Trade';
      district = 'Kigali (Masaka Dry Port)';
      rwfEst = '1,100,000 - 1,900,000 RWF / month';
      keySkills = ['Port Logistics', 'Supply Chain Management', 'Customs Clearance', 'Fleet Operations'];
    } else if (raw.company?.includes('Harmony')) {
      sector = 'BPO & Customer Services';
      district = 'Kigali (Nyarugenge)';
      rwfEst = '400,000 - 650,000 RWF / month';
      keySkills = ['Written English', 'Fast Typing Speed', 'Email & Chat Support', 'Customer Care'];
    } else if (raw.company?.includes('FAWE')) {
      sector = 'NGO & Education';
      district = 'Kigali (Gasabo)';
      rwfEst = '900,000 - 1,500,000 RWF / month';
      keySkills = ['Public Procurement', 'Vendor Management', 'Tender Preparation', 'Budget Monitoring'];
    }

    return {
      ...raw,
      district,
      sector,
      rwfSalaryEst: rwfEst,
      workMode,
      keySkills,
      status: 'published',
      isVerified: true,
      verifiedAt: '2026-10-08',
    };
  });

  const defaultPricing: PricingConfig = {
    entryFeeRwf: 5000,
    entryMaxSalary: 350000,
    midFeeRwf: 10000,
    midMaxSalary: 700000,
    upperFeeRwf: 15000,
    upperMaxSalary: 1500000,
    seniorFeeRwf: 20000,
    fallbackFeeRwf: 5000,
    minFeeRwf: 5000,
    maxFeeRwf: 20000,
    exemptJobIds: [],
    activeProviders: {
      mtn_momo: true,
      airtel_money: true,
      bank_card: true,
    },
    termsNoticeEn:
      'The application fee is charged by AkaziConnect Rwanda for verified application processing, tracking, and notification services. It is not paid to the employer and does not guarantee shortlisting or employment.',
    termsNoticeRw:
      'Amafaranga yo gusaba akazi yishyurwa AkaziConnect Rwanda kubera serivisi zo kugenzura no kohereza dosiye yawe mu buryo bwizewe. Ntabwo ahabwa umukoresha kandi ntagurisha umwanya w’akazi.',
    updatedAt: now,
  };

  const defaultBranding: BrandingConfig = {
    appName: 'AkaziConnect',
    tagline: 'Find work that moves you',
    appLogoSvg: null,
    headerIconSvg: null,
    companyLogos: {},
    themeColor: '#174332',
    updatedAt: now,
  };

  return {
    users: [
      {
        id: adminId,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash: hashPassword(ADMIN_PASSWORD),
        role: 'admin',
        status: 'active',
        name: 'Platform Administrator',
        headline: 'Lead Platform Administrator & Rwanda Employment Director',
        location: 'Kigali, Rwanda',
        district: 'Gasabo',
        phone: '+250 788 990 011',
        education: 'Master of Public Administration & Information Systems, University of Rwanda',
        experienceYears: 9,
        skills: ['Employment Platform Governance', 'Rwandan Labour Law', 'Recruitment Verification', 'Data Privacy'],
        languages: ['Kinyarwanda', 'English', 'French'],
        bio: 'Oversees platform operations, verified vacancies from official employers across Rwanda, and ensures transparent application processing.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    cvs: [],
    jobs: initialJobs,
    applications: [],
    payments: [],
    pricing: defaultPricing,
    branding: defaultBranding,
    analytics: {
      totalVisits: 0,
      uniqueVisitors: 0,
      totalInternalClicks: 0,
      jobViewsCount: {},
      companyClicksCount: {},
      recentEvents: [],
      dailyVisits: {},
    },
    aiRuns: [],
    auditLogs: [
      {
        id: 'aud-01',
        adminEmail: ADMIN_EMAIL.toLowerCase(),
        action: 'INITIALIZE_SYSTEM',
        details: 'AkaziConnect Rwanda production system initialized with verified Rwandan employers and salary fee tiers.',
        timestamp: now,
      },
    ],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);

        // Sanitize any legacy demo accounts or mock applications
        let needsSave = false;
        if (parsed.users && parsed.users.some((u) => u.email === 'seeker@akazi.rw' || u.id === 'usr-seeker-01')) {
          parsed.users = parsed.users.filter((u) => u.email !== 'seeker@akazi.rw' && u.id !== 'usr-seeker-01');
          needsSave = true;
        }

        if (parsed.cvs && parsed.cvs.some((c) => c.userId === 'usr-seeker-01' || c.id.startsWith('cv-amara'))) {
          parsed.cvs = parsed.cvs.filter((c) => c.userId !== 'usr-seeker-01' && !c.id.startsWith('cv-amara'));
          needsSave = true;
        }

        if (parsed.applications && parsed.applications.some((a) => a.userId === 'usr-seeker-01' || a.id.startsWith('app-akz-10'))) {
          parsed.applications = parsed.applications.filter((a) => a.userId !== 'usr-seeker-01' && !a.id.startsWith('app-akz-10'));
          needsSave = true;
        }

        if (parsed.payments && parsed.payments.some((p) => p.userId === 'usr-seeker-01' || p.id.startsWith('pay-00'))) {
          parsed.payments = parsed.payments.filter((p) => p.userId !== 'usr-seeker-01' && !p.id.startsWith('pay-00'));
          needsSave = true;
        }

        // Ensure admin user exists with current production credentials
        const adminUser = parsed.users.find((u) => u.role === 'admin' || u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
        if (adminUser) {
          adminUser.email = ADMIN_EMAIL.toLowerCase();
          if (process.env.ADMIN_PASSWORD) {
            adminUser.passwordHash = hashPassword(ADMIN_PASSWORD);
            needsSave = true;
          }
        } else {
          parsed.users.unshift({
            id: 'usr-admin-01',
            email: ADMIN_EMAIL.toLowerCase(),
            passwordHash: hashPassword(ADMIN_PASSWORD),
            role: 'admin',
            status: 'active',
            name: 'Platform Administrator',
            headline: 'Lead Platform Administrator & Rwanda Employment Director',
            location: 'Kigali, Rwanda',
            district: 'Gasabo',
            phone: '+250 788 990 011',
            education: 'Master of Public Administration & Information Systems, University of Rwanda',
            experienceYears: 9,
            skills: ['Employment Platform Governance', 'Rwandan Labour Law', 'Recruitment Verification', 'Data Privacy'],
            languages: ['Kinyarwanda', 'English', 'French'],
            bio: 'Oversees platform operations, verified vacancies from official employers across Rwanda, and ensures transparent application processing.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          needsSave = true;
        }

        if (needsSave) {
          this.saveToFile(parsed);
        }

        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse database file, reinitializing default:', err);
    }
    const initial = createInitialDatabase();
    this.saveToFile(initial);
    return initial;
  }

  private saveToFile(state: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private commit() {
    this.saveToFile(this.data);
  }

  // --- Auth & Users ---
  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: 'seeker' | 'admin';
  }): UserProfile {
    const existing = this.findUserByEmail(user.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const now = new Date().toISOString();
    const newUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email: user.email.toLowerCase(),
      passwordHash: hashPassword(user.password),
      role: user.role || 'seeker',
      status: 'active' as const,
      name: user.name,
      headline: 'Candidate seeking Rwandan employment',
      location: 'Kigali, Rwanda',
      district: 'Gasabo',
      phone: user.phone || '+250 788 000 000',
      education: 'Higher Education / TVET Institution in Rwanda',
      experienceYears: 1,
      skills: ['Communication', 'Teamwork', 'Computer Literacy'],
      languages: ['Kinyarwanda', 'English'],
      bio: '',
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push(newUser);
    this.commit();

    const { passwordHash, ...profile } = newUser;
    return profile;
  }

  updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): UserProfile {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (updates.name) user.name = updates.name;
    if (updates.headline) user.headline = updates.headline;
    if (updates.location) user.location = updates.location;
    if (updates.district) user.district = updates.district;
    if (updates.phone) user.phone = updates.phone;
    if (updates.education) user.education = updates.education;
    if (typeof updates.experienceYears === 'number') user.experienceYears = updates.experienceYears;
    if (updates.skills) user.skills = updates.skills;
    if (updates.languages) user.languages = updates.languages;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    user.updatedAt = new Date().toISOString();

    this.commit();
    const { passwordHash, ...profile } = user;
    return profile;
  }

  getAllUsers() {
    return this.data.users.map(({ passwordHash, ...p }) => ({
      ...p,
      applicationsCount: this.data.applications.filter((a) => a.userId === p.id).length,
      cvCount: this.data.cvs.filter((c) => c.userId === p.id).length,
    }));
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended', adminEmail: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    user.status = status;
    user.updatedAt = new Date().toISOString();

    this.addAuditLog(adminEmail, 'UPDATE_USER_STATUS', `Updated user ${user.email} status to ${status}`);
    this.commit();
    return user;
  }

  // --- CVs & Documents ---
  getUserCVs(userId: string): CVDocument[] {
    return this.data.cvs.filter((c) => c.userId === userId);
  }

  addCV(cv: {
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileDataUrl?: string;
    notes?: string;
  }): CVDocument {
    const userCvs = this.getUserCVs(cv.userId);
    const isFirst = userCvs.length === 0;

    const newCv: CVDocument = {
      id: `cv-${crypto.randomUUID().slice(0, 8)}`,
      userId: cv.userId,
      fileName: cv.fileName,
      fileType: cv.fileType || 'application/pdf',
      fileSize: cv.fileSize || 100000,
      uploadedAt: new Date().toISOString(),
      isDefault: isFirst,
      fileDataUrl: cv.fileDataUrl,
      notes: cv.notes,
    };

    this.data.cvs.push(newCv);
    this.commit();
    return newCv;
  }

  setDefaultCV(userId: string, cvId: string) {
    this.data.cvs.forEach((c) => {
      if (c.userId === userId) {
        c.isDefault = c.id === cvId;
      }
    });
    this.commit();
  }

  deleteCV(userId: string, cvId: string) {
    const idx = this.data.cvs.findIndex((c) => c.id === cvId && c.userId === userId);
    if (idx !== -1) {
      this.data.cvs.splice(idx, 1);
      // If default was deleted, assign first available as default
      const remaining = this.getUserCVs(userId);
      if (remaining.length > 0 && !remaining.some((c) => c.isDefault)) {
        remaining[0].isDefault = true;
      }
      this.commit();
      return true;
    }
    return false;
  }

  // --- Jobs Management ---
  getAllJobs(): Job[] {
    // Enrich with custom company logos from branding
    const logos = this.data.branding.companyLogos || {};
    return this.data.jobs.map((job) => ({
      ...job,
      customLogoUrl: logos[job.company] || job.customLogoUrl,
    }));
  }

  getJobById(jobId: string): Job | undefined {
    const job = this.data.jobs.find((j) => j.id === jobId || j.slug === jobId);
    if (!job) return undefined;
    const logos = this.data.branding.companyLogos || {};
    return {
      ...job,
      customLogoUrl: logos[job.company] || job.customLogoUrl,
    };
  }

  saveJob(job: Job, adminEmail?: string): Job {
    const existingIdx = this.data.jobs.findIndex((j) => j.id === job.id);
    if (existingIdx !== -1) {
      this.data.jobs[existingIdx] = { ...this.data.jobs[existingIdx], ...job };
      if (adminEmail) {
        this.addAuditLog(adminEmail, 'UPDATE_JOB', `Updated job listing ${job.title} (${job.id})`);
      }
    } else {
      this.data.jobs.unshift(job);
      if (adminEmail) {
        this.addAuditLog(adminEmail, 'CREATE_JOB', `Created job listing ${job.title} at ${job.company}`);
      }
    }
    this.commit();
    return job;
  }

  deleteJob(jobId: string, adminEmail?: string) {
    const idx = this.data.jobs.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      const removed = this.data.jobs.splice(idx, 1)[0];
      if (adminEmail) {
        this.addAuditLog(adminEmail, 'DELETE_JOB', `Deleted job listing ${removed.title} (${jobId})`);
      }
      this.commit();
      return true;
    }
    return false;
  }

  // --- Fee Calculation Engine (Server-Side) ---
  calculateApplicationFee(job: Job): {
    feeAmountRwf: number;
    category: 'entry' | 'mid' | 'upper' | 'senior' | 'exempt';
    pricingCategoryLabel: string;
    isExempt: boolean;
  } {
    const pricing = this.data.pricing;

    // Check exemption
    if (pricing.exemptJobIds && pricing.exemptJobIds.includes(job.id)) {
      return {
        feeAmountRwf: 0,
        category: 'exempt',
        pricingCategoryLabel: 'Fee Exempt Campaign',
        isExempt: true,
      };
    }

    // Parse salary estimation
    const est = (job.rwfSalaryEst || job.salaryLabel || '').toLowerCase();
    let numericEst = 0;

    // Search for numbers like 1,400,000 or 400,000 or minSalary
    if (job.minSalary && job.minSalary > 0) {
      numericEst = job.minSalary;
    } else {
      const match = est.match(/(\d[\d,]*)/);
      if (match) {
        numericEst = parseInt(match[1].replace(/,/g, ''), 10);
      }
    }

    // Determine category based on configured thresholds
    if (numericEst > 0) {
      if (numericEst <= pricing.entryMaxSalary) {
        return {
          feeAmountRwf: pricing.entryFeeRwf,
          category: 'entry',
          pricingCategoryLabel: 'Entry-Level / Small Salary',
          isExempt: false,
        };
      } else if (numericEst <= pricing.midMaxSalary) {
        return {
          feeAmountRwf: pricing.midFeeRwf,
          category: 'mid',
          pricingCategoryLabel: 'Lower-to-Middle Salary',
          isExempt: false,
        };
      } else if (numericEst <= pricing.upperMaxSalary) {
        return {
          feeAmountRwf: pricing.upperFeeRwf,
          category: 'upper',
          pricingCategoryLabel: 'Middle-to-High Salary',
          isExempt: false,
        };
      } else {
        return {
          feeAmountRwf: pricing.seniorFeeRwf,
          category: 'senior',
          pricingCategoryLabel: 'Higher-Paying & Senior Level',
          isExempt: false,
        };
      }
    }

    // Fallback if salary undisclosed or entry level
    return {
      feeAmountRwf: pricing.fallbackFeeRwf || 5000,
      category: 'entry',
      pricingCategoryLabel: 'Standard Entry / Sourced Vacancy',
      isExempt: false,
    };
  }

  // --- Applications & Payments Workflow ---
  createPendingPayment(params: {
    userId: string;
    jobId: string;
    provider: 'mtn_momo' | 'airtel_money' | 'bank_card';
    providerPhone?: string;
  }) {
    const user = this.findUserById(params.userId);
    if (!user) throw new Error('User not found');

    const job = this.getJobById(params.jobId);
    if (!job) throw new Error('Job not found');

    // Check duplicate
    const existing = this.data.applications.find(
      (a) => a.userId === params.userId && a.jobId === params.jobId && a.status !== 'withdrawn'
    );
    if (existing && existing.paymentStatus === 'successful') {
      throw new Error('You have already submitted an application for this vacancy.');
    }

    const { feeAmountRwf, category } = this.calculateApplicationFee(job);
    const txnRef = `TXN-AKZ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const appRef = `AKZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentTransaction = {
      id: `pay-${crypto.randomUUID().slice(0, 8)}`,
      transactionRef: txnRef,
      applicationRef: appRef,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      amountRwf: feeAmountRwf,
      pricingCategory: category === 'exempt' ? 'entry' : category,
      provider: params.provider,
      providerPhone: params.providerPhone || user.phone,
      status: 'pending',
      createdAt: new Date().toISOString(),
      receiptNumber: `RCPT-AKZ-${Date.now().toString().slice(-6)}`,
    };

    this.data.payments.unshift(newPayment);
    this.commit();

    return {
      transaction: newPayment,
      feeAmountRwf,
      job,
    };
  }

  confirmPaymentAndSubmitApplication(params: {
    transactionRef: string;
    cvId?: string;
    coverLetter?: string;
    notes?: string;
  }): { application: ApplicationRecord; transaction: PaymentTransaction } {
    const txn = this.data.payments.find((p) => p.transactionRef === params.transactionRef);
    if (!txn) throw new Error('Payment transaction not found');

    const user = this.findUserById(txn.userId);
    if (!user) throw new Error('User not found');

    const job = this.getJobById(txn.jobId);
    if (!job) throw new Error('Job not found');

    // Mark payment successful
    const now = new Date().toISOString();
    txn.status = 'successful';
    txn.paidAt = now;

    // Fetch user CV
    const userCvs = this.getUserCVs(user.id);
    const selectedCv = userCvs.find((c) => c.id === params.cvId) || userCvs.find((c) => c.isDefault) || userCvs[0];

    // Create or update application record
    let app = this.data.applications.find(
      (a) => a.userId === user.id && a.jobId === job.id
    );

    if (app) {
      app.status = 'submitted';
      app.appliedDate = now;
      app.updatedDate = now;
      app.feeAmountRwf = txn.amountRwf;
      app.paymentRef = txn.transactionRef;
      app.paymentStatus = 'successful';
      app.cvId = selectedCv?.id;
      app.cvName = selectedCv?.fileName || 'Attached Profile Credentials';
      app.coverLetter = params.coverLetter;
      app.notes = params.notes;
    } else {
      app = {
        id: `app-${crypto.randomUUID().slice(0, 8)}`,
        applicationRef: txn.applicationRef,
        jobId: job.id,
        userId: user.id,
        seekerName: user.name,
        seekerEmail: user.email,
        seekerPhone: user.phone,
        jobTitle: job.title,
        company: job.company,
        cvId: selectedCv?.id,
        cvName: selectedCv?.fileName || 'Attached Profile Credentials',
        coverLetter: params.coverLetter,
        status: 'submitted',
        appliedDate: now,
        updatedDate: now,
        feeAmountRwf: txn.amountRwf,
        paymentRef: txn.transactionRef,
        paymentStatus: 'successful',
        notes: params.notes,
      };
      this.data.applications.unshift(app);
    }

    // Track analytics apply_complete event
    this.trackAnalyticsEvent({
      type: 'apply_complete',
      target: `${job.title} (${job.company}) - Fee: ${txn.amountRwf} FRW`,
      path: `/apply/${job.slug || job.id}`,
    });

    this.commit();
    return { application: app, transaction: txn };
  }

  getUserApplications(userId: string): ApplicationRecord[] {
    return this.data.applications.filter((a) => a.userId === userId);
  }

  getUserPayments(userId: string): PaymentTransaction[] {
    return this.data.payments.filter((p) => p.userId === userId);
  }

  getAllApplications(): ApplicationRecord[] {
    return this.data.applications;
  }

  updateApplicationStatus(
    appId: string,
    status: ApplicationRecord['status'],
    adminEmail: string,
    interviewDate?: string,
    contacts?: string
  ): ApplicationRecord {
    const app = this.data.applications.find((a) => a.id === appId || a.applicationRef === appId);
    if (!app) throw new Error('Application not found');

    app.status = status;
    app.updatedDate = new Date().toISOString();
    if (interviewDate !== undefined) app.interviewDate = interviewDate;
    if (contacts !== undefined) app.contacts = contacts;

    this.addAuditLog(
      adminEmail,
      'UPDATE_APPLICATION_STATUS',
      `Application ${app.applicationRef} (${app.jobTitle} - ${app.seekerName}) set to ${status}`
    );
    this.commit();
    return app;
  }

  withdrawApplication(appId: string, userId: string): ApplicationRecord {
    const app = this.data.applications.find((a) => a.id === appId && a.userId === userId);
    if (!app) throw new Error('Application not found or unauthorized');

    app.status = 'withdrawn';
    app.updatedDate = new Date().toISOString();
    this.commit();
    return app;
  }

  // --- Payments Admin & Refunds ---
  getAllPayments(): PaymentTransaction[] {
    return this.data.payments;
  }

  processRefund(transactionRef: string, adminEmail: string, reason: string): PaymentTransaction {
    const txn = this.data.payments.find((p) => p.transactionRef === transactionRef);
    if (!txn) throw new Error('Transaction not found');
    if (txn.status !== 'successful') throw new Error('Only successful transactions can be refunded');

    txn.status = 'refunded';
    txn.refundReason = reason;

    // Update corresponding application
    const app = this.data.applications.find((a) => a.paymentRef === transactionRef);
    if (app) {
      app.paymentStatus = 'refunded';
      app.status = 'closed';
    }

    this.addAuditLog(adminEmail, 'PROCESS_REFUND', `Refunded ${txn.amountRwf} FRW for transaction ${transactionRef}. Reason: ${reason}`);
    this.commit();
    return txn;
  }

  getPricingConfig(): PricingConfig {
    return this.data.pricing;
  }

  updatePricingConfig(updates: Partial<PricingConfig>, adminEmail: string): PricingConfig {
    this.data.pricing = {
      ...this.data.pricing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog(adminEmail, 'UPDATE_PRICING', `Updated application fee configuration.`);
    this.commit();
    return this.data.pricing;
  }

  // --- Branding & Appearance Management ---
  getBranding(): BrandingConfig {
    return this.data.branding;
  }

  updateBrandingLogo(key: 'appLogo' | 'headerIcon' | string, dataUrlOrSvg: string | null, adminEmail: string): BrandingConfig {
    if (key === 'appLogo') {
      this.data.branding.appLogoSvg = dataUrlOrSvg;
    } else if (key === 'headerIcon') {
      this.data.branding.headerIconSvg = dataUrlOrSvg;
    } else {
      // Company logo override
      if (!this.data.branding.companyLogos) {
        this.data.branding.companyLogos = {};
      }
      if (dataUrlOrSvg) {
        this.data.branding.companyLogos[key] = dataUrlOrSvg;
      } else {
        delete this.data.branding.companyLogos[key];
      }
    }
    this.data.branding.updatedAt = new Date().toISOString();
    this.addAuditLog(adminEmail, 'UPDATE_BRANDING', `Updated logo asset for: ${key}`);
    this.commit();
    return this.data.branding;
  }

  resetAllBranding(adminEmail: string): BrandingConfig {
    this.data.branding = {
      appName: 'AkaziConnect',
      tagline: 'Find work that moves you',
      appLogoSvg: null,
      headerIconSvg: null,
      companyLogos: {},
      themeColor: '#174332',
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog(adminEmail, 'RESET_BRANDING', `Reset all branding and company logos to system defaults.`);
    this.commit();
    return this.data.branding;
  }

  // --- Analytics & Click Tracking ---
  trackAnalyticsEvent(event: {
    type: 'visit' | 'click' | 'job_view' | 'apply_start' | 'apply_complete' | 'search';
    target?: string;
    path?: string;
  }) {
    const a = this.data.analytics;
    const today = new Date().toISOString().split('T')[0];

    if (event.type === 'visit') {
      a.totalVisits += 1;
      a.dailyVisits[today] = (a.dailyVisits[today] || 0) + 1;
    } else {
      a.totalInternalClicks += 1;
    }

    if (event.type === 'job_view' && event.target) {
      a.jobViewsCount[event.target] = (a.jobViewsCount[event.target] || 0) + 1;
    }

    const newEvent = {
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: event.type,
      target: event.target,
      path: event.path,
      timestamp: new Date().toISOString(),
    };

    a.recentEvents.unshift(newEvent);
    if (a.recentEvents.length > 100) {
      a.recentEvents = a.recentEvents.slice(0, 100);
    }

    // Periodic commit without lagging
    this.commit();
  }

  getAnalyticsSummary(): AnalyticsSummary {
    return this.data.analytics;
  }

  // --- AI Discovery Runs & Queue ---
  getAiRuns(): AiJobDiscoveryRun[] {
    return this.data.aiRuns;
  }

  addAiRun(run: Omit<AiJobDiscoveryRun, 'id'>): AiJobDiscoveryRun {
    const newRun: AiJobDiscoveryRun = {
      id: `airun-${Date.now()}`,
      ...run,
    };
    this.data.aiRuns.unshift(newRun);
    if (this.data.aiRuns.length > 50) {
      this.data.aiRuns = this.data.aiRuns.slice(0, 50);
    }
    this.commit();
    return newRun;
  }

  // --- Audit Logs ---
  addAuditLog(adminEmail: string, action: string, details: string) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminEmail,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }
}

export const db = new Database();
