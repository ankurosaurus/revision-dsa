/**
 * Standalone Import Job: Codeforces Problemset
 * Hits official Codeforces API (https://codeforces.com/api/problemset.problems)
 * Parses ~11,000+ problems with ratings, tags, and difficulty buckets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchCodeforcesProblems() {
  console.log('Fetching official Codeforces problemset...');
  const res = await fetch('https://codeforces.com/api/problemset.problems', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });

  if (!res.ok) {
    throw new Error(`Codeforces API returned status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  if (data.status !== 'OK' || !data.result || !Array.isArray(data.result.problems)) {
    throw new Error(`Unexpected Codeforces API response shape: ${JSON.stringify(data).slice(0, 100)}`);
  }

  const rawProblems = data.result.problems;
  console.log(`Fetched ${rawProblems.length} raw Codeforces problems.`);

  const catalogProblems = [];
  const seenIds = new Set();

  for (const prob of rawProblems) {
    if (!prob.contestId || !prob.index || !prob.name) continue;

    const externalId = `${prob.contestId}${prob.index}`;
    if (seenIds.has(externalId)) continue;
    seenIds.add(externalId);

    const rating = typeof prob.rating === 'number' ? prob.rating : null;
    let difficulty = null;
    if (rating !== null) {
      if (rating <= 1200) difficulty = 'easy';
      else if (rating <= 1900) difficulty = 'medium';
      else difficulty = 'hard';
    }

    const tags = Array.isArray(prob.tags) ? prob.tags : [];
    const url = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;

    catalogProblems.push({
      id: `cf-${externalId}`,
      platform: 'codeforces',
      external_id: externalId,
      problem_number: externalId,  // e.g. "4A", "1500B", "2264E2"
      title: prob.name.trim(),
      difficulty,
      rating,
      tags,
      url: `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`,
      is_paid_only: false
    });
  }

  console.log(`Successfully mapped ${catalogProblems.length} Codeforces problems.`);
  return catalogProblems;
}

// Allow direct execution
if (process.argv[1] === __filename) {
  fetchCodeforcesProblems()
    .then((problems) => {
      const outDir = path.join(__dirname, '../public/data');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const outPath = path.join(outDir, 'codeforces-catalog.json');
      fs.writeFileSync(outPath, JSON.stringify(problems, null, 2));
      console.log(`Saved ${problems.length} problems to ${outPath}`);
    })
    .catch((err) => {
      console.error('Error importing Codeforces catalog:', err);
      process.exit(1);
    });
}
