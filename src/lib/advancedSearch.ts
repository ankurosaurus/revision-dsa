import { Problem } from '../types';

export function filterProblemsByTagAndDifficulty(
  problems: Problem[],
  tag?: string | null,
  difficulty?: string | null
): Problem[] {
  return problems.filter((p) => {
    if (tag && !p.tags.includes(tag)) return false;
    if (difficulty && difficulty !== 'all' && p.difficulty !== difficulty) return false;
    return true;
  });
}
