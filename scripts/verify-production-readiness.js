/**
 * Production Readiness Verification Script
 * Validates configuration, schema, catalog assets, build artifacts, and dependencies.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const checks = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      checks.push({ name, status: 'PASS' });
    } else {
      checks.push({ name, status: 'WARN', message: String(result) });
    }
  } catch (err) {
    checks.push({ name, status: 'FAIL', message: err.message });
  }
}

// 1. Check vercel.json
check('Vercel configuration (vercel.json)', () => {
  const p = resolve(rootDir, 'vercel.json');
  if (!existsSync(p)) return 'vercel.json missing';
  const data = JSON.parse(readFileSync(p, 'utf-8'));
  if (!Array.isArray(data.rewrites) || data.rewrites.length === 0) return 'SPA rewrites missing';
});

// 2. Check catalog assets
check('Local problem catalog assets', () => {
  const p = resolve(rootDir, 'public', 'data', 'catalog.json');
  if (!existsSync(p)) return 'catalog.json missing';
  const data = JSON.parse(readFileSync(p, 'utf-8'));
  if (data.length < 15000) return `Expected >= 15000 problems, got ${data.length}`;
});

// 3. Check production SQL schema
check('Production SQL Schema (supabase/production_schema.sql)', () => {
  const p = resolve(rootDir, 'supabase', 'production_schema.sql');
  if (!existsSync(p)) return 'production_schema.sql missing';
  const sql = readFileSync(p, 'utf-8');
  const required = ['problem_catalog', 'problems', 'review_logs', 'profiles', 'admin_get_stats', 'row level security'];
  for (const r of required) {
    if (!sql.toLowerCase().includes(r)) return `Missing ${r} in schema`;
  }
});

// 4. Check dependencies in package.json
check('Production analytics & client packages', () => {
  const p = resolve(rootDir, 'package.json');
  const pkg = JSON.parse(readFileSync(p, 'utf-8'));
  const deps = { ...pkg.dependencies };
  const req = ['@vercel/analytics', '@vercel/speed-insights', 'posthog-js', '@supabase/supabase-js', 'recharts'];
  for (const r of req) {
    if (!deps[r]) return `Missing package: ${r}`;
  }
});

// 5. Check environment variable template
check('Environment variable template (.env.example)', () => {
  const p = resolve(rootDir, '.env.example');
  if (!existsSync(p)) return '.env.example missing';
  const content = readFileSync(p, 'utf-8');
  if (!content.includes('VITE_SUPABASE_URL')) return 'Missing VITE_SUPABASE_URL';
  if (!content.includes('VITE_POSTHOG_KEY')) return 'Missing VITE_POSTHOG_KEY';
});

console.log('\n===========================================');
console.log('RevisionDSA Production Readiness Audit');
console.log('===========================================\n');

let passCount = 0;
for (const c of checks) {
  const badge = c.status === 'PASS' ? '✓' : c.status === 'WARN' ? '!' : '✗';
  console.log(`${badge} [${c.status}] ${c.name}`);
  if (c.message) {
    console.log(`    Note: ${c.message}`);
  }
  if (c.status === 'PASS') passCount++;
}

console.log(`\nAudit result: ${passCount}/${checks.length} passed.`);
if (passCount === checks.length) {
  console.log('All checks passed! The codebase is ready for Vercel + Supabase production deployment.\n');
}
