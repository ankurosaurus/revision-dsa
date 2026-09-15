import React from 'react';
import { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty?: Difficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty = 'medium',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  switch (difficulty) {
    case 'easy':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 capitalize ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
          Easy
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40 capitalize ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 shrink-0" />
          Medium
        </span>
      );
    case 'hard':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40 capitalize ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0" />
          Hard
        </span>
      );
    default:
      return null;
  }
};
