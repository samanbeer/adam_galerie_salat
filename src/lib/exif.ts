import exifr from 'exifr';

/**
 * Extracts taken date from an image buffer or Uint8Array.
 * If EXIF DateTimeOriginal is not found, tries parsing date from filename.
 * Falls back to fallbackDate or now.
 */
export async function extractTakenDate(
  imageBuffer: Buffer | ArrayBuffer | Uint8Array,
  filename?: string,
  fallbackDate: Date = new Date()
): Promise<Date> {
  try {
    const exifData = await exifr.parse(imageBuffer, {
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate'],
    });

    if (exifData) {
      const date = exifData.DateTimeOriginal || exifData.CreateDate || exifData.ModifyDate;
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
      if (typeof date === 'string') {
        const parsed = parseExifDateString(date);
        if (parsed) return parsed;
      }
    }
  } catch (err) {
    console.warn('EXIF extraction error:', err);
  }

  // Fallback: parse from filename if it matches IMG_YYYYMMDD_HHMMSS...
  if (filename) {
    const fromName = parseDateFromFilename(filename);
    if (fromName) return fromName;
  }

  return fallbackDate;
}

/**
 * Parses EXIF date format 'YYYY:MM:DD HH:MM:SS'
 */
function parseExifDateString(str: string): Date | null {
  const match = str.match(/^(\d{4})[:\-](\d{2})[:\-](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const [, y, m, d, hh, mm, ss] = match;
    const date = new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      parseInt(hh, 10),
      parseInt(mm, 10),
      parseInt(ss, 10)
    );
    if (!isNaN(date.getTime())) return date;
  }
  const generic = new Date(str);
  return isNaN(generic.getTime()) ? null : generic;
}

/**
 * Parses date from common smartphone filenames like IMG_20250915_135105613_HDR.jpg
 */
export function parseDateFromFilename(filename: string): Date | null {
  // Matches: IMG_20250915_135105 or 20250915_135105 or 2025-09-15-13-51-05
  const match = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})[-_](\d{2})[-_]?(\d{2})[-_]?(\d{2})/);
  if (match) {
    const [, y, m, d, hh, mm, ss] = match;
    const date = new Date(
      parseInt(y, 10),
      parseInt(m, 10) - 1,
      parseInt(d, 10),
      parseInt(hh, 10),
      parseInt(mm, 10),
      parseInt(ss, 10)
    );
    if (!isNaN(date.getTime())) return date;
  }

  // Matches just date: IMG_20250915 or 2025-09-15
  const dateOnlyMatch = filename.match(/(\d{4})[-_]?(\d{2})[-_]?(\d{2})/);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), 12, 0, 0);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}
