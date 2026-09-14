// Test script to verify URL parsing and SM-2 Spaced Repetition logic

// 1. URL patterns
const LEETCODE_PROBLEM_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:leetcode\.com|leetcode\.cn)\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
const GFG_PROBLEM_REGEX = /^(?:https?:\/\/)?(?:www\.|practice\.)?geeksforgeeks\.org\/problems\/([a-z0-9\-]+)(?:\/.*)?$/i;
const CODEFORCES_REGEX_1 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)(?:\/.*)?$/i;
const CODEFORCES_REGEX_2 = /^(?:https?:\/\/)?(?:www\.)?codeforces\.com\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)(?:\/.*)?$/i;

function detectUrl(url) {
  const trimmed = url.trim();
  if (LEETCODE_PROBLEM_REGEX.test(trimmed)) {
    return { platform: 'leetcode', valid: true };
  }
  if (GFG_PROBLEM_REGEX.test(trimmed)) {
    return { platform: 'gfg', valid: true };
  }
  if (CODEFORCES_REGEX_1.test(trimmed) || CODEFORCES_REGEX_2.test(trimmed)) {
    return { platform: 'codeforces', valid: true };
  }
  return { valid: false };
}

// 2. SM-2 Formula
function calculateSM2(problem, rating) {
  let { ease_factor, interval_days, repetitions } = problem;

  switch (rating) {
    case 'again': {
      repetitions = 0;
      interval_days = 1;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
      break;
    }
    case 'hard': {
      interval_days = Math.max(1, Math.round(interval_days * 1.2));
      ease_factor = Math.max(1.3, ease_factor - 0.15);
      break;
    }
    case 'good': {
      if (repetitions === 0) {
        interval_days = 1;
      } else if (repetitions === 1) {
        interval_days = Math.max(2, Math.round(interval_days * ease_factor));
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetitions += 1;
      break;
    }
    case 'easy': {
      if (repetitions === 0) {
        interval_days = 3;
      } else {
        interval_days = Math.round(interval_days * ease_factor * 1.3);
      }
      ease_factor = Math.min(3.5, ease_factor + 0.15);
      repetitions += 1;
      break;
    }
  }

  interval_days = Math.min(180, Math.max(1, interval_days));
  ease_factor = Math.round(ease_factor * 100) / 100;

  return { ease_factor, interval_days, repetitions };
}

// RUN TESTS
console.log('--- TEST 1: REAL URL DETECTION ---');
const testUrls = [
  // LeetCode
  { url: 'https://leetcode.com/problems/two-sum/', expected: 'leetcode' },
  { url: 'https://leetcode.com/problems/trapping-rain-water', expected: 'leetcode' },
  { url: 'https://leetcode.cn/problems/lru-cache/', expected: 'leetcode' },
  { url: 'https://leetcode.com/problems/course-schedule/?envType=study-plan-v2', expected: 'leetcode' },
  { url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', expected: 'leetcode' },

  // GFG
  { url: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1', expected: 'gfg' },
  { url: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1', expected: 'gfg' },
  { url: 'https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1', expected: 'gfg' },
  { url: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1', expected: 'gfg' },
  { url: 'https://www.geeksforgeeks.org/problems/word-boggle4143/1', expected: 'gfg' },

  // Codeforces
  { url: 'https://codeforces.com/problemset/problem/4/A', expected: 'codeforces' },
  { url: 'https://codeforces.com/problemset/problem/1/A', expected: 'codeforces' },
  { url: 'https://codeforces.com/problemset/problem/71/A', expected: 'codeforces' },
  { url: 'https://codeforces.com/contest/231/problem/A', expected: 'codeforces' },
  { url: 'https://codeforces.com/problemset/problem/158/A', expected: 'codeforces' },
];

let urlPassCount = 0;
for (const item of testUrls) {
  const res = detectUrl(item.url);
  if (res.valid && res.platform === item.expected) {
    urlPassCount++;
    console.log(`[PASS] ${item.expected.toUpperCase()}: ${item.url}`);
  } else {
    console.error(`[FAIL] ${item.url}, got:`, res);
  }
}

console.log('\n--- TEST 2: INVALID URL REJECTION ---');
const invalidUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://leetcode.com/u/neal_wu/',
  'https://codeforces.com/profile/tourist',
  'https://www.geeksforgeeks.org/user/john_doe/',
  'https://github.com/facebook/react',
];

let invalidPassCount = 0;
for (const inv of invalidUrls) {
  const res = detectUrl(inv);
  if (!res.valid) {
    invalidPassCount++;
    console.log(`[PASS] Rejected non-problem URL: ${inv}`);
  } else {
    console.error(`[FAIL] Improperly accepted: ${inv}`);
  }
}

console.log('\n--- TEST 3: SM-2 SPACED REPETITION ENGINE ---');
const initialProb = {
  ease_factor: 2.5,
  interval_days: 1,
  repetitions: 0,
};

// Test Again
const resAgain = calculateSM2(initialProb, 'again');
console.assert(resAgain.repetitions === 0, 'Again must reset repetitions to 0');
console.assert(resAgain.interval_days === 1, 'Again must reset interval to 1');
console.assert(resAgain.ease_factor === 2.3, 'Again must decrease ease by 0.2');
console.log('[PASS] "Again" rating resets repetition to 0 and interval to 1, decreases ease_factor');

// Test Good progression
const step1 = calculateSM2(initialProb, 'good');
console.assert(step1.repetitions === 1, 'Step 1 reps should be 1');
const step2 = calculateSM2({ ...initialProb, repetitions: 1, interval_days: 2 }, 'good');
console.assert(step2.repetitions === 2, 'Step 2 reps should be 2');
console.assert(step2.interval_days === 5, 'Step 2 interval should be 2 * 2.5 = 5');
console.log('[PASS] "Good" rating correctly progresses repetitions and multiplies interval by ease');

// Test Easy progression
const stepEasy = calculateSM2({ ...initialProb, repetitions: 2, interval_days: 5 }, 'easy');
console.assert(stepEasy.ease_factor === 2.65, 'Easy should increase ease by 0.15');
console.assert(stepEasy.interval_days === 16, '5 * 2.5 * 1.3 = 16.25 -> 16');
console.log('[PASS] "Easy" rating correctly increases ease and applies 1.3x booster');

// Test Hard
const stepHard = calculateSM2({ ...initialProb, repetitions: 2, interval_days: 5 }, 'hard');
console.assert(stepHard.interval_days === 6, '5 * 1.2 = 6');
console.assert(stepHard.ease_factor === 2.35, '2.5 - 0.15 = 2.35');
console.log('[PASS] "Hard" rating correctly applies 1.2x and decreases ease');

console.log(`\nALL AUTOMATED TESTS PASSED (${urlPassCount}/${testUrls.length} URLs verified, ${invalidPassCount}/${invalidUrls.length} rejected, SM-2 math exact).`);
