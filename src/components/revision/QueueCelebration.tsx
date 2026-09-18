import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Plus } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useStreak } from '../../hooks/useStreak';

interface QueueCelebrationProps {
  onResetSession?: () => void;
}

export const QueueCelebration: React.FC<QueueCelebrationProps> = () => {
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const streak = useStreak();

  useEffect(() => {
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#4F9C8D', '#C98A3B'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto saas-card p-8 text-center flex flex-col items-center">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-teal/15 text-teal flex items-center justify-center mb-4 border border-teal/30">
        <Check className="w-5 h-5" />
      </div>

      <h2 className="font-serif text-2xl font-normal text-paper-primary mb-1">
        Queue clear. Next review due tomorrow.
      </h2>
      <p className="text-xs text-paper-secondary max-w-sm mb-6 leading-relaxed">
        All due problems for today have been reviewed. Spaced repetition intervals have been recalculated.
      </p>

      {/* Summary Stats */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-center">
          <div className="font-serif text-2xl font-normal text-paper-primary tabular-nums">
            {streak.currentStreak}d
          </div>
          <div className="text-xs text-paper-secondary mt-0.5">
            Active streak
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-center">
          <div className="font-serif text-2xl font-normal text-paper-primary tabular-nums">
            {streak.todayCount}
          </div>
          <div className="text-xs text-paper-secondary mt-0.5">
            Reviewed today
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
        <button
          onClick={() => openAddPanel()}
          className="w-full btn-primary flex items-center justify-center gap-1.5 text-xs py-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log next problem</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className="w-full btn-secondary flex items-center justify-center text-xs py-2"
        >
          <span>Problem bank</span>
        </button>
      </div>
    </div>
  );
};
