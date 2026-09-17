import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from './store/useUIStore';
import { useProblemStore } from './store/useProblemStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RevisionQueuePage } from './pages/RevisionQueuePage';
import { AllProblemsPage } from './pages/AllProblemsPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CatalogPage } from './pages/CatalogPage';
import { AdminPage } from './pages/AdminPage';
import { WelcomePage } from './pages/WelcomePage';
import { initPostHog, identifyUser } from './lib/analytics';
import { BookOpen } from 'lucide-react';

// Initialize PostHog once (no-op if VITE_POSTHOG_KEY is not set)
initPostHog();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// ── Full-screen loading spinner ───────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-neutral-50 dark:bg-dark-bg">
    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse">
      <BookOpen className="w-5 h-5 text-white" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">RevisionDSA</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">Restoring your session…</p>
    </div>
  </div>
);

function AppContent() {
  const activeTab = useUIStore((s) => s.activeTab);
  const theme = useUIStore((s) => s.theme);
  const fetchProblems = useProblemStore((s) => s.fetchProblems);
  const { session, user, loading } = useAuth();

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch problems when session is available
  useEffect(() => {
    if (session) fetchProblems();
  }, [session, fetchProblems]);

  // Identify user in PostHog after login (skip for guests — they're anonymous)
  useEffect(() => {
    if (user && !user.is_anonymous) {
      identifyUser(user.id, user.email ?? undefined);
    }
  }, [user]);

  if (loading) return <LoadingScreen />;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'queue':     return <RevisionQueuePage />;
      case 'all':       return <AllProblemsPage />;
      case 'stats':     return <StatsPage />;
      case 'settings':  return <SettingsPage />;
      case 'catalog':   return <CatalogPage />;
      case 'admin':     return <AdminPage />;
      default:          return <DashboardPage />;
    }
  };

  // ── No session (neither Supabase nor Guest) → show WelcomePage ────────────
  if (!session) return <WelcomePage />;

  // ── Authenticated session (Guest, Email, or OAuth) → render app ───────────
  return <AppLayout>{renderActivePage()}</AppLayout>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        {/* Vercel Analytics — zero config, activates on Vercel deploy */}
        <Analytics />
        {/* Vercel Speed Insights — tracks real-world load perf */}
        <SpeedInsights />
      </AuthProvider>
    </QueryClientProvider>
  );
}
