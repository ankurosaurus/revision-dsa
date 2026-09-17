/**
 * analytics.ts — Centralized PostHog product analytics.
 *
 * Initialized once at app startup. All custom event tracking happens
 * through the typed `track()` helper exported here.
 *
 * Session recording is enabled with input masking so email/password
 * fields are NEVER captured.
 *
 * Set VITE_POSTHOG_KEY in .env.local to activate.
 * Leave unset to silently no-op (safe for local dev without a PostHog account).
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = 'https://us.i.posthog.com'; // US cloud (change to eu.i.posthog.com for EU)

let initialized = false;

export function initPostHog() {
  if (initialized || !POSTHOG_KEY) return;
  initialized = true;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Capture standard page views automatically
    capture_pageview: true,
    // Session recording — enabled with input masking
    session_recording: {
      maskAllInputs: true,        // never record any typed text (email, passwords, etc.)
      maskTextSelector: 'input, textarea', // belt-and-suspenders mask on raw DOM level
    },
    // Autocapture click / change / submit events — useful for funnel analysis
    autocapture: true,
    // Respect DNT and opt-outs
    respect_dnt: true,
    // Disable in-page console logs
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug(false); // silence verbose PostHog debug output during development
      }
    },
  });
}

// ── Typed custom events ────────────────────────────────────────────────────────

type EventMap = {
  user_signed_up:           { method: 'email' | 'google' };
  guest_session_started:    Record<string, never>;
  guest_upgraded_to_account:{ method: 'email' | 'google' };
  problem_added:            { platform: 'leetcode' | 'gfg' | 'codeforces' };
  revision_completed:       { rating: 'again' | 'hard' | 'good' | 'easy' };
  daily_goal_reached:       { goal: number; total_today: number };
};

/**
 * track — fire a PostHog custom event.
 * Safe to call before init() completes; PostHog queues events internally.
 */
export function track<K extends keyof EventMap>(
  event: K,
  properties?: EventMap[K]
) {
  try {
    posthog.capture(event, properties as Record<string, unknown>);
  } catch {
    // Never crash the app due to an analytics failure
  }
}

/**
 * identifyUser — associate PostHog events with a Supabase user ID.
 * Call after a successful login/signup. Safe to skip for guests.
 */
export function identifyUser(userId: string, email?: string) {
  try {
    posthog.identify(userId, email ? { email } : undefined);
  } catch {}
}

/**
 * resetUser — call on sign-out to start a new anonymous session.
 */
export function resetUser() {
  try {
    posthog.reset();
  } catch {}
}

export { posthog };
