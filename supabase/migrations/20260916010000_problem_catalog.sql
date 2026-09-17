-- RevisionDSA Problem Catalog Schema
-- Enables pre-seeded problem catalog for LeetCode, Codeforces, and GeeksforGeeks

-- 1. Enable pg_trgm extension for fast fuzzy text searching
create extension if not exists pg_trgm;

-- 2. Create problem_catalog table
create table if not exists problem_catalog (
  id uuid primary key default gen_random_uuid(),
  platform text check (platform in ('leetcode','gfg','codeforces')) not null,
  external_id text not null,          -- leetcode: slug | codeforces: "{contestId}{index}" | gfg: slug
  title text not null,
  difficulty text check (difficulty in ('easy','medium','hard')), -- 'easy'/'medium'/'hard'
  rating int,                         -- codeforces numeric rating (800-3500), null for others
  tags text[] default '{}',
  url text not null,
  is_paid_only boolean default false, -- leetcode premium problems
  created_at timestamptz default now(),
  unique(platform, external_id)
);

-- 3. Indexes for ultra-fast queries and fuzzy matching
create index if not exists idx_catalog_platform on problem_catalog(platform);
create index if not exists idx_catalog_title_trgm on problem_catalog using gin (title gin_trgm_ops);
create index if not exists idx_catalog_external_id on problem_catalog(platform, external_id);

-- 4. Update existing problems table to reference problem_catalog
alter table problems add column if not exists catalog_id uuid references problem_catalog(id) on delete set null;

-- Make title/url/difficulty/platform optional overrides on problems
-- (In Postgres, existing columns keep their values; catalog_id acts as the canonical link)

-- 5. Row Level Security (RLS)
alter table problem_catalog enable row level security;

-- Everyone can read the problem catalog
create policy "Public catalog read access" on problem_catalog
  for select using (true);

-- Authenticated users (and service role) can insert/update problems in catalog
-- (allows organic additions from manual entry fallback)
create policy "Users can insert to catalog" on problem_catalog
  for insert with check (true);

create policy "Users can update catalog" on problem_catalog
  for update using (true);
