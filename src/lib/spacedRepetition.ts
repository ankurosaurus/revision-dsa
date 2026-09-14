import { Problem, RecallRating, InitialConfidence, SM2Result } from '../types';

export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.5;
export const MAX_INTERVAL_DAYS = 180;

/**
 * Format a Date object to YYYY-MM-DD string in local time
 */
export function formatDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a given YYYY-MM-DD string or current date
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + Math.max(1, Math.round(days)));
  return formatDate(date);
}

/**
 * Check if a problem is due for review today or overdue
 */
export function isProblemDue(nextReviewDate: string): boolean {
  const today = formatDate();
  return nextReviewDate <= today;
}

/**
 * Check if a problem is strictly overdue (due before today)
 */
export function isProblemOverdue(nextReviewDate: string): boolean {
  const today = formatDate();
  return nextReviewDate < today;
}

/**
 * Calculate difference in days between target date and today
 */
export function getDaysUntilDue(nextReviewDate: string): number {
  const today = formatDate();
  if (nextReviewDate === today) return 0;
  
  const [ty, tm, td] = today.split('-').map(Number);
  const [ry, rm, rd] = nextReviewDate.split('-').map(Number);
  
  const todayDate = new Date(ty, tm - 1, td);
  const reviewDate = new Date(ry, rm - 1, rd);
  
  const diffTime = reviewDate.getTime() - todayDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates initial SM-2 parameters based on initial confidence rating
 */
export function getInitialSM2(confidence: InitialConfidence): SM2Result {
  const today = formatDate();

  switch (confidence) {
    case 'struggled':
      return {
        ease_factor: 2.3,
        interval_days: 1,
        repetitions: 0,
        next_review_date: addDaysToDate(today, 1),
      };
    case 'hints':
      return {
        ease_factor: 2.4,
        interval_days: 1,
        repetitions: 0,
        next_review_date: addDaysToDate(today, 1),
      };
    case 'independent':
      return {
        ease_factor: 2.5,
        interval_days: 2,
        repetitions: 1,
        next_review_date: addDaysToDate(today, 2),
      };
    case 'instant':
      return {
        ease_factor: 2.65,
        interval_days: 4,
        repetitions: 1,
        next_review_date: addDaysToDate(today, 4),
      };
    default:
      return {
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        next_review_date: today,
      };
  }
}

/**
 * Calculates updated SM-2 parameters according to the specification:
 * - "Again" (quality 0-1): reset repetitions to 0, interval_days to 1, decrease ease_factor by 0.2 (min 1.3)
 * - "Hard" (quality 2-3): interval_days = interval_days * 1.2, decrease ease_factor slightly (-0.15)
 * - "Good" (quality 4): interval_days = interval_days * ease_factor, increment repetitions
 * - "Easy" (quality 5): interval_days = interval_days * ease_factor * 1.3, increase ease_factor by 0.15, increment repetitions
 * - Cap max interval at 180 days.
 * - Compute next_review_date = today + interval_days.
 */
export function calculateSM2(problem: Problem, rating: RecallRating): SM2Result {
  let { ease_factor, interval_days, repetitions } = problem;
  const today = formatDate();

  switch (rating) {
    case 'again': {
      repetitions = 0;
      interval_days = 1;
      ease_factor = Math.max(MIN_EASE_FACTOR, ease_factor - 0.2);
      break;
    }
    case 'hard': {
      // Hard: interval * 1.2, ease_factor - 0.15
      interval_days = Math.max(1, Math.round(interval_days * 1.2));
      ease_factor = Math.max(MIN_EASE_FACTOR, ease_factor - 0.15);
      // repetitions not reset, but not advanced as aggressively
      break;
    }
    case 'good': {
      // Good: interval * ease_factor, increment reps
      if (repetitions === 0) {
        interval_days = 1;
      } else if (repetitions === 1) {
        interval_days = Math.max(2, Math.round(interval_days * ease_factor));
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetitions += 1;
      break;
    }
    case 'easy': {
      // Easy: interval * ease_factor * 1.3, ease_factor + 0.15, increment reps
      if (repetitions === 0) {
        interval_days = 3;
      } else {
        interval_days = Math.round(interval_days * ease_factor * 1.3);
      }
      ease_factor = Math.min(MAX_EASE_FACTOR, ease_factor + 0.15);
      repetitions += 1;
      break;
    }
  }

  // Cap interval at 180 days
  interval_days = Math.min(MAX_INTERVAL_DAYS, Math.max(1, interval_days));

  // Round ease_factor to 2 decimal places for clean storage
  ease_factor = Math.round(ease_factor * 100) / 100;

  const next_review_date = addDaysToDate(today, interval_days);

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review_date,
  };
}
