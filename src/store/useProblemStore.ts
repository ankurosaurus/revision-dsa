import { create } from 'zustand';
import { Problem, ReviewLog, Profile, RecallRating, InitialConfidence } from '../types';
import { SAMPLE_PROBLEMS } from '../lib/sampleData';
import { calculateSM2, getInitialSM2 } from '../lib/spacedRepetition';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { addToCatalog } from '../lib/catalogService';
import { detectAndValidateUrl } from '../lib/urlValidators';
import { track } from '../lib/analytics';

interface ProblemState {
  problems: Problem[];
  reviewLogs: ReviewLog[];
  profile: Profile;
  isLoading: boolean;

  // Actions
  fetchProblems: () => Promise<void>;
  addProblem: (params: {
    title: string;
    url: string;
    platform: 'leetcode' | 'gfg' | 'codeforces';
    difficulty?: 'easy' | 'medium' | 'hard';
    tags: string[];
    notes?: string;
    confidence: InitialConfidence;
    link_verified?: boolean;
    catalog_id?: string;
  }) => Promise<Problem>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  reviewProblem: (id: string, rating: RecallRating) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  loadStarterPack: () => void;
  clearAllData: () => void;
  exportData: (format: 'json' | 'csv') => void;
}

const STORAGE_KEYS = {
  PROBLEMS: 'revision_dsa_real_problems_v2',
  REVIEW_LOGS: 'revision_dsa_real_logs_v2',
  PROFILE: 'revision_dsa_profile_v2',
};

// Purge old mock storage versions so the user starts with clean real data
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('revision_dsa_problems_v1');
    localStorage.removeItem('revision_dsa_logs_v1');
    localStorage.removeItem('revision_dsa_profile_v1');
  }
} catch {
  // safe fallback
}

function loadInitialProblems(): Problem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROBLEMS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local problems:', e);
  }
  return []; // Pure clean start with 0 mock data
}

function loadInitialLogs(): ReviewLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEW_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local review logs:', e);
  }
  return []; // Pure clean start with 0 mock data
}

