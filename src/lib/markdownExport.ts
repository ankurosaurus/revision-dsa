import { Problem } from '../types';

export function exportProblemsToMarkdown(problems: Problem[]): string {
  const lines: string[] = [];
  lines.push('# RevisionDSA — Revision Summary');
  lines.push(`Exported: ${new Date().toLocaleDateString()} | Total: ${problems.length} problems\n`);

  lines.push('| Problem | Platform | Difficulty | Repetitions | Next Review | Tags |');
  lines.push('|---|---|---|---|---|---|');

  for (const p of problems) {
    const title = `[${p.title}](${p.url})`;
    const tags = p.tags.join(', ') || '-';
    lines.push(`| ${title} | ${p.platform} | ${p.difficulty || 'medium'} | ${p.repetitions} | ${p.next_review_date} | ${tags} |`);
  }

  return lines.join('\n');
}
