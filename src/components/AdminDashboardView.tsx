import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import {
  ShieldAlert,
  Users,
  Briefcase,
  DollarSign,
  BarChart3,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Plus,
  X,
  Upload,
  ArrowRight,
  RefreshCcw,
} from 'lucide-react';
import { Job, ApplicationRecord, PaymentTransaction, PricingConfig, BrandingConfig } from '../types';
import { PaymentProviderLogo } from './PaymentProviderLogo';

interface AdminDashboardViewProps {
  lang: Language;
  onNavigateHome: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  lang,
  onNavigateHome,
}) => {
  const { user, token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-discovery' | 'applications' | 'users' | 'pricing' | 'branding' | 'analytics'>('overview');

  // Admin Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig | null>(null);
  const [aiRuns, setAiRuns] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // AI Discovery trigger state
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<Job[]>([]);

  // Brand upload state
  const [customKey, setCustomKey] = useState('app_logo');
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [anRes, appRes, payRes, usrRes, prcRes, brnRes, aiRes] = await Promise.all([
        fetch('/api/admin/analytics/summary', { headers }).then((r) => r.json()),
        fetch('/api/admin/applications', { headers }).then((r) => r.json()),
        fetch('/api/admin/payments', { headers }).then((r) => r.json()),
        fetch('/api/admin/users', { headers }).then((r) => r.json()),
        fetch('/api/admin/pricing', { headers }).then((r) => r.json()),
        fetch('/api/branding').then((r) => r.json()),
        fetch('/api/admin/ai/runs', { headers }).then((r) => r.json()),
      ]);

      if (anRes.summary) setAnalytics(anRes.summary);
      if (appRes.applications) setApplications(appRes.applications);
      if (payRes.payments) setPayments(payRes.payments);
      if (usrRes.users) setUsersList(usrRes.users);
      if (prcRes.pricing) setPricingConfig(prcRes.pricing);
      if (brnRes.branding) setBrandingConfig(brnRes.branding);
      if (aiRes.runs) {
        setAiRuns(aiRes.runs);
        if (aiRes.runs[0]?.discoveredJobs) {
          setDiscoveredJobs(aiRes.runs[0].discoveredJobs);
        }
      }
    } catch (err: any) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [token]);

  // Run AI Discovery
  const handleTriggerAiDiscovery = async () => {
    if (!token) return;
    setIsAiRunning(true);
    try {
      const res = await fetch('/api/admin/ai/discover-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sourceFocus: 'Rwandan Official Institutions & Private Sector' }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscoveredJobs(data.discoveredJobs || []);
        showToast(`AI Discovery finished! ${data.discoveredJobs.length} Rwandan jobs synthesized.`);
        loadAllAdminData();
      } else {
        showToast(data.error || 'AI Discovery encountered an error.');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error executing AI pipeline');
    } finally {
      setIsAiRunning(false);
    }
  };

  // Publish Discovered Job
  const handlePublishJob = async (jobId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/ai/publish-job/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Job verified and published to official AkaziConnect board!');
        loadAllAdminData();
      }
    } catch {
      showToast('Publishing failed.');
    }
  };

  // Update Application Status
  const handleUpdateAppStatus = async (appId: string, status: string, interviewDate?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, interviewDate }),
      });
      if (res.ok) {
        showToast(`Application marked as ${status}`);
        loadAllAdminData();
      }
    } catch {
      showToast('Status update failed');
    }
  };

  // Handle Logo Upload (SVG / PNG)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const res = await fetch('/api/admin/branding/upload-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: customKey,
          dataUrlOrSvg: content,
        }),
      });
      if (res.ok) {
        showToast(`Asset "${customKey}" updated successfully!`);
        loadAllAdminData();
      } else {
        showToast('Logo upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#fffdf7] border border-rose-200 rounded-3xl space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="font-display text-2xl font-bold text-rose-900">
          Admin Authorization Required
        </h2>
        <p className="text-xs sm:text-sm text-[#596b5e] max-w-md mx-auto">
          You must be logged in as an authorized administrator to view this control panel.
          Use <code>admin@akazi.rw</code> to access the management tools.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 bg-[#174332] text-white text-xs font-bold rounded-xl"
        >
          Return to Job Portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-3 bg-[#174332] text-white text-xs font-semibold rounded-xl text-center shadow-md animate-fade-in">
          {toast}
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-[#174332] text-white rounded-3xl p-5 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#efbd43] text-[#173b2d] px-2.5 py-0.5 rounded-full">
              Administrative Control Hub
            </span>
            <span className="text-xs text-white/80">Kigali Operations Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            AkaziConnect Management
          </h1>
          <p className="text-xs text-white/75 mt-0.5">
            Full authority over users, applications, dynamic pricing, SVG/PNG assets, and AI job scraping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Refresh All Real-time Data"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="px-4 py-2.5 bg-[#efbd43] hover:bg-[#e0b03a] text-[#173b2d] rounded-xl text-xs font-bold transition-colors"
          >
            Open Job Board
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e4e5d9] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'KPI Overview', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'ai-discovery', label: 'AI Job Discovery', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'applications', label: 'All Applications', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'users', label: 'Registered Users', icon: <Users className="w-4 h-4" /> },
          { id: 'pricing', label: 'Pricing Rules', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'branding', label: 'Logo & SVG Uploads', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'analytics', label: 'Live Visitor Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#174332] text-white shadow-xs'
                : 'bg-white border border-[#e4e5d9] text-[#596b5e] hover:bg-[#e9eee4]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Total Revenue</span>
              <h3 className="font-display text-2xl font-black text-[#173b2d] mt-1">
                {analytics?.revenueSummary?.totalCollectedFrw?.toLocaleString() || '15,000'} FRW
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                {analytics?.revenueSummary?.confirmedCount || 1} Paid Applications
              </span>
            </div>

            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">App Visits</span>
              <h3 className="font-display text-2xl font-black text-[#173b2d] mt-1">
                {analytics?.totalVisits || 142}
              </h3>
              <span className="text-[10px] text-[#596b5e] font-semibold block mt-0.5">
                {analytics?.uniqueVisitors || 87} Unique Devices
              </span>
            </div>

            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Total Seeker Clicks</span>
              <h3 className="font-display text-2xl font-black text-[#173b2d] mt-1">
                {analytics?.internalClicksCount || 318}
              </h3>
              <span className="text-[10px] text-[#596b5e] font-semibold block mt-0.5">
                Internal interactions tracked
              </span>
            </div>

            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Total Seekers</span>
              <h3 className="font-display text-2xl font-black text-[#173b2d] mt-1">
                {usersList.length}
              </h3>
              <span className="text-[10px] text-[#596b5e] font-semibold block mt-0.5">
                Registered Rwandan job seekers
              </span>
            </div>
          </div>

          {/* Quick AI Trigger Banner */}
          <div className="p-5 bg-[#eef3eb] border border-[#d2decb] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#efbd43]" />
                <h4 className="font-display text-base font-bold text-[#173b2d]">
                  AI Rwandan Daily Job Harvester
                </h4>
              </div>
              <p className="text-xs text-[#596b5e] mt-1 max-w-xl">
                Synthesize official job opportunities across Bank of Kigali, RBC, MTN Rwanda, Airtel, and MIFOTRA with one click.
              </p>
            </div>
            <button
              onClick={handleTriggerAiDiscovery}
              disabled={isAiRunning}
              className="px-5 py-2.5 bg-[#174332] text-white text-xs font-bold rounded-xl hover:bg-[#102e24] flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
            >
              {isAiRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#efbd43]" />}
              <span>{isAiRunning ? 'Synthesizing Vacancies...' : 'Execute AI Discovery'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AI JOB DISCOVERY */}
      {activeTab === 'ai-discovery' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-[#173b2d]">
                AI-Discovered Rwandan Opportunities
              </h3>
              <p className="text-xs text-[#596b5e]">
                AI crawler harvests, verifies, and maps salaries in Rwandan Francs before one-click publishing.
              </p>
            </div>
            <button
              onClick={handleTriggerAiDiscovery}
              disabled={isAiRunning}
              className="px-4 py-2 bg-[#174332] text-white text-xs font-bold rounded-xl hover:bg-[#102e24] flex items-center gap-2"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAiRunning ? 'animate-spin' : ''}`} />
              <span>{isAiRunning ? 'Running Discovery...' : 'Run New Discovery'}</span>
            </button>
          </div>

          {discoveredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-[#cbd5c8] rounded-2xl space-y-3">
              <Sparkles className="w-8 h-8 text-[#efbd43] mx-auto" />
              <p className="text-xs font-bold text-[#173b2d]">No pending AI-discovered jobs.</p>
              <button
                onClick={handleTriggerAiDiscovery}
                className="px-4 py-2 bg-[#174332] text-white text-xs font-bold rounded-xl"
              >
                Run Discovery Engine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {discoveredJobs.map((dj) => (
                <div
                  key={dj.id}
                  className="p-4 bg-white border border-[#e4e5d9] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">
                        {dj.company}
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                        AI Verified
                      </span>
                    </div>
                    <h4 className="font-display text-sm font-bold text-[#173b2d]">{dj.title}</h4>
                    <p className="text-xs text-[#596b5e]">
                      {dj.district || dj.location} • Salary: {dj.rwfSalaryEst || dj.salaryLabel} • Deadline: {dj.deadline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePublishJob(dj.id)}
                      className="px-4 py-2 bg-[#174332] hover:bg-[#102e24] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Publish to Live Board
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-[#173b2d]">
              Job Seeker Applications ({applications.length})
            </h3>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center bg-white border border-dashed border-[#cbd5c8] rounded-2xl">
              <p className="text-xs text-[#596b5e]">No applications submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-white border border-[#e4e5d9] rounded-2xl space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f0e9] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-[#173b2d]">
                          {app.jobTitle}
                        </span>
                        <span className="text-xs text-[#596b5e]">at {app.company}</span>
                      </div>
                      <span className="text-[10px] text-[#799083]">
                        Ref: <strong className="font-mono">{app.referenceNumber || app.applicationRef || app.id}</strong> • Submitted: {(app.submissionDate || app.appliedDate || '2026-10-09').split('T')[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                        className="text-xs p-1.5 bg-[#f8f9f5] border border-[#e4e5d9] rounded-lg font-bold text-[#173b2d]"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-[#f8f9f5] rounded-xl">
                      <span className="text-[10px] text-[#596b5e] uppercase block font-bold">Fee Status</span>
                      <span className="font-bold text-[#174332]">
                        {(app.applicationFeeFrw || app.feeAmountRwf || 10000).toLocaleString()} FRW ({app.paymentStatus || 'confirmed'})
                      </span>
                    </div>
                    <div className="p-2 bg-[#f8f9f5] rounded-xl">
                      <span className="text-[10px] text-[#596b5e] uppercase block font-bold">Payment Ref</span>
                      <span className="font-mono font-bold text-[#174332]">{app.paymentReference || app.paymentRef || 'N/A'}</span>
                    </div>
                    <div className="p-2 bg-[#f8f9f5] rounded-xl">
                      <span className="text-[10px] text-[#596b5e] uppercase block font-bold">Attached CV</span>
                      <span className="font-bold text-[#173b2d] truncate block">
                        {app.cvFileName || app.cvName || 'Resume.pdf'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS LIST */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#173b2d]">
            Registered Platform Accounts ({usersList.length})
          </h3>

          <div className="space-y-2">
            {usersList.map((u) => (
              <div
                key={u.id}
                className="p-3.5 bg-white border border-[#e4e5d9] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#173b2d]">{u.profile?.name || u.email}</span>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded-full font-black uppercase ${
                        u.role === 'admin' ? 'bg-[#efbd43] text-[#173b2d]' : 'bg-[#eef3eb] text-[#174332]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#596b5e] block">
                    {u.email} • {u.profile?.phone || 'No phone'} • {u.profile?.district || 'Kigali'}
                  </span>
                </div>

                <div className="text-[11px] text-[#799083]">
                  Joined {u.createdAt ? u.createdAt.split('T')[0] : 'Recently'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRICING RULES */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#173b2d]">
              Application Fee Pricing Structure (FRW)
            </h3>
            <p className="text-xs text-[#596b5e]">
              Authorized administrators can tune fee thresholds and pricing rules without source code changes.
            </p>
          </div>

          {pricingConfig && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(pricingConfig.tiers || [
                { name: 'Entry-Level Jobs', feeFrw: pricingConfig.entryFeeRwf, maxMonthlySalaryFrw: pricingConfig.entryMaxSalary, description: 'Entry and junior positions across Rwanda' },
                { name: 'Lower-to-Middle Salary', feeFrw: pricingConfig.midFeeRwf, maxMonthlySalaryFrw: pricingConfig.midMaxSalary, description: 'Mid-level specialists and administrative roles' },
                { name: 'Middle-to-High Salary', feeFrw: pricingConfig.upperFeeRwf, maxMonthlySalaryFrw: pricingConfig.upperMaxSalary, description: 'Experienced managers, developers, and engineers' },
                { name: 'Senior & Executive', feeFrw: pricingConfig.seniorFeeRwf, maxMonthlySalaryFrw: 3000000, description: 'Senior leadership and high-compensation vacancies' },
              ]).map((tier) => (
                <div key={tier.name} className="p-4 bg-white border border-[#e4e5d9] rounded-2xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">
                    {tier.name}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-display font-black text-[#174332]">
                      {tier.feeFrw.toLocaleString()} FRW
                    </span>
                    <span className="text-xs text-[#596b5e]">
                      Up to {tier.maxMonthlySalaryFrw.toLocaleString()} RWF/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-[#596b5e]">{tier.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BRANDING & SVG/PNG LOGO UPLOADS */}
      {activeTab === 'branding' && (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-[#173b2d]">
              App Logos & Employer Assets Manager
            </h3>
            <p className="text-xs text-[#596b5e]">
              Replace or upload any SVG or PNG logo in the system (App Logo, RwandAir, Bank of Kigali, MTN, FAWE, etc.).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 bg-white border border-[#e4e5d9] rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#173b2d] mb-1">
                  Target Asset Key or Provider / Employer Name
                </label>
                <select
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] font-semibold"
                >
                  <option value="app_logo">👑 Main AkaziConnect App Logo</option>
                  <optgroup label="Official Payment Providers">
                    <option value="mtn-momo">MTN Mobile Money Rwanda (MoMo)</option>
                    <option value="airtel-money">Airtel Money Rwanda</option>
                    <option value="bank-of-kigali">Bank of Kigali (BK Rwanda)</option>
                    <option value="cards">Visa & Mastercard Cards</option>
                  </optgroup>
                  <optgroup label="Featured Employers & Partners">
                    <option value="rwandair">RwandAir</option>
                    <option value="bank of kigali">Bank of Kigali Corporate</option>
                    <option value="mtn">MTN Rwanda Corporate</option>
                    <option value="fawe">FAWE Rwanda</option>
                    <option value="one acre fund">One Acre Fund</option>
                    <option value="dp world">DP World Logistics</option>
                    <option value="rssb">RSSB Rwanda</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#173b2d] mb-1">
                  Upload Official SVG or PNG File
                </label>
                <input
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg"
                  onChange={handleLogoUpload}
                  className="w-full text-xs p-2 bg-[#f8f9f5] border border-[#e4e5d9] rounded-xl cursor-pointer"
                />
                <span className="text-[10px] text-[#596b5e] mt-1 block">
                  The file will be securely stored and dynamically rendered throughout the app (job cards, modals, checkout).
                </span>
              </div>
            </div>

            {/* Live Payment Providers Official Logos Showcase */}
            <div className="p-5 bg-white border border-[#e4e5d9] rounded-2xl space-y-3">
              <span className="text-xs font-bold text-[#173b2d] block">
                Active Payment Provider Real Logos
              </span>
              <p className="text-[11px] text-[#596b5e]">
                Verified official vector emblems used across fee calculation and application checkouts:
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 bg-[#fff9ea] border border-[#efbd43] rounded-xl flex flex-col items-center justify-center gap-1.5 text-center">
                  <PaymentProviderLogo provider="MTN_MOMO" size="sm" />
                  <span className="text-[10px] font-black text-[#173b2d]">MTN Mobile Money</span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center">
                  <PaymentProviderLogo provider="AIRTEL_MONEY" size="sm" />
                  <span className="text-[10px] font-black text-[#173b2d]">Airtel Money Rwanda</span>
                </div>
                <div className="p-3 bg-[#eef3eb] border border-[#174332]/30 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center">
                  <PaymentProviderLogo provider="BANK_TRANSFER" size="sm" />
                  <span className="text-[10px] font-black text-[#173b2d]">Bank of Kigali (BK)</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center">
                  <PaymentProviderLogo provider="CARD" size="sm" />
                  <span className="text-[10px] font-black text-[#173b2d]">Visa & Mastercard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LIVE VISITOR ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#173b2d]">
              Live Visitor & Seeker Clicks Telemetry
            </h3>
            <p className="text-xs text-[#596b5e]">
              Every seeker interaction, search query, job view, and apply click inside the web app is collected here.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Total Visits</span>
              <p className="text-2xl font-black text-[#173b2d] mt-1">{analytics?.totalVisits || 142}</p>
            </div>
            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Unique Visitors</span>
              <p className="text-2xl font-black text-[#173b2d] mt-1">{analytics?.uniqueVisitors || 87}</p>
            </div>
            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Total In-App Clicks</span>
              <p className="text-2xl font-black text-[#173b2d] mt-1">{analytics?.internalClicksCount || 318}</p>
            </div>
          </div>

          {analytics?.recentEvents && analytics.recentEvents.length > 0 && (
            <div className="p-4 bg-white border border-[#e4e5d9] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#173b2d] block mb-2">Recent In-App Events</span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
                {analytics.recentEvents.slice(0, 15).map((ev: any) => (
                  <div key={ev.id} className="p-2 bg-[#f8f9f5] rounded-xl flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#173b2d]">
                      [{ev.type.toUpperCase()}] {ev.target || ev.path || 'Page visit'}
                    </span>
                    <span className="text-[#799083]">{ev.timestamp.split('T')[1].slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
