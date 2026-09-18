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
      <div className="bg-surface border border-graphite-hairline rounded-xl p-5 flex flex-col justify-between shadow-deck">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-paper-muted">
            Due today
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-base border border-graphite-hairline flex items-center justify-center text-ochre">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary">
            {dueToday}
          </div>
          <p className="text-xs text-paper-muted mt-0.5">
            {dueToday > 0 ? 'Problems awaiting review' : 'Queue clear'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('queue')}
          className="btn-ochre w-full py-1.5 text-xs flex items-center justify-center font-medium"
        >
          <span>Start queue</span>
        </button>
      </div>

      {/* Due This Week */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-5 flex flex-col justify-between shadow-deck">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-paper-muted">
            Due this week
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-base border border-graphite-hairline flex items-center justify-center text-paper-muted">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary">
            {dueThisWeek}
          </div>
          <p className="text-xs text-paper-muted mt-0.5">
            Next 7 calendar days
          </p>
        </div>

        <div className="text-xs text-paper-muted pt-2 border-t border-graphite-hairline">
          SM-2 interval schedule
        </div>
      </div>

      {/* Total Problems */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-5 flex flex-col justify-between shadow-deck">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-paper-muted">
            Total logged
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-base border border-graphite-hairline flex items-center justify-center text-teal">
            <Bookmark className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary">
            {totalCount}
          </div>
          <p className="text-xs text-paper-muted mt-0.5">
            Catalog and custom entries
          </p>
        </div>

        <button
          onClick={() => setActiveTab('all')}
          className="text-xs font-medium text-teal hover:underline flex items-center gap-1 text-left"
        >
          <span>View all problems</span>
        </button>
      </div>

      {/* Mastered */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-5 flex flex-col justify-between shadow-deck">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-paper-muted">
            Mastered
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-base border border-graphite-hairline flex items-center justify-center text-teal">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2.5">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary">
            {masteredCount}
          </div>
          <p className="text-xs text-paper-muted mt-0.5">
            {totalCount > 0
              ? `${Math.round((masteredCount / totalCount) * 100)}% long-term retention`
              : '0% rate'}
          </p>
        </div>

        <div className="text-xs text-paper-muted pt-2 border-t border-graphite-hairline">
          5+ successful reviews
        </div>
      </div>
    </div>
  );
};
