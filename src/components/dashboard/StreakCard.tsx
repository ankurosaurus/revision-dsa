import React from 'react';
import { useStreak } from '../../hooks/useStreak';
import { Flame, CheckCircle2, Clock } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';

export const StreakCard: React.FC = () => {
  const streak = useStreak();
  const profile = useProblemStore((s) => s.profile);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between h-full shadow-card">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6E6E73]">
            Consistency Streak
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#C4923A]/10 border border-[#C4923A]/20 flex items-center justify-center text-[#C4923A]">
            <Flame className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <div className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight">
            {streak.currentStreak}
          </div>
          <span className="text-[13px] text-[#6E6E73]">
            consecutive day{streak.currentStreak === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#E5E4E0] flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-1.5 text-[#6E6E73]">
          {streak.isTodayDone ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5A9367]" strokeWidth={1.8} />
              <span>Goal: {streak.todayCount}/{profile.daily_goal} today</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-[#C4923A]" strokeWidth={1.8} />
              <span>Revise today to advance</span>
            </>
          )}
        </div>

        <div className="text-[#8E8E93] text-[12px]">
          Best: {streak.longestStreak}d
        </div>
      </div>
    </div>
  );
};
