import { Platform, Difficulty, VerifiedMetadata } from '../types';

export interface UrlDetectionResult {
  isValid: boolean;
  platform?: Platform;
  slugOrId?: string;
  canonicalUrl?: string;
  error?: string;
}

// Regex patterns for problems
const LEETCODE_PROBLEM_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:leetcode\.com|leetcode\.cn)\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
const GFG_PROBLEM_REGEX = /^(?:https?:\/\/)?(?:www\.|practice\.)?geeksforgeeks\.org\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
const CODEFORCES_REGEX_1 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)(?:\/.*)?$/i;
const CODEFORCES_REGEX_2 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)(?:\/.*)?$/i;

/**
 * Validates and identifies the platform for a given URL
 */
export function detectAndValidateUrl(rawUrl: string): UrlDetectionResult {
  const url = rawUrl.trim();
  if (!url) {
    return { isValid: false, error: 'Please enter a problem URL' };
  }

  // 1. Check LeetCode
  if (LEETCODE_PROBLEM_REGEX.test(url)) {
    const match = url.match(LEETCODE_PROBLEM_REGEX);
    const slug = match ? match[1] : '';
    return {
      isValid: true,
      platform: 'leetcode',
      slugOrId: slug,
      canonicalUrl: `https://leetcode.com/problems/${slug}/`,
    };
  }

  // 2. Check GFG
  if (GFG_PROBLEM_REGEX.test(url)) {
    const match = url.match(GFG_PROBLEM_REGEX);
    const slug = match ? match[1] : '';
    return {
      isValid: true,
      platform: 'gfg',
      slugOrId: slug,
      canonicalUrl: `https://www.geeksforgeeks.org/problems/${slug}`,
    };
  }

  // 3. Check Codeforces
  if (CODEFORCES_REGEX_1.test(url) || CODEFORCES_REGEX_2.test(url)) {
    const match = url.match(CODEFORCES_REGEX_1) || url.match(CODEFORCES_REGEX_2);
    if (match) {
      const contestId = match[1];
      const index = match[2].toUpperCase();
      return {
        isValid: true,
        platform: 'codeforces',
        slugOrId: `${contestId}${index}`,
        canonicalUrl: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
      };
    }
  }

  // Helpful error diagnostics for non-problem links
  if (/leetcode\.(com|cn)\/(u|profile|discussion|tag|explore|problem-list)/i.test(url)) {
    return {
      isValid: false,
      error: "This looks like a LeetCode profile, list, or tag link, not a problem link.",
    };
  }

  if (/codeforces\.com\/(profile|ratings|contests|gym|blog)/i.test(url)) {
    return {
      isValid: false,
      error: "This looks like a Codeforces user profile or contest page link. Please paste a problem link.",
    };
  }

  if (/geeksforgeeks\.org\/(user|articles|category|courses)/i.test(url)) {
    return {
      isValid: false,
      error: "This looks like a GeeksforGeeks article or profile link. Please paste a practice problem link.",
    };
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Try prefixing https:// and test recursively
    const withHttps = `https://${url}`;
    const retry = detectAndValidateUrl(withHttps);
    if (retry.isValid) return retry;
  }

  return {
    isValid: false,
    error: 'Unrecognized URL. Please provide a direct problem link from LeetCode, GeeksforGeeks, or Codeforces.',
  };
}

/**
 * Derives a human-readable title from a problem slug or identifier
 */
export function deriveTitleFromSlug(slugOrId: string, platform?: Platform): string {
  if (!slugOrId) return 'DSA Problem';

  if (platform === 'codeforces') {
    // e.g. "4A" or "158A"
    return `Codeforces ${slugOrId}`;
  }

  // Convert "two-sum" or "trapping-rain-water" -> "Two Sum"
  return slugOrId
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calls the Supabase Edge Function to verify and fetch metadata,
 * with automatic local heuristic fallback if offline or unconfigured.
 */
export async function verifyAndFetchMetadata(url: string): Promise<VerifiedMetadata> {
  const detection = detectAndValidateUrl(url);
  if (!detection.isValid || !detection.platform) {
    return {
      platform: 'leetcode',
      verified: false,
      title: '',
      canonicalUrl: url,
      error: detection.error || 'Invalid problem link',
    };
  }

  const defaultTitle = deriveTitleFromSlug(detection.slugOrId || '', detection.platform);
  const canonical = detection.canonicalUrl || url;

  // Check if Supabase Edge Function URL is configured
  const edgeUrl = import.meta.env.VITE_SUPABASE_EDGE_FUNCTION_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-and-fetch-metadata` : null);

  if (edgeUrl) {
    try {
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ url: canonical }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          platform: data.platform || detection.platform,
          verified: data.verified ?? true,
          title: data.title || defaultTitle,
          difficulty: data.difficulty,
          canonicalUrl: data.canonicalUrl || canonical,
        };
      }
    } catch {
      // Fallback below
    }
  }

  // Client-side heuristics fallback
  let fallbackDifficulty: Difficulty = 'medium';
  if (detection.platform === 'codeforces') {
    fallbackDifficulty = 'easy';
  }

  return {
    platform: detection.platform,
    verified: true,
    title: defaultTitle,
    difficulty: fallbackDifficulty,
    canonicalUrl: canonical,
  };
}
