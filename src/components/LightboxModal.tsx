'use client';

import React, { useEffect, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface LightboxModalProps {
  photos: Photo[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const photo = currentIndex !== null ? photos[currentIndex] : null;

  const handlePrev = useCallback(() => {
    if (currentIndex !== null && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex !== null && currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, onClose, handlePrev, handleNext]);

  if (!photo || currentIndex === null) return null;

  const takenDate = new Date(photo.taken_at);
  const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(takenDate);

  const formattedTime = new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(takenDate);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-sm select-none transition-all duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-zinc-400 text-xs font-mono">
          <span className="text-zinc-200">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="hidden sm:inline text-zinc-600">/</span>
          <span className="hidden sm:inline truncate max-w-xs text-zinc-500">
            {photo.filename}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            download={photo.filename}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition"
            title="Otevřít originál v plném rozlišení"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition"
            title="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 z-20 p-3 text-zinc-400 hover:text-white bg-black/40 hover:bg-black/80 rounded-full border border-zinc-800 backdrop-blur transition"
            title="Předchozí"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Photo */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={photo.url}
            alt={photo.caption || photo.filename}
            className="max-h-[80vh] max-w-[92vw] object-contain rounded-md shadow-2xl transition-all"
          />
        </div>

        {/* Next Button */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 z-20 p-3 text-zinc-400 hover:text-white bg-black/40 hover:bg-black/80 rounded-full border border-zinc-800 backdrop-blur transition"
            title="Další"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Information */}
      <div
        className="px-4 sm:px-8 py-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.caption && (
          <p className="text-zinc-100 text-sm sm:text-base font-normal mb-2 max-w-2xl mx-auto">
            {photo.caption}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-zinc-400 font-mono tracking-tight">
          <span className="capitalize">{formattedDate}</span>
          <span className="text-zinc-600">•</span>
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
