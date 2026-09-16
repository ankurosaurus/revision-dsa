import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRevisionQueue } from '../../hooks/useRevisionQueue';
import { ProgressBar } from './ProgressBar';
import { RecallCard } from './RecallCard';
import { QueueCelebration } from './QueueCelebration';
import { CalendarCheck2, Plus, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const RevisionQueue: React.FC = () => {
  const {
    currentProblem,
    totalDue,
    overdueCount,
    completedCount,
    initialCount,
    progress,
    handleReview,
    resetSession,
  } = useRevisionQueue();

  const openAddPanel = useUIStore((s) => s.openAddPanel);

  // If completed current session
  if (totalDue === 0 && completedCount > 0) {
    return (
      <div className="py-6">
        <QueueCelebration onResetSession={resetSession} />
      </div>
    );
  }

  // If queue has 0 problems due
  if (totalDue === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-dark-surfaceHover border border-neutral-200 dark:border-dark-border flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4">
          <CalendarCheck2 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
          Revision Queue is Clear
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-5 leading-relaxed max-w-sm">
          No problems are due for revision right now. Log your recent practice problems or solve new patterns to schedule upcoming reviews.
        </p>
        <button
          onClick={openAddPanel}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Problem</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Revision Queue</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-700 dark:text-neutral-300">
              {totalDue} due
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Active recall mode. Rate your memory accurately to let SM-2 calculate your ideal repetition spacing.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 text-xs font-medium shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{overdueCount} overdue</span>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="saas-card p-4">
        <ProgressBar
          completed={completedCount}
          total={initialCount}
          percentage={progress}
        />
      </div>

      {/* Active Card */}
      <div className="relative min-h-[380px]">
        <AnimatePresence mode="wait">
          {currentProblem && (
            <RecallCard
              key={currentProblem.id}
              problem={currentProblem}
              onRate={handleReview}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
