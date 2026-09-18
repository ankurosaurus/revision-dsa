import React from 'react';
import { LayoutDashboard, Brain, Layers, Plus, Database } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { isProblemDue } from '../../lib/spacedRepetition';

export const MobileNav: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openAddPanel = useUIStore((s) => s.openAddPanel);

  const problems = useProblemStore((s) => s.problems);
  const dueCount = problems.filter((p) => isProblemDue(p.next_review_date)).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-t border-neutral-200 dark:border-dark-border px-2 flex items-center justify-around">
      {/* 1. Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 text-[11px] font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="mt-0.5">Dash</span>
      </button>

      {/* 2. Queue */}
      <button
        onClick={() => setActiveTab('queue')}
        className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 text-[11px] font-medium relative transition-colors ${
          activeTab === 'queue'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Brain className="w-4 h-4" />
        <span className="mt-0.5">Queue</span>
        {dueCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500" />
        )}
      </button>

      {/* 3. Primary Center Add Button */}
      <button
        onClick={openAddPanel}
        className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md hover:bg-brand-700 active:scale-95 transition-all shrink-0"
        title="Add Problem"
      >
        <Plus className="w-5 h-5" strokeWidth={2.4} />
      </button>

      {/* 4. Catalog (15k problems) */}
      <button
        onClick={() => setActiveTab('catalog')}
        className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 text-[11px] font-medium transition-colors ${
          activeTab === 'catalog'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Database className="w-4 h-4" />
        <span className="mt-0.5">Catalog</span>
      </button>

      {/* 5. Bank */}
      <button
        onClick={() => setActiveTab('all')}
        className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 text-[11px] font-medium transition-colors ${
          activeTab === 'all'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="mt-0.5">Bank</span>
      </button>
    </nav>
  );
};
