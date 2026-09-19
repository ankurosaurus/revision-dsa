import { create } from 'zustand';

import { Problem } from '../types';

export type NavTab = 'dashboard' | 'queue' | 'all' | 'stats' | 'settings' | 'catalog' | 'admin';

interface UIState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  isAddPanelOpen: boolean;
  openAddPanel: () => void;
  closeAddPanel: () => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  solveProblem: Problem | null;
  openSolveView: (problem: Problem) => void;
  closeSolveView: () => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('revision_dsa_theme');
    if (saved === 'light') return 'light';
  }
  return 'dark'; // Dark mode is default, only light if explicitly opted into
};

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('revision_dsa_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem('revision_dsa_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  isAddPanelOpen: false,
  openAddPanel: () => set({ isAddPanelOpen: true }),
  closeAddPanel: () => set({ isAddPanelOpen: false }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  isOnboardingOpen: false,
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),

  solveProblem: null,
  openSolveView: (problem) => set({ solveProblem: problem }),
  closeSolveView: () => set({ solveProblem: null }),
}));
