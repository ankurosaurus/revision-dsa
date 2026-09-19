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

  // Change password state
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
        <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#1C1C1E]">
          Settings
        </h1>
        <p className="text-[13px] text-[#6E6E73] mt-0.5">
          Manage your account, profile, daily targets, and problem data.
        </p>
      </div>

      {/* ── Account Card ── */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          <span>Account</span>
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Authentication method and session details.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[10px] bg-[#FAFAF8] border border-[#E5E4E0] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#E5E4E0] text-[#1C1C1E] font-semibold text-[13px] flex items-center justify-center">
              {isGuest ? '?' : (user?.email?.charAt(0)?.toUpperCase() || 'U')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#1C1C1E]">
                  {isGuest ? 'Guest session' : (user?.email || 'Registered user')}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[6px] border ${
                  isGuest
                    ? 'bg-[#C25B5B]/10 text-[#C25B5B] border-[#C25B5B]/20'
                    : user?.app_metadata?.provider === 'google'
                    ? 'bg-[#FFFFFF] text-[#1C1C1E] border-[#E5E4E0]'
                    : 'bg-[#5A9367]/10 text-[#5A9367] border-[#5A9367]/20'
                }`}>
                  {isGuest ? 'Guest' : user?.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
              <p className="text-[12px] text-[#6E6E73] mt-0.5">
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
                className="btn-primary flex items-center gap-1.5 text-[13px] font-medium"
              >
                <UserPlus className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Sign up — preserve progress</span>
              </button>
            ) : (
              <button
                onClick={signOut}
                className="btn-secondary flex items-center gap-1.5 text-[13px] font-medium text-[#6E6E73] hover:text-[#1C1C1E]"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Log out</span>
              </button>
            )}
          </div>
        </div>

        {/* Change Password */}
        {!isGuest && user?.app_metadata?.provider !== 'google' && (
          <div className="border-t border-[#E5E4E0] pt-4">
            <h3 className="text-[13px] font-medium text-[#1C1C1E] mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#8E8E93]" strokeWidth={1.8} />
              <span>Change password</span>
            </h3>
            <form onSubmit={handleChangePassword} className="flex items-end gap-3 max-w-sm">
              <div className="flex-1">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setChangePwError(''); }}
                  className="w-full bg-[#FFFFFF] border border-[#E5E4E0] focus:border-[#2D5A6B] rounded-[8px] px-3.5 py-2 text-[13px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={changePwLoading || newPassword.length < 8}
                className="btn-secondary flex items-center gap-1.5 text-[13px] shrink-0 disabled:opacity-50"
              >
                {changePwLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} /> : null}
                <span>Update</span>
              </button>
            </form>
            {changePwError && (
              <p className="text-[12px] text-[#C25B5B] flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3" strokeWidth={1.8} />{changePwError}
              </p>
            )}
            {changePwSuccess && (
              <p className="text-[12px] text-[#5A9367] flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3" strokeWidth={1.8} />Password updated successfully.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Profile & Revision Goals */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          <span>Profile & Daily Target</span>
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Configure your candidate profile and target daily problem completion count.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-[13px] font-medium text-[#1C1C1E] mb-1.5">
              Candidate name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E4E0] focus:border-[#2D5A6B] rounded-[8px] px-3.5 py-2 text-[13px] text-[#1C1C1E] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1C1C1E] mb-1.5">
              Daily revision target (problems / day)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full bg-[#FFFFFF] border border-[#E5E4E0] focus:border-[#2D5A6B] rounded-[8px] px-3.5 py-2 text-[13px] text-[#1C1C1E] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="btn-primary text-[13px]"
            >
              Save preferences
            </button>
            {savedSuccess && (
              <span className="text-[13px] text-[#5A9367] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Saved</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#1C1C1E] mb-1">
          Interface Theme
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Select between light and dark visual presentation.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn-secondary flex items-center gap-2 text-[13px]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#8E8E93]" strokeWidth={1.8} />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#8E8E93]" strokeWidth={1.8} />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <span className="text-[13px] text-[#6E6E73]">
            Current: <span className="font-medium text-[#1C1C1E] capitalize">{theme}</span>
          </span>
        </div>
      </div>

      {/* Backend Integration */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
          <span>Supabase Cloud Integration</span>
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Connect your remote Supabase Postgres database with Row Level Security for multi-device sync.
        </p>

        <div className="p-4 rounded-[10px] bg-[#FAFAF8] border border-[#E5E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-[#5A9367]' : 'bg-[#C25B5B]'
                }`}
              />
              <span className="font-medium text-[#1C1C1E]">
                {isSupabaseConfigured
                  ? 'Connected to Supabase'
                  : 'Standalone Local Cache Mode'}
              </span>
            </div>
            <p className="text-[12px] text-[#6E6E73] mt-1">
              {isSupabaseConfigured
                ? 'Your problems, reviews, and logs synchronize with your Postgres database.'
                : 'All problems and reviews are stored in browser localStorage. To connect remote sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'}
            </p>
          </div>
        </div>
      </div>

      {/* Problem Catalog Coverage */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-semibold text-[#1C1C1E] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#2D5A6B]" strokeWidth={1.8} />
            <span>Problem Catalog Coverage</span>
          </h2>
          <span className="text-[12px] font-medium text-[#1C1C1E] bg-[#FAFAF8] px-2.5 py-0.5 rounded-[6px] border border-[#E5E4E0]">
            {catalogStats.total.toLocaleString()} Indexed
          </span>
        </div>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Pre-seeded problem library enabling instant search-and-select without per-problem web scraping.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-[8px] border border-[#E5E4E0] bg-[#FAFAF8]">
            <div className="text-[12px] font-medium text-[#6E6E73]">
              LeetCode
            </div>
            <div className="text-[20px] font-semibold text-[#1C1C1E] mt-0.5">
              {catalogStats.leetcode.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5">
              Full catalog + topic tags
            </div>
          </div>

          <div className="p-3.5 rounded-[8px] border border-[#E5E4E0] bg-[#FAFAF8]">
            <div className="text-[12px] font-medium text-[#6E6E73]">
              Codeforces
            </div>
            <div className="text-[20px] font-semibold text-[#1C1C1E] mt-0.5">
              {catalogStats.codeforces.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5">
              Archive + ratings & tags
            </div>
          </div>

          <div className="p-3.5 rounded-[8px] border border-[#E5E4E0] bg-[#FAFAF8]">
            <div className="text-[12px] font-medium text-[#6E6E73]">
              GeeksforGeeks
            </div>
            <div className="text-[20px] font-semibold text-[#1C1C1E] mt-0.5">
              {catalogStats.gfg} <span className="text-[11px] font-normal text-[#8E8E93]">(growing)</span>
            </div>
            <div className="text-[11px] text-[#8E8E93] mt-0.5">
              Curated + organic adds
            </div>
          </div>
        </div>

        <div className="p-3 rounded-[8px] bg-[#FAFAF8] border border-[#E5E4E0] text-[12px] text-[#6E6E73] flex items-start gap-2">
          <Layers className="w-4 h-4 text-[#2D5A6B] shrink-0 mt-0.5" strokeWidth={1.8} />
          <div>
            <span className="font-medium text-[#1C1C1E]">Re-indexing note:</span> To re-sync or refresh catalog problems, run <code className="px-1 py-0.5 bg-[#FFFFFF] border border-[#E5E4E0] rounded font-mono text-[11px]">node scripts/import-all-catalog.js</code>. LeetCode and Codeforces imports deduplicate automatically.
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#1C1C1E] mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#8E8E93]" strokeWidth={1.8} />
          <span>Export Data</span>
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Export your complete revision history anytime for personal backups or spreadsheets.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportData('json')}
            className="btn-secondary flex items-center gap-1.5 text-[13px]"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => exportData('csv')}
            className="btn-secondary flex items-center gap-1.5 text-[13px]"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 shadow-card">
        <h2 className="text-[16px] font-semibold text-[#C25B5B] mb-1 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#C25B5B]" strokeWidth={1.8} />
          <span>Data Management</span>
        </h2>
        <p className="text-[13px] text-[#6E6E73] mb-4">
          Wipe all records to maintain a completely clean tracker, or optionally load curated problem templates.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-[8px] border border-[#C25B5B]/30 bg-[#C25B5B]/10 text-[#C25B5B] hover:bg-[#C25B5B]/15 text-[13px] font-medium transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Wipe all records (clean slate)</span>
          </button>

          <button
            onClick={handleLoadStarter}
            className="btn-secondary flex items-center gap-1.5 text-[13px]"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Load curated starter pack</span>
          </button>
        </div>
      </div>

      {/* Upgrade modal */}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};
