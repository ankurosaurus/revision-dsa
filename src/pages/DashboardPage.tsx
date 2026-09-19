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
        colors: ['#2D5A6B', '#5A9367'],
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Header & Direct Action */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[13px] text-[#2D5A6B] font-medium mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A6B]" />
            <span>Spaced Repetition Practice Ledger</span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#1C1C1E] tracking-tight leading-tight">
            Retention and Practice Ledger
          </h1>
          <p className="text-[14px] text-[#6E6E73] mt-1 leading-relaxed">
            Deliberate spaced repetition for interview algorithms. Review problems according to SuperMemo SM-2 decay intervals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={openAddPanel}
            className="btn-secondary text-[13px] flex items-center gap-1.5 py-2 px-3.5"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            <span>Log Problem</span>
          </button>
          {dueProblems.length > 0 ? (
            <button
              onClick={() => setActiveTab('queue')}
              className="btn-primary text-[13px] flex items-center gap-1.5 py-2 px-4 font-medium"
            >
              <span>Start Reviewing ({dueProblems.length})</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('queue')}
              className="btn-secondary text-[13px] py-2 px-3.5 text-[#6E6E73]"
            >
              <span>Queue Clear</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Restrained Metric Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Due Today Anchor */}
        <div className="lg:col-span-7 p-6 rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${dueProblems.length > 0 ? 'text-[#C4923A]' : 'text-[#8E8E93]'}`} strokeWidth={1.8} />
                <span className="text-[13px] font-medium text-[#6E6E73]">
                  Due for Review Today
                </span>
              </div>
              {dueProblems.length > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#C4923A]/10 text-[#C4923A] border border-[#C4923A]/25">
                  Needs Attention
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-[36px] font-semibold text-[#1C1C1E] tracking-tight">
                {dueProblems.length}
              </span>
              <span className="text-[13px] text-[#6E6E73]">
                {dueProblems.length === 1 ? 'problem due now' : 'problems due now'}
              </span>
            </div>

            <p className="text-[13px] text-[#6E6E73] leading-relaxed max-w-md mt-1">
              {dueProblems.length > 0
                ? 'These problems have reached their SM-2 review threshold. Prompt mental reconstruction before checking notes.'
                : 'Queue is clear. Next scheduled reviews arrive according to your retention curve.'}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5E4E0] flex items-center justify-between">
            {dueProblems.length > 0 ? (
              <button
                onClick={() => setActiveTab('queue')}
                className="text-[13px] font-medium text-[#2D5A6B] hover:underline flex items-center gap-1"
              >
                <span>Launch revision session</span>
              </button>
            ) : (
              <span className="text-[13px] text-[#8E8E93]">All scheduled reviews up to date</span>
            )}
            <span className="text-[12px] text-[#8E8E93]">{dueThisWeek} scheduled over next 7 days</span>
          </div>
        </div>

        {/* Supporting Anchor: Streak & Consistency */}
        <div className="lg:col-span-5 p-6 rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#C4923A]" strokeWidth={1.8} />
                <span className="text-[13px] font-medium text-[#6E6E73]">
                  Consistency Streak
                </span>
              </div>
              <span className="text-[12px] text-[#8E8E93]">Best: {streak.longestStreak}d</span>
            </div>

            <div className="flex items-baseline gap-2.5 my-2">
              <span className="text-[36px] font-semibold text-[#1C1C1E] tracking-tight">
                {streak.currentStreak}
              </span>
              <span className="text-[13px] text-[#6E6E73]">
                consecutive day{streak.currentStreak === 1 ? '' : 's'}
              </span>
            </div>

            <p className="text-[13px] text-[#6E6E73] leading-relaxed mt-1">
              {streak.isTodayDone
                ? 'Daily review completed. Consistency locks algorithmic patterns into long-term recall.'
                : 'Complete one review session today to maintain your consecutive practice record.'}
            </p>
          </div>

          {/* Compact secondary metrics strip */}
          <div className="pt-4 mt-4 border-t border-[#E5E4E0] grid grid-cols-2 gap-4">
            <div>
              <span className="text-[12px] text-[#8E8E93] block">Problems Tracked</span>
              <span className="text-[16px] font-medium text-[#1C1C1E]">{problems.length}</span>
            </div>
            <div>
              <span className="text-[12px] text-[#8E8E93] block">Mastered (5+ reps)</span>
              <span className="text-[16px] font-medium text-[#5A9367]">
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
            <h3 className="text-[17px] font-medium text-[#1C1C1E]">
              {dueProblems.length > 0 ? 'Problems Due for Review' : 'Recent Problem Bank'}
            </h3>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">
              {dueProblems.length > 0
                ? 'Scheduled based on your past recall ratings and SM-2 ease factors.'
                : 'Recently solved problems across LeetCode, GeeksforGeeks, and Codeforces.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab(dueProblems.length > 0 ? 'queue' : 'all')}
            className="text-[13px] font-medium text-[#2D5A6B] hover:underline"
          >
            <span>{dueProblems.length > 0 ? 'Start Review Session' : 'View All Problems'}</span>
          </button>
        </div>

        {problems.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] shadow-card">
            <div className="w-10 h-10 rounded-[10px] bg-[#FAFAF8] border border-[#E5E4E0] flex items-center justify-center text-[#2D5A6B] mb-3">
              <BookOpen className="w-5 h-5" strokeWidth={1.8} />
            </div>

            <h4 className="text-[17px] font-medium text-[#1C1C1E] mb-1">
              Start your spaced repetition problem bank
            </h4>
            <p className="text-[13px] text-[#6E6E73] max-w-md mb-5 leading-relaxed">
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
                  className="px-3 py-1.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] text-[13px] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5A9367]" strokeWidth={1.8} />
                  <span className="font-medium text-[#1C1C1E]">{item.title}</span>
                  <span className="text-[11px] text-[#8E8E93]">({item.tag})</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleAddEssentials}
                disabled={isAddingEssentials}
                className="btn-primary text-[13px] py-2 px-4 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {isAddingEssentials ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Plus className="w-4 h-4" strokeWidth={2} />
                )}
                <span>Add 5 starter problems</span>
              </button>

              <button
                type="button"
                onClick={openAddPanel}
                className="btn-secondary text-[13px] py-2 px-4 flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-4 h-4" strokeWidth={1.8} />
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
