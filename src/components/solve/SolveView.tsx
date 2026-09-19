import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Info,
  ChevronRight,
  Check,
  FileText,
} from 'lucide-react';
import { Problem, RecallRating, Platform } from '../../types';
import { PlatformBadge } from '../problems/PlatformBadge';
import { DifficultyBadge } from '../problems/DifficultyBadge';
import { CodeCompiler } from '../compiler/CodeCompiler';
import { useProblemStore } from '../../store/useProblemStore';
import { calculateSM2 } from '../../lib/spacedRepetition';
import confetti from 'canvas-confetti';

interface SolveViewProps {
  problem: Problem;
  onClose: () => void;
  onNext?: () => void;
}

export const SolveView: React.FC<SolveViewProps> = ({ problem, onClose, onNext }) => {
  const updateProblem = useProblemStore((s) => s.updateProblem);
  const reviewProblem = useProblemStore((s) => s.reviewProblem);

  // Split view width percentage for desktop (left panel width)
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(38);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Private Notes state with debounced autosave
  const [notes, setNotes] = useState(problem.notes || '');
  const [notesStatus, setNotesStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recall rating feedback
  const [ratedSchedule, setRatedSchedule] = useState<{ rating: RecallRating; intervalDays: number; nextDate: string } | null>(null);

  // Keep notes state in sync if problem prop changes
  useEffect(() => {
    setNotes(problem.notes || '');
    setRatedSchedule(null);
  }, [problem.id, problem.notes]);

  // Debounced notes autosave
  const handleNotesChange = (newVal: string) => {
    setNotes(newVal);
    setNotesStatus('saving');
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(async () => {
      await updateProblem(problem.id, { notes: newVal });
      setNotesStatus('saved');
      setTimeout(() => setNotesStatus('idle'), 1200);
    }, 1200);
  };

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in textarea/input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        onClose();
      }

      if (!isInput) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, problem]);

  // Resizable divider drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = moveEvent.clientX - rect.left;
      const newPercent = (relativeX / rect.width) * 100;
      if (newPercent >= 22 && newPercent <= 65) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleRate = async (rating: RecallRating) => {
    const sm2 = calculateSM2(problem, rating);
    await reviewProblem(problem.id, rating);
    setRatedSchedule({
      rating,
      intervalDays: sm2.interval_days,
      nextDate: sm2.next_review_date,
    });

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.85, x: 0.2 },
        colors: ['#4C9F4C', '#E8791A'],
      });
    } catch {
      // safe fallback
    }
  };

  const getPlatformDisplayName = (p: Platform) => {
    switch (p) {
      case 'leetcode':
        return 'LeetCode';
      case 'codeforces':
        return 'Codeforces';
      case 'gfg':
        return 'GeeksforGeeks';
    }
  };

  const platformName = getPlatformDisplayName(problem.platform);

  // Pre-calculate SM-2 previews for rating buttons
  const sm2Again = calculateSM2(problem, 'again');
  const sm2Hard = calculateSM2(problem, 'hard');
  const sm2Good = calculateSM2(problem, 'good');
  const sm2Easy = calculateSM2(problem, 'easy');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface text-ink overflow-hidden">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <header className="h-14 px-4 sm:px-6 border-b border-line bg-surface flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-xs font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover transition-colors"
            title="Close workspace (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-line hidden sm:block" />

          {/* Title & Platform */}
          <div className="flex items-center gap-2 truncate">
            <PlatformBadge platform={problem.platform} size="sm" />
            <h1 className="font-medium text-sm text-ink truncate max-w-xs sm:max-w-md">
              {problem.title}
            </h1>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Open original problem in new tab"
          >
            <span>Open problem</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </a>

          {onNext && (
            <button
              onClick={onNext}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <span>Next due</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ── Main Workspace: Two-Panel Split Layout ───────────────────────────── */}
      <div
        ref={containerRef}
        className={`flex-1 flex flex-col md:flex-row overflow-hidden select-none ${
          isDragging ? 'cursor-col-resize' : ''
        }`}
      >
        {/* ── Left Panel: Problem Metadata, Platform Link & Notes ──────────────── */}
        <div
          className="flex flex-col bg-surface border-b md:border-b-0 md:border-r border-line overflow-y-auto w-full md:shrink-0 md:grow-0"
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${leftWidthPercent}%` : '100%' }}
        >
          <div className="p-5 sm:p-6 space-y-5 select-text flex-1">
            {/* 1. Copyright Compliance & Workflow Notice */}
            <div className="p-3.5 rounded-[10px] bg-surface-subtle border border-line text-xs text-ink-secondary flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#2D5A6B] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold block text-ink mb-0.5">Problem instructions:</span>
                <span>
                  Review the full problem description on <strong className="font-semibold text-ink">{platformName}</strong> using the link below, then write and verify your implementation here.
                </span>
              </div>
            </div>

            {/* 2. Platform Link Card */}
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-[10px] bg-surface-subtle border border-line hover:border-[#2D5A6B]/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={problem.platform} size="sm" />
                  <span className="text-xs font-medium text-ink group-hover:text-[#2D5A6B] transition-colors">
                    Official problem on {platformName}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-ink-muted group-hover:text-[#2D5A6B] transition-colors" />
              </div>
              <p className="text-[11px] text-ink-muted truncate max-w-full font-mono">
                {problem.url}
              </p>
            </a>

            {/* 3. Tags & Topics */}
            {problem.tags && problem.tags.length > 0 && (
              <div>
                <div className="text-xs font-medium text-ink-muted mb-2">
                  Algorithmic archetypes
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-[10px] bg-surface-subtle text-ink-secondary border border-line"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Private Notes & Intuition Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
                  <FileText className="w-3.5 h-3.5 text-ink-secondary" />
                  <span>My approach & notes</span>
                </div>
                {notesStatus === 'saving' && (
                  <span className="text-[10px] text-ink-muted">Saving…</span>
                )}
                {notesStatus === 'saved' && (
                  <span className="text-[10px] text-[#5A9367] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Saved</span>
                  </span>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Record key algorithmic invariants, edge cases, time/space complexity, or pitfalls for future recall…"
                className="w-full h-36 bg-surface-subtle border border-line rounded-[10px] p-3 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-[#2D5A6B] resize-none transition-colors leading-relaxed font-mono"
              />
            </div>

            {/* 5. Recall Schedule & SM-2 Rating Loop */}
            <div className="pt-3 border-t border-line space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">Schedule review (SM-2):</span>
                <span className="text-ink-muted text-[11px] hidden sm:inline">Keys: 1, 2, 3, 4</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate('again')}
                  className="flex flex-col items-center justify-center p-2 rounded-[10px] bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-[#C25B5B] border border-rose-200 dark:border-rose-900/40 transition-colors"
                >
                  <span className="font-medium text-xs">Needs work (1)</span>
                  <span className="text-[10px] opacity-80 mt-0.5">+{sm2Again.interval_days}d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('hard')}
                  className="flex flex-col items-center justify-center p-2 rounded-[10px] bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 text-[#C4923A] border border-amber-200 dark:border-amber-900/40 transition-colors"
                >
                  <span className="font-medium text-xs">Struggled (2)</span>
                  <span className="text-[10px] opacity-80 mt-0.5">+{sm2Hard.interval_days}d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('good')}
                  className="flex flex-col items-center justify-center p-2 rounded-[10px] bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 dark:hover:bg-sky-950/30 text-[#2D5A6B] dark:text-[#58A6BA] border border-sky-200 dark:border-sky-900/40 transition-colors"
                >
                  <span className="font-medium text-xs">Remembered (3)</span>
                  <span className="text-[10px] opacity-80 mt-0.5">+{sm2Good.interval_days}d</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('easy')}
                  className="flex flex-col items-center justify-center p-2 rounded-[10px] bg-[#5A9367] text-white hover:bg-[#4d8058] transition-colors font-medium border border-[#5A9367]"
                >
                  <span className="text-xs">Instinctive (4)</span>
                  <span className="text-[10px] opacity-90 mt-0.5">+{sm2Easy.interval_days}d</span>
                </button>
              </div>

              {/* Scheduled Success Toast */}
              {ratedSchedule && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-[#5A9367] text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5A9367] shrink-0" />
                    <span>
                      Review scheduled in <strong>{ratedSchedule.intervalDays} day{ratedSchedule.intervalDays !== 1 ? 's' : ''}</strong> ({ratedSchedule.nextDate})
                    </span>
                  </div>
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="font-medium text-ink underline hover:text-ink-secondary shrink-0 ml-2"
                    >
                      Next problem
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop Resizable Draggable Divider ─────────────────────────────── */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex items-center justify-center w-2 hover:w-2 bg-surface hover:bg-ink/80 transition-colors cursor-col-resize group shrink-0 select-none z-10"
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-8 rounded bg-line group-hover:bg-ink-secondary transition-colors" />
        </div>

        {/* ── Right Panel: Monaco Code Compiler ───────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface p-2 sm:p-3">
          <CodeCompiler problemId={problem.id} problemTitle={problem.title} />
        </div>
      </div>
    </div>
  );
};
