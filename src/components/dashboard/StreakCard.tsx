import React from 'react';
import { useStreak } from '../../hooks/useStreak';
import { Flame, CheckCircle2, Clock } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';

export const StreakCard: React.FC = () => {
  const streak = useStreak();
  const profile = useProblemStore((s) => s.profile);

  return (
    <div className="bg-surface border border-graphite-hairline rounded-xl p-5 flex flex-col justify-between h-full shadow-deck">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-paper-muted">
            Consistency streak
          </span>
          <div className="w-8 h-8 rounded-lg bg-ochre/10 border border-ochre/30 flex items-center justify-center text-ochre">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <h2 className="text-3xl font-serif font-bold text-paper-primary">
            {streak.currentStreak}
          </h2>
          <span className="text-xs text-paper-muted">
            consecutive day{streak.currentStreak === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-graphite-hairline flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-paper-muted">
          {streak.isTodayDone ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
              <span>Goal: {streak.todayCount}/{profile.daily_goal} today</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-ochre" />
              <span>Revise today to advance</span>
            </>
          )}
        </div>

        <div className="text-paper-muted text-xs">
          Best: {streak.longestStreak}d
        </div>
      </div>
    </div>
  );
};
