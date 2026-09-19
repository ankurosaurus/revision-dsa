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
    <div className="group bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card hover:border-[#D1D0CB] transition-colors">
      {/* Top Header: Platform, Difficulty & Review Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PlatformBadge platform={problem.platform} size="sm" />
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>

          <div>
            {isOverdue ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#C25B5B]/10 text-[#C25B5B] border border-[#C25B5B]/20">
                Overdue ({Math.abs(daysUntil)}d)
              </span>
            ) : isDue ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]">
                Due today
              </span>
            ) : isMastered ? (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#5A9367]/10 text-[#5A9367] border border-[#5A9367]/20">
                Mastered
              </span>
            ) : (
              <span className="text-[12px] text-[#8E8E93]">
                Due in {daysUntil}d
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-medium text-[#1C1C1E] mb-2 line-clamp-1">
          {problem.title}
        </h3>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]"
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
              className="inline-flex items-center gap-1 text-[12px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              <span>{showNotes ? 'Hide notes' : 'View notes'}</span>
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.8} /> : <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.8} />}
            </button>

            {showNotes && (
              <div className="mt-2 p-3 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] text-[13px] text-[#6E6E73] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {problem.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-[#E5E4E0] flex items-center justify-between gap-3 text-[12px]">
        {/* Subtle Metadata */}
        <div className="flex items-center gap-3 text-[#8E8E93]">
          <span className="inline-flex items-center gap-1" title="Interval in days">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>{problem.interval_days}d</span>
          </span>
          <span className="inline-flex items-center gap-1" title="Repetitions completed">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>{problem.repetitions} reps</span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSolve ? onSolve(problem) : openSolveView(problem)}
            className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] bg-[#FAFAF8] text-[#1C1C1E] hover:bg-[#F7F7F5] border border-[#E5E4E0] transition-colors inline-flex items-center gap-1"
            title="Open in Solve Workspace"
          >
            <Code2 className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Solve</span>
          </button>

          {onSelectForReview && isDue && (
            <button
              onClick={() => onSelectForReview(problem)}
              className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] bg-[#2D5A6B] text-white hover:bg-[#234754] transition-colors"
            >
              Review
            </button>
          )}

          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open original problem in new tab"
            className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.8} />
          </a>

          <button
            onClick={handleDelete}
            title="Remove from problem bank"
            className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#C25B5B] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
};
