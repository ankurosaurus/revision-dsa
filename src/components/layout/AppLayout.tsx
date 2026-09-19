import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { AddProblemPanel } from '../problems/AddProblemPanel';
import { OnboardingModal } from '../auth/OnboardingModal';
import { GuestBanner } from '../auth/GuestBanner';
import { DemoBanner } from '../auth/DemoBanner';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  isDemo?: boolean;
  onOpenAuthModal?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, isDemo, onOpenAuthModal }) => {
  const { isGuest } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] font-sans">
      {/* Sidebar (desktop/tablet) */}
      <Sidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar />

        {/* Demo banner for public preview without session */}
        {isDemo && <DemoBanner onOpenAuthModal={onOpenAuthModal} />}

        {/* Guest banner — only visible for anonymous/guest sessions */}
        {!isDemo && isGuest && <GuestBanner />}

        {/* Scrollable Page Body with generous whitespace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>

      {/* Add Problem Slide-in Panel */}
      <AddProblemPanel />

      {/* Candidate Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
};
