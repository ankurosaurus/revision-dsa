/**
 * WelcomePage — shown when session === null after loading completes.
 *
 * Layout: Full-screen centered card.
 *   Left: Brand value prop + animated icon
 *   Right: 3 auth options with animated tab-switch (Login / Sign Up / Continue as Guest)
 *
 * Auth methods:
 *   - Continue as Guest: Instantly starts a guest session (zero fields, no barrier).
 *   - Email + Password: Login / Registration.
 *   - Google OAuth (available when configured).
 *
 * Designed to never block the user with disabled buttons or dead screens.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { useAuth } from '../contexts/AuthContext';

type Screen = 'home' | 'login' | 'signup' | 'forgot' | 'check-inbox' | 'forgot-sent';

const REDIRECT_URL = `${window.location.origin}/`;

// ── Google logo SVG ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── Shared input styling ─────────────────────────────────────────────────────
const inputClass =
  'w-full bg-neutral-50 dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 transition-colors';

const errorClass = 'text-[11px] text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1';

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>
    {children}
    {error && (
      <p className={errorClass}>
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const WelcomePage: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-dark-bg bg-grid-pattern p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        {/* ── Left: Value prop ─────────────────────────────── */}
        <div className="lg:w-5/12 bg-brand-600 dark:bg-brand-700 p-10 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">RevisionDSA</span>
          </div>

          <div className="space-y-4 py-10">
            {/* Animated icon */}
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white leading-tight">
                Track your DSA grind.<br />Never forget a pattern again.
              </h1>
              <p className="text-brand-100 text-sm leading-relaxed">
                Spaced-repetition scheduling for LeetCode, Codeforces &amp; GFG problems. 
                Review the right problem at exactly the right time.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {[
                'SM-2 algorithm — same tech as Anki',
                '15,000+ problem catalog built-in',
                'Works offline, syncs when connected',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-brand-100 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-brand-200 text-[11px]">No credit card required &middot; Free forever</p>
        </div>

        {/* ── Right: Auth screens ───────────────────────────── */}
        <div className="lg:w-7/12 p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <HomeScreen key="home" onLogin={() => setScreen('login')} onSignUp={() => setScreen('signup')} />
            )}
            {screen === 'login' && (
              <LoginForm key="login" onBack={() => setScreen('home')} onForgot={() => setScreen('forgot')} />
            )}
            {screen === 'signup' && (
              <SignUpForm key="signup" onBack={() => setScreen('home')} onSuccess={() => setScreen('check-inbox')} />
            )}
            {screen === 'forgot' && (
              <ForgotForm key="forgot" onBack={() => setScreen('login')} onSuccess={() => setScreen('forgot-sent')} />
            )}
            {screen === 'check-inbox' && (
              <CheckInbox key="inbox" onBack={() => setScreen('home')} />
            )}
            {screen === 'forgot-sent' && (
              <ForgotSent key="forgot-sent" onBack={() => setScreen('login')} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ── Screen: Home (3 options) ─────────────────────────────────────────────────
const HomeScreen: React.FC<{ onLogin: () => void; onSignUp: () => void }> = ({ onLogin, onSignUp }) => {
  const { signInAsGuest } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    setGuestLoading(true);
    setError('');
    try {
      const res = await signInAsGuest();
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to start guest session');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Get started</h2>
        <p className="text-sm text-neutral-500 dark:text-dark-textMuted mt-1">
          Choose how you'd like to continue.
        </p>
      </div>

      <div className="space-y-3">
        {/* Log In */}
        <button
          onClick={onLogin}
          className="w-full btn-primary flex items-center justify-between px-4 py-3"
        >
          <span className="font-semibold">Log In</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Sign Up */}
        <button
          onClick={onSignUp}
          className="w-full btn-secondary flex items-center justify-between px-4 py-3"
        >
          <span className="font-semibold">Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">or</span>
          <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
        </div>

        {/* Continue as Guest — 100% active, frictionless access */}
        <button
          onClick={handleGuest}
          disabled={guestLoading}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-neutral-200 dark:border-dark-border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-surfaceHover hover:border-neutral-300 dark:hover:border-neutral-600 transition-all font-medium text-sm group"
        >
          <div className="text-left">
            <span className="font-semibold block text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Continue as Guest
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">
              No sign-up required · Saved on this device only
            </span>
          </div>
          {guestLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
          ) : (
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-brand-500 transition-all" />
          )}
        </button>
      </div>

      {error && (
        <p className={errorClass}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      <p className="text-[11px] text-neutral-400 dark:text-neutral-600 text-center">
        By continuing, you agree to our terms of service.
      </p>
    </motion.div>
  );
};

// ── Screen: Login ─────────────────────────────────────────────────────────────
const LoginForm: React.FC<{ onBack: () => void; onForgot: () => void }> = ({ onBack, onForgot }) => {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signInWithPassword(email, password);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    }
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Google Sign-In requires Supabase configuration in .env.local. You can use Email login or Continue as Guest immediately.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT_URL },
    });
    if (err) { setError(err.message); setGoogleLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover text-neutral-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Welcome back</h2>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted">Log in to your account.</p>
        </div>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-dark-border text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-surfaceHover transition-all disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
        <span className="text-[11px] text-neutral-400 font-medium">or with email</span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-9 pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <button type="button" onClick={onForgot} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
            Forgot password?
          </button>
        </div>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Sign Up ───────────────────────────────────────────────────────────
const SignUpForm: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({ onBack, onSuccess }) => {
  const { signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');

  // Live validation
  const validateEmail = (v: string) => {
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setEmailError('Enter a valid email address.');
    else setEmailError('');
  };
  const validateConfirm = (v: string) => {
    if (v && v !== password) setConfirmError('Passwords do not match.');
    else setConfirmError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setConfirmError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    setError('');
    const res = await signUpWithEmail(email, password, fullName);
    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (isSupabaseConfigured) {
      onSuccess();
    }
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Google Sign-In requires Supabase configuration in .env.local. You can use Email sign up or Continue as Guest immediately.');
      return;
    }
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT_URL },
    });
    if (err) { setError(err.message); setGoogleLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover text-neutral-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Create account</h2>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted">Start tracking your DSA grind.</p>
        </div>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-dark-border text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-surfaceHover transition-all disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
        Sign up with Google
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
        <span className="text-[11px] text-neutral-400 font-medium">or with email</span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-dark-border" />
      </div>

      <form onSubmit={handleSignUp} className="space-y-3">
        <Field label="Full name">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              autoComplete="name"
              placeholder="Candidate Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>

        <Field label="Email" error={emailError}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              className={`${inputClass} pl-9 ${emailError ? 'border-rose-400' : ''}`}
            />
          </div>
        </Field>

        <Field label="Password">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (confirm) validateConfirm(confirm); }}
              className={`${inputClass} pl-9 pr-9`}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </Field>

        <Field label="Confirm password" error={confirmError}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); validateConfirm(e.target.value); }}
              className={`${inputClass} pl-9 ${confirmError ? 'border-rose-400' : ''}`}
            />
          </div>
        </Field>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password || !!emailError || !!confirmError}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Forgot Password ───────────────────────────────────────────────────
