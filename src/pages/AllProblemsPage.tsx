import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';
import { ProblemCard } from '../components/problems/ProblemCard';
import { ProblemTable } from '../components/problems/ProblemTable';
import { searchProblems } from '../lib/fuzzySearch';
import { PRESET_TAGS } from '../lib/sampleData';
import { Platform, Difficulty, Problem } from '../types';
import {
  LayoutGrid,
  List,
  Plus,
  X,
  ArrowUpDown,
  BookOpen,
  Trash2,
  Undo2,
} from 'lucide-react';

export const AllProblemsPage: React.FC = () => {
  const problems = useProblemStore((s) => s.problems);
  const deleteProblem = useProblemStore((s) => s.deleteProblem);
  const restoreProblem = useProblemStore((s) => s.restoreProblem);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openSolveView = useUIStore((s) => s.openSolveView);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  // 5-Second Undo Toast state
  const [toast, setToast] = useState<{ id: string; title: string; problem: Problem } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRemoveProblem = async (problem: Problem) => {
    try {
      await deleteProblem(problem.id);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ id: problem.id, title: problem.title, problem });
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    } catch (e) {
      console.error('Failed to delete problem:', e);
    }
  };

  const handleUndo = async () => {
    if (!toast) return;
    await restoreProblem(toast.problem);
    setToast(null);
  };

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [sortBy, setSortBy] = useState<'created_desc' | 'review_asc' | 'diff_asc' | 'reps_desc'>(
    'review_asc'
  );

  const filteredProblems = useMemo(() => {
    let list = searchProblems(problems, searchQuery);

    if (selectedPlatform !== 'all') {
      list = list.filter((p) => p.platform === selectedPlatform);
    }
    if (selectedDifficulty !== 'all') {
      list = list.filter((p) => p.difficulty === selectedDifficulty);
    }
    if (selectedTag !== 'all') {
      list = list.filter((p) => p.tags.includes(selectedTag));
    }
    if (statusFilter === 'mastered') {
      list = list.filter((p) => p.repetitions >= 5);
    } else if (statusFilter === 'learning') {
      list = list.filter((p) => p.repetitions < 5);
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'review_asc') {
        return a.next_review_date.localeCompare(b.next_review_date);
      }
      if (sortBy === 'reps_desc') {
        return b.repetitions - a.repetitions;
      }
      if (sortBy === 'diff_asc') {
        const order = { easy: 1, medium: 2, hard: 3 };
        return (order[a.difficulty || 'medium'] || 2) - (order[b.difficulty || 'medium'] || 2);
      }
      return 0;
    });

    return list;
  }, [problems, searchQuery, selectedPlatform, selectedDifficulty, selectedTag, statusFilter, sortBy]);

  const hasActiveFilters =
    selectedPlatform !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedTag !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(searchQuery.trim());

  const clearAllFilters = () => {
    setSelectedPlatform('all');
    setSelectedDifficulty('all');
    setSelectedTag('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Problem Bank</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-600 dark:text-neutral-300">
              {filteredProblems.length} of {problems.length}
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Filter, search, and inspect revision schedules across your algorithmic question library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Grid / Table) */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-dark-surface border border-neutral-200 dark:border-dark-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-surfaceHover text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-dark-surfaceHover text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddPanel}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Platform */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="gfg">GeeksforGeeks</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className="bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Pattern */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500 max-w-[150px]"
          >
            <option value="all">All Patterns</option>
            {PRESET_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Mastery Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Status</option>
            <option value="learning">Learning (&lt;5 reps)</option>
            <option value="mastered">Mastered (5+ reps)</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-brand-500"
            >
              <option value="review_asc">Next Review (Urgent first)</option>
              <option value="created_desc">Recently Added</option>
              <option value="reps_desc">Most Reviewed</option>
              <option value="diff_asc">Difficulty (Easy to Hard)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-bg text-neutral-500 hover:text-neutral-800 dark:hover:text-white flex items-center gap-1 transition-colors"
              title="Reset filters"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Problem Content */}
      {filteredProblems.length === 0 ? (
        <div className="py-16 text-center saas-card p-8 flex flex-col items-center justify-center">
          <BookOpen className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
            No problems found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-5 max-w-sm">
            {hasActiveFilters
              ? 'Try adjusting your search query or clearing active filters.'
              : 'Your problem bank is currently empty. Log problems you solve on LeetCode, GFG, or Codeforces to start tracking them.'}
          </p>
          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary text-xs"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={openAddPanel}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Problem</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelectForReview={() => setActiveTab('queue')}
              onRemove={handleRemoveProblem}
              onSolve={openSolveView}
            />
          ))}
        </div>
      ) : (
        <ProblemTable
          problems={filteredProblems}
          onSelectForReview={() => setActiveTab('queue')}
          onRemove={handleRemoveProblem}
          onSolve={openSolveView}
        />
      )}

      {/* 5-Second Undo Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-900 dark:bg-dark-surface text-white rounded-xl shadow-2xl border border-neutral-700/80 dark:border-dark-border max-w-md text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 truncate">
              <span>Removed <strong className="text-white font-semibold">{toast.title}</strong> from problem bank</span>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300 px-2.5 py-1 rounded hover:bg-white/10 transition-colors ml-1 shrink-0"
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
