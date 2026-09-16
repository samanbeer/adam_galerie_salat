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

  // Fallback: parse from filename only if it is NOT a generic generated photo_ timestamp
  if (filename && !/^photo_\d+/i.test(filename)) {
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
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    const hours = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);
    const seconds = parseInt(ss, 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && hours <= 23 && minutes <= 59 && seconds <= 59) {
      const date = new Date(year, month - 1, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }
  }
  const generic = new Date(str);
  return isNaN(generic.getTime()) ? null : generic;
}

/**
 * Parses date from common smartphone filenames like IMG_20250915_135105613_HDR.jpg or 2025-09-15...
 */
export function parseDateFromFilename(filename: string): Date | null {
  // Ignorujeme náhodné hashe nebo generovaná jména
  if (/^photo_\d+/i.test(filename)) {
    return null;
  }

  // Matches: IMG_20250915_135105... or 20250915_135105... or 2025-09-15-13-51-05
  const fullMatch = filename.match(
    /(?:^|[^\d])((?:19|20)\d{2})[-_]?([01]\d)[-_]?([0-3]\d)[-_]([0-2]\d)[-_]?([0-5]\d)[-_]?([0-5]\d)(?:\d+)?/
  );
  if (fullMatch) {
    const [, y, m, d, hh, mm, ss] = fullMatch;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    const hours = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);
    const seconds = parseInt(ss, 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && hours <= 23 && minutes <= 59 && seconds <= 59) {
      const date = new Date(year, month - 1, day, hours, minutes, seconds);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Matches just date: IMG_20250915 or 2025-09-15
  const dateOnlyMatch = filename.match(
    /(?:^|[^\d])((?:19|20)\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:[^\d]|$)/
  );
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const date = new Date(year, month - 1, day, 12, 0, 0);
      if (!isNaN(date.getTime())) return date;
    }
  }

  return null;
}
