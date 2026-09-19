import React from 'react';
import { useProblemStore } from '../store/useProblemStore';
import { useStreak } from '../hooks/useStreak';
import { PlatformDonutChart } from '../components/dashboard/PlatformDonutChart';
import { TagRadarChart } from '../components/dashboard/TagRadarChart';
import { ReviewHeatmap } from '../components/dashboard/ReviewHeatmap';
import { Flame, CheckCircle2, Zap, Brain, BookOpen } from 'lucide-react';

export const StatsPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const reviewLogs = useProblemStore((s) => s.reviewLogs);
  const streak = useStreak();

  const totalProblems = problems.length;
  const masteredCount = problems.filter((p) => p.repetitions >= 5).length;
  const avgEase = totalProblems > 0
    ? (problems.reduce((acc, p) => acc + p.ease_factor, 0) / totalProblems).toFixed(2)
    : '2.50';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#1C1C1E]">
          Revision Analytics
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-0.5">
          Metrics on retention rates, consistency streaks, and algorithmic pattern mastery.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6E6E73]">
              Current streak
            </span>
            <Flame className="w-4 h-4 text-[#C4923A]" strokeWidth={1.8} />
          </div>
          <div className="text-[28px] font-semibold text-[#1C1C1E] mt-2 tracking-tight">
            {streak.currentStreak} <span className="text-[13px] font-normal text-[#8E8E93]">days</span>
          </div>
          <div className="text-[12px] text-[#8E8E93] mt-1">
            Personal best: {streak.longestStreak} days
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6E6E73]">
              Total reviews
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#5A9367]" strokeWidth={1.8} />
          </div>
          <div className="text-[28px] font-semibold text-[#1C1C1E] mt-2 tracking-tight">
            {reviewLogs.length}
          </div>
          <div className="text-[12px] text-[#8E8E93] mt-1">
            {streak.todayCount} completed today
          </div>
        </div>

        {/* Average Ease Factor */}
        <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6E6E73]">
              Average ease factor
            </span>
            <Zap className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          </div>
          <div className="text-[28px] font-semibold text-[#1C1C1E] mt-2 tracking-tight">
            {avgEase}
          </div>
          <div className="text-[12px] text-[#8E8E93] mt-1">
            Baseline: 2.50 (higher = easier recall)
          </div>
        </div>

        {/* Long-term Mastered */}
        <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6E6E73]">
              Mastery rate
            </span>
            <Brain className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          </div>
          <div className="text-[28px] font-semibold text-[#5A9367] mt-2 tracking-tight">
            {totalProblems > 0 ? `${Math.round((masteredCount / totalProblems) * 100)}%` : '0%'}
          </div>
          <div className="text-[12px] text-[#8E8E93] mt-1">
            {masteredCount} of {totalProblems} problems (5+ reviews)
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlatformDonutChart problems={problems} />
        <TagRadarChart problems={problems} />
      </div>

      {/* Activity Heatmap */}
      <ReviewHeatmap />

      {/* Spaced Repetition Reference */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h3 className="text-[16px] font-semibold text-[#1C1C1E] mb-1.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          <span>SM-2 Spaced Repetition Principle</span>
        </h3>
        <p className="text-[13px] text-[#6E6E73] mb-4 leading-relaxed">
          The SuperMemo-2 (SM-2) algorithm calculates the optimal memory spacing for algorithmic problem retention, actively countering the forgetting curve:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[13px]">
          <div className="p-3.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0]">
            <span className="text-[#C25B5B] font-medium block mb-1">Again (1)</span>
            <span className="text-[#6E6E73] leading-relaxed block text-[12px]">
              Reset repetitions to 0 and schedule review for tomorrow (1 day).
            </span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0]">
            <span className="text-[#C4923A] font-medium block mb-1">Hard (2)</span>
            <span className="text-[#6E6E73] leading-relaxed block text-[12px]">
              Struggled with core logic. Multiplies interval by 1.2x.
            </span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0]">
            <span className="text-[#1C1C1E] font-medium block mb-1">Good (3)</span>
            <span className="text-[#6E6E73] leading-relaxed block text-[12px]">
              Successful recall. Multiplies interval by current ease factor.
            </span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0]">
            <span className="text-[#5A9367] font-medium block mb-1">Easy (4)</span>
            <span className="text-[#6E6E73] leading-relaxed block text-[12px]">
              Instinctive recall. Applies 1.3x booster and increments ease factor.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
