/**
 * Standalone Import Job: LeetCode Catalog
 * Hits LeetCode public all-problems API + paginated GraphQL for topic tags & problem numbers.
 * Maps ~4,000+ problems with difficulty, problem number (#1, #42…), and topic tags.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GraphQL query now requests questionFrontendId so we get the display number (#1, #42, …)
const GRAPHQL_QUERY = `
query q($limit: Int, $skip: Int) {
  problemsetQuestionList: questionList(categorySlug: "", limit: $limit, skip: $skip, filters: {}) {
    total: totalNum
    questions: data {
      questionFrontendId
      titleSlug
      title
      difficulty
      topicTags { name }
    }
  }
}
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchLeetCodeProblems(options = {}) {
  const maxGraphQLPages = options.maxGraphQLPages || 60; // 60 * 100 = 6000 max
  console.log('Step 1/2  Fetching LeetCode public problem list...');

  const res = await fetch('https://leetcode.com/api/problems/all/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}: ${res.statusText}`);

  const data = await res.json();
  const pairs = data.stat_status_pairs || [];
  console.log(`  → Received ${pairs.length} problems from public API.`);

  // Build initial map keyed by slug, capturing question_id for ordering
  const catalogMap = new Map();
  for (const item of pairs) {
    const stat = item.stat;
    const diff = item.difficulty;
    if (!stat || !stat.question__title_slug) continue;

    const slug = stat.question__title_slug;
    const questionId = stat.question_id;           // numeric DB id
    const frontendId = stat.frontend_question_id;  // display number shown on LeetCode
    const level = diff?.level;
    let difficulty = 'medium';
    if (level === 1) difficulty = 'easy';
    else if (level === 2) difficulty = 'medium';
    else if (level === 3) difficulty = 'hard';

    catalogMap.set(slug, {
      id: `lc-${slug}`,
      platform: 'leetcode',
      external_id: slug,
      problem_number: frontendId ? `#${frontendId}` : null,
      _frontend_id: frontendId || questionId || 0, // used for sorting
      title: stat.question__title || slug,
      difficulty,
      rating: null,
      tags: [],
      url: `https://leetcode.com/problems/${slug}/`,
      is_paid_only: Boolean(item.paid_only)
    });
  }

  // Step 2: Fetch topic tags + confirm problem numbers via paginated GraphQL
  console.log('Step 2/2  Fetching topic tags + problem numbers via GraphQL (100/batch)...');
  let skip = 0;
  const limit = 100;
  let totalQuestions = 0;
  let page = 0;

  try {
    while (page < maxGraphQLPages) {
      page++;
      const gqlRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: JSON.stringify({
          query: GRAPHQL_QUERY,
          variables: { limit, skip }
        })
      });

      if (!gqlRes.ok) {
        console.warn(`  GraphQL page ${page} returned status ${gqlRes.status}. Stopping tag enrichment.`);
        break;
      }

      const gqlData = await gqlRes.json();
      const qList = gqlData.data?.problemsetQuestionList;
      if (!qList || !Array.isArray(qList.questions) || qList.questions.length === 0) break;

      totalQuestions = qList.total || totalQuestions;

      for (const q of qList.questions) {
        const slug = q.titleSlug;
        const tags = Array.isArray(q.topicTags) ? q.topicTags.map((t) => t.name) : [];
        const frontendId = q.questionFrontendId;
        const problemNumber = frontendId ? `#${frontendId}` : null;

        if (catalogMap.has(slug)) {
          const entry = catalogMap.get(slug);
          entry.tags = tags;
          if (q.title) entry.title = q.title;
          if (problemNumber) {
            entry.problem_number = problemNumber;
            entry._frontend_id = parseInt(frontendId, 10) || entry._frontend_id;
          }
        } else {
          // Problem exists in GraphQL but not public API (e.g. premium problems)
          catalogMap.set(slug, {
            id: `lc-${slug}`,
            platform: 'leetcode',
            external_id: slug,
            problem_number: problemNumber,
            _frontend_id: parseInt(frontendId, 10) || 99999,
            title: q.title,
            difficulty: q.difficulty?.toLowerCase() || 'medium',
            rating: null,
            tags,
            url: `https://leetcode.com/problems/${slug}/`,
            is_paid_only: false
          });
        }
      }

      skip += limit;
      console.log(`  → Enriched ${Math.min(skip, totalQuestions)} / ${totalQuestions || '?'} problems`);
      if (skip >= totalQuestions) break;

      // Respectful 200ms delay between batch requests
      await delay(200);
    }
  } catch (err) {
    console.warn('  GraphQL batch fetch error (continuing with partial tags):', err.message);
  }

  // Sort by frontend problem number so the list goes #1, #2, #3…
  const catalogProblems = Array.from(catalogMap.values())
    .sort((a, b) => (a._frontend_id || 99999) - (b._frontend_id || 99999))
    .map(({ _frontend_id, ...rest }) => rest); // remove internal sort key

  console.log(`Done! Mapped ${catalogProblems.length} LeetCode problems.\n`);
  return catalogProblems;
}

if (process.argv[1] === __filename) {
  fetchLeetCodeProblems()
    .then((problems) => {
      const outDir = path.join(__dirname, '../public/data');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, 'leetcode-catalog.json');
      fs.writeFileSync(outPath, JSON.stringify(problems));
      const sampleNum = problems.slice(0, 5).map(p => `${p.problem_number} ${p.title}`).join(', ');
      console.log(`Saved ${problems.length} LeetCode problems → ${outPath}`);
      console.log(`Sample: ${sampleNum}`);
    })
    .catch((err) => { console.error('LeetCode import error:', err); process.exit(1); });
}
