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

const PIE_COLORS = ['#4F46E5', '#10B981', '#F59E0B'];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}> = ({ label, value, sub, icon }) => (
  <div className="saas-card p-5">
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">{label}</span>
      <div className="text-brand-600 dark:text-brand-400">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
    {sub && <div className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-1">{sub}</div>}
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
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Access Denied</h2>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-1 max-w-xs">
            This page is restricted to admin accounts only.
            {!isSupabaseConfigured && ' Supabase is not configured.'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-dark-surfaceHover text-xs text-neutral-600 dark:text-neutral-400 font-mono max-w-sm text-left">
          To grant admin access, run in Supabase SQL Editor:<br />
          <span className="text-brand-600 dark:text-brand-400">
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
      <div className="flex items-center justify-center h-full gap-3 text-neutral-400">
        <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
        <span className="text-sm">Loading admin stats…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <ShieldAlert className="w-8 h-8 text-rose-500" />
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{error}</p>
        <p className="text-xs text-neutral-500">Make sure the admin migration has been applied.</p>
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
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Admin Dashboard
          </h1>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Internal — visible only to admin accounts. Data from Supabase.
          </p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-semibold">
          Admin Only
        </span>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total_users?.toLocaleString() ?? '—'}
          sub={`${stats.registered_users} registered · ${stats.guest_users} guests`}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Total Problems"
          value={stats.total_problems?.toLocaleString() ?? '—'}
          sub="across all users"
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StatCard
          label="Total Revisions"
          value={stats.total_revisions?.toLocaleString() ?? '—'}
          sub="review sessions completed"
          icon={<RotateCcw className="w-4 h-4" />}
        />
        <StatCard
          label="Conversion Rate"
          value={convRate}
          sub="guests → registered"
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* ── Charts Row 1: Signups + Problems ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="saas-card p-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
            New Signups / Day <span className="text-[11px] font-normal text-neutral-400">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.signups_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <Tooltip
                contentStyle={{ background: 'var(--color-dark-surface, #1a1a1e)', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#ccc' }}
              />
              <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="saas-card p-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
            Problems Added / Day <span className="text-[11px] font-normal text-neutral-400">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.problems_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <Tooltip
                contentStyle={{ background: 'var(--color-dark-surface, #1a1a1e)', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#ccc' }}
              />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={false} name="Problems" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2: Revisions + Platform Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="saas-card p-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
            Revisions / Day <span className="text-[11px] font-normal text-neutral-400">(last 30 days)</span>
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={(stats.revisions_per_day ?? []).map(d => ({ ...d, date: fmt(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" />
              <Tooltip
                contentStyle={{ background: 'var(--color-dark-surface, #1a1a1e)', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#ccc' }}
              />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={false} name="Revisions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="saas-card p-6">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
            Platform Breakdown
          </h2>
          {(stats.platform_breakdown ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-neutral-400 text-xs">No data yet</div>
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
                  formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#1a1a1e', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Raw stat table ── */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">User Cohort Breakdown</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-dark-border text-left text-neutral-500 dark:text-neutral-500">
              <th className="pb-2 font-semibold">Cohort</th>
              <th className="pb-2 font-semibold text-right">Count</th>
              <th className="pb-2 font-semibold text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-dark-border/40">
            {[
              { label: 'Registered (email / Google)', count: stats.registered_users },
              { label: 'Active guests (anonymous)', count: stats.guest_users },
            ].map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 text-neutral-700 dark:text-neutral-300">{row.label}</td>
                <td className="py-2.5 text-right font-semibold text-neutral-900 dark:text-white">{row.count?.toLocaleString() ?? '—'}</td>
                <td className="py-2.5 text-right text-neutral-500">
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
