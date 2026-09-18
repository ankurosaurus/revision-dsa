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
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-ochre/15 text-ochre border border-ochre/30">
                Overdue ({Math.abs(daysUntil)}d)
              </span>
            ) : isDue ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border">
                Due today
              </span>
            ) : isMastered ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal/10 text-teal border border-teal/30">
                Mastered
              </span>
            ) : (
              <span className="text-xs font-normal text-paper-muted">
                Due in {daysUntil}d
              </span>
            )}
          </div>
        </div>

        {/* Title in Fraunces serif */}
        <h3 className="font-serif text-base text-paper-primary font-normal mb-2 group-hover:text-teal transition-colors line-clamp-1">
          {problem.title}
        </h3>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border"
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
              className="inline-flex items-center gap-1 text-xs text-paper-muted hover:text-paper-primary transition-colors font-medium"
            >
              <span>{showNotes ? 'Hide notes' : 'View notes'}</span>
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showNotes && (
              <div className="mt-2 p-3 rounded-lg bg-surface-subtle border border-surface-border text-xs text-paper-secondary whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {problem.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3 text-xs">
        {/* Subtle Metadata with clean numbers */}
        <div className="flex items-center gap-3 text-paper-muted">
          <span className="inline-flex items-center gap-1" title="Interval in days">
            <Calendar className="w-3.5 h-3.5" />
            <span>{problem.interval_days}d</span>
          </span>
          <span className="inline-flex items-center gap-1" title="Repetitions completed">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{problem.repetitions} reps</span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSolve ? onSolve(problem) : openSolveView(problem)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-teal/10 text-teal hover:bg-teal/20 border border-teal/30 transition-colors inline-flex items-center gap-1"
            title="Open in Solve Workspace"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Solve</span>
          </button>

          {onSelectForReview && isDue && (
            <button
              onClick={() => onSelectForReview(problem)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-ochre/15 text-ochre hover:bg-ochre/25 border border-ochre/30 transition-colors"
            >
              Review
            </button>
          )}

          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original problem in new tab"
            className="p-1 rounded-md text-paper-muted hover:text-paper-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleDelete}
            title="Remove from problem bank"
            className="p-1 rounded-md text-paper-muted hover:text-ochre transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
