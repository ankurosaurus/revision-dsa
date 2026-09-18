import React, { useState } from 'react';
import { Problem } from '../../types';
import { PlatformBadge } from './PlatformBadge';
import { DifficultyBadge } from './DifficultyBadge';
import { isProblemDue, isProblemOverdue, getDaysUntilDue } from '../../lib/spacedRepetition';
import { ExternalLink, Trash2, Calendar, RotateCcw, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';
import { useUIStore } from '../../store/useUIStore';

interface ProblemCardProps {
  problem: Problem;
  onSelectForReview?: (problem: Problem) => void;
  onRemove?: (problem: Problem) => void;
  onSolve?: (problem: Problem) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onSelectForReview,
  onRemove,
  onSolve,
}) => {
  const deleteProblem = useProblemStore((s) => s.deleteProblem);
  const openSolveView = useUIStore((s) => s.openSolveView);
  const [showNotes, setShowNotes] = useState(false);

  const isDue = isProblemDue(problem.next_review_date);
  const isOverdue = isProblemOverdue(problem.next_review_date);
  const daysUntil = getDaysUntilDue(problem.next_review_date);
  const isMastered = problem.repetitions >= 5;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(problem);
    } else {
      deleteProblem(problem.id);
    }
  };

  return (
    <div className="group saas-card p-5 flex flex-col justify-between">
      {/* Top Header: Platform, Difficulty & Review Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PlatformBadge platform={problem.platform} size="sm" />
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>

          <div>
            {isOverdue ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40">
                Overdue ({Math.abs(daysUntil)}d)
              </span>
            ) : isDue ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40">
                Due Today
              </span>
            ) : isMastered ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-dark-surfaceHover dark:text-neutral-300 dark:border-dark-border">
                Mastered
              </span>
            ) : (
              <span className="text-[11px] font-medium text-neutral-500 dark:text-dark-textMuted">
                Due in {daysUntil}d
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
          {problem.title}
        </h3>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-600 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Notes */}
        {problem.notes && (
          <div className="mb-3.5">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors font-medium"
            >
              <span>{showNotes ? 'Hide notes' : 'View notes'}</span>
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showNotes && (
              <div className="mt-2 p-3 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {problem.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-neutral-100 dark:border-dark-border flex items-center justify-between gap-3 text-xs">
        {/* Subtle Metadata */}
        <div className="flex items-center gap-3 text-neutral-500 dark:text-dark-textMuted">
          <span className="inline-flex items-center gap-1" title="Interval in days">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            {problem.interval_days}d
          </span>
          <span className="inline-flex items-center gap-1" title="Repetitions completed">
            <RotateCcw className="w-3 h-3 text-neutral-400" />
            {problem.repetitions}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSolve ? onSolve(problem) : openSolveView(problem)}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors inline-flex items-center gap-1"
            title="Open in Solve Workspace"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Solve</span>
          </button>

          {onSelectForReview && isDue && (
            <button
              onClick={() => onSelectForReview(problem)}
              className="px-2 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            >
              Review
            </button>
          )}

          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Original Problem ↗"
            className="btn-secondary px-2 py-1 text-xs inline-flex items-center gap-1 rounded-md"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>

          <button
            onClick={handleDelete}
            title="Remove Problem"
            className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
