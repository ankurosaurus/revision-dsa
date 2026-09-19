import React from 'react';
import { Problem } from '../../types';
import { isProblemDue, getDaysUntilDue } from '../../lib/spacedRepetition';
import { Clock, CheckCircle2, Bookmark, Award } from 'lucide-react';
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
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6E6E73]">
            Due Today
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#C4923A]/10 border border-[#C4923A]/20 flex items-center justify-center text-[#C4923A]">
            <Clock className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight">
            {dueToday}
          </div>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            {dueToday > 0 ? 'Problems awaiting review' : 'Queue is clear'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('queue')}
          className="btn-primary w-full py-1.5 text-[13px] flex items-center justify-center font-medium"
        >
          <span>Start Queue</span>
        </button>
      </div>

      {/* Due This Week */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6E6E73]">
            Due This Week
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] flex items-center justify-center text-[#6E6E73]">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight">
            {dueThisWeek}
          </div>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            Next 7 calendar days
          </p>
        </div>

        <div className="text-[12px] text-[#8E8E93] pt-2 border-t border-[#E5E4E0]">
          SM-2 interval schedule
        </div>
      </div>

      {/* Total Problems */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6E6E73]">
            Total Logged
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] flex items-center justify-center text-[#2D5A6B]">
            <Bookmark className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight">
            {totalCount}
          </div>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            Active revision bank
          </p>
        </div>

        <button
          onClick={() => setActiveTab('all')}
          className="text-[13px] font-medium text-[#2D5A6B] hover:underline flex items-center gap-1 text-left"
        >
          <span>View All Problems</span>
        </button>
      </div>

      {/* Mastered */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#6E6E73]">
            Mastered
          </span>
          <div className="w-8 h-8 rounded-[8px] bg-[#5A9367]/10 border border-[#5A9367]/20 flex items-center justify-center text-[#5A9367]">
            <Award className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        <div className="my-3">
          <div className="text-[28px] font-semibold text-[#1C1C1E] tracking-tight">
            {masteredCount}
          </div>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            {totalCount > 0
              ? `${Math.round((masteredCount / totalCount) * 100)}% long-term retention`
              : '0% retention'}
          </p>
        </div>

        <div className="text-[12px] text-[#8E8E93] pt-2 border-t border-[#E5E4E0]">
          5+ successful reviews
        </div>
      </div>
    </div>
  );
};
