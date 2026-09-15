import React from 'react';
import { Problem } from '../../types';
import { isProblemDue, getDaysUntilDue } from '../../lib/spacedRepetition';
import { ArrowRight, Clock, CheckCircle2, Bookmark, Award } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

interface QuickStatsCardsProps {
  problems: Problem[];
}

export const QuickStatsCards: React.FC<QuickStatsCardsProps> = ({ problems }) => {
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const dueToday = problems.filter((p) => isProblemDue(p.next_review_date)).length;
  const dueThisWeek = problems.filter((p) => {
    const days = getDaysUntilDue(p.next_review_date);
    return days >= 0 && days <= 7;
  }).length;
  const masteredCount = problems.filter((p) => p.repetitions >= 5).length;
  const totalCount = problems.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Due Today Card */}
      <div className="saas-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
            Due Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {dueToday}
          </div>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            {dueToday > 0 ? 'Problems awaiting review' : 'No revisions due today'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('queue')}
          className="btn-primary w-full py-1.5 text-xs flex items-center justify-center gap-1.5"
        >
          <span>Start Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Due This Week */}
      <div className="saas-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
            Due This Week
          </span>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {dueThisWeek}
          </div>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Next 7 calendar days
          </p>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-dark-border">
          SM-2 interval schedule
        </div>
      </div>

      {/* Total Problems */}
      <div className="saas-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
            Total Logged
          </span>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <Bookmark className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {totalCount}
          </div>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            LeetCode, GFG & CF
          </p>
        </div>

        <button
          onClick={() => setActiveTab('all')}
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 text-left"
        >
          <span>View all problems</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Mastered */}
      <div className="saas-card p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
            Mastered
          </span>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            {masteredCount}
          </div>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            {totalCount > 0
              ? `${Math.round((masteredCount / totalCount) * 100)}% long-term retention`
              : '0% rate'}
          </p>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-dark-border">
          5+ successful reviews
        </div>
      </div>
    </div>
  );
};
