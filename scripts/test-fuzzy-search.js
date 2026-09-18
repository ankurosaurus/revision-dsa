import { fuzzySearch } from '../src/lib/fuzzySearch.ts';

const items = [
  { id: '1', title: 'Two Sum', tags: ['array', 'hash-table'] },
  { id: '2', title: '3Sum', tags: ['array', 'two-pointers'] },
  { id: '3', title: 'Binary Tree Inorder Traversal', tags: ['tree', 'dfs'] },
];

const results = fuzzySearch(items, 'two', (item) => [item.title, ...item.tags]);
console.assert(results.length >= 2, 'Fuzzy search should find at least 2 items for "two"');
console.log('✓ Fuzzy search token matching verified.');
