import { create } from 'zustand';

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
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('revision_dsa_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'dark'; // Dark mode as default per spec
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
}));
