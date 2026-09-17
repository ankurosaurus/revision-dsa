import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { CatalogProblem, Platform } from '../types';
import { browseCatalog, BrowseResult, getCatalogStats } from '../lib/catalogService';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';
import { PlatformBadge } from '../components/problems/PlatformBadge';

const PAGE_SIZE = 100;

type SortOption = 'number_asc' | 'number_desc' | 'rating_asc' | 'rating_desc' | 'title_asc';

const SORT_LABELS: Record<SortOption, string> = {
  number_asc: '# Ascending',
  number_desc: '# Descending',
  rating_asc: 'Rating ↑',
  rating_desc: 'Rating ↓',
  title_asc: 'Title A–Z',
};

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

function difficultyColor(d?: string) {
  if (d === 'easy') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
  if (d === 'hard') return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30';
  return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30';
}

export const CatalogPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const openAddPanel = useUIStore((s) => s.openAddPanel);

  // Filters
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<Platform | 'all'>('leetcode'); // default: LeetCode
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('number_asc');
  const [page, setPage] = useState(1);

  // Results
  const [result, setResult] = useState<BrowseResult>({ items: [], totalMatches: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [statsText, setStatsText] = useState('');

  // Track which problems are already in the user's revision bank
  const alreadyAdded = new Set(problems.map((p) => p.url));

  // Debounce query input
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPage = useCallback(async (opts: {
    q: string; plat: Platform | 'all'; diff: string; pg: number; srt: SortOption;
  }) => {
    setIsLoading(true);
    try {
      const res = await browseCatalog({
        query: opts.q,
        platform: opts.plat,
        difficulty: opts.diff as 'easy' | 'medium' | 'hard' | 'all',
        page: opts.pg,
        pageSize: PAGE_SIZE,
        sort: opts.srt,
      });
      setResult(res);
      setCatalogLoaded(true);
    } catch (err) {
      console.error('browseCatalog error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on filter/page change (debounced for query)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPage({ q: query, plat: platform, diff: difficulty, pg: page, srt: sort });
    }, query ? 200 : 0);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, platform, difficulty, page, sort, fetchPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [query, platform, difficulty, sort]);

  // Load stats once
  useEffect(() => {
    getCatalogStats().then((s) => {
      setStatsText(`${s.leetcode.toLocaleString()} LeetCode · ${s.codeforces.toLocaleString()} Codeforces · ${s.gfg} GFG`);
    });
  }, []);

  const totalPages = Math.ceil(result.totalMatches / PAGE_SIZE);
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, result.totalMatches);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-neutral-50 dark:bg-dark-bg">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Problem Catalog
            </h1>
            <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
              {statsText || 'Loading catalog…'}
            </p>
          </div>
          <button
            onClick={openAddPanel}
            className="btn-primary flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Revision</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, #number, tag…"
              className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg pl-8 pr-8 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Platform tabs */}
          <div className="flex items-center bg-neutral-100 dark:bg-dark-surfaceHover rounded-lg p-0.5 gap-0.5 text-xs">
            {(['all', 'leetcode', 'codeforces', 'gfg'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  platform === p
                    ? 'bg-white dark:bg-dark-surface text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {p === 'all' ? 'All' : p === 'leetcode' ? 'LeetCode' : p === 'codeforces' ? 'Codeforces' : 'GFG'}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="text-xs bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-lg px-2 py-2 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border rounded-lg px-2 py-2 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                <option key={s} value={s}>{SORT_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !catalogLoaded ? (
          <div className="flex flex-col items-center justify-center h-60 gap-3 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            <span className="text-sm">Loading 15,476 problems…</span>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="px-6 py-2 border-b border-neutral-100 dark:border-dark-border/60 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 dark:text-dark-textMuted">
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Filtering…
                  </span>
                ) : result.totalMatches === 0 ? (
                  'No problems match your filters.'
                ) : (
                  <>
                    Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">{startItem}–{endItem}</span> of{' '}
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">{result.totalMatches.toLocaleString()}</span> problems
                  </>
                )}
              </span>

              {/* Pagination top */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-neutral-500 px-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Problem rows */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-dark-border/60 bg-neutral-50/80 dark:bg-dark-surface/50">
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 dark:text-neutral-500 w-20">#</th>
                  <th className="text-left px-2 py-2.5 font-semibold text-neutral-500 dark:text-neutral-500">Title</th>
                  <th className="text-left px-2 py-2.5 font-semibold text-neutral-500 dark:text-neutral-500 w-24 hidden sm:table-cell">Difficulty</th>
                  <th className="text-left px-2 py-2.5 font-semibold text-neutral-500 dark:text-neutral-500 w-28 hidden md:table-cell">Rating</th>
                  <th className="text-left px-2 py-2.5 font-semibold text-neutral-500 dark:text-neutral-500 hidden lg:table-cell">Tags</th>
                  <th className="px-4 py-2.5 w-24 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-border/40">
                {result.items.map((prob) => {
                  const added = alreadyAdded.has(prob.url);
                  return (
                    <ProblemRow key={prob.id} prob={prob} added={added} />
                  );
                })}
                {result.items.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-neutral-400 dark:text-neutral-600">
                      <p className="text-sm font-medium">No problems found</p>
                      <p className="text-xs mt-1">Try a different search or filter combination.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination bottom */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-dark-border/60">
                <span className="text-[11px] text-neutral-500">
                  Page {page} of {totalPages} · {result.totalMatches.toLocaleString()} total
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setPage(1); window.scrollTo(0, 0); }}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
                  >
                    Prev
                  </button>

                  {/* Page number buttons (show 5 around current) */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const offset = Math.max(0, Math.min(page - 3, totalPages - 5));
                    return offset + i + 1;
                  }).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-[11px] font-medium rounded-lg transition-colors ${
                        pg === page
                          ? 'bg-brand-600 text-white'
                          : 'border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Row component (memoized for perf with 100 rows per page) ──────────────────
const ProblemRow = React.memo(({ prob, added }: { prob: CatalogProblem; added: boolean }) => {
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  // Clicking "Add" opens the add panel — user can pick this problem from the search
  // (catalog is already loaded in memory so it'll appear instantly)

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-dark-surface/60 transition-colors group">
      {/* # / Problem number */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={prob.platform} size="sm" />
          {prob.problem_number && (
            <span className="font-mono font-bold text-[11px] text-neutral-500 dark:text-neutral-400">
              {prob.problem_number}
            </span>
          )}
        </div>
      </td>

      {/* Title */}
      <td className="px-2 py-2.5 max-w-xs">
        <a
          href={prob.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1 group/link"
        >
          <span className="truncate">{prob.title}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-60 transition-opacity" />
        </a>
        {prob.is_paid_only && (
          <span className="ml-1.5 text-[10px] text-amber-500 font-medium">Premium</span>
        )}
      </td>

      {/* Difficulty */}
      <td className="px-2 py-2.5 hidden sm:table-cell">
        {prob.difficulty && (
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${difficultyColor(prob.difficulty)}`}>
            {prob.difficulty}
          </span>
        )}
      </td>

      {/* Rating (Codeforces) */}
      <td className="px-2 py-2.5 hidden md:table-cell">
        {prob.rating ? (
          <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            ★ {prob.rating}
          </span>
        ) : (
          <span className="text-neutral-300 dark:text-neutral-700">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="px-2 py-2.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {prob.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-600 dark:text-neutral-400"
            >
              {t}
            </span>
          ))}
          {prob.tags.length > 3 && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-600">
              +{prob.tags.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Action */}
      <td className="px-4 py-2.5 text-right">
        {added ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Added
          </span>
        ) : (
          <button
            onClick={openAddPanel}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 opacity-0 group-hover:opacity-100 transition-all"
            title="Add to revision queue"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </td>
    </tr>
  );
});

ProblemRow.displayName = 'ProblemRow';
