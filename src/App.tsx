import React, { useState, useEffect, useMemo } from 'react';
import { Job, ApplicationRecord, ApplicationStatus } from './types';
import { jobsData, CATEGORIES, LOCATIONS, CHECKED_DATE } from './data/jobs';
import { isRoleOpen, daysUntilClosing, formatDateLabel } from './utils/dateUtils';
import { Language, translations } from './utils/translations';
import { Header } from './components/Header';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { CoverLetterModal } from './components/CoverLetterModal';
import { ApplicationTracker } from './components/ApplicationTracker';
import { CareerTools } from './components/CareerTools';
import { ProfileView } from './components/ProfileView';
import { SourceBoards } from './components/SourceBoards';
import { BottomNav, NavTab } from './components/BottomNav';
import { NotificationModal } from './components/NotificationModal';
import {
  Search,
  Filter,
  Bookmark,
  Briefcase,
  User,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
  Compass,
  AlertCircle,
  Clock,
  MapPin,
  TrendingUp,
  FileText,
  Smartphone,
  Monitor,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile-frame'>('responsive');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All roles');
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [closingSoonOnly, setClosingSoonOnly] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Modals state
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Local storage bookmarks
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('akazi-saved');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Handle direct vanity URLs e.g. /apply/:slug/
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/apply/')) {
      const matchSlug = path.match(/\/apply\/([^/]+)/);
      if (matchSlug && matchSlug[1]) {
        const slug = matchSlug[1];
        const targetJob = jobsData.find((j) => j.slug === slug || j.id === slug);
        if (targetJob) {
          setDetailJob(targetJob);
        }
      }
    }
  }, []);

  // Local storage applications
  const [applications, setApplications] = useState<Record<string, ApplicationRecord>>(() => {
    try {
      const stored = localStorage.getItem('akazi-applications');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        showToast(lang === 'rw' ? 'Byavuye mu byabitswe' : 'Removed from saved jobs');
      } else {
        next.add(jobId);
        showToast(lang === 'rw' ? 'Byabitswe neza' : 'Saved to your browser shortlist');
      }
      try {
        localStorage.setItem('akazi-saved', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleUpdateApplication = (
    jobId: string,
    status: ApplicationStatus,
    notes?: string
  ) => {
    setApplications((prev) => {
      const next = { ...prev };
      if (status === 'archived') {
        delete next[jobId];
        showToast(lang === 'rw' ? 'Byakuwe mu bwanditswe' : 'Removed from application tracker');
      } else {
        next[jobId] = {
          jobId,
          status,
          appliedDate: next[jobId]?.appliedDate || new Date().toISOString(),
          notes: notes !== undefined ? notes : next[jobId]?.notes,
        };
        showToast(
          status === 'applied'
            ? lang === 'rw'
              ? 'Byemejwe ko byasabwe'
              : 'Marked as applied in tracker'
            : lang === 'rw'
            ? 'Imimerere yahindutse'
            : `Status updated to ${status}`
        );
      }
      try {
        localStorage.setItem('akazi-applications', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearData = () => {
    if (window.confirm('Reset all saved bookmarks and application records stored locally?')) {
      setSavedJobIds(new Set());
      setApplications({});
      try {
        localStorage.removeItem('akazi-saved');
        localStorage.removeItem('akazi-applications');
      } catch {}
      showToast('Local application data reset');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('All roles');
    setSelectedLocation('All locations');
    setClosingSoonOnly(false);
    setSearchQuery('');
    setIsFilterPanelOpen(false);
  };

  const t = translations[lang];

  // Filtered jobs logic
  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return jobsData.filter((job) => {
      // Search text
      if (q) {
        const hay = [
          job.title,
          job.company,
          job.location || '',
          ...(job.categories || []),
          job.sector || '',
          job.district || '',
          ...(job.keySkills || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Location
      if (selectedLocation !== 'All locations') {
        if (!job.location || !job.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All roles') {
        if (!job.categories.includes(selectedCategory)) {
          return false;
        }
      }

      // Closing Soon (within 7 days)
      if (closingSoonOnly) {
        const days = daysUntilClosing(job);
        if (days < 0 || days > 7 || !isRoleOpen(job)) {
          return false;
        }
      }

      // Tab specific filtering
      if (activeTab === 'saved') {
        return savedJobIds.has(job.id) && isRoleOpen(job);
      }

      return true;
    });
  }, [
    jobsData,
    searchQuery,
    selectedLocation,
    selectedCategory,
    closingSoonOnly,
    activeTab,
    savedJobIds,
  ]);

  const activeFiltersCount =
    (selectedLocation !== 'All locations' ? 1 : 0) +
    (selectedCategory !== 'All roles' ? 1 : 0) +
    (closingSoonOnly ? 1 : 0);

  // App content rendered inside either full width or mobile frame
  const content = (
    <div className="min-h-screen bg-[#f5f2e9] text-[#173b2d] flex flex-col justify-between">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'rw' : 'en')}
        viewMode={viewMode}
        onToggleViewMode={() =>
          setViewMode(viewMode === 'responsive' ? 'mobile-frame' : 'responsive')
        }
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onNavigateHome={() => setActiveTab('home')}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop Left Rail Navigation (Tablet / Desktop responsive) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 bg-[#eeefe5] border border-[#e2e5d9] rounded-3xl p-5 space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#829084]">
                Your Workspace
              </span>
              <nav className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'home'
                      ? 'bg-[#174332] text-white shadow-xs'
                      : 'text-[#416153] hover:bg-[#e0e8dc]'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{t.home}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'saved'
                      ? 'bg-[#174332] text-white shadow-xs'
                      : 'text-[#416153] hover:bg-[#e0e8dc]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4" />
                    <span>{t.savedTab}</span>
                  </div>
                  {savedJobIds.size > 0 && (
                    <span className="bg-[#efbd43] text-[#173b2d] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {savedJobIds.size}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'applications'
                      ? 'bg-[#174332] text-white shadow-xs'
                      : 'text-[#416153] hover:bg-[#e0e8dc]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.trackerTab}</span>
                  </div>
                  {Object.keys(applications).length > 0 && (
                    <span className="bg-[#efbd43] text-[#173b2d] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {Object.keys(applications).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('tools')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'tools'
                      ? 'bg-[#174332] text-white shadow-xs'
                      : 'text-[#416153] hover:bg-[#e0e8dc]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.toolsTab}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-[#174332] text-white shadow-xs'
                      : 'text-[#416153] hover:bg-[#e0e8dc]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t.profileTab}</span>
                </button>
              </nav>
            </div>

            {/* Side Note Quote */}
            <div className="p-4 bg-[#e0e8dc] rounded-2xl border border-[#d3ded0] space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#efbd43] shadow-xs" />
              <strong className="block font-display text-sm font-bold text-[#173b2d]">
                Your next step is closer.
              </strong>
              <p className="text-[11px] text-[#53665a] leading-relaxed">
                Consistent progress adds up. Keep your cover letters tailored and check closing deadlines in Kigali.
              </p>
            </div>

            {/* Candidate Quick Mini card */}
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 pt-3 border-t border-[#dfe2d7] cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#174332] text-[#fffdf7] font-extrabold text-xs flex items-center justify-center shrink-0">
                AM
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#173b2d] group-hover:underline truncate">
                  Amara M.
                </span>
                <span className="block text-[10px] text-[#596b5e] truncate">
                  Job seeker · Kigali
                </span>
              </div>
            </div>
          </aside>

          {/* Primary Main Content Area */}
          <main className="lg:col-span-9 space-y-6 pb-28 sm:pb-8">
            {/* TAB 1: HOME FEED */}
            {activeTab === 'home' && (
              <>
                {/* Hero Green Banner */}
                <section className="relative overflow-hidden bg-[#174332] text-[#fffdf7] rounded-3xl p-5 sm:p-8 shadow-md">
                  <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full border border-[#fae09b]/25 pointer-events-none" />
                  <div className="absolute -right-6 -top-6 w-44 h-44 rounded-full border border-[#fae09b]/15 pointer-events-none" />
                  <div className="absolute right-8 top-8 w-8 h-8 rounded-full bg-[#efbd43] shadow-lg shadow-[#efbd43]/30 hidden sm:block" />

                  <div className="relative z-10 max-w-xl space-y-3">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#efbd43]">
                      {t.heroEyebrow}
                    </span>
                    <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                      {t.heroTitle}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#fffdf7]/85 max-w-md">
                      {t.heroSubtitle}
                    </p>

                    {/* Integrated Search Box */}
                    <div className="pt-2">
                      <div className="flex items-center bg-[#fffdf7] rounded-2xl p-1 sm:p-1.5 shadow-lg border border-[#e4e5d9]">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#799083] ml-2 shrink-0" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t.searchPlaceholder}
                          className="min-w-0 flex-1 text-xs sm:text-sm text-[#173b2d] px-2 sm:px-3 py-2 bg-transparent focus:outline-none placeholder:text-[#799083]"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="p-1 text-[#799083] hover:text-[#173b2d] mr-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="bg-[#efbd43] hover:bg-[#e0b03a] text-[#173b2d] font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shrink-0 transition-colors"
                        >
                          {t.findJobsBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Verified Snapshot Notice Bar */}
                <div className="p-3.5 sm:p-4 bg-[#fff7dc] border border-[#fae09b] rounded-2xl flex items-start sm:items-center justify-between gap-3 text-xs text-[#714f15]">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#efbd43] shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <strong>{t.snapshotNoticeTitle}.</strong> {t.snapshotNoticeBody}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(true)}
                    className="text-[11px] font-bold underline whitespace-nowrap shrink-0 hover:text-[#173b2d]"
                  >
                    View details
                  </button>
                </div>

                {/* Explore Categories / Sectors Horizontal Scroll */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-[#173b2d]">
                      {t.explorePath}
                    </h2>
                    <span className="text-xs text-[#596b5e]">
                      {jobsData.length} roles total
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat;
                      const count =
                        cat === 'All roles'
                          ? jobsData.length
                          : jobsData.filter((j) => j.categories.includes(cat)).length;

                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#174332] text-white shadow-xs'
                              : 'bg-[#fffdf7] border border-[#e4e5d9] text-[#416153] hover:bg-[#e9eee4]'
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#e9eee4] text-[#596b5e]'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Feed Controls & Quick Filter Pills */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[#173b2d]">
                        {t.verifiedRoles}
                      </h2>
                      <p className="text-xs text-[#596b5e] mt-0.5">
                        {filteredJobs.length} {filteredJobs.length === 1 ? 'role' : 'roles'} found
                        {selectedLocation !== 'All locations' ? ` in ${selectedLocation}` : ''}
                        {selectedCategory !== 'All roles' ? ` • ${selectedCategory}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                      <button
                        onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-colors shrink-0 ${
                          isFilterPanelOpen || activeFiltersCount > 0
                            ? 'bg-[#174332] text-white border-[#174332]'
                            : 'bg-[#fffdf7] border-[#e4e5d9] text-[#416153] hover:bg-[#e9eee4]'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{t.filters}</span>
                        {activeFiltersCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#efbd43] text-[#173b2d] text-[10px] flex items-center justify-center font-black">
                            {activeFiltersCount}
                          </span>
                        )}
                      </button>

                      {/* Quick toggle Kigali */}
                      <button
                        onClick={() =>
                          setSelectedLocation(
                            selectedLocation === 'Kigali' ? 'All locations' : 'Kigali'
                          )
                        }
                        className={`text-xs px-3 py-2 rounded-xl border font-bold transition-colors shrink-0 ${
                          selectedLocation === 'Kigali'
                            ? 'bg-[#e9eee4] border-[#174332] text-[#174332]'
                            : 'bg-[#fffdf7] border-[#e4e5d9] text-[#596b5e] hover:bg-[#e9eee4]'
                        }`}
                      >
                        Kigali
                      </button>

                      {/* Quick toggle Closing Soon */}
                      <button
                        onClick={() => setClosingSoonOnly(!closingSoonOnly)}
                        className={`text-xs px-3 py-2 rounded-xl border font-bold transition-colors shrink-0 ${
                          closingSoonOnly
                            ? 'bg-[#e9eee4] border-[#174332] text-[#174332]'
                            : 'bg-[#fffdf7] border-[#e4e5d9] text-[#596b5e] hover:bg-[#e9eee4]'
                        }`}
                      >
                        {lang === 'rw' ? 'Birasozwa vuba' : 'Closing soon'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Filter Panel */}
                  {isFilterPanelOpen && (
                    <div className="p-4 bg-[#e9eee4] border border-[#d9ded4] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e] mb-1">
                          {t.location}
                        </label>
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full p-2 bg-white border border-[#d9ded4] rounded-xl text-[#173b2d]"
                        >
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#596b5e] mb-1">
                          {t.category}
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full p-2 bg-white border border-[#d9ded4] rounded-xl text-[#173b2d]"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-[#173b2d]">
                          <input
                            type="checkbox"
                            checked={closingSoonOnly}
                            onChange={(e) => setClosingSoonOnly(e.target.checked)}
                            className="w-4 h-4 rounded text-[#174332] accent-[#174332]"
                          />
                          <span>{t.closingSoon}</span>
                        </label>

                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-[#174332] font-bold underline hover:text-[#102e24]"
                        >
                          {t.clearFilters}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Jobs Grid */}
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-[#fffdf7] border border-dashed border-[#cbd5c8] rounded-3xl">
                      <div className="w-12 h-12 rounded-2xl bg-[#e8eee3] text-[#174332] flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-[#efbd43]" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#173b2d]">
                        No open roles match your filters
                      </h3>
                      <p className="text-xs text-[#596b5e] max-w-sm mx-auto mt-1 leading-relaxed">
                        Try adjusting your keywords, selecting "All locations", or clearing the 7-day closing filter.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 bg-[#174332] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#102e24] transition-colors"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isSaved={savedJobIds.has(job.id)}
                          application={applications[job.id]}
                          onToggleSave={handleToggleSave}
                          onOpenDetails={(j) => setDetailJob(j)}
                          onOpenCoverLetter={(j) => setCoverLetterJob(j)}
                          lang={lang}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Source Boards Section */}
                <SourceBoards lang={lang} />
              </>
            )}

            {/* TAB 2: SAVED JOBS */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9e7940]">
                    Your Shortlist
                  </span>
                  <h1 className="font-display text-3xl font-bold text-[#173b2d] mt-1">
                    {t.savedTab}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#596b5e] mt-1">
                    Roles you bookmarked that remain open today. Stored in your local device storage.
                  </p>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="text-center py-14 px-4 bg-[#fffdf7] border border-dashed border-[#cbd5c8] rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-[#fff4d1] text-[#936d15] flex items-center justify-center mx-auto mb-3">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#173b2d]">
                      {t.emptySavedTitle}
                    </h3>
                    <p className="text-xs text-[#596b5e] max-w-sm mx-auto mt-1 leading-relaxed">
                      {t.emptySavedBody}
                    </p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="mt-4 bg-[#174332] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#102e24] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{t.exploreOpenings}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.has(job.id)}
                        application={applications[job.id]}
                        onToggleSave={handleToggleSave}
                        onOpenDetails={(j) => setDetailJob(j)}
                        onOpenCoverLetter={(j) => setCoverLetterJob(j)}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}

                <SourceBoards lang={lang} />
              </div>
            )}

            {/* TAB 3: APPLICATIONS TRACKER */}
            {activeTab === 'applications' && (
              <ApplicationTracker
                jobs={jobsData}
                applications={applications}
                onOpenDetails={(j) => setDetailJob(j)}
                onUpdateStatus={handleUpdateApplication}
                onNavigateHome={() => setActiveTab('home')}
                lang={lang}
              />
            )}

            {/* TAB 4: CAREER TOOLS */}
            {activeTab === 'tools' && (
              <CareerTools
                jobs={jobsData}
                onOpenCoverLetterBuilder={(j) => setCoverLetterJob(j)}
                lang={lang}
              />
            )}

            {/* TAB 5: PROFILE VIEW */}
            {activeTab === 'profile' && (
              <ProfileView
                applications={applications}
                savedJobIds={savedJobIds}
                onClearData={handleClearData}
                lang={lang}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedJobIds.size}
        appliedCount={Object.keys(applications).length}
        lang={lang}
      />

      {/* Modals */}
      <JobDetailModal
        job={detailJob}
        isOpen={!!detailJob}
        onClose={() => setDetailJob(null)}
        isSaved={detailJob ? savedJobIds.has(detailJob.id) : false}
        onToggleSave={handleToggleSave}
        application={detailJob ? applications[detailJob.id] : undefined}
        onUpdateApplication={handleUpdateApplication}
        onOpenCoverLetterBuilder={(j) => {
          setDetailJob(null);
          setCoverLetterJob(j);
        }}
        lang={lang}
      />

      <CoverLetterModal
        job={coverLetterJob}
        isOpen={!!coverLetterJob}
        onClose={() => setCoverLetterJob(null)}
        lang={lang}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        lang={lang}
      />

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#102e24] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#efbd43]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );

  // If Mobile Frame mode is selected, render an authentic smartphone mockup frame
  if (viewMode === 'mobile-frame') {
    return (
      <div className="min-h-screen bg-[#1c2e26] py-6 px-4 flex flex-col items-center justify-center font-sans">
        {/* Frame Top Switcher Bar */}
        <div className="w-full max-w-sm mb-4 flex items-center justify-between text-white/90 text-xs px-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#efbd43]" />
            <span className="font-bold">Mobile App Viewport</span>
          </div>
          <button
            onClick={() => setViewMode('responsive')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Responsive</span>
          </button>
        </div>

        {/* Mobile Device Mockup */}
        <div className="relative w-full max-w-[400px] h-[844px] bg-[#0c1410] rounded-[52px] p-3 shadow-2xl border-4 border-[#2c4438] ring-1 ring-white/10 flex flex-col overflow-hidden">
          {/* Dynamic Island / Speaker */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#18231e] mr-2" />
            <div className="w-2 h-2 rounded-full bg-[#143224]" />
          </div>

          {/* Inner Phone Screen */}
          <div className="w-full h-full bg-[#f5f2e9] rounded-[42px] overflow-y-auto overflow-x-hidden flex flex-col relative">
            {/* Phone Status Bar */}
            <div className="sticky top-0 z-40 bg-[#f5f2e9]/95 backdrop-blur-xs pt-3 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-[#173b2d]">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <span className="w-4 h-2.5 border border-[#173b2d] rounded-xs relative flex items-center p-0.5">
                  <span className="w-full h-full bg-[#173b2d] rounded-2xs" />
                </span>
              </div>
            </div>

            {/* Application Inside Phone */}
            <div className="flex-1 pb-16">{content}</div>
          </div>

          {/* Bottom Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full pointer-events-none" />
        </div>
      </div>
    );
  }

  // Full Screen Responsive Mode
  return content;
}
