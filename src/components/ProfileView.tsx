import React, { useState } from 'react';
import { UserProfile, ApplicationRecord } from '../types';
import { Language, translations } from '../utils/translations';
import {
  User,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Download,
  Trash2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  applications: Record<string, ApplicationRecord>;
  savedJobIds: Set<string>;
  onClearData: () => void;
  lang: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  applications,
  savedJobIds,
  onClearData,
  lang,
}) => {
  const t = translations[lang];

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Amara Mukamana',
    headline: 'IT Support & Systems Specialist',
    location: 'Kigali, Rwanda',
    email: 'amara.mukamana@gmail.com',
    phone: '+250 788 123 456',
    education: 'BSc. in Computer Science & Information Systems',
    experienceYears: 4,
    skills: ['Network Administration', 'Active Directory', 'System Troubleshooting', 'SQL & Reporting', 'Kinyarwanda & English'],
    bio: 'Dedicated technology professional based in Kigali with experience supporting operations, user support, and enterprise network systems.',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleExportData = () => {
    const backup = {
      profile,
      savedJobs: Array.from(savedJobIds),
      applications,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AkaziConnect_Profile_Backup_${profile.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9e7940]">
          Candidate Workspace
        </span>
        <h1 className="font-display text-3xl font-bold text-[#173b2d] mt-1">
          {t.profileTab}
        </h1>
        <p className="text-xs sm:text-sm text-[#596b5e] mt-1">
          Manage your candidate details, track readiness for Rwandan vacancies, and control your local data.
        </p>
      </div>

      {showToast && (
        <div className="p-3 bg-[#174332] text-white text-xs font-semibold rounded-xl text-center shadow-md">
          Profile updated successfully in local storage!
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-[#fffdf7] border border-[#e4e5d9] rounded-3xl p-4 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f0f0e9]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#efbd43] text-[#174332] font-display font-bold text-2xl flex items-center justify-center shrink-0">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#173b2d]">
                {profile.name}
              </h2>
              <p className="text-xs text-[#596b5e] mt-0.5">{profile.headline}</p>
              <div className="flex items-center gap-1.5 text-xs text-[#174332] font-medium mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="self-start sm:self-auto text-xs font-bold px-4 py-2 rounded-xl bg-[#e9eee4] text-[#174332] hover:bg-[#d9e4d4] transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Strength Progress */}
        <div className="p-4 bg-[#e9eee4] rounded-2xl border border-[#d9ded4] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#174332]">
            <span>{t.profileStrength}</span>
            <span>85% (Ready to apply)</span>
          </div>
          <div className="w-full h-2.5 bg-[#d4ded1] rounded-full overflow-hidden">
            <div className="h-full bg-[#174332] rounded-full w-[85%]" />
          </div>
          <p className="text-[11px] text-[#596b5e]">
            Profile information auto-fills your customized Rwandan cover letters and job match preferences.
          </p>
        </div>

        {/* Form or Info View */}
        {isEditing ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#596b5e] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#596b5e] mb-1">Professional Title</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#596b5e] mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#596b5e] mb-1">Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#596b5e] mb-1">Highest Degree / University</label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-[#596b5e] mb-1">Professional Summary</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full p-2.5 bg-white border border-[#d9ded4] rounded-xl"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 text-[#173b2d]">
                <Mail className="w-4 h-4 text-[#596b5e]" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#173b2d]">
                <Phone className="w-4 h-4 text-[#596b5e]" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#173b2d]">
                <GraduationCap className="w-4 h-4 text-[#596b5e]" />
                <span>{profile.education}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#173b2d]">
                <Briefcase className="w-4 h-4 text-[#596b5e]" />
                <span>{profile.experienceYears} Years of experience</span>
              </div>
            </div>

            <p className="text-xs text-[#596b5e] leading-relaxed pt-2 border-t border-[#f0f0e9]">
              {profile.bio}
            </p>

            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e] mb-2">
                Core Competencies & Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2.5 py-1 bg-[#edf1e9] text-[#174332] font-semibold rounded-lg border border-[#d9ded4]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Local Data Management & API Configuration */}
        <div className="pt-6 border-t border-[#f0f0e9] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e]">
                AI Assistant API Key
              </span>
              <p className="text-[11px] text-[#596b5e] mt-0.5">
                Route AI requests directly through your custom API key.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="sk-..."
                defaultValue={localStorage.getItem('akazi_openai_key') || ''}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    localStorage.setItem('akazi_openai_key', e.target.value.trim());
                  } else {
                    localStorage.removeItem('akazi_openai_key');
                  }
                }}
                className="text-xs p-2 bg-white border border-[#d9ded4] rounded-xl text-[#173b2d] w-48 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#f0f0e9]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e] mb-2">
              Browser Storage & Privacy
            </span>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-[#d9ded4] text-[#174332] hover:bg-[#e9eee4] transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Saved & Applications Backup</span>
              </button>

              <button
                type="button"
                onClick={onClearData}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-[#fae5db] text-[#8a422d] hover:bg-[#f6d2c4] transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Bookmarks</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
