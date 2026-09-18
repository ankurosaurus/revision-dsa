/**
 * WelcomePage — landing & authentication hub.
 *
 * Implements the lab-notebook visual identity:
 * - Warm graphite base (#14171F), surface (#1C202B), border (#2C3140).
 * - Fraunces serif for headings and problem flashcard.
 * - Work Sans humanist body typography.
 * - Looping interactive mini-demo of the physical flashcard flip mechanic ("Trapping Rain Water").
 * - Direct, unpretentious action language ("Start reviewing", "Explore demo", "Continue as guest").
 * - No trailing "→" arrows, no marketing buzzwords, no decorative gradients.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  X,
  Layers,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { useAuth } from '../contexts/AuthContext';
import { track } from '../lib/analytics';
import { PlatformBadge } from '../components/problems/PlatformBadge';
import { DifficultyBadge } from '../components/problems/DifficultyBadge';

type Screen = 'home' | 'login' | 'signup' | 'forgot' | 'check-inbox' | 'forgot-sent';

const REDIRECT_URL = `${window.location.origin}/`;

// ── Google Logo SVG ──────────────────────────────────────────────────────────
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
  'w-full bg-[#14171F] border border-[#2C3140] rounded-lg px-3.5 py-2.5 text-xs text-[#E7E5DF] placeholder:text-[#656B7B] focus:outline-none focus:border-[#4F9C8D] transition-colors';

const errorClass = 'text-[11px] text-ochre mt-1 flex items-center gap-1';

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-paper-secondary">{label}</label>
    {children}
    {error && (
      <p className={errorClass}>
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ── Looping Mini-Demo of Flashcard Flip Mechanic ─────────────────────────────
const LoopingFlashcardDemo: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [ratingState, setRatingState] = useState<'idle' | 'remembered' | 'again'>('idle');

  useEffect(() => {
    // Loop cycle: 
    // 0s: show prompt
    // 2.5s: reveal approach notes
    // 5.0s: simulate rating (remembered)
    // 7.0s: reset to prompt
    const t1 = setTimeout(() => setIsRevealed(true), 2400);
    const t2 = setTimeout(() => setRatingState('remembered'), 4800);
    const t3 = setTimeout(() => {
      setIsRevealed(false);
      setRatingState('idle');
    }, 7200);

    const interval = setInterval(() => {
      setIsRevealed(false);
      setRatingState('idle');
      setTimeout(() => setIsRevealed(true), 2400);
      setTimeout(() => setRatingState('remembered'), 4800);
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto deck-stack-wrap select-none">
      {/* Peeking deck layer 2 */}
      <div className="deck-card-layer-2" aria-hidden="true" />
      {/* Peeking deck layer 1 */}
      <div className="deck-card-layer-1" aria-hidden="true" />

      {/* Front physical index card */}
      <div className="relative z-10 physical-index-card p-6 sm:p-7 flex flex-col justify-between min-h-[340px]">
        <div>
          {/* Card Topline */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <PlatformBadge platform="leetcode" size="sm" />
              <DifficultyBadge difficulty="hard" size="sm" />
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border">
              Due today
            </span>
          </div>

          {/* Problem Title in Fraunces serif */}
          <h3 className="font-serif text-xl sm:text-2xl text-paper-primary font-normal leading-snug mb-3">
            Trapping Rain Water
          </h3>

          {/* Topic Tags */}
          <div className="flex items-center gap-1.5 mb-5">
            <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border">
              Two Pointers
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-surface-subtle text-paper-secondary border border-surface-border">
              Monotonic Stack
            </span>
          </div>

          {/* Card Interior / Approach Reveal */}
          <div className="perspective-1000">
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, rotateX: -15 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 15 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-lg border border-dashed border-surface-border p-4 bg-surface-subtle/80 text-center flex flex-col items-center justify-center min-h-[110px]"
                >
                  <p className="font-serif text-sm text-paper-primary mb-1">
                    What is the two-pointer invariant?
                  </p>
                  <p className="text-[11px] text-paper-secondary mb-2">
                    Mentally reconstruct the algorithm before revealing.
                  </p>
                  <span className="text-[10px] text-teal font-medium border border-teal/30 bg-teal/10 px-2 py-0.5 rounded">
                    Auto-revealing in 2s
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, rotateX: 15 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -15 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-lg border border-surface-border bg-surface-subtle p-4 min-h-[110px]"
                >
                  <span className="text-xs font-medium text-teal block mb-1">
                    Algorithm invariant
                  </span>
                  <p className="text-xs text-paper-primary leading-relaxed">
                    Maintain <span className="font-mono text-[11px] bg-graphite-950 px-1 py-0.5 rounded">left_max</span> and <span className="font-mono text-[11px] bg-graphite-950 px-1 py-0.5 rounded">right_max</span>. Water trapped is <span className="font-mono text-[11px] bg-graphite-950 px-1 py-0.5 rounded">min(L, R) - height[i]</span>. Advance the smaller wall inward.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rating Buttons in Footer */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-2 mt-4">
          <div className="text-[11px] text-paper-secondary">
            Recall quality:
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                ratingState === 'again'
                  ? 'bg-ochre/25 text-ochre border-ochre font-semibold'
                  : 'bg-surface text-paper-secondary border-surface-border'
              }`}
            >
              <RotateCcw className="w-3 h-3 text-ochre" />
              <span>Needs work</span>
            </span>

            <span
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                ratingState === 'remembered'
                  ? 'bg-teal text-[#0E1614] border-teal font-medium'
                  : 'bg-teal/10 text-teal border-teal/30'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Remembered (+3d)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Welcome Page ────────────────────────────────────────────────────────
export const WelcomePage: React.FC<{ onClose?: () => void; onExploreDemo?: () => void }> = ({
  onClose,
  onExploreDemo,
}) => {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-graphite bg-grid-pattern p-4 sm:p-6 relative text-paper-primary">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg bg-surface hover:bg-surface-hover text-paper-secondary hover:text-paper-primary border border-surface-border transition-colors z-30"
          title="Close and return to demo"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-surface-border bg-surface shadow-elevated">
        {/* ── Left Side: Problem Lab & Flashcard Demo ──────────────────────── */}
        <div className="lg:w-7/12 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-surface-border bg-graphite-950/50">
          <div>
            {/* Minimalist Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-7 h-7 rounded-lg bg-teal text-[#0E1614] flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-paper-primary tracking-tight">
                RevisionDSA
              </span>
            </div>

            {/* Headline & Value Proposition */}
            <div className="space-y-3 mb-8">
              <h1 className="font-serif text-3xl sm:text-4xl text-paper-primary font-normal leading-tight">
                Deliberate practice for algorithmic problem solving.
              </h1>
              <p className="text-xs sm:text-sm text-paper-secondary leading-relaxed max-w-lg">
                RevisionDSA schedules LeetCode, Codeforces, and GeeksforGeeks problems using adaptive SM-2 spaced repetition, turning ephemeral solves into permanent intuition.
              </p>
            </div>

            {/* Live Looping Flashcard Mini-Demo */}
            <div className="py-2">
              <LoopingFlashcardDemo />
            </div>
          </div>

          {/* Quiet feature indicators without marketing fluff */}
          <div className="pt-6 border-t border-surface-border flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-paper-secondary">
            <span>Adaptive SM-2 spacing</span>
            <span>15,000+ indexed catalog</span>
            <span>Integrated code compiler</span>
          </div>
        </div>

        {/* ── Right Side: Direct Action & Authentication ───────────────────── */}
        <div className="lg:w-5/12 p-6 sm:p-10 flex flex-col justify-center bg-surface">
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <HomeScreen
                key="home"
                onLogin={() => {
                  track('signup_button_clicked', { source: 'welcome_login' });
                  setScreen('login');
                }}
                onSignUp={() => {
                  track('signup_button_clicked', { source: 'welcome_signup' });
                  setScreen('signup');
                }}
                onExploreDemo={onExploreDemo}
              />
            )}
            {screen === 'login' && (
              <LoginForm
                key="login"
                onBack={() => setScreen('home')}
                onForgot={() => setScreen('forgot')}
              />
            )}
            {screen === 'signup' && (
              <SignUpForm
                key="signup"
                onBack={() => setScreen('home')}
                onSuccess={() => setScreen('check-inbox')}
              />
            )}
            {screen === 'forgot' && (
              <ForgotForm
                key="forgot"
                onBack={() => setScreen('login')}
                onSuccess={() => setScreen('forgot-sent')}
              />
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

// ── Screen: Home ─────────────────────────────────────────────────────────────
const HomeScreen: React.FC<{
  onLogin: () => void;
  onSignUp: () => void;
  onExploreDemo?: () => void;
}> = ({ onLogin, onSignUp, onExploreDemo }) => {
  const { signInAsGuest } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuest = async () => {
    track('guest_button_clicked', { source: 'welcome_guest' });
    setGuestLoading(true);
    setError('');
    try {
      const res = await signInAsGuest();
      if (res?.error) setError(res.error);
    } catch (err: any) {
      setError(err?.message || 'Failed to start guest session');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="space-y-5"
    >
      <div>
        <h2 className="font-serif text-2xl text-paper-primary font-normal">
          Start practicing
        </h2>
        <p className="text-xs text-paper-secondary mt-1">
          Select an option to access your revision queue.
        </p>
      </div>

      <div className="space-y-2.5">
        {/* 1. Explore Live Demo — Zero barrier */}
        {onExploreDemo && (
          <button
            onClick={onExploreDemo}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-teal text-[#0E1614] hover:bg-teal-hover font-medium text-xs transition-colors shadow-xs"
          >
            <div className="text-left">
              <span className="font-semibold block text-xs">
                Explore interactive demo
              </span>
              <span className="text-[11px] opacity-90 block">
                Test the spaced repetition queue and problem bank immediately
              </span>
            </div>
            <Sparkles className="w-4 h-4 shrink-0" />
          </button>
        )}

        {/* 2. Start Guest Session */}
        <button
          onClick={handleGuest}
          disabled={guestLoading}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-surface-border bg-surface-subtle hover:bg-surface-hover text-paper-primary transition-colors text-xs disabled:opacity-50"
        >
          <div className="text-left">
            <span className="font-medium block text-xs">
              Continue as guest
            </span>
            <span className="text-[11px] text-paper-muted block">
              No registration required · Progress saved on this device
            </span>
          </div>
          {guestLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-teal" />}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="text-[11px] text-paper-muted">or sync across devices</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {/* 3. Log In */}
        <button
          onClick={onLogin}
          className="w-full btn-secondary flex items-center justify-center py-2.5 text-xs font-medium"
        >
          <span>Log in to existing account</span>
        </button>

        {/* 4. Sign Up */}
        <button
          onClick={onSignUp}
          className="w-full flex items-center justify-center py-2 text-xs text-paper-secondary hover:text-paper-primary transition-colors"
        >
          <span>Create an account</span>
        </button>
      </div>

      {error && (
        <p className={errorClass}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </motion.div>
  );
};

// ── Screen: Login ─────────────────────────────────────────────────────────────
const LoginForm: React.FC<{ onBack: () => void; onForgot: () => void }> = ({
  onBack,
  onForgot,
}) => {
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
    if (res?.error) setError(res.error);
  };

  const handleGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Google Sign-In requires Supabase credentials in .env.local.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT_URL },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded text-paper-muted hover:text-paper-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-serif text-xl text-paper-primary font-normal">Log in</h2>
          <p className="text-xs text-paper-secondary">Access your revision schedule.</p>
        </div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-surface-border text-xs font-medium text-paper-primary hover:bg-surface-hover transition-colors disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GoogleIcon />}
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-[11px] text-paper-muted">or with email</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      <form onSubmit={handleLogin} className="space-y-3">
        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="candidate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-8`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-primary"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-paper-secondary hover:text-paper-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full btn-primary py-2 text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{loading ? 'Authenticating…' : 'Log in'}</span>
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Sign Up ───────────────────────────────────────────────────────────
const SignUpForm: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({
  onBack,
  onSuccess,
}) => {
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

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
      setError('Google Sign-In requires Supabase credentials in .env.local.');
      return;
    }
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: REDIRECT_URL },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded text-paper-muted hover:text-paper-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-serif text-xl text-paper-primary font-normal">Create account</h2>
          <p className="text-xs text-paper-secondary">Sync your problem bank across devices.</p>
        </div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-surface-border text-xs font-medium text-paper-primary hover:bg-surface-hover transition-colors disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GoogleIcon />}
        <span>Sign up with Google</span>
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-[11px] text-paper-muted">or with email</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      <form onSubmit={handleSignUp} className="space-y-3">
        <Field label="Full name">
          <input
            type="text"
            autoComplete="name"
            placeholder="Candidate Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Email" error={emailError}>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="candidate@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-8`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper-muted hover:text-paper-primary"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <PasswordStrengthMeter password={password} />
        </Field>

        <Field label="Confirm password" error={confirmError}>
          <input
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setConfirmError('');
            }}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password || !!emailError || !!confirmError}
          className="w-full btn-primary py-2 text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{loading ? 'Creating account…' : 'Create account'}</span>
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Forgot Password ───────────────────────────────────────────────────
const ForgotForm: React.FC<{ onBack: () => void; onSuccess: () => void }> = ({
  onBack,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Password recovery via email requires Supabase configuration.');
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
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded text-paper-muted hover:text-paper-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-serif text-xl text-paper-primary font-normal">Reset password</h2>
          <p className="text-xs text-paper-secondary">We'll send you a password reset link.</p>
        </div>
      </div>

      <form onSubmit={handleReset} className="space-y-3">
        <Field label="Email address">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="candidate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full btn-primary py-2 text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{loading ? 'Sending link…' : 'Send reset link'}</span>
        </button>
      </form>
    </motion.div>
  );
};

