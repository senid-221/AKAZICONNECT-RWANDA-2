import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import {
  User,
  ShieldCheck,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  Camera,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { ApplicationRecord, PaymentTransaction } from '../types';
import { PaymentProviderLogo } from './PaymentProviderLogo';

interface UserDashboardViewProps {
  lang: Language;
  onNavigateJobs: () => void;
  onOpenAuth: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  lang,
  onNavigateJobs,
  onOpenAuth,
}) => {
  const { user, profile, cvs, token, updateProfile, addCV, deleteCV, setDefaultCV, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'applications' | 'payments'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    headline: profile?.headline || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    district: profile?.district || 'Kigali (Gasabo)',
    location: profile?.location || 'Kigali, Rwanda',
    education: profile?.education || '',
    experienceYears: profile?.experienceYears || 0,
    skills: (profile?.skills || []).join(', '),
    bio: profile?.bio || '',
  });

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Sync form data with profile
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        headline: profile.headline || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        district: profile.district || 'Kigali (Gasabo)',
        location: profile.location || 'Kigali, Rwanda',
        education: profile.education || '',
        experienceYears: profile.experienceYears || 0,
        skills: (profile.skills || []).join(', '),
        bio: profile.bio || '',
      });
    }
  }, [profile, user]);

  // Load applications & payments from backend
  useEffect(() => {
    if (token) {
      setIsLoadingData(true);
      Promise.all([
        fetch('/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch('/api/applications/my-payments', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ])
        .then(([appRes, payRes]) => {
          if (appRes.applications) setApplications(appRes.applications);
          if (payRes.payments) setPayments(payRes.payments);
        })
        .catch((err) => console.error('Failed to load user records', err))
        .finally(() => setIsLoadingData(false));
    }
  }, [token]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ok = await updateProfile({
      name: formData.name,
      headline: formData.headline,
      phone: formData.phone,
      district: formData.district,
      location: formData.location,
      education: formData.education,
      experienceYears: Number(formData.experienceYears) || 0,
      skills: skillsArray,
      bio: formData.bio,
    });

    if (ok) {
      setIsEditing(false);
      showToast(lang === 'rw' ? 'Umwirondoro wavuguruwe neza' : 'Profile updated successfully!');
    } else {
      showToast('Failed to save profile changes.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Maximum CV file size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const newCv = await addCV({
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        fileDataUrl: dataUrl,
        notes: 'Uploaded document',
      });
      if (newCv) {
        showToast(lang === 'rw' ? 'CV yashyizweho neza' : 'CV uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateProfile({ avatarUrl: dataUrl });
      showToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  // Profile Completeness Calculation
  const profileCompleteness = () => {
    let score = 20;
    if (profile?.name) score += 15;
    if (profile?.phone) score += 15;
    if (profile?.headline) score += 10;
    if (profile?.education) score += 15;
    if (profile?.skills && profile.skills.length > 0) score += 15;
    if (cvs.length > 0) score += 10;
    return Math.min(score, 100);
  };

  if (!user) {
    return (
      <div className="p-8 sm:p-12 text-center bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#efbd43]/20 text-[#174332] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#173b2d]">
          Job Seeker Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-[#596b5e] max-w-md mx-auto">
          Sign in or register your AkaziConnect Rwanda account to access your official applications, CV manager, profile, and receipts.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-[#174332] text-white font-bold text-xs rounded-xl hover:bg-[#102e24] transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const completeness = profileCompleteness();

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-3 bg-[#174332] text-white text-xs font-semibold rounded-xl text-center shadow-md animate-fade-in">
          {toast}
        </div>
      )}

      {/* Top Banner & Quick Stats */}
      <div className="bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f0f0e9]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#efbd43] text-[#174332] font-display font-bold text-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (profile?.name || user.email)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#174332] text-white cursor-pointer hover:bg-[#102e24] shadow-xs">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-[#173b2d]">
                  {profile?.name || 'Registered Seeker'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#174332]/10 text-[#174332] text-[10px] font-extrabold uppercase">
                  Verified Seeker
                </span>
              </div>
              <p className="text-xs text-[#596b5e] mt-0.5">
                {profile?.headline || 'Candidate looking for opportunities in Rwanda'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#799083] mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile?.district || 'Kigali'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl border border-[#d9ded4] text-xs font-bold text-[#174332] hover:bg-[#e9eee4] transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl border border-[#d9ded4] text-[#596b5e] hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Strength Progress */}
        <div className="p-4 bg-[#eef3eb] border border-[#d2decb] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#efbd43]" />
              <span className="text-xs font-bold text-[#174332]">
                Profile Completeness: {completeness}%
              </span>
            </div>
            <p className="text-[11px] text-[#596b5e]">
              {completeness < 100
                ? 'Tip: Upload a CV and fill in your education and key skills to get 100% employer match priority.'
                : 'Excellent! Your profile is 100% complete and ready for employer review.'}
            </p>
          </div>
          <div className="w-full sm:w-48 bg-[#d8e3d3] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#174332] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-[#f0f0e9] pb-1 overflow-x-auto">
          {[
            { id: 'profile', label: 'Candidate Profile', count: undefined },
            { id: 'documents', label: 'CVs & Documents', count: cvs.length },
            { id: 'applications', label: 'My Applications', count: applications.length },
            { id: 'payments', label: 'Payment Receipts', count: payments.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-[#174332] text-white shadow-xs'
                  : 'text-[#596b5e] hover:bg-[#e9eee4]'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === t.id ? 'bg-[#efbd43] text-[#173b2d]' : 'bg-[#e4e5d9] text-[#173b2d]'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE EDIT / VIEW */}
        {activeTab === 'profile' && (
          <div>
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+250 788 123 456"
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Rwandan District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Highest Education</label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="e.g. BSc in Computer Science, University of Rwanda"
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173b2d] mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#173b2d] mb-1">
                    Key Competencies & Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Java, React, SQL, Project Management, English, Kinyarwanda"
                    className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#173b2d] mb-1">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Briefly describe your career background and what makes you a great fit..."
                    className="w-full p-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#d9ded4] rounded-xl text-xs font-bold text-[#596b5e]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#174332] text-white rounded-xl text-xs font-bold hover:bg-[#102e24]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Education</span>
                    <p className="text-xs font-bold text-[#173b2d]">
                      {profile?.education || 'Not specified yet'}
                    </p>
                  </div>
                  <div className="p-4 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Experience</span>
                    <p className="text-xs font-bold text-[#173b2d]">
                      {profile?.experienceYears ? `${profile.experienceYears} Years Experience` : 'Entry / Early Career'}
                    </p>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="p-4 bg-[#f8f9f5] border border-[#e4e5d9] rounded-2xl space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">Bio / Summary</span>
                    <p className="text-xs text-[#173b2d] leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#9e7940] block mb-2">
                    Verified Competencies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(profile?.skills && profile.skills.length > 0
                      ? profile.skills
                      : ['Kinyarwanda & English', 'Team Collaboration', 'IT Literacy']
                    ).map((sk) => (
                      <span
                        key={sk}
                        className="text-xs font-semibold px-3 py-1 bg-[#edf1e9] text-[#174332] rounded-lg border border-[#e4e5d9]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CV DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#173b2d]">
                  Curriculum Vitae & Supporting Documents
                </h3>
                <p className="text-xs text-[#596b5e]">
                  Manage multiple versions of your CV. Select which document to attach for each application.
                </p>
              </div>

              <label className="cursor-pointer px-4 py-2 bg-[#174332] hover:bg-[#102e24] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New CV</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {cvs.length === 0 ? (
              <div className="text-center py-10 bg-[#f8f9f5] border border-dashed border-[#cbd5c8] rounded-2xl space-y-2">
                <FileText className="w-8 h-8 text-[#9e7940] mx-auto" />
                <p className="text-xs font-bold text-[#173b2d]">No CV uploaded yet</p>
                <p className="text-[11px] text-[#596b5e]">
                  Upload your CV in PDF format to start applying for jobs across Rwanda.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      cv.isDefault
                        ? 'bg-[#eef3eb] border-[#174332]'
                        : 'bg-white border-[#e4e5d9] hover:bg-[#f8f9f5]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#174332]/10 text-[#174332] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#173b2d] truncate">
                            {cv.fileName}
                          </span>
                          {cv.isDefault && (
                            <span className="px-2 py-0.2 rounded-full bg-[#174332] text-white text-[9px] font-black uppercase">
                              Default for Applications
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#596b5e] block">
                          {(cv.fileSize / 1024).toFixed(0)} KB • Uploaded {cv.uploadedAt.split('T')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!cv.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultCV(cv.id)}
                          className="text-xs font-bold text-[#174332] hover:underline px-2 py-1"
                        >
                          Make Default
                        </button>
                      )}
                      {cv.fileDataUrl && (
                        <a
                          href={cv.fileDataUrl}
                          download={cv.fileName}
                          className="p-2 rounded-lg text-[#174332] hover:bg-[#e9eee4]"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCV(cv.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Delete CV"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-[#173b2d]">
                  Submitted Applications & Status
                </h3>
                <p className="text-xs text-[#596b5e]">
                  Official real-time tracking for every vacancy you applied to through AkaziConnect.
                </p>
              </div>
              <button
                onClick={onNavigateJobs}
                className="px-3.5 py-1.5 bg-[#174332] text-white text-xs font-bold rounded-xl hover:bg-[#102e24]"
              >
                Browse More Jobs
              </button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12 bg-[#f8f9f5] border border-dashed border-[#cbd5c8] rounded-2xl space-y-2">
                <Briefcase className="w-8 h-8 text-[#9e7940] mx-auto" />
                <p className="text-xs font-bold text-[#173b2d]">No applications submitted yet</p>
                <p className="text-[11px] text-[#596b5e]">
                  When you apply for a job using the application fee portal, your verified application status will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-[#e4e5d9] rounded-2xl space-y-3 shadow-2xs hover:border-[#174332] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f0e9] pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-[#9e7940]">
                          {app.company}
                        </span>
                        <h4 className="font-display text-sm font-bold text-[#173b2d]">
                          {app.jobTitle}
                        </h4>
                        <span className="text-[10px] text-[#596b5e]">
                          Ref: <strong className="font-mono text-[#174332]">{app.referenceNumber || app.applicationRef || app.id}</strong> • Submitted: {(app.submissionDate || app.appliedDate || '2026-10-09').split('T')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            app.status === 'Submitted' || app.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'Shortlisted' || app.status === 'shortlisted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Interview' || app.status === 'interview' || app.status === 'interviewing'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'Accepted' || app.status === 'accepted' || app.status === 'offered'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'Rejected' || app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-[#f8f9f5] rounded-xl">
                        <span className="text-[10px] text-[#596b5e] uppercase font-bold block">Application Fee</span>
                        <span className="font-bold text-[#173b2d]">
                          {(app.applicationFeeFrw || app.feeAmountRwf || 10000).toLocaleString()} FRW ({app.paymentStatus || 'confirmed'})
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#f8f9f5] rounded-xl">
                        <span className="text-[10px] text-[#596b5e] uppercase font-bold block">Payment Ref</span>
                        <span className="font-mono font-bold text-[#174332]">
                          {app.paymentReference || app.paymentRef || 'N/A'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-[#f8f9f5] rounded-xl">
                        <span className="text-[10px] text-[#596b5e] uppercase font-bold block">Attached Document</span>
                        <span className="font-bold text-[#173b2d] truncate block">
                          {app.cvFileName || app.cvName || 'Official Resume.pdf'}
                        </span>
                      </div>
                    </div>

                    {app.interviewDate && (
                      <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-medium">
                        🎉 <strong>Interview Scheduled:</strong> {app.interviewDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & RECEIPTS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-[#173b2d]">
                Application Fee Transactions & Receipts
              </h3>
              <p className="text-xs text-[#596b5e]">
                Official Rwandan Franc payment receipts locked to your submission records.
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-10 bg-[#f8f9f5] border border-dashed border-[#cbd5c8] rounded-2xl space-y-2">
                <p className="text-xs font-bold text-[#173b2d]">No payment records found</p>
                <p className="text-[11px] text-[#596b5e]">
                  Transactions created through MTN MoMo, Airtel Money, or Cards will be shown here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white border border-[#e4e5d9] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 p-1.5 bg-[#f8f9f5] border border-[#e4e5d9] rounded-xl flex items-center justify-center">
                        <PaymentProviderLogo provider={p.provider} size="sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#174332] text-sm">
                            {p.transactionRef}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                              p.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'refunded'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#596b5e] block mt-0.5">
                          Method: {p.provider.replace('_', ' ')} • Date: {p.createdAt.split('T')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      <div>
                        <span className="text-base font-display font-black text-[#173b2d]">
                          {(p.amountFrw || p.amountRwf || 10000).toLocaleString()} FRW
                        </span>
                        <span className="text-[10px] text-[#596b5e] block">
                          Category: {p.salaryCategory || p.pricingCategory || 'Standard'}
                        </span>
                      </div>
                      {(p.receiptUrl || p.receiptNumber) && (
                        <a
                          href={p.receiptUrl || '#'}
                          download={`Receipt-${p.transactionRef}.json`}
                          className="px-3 py-1.5 bg-[#eef3eb] text-[#174332] font-bold rounded-xl hover:bg-[#174332] hover:text-white transition-colors"
                        >
                          Receipt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
