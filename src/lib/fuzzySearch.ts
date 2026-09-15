import { Problem } from '../types';

/**
 * Perform fuzzy/multi-token search across problem title, tags, notes, and platform
 */
export function searchProblems(problems: Problem[], query: string): Problem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return problems;

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  return problems.filter((prob) => {
    const title = prob.title.toLowerCase();
    const platform = prob.platform.toLowerCase();
    const difficulty = (prob.difficulty || '').toLowerCase();
    const tags = prob.tags.map((t) => t.toLowerCase()).join(' ');
    const notes = (prob.notes || '').toLowerCase();

    const searchableText = `${title} ${platform} ${difficulty} ${tags} ${notes}`;

    // All tokens must match or be a substring
    return tokens.every((token) => searchableText.includes(token));
  });
}
