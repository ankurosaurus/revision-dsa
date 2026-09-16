import React, { useState } from 'react';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
  Moon,
  Sun,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Database,
  Target,
  ShieldAlert,
  BookOpen,
  Layers,
  LogOut,
  Lock,
  User,
  AlertCircle,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { getCatalogStats } from '../lib/catalogService';
import { CatalogStats } from '../types';
import { UpgradeModal } from '../components/auth/UpgradeModal';

export const SettingsPage: React.FC = () => {
  const profile = useProblemStore((s) => s.profile);
  const updateProfile = useProblemStore((s) => s.updateProfile);
  const loadStarterPack = useProblemStore((s) => s.loadStarterPack);
  const clearAllData = useProblemStore((s) => s.clearAllData);
  const exportData = useProblemStore((s) => s.exportData);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const { user, isGuest, signOut } = useAuth();

  const [dailyGoal, setDailyGoal] = useState(profile.daily_goal);
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [catalogStats, setCatalogStats] = useState<CatalogStats>({
    total: 15476,
    leetcode: 4055,
    codeforces: 11401,
    gfg: 20,
  });

  // Change password state (for registered users)
  const [newPassword, setNewPassword] = useState('');
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState(false);

  // Upgrade modal for guest users
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  React.useEffect(() => {
    getCatalogStats().then(setCatalogStats).catch(() => {});
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName.trim(),
      daily_goal: Number(dailyGoal),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLoadStarter = () => {
    if (confirm('Load 15 curated starter problems from LeetCode, GFG, and Codeforces?')) {
      loadStarterPack();
      alert('Starter problem pack loaded successfully!');
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to delete all problems and revision history? This will reset your tracker to an empty state.'
      )
    ) {
      clearAllData();
      alert('All problem records and review logs have been cleared.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || newPassword.length < 8) { setChangePwError('Password must be at least 8 characters.'); return; }
    setChangePwLoading(true); setChangePwError(''); setChangePwSuccess(false);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangePwLoading(false);
    if (error) setChangePwError(error.message);
    else { setChangePwSuccess(true); setNewPassword(''); setTimeout(() => setChangePwSuccess(false), 3000); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-dark-textMuted mt-0.5">
          Manage your account, profile, daily targets, and data.
        </p>
      </div>

      {/* ── Account Card ── */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Account</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Your authentication method and session details.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold text-sm flex items-center justify-center border border-brand-200 dark:border-brand-800">
              {isGuest ? '?' : (user?.email?.charAt(0)?.toUpperCase() || 'U')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {isGuest ? 'Guest Session' : (user?.email || 'Registered User')}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isGuest
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    : user?.app_metadata?.provider === 'google'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400'
                }`}>
                  {isGuest ? 'Guest' : user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-0.5">
                {isGuest
                  ? 'Progress saved on this device only — sign up to sync permanently.'
                  : `Signed in since ${user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isGuest ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign up — keep progress
              </button>
            ) : (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-border text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Change Password (only for email users, not guests or Google) */}
        {!isGuest && user?.app_metadata?.provider !== 'google' && (
          <div className="border-t border-neutral-200 dark:border-dark-border pt-4">
            <h3 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="flex items-end gap-3 max-w-sm">
              <div className="flex-1">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setChangePwError(''); }}
                  className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={changePwLoading || newPassword.length < 8}
                className="btn-secondary flex items-center gap-1.5 text-xs shrink-0 disabled:opacity-50"
              >
                {changePwLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Update
              </button>
            </form>
            {changePwError && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3" />{changePwError}
              </p>
            )}
            {changePwSuccess && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3" />Password updated successfully.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Profile & Revision Goals */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Profile & Daily Target</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Configure your candidate profile and target daily problem completion count.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Candidate Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Daily Revision Target (Problems/day)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border focus:border-brand-500 rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="btn-primary"
            >
              Save Preferences
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
          Interface Theme
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Select between light and dark visual presentation.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn-secondary flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-neutral-600" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <span className="text-xs text-neutral-500 dark:text-dark-textMuted">
            Current: <span className="font-semibold text-neutral-800 dark:text-neutral-200 capitalize">{theme}</span>
          </span>
        </div>
      </div>

      {/* Backend Integration */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Supabase Cloud Integration</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Connect your remote Supabase Postgres database with Row Level Security for multi-device sync.
        </p>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500' : 'bg-neutral-400'
                }`}
              />
              <span className="font-semibold text-neutral-900 dark:text-white">
                {isSupabaseConfigured
                  ? 'Connected to Supabase'
                  : 'Standalone Local Cache Mode'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-1">
              {isSupabaseConfigured
                ? 'Your problems, reviews, and logs synchronize with your Postgres database.'
                : 'All problems and reviews are stored in browser localStorage. To connect remote sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'}
            </p>
          </div>
        </div>
      </div>

      {/* Problem Catalog Status */}
      <div className="saas-card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Problem Catalog Coverage</span>
          </h2>
          <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {catalogStats.total.toLocaleString()} Indexed
          </span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Pre-seeded problem library enabling instant search-and-select without per-problem web scraping.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50/60 dark:bg-dark-bg/60">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              LeetCode
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
              {catalogStats.leetcode.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Full catalog + topic tags
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50/60 dark:bg-dark-bg/60">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              Codeforces
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
              {catalogStats.codeforces.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Archive + ratings & tags
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50/60 dark:bg-dark-bg/60">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-dark-textMuted uppercase tracking-wider">
              GeeksforGeeks
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
              {catalogStats.gfg} <span className="text-xs font-normal text-neutral-400">(growing)</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              Curated + organic adds
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border text-xs text-neutral-500 dark:text-dark-textMuted flex items-start gap-2">
          <Layers className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Re-indexing note:</span> To re-sync or refresh catalog problems, run <code className="px-1 py-0.5 bg-neutral-200/60 dark:bg-dark-surface rounded font-mono text-[11px]">node scripts/import-all-catalog.js</code>. LeetCode and Codeforces imports deduplicate automatically.
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="saas-card p-6">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Export Data</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Export your complete revision history anytime for personal backups or spreadsheets.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportData('json')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => exportData('csv')}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="saas-card p-6 border-rose-200 dark:border-rose-900/30">
        <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Data Management</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-dark-textMuted mb-4">
          Wipe all records to maintain a completely clean tracker, or optionally load curated problem templates.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Records (Clean Slate)</span>
          </button>

          <button
            onClick={handleLoadStarter}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Curated Starter Pack (Optional)</span>
          </button>
        </div>
      </div>

      {/* Upgrade modal — rendered here so it doesn't depend on GuestBanner being mounted */}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};
