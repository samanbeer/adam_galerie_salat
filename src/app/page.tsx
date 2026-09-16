'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Photo, PhotoGroup } from '@/types/photo';
import { GalleryHeader } from '@/components/GalleryHeader';
import { PhotoGroupSection } from '@/components/PhotoGroupSection';
import { LightboxModal } from '@/components/LightboxModal';
import { TelegramInfoModal } from '@/components/TelegramInfoModal';
import { Sparkles, ImageOff, RefreshCw } from 'lucide-react';

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | 'empty'>('empty');
  const [sortAscending, setSortAscending] = useState(false); // Default: newest first
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/photos', { cache: 'no-store' });
      const data = await res.json();
      if (data.photos) {
        setPhotos(data.photos);
        setSource(data.source);
        setNotice(data.notice || null);
      }
    } catch (err) {
      console.error('Chyba při načítání fotek:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Sorted list of all photos
  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => {
      const timeA = new Date(a.taken_at).getTime();
      const timeB = new Date(b.taken_at).getTime();
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [photos, sortAscending]);

  // Group photos by Year and Month
  const photoGroups = useMemo(() => {
    const groupMap = new Map<string, { label: string; photos: Photo[] }>();

    for (const photo of sortedPhotos) {
      const date = new Date(photo.taken_at);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${CZECH_MONTHS[monthIndex]} ${year}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, { label, photos: [] });
      }
      groupMap.get(key)!.photos.push(photo);
    }

    const groups: PhotoGroup[] = [];
    groupMap.forEach((val, key) => {
      groups.push({
        periodKey: key,
        periodLabel: val.label,
        photos: val.photos,
      });
    });

    return groups;
  }, [sortedPhotos]);

  // Date range summary
  const dateRange = useMemo(() => {
    if (photos.length === 0) return null;
    const timestamps = photos.map((p) => new Date(p.taken_at).getTime()).filter((t) => !isNaN(t));
    if (timestamps.length === 0) return null;

    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const formatter = new Intl.DateTimeFormat('cs-CZ', {
      month: 'short',
      year: 'numeric',
    });

    return {
      start: formatter.format(minDate),
      end: formatter.format(maxDate),
    };
  }, [photos]);

  const handleOpenPhoto = (photo: Photo) => {
    const index = sortedPhotos.findIndex((p) => p.id === photo.id);
    if (index !== -1) {
      setActivePhotoIndex(index);
    }
  };

  return (
    <main className="min-h-screen pb-24 bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top sticky header */}
      <GalleryHeader
        totalPhotos={photos.length}
        dateRange={dateRange}
        sortAscending={sortAscending}
        onToggleSort={() => setSortAscending((prev) => !prev)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Notice Banner (e.g. Local preview notice) */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            <div className="h-8 w-48 bg-slate-900 rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-slate-900 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : photos.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
              <ImageOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Galerie je zatím prázdná
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Pošli svou první fotku do Telegram bota nebo spusť import ze složky galerie.
            </p>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg transition"
            >
              Zjistit, jak přidat fotku
            </button>
          </div>
        ) : (
          /* Grouped Photos Timeline */
          <div>
            {photoGroups.map((group) => (
              <PhotoGroupSection
                key={group.periodKey}
                periodLabel={group.periodLabel}
                photos={group.photos}
                onPhotoClick={handleOpenPhoto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        photos={sortedPhotos}
        currentIndex={activePhotoIndex}
        onClose={() => setActivePhotoIndex(null)}
        onNavigate={(newIndex) => setActivePhotoIndex(newIndex)}
      />

      {/* Telegram Info Modal */}
      <TelegramInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </main>
  );
}
