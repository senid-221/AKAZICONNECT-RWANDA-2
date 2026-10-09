import React, { useState } from 'react';
import { Job, ApplicationRecord, ApplicationStatus } from '../types';
import { formatDateLabel, isRoleOpen, getClosingBadge, CHECKED_DATE } from '../utils/dateUtils';
import { Language, translations } from '../utils/translations';
import { CompanyLogo } from './CompanyLogo';
import {
  X,
  ExternalLink,
  MapPin,
  Briefcase,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Share2,
  Bookmark,
  Building,
  Sparkles,
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  application?: ApplicationRecord;
  onUpdateApplication: (jobId: string, status: ApplicationStatus, notes?: string) => void;
  onOpenCoverLetterBuilder: (job: Job) => void;
  lang: Language;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  application,
  onUpdateApplication,
  onOpenCoverLetterBuilder,
  lang,
}) => {
  if (!isOpen || !job) return null;

  const t = translations[lang];
  const open = isRoleOpen(job);
  const closingBadge = getClosingBadge(job, lang);
  const [copiedShare, setCopiedShare] = useState(false);
  const [notes, setNotes] = useState(application?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const vanityUrl = `https://akaziconnect.com/apply/${job.slug}/`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this opening for ${job.title} at ${job.company} in Rwanda:`,
        url: vanityUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(vanityUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    onUpdateApplication(job.id, newStatus, notes);
  };

  const handleSaveNotes = () => {
    onUpdateApplication(job.id, application?.status || 'applied', notes);
    setIsEditingNotes(false);
  };

  const markColorMap: Record<string, string> = {
    'mark-teal': 'bg-[#cde4de] text-[#1c4d41]',
    'mark-gold': 'bg-[#fae7b8] text-[#714f15]',
    'mark-coral': 'bg-[#f7d8cb] text-[#84432f]',
    'mark-blue': 'bg-[#dbe4f4] text-[#344d70]',
    'mark-lime': 'bg-[#e2eecf] text-[#4d6325]',
    'mark-rose': 'bg-[#f4dde2] text-[#7a414f]',
  };
  const markClasses = markColorMap[job.markClass] || 'bg-[#d7e4d4] text-[#174332]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#fffdf7] border border-[#d9ded4] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 bg-[#fffdf7]/95 border-b border-[#e9eee4] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#efbd43] bg-[#174332] px-2.5 py-0.5 rounded-full">
              Rwanda Verified
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${closingBadge.textClass}`}>
              {closingBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share job link"
              className="w-9 h-9 rounded-xl border border-[#e4e5d9] bg-white flex items-center justify-center text-[#596b5e] hover:text-[#174332] hover:bg-[#f5f2e9] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleSave(job.id)}
              title={isSaved ? 'Remove bookmark' : 'Bookmark job'}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                isSaved
                  ? 'bg-[#fff4d1] border-[#e7c45c] text-[#936d15]'
                  : 'bg-white border-[#e4e5d9] text-[#596b5e] hover:bg-[#f8f1dd]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-xl border border-[#e4e5d9] bg-white flex items-center justify-center text-[#596b5e] hover:text-[#174332] hover:bg-[#f5f2e9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-5 sm:space-y-6">
          {copiedShare && (
            <div className="p-2.5 bg-[#174332] text-white text-xs font-semibold rounded-xl text-center">
              Link copied: {vanityUrl}
            </div>
          )}

          {/* Role Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            <CompanyLogo company={job.company} size="lg" />
            <div className="flex-1 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-[#596b5e] block truncate">
                {job.company}
              </span>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#173b2d] leading-tight mt-0.5">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 mt-2 text-xs text-[#596b5e]">
                {job.location && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#174332] shrink-0" />
                    <span>{job.location}</span>
                  </span>
                )}
                {job.engagement && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-[#174332]" />
                    {job.engagement}
                  </span>
                )}
                {job.department && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-[#174332]" />
                    {job.department} dept
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rwanda Compensation & Sector Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#e9eee4] rounded-2xl border border-[#d9ded4]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#596b5e]">
                {t.salaryEst}
              </span>
              <p className="text-sm font-bold text-[#174332] mt-0.5">
                {job.rwfSalaryEst || job.salaryLabel}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#596b5e]">
                Sector & Workplace
              </span>
              <p className="text-sm font-semibold text-[#173b2d] mt-0.5">
                {job.sector || 'Rwandan Enterprise'} • {job.workMode || 'On-site'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href={job.destinationUrl}
                target={job.destinationUrl.startsWith('mailto:') ? undefined : '_blank'}
                rel={job.destinationUrl.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                onClick={() => {
                  if (!application) {
                    onUpdateApplication(job.id, 'applied');
                  }
                }}
                className="flex-1 bg-[#174332] hover:bg-[#102e24] text-[#fffdf7] font-bold text-sm px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-sm text-center"
              >
                <span>{job.applyText || t.applyExternal}</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => onOpenCoverLetterBuilder(job)}
                className="flex-1 bg-[#efbd43] hover:bg-[#e0b03a] text-[#173b2d] font-bold text-sm px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-sm text-center"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-[#173b2d]" />
                <span>{lang === 'rw' ? 'Tegura Ibaruwa (AI)' : 'Tailor Cover Letter'}</span>
              </button>
            </div>
          </div>

          {/* Role Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#596b5e]">
              Role Summary
            </h3>
            <p className="text-sm text-[#173b2d] leading-relaxed">
              {job.summary}
            </p>
          </div>

          {/* Experience & Requirements */}
          {(job.experience || (job.requirements && job.requirements.length > 0) || job.requirementsNote) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#596b5e]">
                Requirements & Qualifications
              </h3>
              {job.experience && (
                <div className="p-3 bg-[#fff7dc] border border-[#fae09b] rounded-xl text-xs font-medium text-[#7a591a]">
                  <strong>Experience requirement:</strong> {job.experience}
                </div>
              )}
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-2 text-sm text-[#173b2d] pl-4 list-disc marker:text-[#174332]">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {req}
                    </li>
                  ))}
                </ul>
              ) : (
                job.requirementsNote && (
                  <p className="text-xs text-[#596b5e] italic">
                    {job.requirementsNote}
                  </p>
                )
              )}
            </div>
          )}

          {/* Key Competencies / Skills */}
          {job.keySkills && job.keySkills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#596b5e]">
                Target Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.keySkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-semibold px-2.5 py-1 bg-[#edf1e9] text-[#174332] rounded-lg border border-[#e4e5d9]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to Apply */}
          <div className="p-4 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#596b5e] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#efbd43]" />
              Submission Instructions
            </h3>
            <p className="text-xs sm:text-sm text-[#173b2d] leading-relaxed">
              {job.applyInstructions}
            </p>
          </div>

          {/* Dates & Source Audit */}
          <div className="border-t border-[#eceee5] pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#596b5e]">
              Official Timeline & Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-[#e9eee4] rounded-xl flex items-center justify-between sm:flex-col sm:items-start">
                <span className="text-[10px] text-[#596b5e] uppercase font-bold">Published</span>
                <span className="font-semibold text-[#173b2d] mt-0.5">{formatDateLabel(job.published)}</span>
              </div>
              <div className="p-3 bg-[#e9eee4] rounded-xl flex items-center justify-between sm:flex-col sm:items-start">
                <span className="text-[10px] text-[#596b5e] uppercase font-bold">Deadline</span>
                <span className="font-semibold text-[#173b2d] mt-0.5">{formatDateLabel(job.deadline)}</span>
              </div>
              <div className="p-3 bg-[#e9eee4] rounded-xl flex items-center justify-between sm:flex-col sm:items-start">
                <span className="text-[10px] text-[#596b5e] uppercase font-bold">Checked</span>
                <span className="font-semibold text-[#173b2d] mt-0.5">{formatDateLabel(CHECKED_DATE)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#174332] font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>{t.originalListing}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[#596b5e]">Akazi ID: {job.id}</span>
            </div>
          </div>

          {/* Local Application Tracker Controls */}
          <div className="p-4 bg-[#fff7dc] border border-[#fae09b] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#174332]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[#173b2d]">
                  My Local Application Tracker
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#7a591a]">
                Saved locally on this device
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#596b5e]">Current Status:</span>
              {(['applied', 'interviewing', 'offered'] as ApplicationStatus[]).map((st) => {
                const active = application?.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                      active
                        ? 'bg-[#174332] text-white shadow-xs'
                        : 'bg-white border border-[#e4e5d9] text-[#596b5e] hover:bg-[#e9eee4]'
                    }`}
                  >
                    {st === 'applied' ? 'Applied' : st === 'interviewing' ? 'Interview Scheduled' : 'Job Offered'}
                  </button>
                );
              })}
              {application && (
                <button
                  type="button"
                  onClick={() => onUpdateApplication(job.id, 'archived')}
                  className="text-xs text-rose-700 underline ml-auto"
                >
                  Remove tracker
                </button>
              )}
            </div>

            {application && (
              <div className="space-y-2 pt-2 border-t border-[#f0e4b8]">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add personal notes (e.g. submitted CV & diploma, HR contact, follow-up date)..."
                      className="w-full text-xs p-2.5 bg-white border border-[#e4e5d9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174332]"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(false)}
                        className="text-xs px-3 py-1 text-[#596b5e]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-xs px-3 py-1 bg-[#174332] text-white font-bold rounded-lg"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-[#596b5e]">
                    <span>{notes ? `Note: "${notes}"` : 'No personal notes added yet.'}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(true)}
                      className="font-bold text-[#174332] underline"
                    >
                      {notes ? 'Edit Note' : '+ Add Note'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
