-- 1. Vytvoření tabulky photos
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  filename text not null,
  taken_at timestamptz not null,
  caption text,
  width integer,
  height integer,
  created_at timestamptz default now()
);

-- Index pro rychlé řazení podle data pořízení (EXIF)
create index if not exists photos_taken_at_idx on public.photos (taken_at desc);

-- Zapnutí Row Level Security
alter table public.photos enable row level security;

-- Povolit veřejné čtení pro všechny návštěvníky webové galerie
create policy "Veřejné čtení fotek"
  on public.photos for select
  using (true);

-- 2. Vytvoření veřejného úložiště (Storage Bucket) s názvem 'photos'
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Povolit veřejné stahování/zobrazování souborů z bucketu 'photos'
create policy "Veřejné čtení úložiště fotek"
  on storage.objects for select
  using (bucket_id = 'photos');
