import React from 'react';

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center rounded-[10px] border border-line bg-surface">
    <div className="w-12 h-12 rounded-[10px] bg-surface-subtle border border-line flex items-center justify-center text-ink-secondary mb-3">
      {icon}
    </div>
    <h4 className="text-sm font-semibold text-ink">{title}</h4>
    <p className="text-xs text-ink-muted mt-1 max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
