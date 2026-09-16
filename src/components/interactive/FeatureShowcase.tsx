import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Brain,
  Cpu,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveView = useUIStore((s) => s.setActiveTab);

  const features = [
    {
      id: 'detection',
      index: '01',
      title: 'URL Intelligence',
      tagline: 'Instant regex & metadata parsing across 3 platforms',
      icon: Link2,
      description:
        'Paste any problem link from LeetCode, GeeksforGeeks, or Codeforces. RevisionDSA instantly validates the URL, extracts title & difficulty, tags core patterns, and preserves a clickable canonical link.',
      metricLabel: 'Platforms Supported',
      metricValue: 'LeetCode • GFG • CF',
      actionLabel: 'Try Logging a Problem',
      action: () => openAddPanel(),
    },
    {
      id: 'recall',
      index: '02',
      title: 'Active Recall Flow',
      tagline: 'Enforce mental reconstruction before revealing notes',
      icon: Brain,
      description:
        'Passive reading creates an illusion of competence. RevisionDSA hides your approach notes until prompted, forcing you to mentally reconstruct the algorithm, data structure, and complexity first.',
      metricLabel: 'Interactive Flashcard',
      metricValue: 'Space to Reveal • 1-4 to Rate',
      actionLabel: 'Enter Revision Queue',
      action: () => setActiveView('queue'),
    },
    {
      id: 'sm2',
      index: '03',
      title: 'SM-2 Engine',
      tagline: 'Scientific spaced intervals (1d → 3d → 7d → 21d)',
      icon: Cpu,
      description:
        'Each recall rating dynamically recalculates the SuperMemo-2 ease factor, interval, and next review date. Problems you struggle with repeat quickly; problems you master space out to months.',
      metricLabel: 'Interval Multiplier',
      metricValue: '1.2x to 3.25x Dynamic',
      actionLabel: 'View Analytics',
      action: () => setActiveView('stats'),
    },
    {
      id: 'patterns',
      index: '04',
      title: 'Pattern Matrix',
      tagline: 'Pinpoint weak patterns before technical rounds',
      icon: Layers,
      description:
        'Track performance across 23 core algorithmic patterns (DP, Graph, Trees, Sliding Window). The pattern radar immediately highlights whether you are interview-ready or struggling on specific archetypes.',
      metricLabel: 'Pre-seeded Patterns',
      metricValue: '23 Core Interview Archetypes',
      actionLabel: 'Explore Problem Bank',
      action: () => setActiveView('all'),
    },
  ];

  const current = features[activeTab];
  const CurrentIcon = current.icon;

  return (
    <div className="editorial-surface p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-full border border-brand-200/80 dark:border-brand-800/40">
            Interactive Product Tour
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Designed for SDE Placements
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
          How RevisionDSA Operates
        </h3>
      </div>

      {/* Segmented Feature Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {features.map((feat, idx) => {
          const isSelected = idx === activeTab;
          const Icon = feat.icon;

          return (
            <button
              key={feat.id}
              onClick={() => setActiveTab(idx)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-white dark:bg-dark-surface border-neutral-900 dark:border-white shadow-xs'
                  : 'bg-neutral-50 dark:bg-dark-bg border-neutral-200/80 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold text-neutral-400 dark:text-neutral-500">
                  {feat.index}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400'
                  }`}
                />
              </div>
              <div
                className={`text-xs font-bold truncate ${
                  isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {feat.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-neutral-50 dark:bg-dark-bg border border-neutral-200/80 dark:border-dark-border">
        {/* Left Side: Explanations & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>Feature {current.index}</span>
            <span>•</span>
            <span className="text-brand-600 dark:text-brand-400 font-semibold">{current.tagline}</span>
          </div>

          <h4 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            {current.title}
          </h4>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {current.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block font-medium">
                {current.metricLabel}
              </span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                {current.metricValue}
              </span>
            </div>

            <button
              onClick={current.action}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 self-start"
            >
              <span>{current.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Morphing Preview Graphic */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full bg-white dark:bg-dark-surface rounded-xl p-5 border border-neutral-200/80 dark:border-dark-border shadow-xs"
            >
              {activeTab === 0 && (
                /* Feature 01 Graphic: URL Detection */
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-2 border-b border-neutral-100 dark:border-dark-border">
                    <span>Input Problem URL</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Pattern Match
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-neutral-800 dark:text-neutral-200 truncate">
                    https://leetcode.com/problems/trapping-rain-water/
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
                      <span className="text-neutral-400 block text-[10px]">Platform</span>
                      <span className="font-bold text-amber-500">LeetCode</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
                      <span className="text-neutral-400 block text-[10px]">Extracted Difficulty</span>
                      <span className="font-bold text-rose-500">Hard</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-[11px]">
                    <span className="text-neutral-400 block text-[10px]">Detected Patterns</span>
                    <span className="text-brand-600 dark:text-brand-400 font-semibold">
                      Two Pointers • Stack • Monotonic
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                /* Feature 02 Graphic: Active Recall */
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-dark-border">
                    <span className="text-neutral-400 text-[11px]">Flashcard Active Recall</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold">
                      Medium
                    </span>
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-white text-sm">
                    Course Schedule (Topological Sort)
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-neutral-500">
                    <span className="text-[11px] block">Approach notes hidden</span>
                    <span className="text-[10px] text-brand-600 font-semibold">
                      Press [Space] to reveal intuition & complexity
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                    <div className="p-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/30">Again (1)</div>
                    <div className="p-1 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/30">Hard (2)</div>
                    <div className="p-1 rounded bg-neutral-100 text-neutral-800 dark:bg-dark-surfaceHover">Good (3)</div>
                    <div className="p-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30">Easy (4)</div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                /* Feature 03 Graphic: SM-2 Engine */
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-dark-border text-[11px] text-neutral-400">
                    <span>SM-2 Spaced Interval Expansion</span>
                    <span className="text-brand-600 font-bold">SM-2 Algorithm</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
                      <span className="text-neutral-500">Repetition 1</span>
                      <span className="font-bold text-neutral-900 dark:text-white">Day 1 (+1d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
                      <span className="text-neutral-500">Repetition 2 (Good)</span>
                      <span className="font-bold text-neutral-900 dark:text-white">Day 3 (+2d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border">
                      <span className="text-neutral-500">Repetition 3 (Good)</span>
                      <span className="font-bold text-neutral-900 dark:text-white">Day 8 (+5d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/40">
                      <span className="text-brand-700 dark:text-brand-300 font-semibold">Repetition 4 (Mastered)</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">Day 22 (+14d)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                /* Feature 04 Graphic: Pattern Matrix */
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-dark-border text-[11px] text-neutral-400">
                    <span>Core Pattern Breakdown</span>
                    <span className="text-neutral-500">Interview Readiness</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      { name: 'Dynamic Programming', status: 'Ready (2.85 Ease)', color: 'text-emerald-500' },
                      { name: 'Graphs & BFS/DFS', status: 'Consolidating (2.50 Ease)', color: 'text-indigo-500' },
                      { name: 'Sliding Window', status: 'Needs Review (2.20 Ease)', color: 'text-amber-500' },
                      { name: 'Trie & Backtracking', status: 'Mastered (2.90 Ease)', color: 'text-emerald-500' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border"
                      >
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">{row.name}</span>
                        <span className={`font-semibold ${row.color}`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
