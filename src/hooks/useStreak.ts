import { useMemo } from 'react';
import { useProblemStore } from '../store/useProblemStore';
import { formatDate } from '../lib/spacedRepetition';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  todayCount: number;
  totalReviews: number;
  flameLevel: 1 | 2 | 3 | 4 | 5;
  flameColor: string;
  isTodayDone: boolean;
}

export function useStreak(): StreakInfo {
  const reviewLogs = useProblemStore((s) => s.reviewLogs);

  return useMemo(() => {
    if (!reviewLogs || reviewLogs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        todayCount: 0,
        totalReviews: 0,
        flameLevel: 1,
        flameColor: '#C4923A',
        isTodayDone: false,
      };
    }

    const todayStr = formatDate();

    // Map unique review dates
    const reviewDates = new Set<string>();
    let todayCount = 0;

    for (const log of reviewLogs) {
      const dateStr = formatDate(new Date(log.reviewed_at));
      reviewDates.add(dateStr);
      if (dateStr === todayStr) {
        todayCount++;
      }
    }

    const isTodayDone = todayCount > 0;

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date();
    
    // If not reviewed today, streak starts testing from yesterday
    if (!isTodayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = formatDate(checkDate);
      if (reviewDates.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedDates = Array.from(reviewDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const [y, m, d] = dStr.split('-').map(Number);
      const currDate = new Date(y, m - 1, d);

      if (prevDate) {
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = currDate;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Flame intensity level
    let flameLevel: 1 | 2 | 3 | 4 | 5 = 1;
    let flameColor = '#C4923A';

    if (currentStreak >= 21) {
      flameLevel = 5;
      flameColor = '#D4A045';
    } else if (currentStreak >= 14) {
      flameLevel = 4;
      flameColor = '#C4923A';
    } else if (currentStreak >= 7) {
      flameLevel = 3;
      flameColor = '#C4923A';
    } else if (currentStreak >= 3) {
      flameLevel = 2;
      flameColor = '#B5842F';
    }

    return {
      currentStreak,
      longestStreak,
      todayCount,
      totalReviews: reviewLogs.length,
      flameLevel,
      flameColor,
      isTodayDone,
    };
  }, [reviewLogs]);
}
