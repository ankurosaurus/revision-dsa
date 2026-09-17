/**
 * Catalog Service
 * Provides lightning-fast fuzzy search across 15,000+ DSA problems (LeetCode, Codeforces, GFG).
 * Connects to Supabase problem_catalog with automatic local cache & offline fallback.
 * Automatically saves organic additions when users add custom/unlisted problems.
 */

import { CatalogProblem, CatalogStats, Platform } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_CUSTOM_CATALOG_KEY = 'revision_dsa_custom_catalog_v1';

let inMemoryCatalog: CatalogProblem[] | null = null;
let isCatalogLoading = false;
const catalogLoadCallbacks: Array<() => void> = [];

/**
 * Load local/public catalog dataset lazily into memory
 */
export async function ensureCatalogLoaded(): Promise<CatalogProblem[]> {
  if (inMemoryCatalog && inMemoryCatalog.length > 0) {
    return inMemoryCatalog;
  }

  if (isCatalogLoading) {
    return new Promise((resolve) => {
      catalogLoadCallbacks.push(() => {
        resolve(inMemoryCatalog || []);
      });
    });
  }

  isCatalogLoading = true;

  try {
    const res = await fetch('/data/catalog.json');
    if (res.ok) {
      const baseData: CatalogProblem[] = await res.json();
      const customData = loadCustomCatalog();
      inMemoryCatalog = mergeCatalogs(baseData, customData);
    } else {
      console.warn('Could not load /data/catalog.json, using custom additions fallback.');
      inMemoryCatalog = loadCustomCatalog();
    }
  } catch (err) {
    console.warn('Failed to fetch local catalog.json, falling back to local storage:', err);
    inMemoryCatalog = loadCustomCatalog();
  } finally {
    isCatalogLoading = false;
    while (catalogLoadCallbacks.length > 0) {
      const cb = catalogLoadCallbacks.shift();
      if (cb) cb();
    }
  }

  return inMemoryCatalog || [];
}

/**
 * Load custom user additions saved in browser storage
 */
function loadCustomCatalog(): CatalogProblem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_CUSTOM_CATALOG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse custom catalog:', e);
  }
  return [];
}

function mergeCatalogs(base: CatalogProblem[], custom: CatalogProblem[]): CatalogProblem[] {
  const map = new Map<string, CatalogProblem>();
  for (const item of base) {
    map.set(`${item.platform}:${item.external_id}`, item);
  }
  for (const item of custom) {
    map.set(`${item.platform}:${item.external_id}`, item);
  }
  return Array.from(map.values());
}

/**
 * Fuzzy search across problem catalog
 */
export async function searchCatalog(
  query: string,
  platformFilter: Platform | 'all' = 'all',
  limit = 20
): Promise<CatalogProblem[]> {
  const trimmed = query.trim().toLowerCase();

  // Try Supabase first if available and online
  if (isSupabaseConfigured && supabase) {
    try {
      let q = supabase
        .from('problem_catalog')
        .select('id, platform, external_id, title, difficulty, rating, tags, url, is_paid_only');

      if (platformFilter !== 'all') {
        q = q.eq('platform', platformFilter);
      }

      if (trimmed) {
        q = q.ilike('title', `%${trimmed}%`);
      }

      const { data, error } = await q.limit(limit);
      if (!error && data && data.length > 0) {
        return data as CatalogProblem[];
      }
    } catch {
      // Gracefully fall through to fast local search
    }
  }

  // Fast in-memory / local fuzzy search
  const catalog = await ensureCatalogLoaded();
  let pool = catalog;

  if (platformFilter !== 'all') {
    pool = pool.filter((p) => p.platform === platformFilter);
  }

  if (!trimmed) {
    // Return sample popular / standard interview problems
    return pool.slice(0, limit);
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);

  const scored = pool
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const extLower = item.external_id.toLowerCase();
      const tagsLower = item.tags.map((t) => t.toLowerCase()).join(' ');

      let score = 0;

      // Exact title match
      if (titleLower === trimmed) {
        score += 1000;
      } else if (titleLower.startsWith(trimmed)) {
        score += 500;
      } else if (titleLower.includes(trimmed)) {
        score += 200;
      }

      // External ID / Contest problem match (e.g. "4A", "two-sum")
      if (extLower === trimmed) {
        score += 800;
      } else if (extLower.includes(trimmed)) {
        score += 300;
      }

      // Token coverage scoring (handles typos / multi-words)
      let matchedTokens = 0;
      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 50;
          matchedTokens++;
        } else if (tagsLower.includes(term)) {
          score += 30;
          matchedTokens++;
        } else if (extLower.includes(term)) {
          score += 40;
          matchedTokens++;
        } else {
          // Substring fuzzy prefix match for typos (e.g. "palindrom" matching "palindrome")
          const prefix = term.slice(0, Math.max(3, term.length - 1));
          if (titleLower.includes(prefix)) {
            score += 20;
            matchedTokens++;
          }
        }
      }

      // Bonus if all words matched
      if (matchedTokens === terms.length) {
        score += 100;
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);

  return scored;
}

