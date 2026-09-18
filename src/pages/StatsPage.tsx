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
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary tracking-tight">
          Revision Analytics
        </h1>
        <p className="text-xs sm:text-sm text-paper-muted mt-0.5">
          Metrics on retention rates, consistency streaks, and algorithmic pattern mastery.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-surface border border-graphite-hairline rounded-xl p-5 shadow-deck">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-paper-muted">
              Current streak
            </span>
            <Flame className="w-4 h-4 text-ochre" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary mt-2">
            {streak.currentStreak} <span className="text-xs font-normal text-paper-muted">days</span>
          </div>
          <div className="text-xs text-paper-muted mt-1">
            Personal best: {streak.longestStreak} days
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-surface border border-graphite-hairline rounded-xl p-5 shadow-deck">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-paper-muted">
              Total reviews
            </span>
            <CheckCircle2 className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary mt-2">
            {reviewLogs.length}
          </div>
          <div className="text-xs text-paper-muted mt-1">
            {streak.todayCount} completed today
          </div>
        </div>

        {/* Average Ease Factor */}
        <div className="bg-surface border border-graphite-hairline rounded-xl p-5 shadow-deck">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-paper-muted">
              Average ease factor
            </span>
            <Zap className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary mt-2">
            {avgEase}
          </div>
          <div className="text-xs text-paper-muted mt-1">
            Baseline: 2.50 (higher = easier recall)
          </div>
        </div>

        {/* Long-term Mastered */}
        <div className="bg-surface border border-graphite-hairline rounded-xl p-5 shadow-deck">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-paper-muted">
              Mastery rate
            </span>
            <Brain className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary mt-2">
            {totalProblems > 0 ? `${Math.round((masteredCount / totalProblems) * 100)}%` : '0%'}
          </div>
          <div className="text-xs text-paper-muted mt-1">
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
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h3 className="text-base font-serif font-bold text-paper-primary mb-1.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal" />
          <span>SM-2 Spaced Repetition Principle</span>
        </h3>
        <p className="text-xs text-paper-muted mb-4 leading-relaxed">
          The SuperMemo-2 (SM-2) algorithm calculates the optimal memory spacing for algorithmic problem retention, actively countering the forgetting curve:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-graphite-base border border-graphite-hairline">
            <span className="text-rose-400 font-serif font-semibold block mb-1">Again (1)</span>
            <span className="text-paper-muted leading-relaxed block">
              Reset repetitions to 0 and schedule review for tomorrow (1 day).
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-graphite-base border border-graphite-hairline">
            <span className="text-ochre font-serif font-semibold block mb-1">Hard (2)</span>
            <span className="text-paper-muted leading-relaxed block">
              Struggled with core logic. Multiplies interval by 1.2x.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-graphite-base border border-graphite-hairline">
            <span className="text-paper-primary font-serif font-semibold block mb-1">Good (3)</span>
            <span className="text-paper-muted leading-relaxed block">
              Successful recall. Multiplies interval by current ease factor.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-graphite-base border border-graphite-hairline">
            <span className="text-teal font-serif font-semibold block mb-1">Easy (4)</span>
            <span className="text-paper-muted leading-relaxed block">
              Instinctive recall. Applies 1.3x booster and increments ease factor.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
