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
    <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 sm:p-7 shadow-card">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-medium text-[#2D5A6B]">
            System Overview
          </span>
          <span className="text-[13px] text-[#8E8E93]">
            Engineered for deliberate interview practice
          </span>
        </div>
        <h3 className="text-[20px] font-semibold text-[#1C1C1E] leading-snug">
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
              className={`p-3 rounded-[8px] border text-left transition-all ${
                isSelected
                  ? 'bg-[#F7F7F5] border-[#2D5A6B] text-[#1C1C1E] shadow-xs'
                  : 'bg-[#FAFAF8] border-[#E5E4E0] text-[#6E6E73] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-[#8E8E93]">
                  0{feat.index}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-[#2D5A6B]' : 'text-[#8E8E93]'
                  }`}
                  strokeWidth={1.8}
                />
              </div>
              <div className="text-[13px] font-medium truncate">
                {feat.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-[10px] bg-[#FAFAF8] border border-[#E5E4E0]">
        {/* Left Side: Explanations & Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-[13px] text-[#8E8E93]">
            <span>Part {current.index}: </span>
            <span className="text-[#1C1C1E] font-medium">{current.tagline}</span>
          </div>

          <h4 className="text-[17px] font-semibold text-[#1C1C1E] leading-snug">
            {current.title}
          </h4>

          <p className="text-[13px] text-[#6E6E73] leading-relaxed">
            {current.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <span className="text-[11px] text-[#8E8E93] block">
                {current.metricLabel}
              </span>
              <span className="text-[13px] font-medium text-[#1C1C1E]">
                {current.metricValue}
              </span>
            </div>

            <button
              onClick={current.action}
              className="btn-secondary text-[13px] self-start font-medium"
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
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="w-full bg-[#FFFFFF] rounded-[10px] p-5 border border-[#E5E4E0] shadow-card"
            >
              {activeTab === 0 && (
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between text-[#6E6E73] text-[12px] pb-2 border-b border-[#E5E4E0]">
                    <span>Input problem URL</span>
                    <span className="text-[#5A9367] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={1.8} /> Canonical match
                    </span>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] text-[#1C1C1E] truncate font-mono text-[12px]">
                    https://leetcode.com/problems/trapping-rain-water/
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div className="p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
                      <span className="text-[#8E8E93] block text-[11px]">Platform</span>
                      <span className="font-medium text-[#1C1C1E]">LeetCode</span>
                    </div>
                    <div className="p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
                      <span className="text-[#8E8E93] block text-[11px]">Difficulty</span>
                      <span className="font-medium text-[#C25B5B]">Hard</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0] text-[12px]">
                    <span className="text-[#8E8E93] block text-[11px]">Detected archetypes</span>
                    <span className="text-[#1C1C1E] font-medium">
                      Two Pointers, Monotonic Stack
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E4E0]">
                    <span className="text-[#8E8E93] text-[12px]">Flashcard active recall</span>
                    <span className="text-[12px] text-[#C4923A] font-medium">
                      Medium
                    </span>
                  </div>
                  <div className="text-[15px] font-medium text-[#1C1C1E]">
                    Course Schedule (Topological Sort)
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FAFAF8] border border-dashed border-[#E5E4E0] text-center text-[#6E6E73]">
                    <span className="text-[13px] block mb-1">Approach notes withheld</span>
                    <span className="text-[12px] text-[#1C1C1E]">
                      Press Space to reveal intuition
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[11px] text-center">
                    <div className="p-1.5 rounded-[6px] bg-[#C25B5B]/10 text-[#C25B5B]">Needs work (1)</div>
                    <div className="p-1.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]">Struggled (2)</div>
                    <div className="p-1.5 rounded-[6px] bg-[#5A9367]/10 text-[#5A9367]">Remembered (3)</div>
                    <div className="p-1.5 rounded-[6px] bg-[#2D5A6B] text-white font-medium">Instinctive (4)</div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E4E0] text-[12px] text-[#8E8E93]">
                    <span>SM-2 interval sequence</span>
                    <span className="text-[#1C1C1E] font-medium">SuperMemo-2</span>
                  </div>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
                      <span className="text-[#6E6E73]">Repetition 1</span>
                      <span className="font-medium text-[#1C1C1E]">Day 1 (+1d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
                      <span className="text-[#6E6E73]">Repetition 2</span>
                      <span className="font-medium text-[#1C1C1E]">Day 3 (+2d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
                      <span className="text-[#6E6E73]">Repetition 3</span>
                      <span className="font-medium text-[#1C1C1E]">Day 8 (+5d)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-[6px] bg-[#5A9367]/10 border border-[#5A9367]/20">
                      <span className="text-[#5A9367] font-medium">Repetition 4 (Consolidated)</span>
                      <span className="font-medium text-[#5A9367]">Day 22 (+14d)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E4E0] text-[12px] text-[#8E8E93]">
                    <span>Archetype status</span>
                    <span className="text-[#6E6E73]">Retention confidence</span>
                  </div>
                  <div className="space-y-1.5 text-[13px]">
                    {[
                      { name: 'Dynamic Programming', status: 'Ready (2.85 ease)', color: 'text-[#5A9367]' },
                      { name: 'Graphs & BFS/DFS', status: 'Consolidating (2.50 ease)', color: 'text-[#1C1C1E]' },
                      { name: 'Sliding Window', status: 'Due soon (2.20 ease)', color: 'text-[#C4923A]' },
                      { name: 'Trie & Backtracking', status: 'Mastered (2.90 ease)', color: 'text-[#5A9367]' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between p-2 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]"
                      >
                        <span className="text-[#1C1C1E]">{row.name}</span>
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
