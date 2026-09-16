import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Brain,
  Layers,
  Plus,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Library,
  ShieldAlert,
} from 'lucide-react';
import { useUIStore, NavTab } from '../../store/useUIStore';
import { useProblemStore } from '../../store/useProblemStore';
import { isProblemDue } from '../../lib/spacedRepetition';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export const Sidebar: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openAddPanel = useUIStore((s) => s.openAddPanel);

  const problems = useProblemStore((s) => s.problems);
  const dueCount = problems.filter((p) => isProblemDue(p.next_review_date)).length;
  const totalCount = problems.length;

  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status once when user changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) { setIsAdmin(false); return; }
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(Boolean(data?.is_admin)));
  }, [user]);

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'queue' as NavTab,
      label: 'Revision Queue',
      icon: Brain,
      badge: dueCount > 0 ? dueCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      id: 'all' as NavTab,
      label: 'Problem Bank',
      icon: Layers,
      badge: totalCount > 0 ? totalCount : undefined,
      badgeColor: 'bg-neutral-100 text-neutral-600 dark:bg-dark-surfaceHover dark:text-neutral-400',
    },
    {
      id: 'catalog' as NavTab,
      label: 'Browse Catalog',
      icon: Library,
      badge: '15k+' as unknown as number,
      badgeColor: 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400',
    },
    { id: 'stats' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    // Admin nav item — only visible when is_admin = true in profiles table
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-dark-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
                  Revision<span className="text-brand-600 dark:text-brand-400">DSA</span>
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-dark-textMuted font-medium">
                  v2.0
                </span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            onClick={openAddPanel}
            className={`w-full btn-primary flex items-center justify-center gap-2 ${
              isCollapsed ? 'py-2.5 px-0' : 'py-2 px-3'
            }`}
            title="Log DSA Problem"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.2} />
            {!isCollapsed && <span>Log Problem</span>}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="px-3 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-900 dark:text-neutral-100 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-dark-surfaceHover/60'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-neutral-400 group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300'
                    }`}
                    strokeWidth={1.8}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Expand Toggle */}
      <div className="p-3 border-t border-neutral-200 dark:border-dark-border">
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full py-1.5 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-dark-surfaceHover text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0 border border-neutral-200 dark:border-dark-border">
              SDE
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                Candidate
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                Interview Grind
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
