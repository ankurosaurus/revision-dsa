import { Problem, ReviewLog } from '../types';

export interface MasteryBreakdown {
  novice: number;    // reps 0-1
  learning: number;  // reps 2-4
  mastered: number;  // reps 5+
}

export function computeMastery(problems: Problem[]): MasteryBreakdown {
  const breakdown: MasteryBreakdown = { novice: 0, learning: 0, mastered: 0 };
  for (const p of problems) {
    if (p.repetitions <= 1) breakdown.novice++;
    else if (p.repetitions <= 4) breakdown.learning++;
    else breakdown.mastered++;
  }
  return breakdown;
}

export function computeOverallRetention(logs: ReviewLog[]): number {
  if (logs.length === 0) return 100;
  const successful = logs.filter((l) => l.rating === 'good' || l.rating === 'easy').length;
  return Math.round((successful / logs.length) * 100);
}
