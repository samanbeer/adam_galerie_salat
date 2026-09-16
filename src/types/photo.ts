export interface Photo {
  id: string;
  url: string;
  filename: string;
  taken_at: string; // ISO 8601 string
  created_at?: string;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
}

export interface PhotoGroup {
  periodKey: string; // e.g. "2026-09"
  periodLabel: string; // e.g. "Září 2026"
  photos: Photo[];
}
