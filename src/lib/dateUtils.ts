/**
 * Date and relative time formatting helpers.
 */

export function formatRelativeTime(dateString: string): string {
  const target = new Date(dateString);
  const now = new Date();
  const diffSec = Math.round((now.getTime() - target.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return target.toLocaleDateString();
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
