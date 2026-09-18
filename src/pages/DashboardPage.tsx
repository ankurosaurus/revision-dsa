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
  Flame,
  Clock,
  CheckCircle2,
  Loader2,
  BookOpen,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const addEssentialProblems = useProblemStore((s) => s.addEssentialProblems);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const streak = useStreak();

  const [isAddingEssentials, setIsAddingEssentials] = useState(false);

  const handleAddEssentials = async () => {
    setIsAddingEssentials(true);
    try {
      await addEssentialProblems();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#4F9C8D', '#C98A3B'],
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
    <div className="max-w-6xl mx-auto space-y-9">
      {/* 1. Header & Direct Action */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-teal mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            <span>Spaced repetition practice ledger</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-paper-primary font-normal tracking-tight leading-tight">
            Retention and practice ledger
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1.5 leading-relaxed">
            Deliberate spaced repetition for interview algorithms. Review problems according to SuperMemo SM-2 decay intervals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={openAddPanel}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log problem</span>
          </button>
          {dueProblems.length > 0 ? (
            <button
              onClick={() => setActiveTab('queue')}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 font-medium"
            >
              <span>Start reviewing ({dueProblems.length})</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('queue')}
              className="btn-secondary text-xs py-2 px-3.5 text-paper-secondary"
            >
              <span>Queue clear</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Asymmetric Metric Anchors (Broke the uniform 4-card grid!) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Primary Anchor: Due Today (Ochre emphasis when active) */}
        <div className={`lg:col-span-7 p-6 sm:p-7 rounded-xl border flex flex-col justify-between transition-all ${
          dueProblems.length > 0
            ? 'bg-surface border-ochre/40 shadow-sm'
            : 'bg-surface border-surface-border'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${dueProblems.length > 0 ? 'text-ochre' : 'text-paper-muted'}`} />
                <span className="text-xs font-medium text-paper-secondary">
                  Due for review today
                </span>
              </div>
              {dueProblems.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-ochre/15 text-ochre border border-ochre/30">
                  Needs attention
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-paper-primary tracking-tight">
                {dueProblems.length}
              </span>
              <span className="text-xs text-paper-secondary">
                {dueProblems.length === 1 ? 'problem due now' : 'problems due now'}
              </span>
            </div>

            <p className="text-xs text-paper-secondary leading-relaxed max-w-md mt-1">
              {dueProblems.length > 0
                ? 'These problems have reached their SM-2 review threshold. Prompt mental reconstruction before checking notes.'
                : 'Queue clear. Next review due tomorrow.'}
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-surface-border flex items-center justify-between">
            {dueProblems.length > 0 ? (
              <button
                onClick={() => setActiveTab('queue')}
                className="text-xs font-medium text-ochre hover:underline flex items-center gap-1"
              >
                <span>Launch revision session</span>
              </button>
            ) : (
              <span className="text-xs text-paper-muted">All scheduled reviews up to date</span>
            )}
            <span className="text-xs text-paper-muted">{dueThisWeek} scheduled over the next 7 days</span>
          </div>
        </div>

        {/* Supporting Anchor: Streak & Consistency */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl border border-surface-border bg-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-ochre" />
                <span className="text-xs font-medium text-paper-secondary">
                  Consistency streak
                </span>
              </div>
              <span className="text-xs text-paper-muted">Best: {streak.longestStreak}d</span>
            </div>

            <div className="flex items-baseline gap-2.5 my-2">
              <span className="font-serif text-4xl sm:text-5xl font-normal text-paper-primary tracking-tight">
                {streak.currentStreak}
              </span>
              <span className="text-xs text-paper-secondary">
                consecutive day{streak.currentStreak === 1 ? '' : 's'}
              </span>
            </div>

            <p className="text-xs text-paper-secondary leading-relaxed mt-1">
              {streak.isTodayDone
                ? 'Daily review completed. Consistency locks algorithmic patterns into long-term recall.'
                : 'Complete one review session today to maintain your consecutive practice record.'}
            </p>
          </div>

          {/* Compact secondary metrics strip inside */}
          <div className="pt-4 mt-4 border-t border-surface-border grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-paper-muted block">Problems tracked</span>
              <span className="text-base font-medium text-paper-primary">{problems.length}</span>
            </div>
            <div>
              <span className="text-[11px] text-paper-muted block">Mastered (5+ reps)</span>
              <span className="text-base font-medium text-teal">
                {masteredCount} {problems.length > 0 && `(${Math.round((masteredCount / problems.length) * 100)}%)`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Memory Curve Simulator */}
      <section className="space-y-4">
        <MemoryCurveSimulator />
      </section>

      {/* 4. Interactive Feature Showcase */}
      <section className="space-y-4">
        <FeatureShowcase />
      </section>

      {/* 5. Analytics & Heatmap */}
      <section className="space-y-4">
        <ReviewHeatmap />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlatformDonutChart problems={problems} />
          <TagRadarChart problems={problems} />
        </div>
      </section>

      {/* 6. Problem Bank & Quick Revision Jump */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-paper-primary font-normal">
              {dueProblems.length > 0 ? 'Problems due for review' : 'Recent problem bank'}
            </h3>
            <p className="text-xs text-paper-secondary mt-0.5">
              {dueProblems.length > 0
                ? 'Scheduled based on your past recall ratings and SM-2 ease factors.'
                : 'Recently solved problems across LeetCode, GeeksforGeeks, and Codeforces.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab(dueProblems.length > 0 ? 'queue' : 'all')}
            className="text-xs font-medium text-teal hover:underline"
          >
            <span>{dueProblems.length > 0 ? 'Start review session' : 'View all problems'}</span>
          </button>
        </div>

        {problems.length === 0 ? (
          <div className="editorial-surface p-8 text-center flex flex-col items-center rounded-xl border border-surface-border bg-surface-subtle">
            <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-teal mb-3">
              <BookOpen className="w-5 h-5" />
            </div>

            <h4 className="font-serif text-lg text-paper-primary font-normal mb-1">
              Start your spaced repetition problem bank
            </h4>
            <p className="text-xs text-paper-secondary max-w-md mb-5 leading-relaxed">
              Seed your queue with 5 foundational interview problems tested across technical screening rounds.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-6">
              {[
                { title: 'Two Sum', tag: 'Arrays & Hashing' },
                { title: 'Reverse Linked List', tag: 'Linked List' },
                { title: 'Valid Parentheses', tag: 'Stack' },
                { title: 'Binary Search', tag: 'Binary Search' },
                { title: 'Maximum Subarray', tag: 'Kadane' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                  <span className="font-medium text-paper-primary">{item.title}</span>
                  <span className="text-[10px] text-paper-muted">({item.tag})</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAddEssentials}
                disabled={isAddingEssentials}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {isAddingEssentials ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add 5 starter problems</span>
              </button>

              <button
                type="button"
                onClick={openAddPanel}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Log custom problem</span>
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
