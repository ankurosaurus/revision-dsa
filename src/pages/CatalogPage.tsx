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
  const [platform, setPlatform] = useState<Platform | 'all'>('leetcode');
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

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPage({ q: query, plat: platform, diff: difficulty, pg: page, srt: sort });
    }, query ? 200 : 0);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, platform, difficulty, page, sort, fetchPage]);

  useEffect(() => { setPage(1); }, [query, platform, difficulty, sort]);

  useEffect(() => {
    getCatalogStats().then((s) => {
      setStatsText(`${s.leetcode.toLocaleString()} LeetCode, ${s.codeforces.toLocaleString()} Codeforces, ${s.gfg} GeeksforGeeks`);
    });
  }, []);

  const totalPages = Math.ceil(result.totalMatches / PAGE_SIZE);
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, result.totalMatches);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#FFFFFF]">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-[#E5E4E0] bg-[#FFFFFF] shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#1C1C1E]">
              Problem Catalog
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-0.5">
              {statsText || 'Indexing problem library…'}
            </p>
          </div>
          <button
            onClick={openAddPanel}
            className="btn-primary flex items-center gap-1.5 shrink-0 text-[13px]"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Add to revision</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" strokeWidth={1.8} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, number, pattern…"
              className="w-full bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] pl-8 pr-8 py-2 text-[13px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#2D5A6B] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            )}
          </div>

          {/* Platform tabs */}
          <div className="flex items-center bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] p-0.5 gap-0.5 text-[13px]">
            {(['all', 'leetcode', 'codeforces', 'gfg'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-[6px] font-medium transition-all ${
                  platform === p
                    ? 'bg-[#FFFFFF] text-[#1C1C1E] shadow-xs border border-[#E5E4E0]'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                {p === 'all' ? 'All' : p === 'leetcode' ? 'LeetCode' : p === 'codeforces' ? 'Codeforces' : 'GFG'}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={1.8} />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="text-[13px] bg-[#FFFFFF] border border-[#E5E4E0] rounded-[8px] px-2 py-2 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B] cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={1.8} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-[13px] bg-[#FFFFFF] border border-[#E5E4E0] rounded-[8px] px-2 py-2 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B] cursor-pointer"
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
          <div className="flex flex-col items-center justify-center h-60 gap-3 text-[#8E8E93]">
            <Loader2 className="w-5 h-5 animate-spin text-[#2D5A6B]" strokeWidth={1.8} />
            <span className="text-[13px]">Loading 15,476 problems…</span>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="px-6 py-2.5 border-b border-[#E5E4E0] bg-[#FAFAF8] flex items-center justify-between">
              <span className="text-[13px] text-[#6E6E73]">
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-[#2D5A6B]" strokeWidth={1.8} /> Filtering…
                  </span>
                ) : result.totalMatches === 0 ? (
                  'No problems match your filters.'
                ) : (
                  <>
                    Showing <span className="font-medium text-[#1C1C1E]">{startItem}–{endItem}</span> of{' '}
                    <span className="font-medium text-[#1C1C1E]">{result.totalMatches.toLocaleString()}</span> problems
                  </>
                )}
              </span>

              {/* Pagination top */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                  <span className="text-[12px] text-[#6E6E73] px-1 tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              )}
            </div>

            {/* Problem rows */}
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E4E0] bg-[#FFFFFF]">
                  <th className="text-left px-4 py-2.5 font-medium text-[#6E6E73] w-20">#</th>
                  <th className="text-left px-2 py-2.5 font-medium text-[#6E6E73]">Title</th>
                  <th className="text-left px-2 py-2.5 font-medium text-[#6E6E73] w-24 hidden sm:table-cell">Difficulty</th>
                  <th className="text-left px-2 py-2.5 font-medium text-[#6E6E73] w-28 hidden md:table-cell">Rating</th>
                  <th className="text-left px-2 py-2.5 font-medium text-[#6E6E73] hidden lg:table-cell">Archetypes</th>
                  <th className="px-4 py-2.5 w-28 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4E0]">
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
                    <td colSpan={6} className="py-16 text-center text-[#8E8E93]">
                      <p className="text-[15px] font-medium text-[#1C1C1E]">No problems found</p>
                      <p className="text-[13px] mt-1">Try a different search query or platform filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination bottom */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E4E0] bg-[#FFFFFF]">
                <span className="text-[13px] text-[#6E6E73] tabular-nums">
                  Page {page} of {totalPages} ({result.totalMatches.toLocaleString()} total)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setPage(1); window.scrollTo(0, 0); }}
                    disabled={page === 1}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] border border-[#E5E4E0] text-[#6E6E73] disabled:opacity-30 hover:bg-[#F7F7F5] transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] border border-[#E5E4E0] text-[#6E6E73] disabled:opacity-30 hover:bg-[#F7F7F5] transition-colors"
                  >
                    Prev
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const offset = Math.max(0, Math.min(page - 3, totalPages - 5));
                    return offset + i + 1;
                  }).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-7 h-7 text-[12px] font-medium rounded-[6px] transition-colors tabular-nums ${
                        pg === page
                          ? 'bg-[#2D5A6B] text-white'
                          : 'border border-[#E5E4E0] text-[#6E6E73] hover:bg-[#F7F7F5]'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] border border-[#E5E4E0] text-[#6E6E73] disabled:opacity-30 hover:bg-[#F7F7F5] transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 text-[12px] font-medium rounded-[6px] border border-[#E5E4E0] text-[#6E6E73] disabled:opacity-30 hover:bg-[#F7F7F5] transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] text-[#1C1C1E] rounded-[10px] shadow-modal border border-[#E5E4E0] max-w-md text-[13px]"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'added' ? 'bg-[#5A9367]/15 text-[#5A9367]' : 'bg-[#C25B5B]/15 text-[#C25B5B]'
            }`}>
              {toast.type === 'added' ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} /> : <Trash2 className="w-3 h-3" strokeWidth={1.8} />}
            </div>
            <div className="flex-1 truncate">
              <span>
                {toast.type === 'added' ? 'Added ' : 'Removed '}
                <strong className="font-medium">{toast.title}</strong>
                {toast.type === 'added' ? ' to revision queue' : ' from revision list'}
              </span>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 font-medium text-[#2D5A6B] hover:underline px-2 py-1 rounded-[6px] hover:bg-[#F7F7F5] transition-colors ml-1 shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" strokeWidth={1.8} />
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
    <tr className="hover:bg-[#F7F7F5] transition-colors group">
      {/* # / Problem number */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <PlatformBadge platform={prob.platform} size="sm" showLabel={false} />
          {prob.problem_number && (
            <span className="text-[12px] text-[#6E6E73] tabular-nums">
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
          className="text-[14px] font-medium text-[#1C1C1E] hover:text-[#2D5A6B] transition-colors inline-flex items-center gap-1 group/link"
        >
          <span className="truncate">{prob.title}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-60 transition-opacity" strokeWidth={1.8} />
        </a>
        {prob.is_paid_only && (
          <span className="ml-1.5 text-[10px] text-[#C4923A] font-medium">Premium</span>
        )}
      </td>

      {/* Difficulty */}
      <td className="px-2 py-2.5 hidden sm:table-cell">
        <DifficultyBadge difficulty={prob.difficulty} size="sm" />
      </td>

      {/* Rating (Codeforces) */}
      <td className="px-2 py-2.5 hidden md:table-cell">
        {prob.rating ? (
          <span className="text-[12px] text-[#6E6E73] font-medium tabular-nums">
            ★ {prob.rating}
          </span>
        ) : (
          <span className="text-[#8E8E93]">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="px-2 py-2.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {prob.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]"
            >
              {t}
            </span>
          ))}
          {prob.tags.length > 3 && (
            <span className="text-[11px] text-[#8E8E93]">
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
            className="p-1.5 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F7F7F5] transition-colors"
            title="Open in Solve View"
          >
            <Code2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          </button>

          {added ? (
            <button
              type="button"
              onClick={handleToggle}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#5A9367] bg-[#5A9367]/10 hover:bg-[#C25B5B]/10 hover:text-[#C25B5B] hover:border-[#C25B5B]/20 px-2.5 py-1 rounded-[6px] border border-[#5A9367]/25 transition-colors group/btn"
              title="Click to remove from revision list (has 5s Undo)"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 group-hover/btn:hidden" strokeWidth={1.8} />
                  <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:inline" strokeWidth={1.8} />
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
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1C1C1E] hover:text-[#2D5A6B] bg-[#FAFAF8] hover:bg-[#F7F7F5] px-2.5 py-1 rounded-[6px] border border-[#E5E4E0] transition-colors disabled:opacity-50"
              title="Add to revision queue"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />
              ) : (
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
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
