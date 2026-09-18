# Changelog

## [v1.1.0] - 2026-09-18

### Added
- **15,476 Problem Catalog**: Full directory of LeetCode, Codeforces, and GeeksforGeeks with serial numbers (#1 Two Sum).
- **Anonymous Guest Mode**: Zero-friction onboarding via Supabase Auth and local session fallback.
- **In-Place Account Upgrade**: Convert guest sessions to permanent email/OAuth accounts with 0% data loss.
- **Analytics Integration**: Vercel Analytics + Speed Insights for traffic; PostHog for product engagement events.
- **Internal Admin Dashboard**: Dedicated `/admin` route guarded by `is_admin` RLS and security-definer Postgres RPC.
- **Bundle Optimization**: Code-split chunking for Recharts and Framer Motion.

### Fixed
- Resolved unclickable WelcomePage buttons when Supabase environment variables are unset.
- Corrected serial number formatting across all LeetCode (#1-#4055) and Codeforces problemsets.
