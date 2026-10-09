import React from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Language } from '../utils/translations';
import { CHECKED_DATE, formatDateLabel } from '../utils/dateUtils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg bg-[#fffdf7] border border-[#d9ded4] rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#174332] text-[#efbd43] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#efbd43] bg-[#174332] px-2 py-0.5 rounded-sm">
                Safety & Verification
              </span>
              <h3 className="font-display text-xl font-bold text-[#173b2d] mt-1">
                Verified Sourced Snapshot
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#e4e5d9] bg-white flex items-center justify-center text-[#596b5e] hover:text-[#174332]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-[#173b2d] leading-relaxed">
          <div className="p-3.5 bg-[#e9eee4] rounded-2xl border border-[#d9ded4] space-y-1">
            <span className="font-bold block text-[#174332]">
              Audit Check Date: {formatDateLabel(CHECKED_DATE)}
            </span>
            <p className="text-[#596b5e]">
              All 21 roles in this build have been verified against original public announcements in Rwanda (RwandAir, FAWE, One Acre Fund, U.S. Embassy, RSSB, LuNa Smelter, etc.).
            </p>
          </div>

          <div className="p-3.5 bg-[#fff7dc] rounded-2xl border border-[#fae09b] space-y-1 text-[#714f15]">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-[#efbd43]" />
              <span>Job Seeker Protection</span>
            </div>
            <p>
              AkaziConnect will <strong>never request payment</strong> or mobile money (MoMo) transfers. Legitimate employers in Rwanda do not charge application fees.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-bold block text-[#596b5e] uppercase text-[11px] tracking-wider">
              Application Best Practices
            </span>
            <ul className="space-y-2 text-[#416153]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify deadlines and application instructions on the original employer link before submitting.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>For email applications, use the exact subject line specified by the hiring organization.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep your CV and degree certificates in clean PDF format under 2MB.</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#174332] hover:bg-[#102e24] text-white font-bold text-xs py-3 rounded-xl transition-colors"
        >
          Understood & Continue
        </button>
      </div>
    </div>
  );
};
