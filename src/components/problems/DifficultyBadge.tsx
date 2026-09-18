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
  const textClass = size === 'sm' ? 'text-xs' : 'text-xs';

  switch (difficulty) {
    case 'easy':
      return (
        <span className={`inline-flex items-center gap-1.5 font-normal text-paper-secondary ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-paper-secondary/60 shrink-0" />
          <span>Easy</span>
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-paper-primary ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-paper-primary/70 shrink-0" />
          <span>Medium</span>
        </span>
      );
    case 'hard':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold text-ochre ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-ochre shrink-0" />
          <span>Hard</span>
        </span>
      );
    default:
      return null;
  }
};
