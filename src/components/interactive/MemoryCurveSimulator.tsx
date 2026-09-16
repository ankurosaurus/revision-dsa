import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, RotateCcw } from 'lucide-react';

interface Stage {
  day: number;
  label: string;
  interval: string;
  retentionWithout: number;
  retentionWith: number;
  description: string;
  repetition: number;
}

const STAGES: Stage[] = [
  {
    day: 0,
    label: 'Problem Solved',
    interval: 'Day 0',
    retentionWithout: 100,
    retentionWith: 100,
    description: 'Initial solution coded. Fresh in working memory, but starts fading within 24 hours.',
    repetition: 0,
  },
  {
    day: 1,
    label: 'First Revision',
    interval: 'Day 1',
    retentionWithout: 55,
    retentionWith: 95,
    description: 'First SM-2 recall prompt. Reactivates synapses before memory decays below 50%.',
    repetition: 1,
  },
  {
    day: 3,
    label: 'Second Revision',
    interval: 'Day 3 (+2d)',
    retentionWithout: 34,
    retentionWith: 93,
    description: 'Interval expands. Memory decay curve flattens, cementing core intuition.',
    repetition: 2,
  },
  {
    day: 7,
    label: 'Third Revision',
    interval: 'Day 7 (+4d)',
    retentionWithout: 22,
    retentionWith: 94,
    description: 'Third spaced repetition. Pattern recognition becomes instinctive under time pressure.',
    repetition: 3,
  },
  {
    day: 21,
    label: 'Deep Consolidation',
    interval: 'Day 21 (+14d)',
    retentionWithout: 12,
    retentionWith: 96,
    description: 'Long-term consolidation. You can reconstruct the algorithm effortlessly in live interviews.',
    repetition: 4,
  },
  {
    day: 60,
    label: 'Permanent Intuition',
    interval: 'Day 60 (+39d)',
    retentionWithout: 5,
    retentionWith: 98,
    description: 'Mastered permanently. The algorithm is burned into long-term procedural memory.',
    repetition: 5,
  },
];

export const MemoryCurveSimulator: React.FC = () => {
  const [selectedStageIndex, setSelectedStageIndex] = useState(2);
  const activeStage = STAGES[selectedStageIndex];

  // SVG coordinate calculations for dynamic curve
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Map day values to SVG X
  const getX = (day: number) => {
    return paddingX + (day / 60) * graphWidth;
  };

  // Map retention % to SVG Y
  const getY = (pct: number) => {
    return height - paddingY - (pct / 100) * graphHeight;
  };

  // Build standard forgetting curve path
  const forgettingPath = `M ${getX(0)} ${getY(100)} Q ${getX(5)} ${getY(40)}, ${getX(20)} ${getY(15)} T ${getX(60)} ${getY(5)}`;

  // Build SM-2 saw-tooth flattened retention path
  const sm2Points = [
    { day: 0, pct: 100 },
    { day: 1, pct: 60 },
    { day: 1, pct: 95 },
    { day: 3, pct: 75 },
    { day: 3, pct: 93 },
    { day: 7, pct: 80 },
    { day: 7, pct: 94 },
    { day: 21, pct: 85 },
    { day: 21, pct: 96 },
    { day: 60, pct: 92 },
    { day: 60, pct: 98 },
  ];

  let sm2Path = `M ${getX(sm2Points[0].day)} ${getY(sm2Points[0].pct)}`;
  for (let i = 1; i < sm2Points.length; i++) {
    sm2Path += ` L ${getX(sm2Points[i].day)} ${getY(sm2Points[i].pct)}`;
  }

  const activeX = getX(activeStage.day);
  const activeY = getY(activeStage.retentionWith);

  return (
    <div className="editorial-surface p-6 sm:p-8 relative overflow-hidden">
      {/* Header & Stage Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-0.5 rounded-full border border-brand-200/80 dark:border-brand-800/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Retention Simulator</span>
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
              Ebbinghaus vs SM-2
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
            The Science of Memory Retention
          </h3>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Select a timeline milestone below to inspect how spaced repetition eliminates interview forgetting.
          </p>
        </div>

        {/* Live Probability Readout */}
        <div className="flex items-center gap-4 bg-neutral-50 dark:bg-dark-bg p-3 rounded-xl border border-neutral-200/80 dark:border-dark-border shrink-0">
          <div>
            <span className="text-[10px] text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider block font-medium">
              Without SM-2
            </span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              {activeStage.retentionWithout}%
            </span>
          </div>

          <div className="h-7 w-px bg-neutral-200 dark:bg-dark-border" />

          <div>
            <span className="text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-wider block font-semibold">
              With RevisionDSA
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-1">
              <span>{activeStage.retentionWith}%</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Curve Diagram */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[580px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid horizontal guidelines */}
            {[25, 50, 75, 100].map((pct) => (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={getY(pct)}
                  x2={width - paddingX}
                  y2={getY(pct)}
                  stroke="currentColor"
                  className="text-neutral-200/70 dark:text-neutral-800/80"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={getY(pct) + 4}
                  textAnchor="end"
                  className="fill-neutral-400 dark:fill-neutral-600 text-[9px] font-mono"
                >
                  {pct}%
                </text>
              </g>
            ))}

            {/* Standard Exponential Forgetting Curve (Faded red) */}
            <path
              d={forgettingPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.5"
            />

            {/* SM-2 Spaced Repetition Curve (Solid Indigo) */}
            <path
              d={sm2Path}
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Vertical Timeline Bar */}
            <line
              x1={activeX}
              y1={paddingY}
              x2={activeX}
              y2={height - paddingY}
              stroke="#4F46E5"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              strokeOpacity="0.8"
            />

            {/* Pulsing Active Node Indicator */}
            <circle
              cx={activeX}
              cy={activeY}
              r="6"
              fill="#4F46E5"
              className="animate-pulse"
            />
            <circle
              cx={activeX}
              cy={activeY}
              r="12"
              fill="#4F46E5"
              fillOpacity="0.2"
            />

            {/* Clickable Stage Milestone Pins */}
            {STAGES.map((st, i) => {
              const x = getX(st.day);
              const y = getY(st.retentionWith);
              const isSelected = i === selectedStageIndex;

              return (
                <g
                  key={st.day}
                  onClick={() => setSelectedStageIndex(i)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '5' : '3.5'}
                    className={`transition-all ${
                      isSelected
                        ? 'fill-brand-600'
                        : 'fill-neutral-300 dark:fill-neutral-600 group-hover:fill-brand-500'
                    }`}
                  />
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className={`text-[10px] font-mono transition-colors ${
                      isSelected
                        ? 'fill-brand-600 dark:fill-brand-400 font-bold'
                        : 'fill-neutral-400 dark:fill-neutral-500 group-hover:fill-neutral-700'
                    }`}
                  >
                    D{st.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Milestone Selector Pill Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        {STAGES.map((st, index) => {
          const isSelected = index === selectedStageIndex;
          return (
            <button
              key={st.day}
              onClick={() => setSelectedStageIndex(index)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                  : 'bg-neutral-50 dark:bg-dark-bg border-neutral-200/80 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>{st.interval}</span>
                {st.repetition > 0 && <span>#{st.repetition}</span>}
              </div>
              <div className="text-xs font-semibold truncate">{st.label}</div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Contextual Explanation Banner */}
      <motion.div
        key={activeStage.day}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="mt-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-dark-bg border border-neutral-200/80 dark:border-dark-border flex items-start gap-3"
      >
        <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
          <Brain className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 dark:text-white mr-1.5">
            {activeStage.label}:
          </span>
          <span className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {activeStage.description}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
