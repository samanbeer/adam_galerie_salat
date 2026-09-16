'use client';

import React from 'react';
import { ArrowDownNarrowWide, ArrowUpWideNarrow, Plus } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-mono text-sm font-semibold">
              AS
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
                  Adam Salát
                </h1>
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
                  Galerie
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-normal">
                {totalPhotos > 0 ? (
                  <>
                    <span className="text-zinc-200 font-medium">{totalPhotos}</span>{' '}
                    {totalPhotos === 1 ? 'fotografie' : totalPhotos < 5 ? 'fotografie' : 'fotografií'}
                    {dateRange && (
                      <span className="ml-1 text-zinc-500">
                        / {dateRange.start} – {dateRange.end}
                      </span>
                    )}
                  </>
                ) : (
                  'Žádné fotografie'
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Sort Toggle */}
            <button
              onClick={onToggleSort}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
              title="Změnit pořadí řazení"
            >
              {sortAscending ? (
                <>
                  <ArrowUpWideNarrow className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Od nejstarších</span>
                </>
              ) : (
                <>
                  <ArrowDownNarrowWide className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Od nejnovějších</span>
                </>
              )}
            </button>

            {/* Telegram Info / Add photo */}
            <button
              onClick={onOpenInfo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Přidat fotografii</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
