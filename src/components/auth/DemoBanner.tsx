import React from 'react';
import { UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/useUIStore';
import { track } from '../../lib/analytics';

interface DemoBannerProps {
  onOpenAuthModal?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenAuthModal }) => {
  const { signInAsGuest } = useAuth();

  const handleGuestStart = async () => {
    track('guest_button_clicked', { source: 'demo_banner' });
    await signInAsGuest();
  };

  const handleAuthOpen = () => {
    track('signup_button_clicked', { source: 'demo_banner' });
    if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  return (
    <div className="bg-surface border-b border-graphite-hairline text-paper-primary px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-30 shrink-0">
      <div className="flex items-center gap-2 font-normal">
        <div className="w-2 h-2 rounded-full bg-ochre shrink-0" />
        <span>
          <strong className="font-semibold text-paper-primary">Interactive Preview:</strong>{' '}
          <span className="text-paper-muted">You are exploring RevisionDSA with sample problem data.</span>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleGuestStart}
          className="px-2.5 py-1 rounded bg-graphite-hover border border-graphite-hairline hover:bg-graphite-active text-paper-primary font-medium transition-colors flex items-center gap-1.5"
          title="Start with Guest session (no signup required)"
        >
          <UserCheck className="w-3.5 h-3.5 text-teal" />
          <span>Start guest session</span>
        </button>

        <button
          type="button"
          onClick={handleAuthOpen}
          className="px-2.5 py-1 rounded bg-teal hover:bg-teal-hover text-graphite-base font-medium transition-colors flex items-center gap-1"
          title="Create account or log in"
        >
          <span>Log in / Sign up</span>
        </button>
      </div>
    </div>
  );
};
