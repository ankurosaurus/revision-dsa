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
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Revision Analytics
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-textMuted mt-0.5">
          Metrics on retention rates, consistency streaks, and algorithmic pattern mastery.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              Current Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {streak.currentStreak} <span className="text-xs font-normal text-neutral-500">days</span>
          </div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
            Personal best: {streak.longestStreak} days
          </div>
        </div>

        {/* Total Reviews */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              Total Reviews
            </span>
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {reviewLogs.length}
          </div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
            {streak.todayCount} completed today
          </div>
        </div>

        {/* Average Ease Factor */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              Average Ease Factor
            </span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {avgEase}
          </div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
            Baseline: 2.50 (higher = easier recall)
          </div>
        </div>

        {/* Long-term Mastered */}
        <div className="saas-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              Mastery Rate
            </span>
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-2">
            {totalProblems > 0 ? `${Math.round((masteredCount / totalProblems) * 100)}%` : '0%'}
          </div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
            {masteredCount} of {totalProblems} problems (5+ reps)
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
      <div className="saas-card p-6">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>SM-2 Spaced Repetition Principle</span>
        </h3>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4 leading-relaxed">
          The SuperMemo-2 (SM-2) algorithm calculates the optimal memory spacing for algorithmic problem retention, actively preventing the Ebbinghaus forgetting curve before placement interviews:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
            <span className="text-rose-700 dark:text-rose-400 font-semibold block mb-1">Again (1)</span>
            <span className="text-neutral-500 dark:text-dark-textMuted leading-relaxed block">
              Reset repetitions to 0 and schedule review for tomorrow (1 day).
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
            <span className="text-amber-700 dark:text-amber-400 font-semibold block mb-1">Hard (2)</span>
            <span className="text-neutral-500 dark:text-dark-textMuted leading-relaxed block">
              Struggled with edge cases. Multiplies interval by 1.2x.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
            <span className="text-neutral-900 dark:text-white font-semibold block mb-1">Good (3)</span>
            <span className="text-neutral-500 dark:text-dark-textMuted leading-relaxed block">
              Standard successful recall. Multiplies interval by current ease factor.
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold block mb-1">Easy (4)</span>
            <span className="text-neutral-500 dark:text-dark-textMuted leading-relaxed block">
              Instant recall. Applies 1.3x booster and increments ease factor.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
