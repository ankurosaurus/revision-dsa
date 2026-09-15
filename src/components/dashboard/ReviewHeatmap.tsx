import React, { useMemo } from 'react';
import { useProblemStore } from '../../store/useProblemStore';
import { formatDate } from '../../lib/spacedRepetition';

export const ReviewHeatmap: React.FC = () => {
  const reviewLogs = useProblemStore((s) => s.reviewLogs);

  // Generate calendar grid for the past 16 weeks (112 days)
  const { weeks, totalInPeriod, activeDays } = useMemo(() => {
    const activityMap = new Map<string, number>();
    for (const log of reviewLogs) {
      const dStr = formatDate(new Date(log.reviewed_at));
      activityMap.set(dStr, (activityMap.get(dStr) || 0) + 1);
    }

    const today = new Date();
    const dayOfWeek = today.getDay();
    const totalDays = 16 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - (dayOfWeek + 1)));

    const generatedWeeks: { dateStr: string; count: number; dayIndex: number }[][] = [];
    let currentWeek: { dateStr: string; count: number; dayIndex: number }[] = [];
    let activeDayCount = 0;
    let totalReviewsCount = 0;

    const walker = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const dStr = formatDate(walker);
      const count = activityMap.get(dStr) || 0;
      if (count > 0) {
        activeDayCount++;
        totalReviewsCount += count;
      }

      currentWeek.push({
        dateStr: dStr,
        count,
        dayIndex: walker.getDay(),
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }

      walker.setDate(walker.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      totalInPeriod: totalReviewsCount,
      activeDays: activeDayCount,
    };
  }, [reviewLogs]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-neutral-100 dark:bg-dark-surfaceHover border-neutral-200/50 dark:border-dark-border';
    if (count <= 2) return 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/40';
    if (count <= 4) return 'bg-indigo-300 dark:bg-indigo-800/80 border-indigo-400/80 dark:border-indigo-700/60';
    if (count <= 6) return 'bg-indigo-500 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-500';
    return 'bg-indigo-700 dark:bg-indigo-500 border-indigo-800 dark:border-indigo-400';
  };

  return (
    <div className="saas-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Daily Revision Consistency
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-0.5">
            {totalInPeriod} problem revisions across {activeDays} active days in the last 16 weeks
          </p>
        </div>

        {/* Minimalist Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-neutral-100 dark:bg-dark-surfaceHover border border-neutral-200 dark:border-dark-border" />
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-200 dark:bg-indigo-950/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-400 dark:bg-indigo-800/80" />
          <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 dark:bg-indigo-600" />
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1 min-w-max">
          {weeks.map((week, wIndex) => (
            <div key={`week-${wIndex}`} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.count} revision${day.count === 1 ? '' : 's'}`}
                  className={`w-3 h-3 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${getCellColor(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
