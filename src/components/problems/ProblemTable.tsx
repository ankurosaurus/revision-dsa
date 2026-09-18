import React from 'react';
import { Problem } from '../../types';
import { PlatformBadge } from './PlatformBadge';
import { DifficultyBadge } from './DifficultyBadge';
import { isProblemDue, isProblemOverdue, getDaysUntilDue } from '../../lib/spacedRepetition';
import { ExternalLink, Trash2, Code2 } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';
import { useUIStore } from '../../store/useUIStore';

interface ProblemTableProps {
  problems: Problem[];
  onSelectForReview?: (problem: Problem) => void;
  onRemove?: (problem: Problem) => void;
  onSolve?: (problem: Problem) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  onSelectForReview,
  onRemove,
  onSolve,
}) => {
  const deleteProblem = useProblemStore((s) => s.deleteProblem);
  const openSolveView = useUIStore((s) => s.openSolveView);

  if (problems.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-surface-border bg-surface shadow-xs">
      <table className="w-full text-left text-xs font-sans">
        <thead className="bg-surface-subtle border-b border-surface-border text-paper-secondary font-medium">
          <tr>
            <th className="py-2.5 px-4 font-medium">Problem</th>
            <th className="py-2.5 px-3 font-medium">Platform</th>
            <th className="py-2.5 px-3 font-medium">Difficulty</th>
            <th className="py-2.5 px-3 font-medium">Archetypes</th>
            <th className="py-2.5 px-3 font-medium text-center">Reps</th>
            <th className="py-2.5 px-3 font-medium text-center">Interval</th>
            <th className="py-2.5 px-3 font-medium">Next Review</th>
            <th className="py-2.5 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {problems.map((problem) => {
            const isDue = isProblemDue(problem.next_review_date);
            const isOverdue = isProblemOverdue(problem.next_review_date);
            const daysUntil = getDaysUntilDue(problem.next_review_date);
            const isMastered = problem.repetitions >= 5;

            return (
              <tr
                key={problem.id}
                className="hover:bg-surface-hover/70 transition-colors group"
              >
                {/* Title in Fraunces serif */}
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => onSolve ? onSolve(problem) : openSolveView(problem)}
                    className="font-serif text-sm font-normal text-paper-primary hover:text-teal transition-colors inline-flex items-center gap-1.5 text-left"
                    title="Click to open Solve Workspace"
                  >
                    <span>{problem.title}</span>
                  </button>
                </td>

                {/* Platform */}
                <td className="py-3 px-3">
                  <PlatformBadge platform={problem.platform} size="sm" showLabel={false} />
                </td>

                {/* Difficulty */}
                <td className="py-3 px-3">
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                </td>

                {/* Tags */}
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {problem.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="text-[11px] text-paper-muted self-center">
                        +{problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Reps */}
                <td className="py-3 px-3 text-center text-paper-primary font-medium tabular-nums">
                  {problem.repetitions}
                </td>

                {/* Interval */}
                <td className="py-3 px-3 text-center text-paper-secondary tabular-nums">
                  {problem.interval_days}d
                </td>

                {/* Next Review */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {isOverdue ? (
                    <span className="text-ochre font-medium">
                      Overdue ({Math.abs(daysUntil)}d)
                    </span>
                  ) : isDue ? (
                    <span className="text-paper-primary font-medium">Due today</span>
                  ) : isMastered ? (
                    <span className="text-teal font-medium">Mastered</span>
                  ) : (
                    <span className="text-paper-muted tabular-nums">In {daysUntil}d</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => onSolve ? onSolve(problem) : openSolveView(problem)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-teal/10 text-teal border border-teal/30 hover:bg-teal/20 transition-colors"
                      title="Open in Solve Workspace"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Solve</span>
                    </button>

                    {isDue && onSelectForReview && (
                      <button
                        onClick={() => onSelectForReview(problem)}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-ochre/15 text-ochre border border-ochre/30 hover:bg-ochre/25 transition-colors"
                      >
                        Review
                      </button>
                    )}

                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md text-paper-muted hover:text-paper-primary transition-colors"
                      title="Open problem URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        if (onRemove) {
                          onRemove(problem);
                        } else {
                          deleteProblem(problem.id);
                        }
                      }}
                      className="p-1.5 rounded-md text-paper-muted hover:text-ochre transition-colors"
                      title="Remove from revision list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
