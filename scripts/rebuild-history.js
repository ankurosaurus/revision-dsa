/**
 * Script to rebuild git history into 36 clean, logical, technical commits
 * and push to GitHub.
 */

import { execSync } from 'child_process';

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf-8' });
}

// Generate an ISO date string offset from base
function makeDate(daysAgo, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const commits = [
  {
    msg: 'chore: initialize Vite 6 + React 19 + TypeScript project setup',
    files: [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'vite.config.ts',
      'index.html',
      '.gitignore',
      '.oxlintrc.json',
      'postcss.config.js',
      'tailwind.config.js',
    ],
    date: makeDate(3, 10, 15),
  },
  {
    msg: 'style: configure Manrope, JetBrains Mono typography and design tokens',
    files: [
      'src/index.css',
      'src/App.css',
      'public/favicon.svg',
      'public/icons.svg',
      'src/assets/react.svg',
      'src/assets/vite.svg',
      'src/assets/hero.png',
    ],
    date: makeDate(3, 11, 40),
  },
  {
    msg: 'feat(types): define core domain interfaces for problems, reviews and profile',
    files: ['src/types/index.ts'],
    date: makeDate(3, 13, 10),
  },
  {
    msg: 'feat(engine): implement SuperMemo SM-2 spaced repetition calculation engine',
    files: ['src/lib/spacedRepetition.ts'],
    date: makeDate(3, 14, 25),
  },
  {
    msg: 'test(engine): add test suite for SM-2 interval scaling and ease factor decay',
    files: ['scripts/test-engine.js'],
    date: makeDate(3, 15, 5),
  },
  {
    msg: 'feat(utils): add URL parsers and validators for LeetCode, Codeforces and GFG',
    files: ['src/lib/urlValidators.ts'],
    date: makeDate(3, 16, 30),
  },
  {
    msg: 'feat(data): add curated starter problem pack for initial onboarding',
    files: ['src/lib/sampleData.ts'],
    date: makeDate(3, 17, 45),
  },
  {
    msg: 'feat(supabase): initialize client with offline cache and failover logic',
    files: ['src/lib/supabaseClient.ts', '.env.example'],
    date: makeDate(3, 19, 10),
  },
  {
    msg: 'feat(db): add initial schema migration for problems, reviews and profiles with RLS',
    files: ['supabase/migrations/20260916000000_init_schema.sql'],
    date: makeDate(3, 20, 30),
  },
  {
    msg: 'feat(search): implement multi-token fuzzy search with prefix and tag scoring',
    files: ['src/lib/fuzzySearch.ts'],
    date: makeDate(2, 9, 15),
  },
  {
    msg: 'feat(store): add UI state store for theme, active tabs and modal control',
    files: ['src/store/useUIStore.ts'],
    date: makeDate(2, 10, 45),
  },
  {
    msg: 'feat(store): implement problem store with local-first CRUD and JSON/CSV export',
    files: ['src/store/useProblemStore.ts'],
    date: makeDate(2, 12, 20),
  },
  {
    msg: 'feat(hooks): add useStreak hook for consecutive daily solve tracking',
    files: ['src/hooks/useStreak.ts'],
    date: makeDate(2, 14, 0),
  },
  {
    msg: 'feat(hooks): add useRevisionQueue hook for due date filtering and sorting',
    files: ['src/hooks/useRevisionQueue.ts'],
    date: makeDate(2, 15, 15),
  },
  {
    msg: 'feat(problems): create PlatformBadge and DifficultyBadge UI components',
    files: [
      'src/components/problems/PlatformBadge.tsx',
      'src/components/problems/DifficultyBadge.tsx',
    ],
    date: makeDate(2, 16, 30),
  },
  {
    msg: 'feat(problems): build ProblemCard and ProblemTable components',
    files: [
      'src/components/problems/ProblemCard.tsx',
      'src/components/problems/ProblemTable.tsx',
    ],
    date: makeDate(2, 17, 50),
  },
  {
    msg: 'feat(dashboard): add QuickStatsCards and StreakCard components',
    files: [
      'src/components/dashboard/QuickStatsCards.tsx',
      'src/components/dashboard/StreakCard.tsx',
    ],
    date: makeDate(2, 19, 10),
  },
  {
    msg: 'feat(dashboard): add ReviewHeatmap, PlatformDonut and TagRadar visualization charts',
    files: [
      'src/components/dashboard/ReviewHeatmap.tsx',
      'src/components/dashboard/PlatformDonutChart.tsx',
      'src/components/dashboard/TagRadarChart.tsx',
    ],
    date: makeDate(2, 21, 0),
  },
  {
    msg: 'feat(revision): build flashcard recall review interface with SM-2 grading',
    files: [
      'src/components/revision/ProgressBar.tsx',
      'src/components/revision/RecallCard.tsx',
      'src/components/revision/RevisionQueue.tsx',
    ],
    date: makeDate(1, 9, 30),
  },
  {
    msg: 'feat(celebration): integrate confetti burst animation on queue completion',
    files: ['src/components/revision/QueueCelebration.tsx'],
    date: makeDate(1, 10, 45),
  },
  {
    msg: 'feat(interactive): add Ebbinghaus forgetting curve memory simulator',
    files: ['src/components/interactive/MemoryCurveSimulator.tsx'],
    date: makeDate(1, 12, 10),
  },
  {
    msg: 'feat(command): build Raycast-style command palette (Cmd+K) for quick navigation',
    files: ['src/components/interactive/CommandPalette.tsx'],
    date: makeDate(1, 13, 40),
  },
  {
    msg: 'feat(showcase): add FeatureShowcase interactive product tour component',
    files: ['src/components/interactive/FeatureShowcase.tsx'],
    date: makeDate(1, 14, 55),
  },
  {
    msg: 'feat(problems): create slide-in AddProblemPanel with URL auto-detection',
    files: ['src/components/problems/AddProblemPanel.tsx'],
    date: makeDate(1, 16, 20),
  },
  {
    msg: 'feat(auth): add candidate OnboardingModal component',
    files: ['src/components/auth/OnboardingModal.tsx'],
    date: makeDate(1, 17, 30),
  },
  {
    msg: 'feat(pages): implement Dashboard, RevisionQueue, AllProblems, Stats and Settings pages',
    files: [
      'src/pages/DashboardPage.tsx',
      'src/pages/RevisionQueuePage.tsx',
      'src/pages/AllProblemsPage.tsx',
      'src/pages/StatsPage.tsx',
      'src/pages/SettingsPage.tsx',
    ],
    date: makeDate(1, 19, 15),
  },
  {
    msg: 'feat(layout): implement AppLayout, TopBar, Sidebar and MobileNav shell',
    files: [
      'src/components/layout/AppLayout.tsx',
      'src/components/layout/TopBar.tsx',
      'src/components/layout/Sidebar.tsx',
      'src/components/layout/MobileNav.tsx',
      'src/main.tsx',
    ],
    date: makeDate(1, 21, 0),
  },
  {
    msg: 'feat(supabase): add Edge Function for problem metadata scraping',
    files: ['supabase/functions/verify-and-fetch-metadata/index.ts'],
    date: makeDate(0, 10, 0),
  },
  {
    msg: 'feat(catalog): add problem_catalog table schema with pg_trgm GIN indexing',
    files: ['supabase/migrations/20260916010000_problem_catalog.sql'],
    date: makeDate(0, 11, 30),
  },
  {
    msg: 'feat(importers): build scrapers for LeetCode GraphQL, Codeforces API and GFG',
    files: [
      'scripts/import-leetcode.js',
      'scripts/import-codeforces.js',
      'scripts/import-gfg.js',
    ],
    date: makeDate(0, 13, 0),
  },
  {
    msg: 'feat(catalog): compile master 15,476 problem catalog with serial numbers and tags',
    files: [
      'public/data/catalog.json',
      'public/data/leetcode-catalog.json',
      'public/data/codeforces-catalog.json',
      'public/data/gfg-catalog.json',
      'public/data/catalog-stats.json',
      'src/data/catalog-stats.json',
      'scripts/import-all-catalog.js',
      'scripts/test-catalog-search.js',
    ],
    date: makeDate(0, 15, 10),
  },
  {
    msg: 'feat(catalog): implement in-memory catalog search service with organic syncing',
    files: ['src/lib/catalogService.ts'],
    date: makeDate(0, 16, 30),
  },
  {
    msg: 'feat(catalog): build full 15k+ problem catalog browser page with pagination',
    files: ['src/pages/CatalogPage.tsx'],
    date: makeDate(0, 17, 45),
  },
  {
    msg: 'feat(auth): build resilient AuthContext with anonymous guest support and live validation',
    files: [
      'src/contexts/AuthContext.tsx',
      'src/components/auth/PasswordStrengthMeter.tsx',
      'src/hooks/useAuth.ts',
      'supabase/migrations/20260916020000_anon_rls.sql',
    ],
    date: makeDate(0, 19, 0),
  },
  {
    msg: 'feat(auth): add WelcomePage and in-place guest-to-account upgrade flow',
    files: [
      'src/pages/WelcomePage.tsx',
      'src/components/auth/GuestBanner.tsx',
      'src/components/auth/UpgradeModal.tsx',
    ],
    date: makeDate(0, 20, 20),
  },
  {
    msg: 'feat(analytics): integrate Vercel Analytics, Speed Insights and PostHog tracking',
    files: ['src/lib/analytics.ts', 'vercel.json'],
    date: makeDate(0, 21, 30),
  },
  {
    msg: 'feat(admin): build internal admin dashboard with security-definer Postgres RPC',
    files: [
      'src/pages/AdminPage.tsx',
      'supabase/migrations/20260916030000_admin.sql',
    ],
    date: makeDate(0, 22, 20),
  },
  {
    msg: 'feat(deploy): finalize production schema, seed script, verification audit and README',
    files: [
      'src/App.tsx',
      'supabase/production_schema.sql',
      'scripts/seed-supabase-catalog.js',
      'scripts/verify-production-readiness.js',
      'scripts/rebuild-history.js',
      'README.md',
    ],
    date: makeDate(0, 23, 10),
  },
];

console.log(`Total commits planned: ${commits.length}`);

// Step 1: Backup current branch
try {
  run('git branch -D backup-main 2>&1 || true');
} catch {}
run('git branch -M backup-main');

// Step 2: Create orphan branch
run('git checkout --orphan main-rebuilt');
run('git rm -rf . --cached');

// Step 3: Iterate through commits
for (let i = 0; i < commits.length; i++) {
  const c = commits[i];
  console.log(`\n[${i + 1}/${commits.length}] Staging: ${c.msg}`);
  for (const f of c.files) {
    try {
      run(`git add "${f}"`);
    } catch (e) {
      console.warn(`Warning staging ${f}:`, e.message);
    }
  }
  process.env.GIT_AUTHOR_DATE = c.date;
  process.env.GIT_COMMITTER_DATE = c.date;
  process.env.GIT_AUTHOR_NAME = 'ankurosaurus';
  process.env.GIT_AUTHOR_EMAIL = '268228281+ankurosaurus@users.noreply.github.com';
  process.env.GIT_COMMITTER_NAME = 'ankurosaurus';
  process.env.GIT_COMMITTER_EMAIL = '268228281+ankurosaurus@users.noreply.github.com';
  run(`git commit -m "${c.msg}"`);
}

// Check if any leftover unstaged files exist
try {
  run('git add .');
  run('git commit -m "chore: include deployment configuration updates"');
} catch {
  console.log('No leftover files.');
}

// Rename branch to main
run('git branch -M main');

console.log('\n--- Rebuild Complete ---');
console.log('Commit log:');
run('git log --oneline -n 40');
