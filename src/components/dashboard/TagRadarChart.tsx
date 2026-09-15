import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Problem } from '../../types';

interface TagRadarChartProps {
  problems: Problem[];
}

export const TagRadarChart: React.FC<TagRadarChartProps> = ({ problems }) => {
  const data = useMemo(() => {
    const tagMap = new Map<string, { totalEase: number; count: number }>();

    for (const p of problems) {
      for (const tag of p.tags) {
        const curr = tagMap.get(tag) || { totalEase: 0, count: 0 };
        curr.totalEase += p.ease_factor;
        curr.count += 1;
        tagMap.set(tag, curr);
      }
    }

    const sorted = Array.from(tagMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6);

    return sorted.map(([tag, stat]) => {
      const avgEase = Math.round((stat.totalEase / stat.count) * 100) / 100;
      return {
        pattern: tag,
        ease: avgEase,
        count: stat.count,
        fullMark: 3.5,
      };
    });
  }, [problems]);

  return (
    <div className="saas-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Pattern Mastery
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-dark-textMuted mt-0.5">
            Average SM-2 ease factor per algorithmic pattern
          </p>
        </div>
      </div>

      {data.length < 3 ? (
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400 dark:text-neutral-500 text-center px-4">
          Log problems across 3+ patterns (DP, Graph, Trees, etc.) to visualize your mastery radar.
        </div>
      ) : (
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#E5E7EB" strokeOpacity={0.6} />
              <PolarAngleAxis
                dataKey="pattern"
                tick={{ fill: '#6B7280', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[1.3, 3.5]}
                stroke="#E5E7EB"
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
              />
              <Radar
                name="Ease Factor"
                dataKey="ease"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F9FAFB',
                }}
                formatter={(value: any) => [`${value} (Avg Ease)`, 'Mastery']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
