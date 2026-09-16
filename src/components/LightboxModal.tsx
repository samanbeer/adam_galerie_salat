'use client';

import React, { useEffect, useCallback } from 'react';
import { Photo } from '@/types/photo';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

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
    second: '2-digit',
  }).format(takenDate);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md select-none transition-all duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-slate-300 text-sm">
          <span className="font-semibold text-white">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline truncate max-w-xs text-slate-400">
            {photo.filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            download={photo.filename}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Otevřít v plném rozlišení"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Zavřít (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur transition-all hover:scale-110 shadow-lg border border-white/10"
            title="Předchozí fotka (šipka vlevo)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Photo Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={photo.url}
            alt={photo.caption || photo.filename}
            className="max-h-[78vh] max-w-[92vw] object-contain rounded-lg shadow-2xl transition-all"
          />
        </div>

        {/* Next Button */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-6 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur transition-all hover:scale-110 shadow-lg border border-white/10"
            title="Další fotka (šipka vpravo)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div
        className="px-4 sm:px-8 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.caption && (
          <p className="text-white text-base sm:text-lg font-medium mb-2 drop-shadow">
            {photo.caption}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formattedTime}</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur text-slate-400">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>EXIF pořízení</span>
          </div>
        </div>
      </div>
    </div>
  );
};
