import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Problem } from '../../types';

interface PlatformDonutChartProps {
  problems: Problem[];
}

const PLATFORM_CONFIG = {
  leetcode: { name: 'LeetCode', color: '#C4923A' },
  gfg: { name: 'GeeksforGeeks', color: '#5A9367' },
  codeforces: { name: 'Codeforces', color: '#2D5A6B' },
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
    <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-medium text-[#1C1C1E]">
          Platform Distribution
        </h3>
        <span className="text-[13px] text-[#6E6E73]">{total} total</span>
      </div>

      {total === 0 ? (
        <div className="h-44 flex items-center justify-center text-[13px] text-[#8E8E93] text-center px-4">
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
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E4E0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#1C1C1E',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  }}
                  itemStyle={{ color: '#1C1C1E' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[20px] font-semibold text-[#1C1C1E]">{total}</span>
              <span className="text-[11px] text-[#8E8E93]">Problems</span>
            </div>
          </div>

          <div className="w-full sm:w-1/2 space-y-2 text-[13px]">
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#1C1C1E] font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C1C1E]">{item.value}</span>
                    <span className="text-[#8E8E93] text-[12px]">({pct}%)</span>
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
