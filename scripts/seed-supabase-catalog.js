/**
 * Seed Supabase Problem Catalog
 * Uploads all 15,476 problems from public/data/catalog.json into Supabase `problem_catalog` table.
 *
 * Usage:
 *   node scripts/seed-supabase-catalog.js
 *
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env or .env.local
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables manually
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  const env = {};
  for (const file of envFiles) {
    const p = resolve(rootDir, file);
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim();
            if (!env[k]) env[k] = v;
          }
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
  console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  console.error('Add your Supabase credentials to .env or .env.local first.');
  process.exit(1);
}

const catalogPath = resolve(rootDir, 'public', 'data', 'catalog.json');
if (!existsSync(catalogPath)) {
  console.error('Error: catalog.json not found at', catalogPath);
  process.exit(1);
}

console.log('Loading catalog.json...');
const raw = readFileSync(catalogPath, 'utf-8');
const catalog = JSON.parse(raw);
console.log(`Loaded ${catalog.length} problems from local catalog.`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const BATCH_SIZE = 250;

async function run() {
  console.log(`Starting upload to Supabase: ${supabaseUrl}`);
  console.log(`Batch size: ${BATCH_SIZE} items`);

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    const chunk = catalog.slice(i, i + BATCH_SIZE).map((p) => ({
      platform: p.platform,
      external_id: p.external_id,
      title: p.title,
      difficulty: p.difficulty || 'medium',
      rating: p.rating || null,
      tags: p.tags || [],
      url: p.url,
      is_paid_only: Boolean(p.is_paid_only),
    }));

    const { error } = await supabase
      .from('problem_catalog')
      .upsert(chunk, { onConflict: 'platform,external_id' });

    if (error) {
      console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message);
      failed += chunk.length;
    } else {
      uploaded += chunk.length;
      process.stdout.write(`\rProgress: ${uploaded}/${catalog.length} (${Math.round((uploaded / catalog.length) * 100)}%)`);
    }
  }

  console.log('\n\n--- Seeding Complete ---');
  console.log(`Successfully uploaded: ${uploaded}`);
  if (failed > 0) console.log(`Failed items: ${failed}`);
}

run().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
