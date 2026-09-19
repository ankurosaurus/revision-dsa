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
  const textClass = size === 'sm' ? 'text-[12px]' : 'text-[13px]';

  switch (difficulty) {
    case 'easy':
      return (
        <span className={`inline-flex items-center gap-1.5 font-normal text-[#5A9367] ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5A9367] shrink-0" />
          <span>Easy</span>
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center gap-1.5 font-normal text-[#C4923A] ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C4923A] shrink-0" />
          <span>Medium</span>
        </span>
      );
    case 'hard':
      return (
        <span className={`inline-flex items-center gap-1.5 font-normal text-[#C25B5B] ${textClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C25B5B] shrink-0" />
          <span>Hard</span>
        </span>
      );
    default:
      return null;
  }
};
