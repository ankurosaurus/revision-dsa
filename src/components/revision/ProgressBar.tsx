import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, percentage }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[13px] mb-2">
        <span className="text-[#6E6E73]">
          Session progress: <span className="text-[#1C1C1E] font-medium tabular-nums">{completed}</span> of{' '}
          <span className="text-[#1C1C1E] font-medium tabular-nums">{total}</span> completed
        </span>
        <span className="text-[#1C1C1E] font-medium tabular-nums">{percentage}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#FAFAF8] overflow-hidden border border-[#E5E4E0]">
        <div
          className="h-full bg-[#2D5A6B] transition-all duration-200 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
