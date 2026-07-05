'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';

interface StatusDistProps {
  leads: Lead[];
}

const COLORS = [
  '#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444',
  '#06B6D4','#F97316','#14B8A6','#EC4899','#6366F1',
  '#A855F7','#84CC16','#0EA5E9','#D946EF','#64748B',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-xl px-3 py-2 text-[12px] shadow-lg"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <div className="font-semibold">{name}</div>
      <div style={{ color: 'var(--text-secondary)' }}>{value} leads</div>
    </div>
  );
};

export function StatusDist({ leads }: StatusDistProps) {
  const chartData = useMemo(() => {
    const dist = Calc.statusDistribution(leads);
    return dist
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((d, i) => ({
        name: d.status,
        value: d.count,
        color: CFG.statusColors?.[d.status] ?? COLORS[i % COLORS.length],
      }));
  }, [leads]);

  const total = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData]);
  const active = useMemo(() => Calc.activeLeads(leads), [leads]);

  return (
    <div className="ia-card p-6 flex flex-col sm:flex-row items-center gap-6"
         style={{ background: 'var(--bg-card)' }}>

      {/* Donut */}
      <div className="relative flex-shrink-0 w-44 h-44">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={54} outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="font-mono font-bold text-white" style={{ fontSize: 26 }}>
                {active.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}>
                Active
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs"
               style={{ color: 'var(--text-muted)' }}>
            No data
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex-1 w-full max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
        {chartData.map((d, i) => {
          const pct = total ? ((d.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={i} className="flex items-center justify-between gap-3 py-1 rounded-lg
                                    px-2 hover:bg-white/[0.025] transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {d.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {pct}%
                </span>
                <span className="font-mono text-[12px] font-semibold text-white">
                  {d.value}
                </span>
              </div>
            </div>
          );
        })}
        {chartData.length === 0 && (
          <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No matching records
          </p>
        )}
      </div>
    </div>
  );
}
