import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, percentage }) => {
  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-paper-secondary">
          Session progress: <span className="text-paper-primary font-medium tabular-nums">{completed}</span> of{' '}
          <span className="text-paper-primary font-medium tabular-nums">{total}</span> completed
        </span>
        <span className="text-teal font-medium tabular-nums">{percentage}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden border border-surface-border">
        <div
          className="h-full bg-teal transition-all duration-200 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
