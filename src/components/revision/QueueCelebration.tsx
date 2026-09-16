import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useStreak } from '../../hooks/useStreak';

interface QueueCelebrationProps {
  onResetSession?: () => void;
}

export const QueueCelebration: React.FC<QueueCelebrationProps> = () => {
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const streak = useStreak();

  useEffect(() => {
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#4F46E5', '#10B981', '#F59E0B'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto saas-card p-8 text-center flex flex-col items-center">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200/80 dark:border-emerald-800/40">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
        Revision Queue Complete
      </h2>
      <p className="text-xs text-neutral-500 dark:text-dark-textMuted max-w-sm mb-6 leading-relaxed">
        All due problems for today have been reviewed. Spaced repetition intervals have been recalculated for optimal long-term retention.
      </p>

      {/* Summary Stats */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-center">
          <div className="text-xl font-bold text-neutral-900 dark:text-white">
            {streak.currentStreak}d
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Active Streak
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-center">
          <div className="text-xl font-bold text-neutral-900 dark:text-white">
            {streak.todayCount}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Reviewed Today
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
        <button
          onClick={() => openAddPanel()}
          className="w-full btn-primary flex items-center justify-center gap-1.5 text-xs py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Next Problem</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className="w-full btn-secondary flex items-center justify-center gap-1.5 text-xs py-2"
        >
          <span>Problem Bank</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