const ForgotForm: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Password recovery via email requires Supabase configuration in .env.local.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${REDIRECT_URL}reset-password`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else onSuccess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-dark-surfaceHover text-neutral-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Reset password</h2>
          <p className="text-xs text-neutral-500 dark:text-dark-textMuted">We'll send you a reset link.</p>
        </div>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <Field label="Email address">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </Field>

        {error && <p className={errorClass}><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</p>}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Check Inbox ───────────────────────────────────────────────────────
const CheckInbox: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="text-center space-y-5 py-6"
  >
    <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center">
      <Mail className="w-8 h-8 text-brand-600 dark:text-brand-400" />
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Check your inbox</h2>
      <p className="text-sm text-neutral-500 dark:text-dark-textMuted leading-relaxed max-w-xs mx-auto">
        We sent you a confirmation email. Click the link in it to activate your account and start tracking.
      </p>
    </div>
    <button onClick={onBack} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
      Back to start
    </button>
  </motion.div>
);

// ── Screen: Forgot Sent ───────────────────────────────────────────────────────
const ForgotSent: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="text-center space-y-5 py-6"
  >
    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Reset link sent</h2>
      <p className="text-sm text-neutral-500 dark:text-dark-textMuted leading-relaxed max-w-xs mx-auto">
        Check your email for the password reset link. It expires in 1 hour.
      </p>
    </div>
    <button onClick={onBack} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
      Back to login
    </button>
  </motion.div>
);
