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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to dense ledger table view
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
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl text-paper-primary font-normal">
              Problem bank
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border text-paper-secondary tabular-nums">
              {filteredProblems.length} of {problems.length}
            </span>
          </div>
          <p className="text-xs text-paper-secondary mt-0.5">
            Filter, search, and inspect revision schedules across your algorithmic question library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Table / Grid) */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface border border-surface-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-surface-hover text-paper-primary shadow-xs'
                  : 'text-paper-muted hover:text-paper-primary'
              }`}
              title="Ledger Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-surface-hover text-paper-primary shadow-xs'
                  : 'text-paper-muted hover:text-paper-primary'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddPanel}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add problem</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="p-3 rounded-xl border border-surface-border bg-surface shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Platform */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-paper-primary focus:outline-none focus:border-teal"
          >
            <option value="all">All platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="gfg">GeeksforGeeks</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className="bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-paper-primary focus:outline-none focus:border-teal"
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Pattern */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-paper-primary focus:outline-none focus:border-teal max-w-[150px]"
          >
            <option value="all">All patterns</option>
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
            className="bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-paper-primary focus:outline-none focus:border-teal"
          >
            <option value="all">All statuses</option>
            <option value="learning">Learning (&lt;5 reps)</option>
            <option value="mastered">Mastered (5+ reps)</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-paper-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-paper-primary focus:outline-none focus:border-teal"
            >
              <option value="review_asc">Next review (urgent first)</option>
              <option value="created_desc">Recently added</option>
              <option value="reps_desc">Most reviewed</option>
              <option value="diff_asc">Difficulty (easy to hard)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-subtle text-paper-secondary hover:text-paper-primary flex items-center gap-1 transition-colors"
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
          <BookOpen className="w-8 h-8 text-paper-muted mb-3" />
          <h3 className="font-serif text-lg text-paper-primary font-normal mb-1">
            No matching problems
          </h3>
          <p className="text-xs text-paper-secondary mb-5 max-w-sm">
            {hasActiveFilters
              ? 'Try adjusting your search query or clearing active filters.'
              : 'Your problem bank is empty. Log problems you solve on LeetCode, GFG, or Codeforces to start tracking them.'}
          </p>
          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary text-xs"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={openAddPanel}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log problem</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <ProblemTable
          problems={filteredProblems}
          onSelectForReview={() => setActiveTab('queue')}
          onRemove={handleRemoveProblem}
          onSolve={openSolveView}
        />
      ) : (
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
      )}

      {/* 5-Second Undo Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#14171F] text-paper-primary rounded-xl shadow-elevated border border-surface-border max-w-md text-xs"
          >
            <div className="w-5 h-5 rounded-full bg-ochre/20 text-ochre flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 truncate">
              <span>Removed <strong className="font-semibold">{toast.title}</strong> from problem bank</span>
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
