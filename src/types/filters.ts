import { Platform, Difficulty } from './index';

export interface ProblemFilterCriteria {
  platform?: Platform | 'all';
  difficulty?: Difficulty | 'all';
  searchQuery?: string;
  selectedTag?: string | null;
  onlyDue?: boolean;
}

export type SortField = 'date_added' | 'next_review' | 'repetitions' | 'difficulty';
export type SortOrder = 'asc' | 'desc';

export interface SortCriteria {
  field: SortField;
  order: SortOrder;
}

export function isPlatform(value: unknown): value is Platform {
  return value === 'leetcode' || value === 'gfg' || value === 'codeforces';
}

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'medium' || value === 'hard';
}
