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
      label: 'Revision queue',
      icon: Brain,
      badge: dueCount > 0 ? dueCount : undefined,
      badgeColor: 'bg-ochre/15 text-ochre border border-ochre/30',
    },
    {
      id: 'all' as NavTab,
      label: 'Problem bank',
      icon: Layers,
      badge: totalCount > 0 ? totalCount : undefined,
      badgeColor: 'bg-surface-subtle text-paper-secondary border border-surface-border',
    },
    {
      id: 'catalog' as NavTab,
      label: 'Browse catalog',
      icon: Library,
      badge: '15k' as unknown as number,
      badgeColor: 'bg-teal/15 text-teal border border-teal/30',
    },
    { id: 'stats' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-surface-border bg-surface transition-all duration-150 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-surface-border">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal text-[#0E1614] flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-bold text-sm tracking-tight text-paper-primary">
                  Revision<span className="text-teal">DSA</span>
                </span>
                <span className="text-[10px] text-paper-muted font-sans">
                  lab
                </span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-lg bg-teal text-[#0E1614] flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-md text-paper-muted hover:text-paper-primary hover:bg-surface-hover transition-colors ${
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
            title="Log DSA problem"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.2} />
            {!isCollapsed && <span>Log problem</span>}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="px-2.5 py-1 space-y-0.5 font-sans">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-hover text-paper-primary font-semibold'
                    : 'text-paper-secondary hover:text-paper-primary hover:bg-surface-hover/60'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-teal'
                        : 'text-paper-muted'
                    }`}
                    strokeWidth={1.8}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-normal px-2 py-0.5 rounded-md tabular-nums ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Expand Toggle */}
      <div className="p-3 border-t border-surface-border">
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full py-1.5 flex items-center justify-center text-paper-muted hover:text-paper-primary rounded-md hover:bg-surface-hover transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-surface-subtle text-paper-primary font-medium text-xs flex items-center justify-center shrink-0 border border-surface-border">
              {user?.email?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-medium text-paper-primary truncate">
                {user?.email || 'Candidate'}
              </span>
              <span className="text-[11px] text-paper-muted truncate">
                Algorithmic recall
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
