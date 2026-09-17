-- RevisionDSA: Admin Dashboard Support
-- =====================================
-- Adds is_admin boolean to profiles table.
-- Admin queries are done via Supabase with service_role key server-side,
-- but for this client-side admin panel we use the existing RLS anon key
-- and restrict access in the React layer by checking is_admin === true.
--
-- To make yourself admin:
--   UPDATE profiles SET is_admin = true WHERE id = '<your-auth-uid>';
-- Or use the Supabase Table Editor → profiles → set is_admin = true.

alter table profiles
  add column if not exists is_admin boolean default false;

-- Admin users can read ALL profiles (needed for user-count stats).
-- Non-admins keep the existing "own row only" policy.
create policy "Admin users can read all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Admin view: aggregate stats for the dashboard.
-- Uses a security-definer function so the anon key can safely call it.
create or replace function public.admin_get_stats()
returns json
language plpgsql
security definer  -- runs as the DB owner, bypasses RLS
set search_path = public
as $$
declare
  result json;
begin
  -- Verify the caller is an admin before returning anything
  if not exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Unauthorized: admin only';
  end if;

  select json_build_object(
    'total_users',      (select count(*) from auth.users),
    'registered_users', (select count(*) from auth.users where is_anonymous = false),
    'guest_users',      (select count(*) from auth.users where is_anonymous = true),
    'total_problems',   (select count(*) from problems),
    'total_revisions',  (select count(*) from review_logs),

    -- Signups per day — last 30 days
    'signups_per_day', (
      select json_agg(row_to_json(t))
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

    -- Problems added per day — last 30 days
    'problems_per_day', (
      select json_agg(row_to_json(t))
      from (
        select
          date_trunc('day', created_at)::date as date,
          count(*)::int as count
        from problems
        where created_at >= now() - interval '30 days'
        group by 1 order by 1
      ) t
    ),

    -- Revisions per day — last 30 days
    'revisions_per_day', (
      select json_agg(row_to_json(t))
      from (
        select
          date_trunc('day', reviewed_at)::date as date,
          count(*)::int as count
        from review_logs
        where reviewed_at >= now() - interval '30 days'
        group by 1 order by 1
      ) t
    ),

    -- Platform breakdown
    'platform_breakdown', (
      select json_agg(row_to_json(t))
      from (
        select platform, count(*)::int as count
        from problems
        group by platform
      ) t
    ),

    -- Guest-to-registered conversion rate:
    -- guests who have since become registered (is_anonymous = false but
    -- were created as anonymous — detected via app_metadata)
    -- Simple approximation: any user who upgraded would now be is_anonymous=false
    -- We track conversion rate as: registered / (registered + current_guests)
    'conversion_rate_pct', (
      select round(
        100.0 * count(*) filter (where is_anonymous = false) /
        nullif(count(*), 0), 1
      )
      from auth.users
    )
  ) into result;

  return result;
end;
$$;

-- Grant execute to authenticated (anon key) users
grant execute on function public.admin_get_stats() to authenticated;
grant execute on function public.admin_get_stats() to anon;
