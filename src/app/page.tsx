'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Photo, PhotoGroup } from '@/types/photo';
import { GalleryHeader } from '@/components/GalleryHeader';
import { PhotoGroupSection } from '@/components/PhotoGroupSection';
import { LightboxModal } from '@/components/LightboxModal';
import { TelegramInfoModal } from '@/components/TelegramInfoModal';
import { ImageOff, X } from 'lucide-react';

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
      month: 'long',
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
    <main className="min-h-screen pb-24 bg-zinc-950 text-zinc-100">
      {/* Top sticky header */}
      <GalleryHeader
        totalPhotos={photos.length}
        dateRange={dateRange}
        sortAscending={sortAscending}
        onToggleSort={() => setSortAscending((prev) => !prev)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Optional Notice Banner */}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-between gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 text-xs">
            <span>{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="text-zinc-500 hover:text-white p-1 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {isLoading ? (
          <div className="space-y-8">
            <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-900 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-3">
              <ImageOff className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">
              Galerie je prázdná
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-5">
              Zašlete první fotografii přes Telegram bota.
            </p>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium rounded-lg transition"
            >
              Jak nahrát fotografii
            </button>
          </div>
        ) : (
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
