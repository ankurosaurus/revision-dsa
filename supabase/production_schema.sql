-- =============================================================================
-- RevisionDSA — Consolidated Production Database Schema
-- Run this script in the Supabase SQL Editor (supabase.com → Project → SQL Editor)
-- Idempotent: safe to run on fresh databases or over existing migrations.
-- =============================================================================

-- 1. Extensions
create extension if not exists "pg_trgm";
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 2. Profiles Table
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  target_companies text[] default '{}',
  daily_goal int default 5,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Ensure is_admin column exists if table was created previously
alter table public.profiles add column if not exists is_admin boolean default false;

-- -----------------------------------------------------------------------------
-- 3. Profile Auto-Creation Trigger
-- Fires for all new users (email, OAuth, and anonymous guest sessions)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, daily_goal, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Candidate'),
    5,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. Problem Catalog Table (15,000+ Pre-seeded Problems)
-- -----------------------------------------------------------------------------
create table if not exists public.problem_catalog (
  id uuid primary key default gen_random_uuid(),
  platform text check (platform in ('leetcode','gfg','codeforces')) not null,
  external_id text not null,          -- leetcode: slug | codeforces: contest+index | gfg: slug
  title text not null,
  difficulty text check (difficulty in ('easy','medium','hard')),
  rating int,                         -- codeforces rating (800-3500), null for others
  tags text[] default '{}',
  url text not null,
  is_paid_only boolean default false,
  created_at timestamptz default now(),
  unique(platform, external_id)
);

-- Indexes for instant search and autocomplete
create index if not exists idx_catalog_platform on public.problem_catalog(platform);
create index if not exists idx_catalog_title_trgm on public.problem_catalog using gin (title gin_trgm_ops);
create index if not exists idx_catalog_external_id on public.problem_catalog(platform, external_id);

-- -----------------------------------------------------------------------------
-- 5. User Problems Table
-- -----------------------------------------------------------------------------
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  catalog_id uuid references public.problem_catalog(id) on delete set null,
  title text not null,
  url text not null,
  platform text check (platform in ('leetcode','gfg','codeforces')) not null,
  difficulty text check (difficulty in ('easy','medium','hard')),
  tags text[] default '{}',
  notes text,
  link_verified boolean default false,
  ease_factor numeric default 2.5,
  interval_days numeric default 1,
  repetitions int default 0,
  next_review_date date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_problems_user_id on public.problems(user_id);
create index if not exists idx_problems_next_review on public.problems(user_id, next_review_date);

-- -----------------------------------------------------------------------------
-- 6. Review Logs Table (Spaced Repetition History)
-- -----------------------------------------------------------------------------
create table if not exists public.review_logs (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references public.problems(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating text check (rating in ('again','hard','good','easy')) not null,
  reviewed_at timestamptz default now()
);

-- Indexes
create index if not exists idx_review_logs_user_reviewed on public.review_logs(user_id, reviewed_at);
create index if not exists idx_review_logs_problem_id on public.review_logs(problem_id);

-- -----------------------------------------------------------------------------
-- 7. Row Level Security (RLS) — Security Verification
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.review_logs enable row level security;
alter table public.problem_catalog enable row level security;

-- Profiles: Users can view and update their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Profiles: Admins can read all profiles for aggregate analytics
drop policy if exists "Admin users can read all profiles" on public.profiles;
create policy "Admin users can read all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Problems: Strict isolation by user_id (works identically for guests and registered users)
drop policy if exists "Users can CRUD their own problems" on public.problems;
create policy "Users can CRUD their own problems" on public.problems
  for all using (auth.uid() = user_id);

-- Review Logs: Strict isolation by user_id
drop policy if exists "Users can CRUD their own review logs" on public.review_logs;
create policy "Users can CRUD their own review logs" on public.review_logs
  for all using (auth.uid() = user_id);

-- Problem Catalog: Public read access
drop policy if exists "Public catalog read access" on public.problem_catalog;
create policy "Public catalog read access" on public.problem_catalog
  for select using (true);

drop policy if exists "Authenticated users can insert to catalog" on public.problem_catalog;
create policy "Authenticated users can insert to catalog" on public.problem_catalog
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update catalog" on public.problem_catalog;
create policy "Authenticated users can update catalog" on public.problem_catalog
  for update using (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 8. Internal Admin Aggregate Stats RPC
-- Security-definer: safely calculates counts & trends without leaking raw rows
-- -----------------------------------------------------------------------------
create or replace function public.admin_get_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  -- Enforce that caller is an admin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Unauthorized: Admin access required';
  end if;

  select json_build_object(
    'total_users',      (select count(*) from auth.users),
    'registered_users', (select count(*) from auth.users where is_anonymous = false),
    'guest_users',      (select count(*) from auth.users where is_anonymous = true),
    'total_problems',   (select count(*) from public.problems),
    'total_revisions',  (select count(*) from public.review_logs),

    -- Signups per day (last 30 days)
    'signups_per_day', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select
          date_trunc('day', created_at)::date as date,
          count(*)::int as count
        from auth.users
        where created_at >= now() - interval '30 days'
          and is_anonymous = false
        group by 1 order by 1
      ) t
    ),

    -- Problems added per day (last 30 days)
    'problems_per_day', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select
          date_trunc('day', created_at)::date as date,
          count(*)::int as count
        from public.problems
        where created_at >= now() - interval '30 days'
        group by 1 order by 1
      ) t
    ),

    -- Revisions per day (last 30 days)
    'revisions_per_day', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select
          date_trunc('day', reviewed_at)::date as date,
          count(*)::int as count
        from public.review_logs
        where reviewed_at >= now() - interval '30 days'
        group by 1 order by 1
      ) t
    ),

    -- Platform breakdown
    'platform_breakdown', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select platform, count(*)::int as count
        from public.problems
        group by platform
      ) t
    ),

    -- Conversion rate
    'conversion_rate_pct', (
      select coalesce(
        round(
          100.0 * count(*) filter (where is_anonymous = false) /
          nullif(count(*), 0), 1
        ),
        0
      )
      from auth.users
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.admin_get_stats() to authenticated;

-- =============================================================================
-- End of Production Schema
-- =============================================================================
