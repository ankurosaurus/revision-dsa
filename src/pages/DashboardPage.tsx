import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';
import { MemoryCurveSimulator } from '../components/interactive/MemoryCurveSimulator';
import { FeatureShowcase } from '../components/interactive/FeatureShowcase';
import { PlatformDonutChart } from '../components/dashboard/PlatformDonutChart';
import { TagRadarChart } from '../components/dashboard/TagRadarChart';
import { ReviewHeatmap } from '../components/dashboard/ReviewHeatmap';
import { ProblemCard } from '../components/problems/ProblemCard';
import { isProblemDue, getDaysUntilDue } from '../../src/lib/spacedRepetition';
import { useStreak } from '../hooks/useStreak';
import {
  Plus,
  ArrowRight,
  Flame,
  Clock,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const addEssentialProblems = useProblemStore((s) => s.addEssentialProblems);
  const profile = useProblemStore((s) => s.profile);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const streak = useStreak();

  const [isAddingEssentials, setIsAddingEssentials] = useState(false);

  const handleAddEssentials = async () => {
    setIsAddingEssentials(true);
    try {
      await addEssentialProblems();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } finally {
      setIsAddingEssentials(false);
    }
  };

  const dueProblems = problems.filter((p) => isProblemDue(p.next_review_date));
  const dueThisWeek = problems.filter((p) => {
    const days = getDaysUntilDue(p.next_review_date);
    return days >= 0 && days <= 7;
  }).length;
  const masteredCount = problems.filter((p) => p.repetitions >= 5).length;
  const recentProblems = problems.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* 1. Hero Statement & Visual Centerpiece */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-full border border-brand-200/80 dark:border-brand-800/40 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SDE Placement Preparation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.12]">
              Never forget an algorithm you've solved.
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
              RevisionDSA locks problems into your long-term memory through SM-2 spaced repetition. Code once on LeetCode, GFG, or Codeforces — recall instinctively on interview day.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAddPanel}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Problem</span>
            </button>
            {dueProblems.length > 0 && (
              <button
                onClick={() => setActiveTab('queue')}
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <span>Review Queue ({dueProblems.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Centerpiece: Interactive Memory Curve Simulator */}
        <MemoryCurveSimulator />
      </section>

      {/* 2. Full-Width Editorial Metrics Strip (Not disjointed cards!) */}
      <section className="p-6 rounded-2xl bg-neutral-100/70 dark:bg-dark-surface/60 border border-neutral-200/80 dark:border-dark-border grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-dark-border">
        {/* Streak */}
        <div className="pt-3 md:pt-0 md:pr-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-dark-textMuted font-medium mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Consistency Streak</span>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {streak.currentStreak}d
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {streak.isTodayDone ? 'Today completed' : 'Revise today to advance'}
          </div>
        </div>

        {/* Due Today */}
        <div className="pt-3 md:pt-0 md:px-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-dark-textMuted font-medium mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-600" />
            <span>Due for Recall</span>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {dueProblems.length}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {dueProblems.length > 0 ? (
              <button
                onClick={() => setActiveTab('queue')}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Launch revision queue →
              </button>
            ) : (
              'All caught up today'
            )}
          </div>
        </div>

        {/* Due This Week */}
        <div className="pt-3 md:pt-0 md:px-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-dark-textMuted font-medium mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Due This Week</span>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {dueThisWeek}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Scheduled across 7 days
          </div>
        </div>

        {/* Mastered */}
        <div className="pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-dark-textMuted font-medium mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mastered (5+ Reps)</span>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {masteredCount}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {problems.length > 0
              ? `${Math.round((masteredCount / problems.length) * 100)}% long-term retention`
              : '0% rate'}
          </div>
        </div>
      </section>

      {/* 3. Interactive Feature Switchboard Showcase */}
      <section className="space-y-4">
        <FeatureShowcase />
      </section>

      {/* 4. Analytics & Consistency Visualization */}
      <section className="space-y-4">
        <ReviewHeatmap />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlatformDonutChart problems={problems} />
          <TagRadarChart problems={problems} />
        </div>
      </section>

      {/* 5. Problem Bank & Quick Revision Jump */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              {dueProblems.length > 0 ? 'Urgent Revisions Due' : 'Recent Problem Bank'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-dark-textMuted">
              {dueProblems.length > 0
                ? 'These problems are scheduled for revision today based on your SM-2 intervals.'
                : 'Your recently logged interview problems across LeetCode, GFG, and Codeforces.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab(dueProblems.length > 0 ? 'queue' : 'all')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>{dueProblems.length > 0 ? 'Start Review Session' : 'View All Problems'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {problems.length === 0 ? (
          <div className="editorial-surface p-8 sm:p-10 text-center flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 dark:border-dark-border bg-gradient-to-b from-white to-neutral-50 dark:from-dark-surface dark:to-dark-bg">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>

            <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Start Your Spaced Repetition Problem Bank
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mb-6 leading-relaxed">
              Don't start from an empty sheet. Seed your revision queue with 5 high-yield essential interview problems tested by top product companies.
            </p>

            {/* 5 Essential Problems Preview Badges */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-6">
              {[
                { title: '1. Two Sum', tag: 'Arrays & Hashing' },
                { title: '2. Reverse Linked List', tag: 'Linked List' },
                { title: '3. Valid Parentheses', tag: 'Stack' },
                { title: '4. Binary Search', tag: 'Binary Search' },
                { title: '5. Maximum Subarray', tag: 'DP & Kadane' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.title}</span>
                  <span className="text-[10px] text-neutral-400">({item.tag})</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAddEssentials}
                disabled={isAddingEssentials}
                className="btn-primary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isAddingEssentials ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-300 fill-current" />
                )}
                <span>Quick Start: Add 5 essential problems</span>
              </button>

              <button
                type="button"
                onClick={openAddPanel}
                className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Log Custom Problem</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dueProblems.length > 0 ? dueProblems.slice(0, 3) : recentProblems).map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onSelectForReview={() => setActiveTab('queue')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
