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

  // Restrained desaturated teal-blue (#2D5A6B) steps
  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-[#F4F4F0] border-[#E5E4E0]';
    if (count <= 2) return 'bg-[#2D5A6B]/20 border-[#2D5A6B]/30';
    if (count <= 4) return 'bg-[#2D5A6B]/40 border-[#2D5A6B]/50';
    if (count <= 6) return 'bg-[#2D5A6B]/70 border-[#2D5A6B]/80 text-white';
    return 'bg-[#2D5A6B] border-[#2D5A6B] text-white';
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-[#1C1C1E]">
            Daily Practice Consistency
          </h3>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            {totalInPeriod} problem revisions across {activeDays} active days in the last 16 weeks
          </p>
        </div>

        {/* Minimalist Legend with Desaturated Teal steps */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#8E8E93]">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#F4F4F0] border border-[#E5E4E0]" />
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#2D5A6B]/20 border border-[#2D5A6B]/30" />
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#2D5A6B]/40 border border-[#2D5A6B]/50" />
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#2D5A6B]" />
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
                  className={`w-3 h-3 rounded-[3px] border transition-transform hover:scale-125 cursor-pointer ${getCellColor(
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
