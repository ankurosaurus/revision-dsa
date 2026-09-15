import React from 'react';
import { Platform } from '../../types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-0.5 gap-1.5';

  switch (platform) {
    case 'leetcode':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border ${sizeClasses}`}
        >
          {/* Subtle LeetCode Icon */}
          <svg className="w-3 h-3 shrink-0 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.6-.486-1.328-.773-2.09-.838A1.37 1.37 0 0 0 13.483 0zm-2.88 12.062a1.38 1.38 0 0 0-1.379 1.379 1.38 1.38 0 0 0 1.38 1.38h9.294a1.38 1.38 0 0 0 1.379-1.38 1.38 1.38 0 0 0-1.38-1.379H10.603z" />
          </svg>
          {showLabel && <span>LeetCode</span>}
        </span>
      );

    case 'gfg':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          {showLabel && <span>GeeksforGeeks</span>}
        </span>
      );

    case 'codeforces':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-md bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-dark-border ${sizeClasses}`}
        >
          <div className="flex items-end gap-0.5 h-2.5 shrink-0">
            <span className="w-0.5 h-1.5 bg-yellow-500 rounded-t-xs" />
            <span className="w-0.5 h-2.5 bg-blue-500 rounded-t-xs" />
            <span className="w-0.5 h-2 bg-red-500 rounded-t-xs" />
          </div>
          {showLabel && <span>Codeforces</span>}
        </span>
      );

    default:
      return null;
  }
};
