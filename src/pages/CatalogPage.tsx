import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Undo2,
  Trash2,
  Code2,
} from 'lucide-react';
import { CatalogProblem, Platform, Problem } from '../types';
import { browseCatalog, BrowseResult, getCatalogStats } from '../lib/catalogService';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';
import { PlatformBadge } from '../components/problems/PlatformBadge';
import { DifficultyBadge } from '../components/problems/DifficultyBadge';

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

export const CatalogPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const addProblem = useProblemStore((s) => s.addProblem);
  const deleteProblem = useProblemStore((s) => s.deleteProblem);
  const restoreProblem = useProblemStore((s) => s.restoreProblem);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const openSolveView = useUIStore((s) => s.openSolveView);

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

  // Toast & optimistic add/remove state
  const [toast, setToast] = useState<{
    type: 'added' | 'removed';
    id: string;
    title: string;
    problem: Problem;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fast single-pass O(1) map of user's active problems matching on catalog_id or url
  const userProblemsMap = useMemo(() => {
    const map = new Map<string, Problem>();
    for (const p of problems) {
      if (p.catalog_id) map.set(p.catalog_id, p);
      if (p.url) map.set(p.url, p);
    }
    return map;
  }, [problems]);

  const handleAddProblem = useCallback(async (prob: CatalogProblem) => {
    try {
      const added = await addProblem({
        catalog_id: prob.id,
        title: prob.title,
        url: prob.url,
        platform: prob.platform,
        difficulty: prob.difficulty || 'medium',
        tags: prob.tags || [],
      });

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({
        type: 'added',
        id: added.id,
        title: prob.title,
        problem: added,
      });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);
    } catch (e) {
      console.error('Failed to add problem:', e);
    }
  }, [addProblem]);

  const handleRemoveProblem = useCallback(async (prob: CatalogProblem) => {
    const existing = userProblemsMap.get(prob.id) || userProblemsMap.get(prob.url);
    if (!existing) return;

    try {
      await deleteProblem(existing.id);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({
        type: 'removed',
        id: existing.id,
        title: prob.title,
        problem: existing,
      });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);
    } catch (e) {
      console.error('Failed to remove problem:', e);
    }
  }, [deleteProblem, userProblemsMap]);

  const handleUndo = useCallback(async () => {
    if (!toast) return;
    if (toast.type === 'added') {
      await deleteProblem(toast.id);
    } else if (toast.type === 'removed') {
      await restoreProblem(toast.problem);
    }
    setToast(null);
  }, [toast, deleteProblem, restoreProblem]);

  const handleSolve = useCallback((prob: CatalogProblem) => {
    const existing = userProblemsMap.get(prob.id) || userProblemsMap.get(prob.url);
    if (existing) {
      openSolveView(existing);
    } else {
      addProblem({
        catalog_id: prob.id,
        title: prob.title,
        url: prob.url,
        platform: prob.platform,
        difficulty: prob.difficulty || 'medium',
        tags: prob.tags || [],
      }).then((newProb) => {
        openSolveView(newProb);
      });
    }
  }, [userProblemsMap, openSolveView, addProblem]);

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
      setStatsText(`${s.leetcode.toLocaleString()} LeetCode · ${s.codeforces.toLocaleString()} Codeforces · ${s.gfg} GeeksforGeeks`);
    });
  }, []);

  const totalPages = Math.ceil(result.totalMatches / PAGE_SIZE);
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, result.totalMatches);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-graphite">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-surface-border bg-surface shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-serif text-2xl text-paper-primary font-normal">
              Problem catalog
            </h1>
            <p className="text-xs text-paper-secondary mt-0.5">
              {statsText || 'Indexing problem library…'}
            </p>
          </div>
          <button
            onClick={openAddPanel}
            className="btn-primary flex items-center gap-1.5 shrink-0 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to revision</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, number, pattern…"
              className="w-full bg-surface-subtle border border-surface-border rounded-lg pl-8 pr-8 py-2 text-xs text-paper-primary placeholder:text-paper-muted focus:outline-none focus:border-teal transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Platform tabs */}
          <div className="flex items-center bg-surface-subtle border border-surface-border rounded-lg p-0.5 gap-0.5 text-xs">
            {(['all', 'leetcode', 'codeforces', 'gfg'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  platform === p
                    ? 'bg-surface text-paper-primary shadow-xs border border-surface-border'
                    : 'text-paper-muted hover:text-paper-primary'
                }`}
              >
                {p === 'all' ? 'All' : p === 'leetcode' ? 'LeetCode' : p === 'codeforces' ? 'Codeforces' : 'GFG'}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-paper-muted" />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="text-xs bg-surface border border-surface-border rounded-lg px-2 py-2 text-paper-primary focus:outline-none focus:border-teal cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-paper-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs bg-surface border border-surface-border rounded-lg px-2 py-2 text-paper-primary focus:outline-none focus:border-teal cursor-pointer"
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
          <div className="flex flex-col items-center justify-center h-60 gap-3 text-paper-muted">
            <Loader2 className="w-5 h-5 animate-spin text-teal" />
            <span className="text-xs">Loading 15,476 problems…</span>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="px-6 py-2.5 border-b border-surface-border bg-surface-subtle flex items-center justify-between">
              <span className="text-xs text-paper-secondary">
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-teal" /> Filtering…
                  </span>
                ) : result.totalMatches === 0 ? (
                  'No problems match your filters.'
                ) : (
                  <>
                    Showing <span className="font-medium text-paper-primary">{startItem}–{endItem}</span> of{' '}
                    <span className="font-medium text-paper-primary">{result.totalMatches.toLocaleString()}</span> problems
                  </>
                )}
              </span>

              {/* Pagination top */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded text-paper-muted hover:text-paper-primary disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-paper-secondary px-1 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded text-paper-muted hover:text-paper-primary disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Problem rows */}
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-surface-border bg-surface">
                  <th className="text-left px-4 py-2.5 font-medium text-paper-secondary w-20">#</th>
                  <th className="text-left px-2 py-2.5 font-medium text-paper-secondary">Title</th>
                  <th className="text-left px-2 py-2.5 font-medium text-paper-secondary w-24 hidden sm:table-cell">Difficulty</th>
                  <th className="text-left px-2 py-2.5 font-medium text-paper-secondary w-28 hidden md:table-cell">Rating</th>
                  <th className="text-left px-2 py-2.5 font-medium text-paper-secondary hidden lg:table-cell">Archetypes</th>
                  <th className="px-4 py-2.5 w-28 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {result.items.map((prob) => {
                  const added = userProblemsMap.has(prob.id) || userProblemsMap.has(prob.url);
                  return (
                    <ProblemRow
                      key={prob.id}
                      prob={prob}
                      added={added}
                      onAdd={handleAddProblem}
                      onRemove={handleRemoveProblem}
                      onSolve={handleSolve}
                    />
                  );
                })}
                {result.items.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-paper-muted">
                      <p className="text-sm font-medium">No problems found</p>
                      <p className="text-xs mt-1">Try a different search query or platform filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination bottom */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border bg-surface">
                <span className="text-xs text-paper-secondary tabular-nums">
                  Page {page} of {totalPages} · {result.totalMatches.toLocaleString()} total
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setPage(1); window.scrollTo(0, 0); }}
                    disabled={page === 1}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-border text-paper-secondary disabled:opacity-30 hover:bg-surface-hover transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-border text-paper-secondary disabled:opacity-30 hover:bg-surface-hover transition-colors"
                  >
                    Prev
                  </button>

                  {/* Page number buttons */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const offset = Math.max(0, Math.min(page - 3, totalPages - 5));
                    return offset + i + 1;
                  }).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors tabular-nums ${
                        pg === page
                          ? 'bg-teal text-[#0E1614]'
                          : 'border border-surface-border text-paper-secondary hover:bg-surface-hover'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-border text-paper-secondary disabled:opacity-30 hover:bg-surface-hover transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-surface-border text-paper-secondary disabled:opacity-30 hover:bg-surface-hover transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Optimistic Toast Notification with 5s Undo */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#14171F] text-paper-primary rounded-xl shadow-elevated border border-surface-border max-w-md text-xs"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'added' ? 'bg-teal/20 text-teal' : 'bg-ochre/20 text-ochre'
            }`}>
              {toast.type === 'added' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3 h-3" />}
            </div>
            <div className="flex-1 truncate">
              <span>
                {toast.type === 'added' ? 'Added ' : 'Removed '}
                <strong className="font-semibold">{toast.title}</strong>
                {toast.type === 'added' ? ' to revision queue' : ' from revision list'}
              </span>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 font-medium text-teal hover:underline px-2 py-1 rounded hover:bg-surface transition-colors ml-1 shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Row component ────────────────────────────────────────────────────────────
const ProblemRow = React.memo(({
  prob,
  added,
  onAdd,
  onRemove,
  onSolve,
}: {
  prob: CatalogProblem;
  added: boolean;
  onAdd: (prob: CatalogProblem) => Promise<void>;
  onRemove: (prob: CatalogProblem) => Promise<void>;
  onSolve: (prob: CatalogProblem) => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (added) {
        await onRemove(prob);
      } else {
        await onAdd(prob);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr className="hover:bg-surface-hover/70 transition-colors group">
      {/* # / Problem number */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={prob.platform} size="sm" showLabel={false} />
          {prob.problem_number && (
            <span className="text-xs text-paper-secondary tabular-nums">
              {prob.problem_number}
            </span>
          )}
        </div>
      </td>

      {/* Title in Fraunces serif */}
      <td className="px-2 py-2.5 max-w-xs">
        <a
          href={prob.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif text-sm font-normal text-paper-primary hover:text-teal transition-colors inline-flex items-center gap-1 group/link"
        >
          <span className="truncate">{prob.title}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-60 transition-opacity" />
        </a>
        {prob.is_paid_only && (
          <span className="ml-1.5 text-[10px] text-ochre font-medium">Premium</span>
        )}
      </td>

      {/* Difficulty */}
      <td className="px-2 py-2.5 hidden sm:table-cell">
        <DifficultyBadge difficulty={prob.difficulty} size="sm" />
      </td>

      {/* Rating (Codeforces) */}
      <td className="px-2 py-2.5 hidden md:table-cell">
        {prob.rating ? (
          <span className="text-xs text-ochre font-medium tabular-nums">
            ★ {prob.rating}
          </span>
        ) : (
          <span className="text-paper-muted">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="px-2 py-2.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {prob.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border"
            >
              {t}
            </span>
          ))}
          {prob.tags.length > 3 && (
            <span className="text-[11px] text-paper-muted">
              +{prob.tags.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* Action: 1-Tap Add / Remove Toggle & Solve */}
      <td className="px-4 py-2.5 text-right">
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSolve(prob)}
            className="p-1.5 rounded-md text-paper-muted hover:text-teal hover:bg-teal/10 transition-colors"
            title="Open in Solve View"
          >
            <Code2 className="w-3.5 h-3.5" />
          </button>

          {added ? (
            <button
              type="button"
              onClick={handleToggle}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal bg-teal/10 hover:bg-ochre/15 hover:text-ochre hover:border-ochre/30 px-2.5 py-1 rounded-md border border-teal/30 transition-colors group/btn"
              title="Click to remove from revision list (has 5s Undo)"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 group-hover/btn:hidden" />
                  <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:inline" />
                  <span className="group-hover/btn:hidden">In revision</span>
                  <span className="hidden group-hover/btn:inline">Remove</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggle}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 text-xs font-medium text-paper-primary hover:text-teal bg-surface-subtle hover:bg-surface-hover px-2.5 py-1 rounded-md border border-surface-border transition-colors disabled:opacity-50"
              title="Add to revision queue"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>+ Add</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

ProblemRow.displayName = 'ProblemRow';
