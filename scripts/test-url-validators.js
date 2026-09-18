import { detectAndValidateUrl } from '../src/lib/urlValidators.ts';

const cases = [
  { url: 'https://leetcode.com/problems/two-sum/', expected: 'leetcode' },
  { url: 'https://leetcode.com/problems/trapping-rain-water/description/', expected: 'leetcode' },
  { url: 'https://codeforces.com/problemset/problem/4/A', expected: 'codeforces' },
  { url: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm/0', expected: 'gfg' },
];

let passed = 0;
for (const c of cases) {
  const res = detectAndValidateUrl(c.url);
  if (res.platform === c.expected && res.isValid) {
    console.log(`✓ ${c.url} -> ${res.platform}`);
    passed++;
  } else {
    console.error(`✗ Failed for ${c.url}`);
  }
}

console.log(`URL Validator tests: ${passed}/${cases.length} passed.`);
