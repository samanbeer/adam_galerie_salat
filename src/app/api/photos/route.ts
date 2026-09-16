import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import { extractTakenDate } from '@/lib/exif';
import { Photo } from '@/types/photo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  // 1. Zkusíme načíst fotky ze Supabase
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('taken_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          source: 'supabase',
          photos: data as Photo[],
        });
      }
    } catch (e) {
      console.warn('Supabase dotaz selhal, zkusíme lokální fotky:', e);
    }
  }

  // 2. Fallback: Načtení lokálních fotek ze složky public/galerie (pro rychlý start)
  try {
    const publicGalleryDir = path.join(process.cwd(), 'public', 'galerie');
    if (fs.existsSync(publicGalleryDir)) {
      const files = fs
        .readdirSync(publicGalleryDir)
        .filter((file) => /\.(jpe?g|png|webp)$/i.test(file));

      const photos: Photo[] = [];

      for (const file of files) {
        const filePath = path.join(publicGalleryDir, file);
        const buffer = fs.readFileSync(filePath);
        const stats = fs.statSync(filePath);
        const takenAt = await extractTakenDate(buffer, file, stats.mtime);

        photos.push({
          id: file,
          url: `/galerie/${encodeURIComponent(file)}`,
          filename: file,
          taken_at: takenAt.toISOString(),
          created_at: stats.birthtime.toISOString(),
        });
      }

      // Seřadíme od nejnovějších
      photos.sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());

      return NextResponse.json({
        source: 'local',
        photos,
        notice: 'Zobrazují se lokální fotky ze složky galerie. Po připojení Supabase se načtou z cloudu.',
      });
    }
  } catch (localErr) {
    console.error('Chyba při čtení lokální složky galerie:', localErr);
  }

  return NextResponse.json({
    source: 'empty',
    photos: [],
  });
}
