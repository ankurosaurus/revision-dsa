import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-neutral-900 dark:bg-dark-surface border border-neutral-700 text-white text-[10px] font-medium whitespace-nowrap shadow-lg z-50 pointer-events-none">
          {content}
        </div>
      )}
    </div>
  );
};
