'use client';

import React from 'react';
import { ArrowDownUp, Info, Send, Camera, Sparkles } from 'lucide-react';

interface GalleryHeaderProps {
  totalPhotos: number;
  dateRange: { start: string; end: string } | null;
  sortAscending: boolean;
  onToggleSort: () => void;
  onOpenInfo: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  totalPhotos,
  dateRange,
  sortAscending,
  onToggleSort,
  onOpenInfo,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20 text-2xl ring-2 ring-emerald-400/20">
              🥗
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-emerald-400 border border-slate-800">
                <Camera className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Adam Galerie Salát
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> EXIF Timeline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-normal">
                {totalPhotos > 0 ? (
                  <>
                    <span className="text-emerald-400 font-semibold">{totalPhotos}</span>{' '}
                    {totalPhotos === 1 ? 'fotka' : totalPhotos < 5 ? 'fotky' : 'fotek'}
                    {dateRange && (
                      <span className="ml-1 text-slate-500">
                        • {dateRange.start} – {dateRange.end}
                      </span>
                    )}
                  </>
                ) : (
                  'Zatím žádné fotky v galerii'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Sort Toggle Button */}
            <button
              onClick={onToggleSort}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition shadow-sm"
              title="Změnit řazení fotek"
            >
              <ArrowDownUp className="w-4 h-4 text-emerald-400" />
              <span>{sortAscending ? 'Od nejstarších ⬆️' : 'Od nejnovějších ⬇️'}</span>
            </button>

            {/* Telegram Info Button */}
            <button
              onClick={onOpenInfo}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Přidat přes Telegram</span>
              <span className="sm:hidden">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