function loadInitialProfile(): Profile {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse local profile:', e);
  }
  return {
    id: 'user-default',
    full_name: 'Candidate',
    email: '',
    target_companies: [],
    daily_goal: 5,
    created_at: new Date().toISOString(),
  };
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: loadInitialProblems(),
  reviewLogs: loadInitialLogs(),
  profile: loadInitialProfile(),
  isLoading: false,

  fetchProblems: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    set({ isLoading: true });
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        set({ isLoading: false });
        return;
      }

      const { data: dbProblems, error } = await supabase
        .from('problems')
        .select('*')
        .order('next_review_date', { ascending: true });

      if (!error && dbProblems) {
        set({ problems: dbProblems });
        localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(dbProblems));
      }

      const { data: dbLogs } = await supabase
        .from('review_logs')
        .select('*')
        .order('reviewed_at', { ascending: false });

      if (dbLogs) {
        set({ reviewLogs: dbLogs });
        localStorage.setItem(STORAGE_KEYS.REVIEW_LOGS, JSON.stringify(dbLogs));
      }
    } catch (e) {
      console.warn('Supabase fetch failed, continuing with local storage:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addProblem: async (params) => {
    const initialSm2 = getInitialSM2(params.confidence);
    const newProblem: Problem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prob-${Date.now()}`,
      catalog_id: params.catalog_id,
      title: params.title.trim(),
      url: params.url.trim(),
      platform: params.platform,
      difficulty: params.difficulty || 'medium',
      tags: params.tags,
      notes: params.notes || '',
      link_verified: params.link_verified ?? true,
      ease_factor: initialSm2.ease_factor,
      interval_days: initialSm2.interval_days,
      repetitions: initialSm2.repetitions,
      next_review_date: initialSm2.next_review_date,
      created_at: new Date().toISOString(),
    };

    const nextProblems = [newProblem, ...get().problems];
    set({ problems: nextProblems });
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(nextProblems));
    track('problem_added', { platform: params.platform });

    // Organically enrich catalog with this problem if not from catalog
    try {
      const detection = detectAndValidateUrl(params.url);
      const extId = detection.slugOrId || params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      addToCatalog({
        platform: params.platform,
        external_id: extId,
        title: params.title.trim(),
        difficulty: params.difficulty || 'medium',
        tags: params.tags,
        url: params.url.trim(),
      }).catch((e) => console.warn('Organic catalog addition notice:', e));
    } catch {
      // Non-blocking
    }

    // Sync to Supabase if configured and authenticated
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('problems').insert({
            ...newProblem,
            user_id: userData.user.id,
          });
        }
      } catch (err) {
        console.warn('Failed to insert problem to Supabase:', err);
      }
    }

    return newProblem;
  },

  updateProblem: async (id, updates) => {
    const nextProblems = get().problems.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    set({ problems: nextProblems });
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(nextProblems));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('problems').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Failed to update problem in Supabase:', err);
      }
    }
  },

  deleteProblem: async (id) => {
    const nextProblems = get().problems.filter((p) => p.id !== id);
    set({ problems: nextProblems });
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(nextProblems));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('problems').delete().eq('id', id);
      } catch (err) {
        console.warn('Failed to delete problem in Supabase:', err);
      }
    }
  },

  reviewProblem: async (id, rating) => {
    const target = get().problems.find((p) => p.id === id);
    if (!target) return;

    // Calculate new SM-2 schedule
    const sm2 = calculateSM2(target, rating);

    const updatedProblem: Problem = {
      ...target,
      ease_factor: sm2.ease_factor,
      interval_days: sm2.interval_days,
      repetitions: sm2.repetitions,
      next_review_date: sm2.next_review_date,
      updated_at: new Date().toISOString(),
    };

    const nextProblems = get().problems.map((p) => (p.id === id ? updatedProblem : p));

    const newLog: ReviewLog = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      problem_id: id,
      rating,
      reviewed_at: new Date().toISOString(),
    };
    const nextLogs = [newLog, ...get().reviewLogs];

    set({
      problems: nextProblems,
      reviewLogs: nextLogs,
    });

    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(nextProblems));
    localStorage.setItem(STORAGE_KEYS.REVIEW_LOGS, JSON.stringify(nextLogs));

    // Track revision event
    track('revision_completed', { rating });

    // Check if daily goal was reached this session
    const dailyGoal = get().profile.daily_goal ?? 5;
    const today = new Date().toISOString().slice(0, 10);
    const reviewsToday = nextLogs.filter((l) => l.reviewed_at.slice(0, 10) === today).length;
    if (reviewsToday === dailyGoal) {
      track('daily_goal_reached', { goal: dailyGoal, total_today: reviewsToday });
    }

    // Supabase sync
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from('problems').update({
          ease_factor: sm2.ease_factor,
          interval_days: sm2.interval_days,
          repetitions: sm2.repetitions,
          next_review_date: sm2.next_review_date,
          updated_at: updatedProblem.updated_at,
        }).eq('id', id);

        if (userData?.user) {
          await supabase.from('review_logs').insert({
            problem_id: id,
            user_id: userData.user.id,
            rating,
            reviewed_at: newLog.reviewed_at,
          });
        }
      } catch (err) {
        console.warn('Failed to sync review with Supabase:', err);
      }
    }
  },

  updateProfile: (updates) => {
    const nextProfile = { ...get().profile, ...updates };
    set({ profile: nextProfile });
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(nextProfile));

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert({
        id: nextProfile.id,
        full_name: nextProfile.full_name,
        target_companies: nextProfile.target_companies,
        daily_goal: nextProfile.daily_goal,
      }).then();
    }
  },

  loadStarterPack: () => {
    set({
      problems: SAMPLE_PROBLEMS,
      reviewLogs: [],
    });
    localStorage.setItem(STORAGE_KEYS.PROBLEMS, JSON.stringify(SAMPLE_PROBLEMS));
    localStorage.setItem(STORAGE_KEYS.REVIEW_LOGS, JSON.stringify([]));
  },

  clearAllData: () => {
    set({
      problems: [],
      reviewLogs: [],
    });
    localStorage.removeItem(STORAGE_KEYS.PROBLEMS);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_LOGS);
  },

  exportData: (format) => {
    const state = get();
    if (format === 'json') {
      const dataStr = JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          profile: state.profile,
          problems: state.problems,
          reviewLogs: state.reviewLogs,
        },
        null,
        2
      );
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revisiondsa-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = [
        'ID',
        'Title',
        'Platform',
        'Difficulty',
        'URL',
        'Tags',
        'EaseFactor',
        'IntervalDays',
        'Repetitions',
        'NextReviewDate',
        'CreatedAt',
      ];
      const rows = state.problems.map((p) => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.platform,
        p.difficulty || '',
        `"${p.url.replace(/"/g, '""')}"`,
        `"${p.tags.join(';')}"`,
        p.ease_factor,
        p.interval_days,
        p.repetitions,
        p.next_review_date,
        p.created_at,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revisiondsa-problems.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },
}));
