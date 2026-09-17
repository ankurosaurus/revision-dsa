// Supabase Edge Function: verify-and-fetch-metadata
// Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyRequest {
  url: string;
}

interface VerifyResponse {
  platform: 'leetcode' | 'gfg' | 'codeforces';
  verified: boolean;
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  canonicalUrl: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = (await req.json()) as VerifyRequest;

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'url' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedUrl = url.trim();

    // Regex checks
    // 1. LeetCode: leetcode.com/problems/{slug} or leetcode.cn/problems/{slug}
    const leetcodeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:leetcode\.com|leetcode\.cn)\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
    // 2. GeeksforGeeks: geeksforgeeks.org/problems/{slug} or practice.geeksforgeeks.org/problems/{slug}
    const gfgRegex = /^(?:https?:\/\/)?(?:www\.|practice\.)?geeksforgeeks\.org\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
    // 3. Codeforces: codeforces.com/problemset/problem/{contestId}/{index} or codeforces.com/contest/{contestId}/problem/{index}
    const cfRegex1 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)(?:\/.*)?$/i;
    const cfRegex2 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)(?:\/.*)?$/i;

    let platform: 'leetcode' | 'gfg' | 'codeforces' | null = null;
    let slugOrId = "";
    let canonicalUrl = trimmedUrl;

    if (leetcodeRegex.test(trimmedUrl)) {
      platform = "leetcode";
      const match = trimmedUrl.match(leetcodeRegex);
      slugOrId = match ? match[1] : "";
      canonicalUrl = `https://leetcode.com/problems/${slugOrId}/`;
    } else if (gfgRegex.test(trimmedUrl)) {
      platform = "gfg";
      const match = trimmedUrl.match(gfgRegex);
      slugOrId = match ? match[1] : "";
      canonicalUrl = `https://www.geeksforgeeks.org/problems/${slugOrId}/`;
    } else if (cfRegex1.test(trimmedUrl) || cfRegex2.test(trimmedUrl)) {
      platform = "codeforces";
      const match = trimmedUrl.match(cfRegex1) || trimmedUrl.match(cfRegex2);
      if (match) {
        const contestId = match[1];
        const index = match[2].toUpperCase();
        slugOrId = `${contestId}${index}`;
        canonicalUrl = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
      }
    } else {
      // Check if it's a known non-problem URL to give helpful feedback
      if (/leetcode\.(com|cn)\/(u|profile|tag|explore)/i.test(trimmedUrl)) {
        return new Response(
          JSON.stringify({
            error: "This looks like a LeetCode profile, tag, or explore link. Please provide a direct problem link: https://leetcode.com/problems/{problem-name}/"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (/codeforces\.com\/(profile|ratings|contests|gym)/i.test(trimmedUrl)) {
        return new Response(
          JSON.stringify({
            error: "This looks like a Codeforces user or contest homepage link. Please provide a direct problem link: https://codeforces.com/problemset/problem/{id}/{index}"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (/geeksforgeeks\.org\/(user|explore|articles)/i.test(trimmedUrl)) {
        return new Response(
          JSON.stringify({
            error: "This looks like a GeeksforGeeks user profile or article link. Please provide a problem link: https://www.geeksforgeeks.org/problems/{slug}"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Invalid problem URL. Supported platforms: LeetCode (leetcode.com/problems/...), GeeksforGeeks (geeksforgeeks.org/problems/...), Codeforces (codeforces.com/problemset/problem/...)."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default title from slug as clean fallback
    let title = slugOrId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    let difficulty: 'easy' | 'medium' | 'hard' | undefined = undefined;
    let verified = false;

    // Fetch with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const fetchHeaders: HeadersInit = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      };

      const response = await fetch(canonicalUrl, {
        headers: fetchHeaders,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        verified = true;
        const html = await response.text();

        // 1. Title extraction from <title> or OG title
        const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
        const titleTagMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const rawTitle = ogTitleMatch?.[1] || titleTagMatch?.[1] || "";

        if (rawTitle) {
          // Clean platform suffix like " - LeetCode", " | Practice | GeeksforGeeks", " - Codeforces"
          let cleanedTitle = rawTitle
            .replace(/\s*-\s*LeetCode.*$/i, "")
            .replace(/\s*\|\s*Practice\s*\|\s*GeeksforGeeks.*$/i, "")
            .replace(/\s*-\s*GeeksforGeeks.*$/i, "")
            .replace(/\s*-\s*Codeforces.*$/i, "")
            .replace(/^Problem\s*-\s*[A-Z0-9]+\s*-\s*Codeforces\s*-\s*/i, "")
            .trim();

          if (cleanedTitle.length > 0) {
            title = cleanedTitle;
          }
        }

        // 2. Difficulty extraction
        const lowerHtml = html.toLowerCase();
        if (platform === "leetcode") {
          if (lowerHtml.includes('"difficulty":"easy"') || lowerHtml.includes('difficulty: "easy"') || lowerHtml.includes('text-difficulty-easy')) {
            difficulty = "easy";
          } else if (lowerHtml.includes('"difficulty":"medium"') || lowerHtml.includes('difficulty: "medium"') || lowerHtml.includes('text-difficulty-medium')) {
            difficulty = "medium";
          } else if (lowerHtml.includes('"difficulty":"hard"') || lowerHtml.includes('difficulty: "hard"') || lowerHtml.includes('text-difficulty-hard')) {
            difficulty = "hard";
          }
        } else if (platform === "gfg") {
          if (lowerHtml.includes('problem-difficulty">easy') || lowerHtml.includes('"difficulty":"easy"')) {
            difficulty = "easy";
          } else if (lowerHtml.includes('problem-difficulty">medium') || lowerHtml.includes('"difficulty":"medium"')) {
            difficulty = "medium";
          } else if (lowerHtml.includes('problem-difficulty">hard') || lowerHtml.includes('"difficulty":"hard"')) {
            difficulty = "hard";
          }
        } else if (platform === "codeforces") {
          // Check for rating tags in Codeforces HTML e.g. "*800", "*1500", "*2000"
          const ratingMatch = html.match(/title=["']Difficulty["'][^>]*>\s*\*(\d+)/i) || html.match(/\*(\d{3,4})/);
          if (ratingMatch) {
            const rating = parseInt(ratingMatch[1], 10);
            if (rating < 1300) difficulty = "easy";
            else if (rating < 1900) difficulty = "medium";
            else difficulty = "hard";
          }
        }
      } else {
        verified = false;
      }
    } catch (_err) {
      // Timeout or network error: return verified: false without failing request
      verified = false;
    } finally {
      clearTimeout(timeoutId);
    }

    const result: VerifyResponse = {
      platform,
      verified,
      title: title || "DSA Problem",
      difficulty,
      canonicalUrl,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
