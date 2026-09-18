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

  // If queue has 0 problems due (Clean engineering microcopy: "Queue clear. Next review due tomorrow.")
  if (totalDue === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center">
        <div className="w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-paper-muted mb-3.5">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-paper-primary mb-1">
          Queue clear. Next review due tomorrow.
        </h2>
        <p className="text-xs text-paper-secondary mb-5 leading-relaxed max-w-sm">
          All scheduled problems for today have been reviewed. Log new problems you solve to schedule future recall intervals.
        </p>
        <button
          onClick={openAddPanel}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log problem</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl text-paper-primary font-normal">
              Revision queue
            </h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-surface border border-surface-border text-paper-primary tabular-nums">
              {totalDue} due
            </span>
          </div>
          <p className="text-xs text-paper-secondary mt-0.5">
            Active recall mode. Rate your memory accurately to let SM-2 calculate your ideal repetition spacing.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ochre/15 border border-ochre/30 text-ochre text-xs font-medium shrink-0">
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

      {/* Active Card Container */}
      <div className="relative min-h-[380px] pt-2">
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
