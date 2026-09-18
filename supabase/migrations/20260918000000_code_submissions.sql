-- =============================================================================
-- RevisionDSA — Code Submissions Schema Migration
-- Table for persisting user's problem solutions and execution output
-- =============================================================================

create table if not exists public.code_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  problem_id text not null,
  language text check (language in ('python', 'java', 'c', 'cpp')) not null,
  code text not null,
  last_stdout text,
  last_stderr text,
  updated_at timestamptz default now(),
  unique(user_id, problem_id, language)
);

-- Index for instant retrieval when opening a problem in the compiler
create index if not exists idx_code_submissions_lookup
  on public.code_submissions(user_id, problem_id, language);

-- Enable Row Level Security (RLS)
alter table public.code_submissions enable row level security;

-- RLS Policies: strict per-user ownership
create policy "Users can view own code submissions"
  on public.code_submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own code submissions"
  on public.code_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own code submissions"
  on public.code_submissions for update
  using (auth.uid() = user_id);

create policy "Users can delete own code submissions"
  on public.code_submissions for delete
  using (auth.uid() = user_id);
