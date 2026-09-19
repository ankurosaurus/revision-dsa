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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-subtle/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-surface rounded-[10px] border border-line p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-[#2D5A6B]" />
            <h3 className="text-sm font-semibold text-ink">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-[10px] text-ink-muted hover:text-ink hover:bg-surface-hover transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 text-xs">
              <span className="text-ink-muted">{s.description}</span>
              <kbd className="px-2 py-1 rounded-[10px] bg-surface-subtle border border-line font-mono font-medium text-xs text-ink">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
