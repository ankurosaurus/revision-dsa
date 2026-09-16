import React from 'react';
import { LayoutDashboard, Brain, Layers, Plus, BarChart3 } from 'lucide-react';
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-t border-neutral-200 dark:border-dark-border px-3 flex items-center justify-around">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Dash</span>
      </button>

      <button
        onClick={() => setActiveTab('queue')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium relative transition-colors ${
          activeTab === 'queue'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Brain className="w-4 h-4" />
        <span>Queue</span>
        {dueCount > 0 && (
          <span className="absolute top-0.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
        )}
      </button>

      {/* Primary Center Add Button */}
      <button
        onClick={openAddPanel}
        className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs hover:bg-brand-700 transition-colors"
        title="Add Problem"
      >
        <Plus className="w-4 h-4" strokeWidth={2.4} />
      </button>

      <button
        onClick={() => setActiveTab('all')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
          activeTab === 'all'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Bank</span>
      </button>

      <button
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-colors ${
          activeTab === 'stats'
            ? 'text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Stats</span>
      </button>
    </nav>
  );
};
