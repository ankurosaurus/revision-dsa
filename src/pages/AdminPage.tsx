/**
 * AdminPage — internal analytics dashboard.
 *
 * Access: restricted to users where profiles.is_admin = true.
 * Data: fetched via the security-definer RPC `admin_get_stats()` in Supabase.
 *
 * To make your account admin, run in Supabase SQL Editor:
 *   UPDATE profiles SET is_admin = true WHERE id = '<your-auth-uid>';
 *
 * Charts: Recharts (already in the stack).
 */

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Loader2, ShieldAlert, Users, BookOpen, RotateCcw, TrendingUp } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DayStat { date: string; count: number; }
interface PlatformStat { platform: string; count: number; }

interface AdminStats {
  total_users: number;
  registered_users: number;
  guest_users: number;
  total_problems: number;
  total_revisions: number;
  conversion_rate_pct: number;
  signups_per_day: DayStat[];
  problems_per_day: DayStat[];
  revisions_per_day: DayStat[];
  platform_breakdown: PlatformStat[];
}

const PIE_COLORS = ['#2D5A6B', '#5A9367', '#C4923A', '#8E8E93'];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}> = ({ label, value, sub, icon }) => (
  <div className="bg-surface border border-line rounded-[10px] p-5">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <div className="text-ink-secondary">{icon}</div>
    </div>
    <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{value}</div>
    {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check admin status first
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data?.is_admin) {
          setIsAdmin(false);
          setLoading(false);
        } else {
          setIsAdmin(true);
          // Fetch stats via RPC (supabase is non-null here — checked at top of effect)
          supabase!.rpc('admin_get_stats').then(({ data: statsData, error: statsErr }) => {
            if (statsErr) {
              setError(statsErr.message);
            } else {
              setStats(statsData as AdminStats);
            }
            setLoading(false);
          });
        }
      });
  }, [user]);

  // ── Not admin ──────────────────────────────────────────────────────────────
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
        <div className="w-12 h-12 rounded-[10px] bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-[#C25B5B]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Access Denied</h2>
          <p className="text-xs text-ink-muted mt-1 max-w-xs">
            This ledger is restricted to admin accounts only.
            {!isSupabaseConfigured && ' Supabase is not configured.'}
          </p>
        </div>
        <div className="p-3.5 rounded-[10px] bg-surface border border-line text-xs text-ink-muted font-mono max-w-sm text-left">
          To grant admin access, run in Supabase SQL Editor:<br />
          <span className="text-ink">
            UPDATE profiles SET is_admin = true<br />
            WHERE id = &apos;{user?.id ?? '<your-auth-uid>'}&apos;;
          </span>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-ink-muted py-24">
        <Loader2 className="w-5 h-5 animate-spin text-ink" />
        <span className="text-sm">Loading admin metrics…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-24">
        <ShieldAlert className="w-8 h-8 text-[#C25B5B]" />
        <p className="text-sm text-ink">{error}</p>
        <p className="text-xs text-ink-muted">Make sure the admin migration has been applied.</p>
      </div>
    );
  }

  if (!stats) return null;

  const convRate = `${stats.conversion_rate_pct ?? 0}%`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#2D5A6B]" />
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Internal analytics ledger — restricted to authenticated administrator accounts.
          </p>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-[10px] border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-[#C25B5B] font-medium">
          Admin only
        </span>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={stats.total_users?.toLocaleString() ?? '—'}
          sub={`${stats.registered_users} registered, ${stats.guest_users} guests`}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Total problems"
          value={stats.total_problems?.toLocaleString() ?? '—'}
          sub="across all user queues"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          label="Total revisions"
          value={stats.total_revisions?.toLocaleString() ?? '—'}
          sub="review sessions logged"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <StatCard
          label="Conversion rate"
          value={convRate}
          sub="guests converted to permanent"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* ── Charts Row 1: Signups + Problems ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-line rounded-[10px] p-6">
          <h2 className="text-base font-semibold text-ink mb-4">
            New signups / day <span className="text-xs font-normal text-ink-muted">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.signups_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: 10, fontSize: 11, color: '#1C1C1E', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                labelStyle={{ color: '#6E6E73' }}
              />
              <Line type="monotone" dataKey="count" stroke="#2D5A6B" strokeWidth={2} dot={false} name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-line rounded-[10px] p-6">
          <h2 className="text-base font-semibold text-ink mb-4">
            Problems added / day <span className="text-xs font-normal text-ink-muted">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.problems_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: 10, fontSize: 11, color: '#1C1C1E', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                labelStyle={{ color: '#6E6E73' }}
              />
              <Line type="monotone" dataKey="count" stroke="#C4923A" strokeWidth={2} dot={false} name="Problems" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Revisions + Platform Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-line rounded-[10px] p-6">
          <h2 className="text-base font-semibold text-ink mb-4">
            Revisions / day <span className="text-xs font-normal text-ink-muted">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.revisions_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E4E0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#8E8E93" />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: 10, fontSize: 11, color: '#1C1C1E', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                labelStyle={{ color: '#6E6E73' }}
              />
              <Line type="monotone" dataKey="count" stroke="#5A9367" strokeWidth={2} dot={false} name="Revisions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-line rounded-[10px] p-6">
          <h2 className="text-base font-semibold text-ink mb-4">
            Platform breakdown
          </h2>
          {(stats.platform_breakdown ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-ink-muted text-xs">No data recorded yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.platform_breakdown}
                  dataKey="count"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {(stats.platform_breakdown ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-ink-secondary">{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E4E0', borderRadius: 10, fontSize: 11, color: '#1C1C1E', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Raw stat table ── */}
      <div className="bg-surface border border-line rounded-[10px] p-6">
        <h2 className="text-base font-semibold text-ink mb-4">User cohort breakdown</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              <th className="pb-2 font-medium">Cohort</th>
              <th className="pb-2 font-medium text-right">Count</th>
              <th className="pb-2 font-medium text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[
              { label: 'Registered (email / Google)', count: stats.registered_users },
              { label: 'Active guests (anonymous)', count: stats.guest_users },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 text-ink">{row.label}</td>
                <td className="py-2.5 text-right font-medium text-ink">{row.count?.toLocaleString() ?? '—'}</td>
                <td className="py-2.5 text-right text-ink-muted">
                  {stats.total_users ? `${((row.count / stats.total_users) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
