import React from 'react';
import { Problem } from '../../types';
import { PlatformBadge } from './PlatformBadge';
import { DifficultyBadge } from './DifficultyBadge';
import { isProblemDue, isProblemOverdue, getDaysUntilDue } from '../../lib/spacedRepetition';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useProblemStore } from '../../store/useProblemStore';

interface ProblemTableProps {
  problems: Problem[];
  onSelectForReview?: (problem: Problem) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({ problems, onSelectForReview }) => {
  const deleteProblem = useProblemStore((s) => s.deleteProblem);

  if (problems.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-neutral-50 dark:bg-dark-bg/60 border-b border-neutral-200 dark:border-dark-border text-neutral-500 dark:text-dark-textMuted font-medium">
          <tr>
            <th className="py-2.5 px-4 font-semibold">Problem</th>
            <th className="py-2.5 px-3 font-semibold">Platform</th>
            <th className="py-2.5 px-3 font-semibold">Difficulty</th>
            <th className="py-2.5 px-3 font-semibold">Patterns</th>
            <th className="py-2.5 px-3 font-semibold text-center">Reps</th>
            <th className="py-2.5 px-3 font-semibold text-center">Interval</th>
            <th className="py-2.5 px-3 font-semibold">Next Review</th>
            <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-dark-border">
          {problems.map((problem) => {
            const isDue = isProblemDue(problem.next_review_date);
            const isOverdue = isProblemOverdue(problem.next_review_date);
            const daysUntil = getDaysUntilDue(problem.next_review_date);
            const isMastered = problem.repetitions >= 5;

            return (
              <tr
                key={problem.id}
                className="hover:bg-neutral-50/80 dark:hover:bg-dark-surfaceHover/80 transition-colors group"
              >
                {/* Title */}
                <td className="py-3 px-4">
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{problem.title}</span>
                  </a>
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
                        className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-600 dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="text-[11px] text-neutral-400 self-center">
                        +{problem.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Reps */}
                <td className="py-3 px-3 text-center text-neutral-800 dark:text-neutral-200 font-medium">
                  {problem.repetitions}
                </td>

                {/* Interval */}
                <td className="py-3 px-3 text-center text-neutral-500 dark:text-dark-textMuted">
                  {problem.interval_days}d
                </td>

                {/* Next Review */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {isOverdue ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      Overdue ({Math.abs(daysUntil)}d)
                    </span>
                  ) : isDue ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Due Today</span>
                  ) : isMastered ? (
                    <span className="text-neutral-600 dark:text-neutral-300 font-medium">Mastered</span>
                  ) : (
                    <span className="text-neutral-500 dark:text-dark-textMuted">In {daysUntil}d</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    {isDue && onSelectForReview && (
                      <button
                        onClick={() => onSelectForReview(problem)}
                        className="px-2 py-1 text-xs font-semibold rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 hover:bg-brand-100 transition-colors"
                      >
                        Review
                      </button>
                    )}

                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
                      title="Open Problem in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${problem.title}"?`)) {
                          deleteProblem(problem.id);
                        }
                      }}
                      className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
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
