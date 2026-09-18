import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem, RecallRating } from '../../types';
import { PlatformBadge } from '../problems/PlatformBadge';
import { DifficultyBadge } from '../problems/DifficultyBadge';
import { isProblemOverdue, getDaysUntilDue, calculateSM2 } from '../../lib/spacedRepetition';
import { ExternalLink, Eye, RotateCcw, Check, Sparkles, Code2, BookOpen, Maximize2 } from 'lucide-react';
import { CodeCompiler } from '../compiler/CodeCompiler';
import { useUIStore } from '../../store/useUIStore';

interface RecallCardProps {
  problem: Problem;
  onRate: (rating: RecallRating) => void;
}

export const RecallCard: React.FC<RecallCardProps> = ({ problem, onRate }) => {
  const openSolveView = useUIStore((s) => s.openSolveView);
  const [viewMode, setViewMode] = useState<'flashcard' | 'compiler'>('flashcard');
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
      // Don't trigger shortcuts if user is typing code or text
      if (
        viewMode === 'compiler' ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
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
  }, [onRate, viewMode]);

  return (
    <div className={`w-full ${viewMode === 'compiler' ? 'max-w-4xl' : 'max-w-2xl'} mx-auto deck-stack-wrap`}>
      {/* Visual Stacked Index Cards (peeking behind active card to give physical deck feel) */}
      {viewMode === 'flashcard' && (
        <>
          <div className="deck-card-layer-2" aria-hidden="true" />
          <div className="deck-card-layer-1" aria-hidden="true" />
        </>
      )}

      {/* Main Physical Index Card */}
      <motion.div
        key={problem.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 physical-index-card p-6 sm:p-8 flex flex-col transition-all"
      >
        {/* Card Header: Platform, Difficulty & Due status */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <PlatformBadge platform={problem.platform} size="sm" />
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>

          <div>
            {isOverdue ? (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-ochre/15 text-ochre border border-ochre/30">
                Overdue ({Math.abs(daysUntil)}d)
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface text-paper-secondary border border-surface-border">
                Due today
              </span>
            )}
          </div>
        </div>

        {/* Problem Title in Fraunces serif */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-paper-primary font-normal leading-tight tracking-tight">
              {problem.title}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openSolveView(problem)}
                className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                title="Open full workspace with compiler and problem link"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Solve workspace</span>
              </button>

              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open original problem in new tab"
                className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
              >
                <span>Open</span>
                <ExternalLink className="w-3.5 h-3.5 text-paper-muted" />
              </a>
            </div>
          </div>
        </div>

        {/* Tags / Algorithmic Archetypes */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-normal px-2.5 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mode Switcher: Flashcard vs Code Compiler */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-subtle border border-surface-border w-fit mb-5">
          <button
            type="button"
            onClick={() => setViewMode('flashcard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'flashcard'
                ? 'bg-surface text-paper-primary shadow-xs border border-surface-border'
                : 'text-paper-muted hover:text-paper-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Index card</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('compiler')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'compiler'
                ? 'bg-surface text-paper-primary shadow-xs border border-surface-border'
                : 'text-paper-muted hover:text-paper-primary'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-teal" />
            <span>Code & test</span>
          </button>
        </div>

        {/* Workspace Area: Compiler OR Active Recall Flashcard */}
        {viewMode === 'compiler' ? (
          <div className="w-full mb-6">
            <CodeCompiler problemId={problem.id} problemTitle={problem.title} />
          </div>
        ) : (
          <div className="w-full mb-6 perspective-1000">
            <AnimatePresence mode="wait">
              {!isNotesRevealed ? (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0, rotateX: -15 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 15 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="rounded-xl border border-dashed border-surface-border p-6 text-center bg-surface-subtle/70 flex flex-col items-center justify-center min-h-[160px]"
                >
                  <Eye className="w-5 h-5 text-paper-muted mb-2" />
                  <p className="font-serif text-base text-paper-primary mb-1 font-normal">
                    Mental recall required
                  </p>
                  <p className="text-xs text-paper-secondary max-w-sm mb-4 leading-relaxed font-sans">
                    Mentally reconstruct the data structures, edge cases, and runtime before inspecting your approach notes.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsNotesRevealed(true)}
                    className="btn-secondary text-xs flex items-center gap-2"
                  >
                    <span>Reveal approach notes</span>
                    <kbd className="text-[10px] bg-surface px-1.5 py-0.5 rounded border border-surface-border text-paper-muted">
                      Space
                    </kbd>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, rotateX: 15 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -15 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="rounded-xl border border-surface-border bg-surface-subtle p-6 min-h-[160px]"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2">
                    <span className="text-xs font-medium text-teal">
                      Key intuition & notes
                    </span>
                    <button
                      onClick={() => setIsNotesRevealed(false)}
                      className="text-xs text-paper-muted hover:text-paper-primary transition-colors"
                    >
                      Hide notes
                    </button>
                  </div>

                  {problem.notes ? (
                    <div className="text-xs text-paper-primary whitespace-pre-wrap leading-relaxed font-sans">
                      {problem.notes}
                    </div>
                  ) : (
                    <p className="text-xs text-paper-muted italic">
                      No notes recorded for this problem yet. Add key insights in the solve workspace.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* SM-2 Recall Rating Bar */}
        <div className="pt-4 border-t border-surface-border">
          <div className="flex items-center justify-between text-xs text-paper-secondary mb-3">
            <span>Rate recall to schedule next repetition:</span>
            <span className="hidden sm:inline text-paper-muted">Keys: 1, 2, 3, 4</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Again: reset to 1d */}
            <button
              type="button"
              onClick={() => onRate('again')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-ochre/10 hover:bg-ochre/20 text-ochre border border-ochre/30 transition-colors"
            >
              <div className="flex items-center gap-1 font-medium text-xs">
                <RotateCcw className="w-3 h-3" />
                <span>Needs work (1)</span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                +{sm2Again.interval_days}d
              </div>
            </button>

            {/* Hard: 1.2x */}
            <button
              type="button"
              onClick={() => onRate('hard')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-surface hover:bg-surface-hover text-paper-primary border border-surface-border transition-colors"
            >
              <div className="flex items-center gap-1 font-medium text-xs">
                <span>Struggled (2)</span>
              </div>
              <div className="text-[11px] text-paper-secondary mt-0.5">
                +{sm2Hard.interval_days}d
              </div>
            </button>

            {/* Good: SM-2 */}
            <button
              type="button"
              onClick={() => onRate('good')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-teal/10 hover:bg-teal/20 text-teal border border-teal/30 transition-colors"
            >
              <div className="flex items-center gap-1 font-medium text-xs">
                <Check className="w-3 h-3" />
                <span>Remembered (3)</span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                +{sm2Good.interval_days}d
              </div>
            </button>

            {/* Easy: SM-2 boosted */}
            <button
              type="button"
              onClick={() => onRate('easy')}
              className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-teal text-[#0E1614] hover:bg-teal-hover transition-colors font-medium shadow-xs"
            >
              <div className="flex items-center gap-1 text-xs">
                <Sparkles className="w-3 h-3" />
                <span>Instinctive (4)</span>
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                +{sm2Easy.interval_days}d
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
