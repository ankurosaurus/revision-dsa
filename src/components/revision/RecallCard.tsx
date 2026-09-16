import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem, RecallRating } from '../../types';
import { PlatformBadge } from '../problems/PlatformBadge';
import { DifficultyBadge } from '../problems/DifficultyBadge';
import { isProblemOverdue, getDaysUntilDue, calculateSM2 } from '../../lib/spacedRepetition';
import { ExternalLink, Eye, RotateCcw, Check, Sparkles, ChevronDown } from 'lucide-react';

interface RecallCardProps {
  problem: Problem;
  onRate: (rating: RecallRating) => void;
}

export const RecallCard: React.FC<RecallCardProps> = ({ problem, onRate }) => {
  const [isNotesRevealed, setIsNotesRevealed] = useState(false);
  const isOverdue = isProblemOverdue(problem.next_review_date);
  const daysUntil = getDaysUntilDue(problem.next_review_date);

  useEffect(() => {
    setIsNotesRevealed(false);
  }, [problem.id]);

  const sm2Again = calculateSM2(problem, 'again');
  const sm2Hard = calculateSM2(problem, 'hard');
  const sm2Good = calculateSM2(problem, 'good');
  const sm2Easy = calculateSM2(problem, 'easy');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsNotesRevealed((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        onRate('again');
      } else if (e.key === '2') {
        e.preventDefault();
        onRate('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        onRate('good');
      } else if (e.key === '4') {
        e.preventDefault();
        onRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate]);

  return (
    <motion.div
      key={problem.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto saas-card p-6 sm:p-8 flex flex-col shadow-sm"
    >
      {/* Platform, Difficulty & Due status */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={problem.platform} size="md" />
          <DifficultyBadge difficulty={problem.difficulty} size="sm" />
        </div>

        <div>
          {isOverdue ? (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40">
              Overdue ({Math.abs(daysUntil)}d)
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40">
              Due Today
            </span>
          )}
        </div>
      </div>

      {/* Main Title & Open Link */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {problem.title}
          </h2>

          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Problem in new tab"
            className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Open Problem</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Tags */}
      {problem.tags && problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-600 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Active Recall Area */}
      <div className="w-full mb-6">
        <AnimatePresence mode="wait">
          {!isNotesRevealed ? (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-dashed border-neutral-200 dark:border-dark-border p-6 text-center bg-neutral-50/60 dark:bg-dark-bg/40 flex flex-col items-center justify-center min-h-[140px]"
            >
              <Eye className="w-6 h-6 text-neutral-400 mb-2" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Active Recall Mode
              </p>
              <p className="text-xs text-neutral-500 dark:text-dark-textMuted max-w-sm mb-3">
                Recall your solution, data structures, and edge cases before checking notes.
              </p>

              <button
                type="button"
                onClick={() => setIsNotesRevealed(true)}
                className="btn-secondary text-xs flex items-center gap-2"
              >
                <span>Reveal Approach & Notes</span>
                <kbd className="text-[10px] bg-neutral-100 dark:bg-dark-surfaceHover px-1.5 py-0.5 rounded border border-neutral-200 dark:border-dark-border">
                  Space
                </kbd>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-bg p-5 min-h-[140px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  Approach & Key Intuition
                </span>
                <button
                  onClick={() => setIsNotesRevealed(false)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-600"
                >
                  Hide
                </button>
              </div>

              {problem.notes ? (
                <div className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {problem.notes}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  No notes saved for this problem.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SM-2 Recall Rating Bar */}
      <div className="pt-4 border-t border-neutral-100 dark:border-dark-border">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-dark-textMuted mb-2.5">
          <span>Rate recall to schedule next revision:</span>
          <span className="hidden sm:inline">Keys: [1] [2] [3] [4]</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Again: reset to 1d */}
          <button
            type="button"
            onClick={() => onRate('again')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40 transition-colors"
          >
            <div className="flex items-center gap-1 font-semibold text-xs">
              <RotateCcw className="w-3 h-3" />
              <span>Again (1)</span>
            </div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              +{sm2Again.interval_days}d
            </div>
          </button>

          {/* Hard: 1.2x */}
          <button
            type="button"
            onClick={() => onRate('hard')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40 transition-colors"
          >
            <div className="flex items-center gap-1 font-semibold text-xs">
              <span>Hard (2)</span>
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              +{sm2Hard.interval_days}d
            </div>
          </button>

          {/* Good: SM-2 */}
          <button
            type="button"
            onClick={() => onRate('good')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-dark-border transition-colors"
          >
            <div className="flex items-center gap-1 font-semibold text-xs">
              <Check className="w-3 h-3 text-neutral-500" />
              <span>Good (3)</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              +{sm2Good.interval_days}d
            </div>
          </button>

          {/* Easy: SM-2 boosted */}
          <button
            type="button"
            onClick={() => onRate('easy')}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 transition-colors"
          >
            <div className="flex items-center gap-1 font-semibold text-xs">
              <Sparkles className="w-3 h-3" />
              <span>Easy (4)</span>
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              +{sm2Easy.interval_days}d
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
