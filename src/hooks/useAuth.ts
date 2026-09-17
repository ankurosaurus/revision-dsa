import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useProblemStore } from '../store/useProblemStore';
import { useUIStore } from '../store/useUIStore';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const profile = useProblemStore((s) => s.profile);
  const updateProfile = useProblemStore((s) => s.updateProfile);
  const setIsOnboardingOpen = useUIStore((s) => s.setIsOnboardingOpen);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({
        id: 'guest-user',
        email: 'candidate@revisiondsa.dev',
        user_metadata: { full_name: profile.full_name || 'Interview Candidate' },
      });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        // Fetch or create profile
        supabase
          ?.from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              updateProfile(data);
            } else {
              // Trigger onboarding modal for new profile
              setIsOnboardingOpen(true);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [profile.full_name, updateProfile, setIsOnboardingOpen]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback
      setUser({
        id: 'local-user',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      });
      return { data: { user: { id: 'local-user', email } }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({
        id: 'local-user',
        email,
        user_metadata: { full_name: fullName },
      });
      setIsOnboardingOpen(true);
      return { data: { user: { id: 'local-user', email } }, error: null };
    }
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (!res.error) {
      setIsOnboardingOpen(true);
    }
    return res;
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Supabase credentials not yet configured in .env. Running in standalone Demo/Guest mode!');
      return;
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return {
    user,
    profile,
    loading,
    isSupabaseConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
