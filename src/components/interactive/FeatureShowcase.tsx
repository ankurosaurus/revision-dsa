import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Brain,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveView = useUIStore((s) => s.setActiveTab);

  const features = [
    {
      id: 'detection',
      index: '1',
      title: 'URL validation & canonical parsing',
      tagline: 'Instant regex and metadata detection across 3 platforms',
      icon: Link2,
      description:
        'Paste any problem link from LeetCode, GeeksforGeeks, or Codeforces. RevisionDSA validates the URL format, extracts the title and difficulty, tags the algorithmic archetype, and links to the canonical problem statement.',
      metricLabel: 'Platforms supported',
      metricValue: 'LeetCode, GeeksforGeeks, Codeforces',
      actionLabel: 'Log a problem',
      action: () => openAddPanel(),
    },
    {
      id: 'recall',
      index: '2',
      title: 'Active recall flashcard loop',
      tagline: 'Mental reconstruction before notes are revealed',
      icon: Brain,
      description:
        'Passive rereading creates the illusion of competence. RevisionDSA holds back your approach notes until prompted, requiring you to retrieve the invariants, data structures, and edge cases from memory first.',
      metricLabel: 'Card mechanics',
      metricValue: 'Space to reveal, 1–4 to rate',
      actionLabel: 'Open revision queue',
      action: () => setActiveView('queue'),
    },
    {
      id: 'sm2',
      index: '3',
      title: 'Adaptive SM-2 spacing schedule',
      tagline: 'Interval expansion: 1d, 3d, 7d, 21d',
      icon: Cpu,
      description:
        'Each recall rating updates the SuperMemo-2 ease factor, interval, and next due date. Difficult problems reappear promptly; mastered patterns space out over weeks and months.',
      metricLabel: 'Interval multiplier',
      metricValue: '1.2x to 3.25x adaptive',
      actionLabel: 'Inspect analytics',
      action: () => setActiveView('stats'),
    },
    {
      id: 'patterns',
      index: '4',
      title: 'Pattern archetype radar',
      tagline: 'Identify weak algorithmic areas before interviews',
      icon: Layers,
      description:
        'Track performance across core algorithmic archetypes like Dynamic Programming, Graphs, Trees, and Sliding Window. The radar identifies whether your recall is robust or if specific patterns require targeted practice.',
      metricLabel: 'Archetypes tracked',
      metricValue: '23 core interview patterns',
      actionLabel: 'View problem bank',
      action: () => setActiveView('all'),
    },
  ];

  const current = features[activeTab];
  const CurrentIcon = current.icon;

  return (
    <div className="editorial-surface p-6 sm:p-7">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-teal">
            System overview
          </span>
          <span className="text-xs text-paper-muted">
            Engineered for deliberate interview practice
          </span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl text-paper-primary font-normal leading-snug">
          How the revision loop operates
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
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-surface-hover border-teal text-paper-primary shadow-xs'
                  : 'bg-surface-subtle border-surface-border text-paper-secondary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-paper-muted">
                  0{feat.index}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-teal' : 'text-paper-muted'
                  }`}
                />
              </div>
              <div className="text-xs font-medium truncate">
                {feat.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-xl bg-surface-subtle border border-surface-border">
        {/* Left Side: Explanations & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs text-paper-muted">
            <span>Part {current.index}: </span>
            <span className="text-teal font-medium">{current.tagline}</span>
          </div>

          <h4 className="font-serif text-xl text-paper-primary font-normal leading-snug">
            {current.title}
          </h4>

          <p className="text-xs sm:text-sm text-paper-secondary leading-relaxed font-sans">
            {current.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <span className="text-[11px] text-paper-muted block">
                {current.metricLabel}
              </span>
              <span className="text-xs font-medium text-paper-primary">
                {current.metricValue}
              </span>
            </div>

            <button
              onClick={current.action}
              className="btn-secondary text-xs self-start"
            >
              <span>{current.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Preview Graphic */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full bg-surface rounded-xl p-5 border border-surface-border shadow-xs"
            >
              {activeTab === 0 && (
                /* Feature 01 Graphic: URL Detection */
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-paper-secondary text-[11px] pb-2 border-b border-surface-border">
                    <span>Input problem URL</span>
                    <span className="text-teal font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Canonical match
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border text-paper-primary truncate font-mono text-xs">
                    https://leetcode.com/problems/trapping-rain-water/
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-surface-subtle border border-surface-border">
                      <span className="text-paper-muted block text-[10px]">Platform</span>
                      <span className="font-medium text-paper-primary">LeetCode</span>
                    </div>
                    <div className="p-2 rounded bg-surface-subtle border border-surface-border">
                      <span className="text-paper-muted block text-[10px]">Difficulty</span>
                      <span className="font-semibold text-ochre">Hard</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-surface-subtle border border-surface-border text-[11px]">
                    <span className="text-paper-muted block text-[10px]">Detected archetypes</span>
                    <span className="text-paper-primary font-medium">
                      Two Pointers, Monotonic Stack
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                /* Feature 02 Graphic: Active Recall */
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                    <span className="text-paper-muted text-[11px]">Flashcard active recall</span>
                    <span className="text-xs text-paper-primary font-medium">
                      Medium
                    </span>
                  </div>
                  <div className="font-serif text-base text-paper-primary font-normal">
                    Course Schedule (Topological Sort)
                  </div>
                  <div className="p-3 rounded-lg bg-surface-subtle border border-dashed border-surface-border text-center text-paper-secondary">
                    <span className="text-xs block mb-1">Approach notes withheld</span>
                    <span className="text-[11px] text-teal">
                      Press Space to reveal intuition
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px] text-center">
                    <div className="p-1.5 rounded bg-ochre/15 text-ochre">Needs work (1)</div>
                    <div className="p-1.5 rounded bg-surface-subtle text-paper-secondary">Struggled (2)</div>
                    <div className="p-1.5 rounded bg-teal/15 text-teal">Remembered (3)</div>
                    <div className="p-1.5 rounded bg-teal text-[#0E1614] font-medium">Instinctive (4)</div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                /* Feature 03 Graphic: SM-2 Engine */
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border text-[11px] text-paper-muted">
                    <span>SM-2 interval sequence</span>
                    <span className="text-teal font-medium">SuperMemo-2</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-surface-subtle border border-surface-border">
                      <span className="text-paper-secondary">Repetition 1</span>
                      <span className="font-medium text-paper-primary">Day 1 (+1d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-subtle border border-surface-border">
                      <span className="text-paper-secondary">Repetition 2</span>
                      <span className="font-medium text-paper-primary">Day 3 (+2d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-surface-subtle border border-surface-border">
                      <span className="text-paper-secondary">Repetition 3</span>
                      <span className="font-medium text-paper-primary">Day 8 (+5d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-teal/10 border border-teal/30">
                      <span className="text-teal font-medium">Repetition 4 (Consolidated)</span>
                      <span className="font-medium text-teal">Day 22 (+14d)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                /* Feature 04 Graphic: Pattern Matrix */
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-border text-[11px] text-paper-muted">
                    <span>Archetype status</span>
                    <span className="text-paper-secondary">Retention confidence</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { name: 'Dynamic Programming', status: 'Ready (2.85 ease)', color: 'text-teal' },
                      { name: 'Graphs & BFS/DFS', status: 'Consolidating (2.50 ease)', color: 'text-paper-primary' },
                      { name: 'Sliding Window', status: 'Due soon (2.20 ease)', color: 'text-ochre' },
                      { name: 'Trie & Backtracking', status: 'Mastered (2.90 ease)', color: 'text-teal' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between p-2 rounded bg-surface-subtle border border-surface-border"
                      >
                        <span className="text-paper-primary">{row.name}</span>
                        <span className={`font-medium ${row.color}`}>{row.status}</span>
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
