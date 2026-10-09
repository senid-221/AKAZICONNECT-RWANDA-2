import { Job } from '../types';
import rawJobs from '../jobs-data.json';
import { REDIRECTS_MAP } from './redirects';

const enrichedMetadata: Record<string, Partial<Job>> = {
  'ra-rn519': {
    sector: 'Aviation & Technology',
    district: 'Kigali (Kicukiro/Airport)',
    rwfSalaryEst: '1,400,000 - 2,200,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Oracle / SQL Server', 'Database Clustering', 'Data Backup & Recovery', 'Performance Tuning'],
    submissionType: 'Portal',
  },
  'ra-rn520': {
    sector: 'Aviation & Technology',
    district: 'Kigali (Kicukiro/Airport)',
    rwfSalaryEst: '1,300,000 - 2,000,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['ETL Pipelines', 'Python', 'Data Warehousing', 'BI Tools'],
    submissionType: 'Portal',
  },
  'ra-rn521': {
    sector: 'Aviation & Technology',
    district: 'Kigali (Kicukiro/Airport)',
    rwfSalaryEst: '800,000 - 1,200,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Hardware & Networking', 'Active Directory', 'IT Helpdesk', 'Troubleshooting'],
    submissionType: 'Portal',
  },
  'ra-rn522': {
    sector: 'Aviation & Technology',
    district: 'Kigali (Kicukiro/Airport)',
    rwfSalaryEst: '1,400,000 - 2,200,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Full Stack Development', 'REST APIs', 'Software Architecture', 'Git / CI/CD'],
    submissionType: 'Portal',
  },
  'ra-rn523': {
    sector: 'Aviation & Technology',
    district: 'Kigali (Kicukiro/Airport)',
    rwfSalaryEst: '1,500,000 - 2,400,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Cybersecurity', 'SIEM & Firewalls', 'Compliance (ISO 27001)', 'Penetration Testing'],
    submissionType: 'Portal',
  },
  'fawe-procurement': {
    sector: 'NGO & Education',
    district: 'Kigali (Gasabo)',
    rwfSalaryEst: '900,000 - 1,500,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Public Procurement', 'Vendor Management', 'Tender Preparation', 'Budget Monitoring'],
    submissionType: 'Portal',
  },
  'harmony-nonvoice': {
    sector: 'BPO & Customer Services',
    district: 'Kigali (Nyarugenge)',
    rwfSalaryEst: '400,000 - 650,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Written English', 'Fast Typing Speed', 'Email & Chat Support', 'Zendesk / CRM'],
    submissionType: 'Portal',
  },
  'dpworld-sales': {
    sector: 'Logistics & Trade',
    district: 'Kigali (Masaka / Kicukiro)',
    rwfSalaryEst: '1,000,000 - 1,800,000 RWF + Commission',
    workMode: 'Hybrid',
    keySkills: ['B2B Sales', 'Supply Chain & Freight', 'Client Relationship', 'Contract Negotiation'],
    submissionType: 'Email',
  },
  'oaf-audit-supervisor': {
    sector: 'Agriculture & NGO',
    district: 'Southern Province (Muhanga)',
    rwfSalaryEst: '850,000 - 1,400,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Field Data Auditing', 'Advanced Excel', 'Kinyarwanda & English', 'Team Leadership'],
    submissionType: 'Portal',
  },
  'usembassy-clo': {
    sector: 'Diplomatic Mission',
    district: 'Kigali (Kacyiru / Gasabo)',
    rwfSalaryEst: '1,200,000 - 1,900,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Administration', 'Event Planning', 'Diplomatic Protocol', 'Community Outreach'],
    submissionType: 'Portal',
  },
  'lfl-maintenance': {
    sector: 'Manufacturing & Agribusiness',
    district: 'Rwanda (Bugesera / Kigali)',
    rwfSalaryEst: '750,000 - 1,200,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Electromechanical Repairs', 'Preventive Maintenance', 'PLC Systems', 'Industrial Safety'],
    submissionType: 'Portal',
  },
  'rssb-contracting': {
    sector: 'Public Health & Social Security',
    district: 'Kigali (Nyarugenge)',
    rwfSalaryEst: '1,300,000 - 2,100,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Healthcare Contracting', 'Partnership Management', 'Compliance', 'Medical Tariffs'],
    submissionType: 'Portal',
  },
  'capitalist-pr': {
    sector: 'Supply & Logistics',
    district: 'Kigali (Gasabo)',
    rwfSalaryEst: '600,000 - 1,000,000 RWF / month',
    workMode: 'Hybrid',
    keySkills: ['Digital Marketing', 'Press Releases', 'Social Media', 'Brand Strategy'],
    submissionType: 'Portal',
  },
  'tea-shop-manager-hrms': {
    sector: 'Hospitality & Retail',
    district: 'Kigali (Nyarugenge)',
    rwfSalaryEst: '500,000 - 850,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Lounge Operations', 'Inventory Control', 'Staff Management', 'Customer Service'],
    submissionType: 'Portal',
  },
  'hospitality-manager-hope-haven': {
    sector: 'Education & Hospitality',
    district: 'Kigali (Murindi / Gasabo)',
    rwfSalaryEst: '800,000 - 1,300,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Guest Hospitality', 'Facilities Oversight', 'Food & Beverage', 'Event Planning'],
    submissionType: 'Portal',
  },
  'physical-mental-wellbeing-specialist-fh': {
    sector: 'International NGO',
    district: 'Kigali HQ',
    rwfSalaryEst: '1,500,000 - 2,500,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Public Health', 'Mental Health Support', 'Staff Wellbeing', 'Community Health'],
    submissionType: 'Portal',
  },
  'customer-care-ratwa-sacco-huye': {
    sector: 'Banking & SACCO',
    district: 'Southern Province (Huye)',
    rwfSalaryEst: '350,000 - 550,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Member Services', 'Cash Handling', 'Loan Information', 'Kinyarwanda'],
    submissionType: 'In-Person',
  },
  'executive-coordinator-ace-aj-laf': {
    sector: 'Legal & Human Rights',
    district: 'Kigali (Gasabo)',
    rwfSalaryEst: '1,600,000 - 2,600,000 RWF / month',
    workMode: 'Hybrid',
    keySkills: ['Program Coordination', 'Human Rights Advocacy', 'Donor Reporting', 'High-level Stakeholder Mgt'],
    submissionType: 'Email',
  },
  'shec-officer-luna-smelter': {
    sector: 'Mining & Metallurgical',
    district: 'Kigali (Karisimbi / Gikondo)',
    rwfSalaryEst: '900,000 - 1,600,000 RWF / month',
    workMode: 'On-site',
    keySkills: ['Safety Audits', 'Environmental Compliance', 'NEBOSH/IOSH', 'Risk Assessment'],
    submissionType: 'Email',
  },
  'master-data-integration-specialist-one-acre-fund': {
    sector: 'Agriculture & Technology',
    district: 'Kigali (Gasabo)',
    rwfSalaryEst: '1,500,000 - 2,500,000 RWF / month',
    workMode: 'Hybrid',
    keySkills: ['SAP Business One', 'Master Data Governance', 'Integration Pipelines', 'Advanced Excel'],
    submissionType: 'Portal',
  },
  'finance-lead-wicloud': {
    sector: 'Fintech & Cloud Services',
    district: 'Kigali (Nyarugenge)',
    rwfSalaryEst: '1,400,000 - 2,200,000 RWF / month',
    workMode: 'Hybrid',
    keySkills: ['Rwanda Tax Compliance (RRA)', 'Full-cycle Accounting', 'Financial Modeling', 'QuickBooks/ERP'],
    submissionType: 'Email',
  },
};

