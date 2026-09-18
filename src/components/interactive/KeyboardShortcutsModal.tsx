import React from 'react';
import { X, Command } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: '⌘ + K / Ctrl + K', description: 'Open search and command palette' },
  { key: '1 / 2 / 3 / 4', description: 'Rate recall during active review (Again, Hard, Good, Easy)' },
  { key: 'Space', description: 'Flip recall card to reveal answer / explanation' },
  { key: 'Esc', description: 'Close modals, drawers, or command palette' },
  { key: '?', description: 'Open this keyboard shortcuts cheatsheet' },
];

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-dark-border p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-neutral-600 dark:text-neutral-300">{s.description}</span>
              <kbd className="px-2 py-1 rounded bg-neutral-100 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border font-mono font-medium text-[11px] text-neutral-700 dark:text-neutral-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
