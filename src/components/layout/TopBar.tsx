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
      <header className="h-14 border-b border-[#E5E4E0] bg-[#FAFAF8]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-20">
        {/* Quick Search Button */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex-1 max-w-sm flex items-center justify-between bg-[#FFFFFF] hover:bg-[#F7F7F5] border border-[#E5E4E0] rounded-[10px] px-3 py-1.5 text-[13px] text-[#6E6E73] transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" strokeWidth={1.8} />
            <span className="hidden sm:inline truncate">Search problems, patterns, commands…</span>
            <span className="sm:hidden text-[#8E8E93]">Search…</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#8E8E93] shrink-0">
            <kbd className="px-1.5 py-0.5 rounded-[6px] bg-[#FAFAF8] border border-[#E5E4E0]">
              ⌘K
            </kbd>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak Indicator */}
          <button
            onClick={() => setActiveTab('stats')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#FFFFFF] border border-[#E5E4E0] text-[#1C1C1E] text-[13px] font-medium hover:bg-[#F7F7F5] transition-colors shadow-xs shrink-0"
            title={`${streak.currentStreak} day streak active`}
          >
            <Flame className="w-3.5 h-3.5 text-[#C4923A] shrink-0" strokeWidth={1.8} />
            <span className="tabular-nums">{streak.currentStreak}d<span className="hidden sm:inline"> streak</span></span>
          </button>

          {/* Quick Add Button on mobile */}
          <button
            onClick={openAddPanel}
            className="md:hidden btn-primary p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[10px] shrink-0"
            title="Log problem"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-[#F7F7F5] transition-colors shadow-xs shrink-0"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" strokeWidth={1.8} /> : <Moon className="w-4 h-4" strokeWidth={1.8} />}
          </button>

          {/* User Initials Avatar */}
          <div
            onClick={() => setActiveTab('settings')}
            className="cursor-pointer flex items-center gap-2 p-0.5 rounded-[10px] hover:bg-[#F7F7F5] transition-colors shrink-0"
            title="Account settings"
          >
            <div className="w-7 h-7 rounded-full bg-[#F4F4F0] text-[#1C1C1E] font-medium text-xs flex items-center justify-center border border-[#E5E4E0]">
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
