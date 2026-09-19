/**
 * GuestBanner — renders a slim top bar for anonymous/guest sessions.
 *
 * Shown between TopBar and main content only when isGuest === true.
 * Non-blocking: never covers page content, never uses an intrusive modal.
 *
 * Clicking "Sign up" opens the UpgradeModal which links credentials
 * to the existing anonymous session WITHOUT losing any existing data.
 */
import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

export const GuestBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 bg-surface border-b border-line text-ink text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C4923A] animate-pulse" />
            Guest Mode
          </span>
          <span className="text-ink-muted hidden sm:inline truncate">
            Progress is saved locally on this browser until you link an account.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setUpgradeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-[#2D5A6B] hover:bg-[#244957] text-white transition-colors font-medium text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign up — preserve progress</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-[10px] text-ink-muted hover:text-ink transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
};
