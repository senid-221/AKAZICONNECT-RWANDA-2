import React, { useState, useEffect } from 'react';
import { Job, CVDocument } from '../types';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import { CompanyLogo } from './CompanyLogo';
import {
  X,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCw,
} from 'lucide-react';
import { PaymentProviderLogo } from './PaymentProviderLogo';

interface ApplicationPaymentModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (applicationId: string, reference: string) => void;
}

export const ApplicationPaymentModal: React.FC<ApplicationPaymentModalProps> = ({
  job,
  isOpen,
  onClose,
  lang,
  onSuccess,
}) => {
  const { user, token, cvs, addCV } = useAuth();
  const [step, setStep] = useState<'quote' | 'paying' | 'confirming' | 'complete'>('quote');
  const [feeQuote, setFeeQuote] = useState<{
    feeFrw: number;
    category: string;
    salaryEst: string;
    currency: string;
    termsNoticeEn: string;
    termsNoticeRw: string;
  } | null>(null);

  const [provider, setProvider] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'CARD'>('MTN_MOMO');
  const [phone, setPhone] = useState(user?.profile?.phone || '0788123456');
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [coverLetterNotes, setCoverLetterNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch verified server-side fee quote
  useEffect(() => {
    if (job && isOpen) {
      setStep('quote');
      setError(null);
      setIsProcessing(true);

      fetch(`/api/pricing/calculate-fee?jobId=${job.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.feeFrw !== undefined) {
            setFeeQuote({
              feeFrw: data.feeFrw,
              category: data.category,
              salaryEst: data.salaryEst,
              currency: data.currency || 'FRW',
              termsNoticeEn: data.termsNoticeEn,
              termsNoticeRw: data.termsNoticeRw,
            });
          }
        })
        .catch((err) => {
          console.error('Failed to calculate fee', err);
          setError('Unable to calculate fee quote. Please check connection.');
        })
        .finally(() => setIsProcessing(false));
    }
  }, [job, isOpen]);

  // Set default CV if available
  useEffect(() => {
    if (cvs && cvs.length > 0 && !selectedCvId) {
      const defaultCv = cvs.find((c) => c.isDefault) || cvs[0];
      setSelectedCvId(defaultCv.id);
    }
  }, [cvs, selectedCvId]);

  if (!isOpen || !job) return null;

  const handleInitiatePayment = async () => {
    if (!token) {
      setError('Please sign in or create an account to submit your application.');
      return;
    }
    if (!selectedCvId) {
      setError('Please select or upload a CV document for this application.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStep('paying');

    try {
      const res = await fetch('/api/applications/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: job.id,
          provider,
          providerPhone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment.');
      }

      setTransactionRef(data.transactionRef);

      // Simulate provider confirmation flow (USSD prompt on phone / Card gateway authorization)
      setTimeout(async () => {
        try {
          const confirmRes = await fetch('/api/applications/confirm-payment-and-apply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              transactionRef: data.transactionRef,
              cvId: selectedCvId,
              notes: coverLetterNotes,
            }),
          });

          const confirmData = await confirmRes.json();
          if (!confirmRes.ok) {
            throw new Error(confirmData.error || 'Payment confirmation failed.');
          }

          setStep('complete');
          onSuccess(confirmData.application.id, confirmData.application.referenceNumber);
        } catch (confirmErr: any) {
          setError(confirmErr.message || 'Payment confirmation failed.');
          setStep('quote');
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed.');
      setIsProcessing(false);
      setStep('quote');
    }
  };

  // Mock CV quick upload if user doesn't have one
  const handleQuickUploadCV = async () => {
    const defaultName = `${user?.profile?.name || 'Applicant'}_Resume_Rwanda_2026.pdf`;
    const newCv = await addCV({
      fileName: defaultName,
      fileType: 'application/pdf',
      fileSize: 340000,
      notes: 'Uploaded for verified vacancy application',
    });
    if (newCv) {
      setSelectedCvId(newCv.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#fffdf7] border border-[#d9ded4] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#fffdf7] border-b border-[#e9eee4]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#efbd43] bg-[#174332] px-2.5 py-0.5 rounded-full">
              Rwanda Official Portal
            </span>
            <span className="text-xs font-bold text-[#596b5e]">
              {lang === 'rw' ? 'Kwishura no Gusaba' : 'Fee & Application Submission'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#596b5e] hover:bg-[#e9eee4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target Job Info Card */}
          <div className="flex items-start gap-3.5 p-4 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl">
            <CompanyLogo company={job.company} size="md" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9e7940]">
                {job.company}
              </span>
              <h3 className="font-display text-base font-bold text-[#173b2d] leading-snug truncate">
                {job.title}
              </h3>
              <p className="text-xs text-[#596b5e] mt-0.5">
                {job.location || 'Rwanda'} • {job.rwfSalaryEst || job.salaryLabel}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'quote' && (
            <>
              {/* Fee Calculation Breakdown */}
              <div className="p-5 bg-[#174332] text-white rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#efbd43]">
                    {lang === 'rw' ? 'Amafaranga yo Gusaba Akazi' : 'Required Application Processing Fee'}
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    Official Fee
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-3xl font-display font-black text-white">
                      {feeQuote ? feeQuote.feeFrw.toLocaleString() : '...'}
                    </span>
                    <span className="ml-1.5 text-sm font-bold text-[#efbd43]">FRW</span>
                  </div>
                  <span className="text-xs text-white/80 font-medium">
                    {feeQuote ? feeQuote.category : 'Entry / Standard level'}
                  </span>
                </div>

                <p className="text-[11px] text-white/80 leading-relaxed">
                  {lang === 'rw'
                    ? 'Aya mafaranga akoreshwa mu gutunganya dosiye yawe, kuyigenzura no kuyiha umukoresha ku buryo bwizewe.'
                    : 'Salary-tiered application fee guarantees priority employer routing, anti-spam validation, and official application verification.'}
                </p>
              </div>

              {/* CV Document Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#173b2d] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#174332]" />
                    <span>{lang === 'rw' ? 'Hitamo Umwirondoro (CV) woherezwa' : 'Select Attached CV Document'} *</span>
                  </label>
                  {cvs.length === 0 && (
                    <button
                      type="button"
                      onClick={handleQuickUploadCV}
                      className="text-xs text-[#174332] font-bold underline"
                    >
                      + Quick Attach Default CV
                    </button>
                  )}
                </div>

                {cvs.length > 0 ? (
                  <select
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                  >
                    {cvs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fileName} {c.isDefault ? '(Default)' : ''} - {(c.fileSize / 1024).toFixed(0)} KB
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span>No CV uploaded yet.</span>
                    <button
                      type="button"
                      onClick={handleQuickUploadCV}
                      className="px-3 py-1 bg-[#174332] text-white rounded-lg font-bold text-xs"
                    >
                      Attach Verified Resume
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Letter Notes */}
              <div>
                <label className="block text-xs font-bold text-[#173b2d] mb-1">
                  {lang === 'rw' ? 'Ubutumwa buherekeza dosiye (Cover Note)' : 'Candidate Statement or Cover Note (Optional)'}
                </label>
                <textarea
                  value={coverLetterNotes}
                  onChange={(e) => setCoverLetterNotes(e.target.value)}
                  placeholder="Summarize your key qualification or motivation for this Rwandan vacancy..."
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                />
              </div>

              {/* Rwandan Payment Methods */}
              {/* Rwandan Payment Methods */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#173b2d]">
                    {lang === 'rw' ? 'Uburyo bwo Kwishyura mu Rwanda' : 'Authorized Rwandan Payment Methods'}
                  </span>
                  <span className="text-[10px] text-[#596b5e] font-semibold">
                    Instant Automated Settlement
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* MTN Mobile Money */}
                  <button
                    type="button"
                    onClick={() => setProvider('MTN_MOMO')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      provider === 'MTN_MOMO'
                        ? 'border-[#efbd43] bg-[#fff9ea] ring-2 ring-[#efbd43] shadow-xs'
                        : 'border-[#e4e5d9] bg-white hover:bg-[#f8f9f5]'
                    }`}
                  >
                    <PaymentProviderLogo provider="MTN_MOMO" size="sm" />
                    <span className="text-[11px] font-black text-[#173b2d]">MTN MoMo</span>
                  </button>

                  {/* Airtel Money */}
                  <button
                    type="button"
                    onClick={() => setProvider('AIRTEL_MONEY')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      provider === 'AIRTEL_MONEY'
                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500 shadow-xs'
                        : 'border-[#e4e5d9] bg-white hover:bg-[#f8f9f5]'
                    }`}
                  >
                    <PaymentProviderLogo provider="AIRTEL_MONEY" size="sm" />
                    <span className="text-[11px] font-black text-[#173b2d]">Airtel Money</span>
                  </button>

                  {/* Bank of Kigali */}
                  <button
                    type="button"
                    onClick={() => setProvider('BANK_TRANSFER')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      provider === 'BANK_TRANSFER'
                        ? 'border-[#174332] bg-[#eef3eb] ring-2 ring-[#174332] shadow-xs'
                        : 'border-[#e4e5d9] bg-white hover:bg-[#f8f9f5]'
                    }`}
                  >
                    <PaymentProviderLogo provider="BANK_TRANSFER" size="sm" />
                    <span className="text-[11px] font-black text-[#173b2d]">BK Rwanda</span>
                  </button>

                  {/* Visa & Mastercard */}
                  <button
                    type="button"
                    onClick={() => setProvider('CARD')}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      provider === 'CARD'
                        ? 'border-[#174332] bg-[#eef3eb] ring-2 ring-[#174332] shadow-xs'
                        : 'border-[#e4e5d9] bg-white hover:bg-[#f8f9f5]'
                    }`}
                  >
                    <PaymentProviderLogo provider="CARD" size="sm" />
                    <span className="text-[11px] font-black text-[#173b2d]">Visa / Master</span>
                  </button>
                </div>

                {/* Provider specific inputs & instructions */}
                {(provider === 'MTN_MOMO' || provider === 'AIRTEL_MONEY') && (
                  <div className="p-3 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <PaymentProviderLogo provider={provider} size="xs" />
                      <label className="text-[11px] font-bold text-[#173b2d]">
                        {provider === 'MTN_MOMO'
                          ? 'MTN Mobile Money Rwanda Telephone'
                          : 'Airtel Money Rwanda Telephone'}
                      </label>
                    </div>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-[#799083]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0788 123 456"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] font-semibold focus:outline-none focus:ring-2 focus:ring-[#174332]"
                      />
                    </div>
                    <p className="text-[10px] text-[#596b5e]">
                      {provider === 'MTN_MOMO'
                        ? '📲 A push prompt (*182#) will appear on your phone to authorize the fee.'
                        : '📲 An Airtel Money prompt will appear on your phone to confirm payment.'}
                    </p>
                  </div>
                )}

                {provider === 'BANK_TRANSFER' && (
                  <div className="p-3 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <PaymentProviderLogo provider="BANK_TRANSFER" size="xs" />
                      <span className="font-bold text-[#173b2d]">Bank of Kigali Direct</span>
                    </div>
                    <p className="text-[11px] text-[#596b5e]">
                      Instant account debit via BK App / PayPack Rwanda. Your application is locked and activated immediately upon confirmation.
                    </p>
                  </div>
                )}

                {provider === 'CARD' && (
                  <div className="p-3 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <PaymentProviderLogo provider="CARD" size="xs" />
                      <span className="font-bold text-[#173b2d]">International & Local Cards</span>
                    </div>
                    <p className="text-[11px] text-[#596b5e]">
                      Secured by 256-bit 3D Secure. Visa, Mastercard, and Rwandan debit cards accepted.
                    </p>
                  </div>
                )}
              </div>

              {/* Pay & Apply Submit Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleInitiatePayment}
                className="w-full py-3.5 px-4 bg-[#174332] hover:bg-[#102e24] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#efbd43]" />
                <span>
                  {lang === 'rw'
                    ? `Kwishura ${feeQuote?.feeFrw.toLocaleString() || '...'} FRW & Kohereza Dosiye`
                    : `Pay ${feeQuote?.feeFrw.toLocaleString() || '...'} FRW & Submit Application`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'paying' && (
            <div className="py-10 text-center space-y-4">
              <div className="flex justify-center mb-2">
                <PaymentProviderLogo provider={provider} size="lg" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#fff4d1] text-[#936d15] flex items-center justify-center mx-auto shadow-sm">
                <RotateCw className="w-7 h-7 animate-spin text-[#174332]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#173b2d]">
                {lang === 'rw' ? 'Gutunganya ubwishyu...' : 'Authorizing Secure Payment...'}
              </h3>
              <p className="text-xs text-[#596b5e] max-w-sm mx-auto leading-relaxed">
                Contacting official {provider.replace('_', ' ')} gateway in Rwanda. Please approve the USSD prompt on your phone or confirm authorization.
              </p>
              {transactionRef && (
                <div className="p-2.5 bg-[#eef3eb] rounded-xl inline-block text-xs font-mono font-bold text-[#174332]">
                  Ref: {transactionRef}
                </div>
              )}
            </div>
          )}

          {step === 'complete' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#174332] text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-[#efbd43]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#173b2d]">
                {lang === 'rw' ? 'Ubusabe bwakiriwe neza!' : 'Application Successfully Submitted!'}
              </h3>
              <p className="text-xs text-[#596b5e] max-w-md mx-auto leading-relaxed">
                Your payment was confirmed and your application profile has been transmitted to {job.company}. You can monitor progress and download your payment receipt in your dashboard.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#174332] text-white text-xs font-bold rounded-xl hover:bg-[#102e24] transition-colors"
              >
                View in My Applications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
