'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { CHART_PALETTE } from '@/lib/ui';
import { DonutTooltip } from '@/components/shared/ChartTooltip';
import { exploreLeads } from '@/lib/utils';

interface StatusDistProps {
  leads: Lead[];
  onExplore: (title: string, leads: Lead[]) => void;
}

export function StatusDist({ leads, onExplore }: StatusDistProps) {
  const chartData = useMemo(() => {
    const dist = Calc.statusDistribution(leads);
    return dist
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((d, i) => ({
        name:  d.status,
        value: d.count,
        color: CFG.statusColors[d.status] ?? CHART_PALETTE[i % CHART_PALETTE.length],
      }));
  }, [leads]);

  const total  = useMemo(() => chartData.reduce((s, d) => s + d.value, 0), [chartData]);
  const active = useMemo(() => Calc.activeLeads(leads), [leads]);

  const handleCellClick = (statusName: string) => {
    exploreLeads(onExplore, `${statusName} Status`, leads.filter(l => l.status === statusName));
  };

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
                  data={chartData} cx="50%" cy="50%"
                  innerRadius={54} outerRadius={72}
                  paddingAngle={2} dataKey="value" strokeWidth={0}
                >
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.color}
                      onClick={() => handleCellClick(d.name)}
                      className="cursor-pointer outline-none transition-all duration-200 hover:opacity-85"
                    />
                  ))}
                </Pie>
                <RTooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <button
              onClick={() => exploreLeads(onExplore, 'Active Leads', leads.filter(l => Calc._isActive(l)))}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer focus:outline-none group/centre"
            >
              <span className="font-mono font-bold text-white transition-colors group-hover/centre:text-blue-400" style={{ fontSize: 26 }}>
                {active.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest transition-colors group-hover/centre:text-blue-400"
                    style={{ color: 'var(--text-muted)' }}>
                Active
              </span>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px]"
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
            <button
              key={i}
              onClick={() => handleCellClick(d.name)}
              className="group flex items-center justify-between gap-3 py-1 px-2 rounded-lg hover:bg-white/[0.025] transition-colors cursor-pointer w-full text-left focus:outline-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[12px] truncate transition-colors group-hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>
                  {d.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                <span className="font-mono text-[12px] font-semibold text-white group-hover:text-blue-400 transition-colors">{d.value}</span>
              </div>
            </button>
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
