'use client';

import React, { useState } from 'react';
import { Photo } from '@/types/photo';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const takenDate = new Date(photo.taken_at);
  const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(takenDate);

  const formattedTime = new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(takenDate);

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-sm hover:border-zinc-700 transition-all duration-300 aspect-[4/5] sm:aspect-square"
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.caption || photo.filename}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Clean gradient vignette on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 sm:p-4">
        {photo.caption && (
          <p className="text-xs sm:text-sm font-medium text-white line-clamp-2 mb-1.5 drop-shadow-sm">
            {photo.caption}
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono tracking-tight">
          <span>{formattedDate}</span>
          <span className="text-zinc-400">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
