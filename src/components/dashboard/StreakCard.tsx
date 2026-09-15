import React from 'react';
import { useStreak } from '../../hooks/useStreak';
import { Flame, CheckCircle2, Clock } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';

export const StreakCard: React.FC = () => {
  const streak = useStreak();
  const profile = useProblemStore((s) => s.profile);

  return (
    <div className="saas-card p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
            Consistency Streak
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-center text-amber-500">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {streak.currentStreak}
          </h2>
          <span className="text-xs text-neutral-500 dark:text-dark-textMuted">
            consecutive day{streak.currentStreak === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-dark-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
          {streak.isTodayDone ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Goal: {streak.todayCount}/{profile.daily_goal} today</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Revise today to advance</span>
            </>
          )}
        </div>

        <div className="text-neutral-500 dark:text-dark-textMuted text-[11px]">
          Best: {streak.longestStreak}d
        </div>
      </div>
    </div>
  );
};
