import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, percentage }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-neutral-500 dark:text-dark-textMuted font-medium">
          Session: <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{completed}</span> of{' '}
          <span className="text-neutral-900 dark:text-neutral-100 font-semibold">{total}</span> completed
        </span>
        <span className="text-brand-600 dark:text-brand-400 font-semibold">{percentage}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-dark-surfaceHover overflow-hidden">
        <div
          className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
