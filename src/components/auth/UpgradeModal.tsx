/**
 * UpgradeModal — converts an anonymous guest into a permanent account.
 *
 * KEY MECHANISM:
 *   While the anonymous session is still active, calling:
 *     supabase.auth.updateUser({ email, password })
 *   converts the anonymous user to a permanent email/password user
 *   in-place — SAME auth.uid(), SAME data rows (problems, review_logs).
 *   No data is lost, no new account is created.
 *
 *   For Google upgrade:
 *     supabase.auth.linkIdentity({ provider: 'google' })
 *   does the same — links Google credentials to the existing anon uid.
 *
 * After success: fires onSuccess(), hides banner, shows toast.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { useAuth } from '../../contexts/AuthContext';
import { track } from '../../lib/analytics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 transition-colors';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

type Tab = 'email' | 'google';

export const UpgradeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const validateConfirm = (v: string) => {
    if (v && v !== password) setConfirmError('Passwords do not match.');
    else setConfirmError('');
  };

  const handleEmailUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setConfirmError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    setError('');

    if (isSupabaseConfigured && supabase) {
      const { error: err } = await supabase.auth.updateUser({
        email: email.trim(),
        password,
        data: {},
      });
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        await refreshUser();
        track('guest_upgraded_to_account', { method: 'email' });
        setSuccess(true);
      }
      return;
    }

    // Local storage upgrade: keep same user ID, attach email, mark as registered
    try {
      const raw = localStorage.getItem('revision_dsa_local_auth_session_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user.email = email.trim();
        parsed.user.is_anonymous = false;
        parsed.user.app_metadata = { provider: 'email' };
        localStorage.setItem('revision_dsa_local_auth_session_v1', JSON.stringify(parsed));
      }
      await refreshUser();
      track('guest_upgraded_to_account', { method: 'email' });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUpgrade = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Google Sign-In requires Supabase configuration in .env.local. Please upgrade with email & password to save locally.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    // linkIdentity attaches Google credentials to the current anonymous session
    const { error: err } = await (supabase.auth as any).linkIdentity({ provider: 'google' });
    setGoogleLoading(false);
    if (err) setError(err.message);
    // On success, Google redirect will happen; the existing uid is preserved
  };

  const handleClose = () => {
    setEmail(''); setPassword(''); setConfirm(''); setError(''); setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 bottom-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-md"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-neutral-200 dark:border-dark-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-dark-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Save your progress</h3>
                    <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted">
                      Your existing problems will stay linked to this account.
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {success ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">Account created!</p>
                      <p className="text-xs text-neutral-500 dark:text-dark-textMuted mt-1">
                        Your progress is permanently saved. Check your inbox to confirm your email.
                      </p>
                    </div>
                    <button onClick={handleClose} className="btn-primary px-6 py-2 text-sm">Done</button>
                  </div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div className="flex p-0.5 bg-neutral-100 dark:bg-dark-surfaceHover rounded-lg mb-5">
                      {(['email', 'google'] as Tab[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                            tab === t
                              ? 'bg-white dark:bg-dark-surface text-neutral-900 dark:text-white shadow-xs'
                              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
                          }`}
                        >
                          {t === 'email' ? 'Email & Password' : 'Google'}
                        </button>
                      ))}
                    </div>

                    {tab === 'email' ? (
                      <form onSubmit={handleEmailUpgrade} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                            <input
                              type="email" required autoComplete="email" placeholder="you@example.com"
                              value={email} onChange={(e) => setEmail(e.target.value)}
                              className={`${inputClass} pl-9`}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                            <input
                              type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                              placeholder="At least 8 characters"
                              value={password}
                              onChange={(e) => { setPassword(e.target.value); if (confirm) validateConfirm(confirm); }}
                              className={`${inputClass} pl-9 pr-9`}
                            />
                            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <PasswordStrengthMeter password={password} />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Confirm password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                            <input
                              type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                              placeholder="Repeat password"
                              value={confirm}
                              onChange={(e) => { setConfirm(e.target.value); validateConfirm(e.target.value); }}
                              className={`${inputClass} pl-9 ${confirmError ? 'border-rose-400' : ''}`}
                            />
                          </div>
                          {confirmError && (
                            <p className="text-[11px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />{confirmError}
                            </p>
                          )}
                        </div>

                        {error && (
                          <p className="text-[11px] text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />{error}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={loading || !email || !password || !!confirmError}
                          className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {loading ? 'Creating account…' : 'Create Account & Save Progress'}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-neutral-500 dark:text-dark-textMuted leading-relaxed">
                          Link your Google account to this session. Your existing problems will remain accessible after signing in with Google.
                        </p>
                        {error && (
                          <p className="text-[11px] text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />{error}
                          </p>
                        )}
                        <button
                          onClick={handleGoogleUpgrade}
                          disabled={googleLoading}
                          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-dark-border text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-surfaceHover transition-all disabled:opacity-50"
                        >
                          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                          Continue with Google
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
