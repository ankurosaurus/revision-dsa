# RevisionDSA — Production Deployment & Operations Guide

**RevisionDSA** is an enterprise-grade, spaced-repetition DSA (Data Structures & Algorithms) revision tracker for engineers preparing for technical interviews.

Powered by:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide Icons
- **Spaced Repetition:** SuperMemo SM-2 Adaptive Algorithm
- **Database & Auth:** Supabase (PostgreSQL with RLS, Auth, Anonymous Guest Sessions, Security-Definer RPCs)
- **Analytics:** Vercel Analytics + Speed Insights (Traffic & Core Web Vitals) & PostHog (Product usage, session recordings)
- **Problem Catalog:** 15,476 curated DSA questions (4,055 LeetCode with #numbers + 11,401 Codeforces with ratings & tags + GeeksforGeeks)

---

## 1. Supabase Production Setup

To migrate from local development to a live cloud Supabase project:

### Step 1: Create a Supabase Project
1. Log into [supabase.com](https://supabase.com/) and click **New Project**.
2. Note down your **Project URL** and **anon public API key** from **Project Settings → API**.

### Step 2: Execute Production Database Schema
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Open [`supabase/production_schema.sql`](./supabase/production_schema.sql), copy its entire contents, paste it into the editor, and click **Run**.
4. This idempotently creates:
   - `pg_trgm` extension for fuzzy text search
   - `profiles` table with automatic user profile creation trigger (`handle_new_user`)
   - `problem_catalog` table with unique constraint and GIN trgm index
   - `problems` table with strict Row Level Security (`auth.uid() = user_id`)
   - `review_logs` table with strict Row Level Security (`auth.uid() = user_id`)
   - `admin_get_stats()` security-definer function for the internal admin dashboard

### Step 3: Enable Anonymous Sign-ins (Guest Mode)
1. Go to **Authentication → Settings** in the Supabase sidebar.
2. Scroll to **Anonymous Sign-ins** and toggle **"Allow anonymous sign-ins"** to **ON**.
3. Click **Save**. This enables zero-friction "Continue as Guest" without form fields.

### Step 4: Configure Google OAuth (Optional)
1. In the Supabase dashboard, go to **Authentication → Providers → Google**.
2. Toggle Google to **Enabled**.
3. Create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Application Type: **Web application**
   - Authorized redirect URI: `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
4. Paste the **Client ID** and **Client Secret** into the Supabase Google Provider settings and click **Save**.

### Step 5: (Optional) Seed 15k Problem Catalog into Postgres
The frontend already bundles the full 15,476 problems in `/data/catalog.json` served via CDN. If you also want all 15k problems populated directly in your Supabase `problem_catalog` table:
```bash
# Add your live credentials to .env.local
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Run the batch seeder
node scripts/seed-supabase-catalog.js
```

---

## 2. Vercel Deployment

### Step 1: Deploy to Vercel
You can deploy using GitHub integration or the Vercel CLI:

#### Option A: Via GitHub (Recommended)
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com/) and click **Add New → Project**.
3. Import your repository. Vercel will auto-detect Vite as the framework.

#### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Step 2: Configure Environment Variables in Vercel
In the Vercel deployment setup (or **Project Settings → Environment Variables**), add:

| Variable Name | Description | Example / Location |
|---|---|---|
| `VITE_SUPABASE_URL` | Live Supabase Project URL | `https://xxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Public API Key | `eyJhbGciOi...` |
| `VITE_POSTHOG_KEY` | PostHog Project API Key | `phc_xxxxxxxxxxxx` |

*Note: `@vercel/analytics` and `@vercel/speed-insights` do not need any environment variables — they automatically activate upon deployment on Vercel.*

### Step 3: Update Supabase Redirect URLs
Once Vercel assigns your production domain (e.g., `https://revision-dsa.vercel.app`):
1. In Supabase, go to **Authentication → URL Configuration**.
2. Set **Site URL** to: `https://your-domain.vercel.app`
3. In **Redirect URLs**, add:
   - `https://your-domain.vercel.app/**`
   - `http://localhost:5173/**` (keeps local development working)
4. Click **Save**.

---

## 3. Post-Deploy Checklist

Keep this checklist handy whenever deploying or updating environments:

- [ ] `supabase/production_schema.sql` executed in Supabase SQL Editor with 0 errors.
- [ ] **Authentication → Settings → Allow anonymous sign-ins** is set to **ON**.
- [ ] Vercel environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POSTHOG_KEY`) saved for Production & Preview.
- [ ] Supabase **Site URL** and **Redirect URLs** set to your production `*.vercel.app` domain.
- [ ] Live app tested in an incognito window:
  - Click **"Continue as Guest"** → confirms immediate dashboard access with Guest Mode banner.
  - Click **"Add Problem"** → search for "#1 Two Sum", select, and save → confirms problem appears on Dashboard.
  - Click **"Review"** in Revision Queue → score recall (Again / Hard / Good / Easy) → confirms SM-2 calculation.
  - Open Supabase **Table Editor** → verifies row inserted in `problems` and `review_logs`.
- [ ] Turn off local dev mode or confirm email bypasses in Supabase (**Authentication → Providers → Email** → confirm **Confirm email** is enabled for production safety).

---

## 4. Where to Check Database Health & Usage

Supabase provides built-in tools for monitoring your database without third-party services:

### 1. Table Editor (`Table Editor` in Supabase sidebar)
- **`problems`**: View live problems logged by users, including difficulty, spaced-repetition intervals (`interval_days`), `ease_factor`, and `next_review_date`.
- **`review_logs`**: View every single review attempt logged, timestamped with recall rating (`again`, `hard`, `good`, `easy`).
- **`profiles`**: View user profile settings, daily goals, and admin flags.
- **`problem_catalog`**: View the global pre-seeded directory of LeetCode, Codeforces, and GFG problems.

### 2. Authentication Users (`Authentication → Users`)
- Provides a master list of all accounts:
  - Registered email users
  - Google OAuth users (badge: `Google`)
  - Guest sessions (badge: `Anonymous`)
- Displays `User UID`, `Created at`, `Last sign in`, and phone/email confirmation status.

### 3. Database Usage & Reports (`Database → Database Usage`)
- **Database Size**: Track storage volume against free-tier limits (500 MB).
- **Disk IO & CPU Utilization**: Track database resource consumption during peak usage.
- **Connection Pooling**: View active client connections.

### 4. Postgres & API Logs (`Logs` in Supabase sidebar)
- **API Logs**: Real-time HTTP log of all requests from client browsers (`/rest/v1/problems`, `/auth/v1/*`).
- **Postgres Logs**: Real-time log of database queries, RLS denials, and syntax/execution errors.

---

## 5. Where to Check Your Stats (The 4 Dashboards)

You have four dedicated dashboards covering every dimension of product health:

| Dashboard | Purpose | What to Look For |
|---|---|---|
| **1. Vercel Dashboard** | Traffic & Site Health | Daily unique visitors, page views, geographic distribution, and Core Web Vitals (LCP, FID, CLS) from Speed Insights. |
| **2. PostHog Dashboard** | User Behavior & Retention | `user_signed_up`, `guest_session_started`, `guest_upgraded_to_account`, `problem_added`, `revision_completed`, `daily_goal_reached`, and session replays with masked text. |
| **3. Supabase Dashboard** | Database & Infrastructure | Database size, active connections, API response times, and Auth user sign-up velocity. |
| **4. Internal Admin Dashboard** (`/admin` in-app) | Product KPIs | Live registered vs. guest breakdown, 30-day signup/problem/review trends, guest conversion rate, and platform breakdown pie chart. |

### How to Access the Internal Admin Dashboard
The in-app `/admin` dashboard is strictly guarded by Row Level Security and profile authorization. To grant yourself admin permissions:

1. Copy your User UID from **Supabase → Authentication → Users**.
2. Run this query in the **Supabase SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET is_admin = true
   WHERE id = '<your-user-uid>';
   ```
3. Refresh the web application. An **Admin** tab with a shield icon will appear in your sidebar navigation.

---

## 6. Production Safety & Security Checklist

- **Row Level Security (RLS)**: Enforced on `profiles`, `problems`, `review_logs`, and `problem_catalog`. Users can strictly only read and mutate rows where `user_id = auth.uid()`.
- **Input Masking in Session Recording**: PostHog session recordings are configured with `maskAllInputs: true` and `maskTextSelector: 'input, textarea'`, guaranteeing that passwords, emails, and sensitive keys are never recorded or transmitted.
- **Client-Side SPA Routing**: `vercel.json` ensures direct URL visits (such as refreshing on `/admin` or `/catalog`) rewrite correctly to `index.html` without 404 errors.
- **Audit Script**: Run `node scripts/verify-production-readiness.js` locally at any time to verify that assets, schemas, and configurations meet production standards.
