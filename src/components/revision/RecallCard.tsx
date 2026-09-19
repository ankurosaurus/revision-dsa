import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Problem, RecallRating } from '../../types';
import { PlatformBadge } from '../problems/PlatformBadge';
import { DifficultyBadge } from '../problems/DifficultyBadge';
import { isProblemOverdue, getDaysUntilDue, calculateSM2 } from '../../lib/spacedRepetition';
import {
  ExternalLink,
  Eye,
  RotateCcw,
  Check,
  Sparkles,
  Maximize2,
  Edit3,
  Save,
  Loader2,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';

interface RecallCardProps {
  problem: Problem;
  onRate: (rating: RecallRating) => void;
}

export const RecallCard: React.FC<RecallCardProps> = ({ problem, onRate }) => {
  const openSolveView = useUIStore((s) => s.openSolveView);
  const updateProblem = useProblemStore((s) => s.updateProblem);

  const [isNotesRevealed, setIsNotesRevealed] = useState(false);
  const [userNotes, setUserNotes] = useState(problem.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOverdue = isProblemOverdue(problem.next_review_date);
  const daysUntil = getDaysUntilDue(problem.next_review_date);

  // Synchronize state when problem changes
  useEffect(() => {
    setUserNotes(problem.notes || '');
    setIsEditingNotes(false);
    setIsNotesRevealed(false);
    setSaveSuccess(false);
  }, [problem.id, problem.notes]);

  const sm2Again = calculateSM2(problem, 'again');
  const sm2Hard = calculateSM2(problem, 'hard');
  const sm2Good = calculateSM2(problem, 'good');
  const sm2Easy = calculateSM2(problem, 'easy');

  // Keyboard navigation: Space to reveal, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsNotesRevealed((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        onRate('again');
      } else if (e.key === '2') {
        e.preventDefault();
        onRate('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        onRate('good');
      } else if (e.key === '4') {
        e.preventDefault();
        onRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate]);

  // Save notes handler
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateProblem(problem.id, { notes: userNotes });
      setSaveSuccess(true);
      setIsEditingNotes(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Flashcard Panel */}
      <motion.div
        key={problem.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 sm:p-8 flex flex-col shadow-card transition-all"
      >
        {/* Card Header: Platform, Difficulty & Due status (no yellow/orange) */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <PlatformBadge platform={problem.platform} size="sm" />
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
          </div>

          <div>
            {isOverdue ? (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-[6px] bg-[#C25B5B]/10 text-[#C25B5B] border border-[#C25B5B]/20">
                Overdue ({Math.abs(daysUntil)}d)
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]">
                Due today
              </span>
            )}
          </div>
        </div>

        {/* Problem Title & Action Links */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#1C1C1E] leading-tight tracking-tight">
              {problem.title}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openSolveView(problem)}
                className="btn-primary px-3 py-1.5 text-[13px] inline-flex items-center gap-1.5 font-medium"
                title="Open solve workspace with compiler and problem link"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Solve workspace</span>
              </button>

              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Open problem in new tab"
                className="btn-secondary px-3 py-1.5 text-[13px] inline-flex items-center gap-1.5"
              >
                <span>Open</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </div>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Active Recall Area */}
        <div className="w-full mb-6">
          <AnimatePresence mode="wait">
            {!isNotesRevealed ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="rounded-[10px] border border-dashed border-[#E5E4E0] p-6 text-center bg-[#FAFAF8] flex flex-col items-center justify-center min-h-[160px]"
              >
                <Eye className="w-5 h-5 text-[#8E8E93] mb-2" strokeWidth={1.8} />
                <p className="text-[15px] font-medium text-[#1C1C1E] mb-1">
                  Active mental recall
                </p>
                <p className="text-[13px] text-[#6E6E73] max-w-sm mb-4 leading-relaxed">
                  Mentally reconstruct the algorithm, data structures, and edge cases before checking your notes.
                </p>

                <button
                  type="button"
                  onClick={() => setIsNotesRevealed(true)}
                  className="btn-secondary text-[13px] flex items-center gap-2 font-medium"
                >
                  <span>{userNotes ? 'Reveal approach notes' : 'Write / add notes'}</span>
                  <kbd className="text-[10px] bg-[#FFFFFF] px-1.5 py-0.5 rounded-[4px] border border-[#E5E4E0] text-[#8E8E93]">
                    Space
                  </kbd>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="rounded-[10px] border border-[#E5E4E0] bg-[#FAFAF8] p-5 min-h-[160px] flex flex-col justify-between"
              >
                {/* Notes Header */}
                <div className="flex items-center justify-between mb-3 border-b border-[#E5E4E0] pb-2">
                  <span className="text-[13px] font-medium text-[#1C1C1E]">
                    Your approach notes & intuition
                  </span>

                  <div className="flex items-center gap-2.5">
                    {saveSuccess && (
                      <span className="text-[12px] text-[#5A9367] flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}

                    {userNotes && !isEditingNotes && (
                      <button
                        type="button"
                        onClick={() => setIsEditingNotes(true)}
                        className="text-[12px] text-[#2D5A6B] hover:underline transition-colors font-medium flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit notes</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsNotesRevealed(false)}
                      className="text-[12px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                </div>

                {/* Notes Body / Editor */}
                {isEditingNotes || !userNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Write your personal approach notes, key invariants, time/space complexity, and edge cases to recall next time..."
                      rows={5}
                      className="w-full bg-[#FFFFFF] border border-[#E5E4E0] rounded-[8px] p-3 text-[13px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#2D5A6B] resize-y leading-relaxed font-sans"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#8E8E93]">
                        Notes saved here will be stored for future recall sessions.
                      </span>

                      <div className="flex items-center gap-2">
                        {userNotes && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserNotes(problem.notes || '');
                              setIsEditingNotes(false);
                            }}
                            className="text-[12px] text-[#8E8E93] hover:text-[#1C1C1E] px-2 py-1"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          disabled={isSaving}
                          className="btn-primary text-[12px] px-3.5 py-1.5 flex items-center gap-1.5 font-medium"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          <span>Save notes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[13px] text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">
                      {userNotes}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SM-2 Recall Rating Bar */}
        <div className="pt-4 border-t border-[#E5E4E0]">
          <div className="flex items-center justify-between text-[13px] text-[#6E6E73] mb-3">
            <span>Rate recall to schedule next repetition:</span>
            <span className="hidden sm:inline text-[#8E8E93]">Keys: 1, 2, 3, 4</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Again: reset to 1d */}
            <button
              type="button"
              onClick={() => onRate('again')}
              className="flex flex-col items-center justify-center p-2.5 rounded-[10px] bg-[#C25B5B]/10 hover:bg-[#C25B5B]/15 text-[#C25B5B] border border-[#C25B5B]/25 transition-colors"
            >
              <div className="flex items-center gap-1 font-medium text-[13px]">
                <RotateCcw className="w-3 h-3" strokeWidth={1.8} />
                <span>Needs work (1)</span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                +{sm2Again.interval_days}d
              </div>
            </button>

            {/* Hard: 1.2x */}
            <button
              type="button"
              onClick={() => onRate('hard')}
              className="flex flex-col items-center justify-center p-2.5 rounded-[10px] bg-[#FFFFFF] hover:bg-[#F7F7F5] text-[#1C1C1E] border border-[#E5E4E0] transition-colors shadow-xs"
            >
              <div className="flex items-center gap-1 font-medium text-[13px]">
                <span>Struggled (2)</span>
              </div>
              <div className="text-[11px] text-[#6E6E73] mt-0.5">
                +{sm2Hard.interval_days}d
              </div>
            </button>

            {/* Good: SM-2 */}
            <button
              type="button"
              onClick={() => onRate('good')}
              className="flex flex-col items-center justify-center p-2.5 rounded-[10px] bg-[#5A9367]/10 hover:bg-[#5A9367]/15 text-[#5A9367] border border-[#5A9367]/25 transition-colors"
            >
              <div className="flex items-center gap-1 font-medium text-[13px]">
                <Check className="w-3 h-3" strokeWidth={1.8} />
                <span>Remembered (3)</span>
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                +{sm2Good.interval_days}d
              </div>
            </button>

            {/* Easy: SM-2 boosted */}
            <button
              type="button"
              onClick={() => onRate('easy')}
              className="flex flex-col items-center justify-center p-2.5 rounded-[10px] bg-[#2D5A6B] text-white hover:bg-[#234754] transition-colors font-medium shadow-xs"
            >
              <div className="flex items-center gap-1 text-[13px]">
                <Sparkles className="w-3 h-3" strokeWidth={1.8} />
                <span>Instinctive (4)</span>
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                +{sm2Easy.interval_days}d
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
