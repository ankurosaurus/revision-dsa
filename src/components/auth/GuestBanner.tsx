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
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2 bg-brand-600 dark:bg-brand-700 text-white text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Guest Mode
          </span>
          <span className="text-brand-100 hidden sm:inline truncate">
            Your progress is saved on this device only until you create an account.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setUpgradeOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 transition-colors font-semibold text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign up — keep your progress</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 rounded text-white/60 hover:text-white transition-colors"
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
