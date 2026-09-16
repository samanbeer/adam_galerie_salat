'use client';

import React, { useState } from 'react';
import { Photo } from '@/types/photo';
import { Calendar, Clock, Maximize2 } from 'lucide-react';

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
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:shadow-2xl hover:border-emerald-500/50 hover:scale-[1.015] transition-all duration-300 aspect-square"
    >
      {/* Skeleton / Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}

      {/* Image */}
      <img
        src={photo.url}
        alt={photo.caption || photo.filename}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Gradient Vignette overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5">
        <div className="flex justify-end">
          <span className="p-2 bg-slate-900/80 backdrop-blur-md rounded-full text-slate-200 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Maximize2 className="w-4 h-4" />
          </span>
        </div>

        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
          {photo.caption && (
            <p className="text-sm font-medium text-white line-clamp-1 mb-1 drop-shadow">
              {photo.caption}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
            <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-emerald-400" />
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
