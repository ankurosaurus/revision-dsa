import { calculateSM2 } from '../src/lib/spacedRepetition.ts';

const problem = {
  id: 'test-1',
  title: 'Two Sum',
  url: 'https://leetcode.com/problems/two-sum',
  platform: 'leetcode',
  ease_factor: 1.3,
  interval_days: 10,
  repetitions: 3,
  next_review_date: '2026-09-18',
  created_at: '2026-09-01',
  tags: [],
};

// Test 1: Ease factor should never drop below 1.3
const lapsed = calculateSM2(problem, 'again');
console.assert(lapsed.ease_factor >= 1.3, 'Ease factor below 1.3 minimum floor!');
console.assert(lapsed.repetitions === 0, 'Lapsed problem repetitions should reset to 0');
console.log('✓ SM-2 minimum ease floor tested successfully.');
