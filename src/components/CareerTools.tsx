import React, { useState } from 'react';
import { Job } from '../types';
import { Language, translations } from '../utils/translations';
import { CompanyLogo } from './CompanyLogo';
import {
  FileText,
  DollarSign,
  CheckCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
  Building,
} from 'lucide-react';

interface CareerToolsProps {
  jobs: Job[];
  onOpenCoverLetterBuilder: (job: Job) => void;
  lang: Language;
}

export const CareerTools: React.FC<CareerToolsProps> = ({
  jobs,
  onOpenCoverLetterBuilder,
  lang,
}) => {
  const t = translations[lang];
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const salaryBands = [
    {
      sector: 'Technology & Data',
      entry: '600k – 900k RWF',
      mid: '1.2M – 2.0M RWF',
      senior: '2.2M – 4.0M+ RWF',
      notes: 'High demand in Kigali for Database, Full Stack, Data Engineering, and Cybersecurity (e.g., RwandAir, Wicloud).',
    },
    {
      sector: 'International NGOs & Development',
      entry: '700k – 1.1M RWF',
      mid: '1.4M – 2.4M RWF',
      senior: '2.8M – 5.0M+ RWF',
      notes: 'Roles at One Acre Fund, FH Association, and FAWE with donor-funded benefits.',
    },
    {
      sector: 'Aviation & Logistics',
      entry: '550k – 850k RWF',
      mid: '1.0M – 1.8M RWF',
      senior: '2.0M – 3.5M RWF',
      notes: 'Competitive compensation packages at RwandAir and DP World Logistics Kigali.',
    },
    {
      sector: 'Public Sector & Parastatals',
      entry: '450k – 750k RWF',
      mid: '900k – 1.6M RWF',
      senior: '1.8M – 3.0M RWF',
      notes: 'Structured civil service and statutory board salary grid (e.g., RSSB, Ministries).',
    },
    {
      sector: 'Banking & SACCO Microfinance',
      entry: '350k – 600k RWF',
      mid: '700k – 1.3M RWF',
      senior: '1.5M – 2.5M RWF',
      notes: 'Community financial institutions like RATWA SACCO across Kigali, Huye, and provinces.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9e7940]">
          Rwanda Career Accelerator
        </span>
        <h1 className="font-display text-3xl font-bold text-[#173b2d] mt-1">
          {t.toolsTab}
        </h1>
        <p className="text-xs sm:text-sm text-[#596b5e] mt-1">
          Practical tools and market benchmarks designed specifically for job seekers in Rwanda.
        </p>
      </div>

      {/* Tool 1: Cover Letter Launcher */}
      <div className="bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl p-4 sm:p-7 shadow-xs">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#efbd43] text-[#173b2d] flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-[#173b2d]">
                {t.coverLetterBuilder}
              </h3>
              <span className="text-[10px] font-black uppercase bg-[#174332] text-[#efbd43] px-2 py-0.5 rounded-full">
                Interactive AI
              </span>
            </div>
            <p className="text-xs text-[#596b5e] mt-0.5">
              Live AI interviewer: analyzes the vacancy requirements, asks you targeted questions about your achievements, location, and dates, and crafts a bespoke Rwandan standard cover letter.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e] mb-1.5">
              Select an open role from this snapshot:
            </label>
            <div className="flex items-center gap-2">
              <CompanyLogo company={selectedJob.company} size="sm" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full text-xs font-semibold p-3 bg-white border border-[#d9ded4] rounded-xl text-[#173b2d] focus:ring-2 focus:ring-[#174332]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title} ({j.location || 'Rwanda'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-4 flex items-end">
            <button
              type="button"
              onClick={() => onOpenCoverLetterBuilder(selectedJob)}
              className="w-full bg-[#174332] hover:bg-[#102e24] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#efbd43]" />
              <span>{t.generateLetter}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tool 2: Rwandan Salary Benchmarks */}
      <div className="bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl p-4 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#e9eee4] text-[#174332] flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#173b2d]">
              Rwanda Salary Guide (RWF Benchmarks)
            </h3>
            <p className="text-xs text-[#596b5e] mt-0.5">
              Approximate monthly gross salary brackets based on 2026 Rwandan employer compensation data.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e4e5d9] text-[10px] uppercase font-bold text-[#596b5e]">
                <th className="py-2.5 pr-3">Sector</th>
                <th className="py-2.5 px-3">Entry-Level</th>
                <th className="py-2.5 px-3">Mid-Level</th>
                <th className="py-2.5 px-3">Senior / Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0e9]">
              {salaryBands.map((band) => (
                <tr key={band.sector} className="hover:bg-[#f9fbf8]">
                  <td className="py-3 pr-3 font-bold text-[#173b2d]">
                    {band.sector}
                    <span className="block text-[11px] font-normal text-[#596b5e] mt-0.5">
                      {band.notes}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#596b5e] whitespace-nowrap">
                    {band.entry}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#174332] whitespace-nowrap">
                    {band.mid}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#174332] whitespace-nowrap">
                    {band.senior}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tool 3: Rwandan Job Application Checklist */}
      <div className="bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl p-4 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#fff7dc] text-[#714f15] flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#173b2d]">
              Rwandan Job Application Checklist
            </h3>
            <p className="text-xs text-[#596b5e] mt-0.5">
              Essential documents and compliance items frequently required by Rwandan HR departments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-[#f8f9f5] rounded-2xl border border-[#e4e5d9] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#173b2d]">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Academic Degrees & Equivalence</span>
            </div>
            <p className="text-xs text-[#596b5e] leading-relaxed">
              Have certified copies ready. If your degree was obtained abroad, ensure your HEC (Higher Education Council) equivalence letter is obtained.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9f5] rounded-2xl border border-[#e4e5d9] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#173b2d]">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Judicial Record (Icyangombwa cy'uko utafunzwe)</span>
            </div>
            <p className="text-xs text-[#596b5e] leading-relaxed">
              Available quickly via IremboGov portal. Public institutions and security roles require a record valid within 6 months.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9f5] rounded-2xl border border-[#e4e5d9] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#173b2d]">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Three Professional Referees</span>
            </div>
            <p className="text-xs text-[#596b5e] leading-relaxed">
              Include current direct supervisors with reachable phone numbers (+250) and institutional emails (required by One Acre Fund, FH, etc.).
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9f5] rounded-2xl border border-[#e4e5d9] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-[#173b2d]">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Language & Writing Standards</span>
            </div>
            <p className="text-xs text-[#596b5e] leading-relaxed">
              Ensure flawless English. For administrative and community-facing roles in Rwanda, demonstrated Kinyarwanda fluency is a decisive asset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
