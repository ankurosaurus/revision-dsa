/**
 * Theme helper utilities
 */

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('revision_dsa_theme');
  if (saved === 'light') return 'light';
  return 'dark';
}

export function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}
