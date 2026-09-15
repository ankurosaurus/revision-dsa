import { useMemo, useState } from 'react';
import { useProblemStore } from '../store/useProblemStore';
import { Problem, RecallRating } from '../types';
import { isProblemDue, isProblemOverdue } from '../lib/spacedRepetition';

export function useRevisionQueue() {
  const problems = useProblemStore((s) => s.problems);
  const reviewProblem = useProblemStore((s) => s.reviewProblem);

  // Queue of problems due for review
  const queue = useMemo(() => {
    const dueProblems = problems.filter((p) => isProblemDue(p.next_review_date));

    // Sort: overdue first (ascending date: oldest overdue first), then due today
    return dueProblems.sort((a, b) => {
      const aOverdue = isProblemOverdue(a.next_review_date);
      const bOverdue = isProblemOverdue(b.next_review_date);

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return a.next_review_date.localeCompare(b.next_review_date);
    });
  }, [problems]);

  const overdueCount = useMemo(
    () => queue.filter((p) => isProblemOverdue(p.next_review_date)).length,
    [queue]
  );

  const dueTodayCount = queue.length - overdueCount;

  // Session state: initial session queue length to show "6 of 14 due today"
  const [initialCount, setInitialCount] = useState<number>(queue.length);
  const [completedCount, setCompletedCount] = useState<number>(0);

  // Synchronize initialCount if queue expands
  if (queue.length > initialCount && completedCount === 0) {
    setInitialCount(queue.length);
  }

  const currentProblem: Problem | undefined = queue[0];

  const handleReview = async (rating: RecallRating) => {
    if (!currentProblem) return;
    await reviewProblem(currentProblem.id, rating);
    setCompletedCount((prev) => prev + 1);
  };

  const resetSession = () => {
    setInitialCount(queue.length);
    setCompletedCount(0);
  };

  const progress = initialCount > 0 ? Math.min(100, Math.round((completedCount / initialCount) * 100)) : 100;

  return {
    queue,
    currentProblem,
    totalDue: queue.length,
    overdueCount,
    dueTodayCount,
    completedCount,
    initialCount: Math.max(initialCount, queue.length + completedCount),
    progress,
    handleReview,
    resetSession,
  };
}
