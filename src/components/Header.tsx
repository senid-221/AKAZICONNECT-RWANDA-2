import React from 'react';
import { Language } from '../utils/translations';
import { Bell, Smartphone, Monitor, Globe } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  viewMode: 'responsive' | 'mobile-frame';
  onToggleViewMode: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  viewMode,
  onToggleViewMode,
  onOpenNotifications,
  onOpenProfile,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fffdf7]/90 backdrop-blur-md border-b border-[#173b2d]/10 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl rounded-bl-xs bg-[#efbd43] -rotate-6 flex items-center justify-center relative shadow-xs transition-transform group-hover:scale-105">
            <div className="w-3 h-3 rounded-full border-2 border-[#102e24]" />
            <div className="absolute w-0.5 h-6 bg-[#102e24] rotate-45 opacity-80" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-extrabold text-xl sm:text-2xl text-[#173b2d] tracking-tight">
                AkaziConnect
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-[#596b5e] font-medium leading-none -mt-0.5">
              Find work that moves you
            </span>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Frame Simulator Toggle */}
          <button
            onClick={onToggleViewMode}
            title={viewMode === 'mobile-frame' ? 'Switch to Full Screen Responsive' : 'Switch to Mobile App Frame'}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#e4e5d9] bg-[#fffdf7] text-[#416153] hover:bg-[#e9eee4] transition-colors"
          >
            {viewMode === 'mobile-frame' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#174332]" />
                <span className="hidden lg:inline">Responsive</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#174332]" />
                <span className="hidden lg:inline">Mobile Frame</span>
              </>
            )}
          </button>

          {/* Bilingual Toggle (EN / RW) */}
          <button
            onClick={onToggleLang}
            title={lang === 'en' ? 'Hindura mu Kinyarwanda' : 'Switch to English'}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-[#e4e5d9] bg-[#fffdf7] text-[#174332] hover:bg-[#e9eee4] transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#efbd43]" />
            <span>{lang === 'en' ? 'RW' : 'EN'}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="Snapshot Information & Verification Notice"
            className="relative w-9 h-9 rounded-xl border border-[#e4e5d9] bg-[#fffdf7] flex items-center justify-center text-[#416153] hover:bg-[#e9eee4] hover:text-[#174332] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#b8664b] ring-2 ring-[#fffdf7]" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            title="My Profile"
            className="w-9 h-9 rounded-xl rounded-bl-xs bg-[#d7e4d4] text-[#174332] font-black text-xs flex items-center justify-center hover:bg-[#174332] hover:text-[#fffdf7] transition-colors"
          >
            AM
          </button>
        </div>
      </div>
    </header>
  );
};
