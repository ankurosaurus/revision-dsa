export type Platform = 'leetcode' | 'gfg' | 'codeforces';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type RecallRating = 'again' | 'hard' | 'good' | 'easy';

export type InitialConfidence = 'struggled' | 'hints' | 'independent' | 'instant';

export interface Problem {
  id: string;
  user_id?: string;
  catalog_id?: string;
  title: string;
  url: string;
  platform: Platform;
  difficulty?: Difficulty;
  tags: string[];
  notes?: string;
  link_verified: boolean;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string; // ISO date string (YYYY-MM-DD)
  created_at: string;
  updated_at?: string;
}

export interface CatalogProblem {
  id: string;
  platform: Platform;
  external_id: string;
  /** Display serial: "#1" for LeetCode, "4A" for Codeforces, slug for GFG */
  problem_number?: string;
  title: string;
  difficulty?: Difficulty;
  rating?: number | null;
  tags: string[];
  url: string;
  is_paid_only?: boolean;
}

export interface CatalogStats {
  total: number;
  leetcode: number;
  codeforces: number;
  gfg: number;
}

export interface ReviewLog {
  id: string;
  problem_id: string;
  user_id?: string;
  rating: RecallRating;
  reviewed_at: string; // ISO timestamp
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  target_companies?: string[];
  daily_goal: number;
  created_at?: string;
}

export interface SM2Result {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

export interface VerifiedMetadata {
  platform: Platform;
  verified: boolean;
  title: string;
  difficulty?: Difficulty;
  canonicalUrl: string;
  error?: string;
}

export type SupportedLanguage = 'python' | 'java' | 'c' | 'cpp';

export interface CodeSubmission {
  id: string;
  user_id?: string;
  problem_id: string;
  language: SupportedLanguage;
  code: string;
  last_stdout?: string;
  last_stderr?: string;
  updated_at?: string;
}