// ── Screen: Check Inbox ───────────────────────────────────────────────────────
const CheckInbox: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center space-y-4 py-4"
  >
    <div className="w-12 h-12 mx-auto rounded-xl bg-teal/15 text-teal flex items-center justify-center border border-teal/30">
      <Mail className="w-6 h-6" />
    </div>
    <div>
      <h2 className="font-serif text-xl text-paper-primary font-normal">Check your inbox</h2>
      <p className="text-xs text-paper-secondary mt-1 max-w-xs mx-auto leading-relaxed">
        Confirmation link sent. Click the link in the email to activate your account.
      </p>
    </div>
    <button
      onClick={onBack}
      className="text-xs font-medium text-teal hover:underline"
    >
      Return to start
    </button>
  </motion.div>
);

// ── Screen: Forgot Sent ───────────────────────────────────────────────────────
const ForgotSent: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center space-y-4 py-4"
  >
    <div className="w-12 h-12 mx-auto rounded-xl bg-teal/15 text-teal flex items-center justify-center border border-teal/30">
      <Check className="w-6 h-6" />
    </div>
    <div>
      <h2 className="font-serif text-xl text-paper-primary font-normal">Reset link dispatched</h2>
      <p className="text-xs text-paper-secondary mt-1 max-w-xs mx-auto leading-relaxed">
        Check your email for the password reset link. It expires in 1 hour.
      </p>
    </div>
    <button
      onClick={onBack}
      className="text-xs font-medium text-teal hover:underline"
    >
      Return to login
    </button>
  </motion.div>
);
