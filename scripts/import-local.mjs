import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import WebSocket from 'ws';
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocket;
}
import { createClient } from '@supabase/supabase-js';
import exifr from 'exifr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Načtení .env.local
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.error('❌ CHYBA: Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Vyplň prosím tyto hodnoty v souboru .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function extractTakenDate(buffer, filename, fallbackDate) {
  try {
    const exifData = await exifr.parse(buffer, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
    });

    if (exifData) {
      const date = exifData.DateTimeOriginal || exifData.CreateDate || exifData.ModifyDate;
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
    }
  } catch {
    // ignore
  }

  // Fallback: název souboru IMG_YYYYMMDD_HHMMSS
  const match = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})[-_](\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (match) {
    const [, y, m, d, hh, mm, ss] = match;
    const parsed = new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      parseInt(hh, 10),
      parseInt(mm, 10),
      parseInt(ss, 10)
    );
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return fallbackDate;
}

async function main() {
  const galleryDir = path.join(rootDir, 'galerie');
  if (!fs.existsSync(galleryDir)) {
    console.error('❌ Složka "galerie" neexistuje!');
    process.exit(1);
  }

  const files = fs
    .readdirSync(galleryDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  if (files.length === 0) {
    console.log('Ve složce galerie nejsou žádné obrázky.');
    return;
  }

  console.log(`\n🚀 Začínám import ${files.length} fotek do Supabase...\n`);

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(galleryDir, filename);
    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    const takenAt = await extractTakenDate(buffer, filename, stats.mtime);
    const year = takenAt.getFullYear();
    const month = String(takenAt.getMonth() + 1).padStart(2, '0');
    const storagePath = `${year}/${month}/${filename}`;

    process.stdout.write(`[${i + 1}/${files.length}] Nahrávám ${filename}... `);

    // 1. Upload do Storage
    const { error: uploadErr } = await supabase.storage
      .from('photos')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.log(`❌ Chyba storage: ${uploadErr.message}`);
      continue;
    }

    const { data: pubData } = supabase.storage.from('photos').getPublicUrl(storagePath);
    const photoUrl = pubData.publicUrl;

    // 2. Insert do DB (nebo update podle url/filename)
    // Zkontrolujeme, zda už neexistuje
    const { data: existing } = await supabase
      .from('photos')
      .select('id')
      .eq('filename', filename)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('photos')
        .update({
          url: photoUrl,
          taken_at: takenAt.toISOString(),
        })
        .eq('id', existing.id);
    } else {
      const { error: insertErr } = await supabase.from('photos').insert({
        url: photoUrl,
        filename,
        taken_at: takenAt.toISOString(),
      });

      if (insertErr) {
        console.log(`❌ Chyba DB: ${insertErr.message}`);
        continue;
      }
    }

    const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(takenAt);

    console.log(`✅ OK (${formattedDate})`);
    successCount++;
  }

  console.log(`\n🎉 Hotovo! Úspěšně naimportováno ${successCount} z ${files.length} fotek.`);
}

main().catch((err) => {
  console.error('Chyba skriptu:', err);
  process.exit(1);
});
