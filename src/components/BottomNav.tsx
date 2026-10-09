import React from 'react';
import { Home, Bookmark, CheckSquare, Sparkles, User } from 'lucide-react';
import { Language, translations } from '../utils/translations';

export type NavTab = 'home' | 'saved' | 'applications' | 'tools' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  savedCount: number;
  appliedCount: number;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedCount,
  appliedCount,
  lang,
}) => {
  const t = translations[lang];

  const items: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t.home, icon: <Home className="w-5 h-5" /> },
    {
      id: 'saved',
      label: t.savedTab,
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedCount,
    },
    {
      id: 'applications',
      label: t.trackerTab,
      icon: <CheckSquare className="w-5 h-5" />,
      badge: appliedCount,
    },
    { id: 'tools', label: t.toolsTab, icon: <Sparkles className="w-5 h-5" /> },
    { id: 'profile', label: t.profileTab, icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#fffdf7]/95 backdrop-blur-md border-t border-[#e4e5d9] px-1 sm:px-2 py-1 flex items-center justify-around sm:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-1 min-w-[54px] rounded-xl transition-all ${
              isActive
                ? 'text-[#174332] font-bold'
                : 'text-[#596b5e] font-semibold hover:text-[#174332]'
            }`}
          >
            {/* Top Indicator bar */}
            {isActive && (
              <span className="absolute -top-1 w-5 h-1 rounded-full bg-[#efbd43]" />
            )}

            <div className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-[#efbd43] text-[#173b2d] text-[9px] font-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>

            <span className="text-[9.5px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
