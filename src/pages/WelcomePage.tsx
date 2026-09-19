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
  'w-full bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1C1C1E] placeholder:text-[#8E8E93] focus:outline-none focus:border-[#2D5A6B] focus:ring-1 focus:ring-[#2D5A6B] transition-colors';

const errorClass = 'text-[12px] text-[#C25B5B] mt-1 flex items-center gap-1';

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label,
  error,
  children,
}) => (
  <div className="space-y-1">
    <label className="text-[13px] font-medium text-[#6E6E73]">{label}</label>
    {children}
    {error && (
      <p className={errorClass}>
        <AlertCircle className="w-3 h-3 shrink-0" strokeWidth={1.8} />
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
    <div className="w-full max-w-md mx-auto select-none">
      <div className="relative z-10 bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-6 sm:p-7 flex flex-col justify-between min-h-[340px] shadow-card">
        <div>
          {/* Card Topline */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <PlatformBadge platform="leetcode" size="sm" />
              <DifficultyBadge difficulty="hard" size="sm" />
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#C4923A]/10 text-[#C4923A] border border-[#C4923A]/20">
              Due today
            </span>
          </div>

          {/* Problem Title */}
          <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1C1C1E] leading-snug mb-3">
            Trapping Rain Water
          </h3>

          {/* Topic Tags */}
          <div className="flex items-center gap-1.5 mb-5">
            <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]">
              Two Pointers
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#FAFAF8] text-[#6E6E73] border border-[#E5E4E0]">
              Monotonic Stack
            </span>
          </div>

          {/* Card Interior / Approach Reveal */}
          <div>
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div
                  key="front"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-[8px] border border-dashed border-[#E5E4E0] p-4 bg-[#FAFAF8] text-center flex flex-col items-center justify-center min-h-[110px]"
                >
                  <p className="text-[14px] font-medium text-[#1C1C1E] mb-1">
                    What is the two-pointer invariant?
                  </p>
                  <p className="text-[12px] text-[#6E6E73] mb-2">
                    Mentally reconstruct the algorithm before revealing.
                  </p>
                  <span className="text-[11px] text-[#2D5A6B] font-medium border border-[#2D5A6B]/20 bg-[#2D5A6B]/5 px-2 py-0.5 rounded-[6px]">
                    Auto-revealing in 2s
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-[8px] border border-[#E5E4E0] bg-[#FAFAF8] p-4 min-h-[110px]"
                >
                  <span className="text-[13px] font-medium text-[#1C1C1E] block mb-1">
                    Algorithm invariant
                  </span>
                  <p className="text-[13px] text-[#1C1C1E] leading-relaxed">
                    Maintain <span className="font-mono text-[11px] bg-[#FFFFFF] border border-[#E5E4E0] px-1 py-0.5 rounded">left_max</span> and <span className="font-mono text-[11px] bg-[#FFFFFF] border border-[#E5E4E0] px-1 py-0.5 rounded">right_max</span>. Water trapped is <span className="font-mono text-[11px] bg-[#FFFFFF] border border-[#E5E4E0] px-1 py-0.5 rounded">min(L, R) - height[i]</span>. Advance the smaller wall inward.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rating Buttons in Footer */}
        <div className="pt-4 border-t border-[#E5E4E0] flex items-center justify-between gap-2 mt-4">
          <div className="text-[12px] text-[#6E6E73]">
            Recall quality:
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 text-[12px] rounded-[6px] border transition-all flex items-center gap-1 ${
                ratingState === 'again'
                  ? 'bg-[#C25B5B]/15 text-[#C25B5B] border-[#C25B5B]/30 font-medium'
                  : 'bg-[#FFFFFF] text-[#6E6E73] border-[#E5E4E0]'
              }`}
            >
              <RotateCcw className="w-3 h-3 text-[#C25B5B]" strokeWidth={1.8} />
              <span>Needs work</span>
            </span>

            <span
              className={`px-2.5 py-1 text-[12px] rounded-[6px] border transition-all flex items-center gap-1 ${
                ratingState === 'remembered'
                  ? 'bg-[#5A9367] text-white border-[#5A9367] font-medium'
                  : 'bg-[#5A9367]/10 text-[#5A9367] border-[#5A9367]/20'
              }`}
            >
              <Check className="w-3 h-3" strokeWidth={1.8} />
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAF8] p-4 sm:p-6 relative text-[#1C1C1E]">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-[10px] bg-[#FFFFFF] hover:bg-[#F7F7F5] text-[#6E6E73] hover:text-[#1C1C1E] border border-[#E5E4E0] transition-colors z-30 shadow-sm"
          title="Close and return to demo"
        >
          <X className="w-4 h-4" strokeWidth={1.8} />
        </button>
      )}

      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-[12px] overflow-hidden border border-[#E5E4E0] bg-[#FFFFFF] shadow-soft">
        {/* ── Left Side: Problem Lab & Flashcard Demo ──────────────────────── */}
        <div className="lg:w-7/12 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#E5E4E0] bg-[#FAFAF8]">
          <div>
            {/* Minimalist Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-7 h-7 rounded-[8px] bg-[#2D5A6B] text-white flex items-center justify-center font-medium text-xs shadow-sm">
                <BookOpen className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[17px] font-semibold text-[#1C1C1E] tracking-tight">
                RevisionDSA
              </span>
            </div>

            {/* Headline & Value Proposition */}
            <div className="space-y-3 mb-8">
              <h1 className="text-[28px] sm:text-[34px] font-semibold text-[#1C1C1E] leading-tight tracking-tight">
                Deliberate practice for algorithmic problem solving.
              </h1>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed max-w-lg">
                RevisionDSA schedules LeetCode, Codeforces, and GeeksforGeeks problems using adaptive SM-2 spaced repetition, turning ephemeral solves into permanent intuition.
              </p>
            </div>

            {/* Live Looping Flashcard Mini-Demo */}
            <div className="py-2">
              <LoopingFlashcardDemo />
            </div>
          </div>

          {/* Quiet feature indicators */}
          <div className="pt-6 border-t border-[#E5E4E0] flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#6E6E73]">
            <span>Adaptive SM-2 spacing</span>
            <span>15,000+ indexed catalog</span>
            <span>Integrated code compiler</span>
          </div>
        </div>

        {/* ── Right Side: Direct Action & Authentication ───────────────────── */}
        <div className="lg:w-5/12 p-6 sm:p-10 flex flex-col justify-center bg-[#FFFFFF]">
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
        <h2 className="text-[22px] font-semibold text-[#1C1C1E]">
          Start practicing
        </h2>
        <p className="text-[13px] text-[#6E6E73] mt-1">
          Select an option to access your revision queue.
        </p>
      </div>

      <div className="space-y-2.5">
        {/* 1. Explore Live Demo — Zero barrier */}
        {onExploreDemo && (
          <button
            onClick={onExploreDemo}
            className="w-full flex items-center justify-between px-4 py-3 rounded-[10px] bg-[#2D5A6B] text-white hover:bg-[#234754] font-medium text-[13px] transition-colors shadow-sm"
          >
            <div className="text-left">
              <span className="font-semibold block text-[13px]">
                Explore interactive demo
              </span>
              <span className="text-[11px] opacity-90 block">
                Test the spaced repetition queue and problem bank immediately
              </span>
            </div>
            <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.8} />
          </button>
        )}

        {/* 2. Start Guest Session */}
        <button
          onClick={handleGuest}
          disabled={guestLoading}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-[10px] border border-[#E5E4E0] bg-[#FFFFFF] hover:bg-[#F7F7F5] text-[#1C1C1E] transition-colors text-[13px] disabled:opacity-50 shadow-xs"
        >
          <div className="text-left">
            <span className="font-medium block text-[13px]">
              Continue as guest
            </span>
            <span className="text-[11px] text-[#6E6E73] block">
              No registration required · Progress saved on this device
            </span>
          </div>
          {guestLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D5A6B]" />}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[#E5E4E0]" />
          <span className="text-[11px] text-[#8E8E93]">or sync across devices</span>
          <div className="flex-1 h-px bg-[#E5E4E0]" />
        </div>

        {/* 3. Log In */}
        <button
          onClick={onLogin}
          className="w-full btn-secondary flex items-center justify-center py-2.5 text-[13px] font-medium"
        >
          <span>Log in to existing account</span>
        </button>

        {/* 4. Sign Up */}
        <button
          onClick={onSignUp}
          className="w-full flex items-center justify-center py-2 text-[13px] text-[#6E6E73] hover:text-[#1C1C1E] transition-colors"
        >
          <span>Create an account</span>
        </button>
      </div>

      {error && (
        <p className={errorClass}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
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
          className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <div>
          <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Log in</h2>
          <p className="text-[13px] text-[#6E6E73]">Access your revision schedule.</p>
        </div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border border-[#E5E4E0] text-[13px] font-medium text-[#1C1C1E] hover:bg-[#F7F7F5] transition-colors disabled:opacity-50 shadow-xs"
      >
        {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} /> : <GoogleIcon />}
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E5E4E0]" />
        <span className="text-[11px] text-[#8E8E93]">or with email</span>
        <div className="flex-1 h-px bg-[#E5E4E0]" />
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E]"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-[12px] text-[#6E6E73] hover:text-[#1C1C1E] hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className={errorClass}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full btn-primary py-2 text-[13px] font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />}
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
          className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <div>
          <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Create account</h2>
          <p className="text-[13px] text-[#6E6E73]">Sync your problem bank across devices.</p>
        </div>
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] border border-[#E5E4E0] text-[13px] font-medium text-[#1C1C1E] hover:bg-[#F7F7F5] transition-colors disabled:opacity-50 shadow-xs"
      >
        {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} /> : <GoogleIcon />}
        <span>Sign up with Google</span>
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E5E4E0]" />
        <span className="text-[11px] text-[#8E8E93]">or with email</span>
        <div className="flex-1 h-px bg-[#E5E4E0]" />
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E]"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />}
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
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password || !!emailError || !!confirmError}
          className="w-full btn-primary py-2 text-[13px] font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />}
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
          className="p-1 rounded-[6px] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <div>
          <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Reset password</h2>
          <p className="text-[13px] text-[#6E6E73]">We'll send you a password reset link.</p>
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
            <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full btn-primary py-2 text-[13px] font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.8} />}
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
    <div className="w-12 h-12 mx-auto rounded-[10px] bg-[#5A9367]/15 text-[#5A9367] flex items-center justify-center border border-[#5A9367]/25">
      <Mail className="w-6 h-6" strokeWidth={1.8} />
    </div>
    <div>
      <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Check your inbox</h2>
      <p className="text-[13px] text-[#6E6E73] mt-1 max-w-xs mx-auto leading-relaxed">
        Confirmation link sent. Click the link in the email to activate your account.
      </p>
    </div>
    <button
      onClick={onBack}
      className="text-[13px] font-medium text-[#2D5A6B] hover:underline"
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
    <div className="w-12 h-12 mx-auto rounded-[10px] bg-[#5A9367]/15 text-[#5A9367] flex items-center justify-center border border-[#5A9367]/25">
      <Check className="w-6 h-6" strokeWidth={1.8} />
    </div>
    <div>
      <h2 className="text-[20px] font-semibold text-[#1C1C1E]">Reset link dispatched</h2>
      <p className="text-[13px] text-[#6E6E73] mt-1 max-w-xs mx-auto leading-relaxed">
        Check your email for the password reset link. It expires in 1 hour.
      </p>
    </div>
    <button
      onClick={onBack}
      className="text-[13px] font-medium text-[#2D5A6B] hover:underline"
    >
      Return to login
    </button>
  </motion.div>
);
