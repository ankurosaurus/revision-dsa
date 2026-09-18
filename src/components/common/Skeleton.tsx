import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-neutral-200 dark:bg-dark-surfaceHover ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="saas-card p-5 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-7 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);
