import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from './store/useUIStore';
import { useProblemStore } from './store/useProblemStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { initPostHog, identifyUser, track } from './lib/analytics';
import { BookOpen } from 'lucide-react';

// ── Lazy-loaded Route Chunks ──────────────────────────────────────────────────
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const RevisionQueuePage = lazy(() => import('./pages/RevisionQueuePage').then((m) => ({ default: m.RevisionQueuePage })));
const AllProblemsPage = lazy(() => import('./pages/AllProblemsPage').then((m) => ({ default: m.AllProblemsPage })));
const StatsPage = lazy(() => import('./pages/StatsPage').then((m) => ({ default: m.StatsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const WelcomePage = lazy(() => import('./pages/WelcomePage').then((m) => ({ default: m.WelcomePage })));
const SolveView = lazy(() => import('./components/solve/SolveView').then((m) => ({ default: m.SolveView })));

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
  <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-graphite-base">
    <div className="w-10 h-10 rounded-xl bg-surface border border-graphite-hairline flex items-center justify-center shadow-deck">
      <BookOpen className="w-5 h-5 text-teal animate-pulse" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-serif font-bold text-paper-primary">RevisionDSA</p>
      <p className="text-xs text-paper-muted">Preparing deliberate practice lab…</p>
    </div>
  </div>
);

function AppContent() {
  const activeTab = useUIStore((s) => s.activeTab);
  const theme = useUIStore((s) => s.theme);
  const solveProblem = useUIStore((s) => s.solveProblem);
  const closeSolveView = useUIStore((s) => s.closeSolveView);
  const problems = useProblemStore((s) => s.problems);
  const fetchProblems = useProblemStore((s) => s.fetchProblems);
  const loadStarterPack = useProblemStore((s) => s.loadStarterPack);
  const { session, user, loading } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

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
    if (session) {
      fetchProblems();
    } else if (problems.length === 0) {
      // In demo mode without session, pre-populate sample problems so visitor sees the tracker working
      loadStarterPack();
    }
  }, [session, fetchProblems, loadStarterPack, problems.length]);

  // Identify user in PostHog after login (skip for guests — they're anonymous)
  useEffect(() => {
    if (user && !user.is_anonymous) {
      identifyUser(user.id, user.email ?? undefined);
    }
  }, [user]);

  // PostHog Funnel: landing_page_viewed, page_load_complete, and first_interaction
  useEffect(() => {
    track('landing_page_viewed', {
      referrer: document.referrer || 'direct',
      path: window.location.pathname,
    });

    track('page_load_complete', {
      load_time_ms: Math.round(performance.now()),
    });

    const handleFirstInteraction = (e: Event) => {
      track('first_interaction', {
        type: e.type,
        target: (e.target as HTMLElement)?.tagName,
      });
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

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

  // If user opened a problem in Integrated Solve View
  if (solveProblem) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <SolveView problem={solveProblem} onClose={closeSolveView} />
      </Suspense>
    );
  }

  // If visitor is not authenticated and has explicitly opened auth
  if (!session && showAuthModal) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <WelcomePage
          onClose={() => setShowAuthModal(false)}
          onExploreDemo={() => setShowAuthModal(false)}
        />
      </Suspense>
    );
  }

  // If visitor has no session, render in Public Interactive Demo Mode (eliminates 88% bounce rate)
  const isDemoMode = !session;

  return (
    <AppLayout isDemo={isDemoMode} onOpenAuthModal={() => setShowAuthModal(true)}>
      <Suspense fallback={<LoadingScreen />}>
        {renderActivePage()}
      </Suspense>
    </AppLayout>
  );
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
