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

  // Teal functional accent steps for practice/growth
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#171B24] border-[#222735]';
    if (count <= 2) return 'bg-[#24463F] border-[#315F56]';
    if (count <= 4) return 'bg-[#356B60] border-[#428477]';
    if (count <= 6) return 'bg-[#43887B] border-[#4F9C8D]';
    return 'bg-[#4F9C8D] border-[#6BBBAA]';
  };

  return (
    <div className="saas-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-paper-primary">
            Daily practice consistency
          </h3>
          <p className="text-xs text-paper-secondary mt-0.5">
            {totalInPeriod} problem revisions across {activeDays} active days in the last 16 weeks
          </p>
        </div>

        {/* Minimalist Legend with Teal steps */}
        <div className="flex items-center gap-1.5 text-xs text-paper-muted">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#171B24] border border-[#222735]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#24463F]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#356B60]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#4F9C8D]" />
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
