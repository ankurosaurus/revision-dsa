import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-surface/40">
    <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-dark-surfaceHover flex items-center justify-center text-neutral-500 mb-3">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h4>
    <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-1 max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
