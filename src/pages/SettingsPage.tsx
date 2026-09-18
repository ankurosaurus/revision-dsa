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
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-paper-primary tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-paper-muted mt-0.5">
          Manage your account, profile, daily targets, and problem data.
        </p>
      </div>

      {/* ── Account Card ── */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-paper-primary mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-teal" />
          <span>Account</span>
        </h2>
        <p className="text-xs text-paper-muted mb-4">
          Authentication method and session details.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-graphite-base border border-graphite-hairline mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-graphite-hover border border-graphite-hairline text-teal font-serif font-semibold text-sm flex items-center justify-center">
              {isGuest ? '?' : (user?.email?.charAt(0)?.toUpperCase() || 'U')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-paper-primary">
                  {isGuest ? 'Guest session' : (user?.email || 'Registered user')}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                  isGuest
                    ? 'bg-ochre/15 text-ochre border-ochre/30'
                    : user?.app_metadata?.provider === 'google'
                    ? 'bg-graphite-hover text-paper-primary border-graphite-hairline'
                    : 'bg-teal/15 text-teal border-teal/30'
                }`}>
                  {isGuest ? 'Guest' : user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
              <p className="text-xs text-paper-muted mt-0.5">
                {isGuest
                  ? 'Progress saved in browser storage only — sign up to preserve permanently.'
                  : `Signed in since ${user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isGuest ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal hover:bg-teal-hover text-graphite-base text-xs font-medium transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign up — preserve progress
              </button>
            ) : (
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-graphite-hairline bg-graphite-base text-xs font-medium text-paper-muted hover:text-paper-primary hover:bg-graphite-hover transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            )}
          </div>
        </div>

        {/* Change Password (only for email users, not guests or Google) */}
        {!isGuest && user?.app_metadata?.provider !== 'google' && (
          <div className="border-t border-graphite-hairline pt-4">
            <h3 className="text-xs font-medium text-paper-primary mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-paper-muted" />
              Change password
            </h3>
            <form onSubmit={handleChangePassword} className="flex items-end gap-3 max-w-sm">
              <div className="flex-1">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setChangePwError(''); }}
                  className="w-full bg-graphite-base border border-graphite-hairline focus:border-teal rounded px-3.5 py-2 text-xs text-paper-primary placeholder:text-paper-muted focus:outline-none transition-colors"
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
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3" />{changePwError}
              </p>
            )}
            {changePwSuccess && (
              <p className="text-xs text-teal flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3" />Password updated successfully.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Profile & Revision Goals */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-paper-primary mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-ochre" />
          <span>Profile & Daily Target</span>
        </h2>
        <p className="text-xs text-paper-muted mb-4">
          Configure your candidate profile and target daily problem completion count.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-paper-primary mb-1.5">
              Candidate name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-graphite-base border border-graphite-hairline focus:border-teal rounded px-3.5 py-2 text-xs text-paper-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-paper-primary mb-1.5">
              Daily revision target (problems / day)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full bg-graphite-base border border-graphite-hairline focus:border-teal rounded px-3.5 py-2 text-xs text-paper-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="btn-primary"
            >
              Save preferences
            </button>
            {savedSuccess && (
              <span className="text-xs text-teal flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-paper-primary mb-1">
          Interface Theme
        </h2>
        <p className="text-xs text-paper-muted mb-4">
          Select between light and dark visual presentation.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn-secondary flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-ochre" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-paper-muted" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <span className="text-xs text-paper-muted">
            Current: <span className="font-medium text-paper-primary capitalize">{theme}</span>
          </span>
        </div>
      </div>

      {/* Backend Integration */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-paper-primary mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal" />
          <span>Supabase Cloud Integration</span>
        </h2>
        <p className="text-xs text-paper-muted mb-4">
          Connect your remote Supabase Postgres database with Row Level Security for multi-device sync.
        </p>

        <div className="p-4 rounded-lg bg-graphite-base border border-graphite-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-teal' : 'bg-ochre'
                }`}
              />
              <span className="font-medium text-paper-primary">
                {isSupabaseConfigured
                  ? 'Connected to Supabase'
                  : 'Standalone Local Cache Mode'}
              </span>
            </div>
            <p className="text-xs text-paper-muted mt-1">
              {isSupabaseConfigured
                ? 'Your problems, reviews, and logs synchronize with your Postgres database.'
                : 'All problems and reviews are stored in browser localStorage. To connect remote sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'}
            </p>
          </div>
        </div>
      </div>

      {/* Problem Catalog Coverage */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-serif font-bold text-paper-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal" />
            <span>Problem Catalog Coverage</span>
          </h2>
          <span className="text-xs font-serif font-medium text-teal bg-teal/10 px-2.5 py-0.5 rounded border border-teal/30">
            {catalogStats.total.toLocaleString()} Indexed
          </span>
        </div>
        <p className="text-xs text-paper-muted mb-4">
          Pre-seeded problem library enabling instant search-and-select without per-problem web scraping.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-lg border border-graphite-hairline bg-graphite-base">
            <div className="text-xs font-medium text-paper-muted">
              LeetCode
            </div>
            <div className="text-lg font-serif font-bold text-ochre mt-0.5">
              {catalogStats.leetcode.toLocaleString()}
            </div>
            <div className="text-xs text-paper-muted mt-0.5">
              Full catalog + topic tags
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-graphite-hairline bg-graphite-base">
            <div className="text-xs font-medium text-paper-muted">
              Codeforces
            </div>
            <div className="text-lg font-serif font-bold text-paper-primary mt-0.5">
              {catalogStats.codeforces.toLocaleString()}
            </div>
            <div className="text-xs text-paper-muted mt-0.5">
              Archive + ratings & tags
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-graphite-hairline bg-graphite-base">
            <div className="text-xs font-medium text-paper-muted">
              GeeksforGeeks
            </div>
            <div className="text-lg font-serif font-bold text-teal mt-0.5">
              {catalogStats.gfg} <span className="text-xs font-normal text-paper-muted">(growing)</span>
            </div>
            <div className="text-xs text-paper-muted mt-0.5">
              Curated + organic adds
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-graphite-base border border-graphite-hairline text-xs text-paper-muted flex items-start gap-2">
          <Layers className="w-4 h-4 text-teal shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-paper-primary">Re-indexing note:</span> To re-sync or refresh catalog problems, run <code className="px-1 py-0.5 bg-surface border border-graphite-hairline rounded font-mono text-xs">node scripts/import-all-catalog.js</code>. LeetCode and Codeforces imports deduplicate automatically.
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-surface border border-graphite-hairline rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-paper-primary mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-paper-muted" />
          <span>Export Data</span>
        </h2>
        <p className="text-xs text-paper-muted mb-4">
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
      <div className="bg-surface border border-rose-900/40 rounded-xl p-6 shadow-deck">
        <h2 className="text-base font-serif font-bold text-rose-400 mb-1 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Data Management</span>
        </h2>
        <p className="text-xs text-paper-muted mb-4">
          Wipe all records to maintain a completely clean tracker, or optionally load curated problem templates.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe all records (clean slate)</span>
          </button>

          <button
            onClick={handleLoadStarter}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load curated starter pack</span>
          </button>
        </div>
      </div>

      {/* Upgrade modal — rendered here so it doesn't depend on GuestBanner being mounted */}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};
