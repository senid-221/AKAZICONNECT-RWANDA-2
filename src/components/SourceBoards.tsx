import React from 'react';
import { SOURCE_BOARDS } from '../data/jobs';
import { Language, translations } from '../utils/translations';
import { ExternalLink, Compass } from 'lucide-react';

interface SourceBoardsProps {
  lang: Language;
}

export const SourceBoards: React.FC<SourceBoardsProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="bg-[#eeefe5] border border-[#e4e5d9] rounded-3xl p-4 sm:p-7 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#714f15]">
            Keep Exploring
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#173b2d] mt-0.5">
            {t.sourceBoardsTitle}
          </h2>
          <p className="text-xs text-[#596b5e] mt-0.5 max-w-xl">
            {t.sourceBoardsSubtitle}. These original boards update continuously after this verified snapshot.
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#fffdf7] text-[#174332] flex items-center justify-center shrink-0">
          <Compass className="w-5 h-5 text-[#efbd43]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {SOURCE_BOARDS.map((board) => (
          <a
            key={board.name}
            href={board.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 bg-[#fffdf7] border border-[#d9ded4] rounded-2xl hover:border-[#174332] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#174332] mb-1.5">
                <h4 className="font-bold text-xs sm:text-sm group-hover:underline">
                  {board.name}
                </h4>
                <ExternalLink className="w-3.5 h-3.5 text-[#596b5e] group-hover:text-[#174332] transition-colors" />
              </div>
              <p className="text-[11px] text-[#596b5e] leading-snug">
                {board.desc}
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-[#174332] mt-3 block group-hover:translate-x-0.5 transition-transform">
              Visit Portal ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};
