import React from 'react';
import { Sparkles, UserCheck, LogIn, ArrowRight } from 'lucide-react';
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
    <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs z-30 shrink-0">
      <div className="flex items-center gap-2 font-medium">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>
        <span>
          <strong className="font-bold">Live Interactive Preview:</strong> You're exploring RevisionDSA with sample data.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleGuestStart}
          className="px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Start with Guest session (no signup required)"
        >
          <UserCheck className="w-3 h-3 text-amber-300" />
          <span>Start Free Guest Session</span>
        </button>

        <button
          type="button"
          onClick={handleAuthOpen}
          className="px-2.5 py-1 rounded-md bg-white text-brand-700 hover:bg-brand-50 font-bold transition-colors flex items-center gap-1 shadow-2xs"
          title="Create account or log in"
        >
          <span>Log In / Sign Up</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
