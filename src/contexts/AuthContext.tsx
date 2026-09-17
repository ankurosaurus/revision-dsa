/**
 * AuthContext — wraps the entire app.
 * Exposes: user, session, isGuest, loading, signInAsGuest, signInWithPassword, signUpWithEmail, signOut, refreshUser
 *
 * Designed to NEVER leave the user blocked or staring at disabled buttons:
 * 1. If Supabase is configured:
 *    Uses real Supabase Auth (email, password, OAuth, anonymous guest).
 *    If anonymous sign-in has not been toggled on yet in Supabase dashboard,
 *    it gracefully falls back to local guest mode so the user can immediately use the app.
 * 2. If Supabase is not configured:
 *    Seamlessly supports local guest and account sessions stored in localStorage,
 *    giving the user a 100% functional experience out-of-the-box.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { resetUser, track } from '../lib/analytics';

const LOCAL_AUTH_STORAGE_KEY = 'revision_dsa_local_auth_session_v1';

export interface LocalAuthData {
  user: {
    id: string;
    email?: string;
    user_metadata: {
      full_name?: string;
    };
    app_metadata: {
      provider: string;
    };
    is_anonymous: boolean;
    created_at: string;
  };
  token: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  signInAsGuest: () => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isGuest: false,
  loading: true,
  signInAsGuest: async () => ({}),
  signInWithPassword: async () => ({}),
  signUpWithEmail: async () => ({}),
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function createLocalGuestUser(): LocalAuthData {
  const id = `guest-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  return {
    user: {
      id,
      user_metadata: { full_name: 'Guest User' },
      app_metadata: { provider: 'anonymous' },
      is_anonymous: true,
      created_at: new Date().toISOString(),
    },
    token: `local-token-${id}`,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isGuest = Boolean(user?.is_anonymous);

  const refreshUser = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        return;
      }
    }
    // Check local storage fallback
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (raw) {
        const parsed: LocalAuthData = JSON.parse(raw);
        setUser(parsed.user as unknown as User);
      }
    } catch {}
  }, []);

  // ── 1. Sign In As Guest ───────────────────────────────────────────────────
  const signInAsGuest = useCallback(async (): Promise<{ error?: string }> => {
    // If Supabase is configured, try Supabase anonymous auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.session && data.user) {
          setSession(data.session);
          setUser(data.user);
          track('guest_session_started', {});
          return {};
        }
        console.warn('Supabase anonymous sign-in failed, falling back to local guest session:', error?.message);
      } catch (e) {
        console.warn('Supabase error during guest login, using local session:', e);
      }
    }

    // Local guest fallback (guaranteed to always work)
    const localData = createLocalGuestUser();
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(localData));
    const mockSession = {
      access_token: localData.token,
      refresh_token: localData.token,
      expires_in: 999999999,
      token_type: 'bearer',
      user: localData.user as unknown as User,
    } as Session;

    setSession(mockSession);
    setUser(localData.user as unknown as User);
    track('guest_session_started', {});
    return {};
  }, []);

  // ── 2. Sign In With Password ──────────────────────────────────────────────
  const signInWithPassword = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        return { error: error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message };
      }
      return {};
    }

    // Local mode fallback
    const id = `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const localData: LocalAuthData = {
      user: {
        id,
        email: email.trim(),
        user_metadata: { full_name: email.split('@')[0] },
        app_metadata: { provider: 'email' },
        is_anonymous: false,
        created_at: new Date().toISOString(),
      },
      token: `local-token-${id}`,
    };
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(localData));
    const mockSession = {
      access_token: localData.token,
      refresh_token: localData.token,
      expires_in: 999999999,
      token_type: 'bearer',
      user: localData.user as unknown as User,
    } as Session;
    setSession(mockSession);
    setUser(localData.user as unknown as User);
    return {};
  }, []);

  // ── 3. Sign Up With Email ─────────────────────────────────────────────────
  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName?.trim() },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        return {
          error: error.message.includes('already registered')
            ? 'This email is already in use. Try logging in.'
            : error.message,
        };
      }
      return {};
    }

    // Local mode fallback: directly create local account
    const id = `user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const localData: LocalAuthData = {
      user: {
        id,
        email: email.trim(),
        user_metadata: { full_name: fullName?.trim() || email.split('@')[0] },
        app_metadata: { provider: 'email' },
        is_anonymous: false,
        created_at: new Date().toISOString(),
      },
      token: `local-token-${id}`,
    };
    localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(localData));
    const mockSession = {
      access_token: localData.token,
      refresh_token: localData.token,
      expires_in: 999999999,
      token_type: 'bearer',
      user: localData.user as unknown as User,
    } as Session;
    setSession(mockSession);
    setUser(localData.user as unknown as User);
    track('user_signed_up', { method: 'email' });
    return {};
  }, []);

  // ── 4. Sign Out ───────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    resetUser();
    setSession(null);
    setUser(null);
  }, []);

  // ── 5. Session Initialization & Event Subscription ────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      // 1. Check Supabase session first if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s && mounted) {
            setSession(s);
            setUser(s.user ?? null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error checking Supabase session:', err);
        }
      }

      // 2. Check local fallback session
      try {
        const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
        if (raw && mounted) {
          const parsed: LocalAuthData = JSON.parse(raw);
          const mockSession = {
            access_token: parsed.token,
            refresh_token: parsed.token,
            expires_in: 999999999,
            token_type: 'bearer',
            user: parsed.user as unknown as User,
          } as Session;
          setSession(mockSession);
          setUser(parsed.user as unknown as User);
        }
      } catch (err) {
        console.warn('Failed to parse local auth session:', err);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initSession();

    // Subscribe to Supabase auth events if connected
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, s) => {
        if (mounted) {
          setSession(s);
          setUser(s?.user ?? null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        loading,
        signInAsGuest,
        signInWithPassword,
        signUpWithEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
