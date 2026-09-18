import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Flame, Plus } from 'lucide-react';
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
      <header className="h-14 border-b border-surface-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20">
        {/* Quick Search Button */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex-1 max-w-sm flex items-center justify-between bg-surface-subtle hover:bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 text-xs text-paper-secondary transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-paper-muted shrink-0" />
            <span className="hidden sm:inline truncate">Search problems, patterns, commands…</span>
            <span className="sm:hidden text-paper-muted">Search…</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-paper-muted shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-surface-border">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak Indicator */}
          <button
            onClick={() => setActiveTab('stats')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface border border-surface-border text-paper-primary text-xs font-medium hover:bg-surface-hover transition-colors shadow-xs shrink-0"
            title={`${streak.currentStreak} day streak active`}
          >
            <Flame className="w-3.5 h-3.5 text-ochre shrink-0" />
            <span className="tabular-nums">{streak.currentStreak}d<span className="hidden sm:inline"> streak</span></span>
          </button>

          {/* Quick Add Button on mobile */}
          <button
            onClick={openAddPanel}
            className="md:hidden btn-primary p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg shrink-0"
            title="Log problem"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-surface-border text-paper-muted hover:text-paper-primary hover:bg-surface-hover transition-colors shadow-xs shrink-0"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Initials Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="cursor-pointer flex items-center gap-2 p-0.5 rounded-lg hover:bg-surface-hover transition-colors shrink-0"
            title="Account settings"
          >
            <div className="w-7 h-7 rounded-full bg-surface-subtle text-paper-primary font-medium text-xs flex items-center justify-center border border-surface-border">
              {profile.full_name?.charAt(0) || 'P'}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
