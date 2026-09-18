import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Flame, Plus, Command } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useStreak } from '../../hooks/useStreak';
import { useProblemStore } from '../../store/useProblemStore';
import { CommandPalette } from '../interactive/CommandPalette';

export const TopBar: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  const streak = useStreak();
  const profile = useProblemStore((s) => s.profile);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global hotkeys: '⌘K', 'Ctrl+K', and '/' to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-neutral-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20">
        {/* Raycast-style Quick Search Button */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex-1 max-w-sm flex items-center justify-between bg-neutral-100/80 dark:bg-dark-bg/80 hover:bg-neutral-100 dark:hover:bg-dark-bg border border-neutral-200/80 dark:border-dark-border rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 transition-colors"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="hidden sm:inline truncate">Search problems, patterns, commands...</span>
            <span className="sm:hidden text-neutral-400">Search...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-neutral-400 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-dark-surface border border-neutral-200 dark:border-dark-border shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Streak Indicator */}
          <button
            onClick={() => setActiveTab('stats')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-white dark:bg-dark-bg border border-neutral-200/80 dark:border-dark-border text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs shrink-0"
            title={`${streak.currentStreak} day streak active`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{streak.currentStreak}d<span className="hidden sm:inline"> streak</span></span>
          </button>

          {/* Quick Add Button on mobile */}
          <button
            onClick={openAddPanel}
            className="md:hidden btn-primary p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md shrink-0"
            title="Log problem"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md border border-neutral-200/80 dark:border-dark-border text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors shadow-2xs shrink-0"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Initials Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="cursor-pointer flex items-center gap-2 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors shrink-0"
            title="Account settings"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-dark-surfaceHover text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center border border-neutral-300 dark:border-dark-border">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
