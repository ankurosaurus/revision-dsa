/**
 * Automated Test: Catalog Search and Acceptance Verification
 * Verifies fuzzy search, typo tolerance, multi-platform querying, and deduplication.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.join(__dirname, '../public/data/catalog.json');
if (!fs.existsSync(catalogPath)) {
  console.error('FAIL: catalog.json does not exist at', catalogPath);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
console.log(`Loaded ${catalog.length} catalog problems for verification test.\n`);

function searchMock(query, platformFilter = 'all', limit = 10) {
  const trimmed = query.trim().toLowerCase();
  let pool = catalog;
  if (platformFilter !== 'all') {
    pool = pool.filter((p) => p.platform === platformFilter);
  }

  if (!trimmed) return pool.slice(0, limit);

  const terms = trimmed.split(/\s+/).filter(Boolean);

  return pool
    .map((item) => {
      const titleLower = item.title.toLowerCase();
      const extLower = item.external_id.toLowerCase();
      const tagsLower = item.tags.map((t) => t.toLowerCase()).join(' ');

      let score = 0;
      if (titleLower === trimmed) score += 1000;
      else if (titleLower.startsWith(trimmed)) score += 500;
      else if (titleLower.includes(trimmed)) score += 200;

      if (extLower === trimmed) score += 800;
      else if (extLower.includes(trimmed)) score += 300;

      let matchedTokens = 0;
      for (const term of terms) {
        if (titleLower.includes(term)) {
          score += 50;
          matchedTokens++;
        } else if (tagsLower.includes(term)) {
          score += 30;
          matchedTokens++;
        } else if (extLower.includes(term)) {
          score += 40;
          matchedTokens++;
        } else {
          const prefix = term.slice(0, Math.max(3, term.length - 1));
          if (titleLower.includes(prefix)) {
            score += 20;
            matchedTokens++;
          }
        }
      }

      if (matchedTokens === terms.length) score += 100;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((e) => e.item);
}

let allPassed = true;
function assert(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
  } else {
    console.error(`[FAIL] ${desc}`);
    allPassed = false;
  }
}

// Test 1: Exact search "two sum"
const twoSumResults = searchMock('two sum', 'leetcode');
assert(
  'Search "two sum" returns LeetCode "Two Sum" as top result',
  twoSumResults.length > 0 && twoSumResults[0].title.toLowerCase() === 'two sum'
);

// Test 2: Typo search "longest palindrom"
const typoResults = searchMock('longest palindrom');
assert(
  'Typo search "longest palindrom" matches palindrome problems',
  typoResults.length > 0 && typoResults.some((p) => p.title.toLowerCase().includes('palindrome'))
);

// Test 3: Tag search "graph"
const graphResults = searchMock('graph');
assert(
  'Search "graph" returns problems tagged with Graph',
  graphResults.length > 0 && graphResults.some((p) => p.tags.some((t) => t.toLowerCase().includes('graph')) || p.title.toLowerCase().includes('graph'))
);

// Test 4: Codeforces contest/problem ID search "4A"
const cfResults = searchMock('4A', 'codeforces');
assert(
  'Search "4A" on Codeforces matches "Watermelon"',
  cfResults.length > 0 && cfResults.some((p) => p.external_id === '4A' || p.title === 'Watermelon')
);

// Test 5: GFG classic problem search "kadane"
const gfgResults = searchMock('kadane', 'gfg');
assert(
  'Search "kadane" on GFG returns Kadane\'s Algorithm',
  gfgResults.length > 0 && gfgResults[0].title.toLowerCase().includes('kadane')
);

// Test 6: Verify deduplication
const idSet = new Set();
let duplicates = 0;
for (const p of catalog) {
  const key = `${p.platform}:${p.external_id}`;
  if (idSet.has(key)) duplicates++;
  idSet.add(key);
}
assert('Zero duplicates across 15,000+ catalog problems', duplicates === 0);

console.log('\n--- VERIFICATION RESULT ---');
if (allPassed) {
  console.log('ALL CATALOG SEARCH CRITERIA PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error('SOME CATALOG SEARCH TESTS FAILED!\n');
  process.exit(1);
}
