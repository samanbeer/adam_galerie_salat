'use client';

import React from 'react';
import { Photo } from '@/types/photo';
import { PhotoCard } from './PhotoCard';
import { CalendarDays } from 'lucide-react';

interface PhotoGroupSectionProps {
  periodLabel: string;
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export const PhotoGroupSection: React.FC<PhotoGroupSectionProps> = ({
  periodLabel,
  photos,
  onPhotoClick,
}) => {
  return (
    <section className="mb-10 sm:mb-14">
      {/* Sticky group header */}
      <div className="sticky top-[73px] sm:top-[81px] z-20 bg-slate-950/90 backdrop-blur-md py-3 mb-4 sm:mb-6 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 capitalize">
            {periodLabel}
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          {photos.length} {photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotek'}
        </span>
      </div>

      {/* Grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
          />
        ))}
      </div>
    </section>
  );
};
