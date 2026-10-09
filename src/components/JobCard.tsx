import React from 'react';
import { Job, ApplicationRecord } from '../types';
import { formatDateLabel, isRoleOpen, getClosingBadge } from '../utils/dateUtils';
import { Language, translations } from '../utils/translations';
import { CompanyLogo } from './CompanyLogo';
import {
  Bookmark,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Building,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  application?: ApplicationRecord;
  onToggleSave: (jobId: string) => void;
  onOpenDetails: (job: Job) => void;
  onOpenCoverLetter?: (job: Job) => void;
  lang: Language;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  application,
  onToggleSave,
  onOpenDetails,
  onOpenCoverLetter,
  lang,
}) => {
  const t = translations[lang];
  const open = isRoleOpen(job);
  const closingBadge = getClosingBadge(job, lang);

  return (
    <article
      onClick={() => onOpenDetails(job)}
      className="group relative bg-[#fffdf7] border border-[#e4e5d9] rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#cbd7c9] cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Official Company Logo, Company Name, Title, Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Real Official Company Logo */}
            <CompanyLogo company={job.company} size="md" />

            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-[#596b5e] truncate mb-0.5">
                {job.company}
              </span>
              <h3 className="font-display text-[16px] sm:text-[18px] font-bold text-[#173b2d] leading-snug group-hover:text-[#1e5842] transition-colors line-clamp-2">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job.id);
            }}
            title={isSaved ? 'Remove from bookmarks' : 'Bookmark this opening'}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark job'}
            className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
              isSaved
                ? 'bg-[#fff4d1] border-[#e7c45c] text-[#936d15]'
                : 'bg-[#fffdf7] border-[#e4e5d9] text-[#596b5e] hover:border-[#bdcabb] hover:text-[#174332]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Metadata badges row: Location, Engagement, Department, Salary */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-[#596b5e]">
          {job.location && (
            <span className="inline-flex items-center gap-1 font-medium whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-[#174332] shrink-0" />
              <span>{job.district || job.location}</span>
            </span>
          )}

          {job.engagement && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Briefcase className="w-3.5 h-3.5 text-[#416153] shrink-0" />
              <span>{job.engagement}</span>
            </span>
          )}

          {job.department && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[#416153]">
              <Building className="w-3.5 h-3.5 shrink-0 text-[#174332]" />
              <span>{job.department} dept</span>
            </span>
          )}

          {job.rwfSalaryEst && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#174332] bg-[#e9eee4] px-2 py-0.5 rounded-md whitespace-nowrap text-[11px]">
              <DollarSign className="w-3 h-3 text-[#174332] shrink-0" />
              <span>{job.rwfSalaryEst}</span>
            </span>
          )}
        </div>

        {/* Categories / Tags & Status row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {job.categories.map((c) => (
            <span
              key={c}
              className="text-[10px] sm:text-[11px] font-semibold text-[#416153] bg-[#edf1e9] px-2.5 py-1 rounded-lg"
            >
              {c}
            </span>
          ))}

          {application && (
            <span className="text-[10px] sm:text-[11px] font-bold text-[#8a422d] bg-[#fae5db] px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>
                {application.status === 'applied'
                  ? t.markApplied
                  : application.status.toUpperCase()}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Deadline, Tailor Cover Letter Button & Details */}
      <div className="mt-3.5 pt-3 border-t border-[#f0f0e9] space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-[#596b5e] shrink-0" />
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold leading-tight truncate ${closingBadge.textClass}`}>
              {closingBadge.label}
            </span>
          </div>

          <div className="flex items-center text-[#174332] font-bold text-xs gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>{lang === 'rw' ? 'Ibisobanuro' : 'Details'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Direct Action Bar: AI Tailor Cover Letter & Direct Apply */}
        <div className="flex items-center gap-2 pt-1">
          {onOpenCoverLetter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCoverLetter(job);
              }}
              className="flex-1 bg-[#e9eee4] hover:bg-[#dce5d6] text-[#174332] text-xs font-bold py-2 px-2.5 rounded-xl border border-[#cfe0cb] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#efbd43] shrink-0" />
              <span className="truncate">{lang === 'rw' ? 'Tegura Ibaruwa' : 'Tailor Cover Letter'}</span>
            </button>
          )}

          <a
            href={job.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#174332] hover:bg-[#102e24] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs shrink-0"
          >
            <span>{lang === 'rw' ? 'Saba' : 'Apply'}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>
    </article>
  );
};
