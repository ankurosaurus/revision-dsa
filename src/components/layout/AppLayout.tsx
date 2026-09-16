import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { AddProblemPanel } from '../problems/AddProblemPanel';
import { OnboardingModal } from '../auth/OnboardingModal';
import { GuestBanner } from '../auth/GuestBanner';
import { useAuth } from '../../contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isGuest } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-dark-bg bg-grid-pattern text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Sidebar (desktop/tablet) */}
      <Sidebar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar />

        {/* Guest banner — only visible for anonymous/guest sessions */}
        {isGuest && <GuestBanner />}

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