/**
 * Organically add a problem to the catalog (e.g. when user manually pastes a new link)
 */
export async function addToCatalog(item: {
  platform: Platform;
  external_id: string;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  url: string;
  rating?: number | null;
}): Promise<CatalogProblem> {
  const newProblem: CatalogProblem = {
    id: `${item.platform}-${item.external_id}`,
    platform: item.platform,
    external_id: item.external_id,
    title: item.title.trim(),
    difficulty: item.difficulty || 'medium',
    rating: item.rating || null,
    tags: item.tags || [],
    url: item.url.trim(),
    is_paid_only: false,
  };

  // 1. Update in-memory catalog
  if (inMemoryCatalog) {
    const key = `${newProblem.platform}:${newProblem.external_id}`;
    const exists = inMemoryCatalog.some((p) => `${p.platform}:${p.external_id}` === key);
    if (!exists) {
      inMemoryCatalog.unshift(newProblem);
    }
  }

  // 2. Persist to local custom storage
  if (typeof window !== 'undefined') {
    try {
      const current = loadCustomCatalog();
      const filtered = current.filter(
        (p) => `${p.platform}:${p.external_id}` !== `${newProblem.platform}:${newProblem.external_id}`
      );
      filtered.unshift(newProblem);
      localStorage.setItem(LOCAL_CUSTOM_CATALOG_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save to custom catalog localStorage:', e);
    }
  }

  // 3. Sync to Supabase problem_catalog if connected
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('problem_catalog').upsert(
        {
          platform: newProblem.platform,
          external_id: newProblem.external_id,
          title: newProblem.title,
          difficulty: newProblem.difficulty,
          rating: newProblem.rating,
          tags: newProblem.tags,
          url: newProblem.url,
          is_paid_only: false,
        },
        { onConflict: 'platform,external_id' }
      );
    } catch (err) {
      console.warn('Supabase catalog upsert failed (continuing with local catalog):', err);
    }
  }

  return newProblem;
}

/**
 * Retrieve current catalog statistics
 */
export async function getCatalogStats(): Promise<CatalogStats> {
  const catalog = await ensureCatalogLoaded();
  return {
    total: catalog.length,
    leetcode: catalog.filter((p) => p.platform === 'leetcode').length,
    codeforces: catalog.filter((p) => p.platform === 'codeforces').length,
    gfg: catalog.filter((p) => p.platform === 'gfg').length,
  };
}

export interface BrowseResult {
  items: CatalogProblem[];
  totalMatches: number;
}

/**
 * Browse full catalog with filtering, search, and pagination.
 * Designed for the Catalog page — returns all matching items with pagination.
 */
export async function browseCatalog(options: {
  query?: string;
  platform?: Platform | 'all';
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  page?: number;
  pageSize?: number;
  sort?: 'number_asc' | 'number_desc' | 'rating_asc' | 'rating_desc' | 'title_asc';
}): Promise<BrowseResult> {
  const {
    query = '',
    platform = 'all',
    difficulty = 'all',
    page = 1,
    pageSize = 100,
    sort = 'number_asc',
  } = options;

  const catalog = await ensureCatalogLoaded();
  const trimmed = query.trim().toLowerCase();

  // 1. Platform filter
  let pool = platform === 'all' ? catalog : catalog.filter((p) => p.platform === platform);

  // 2. Difficulty filter
  if (difficulty !== 'all') {
    pool = pool.filter((p) => p.difficulty === difficulty);
  }

  // 3. Text search (fast — single pass)
  if (trimmed) {
    const terms = trimmed.split(/\s+/).filter(Boolean);
    pool = pool.filter((p) => {
      const hay = `${p.title} ${p.external_id} ${p.problem_number || ''} ${p.tags.join(' ')}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }

  // 4. Sort
  const sorted = [...pool].sort((a, b) => {
    switch (sort) {
      case 'number_asc': {
        // LeetCode: sort by numeric part of problem_number; CF: lexicographic by contest+index
        const numA = a.platform === 'leetcode' ? parseInt(a.problem_number?.replace('#', '') || '99999', 10) : 0;
        const numB = b.platform === 'leetcode' ? parseInt(b.problem_number?.replace('#', '') || '99999', 10) : 0;
        if (numA !== numB) return numA - numB;
        return (a.problem_number || '').localeCompare(b.problem_number || '');
      }
      case 'number_desc': {
        const numA = a.platform === 'leetcode' ? parseInt(a.problem_number?.replace('#', '') || '0', 10) : 0;
        const numB = b.platform === 'leetcode' ? parseInt(b.problem_number?.replace('#', '') || '0', 10) : 0;
        if (numA !== numB) return numB - numA;
        return (b.problem_number || '').localeCompare(a.problem_number || '');
      }
      case 'rating_asc':
        return (a.rating ?? 0) - (b.rating ?? 0);
      case 'rating_desc':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const totalMatches = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return { items, totalMatches };
}