export const jobsData: Job[] = (rawJobs as Job[]).map((job) => {
  const redirect = REDIRECTS_MAP[job.id];
  return {
    ...job,
    ...(enrichedMetadata[job.id] || {}),
    destinationUrl: redirect ? redirect.destination : job.destinationUrl,
    vanityPath: redirect ? redirect.vanityPath : `/apply/${job.slug}/`,
  };
});

export const CATEGORIES = [
  'All roles',
  'Tech & digital',
  'Operations',
  'Customer care',
  'Sales',
  'Marketing',
  'Hospitality',
  'Health & development',
  'NGO & development',
  'Engineering & safety',
  'Finance',
];

export const LOCATIONS = [
  'All locations',
  'Kigali',
  'Huye',
  'Muhanga',
  'Rwanda',
];

export const SOURCE_BOARDS = [
  {
    name: 'Job in Rwanda',
    url: 'https://www.jobinrwanda.com/index.php/jobs/all',
    desc: 'The leading commercial vacancy board in Rwanda with daily updates across corporate and development sectors.',
  },
  {
    name: 'RwandAir Careers',
    url: 'https://erecruitment.rwandair.com/',
    desc: 'National flag carrier official portal for flight operations, engineering, ground handling, and corporate positions.',
  },
  {
    name: 'RSSB Careers',
    url: 'https://rssb.rw/rw/career',
    desc: 'Rwanda Social Security Board official civil service and healthcare administration recruitment portal.',
  },
  {
    name: 'AkaziNet',
    url: 'https://akazinet.com/jobs',
    desc: 'Aggregated Rwandan opportunities, internships, scholarships, and professional consultancies.',
  },
];

export const CHECKED_DATE = '2026-10-08';
