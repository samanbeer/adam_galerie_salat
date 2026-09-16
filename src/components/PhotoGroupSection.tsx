'use client';

import React from 'react';
import { Photo } from '@/types/photo';
import { PhotoCard } from './PhotoCard';

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
    <section className="mb-12 sm:mb-16">
      {/* Sticky group header */}
      <div className="sticky top-[69px] sm:top-[77px] z-20 bg-zinc-950/90 backdrop-blur-md py-3.5 mb-4 sm:mb-6 border-b border-zinc-900/80 flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-medium tracking-wider text-zinc-200 uppercase">
          {periodLabel}
        </h2>
        <span className="text-xs font-mono text-zinc-500">
          {photos.length}
        </span>
      </div>

      {/* Grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
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
