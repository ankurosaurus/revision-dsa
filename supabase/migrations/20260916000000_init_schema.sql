-- RevisionDSA Database Schema
-- Supabase Postgres Schema with RLS and automated updated_at triggers

-- 1. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  target_companies text[] default '{}',
  daily_goal int default 5,
  created_at timestamptz default now()
);

-- 2. Problems Table
create table if not exists problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
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

-- 3. Review Logs Table
create table if not exists review_logs (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid references problems(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating text check (rating in ('again','hard','good','easy')) not null,
  reviewed_at timestamptz default now()
);

-- Indexes for lightning fast queries
create index if not exists idx_problems_user_id on problems(user_id);
create index if not exists idx_problems_next_review on problems(user_id, next_review_date);
create index if not exists idx_review_logs_user_reviewed on review_logs(user_id, reviewed_at);

-- 4. Row Level Security (RLS)
alter table profiles enable row level security;
alter table problems enable row level security;
alter table review_logs enable row level security;

-- Profiles policies
create policy "Users can view/update their own profile" on profiles
  for all using (auth.uid() = id);

-- Problems policies
create policy "Users can CRUD their own problems" on problems
  for all using (auth.uid() = user_id);

-- Review logs policies
create policy "Users can CRUD their own review logs" on review_logs
  for all using (auth.uid() = user_id);

-- 5. Trigger to automatically handle profile creation on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, daily_goal)
  values (new.id, new.raw_user_meta_data->>'full_name', 5);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
