import React, { useState } from 'react';
import { Job, ApplicationRecord, ApplicationStatus } from '../types';
import { Language, translations } from '../utils/translations';
import { formatDateLabel } from '../utils/dateUtils';
import { CompanyLogo } from './CompanyLogo';
import {
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface ApplicationTrackerProps {
  jobs: Job[];
  applications: Record<string, ApplicationRecord>;
  onOpenDetails: (job: Job) => void;
  onUpdateStatus: (jobId: string, status: ApplicationStatus, notes?: string) => void;
  onNavigateHome: () => void;
  lang: Language;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  jobs,
  applications,
  onOpenDetails,
  onUpdateStatus,
  onNavigateHome,
  lang,
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');

  const appliedJobs = Object.keys(applications)
    .map((id) => {
      const job = jobs.find((j) => j.id === id);
      const app = applications[id];
      return job && app ? { job, app } : null;
    })
    .filter((item): item is { job: Job; app: ApplicationRecord } => item !== null && item.app.status !== 'archived');

  const filtered = appliedJobs.filter((item) => {
    if (filter === 'all') return true;
    return item.app.status === filter;
  });

  const counts = {
    all: appliedJobs.length,
    applied: appliedJobs.filter((x) => x.app.status === 'applied').length,
    interviewing: appliedJobs.filter((x) => x.app.status === 'interviewing').length,
    offered: appliedJobs.filter((x) => x.app.status === 'offered').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9e7940]">
          Candidate Application Manager
        </span>
        <h1 className="font-display text-3xl font-bold text-[#173b2d] mt-1">
          {t.trackerTab}
        </h1>
        <p className="text-xs sm:text-sm text-[#596b5e] mt-1">
          Track your active applications, interview milestones, and official employer updates in one dashboard.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'all'
              ? 'bg-[#174332] text-white border-[#174332] shadow-sm'
              : 'bg-[#fffdf7] text-[#173b2d] border-[#e4e5d9] hover:bg-[#e9eee4]'
          }`}
        >
          <span className="block text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider opacity-80 truncate">
            Total Tracked
          </span>
          <span className="font-display text-xl sm:text-2xl font-bold mt-0.5 block">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setFilter('applied')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'applied'
              ? 'bg-[#174332] text-white border-[#174332] shadow-sm'
              : 'bg-[#fffdf7] text-[#173b2d] border-[#e4e5d9] hover:bg-[#e9eee4]'
          }`}
        >
          <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">
            Submitted
          </span>
          <span className="font-display text-2xl font-bold mt-0.5 block text-amber-500">
            {counts.applied}
          </span>
        </button>

        <button
          onClick={() => setFilter('interviewing')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filter === 'interviewing'
              ? 'bg-[#174332] text-white border-[#174332] shadow-sm'
              : 'bg-[#fffdf7] text-[#173b2d] border-[#e4e5d9] hover:bg-[#e9eee4]'
          }`}
        >
          <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">
            Interviewing
          </span>
          <span className="font-display text-2xl font-bold mt-0.5 block text-emerald-600">
            {counts.interviewing}
          </span>
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-[#cbd5c8] bg-[#fffdf7]/80">
          <div className="w-12 h-12 rounded-2xl bg-[#e8eee3] text-[#174332] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-[#efbd43]" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#173b2d]">
            {t.emptyAppliedTitle}
          </h3>
          <p className="text-xs text-[#596b5e] max-w-sm mx-auto mt-1 leading-relaxed">
            {t.emptyAppliedBody}
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-4 bg-[#174332] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#102e24] transition-colors inline-flex items-center gap-1.5"
          >
            <span>{t.exploreOpenings}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ job, app }) => (
            <div
              key={job.id}
              className="bg-[#fffdf7] border border-[#e4e5d9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <CompanyLogo company={job.company} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#596b5e] truncate">
                      {job.company}
                    </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      app.status === 'interviewing'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'offered'
                        ? 'bg-[#fff4d1] text-[#714f15]'
                        : 'bg-[#edf1e9] text-[#174332]'
                    }`}
                  >
                    {app.status === 'applied'
                      ? 'Applied'
                      : app.status === 'interviewing'
                      ? 'Interviewing'
                      : 'Offer Received'}
                  </span>
                </div>

                <h4
                  onClick={() => onOpenDetails(job)}
                  className="font-display text-lg font-bold text-[#173b2d] hover:text-[#1e5842] cursor-pointer"
                >
                  {job.title}
                </h4>

                {app.notes && (
                  <p className="text-xs text-[#596b5e] bg-[#f8f9f5] p-2 rounded-lg mt-2 border border-[#e4e5d9] italic">
                    "{app.notes}"
                  </p>
                )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#596b5e] mt-2">
                    <span>Location: {job.location || 'Rwanda'}</span>
                    <span>•</span>
                    <span>Deadline: {formatDateLabel(job.deadline)}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <select
                  value={app.status}
                  onChange={(e) =>
                    onUpdateStatus(job.id, e.target.value as ApplicationStatus, app.notes)
                  }
                  className="text-xs font-bold bg-[#e9eee4] text-[#174332] px-3 py-1.5 rounded-xl border border-[#d9ded4] focus:outline-none"
                >
                  <option value="applied">Status: Applied</option>
                  <option value="interviewing">Status: Interviewing</option>
                  <option value="offered">Status: Offer</option>
                  <option value="archived">Remove</option>
                </select>

                <button
                  type="button"
                  onClick={() => onOpenDetails(job)}
                  className="text-xs font-bold text-[#174332] hover:underline"
                >
                  View Job Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
