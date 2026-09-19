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
    <div className="bg-[#FFFFFF] border border-[#E5E4E0] rounded-[10px] p-5 flex flex-col justify-between shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[14px] font-medium text-[#1C1C1E]">
            Pattern Mastery
          </h3>
          <p className="text-[13px] text-[#6E6E73] mt-0.5">
            Average SM-2 ease factor per algorithmic pattern
          </p>
        </div>
      </div>

      {data.length < 3 ? (
        <div className="h-44 flex items-center justify-center text-[13px] text-[#8E8E93] text-center px-4">
          Log problems across 3+ patterns (DP, Graph, Trees, etc.) to visualize your pattern radar.
        </div>
      ) : (
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#E5E4E0" strokeOpacity={0.8} />
              <PolarAngleAxis
                dataKey="pattern"
                tick={{ fill: '#6E6E73', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[1.3, 3.5]}
                stroke="#E5E4E0"
                tick={{ fill: '#8E8E93', fontSize: 10 }}
              />
              <Radar
                name="Ease factor"
                dataKey="ease"
                stroke="#2D5A6B"
                fill="#2D5A6B"
                fillOpacity={0.15}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E4E0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#1C1C1E',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                }}
                formatter={(value: any) => [`${value} (Average ease)`, 'Mastery']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
