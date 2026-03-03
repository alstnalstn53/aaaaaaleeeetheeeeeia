'use client';

import { ResponsiveContainer, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import type { FiveAxisData } from '@/types/report';

interface RadarChartProps {
  data: FiveAxisData;
}

export function RadarChart({ data }: RadarChartProps) {
  const chartData = [
    { axis: 'Structure', value: data.structure },
    { axis: 'Completion', value: data.completion },
    { axis: 'Agency', value: data.agency },
    { axis: 'Sensory', value: data.sensory },
    { axis: 'Risk', value: data.risk },
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111111] p-6">
      <h3 className="mb-4 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
        5-Axis Profile
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: '#999999', fontSize: 11 }}
            />
            <Radar
              dataKey="value"
              stroke="rgba(255,255,255,0.4)"
              fill="rgba(255,255,255,0.08)"
              strokeWidth={1.5}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
