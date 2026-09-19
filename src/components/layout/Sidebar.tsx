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
      badgeColor: 'bg-[#C4923A]/10 text-[#C4923A] border border-[#C4923A]/25',
    },
    {
      id: 'all' as NavTab,
      label: 'Problem Bank',
      icon: Layers,
      badge: totalCount > 0 ? totalCount : undefined,
      badgeColor: 'bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]',
    },
    {
      id: 'catalog' as NavTab,
      label: 'Browse Catalog',
      icon: Library,
      badge: '15k' as unknown as number,
      badgeColor: 'bg-[#2D5A6B]/10 text-[#2D5A6B] border border-[#2D5A6B]/20',
    },
    { id: 'stats' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-[#E5E4E0] bg-[#FFFFFF] transition-all duration-150 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#E5E4E0]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[10px] bg-[#2D5A6B] text-white flex items-center justify-center font-medium text-xs shadow-sm">
                <BookOpen className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-[15px] tracking-tight text-[#1C1C1E]">
                  RevisionDSA
                </span>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 mx-auto rounded-[10px] bg-[#2D5A6B] text-white flex items-center justify-center font-medium text-xs">
              <BookOpen className="w-4 h-4" strokeWidth={1.8} />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-[8px] text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-[#F7F7F5] transition-colors ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
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
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2} />
            {!isCollapsed && <span className="font-medium">Log problem</span>}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="px-2.5 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2D5A6B]/10 text-[#2D5A6B] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1C1C1E] hover:bg-[#F7F7F5]'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#2D5A6B]' : 'text-[#6E6E73]'
                    }`}
                    strokeWidth={1.8}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-[6px] tabular-nums ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge !== undefined && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A6B] absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Expand Toggle */}
      <div className="p-3 border-t border-[#E5E4E0]">
        {isCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="w-full py-1.5 flex items-center justify-center text-[#6E6E73] hover:text-[#1C1C1E] rounded-[8px] hover:bg-[#F7F7F5] transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[10px]">
            <div className="w-7 h-7 rounded-full bg-[#F4F4F0] text-[#1C1C1E] font-medium text-xs flex items-center justify-center shrink-0 border border-[#E5E4E0]">
              {user?.email?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-[13px] font-medium text-[#1C1C1E] truncate">
                {user?.email || 'Candidate'}
              </span>
              <span className="text-[11px] text-[#6E6E73] truncate">
                Algorithmic recall
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
