/**
 * Master Catalog Importer
 * Combines LeetCode, Codeforces, and GeeksforGeeks into a unified catalog.
 * Outputs to public/data/catalog.json and optionally syncs to Supabase problem_catalog.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchCodeforcesProblems } from './import-codeforces.js';
import { fetchLeetCodeProblems } from './import-leetcode.js';
import { fetchGfgProblems } from './import-gfg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMasterImport() {
  console.log('=== STARTING BULK PROBLEM CATALOG IMPORT ===');

  const outDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let codeforcesProblems = [];
  let leetcodeProblems = [];
  let gfgProblems = [];

  // Check if cached json exists to save time or fetch fresh
  const cfCache = path.join(outDir, 'codeforces-catalog.json');
  if (fs.existsSync(cfCache)) {
    console.log('Loading existing Codeforces cache...');
    codeforcesProblems = JSON.parse(fs.readFileSync(cfCache, 'utf8'));
  } else {
    codeforcesProblems = await fetchCodeforcesProblems();
  }

  const lcCache = path.join(outDir, 'leetcode-catalog.json');
  if (fs.existsSync(lcCache)) {
    console.log('Loading existing LeetCode cache...');
    leetcodeProblems = JSON.parse(fs.readFileSync(lcCache, 'utf8'));
  } else {
    leetcodeProblems = await fetchLeetCodeProblems();
  }

  const gfgCache = path.join(outDir, 'gfg-catalog.json');
  if (fs.existsSync(gfgCache)) {
    console.log('Loading existing GFG cache...');
    gfgProblems = JSON.parse(fs.readFileSync(gfgCache, 'utf8'));
  } else {
    gfgProblems = await fetchGfgProblems();
  }

  // Combine and deduplicate
  const catalogMap = new Map();

  for (const item of [...codeforcesProblems, ...leetcodeProblems, ...gfgProblems]) {
    const key = `${item.platform}:${item.external_id}`;
    if (!catalogMap.has(key)) {
      catalogMap.set(key, item);
    }
  }

  const allProblems = Array.from(catalogMap.values());
  const stats = {
    total: allProblems.length,
    leetcode: allProblems.filter((p) => p.platform === 'leetcode').length,
    codeforces: allProblems.filter((p) => p.platform === 'codeforces').length,
    gfg: allProblems.filter((p) => p.platform === 'gfg').length,
    generated_at: new Date().toISOString()
  };

  console.log('\n--- CATALOG SUMMARY ---');
  console.log(`Total Problems: ${stats.total}`);
  console.log(`- LeetCode: ${stats.leetcode}`);
  console.log(`- Codeforces: ${stats.codeforces}`);
  console.log(`- GeeksforGeeks: ${stats.gfg}`);

  // Write master file
  const masterPath = path.join(outDir, 'catalog.json');
  fs.writeFileSync(masterPath, JSON.stringify(allProblems));
  console.log(`Master catalog written to ${masterPath} (${(fs.statSync(masterPath).size / 1024 / 1024).toFixed(2)} MB)`);

  const statsPath = path.join(outDir, 'catalog-stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  // Also write to src/data for bundling / direct offline imports if needed
  const srcDataDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(srcDataDir)) {
    fs.mkdirSync(srcDataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(srcDataDir, 'catalog-stats.json'), JSON.stringify(stats, null, 2));

  console.log('Catalog import successfully completed!\n');
  return { allProblems, stats };
}

if (process.argv[1] === __filename) {
  runMasterImport().catch((err) => {
    console.error('Fatal import error:', err);
    process.exit(1);
  });
}

export { runMasterImport };
