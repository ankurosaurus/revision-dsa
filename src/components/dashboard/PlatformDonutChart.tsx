import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Problem } from '../../types';

interface PlatformDonutChartProps {
  problems: Problem[];
}

const PLATFORM_CONFIG = {
  leetcode: { name: 'LeetCode', color: '#F59E0B' },
  gfg: { name: 'GeeksforGeeks', color: '#10B981' },
  codeforces: { name: 'Codeforces', color: '#3B82F6' },
};

export const PlatformDonutChart: React.FC<PlatformDonutChartProps> = ({ problems }) => {
  const counts = problems.reduce(
    (acc, p) => {
      acc[p.platform] = (acc[p.platform] || 0) + 1;
      return acc;
    },
    { leetcode: 0, gfg: 0, codeforces: 0 } as Record<string, number>
  );

  const data = [
    { name: 'LeetCode', value: counts.leetcode, color: PLATFORM_CONFIG.leetcode.color },
    { name: 'GeeksforGeeks', value: counts.gfg, color: PLATFORM_CONFIG.gfg.color },
    { name: 'Codeforces', value: counts.codeforces, color: PLATFORM_CONFIG.codeforces.color },
  ].filter((d) => d.value > 0);

  const total = problems.length;

  return (
    <div className="saas-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Platform Distribution
        </h3>
        <span className="text-xs text-neutral-500 dark:text-dark-textMuted">{total} total</span>
      </div>

      {total === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 text-center px-4">
          No problems added yet. Log LeetCode, GFG, or Codeforces problems to view breakdown.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F9FAFB',
                  }}
                  itemStyle={{ color: '#F9FAFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{total}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Problems</span>
            </div>
          </div>

          <div className="w-full sm:w-1/2 space-y-2 text-xs">
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">{item.value}</span>
                    <span className="text-neutral-400 text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
