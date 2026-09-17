/**
 * Standalone Import Job: GeeksforGeeks Problemset (Best Effort & Curated Seed)
 * GFG does not have a public bulk listing API and protects sitemaps with Cloudflare 403.
 * Seeds top classic SDE problems and provides organic catalog addition hooks.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CURATED_GFG_PROBLEMS = [
  {
    external_id: 'kadanes-algorithm-1587115620',
    title: "Kadane's Algorithm",
    difficulty: 'medium',
    tags: ['Arrays', 'Dynamic Programming'],
    url: 'https://practice.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1'
  },
  {
    external_id: 'detect-cycle-in-a-directed-graph',
    title: 'Detect Cycle in a Directed Graph',
    difficulty: 'medium',
    tags: ['Graph', 'DFS', 'BFS'],
    url: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1'
  },
  {
    external_id: 'detect-cycle-in-an-undirected-graph',
    title: 'Detect Cycle in an Undirected Graph',
    difficulty: 'medium',
    tags: ['Graph', 'BFS', 'DFS', 'Disjoint Set'],
    url: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1'
  },
  {
    external_id: 'subarray-with-given-sum-1587115621',
    title: 'Subarray with Given Sum',
    difficulty: 'medium',
    tags: ['Arrays', 'Sliding Window', 'Two Pointers'],
    url: 'https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1'
  },
  {
    external_id: 'reverse-a-linked-list',
    title: 'Reverse a Linked List',
    difficulty: 'easy',
    tags: ['Linked List'],
    url: 'https://www.geeksforgeeks.org/problems/reverse-a-linked-list/1'
  },
  {
    external_id: 'word-boggle4143',
    title: 'Word Boggle',
    difficulty: 'medium',
    tags: ['Backtracking', 'DFS', 'Trie', 'Matrix'],
    url: 'https://www.geeksforgeeks.org/problems/word-boggle4143/1'
  },
  {
    external_id: 'minimum-platforms-1587115620',
    title: 'Minimum Platforms',
    difficulty: 'medium',
    tags: ['Greedy', 'Sorting', 'Arrays'],
    url: 'https://www.geeksforgeeks.org/problems/minimum-platforms-1587115620/1'
  },
  {
    external_id: 'inversion-of-array-1587115620',
    title: 'Count Inversions',
    difficulty: 'medium',
    tags: ['Arrays', 'Divide and Conquer', 'Merge Sort'],
    url: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1'
  },
  {
    external_id: 'parenthesis-checker2744',
    title: 'Parenthesis Checker',
    difficulty: 'easy',
    tags: ['Stack', 'Strings'],
    url: 'https://www.geeksforgeeks.org/problems/parenthesis-checker2744/1'
  },
  {
    external_id: 'kth-smallest-element5635',
    title: 'Kth Smallest Element',
    difficulty: 'medium',
    tags: ['Heap', 'Sorting', 'QuickSelect'],
    url: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1'
  },
  {
    external_id: 'topological-sort',
    title: 'Topological Sort',
    difficulty: 'medium',
    tags: ['Graph', 'DFS', 'BFS', 'Kahn Algorithm'],
    url: 'https://www.geeksforgeeks.org/problems/topological-sort/1'
  },
  {
    external_id: 'rat-in-a-maze-problem',
    title: 'Rat in a Maze Problem - I',
    difficulty: 'medium',
    tags: ['Backtracking', 'Recursion', 'DFS'],
    url: 'https://www.geeksforgeeks.org/problems/rat-in-a-maze-problem/1'
  },
  {
    external_id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'hard',
    tags: ['Design', 'Hash Table', 'Doubly Linked List'],
    url: 'https://www.geeksforgeeks.org/problems/lru-cache/1'
  },
  {
    external_id: 'longest-common-subsequence-1587115620',
    title: 'Longest Common Subsequence',
    difficulty: 'medium',
    tags: ['Dynamic Programming', 'Strings'],
    url: 'https://www.geeksforgeeks.org/problems/longest-common-subsequence-1587115620/1'
  },
  {
    external_id: '0-1-knapsack-problem0945',
    title: '0 - 1 Knapsack Problem',
    difficulty: 'medium',
    tags: ['Dynamic Programming'],
    url: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1'
  },
  {
    external_id: 'egg-dropping-puzzle-1587115620',
    title: 'Egg Dropping Puzzle',
    difficulty: 'hard',
    tags: ['Dynamic Programming', 'Binary Search'],
    url: 'https://www.geeksforgeeks.org/problems/egg-dropping-puzzle-1587115620/1'
  },
  {
    external_id: 'edit-distance3702',
    title: 'Edit Distance',
    difficulty: 'hard',
    tags: ['Dynamic Programming', 'Strings'],
    url: 'https://www.geeksforgeeks.org/problems/edit-distance3702/1'
  },
  {
    external_id: 'alien-dictionary',
    title: 'Alien Dictionary',
    difficulty: 'hard',
    tags: ['Graph', 'Topological Sort'],
    url: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1'
  },
  {
    external_id: 'trapping-rain-water-1587115621',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    tags: ['Arrays', 'Two Pointers', 'Stack'],
    url: 'https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1'
  },
  {
    external_id: 'diameter-of-binary-tree',
    title: 'Diameter of a Binary Tree',
    difficulty: 'medium',
    tags: ['Tree', 'Binary Tree', 'DFS'],
    url: 'https://www.geeksforgeeks.org/problems/diameter-of-binary-tree/1'
  }
];

export async function fetchGfgProblems() {
  console.log('Initiating GeeksforGeeks catalog harvest...');
  console.warn('NOTE: GeeksforGeeks has no official public bulk API. Initial catalog seeds top interview problems and grows organically as users log problems.');

  // Try fetching sitemap gracefully
  try {
    const sitemapRes = await fetch('https://www.geeksforgeeks.org/sitemap_practice.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (sitemapRes.status === 403) {
      console.log('GFG XML sitemap returned HTTP 403 (expected Cloudflare anti-bot protection). Proceeding with curated foundation & organic expansion.');
    }
  } catch (err) {
    console.log('GFG sitemap fetch skipped:', err.message);
  }

  const catalogProblems = CURATED_GFG_PROBLEMS.map((item) => ({
    id: `gfg-${item.external_id}`,
    platform: 'gfg',
    external_id: item.external_id,
    title: item.title,
    difficulty: item.difficulty,
    rating: null,
    tags: item.tags,
    url: item.url,
    is_paid_only: false
  }));

  console.log(`Mapped ${catalogProblems.length} GeeksforGeeks foundation problems.`);
  return catalogProblems;
}

if (process.argv[1] === __filename) {
  fetchGfgProblems()
    .then((problems) => {
      const outDir = path.join(__dirname, '../public/data');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      const outPath = path.join(outDir, 'gfg-catalog.json');
      fs.writeFileSync(outPath, JSON.stringify(problems, null, 2));
      console.log(`Saved ${problems.length} GeeksforGeeks problems to ${outPath}`);
    })
    .catch((err) => {
      console.error('Error importing GFG catalog:', err);
      process.exit(1);
    });
}
