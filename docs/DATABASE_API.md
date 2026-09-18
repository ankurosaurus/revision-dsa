# Database Functions & RPC Documentation

## 1. `admin_get_stats()`
Security-definer RPC function that compiles aggregate user and problem metrics.
- **Permissions:** Restricted to callers with `profiles.is_admin = true`
- **Returns:**
  - `total_users`: Total user count
  - `registered_users`: Accounts with email / OAuth
  - `guest_users`: Anonymous guest sessions
  - `signups_per_day`: 30-day registration trend
  - `platform_breakdown`: LeetCode vs GFG vs Codeforces distribution

## 2. `handle_new_user()`
Trigger on `auth.users` that automatically creates an entry in `public.profiles`.
