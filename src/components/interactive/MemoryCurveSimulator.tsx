import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';

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
    description: 'Third spaced repetition. Pattern recognition becomes instinctive under interview pressure.',
    repetition: 3,
  },
  {
    day: 21,
    label: 'Deep Consolidation',
    interval: 'Day 21 (+14d)',
    retentionWithout: 12,
    retentionWith: 96,
    description: 'Long-term consolidation. You reconstruct the algorithm instinctively without hints.',
    repetition: 4,
  },
  {
    day: 60,
    label: 'Permanent Intuition',
    interval: 'Day 60 (+39d)',
    retentionWithout: 5,
    retentionWith: 98,
    description: 'Mastered permanently. The pattern is burned into procedural memory.',
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

  // Standard forgetting curve path (Ochre faded)
  const forgettingPath = `M ${getX(0)} ${getY(100)} Q ${getX(5)} ${getY(40)}, ${getX(20)} ${getY(15)} T ${getX(60)} ${getY(5)}`;

  // SM-2 spaced repetition curve path (Teal solid)
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
    <div className="editorial-surface p-6 sm:p-7 relative overflow-hidden">
      {/* Header & Stage Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-teal">
              Memory retention model
            </span>
            <span className="text-xs text-paper-muted">
              (Ebbinghaus decay vs. SM-2 intervals)
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-paper-primary font-normal leading-snug">
            How spaced intervals prevent forgetting
          </h3>
          <p className="text-xs text-paper-secondary mt-0.5">
            Select a milestone to inspect how periodic active recall flattens the forgetting curve.
          </p>
        </div>

        {/* Probability Readout */}
        <div className="flex items-center gap-4 bg-surface-subtle p-3 rounded-xl border border-surface-border shrink-0">
          <div>
            <span className="text-[11px] text-paper-muted block">
              Without review
            </span>
            <span className="text-base font-semibold text-ochre">
              {activeStage.retentionWithout}%
            </span>
          </div>

          <div className="h-7 w-px bg-surface-border" />

          <div>
            <span className="text-[11px] text-teal font-medium block">
              With SM-2 recall
            </span>
            <span className="text-base font-semibold text-paper-primary flex items-center gap-1">
              <span>{activeStage.retentionWith}%</span>
              <TrendingUp className="w-3.5 h-3.5 text-teal" />
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
                  stroke="#2C3140"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={getY(pct) + 4}
                  textAnchor="end"
                  fill="#656B7B"
                  fontSize="10"
                >
                  {pct}%
                </text>
              </g>
            ))}

            {/* Standard Forgetting Curve (Ochre dashed) */}
            <path
              d={forgettingPath}
              fill="none"
              stroke="#C98A3B"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.6"
            />

            {/* SM-2 Spaced Repetition Curve (Teal solid) */}
            <path
              d={sm2Path}
              fill="none"
              stroke="#4F9C8D"
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
              stroke="#4F9C8D"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              strokeOpacity="0.8"
            />

            {/* Active Node Indicator */}
            <circle
              cx={activeX}
              cy={activeY}
              r="5"
              fill="#4F9C8D"
            />
            <circle
              cx={activeX}
              cy={activeY}
              r="11"
              fill="#4F9C8D"
              fillOpacity="0.2"
            />

            {/* Stage Milestone Pins */}
            {STAGES.map((st, i) => {
              const x = getX(st.day);
              const y = getY(st.retentionWith);
              const isSelected = i === selectedStageIndex;

              return (
                <g
                  key={st.day}
                  onClick={() => setSelectedStageIndex(i)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '5' : '3.5'}
                    fill={isSelected ? '#4F9C8D' : '#656B7B'}
                  />
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill={isSelected ? '#4F9C8D' : '#9AA0AE'}
                    fontSize="10"
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    Day {st.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Milestone Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        {STAGES.map((st, index) => {
          const isSelected = index === selectedStageIndex;
          return (
            <button
              key={st.day}
              onClick={() => setSelectedStageIndex(index)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-surface-hover border-teal text-paper-primary shadow-xs'
                  : 'bg-surface-subtle border-surface-border text-paper-secondary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-paper-muted mb-1">
                <span>{st.interval}</span>
                {st.repetition > 0 && <span>#{st.repetition}</span>}
              </div>
              <div className="text-xs font-medium truncate">{st.label}</div>
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      <motion.div
        key={activeStage.day}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12 }}
        className="mt-4 p-3.5 rounded-xl bg-surface-subtle border border-surface-border flex items-start gap-3 text-xs"
      >
        <div className="p-1.5 rounded-lg bg-teal/10 text-teal shrink-0 mt-0.5">
          <Brain className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-paper-primary mr-1.5">
            {activeStage.label}:
          </span>
          <span className="text-paper-secondary leading-relaxed">
            {activeStage.description}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
