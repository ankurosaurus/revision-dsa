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

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#1C1C1E]">
              Problem Bank
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-[6px] bg-[#FFFFFF] border border-[#E5E4E0] text-[#6E6E73] tabular-nums shadow-xs">
              {filteredProblems.length} of {problems.length}
            </span>
          </div>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            Filter, search, and inspect revision schedules across your algorithmic question library.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (Table / Grid) */}
          <div className="flex items-center p-0.5 rounded-[8px] bg-[#FFFFFF] border border-[#E5E4E0] shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-[6px] transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#F7F7F5] text-[#1C1C1E]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[6px] transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#F7F7F5] text-[#1C1C1E]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>

          <button
            onClick={openAddPanel}
            className="btn-primary text-[13px] flex items-center gap-1.5 py-1.5 px-3"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Add problem</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="p-3 rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] shadow-card space-y-2.5">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {/* Platform */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] px-2.5 py-1.5 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B]"
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
            className="bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] px-2.5 py-1.5 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B]"
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
            className="bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] px-2.5 py-1.5 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B] max-w-[150px]"
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
            className="bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] px-2.5 py-1.5 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B]"
          >
            <option value="all">All statuses</option>
            <option value="learning">Learning (&lt;5 reps)</option>
            <option value="mastered">Mastered (5+ reps)</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={1.8} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAFAF8] border border-[#E5E4E0] rounded-[8px] px-2.5 py-1.5 text-[#1C1C1E] focus:outline-none focus:border-[#2D5A6B]"
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
              className="px-2.5 py-1.5 rounded-[8px] border border-[#E5E4E0] bg-[#FAFAF8] text-[#6E6E73] hover:text-[#1C1C1E] flex items-center gap-1 transition-colors"
              title="Reset filters"
            >
              <X className="w-3 h-3" strokeWidth={1.8} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Problem Content */}
      {filteredProblems.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-8 flex flex-col items-center justify-center shadow-card">
          <BookOpen className="w-8 h-8 text-[#8E8E93] mb-3" strokeWidth={1.8} />
          <h3 className="text-[17px] font-semibold text-[#1C1C1E] mb-1">
            No matching problems
          </h3>
          <p className="text-[13px] text-[#6E6E73] mb-5 max-w-sm">
            {hasActiveFilters
              ? 'Try adjusting your search query or clearing active filters.'
              : 'Your problem bank is empty. Log problems you solve on LeetCode, GFG, or Codeforces to start tracking them.'}
          </p>
          <div className="flex items-center gap-2.5">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary text-[13px]"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={openAddPanel}
              className="btn-primary text-[13px] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
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
            className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#FFFFFF] text-[#1C1C1E] rounded-[10px] shadow-modal border border-[#E5E4E0] max-w-md text-[13px]"
          >
            <div className="w-5 h-5 rounded-full bg-[#C25B5B]/10 text-[#C25B5B] flex items-center justify-center shrink-0">
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <div className="flex-1 truncate">
              <span>Removed <strong className="font-medium">{toast.title}</strong> from problem bank</span>
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
