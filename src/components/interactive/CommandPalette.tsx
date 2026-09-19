import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Brain,
  Layers,
  BarChart3,
  Settings,
  Plus,
  Moon,
  Sun,
  ExternalLink,
  X,
  ArrowRight,
} from 'lucide-react';
import { useUIStore, NavTab } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { searchProblems } from '../../lib/fuzzySearch';
import { PlatformBadge } from '../problems/PlatformBadge';
import { DifficultyBadge } from '../problems/DifficultyBadge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const problems = useProblemStore((s) => s.problems);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openAddPanel = useUIStore((s) => s.openAddPanel);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // Filter problems based on query
  const matchingProblems = query.trim() ? searchProblems(problems, query).slice(0, 5) : [];

  const navigationCommands = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => { setActiveTab('dashboard'); onClose(); } },
    { id: 'nav-queue', label: 'Go to Revision Queue', icon: Brain, action: () => { setActiveTab('queue'); onClose(); } },
    { id: 'nav-all', label: 'Go to Problem Bank', icon: Layers, action: () => { setActiveTab('all'); onClose(); } },
    { id: 'nav-stats', label: 'Go to Analytics', icon: BarChart3, action: () => { setActiveTab('stats'); onClose(); } },
    { id: 'nav-settings', label: 'Go to Settings', icon: Settings, action: () => { setActiveTab('settings'); onClose(); } },
    { id: 'action-log', label: 'Log New Problem (Paste Link)', icon: Plus, action: () => { openAddPanel(); onClose(); } },
    { id: 'action-theme', label: `Toggle Theme (${theme === 'dark' ? 'Light' : 'Dark'})`, icon: theme === 'dark' ? Sun : Moon, action: () => { toggleTheme(); onClose(); } },
  ];

  const filteredCommands = query.trim()
    ? navigationCommands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : navigationCommands;

  // Keyboard navigation inside command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-surface-subtle/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.14 }}
          className="w-full max-w-xl bg-surface border border-line rounded-[10px] shadow-lg overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-line gap-2.5">
            <Search className="w-4 h-4 text-ink-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search problems, patterns, commands, or jump to view..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-[10px] text-ink-muted hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
            {/* Problem Matches */}
            {matchingProblems.length > 0 && (
              <div className="mb-2">
                <div className="px-2.5 py-1 text-xs font-medium text-ink-muted">
                  Problems ({matchingProblems.length})
                </div>
                {matchingProblems.map((prob) => (
                  <div
                    key={prob.id}
                    onClick={() => {
                      setActiveTab('all');
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-surface-hover cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <PlatformBadge platform={prob.platform} size="sm" showLabel={false} />
                      <span className="font-medium text-ink truncate">
                        {prob.title}
                      </span>
                      <DifficultyBadge difficulty={prob.difficulty} size="sm" />
                    </div>

                    <a
                      href={prob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-[10px] text-ink-muted hover:text-ink"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation & Commands */}
            <div>
              <div className="px-2.5 py-1 text-xs font-medium text-ink-muted">
                Commands & Navigation
              </div>
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-surface-hover text-left text-ink transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-ink-muted group-hover:text-ink transition-colors" />
                      <span>{cmd.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-4 py-2 bg-surface-subtle border-t border-line flex items-center justify-between text-xs text-ink-muted">
            <span>Type to search, Esc to dismiss</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-[10px] bg-surface-hover border border-line text-ink-muted text-[11px]">
                Cmd/Ctrl K
              </kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
