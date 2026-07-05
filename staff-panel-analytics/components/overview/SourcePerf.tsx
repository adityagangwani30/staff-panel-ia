'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface SourcePerfProps {
  leads: Lead[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-[12px] shadow-xl min-w-[140px]"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <div className="font-semibold mb-1.5">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{p.value}{p.name === 'Conv. %' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export function SourcePerf({ leads }: SourcePerfProps) {
  const sources = CFG.sources;

  const perf = useMemo(() =>
    Calc.sourcePerformance(leads, sources).sort((a, b) => b.enrollmentRate - a.enrollmentRate),
    [leads, sources]
  );

  const chartData = useMemo(() =>
    perf.slice(0, 6).map(p => ({
      name: p.source.length > 14 ? p.source.slice(0, 14) + '…' : p.source,
      fullName: p.source,
      leads: p.assigned,
      enrolled: p.enrolled,
      rate: parseFloat(p.enrollmentRate.toFixed(1)),
    })),
    [perf]
  );

  return (
    <div className="ia-card p-6 space-y-6" style={{ background: 'var(--bg-card)' }}>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Chart — 3 col */}
        <div className="xl:col-span-3 h-[220px]">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3"
               style={{ color: 'var(--text-muted)' }}>
            Top Channels — Conversion Rate
          </div>
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[12px]"
                 style={{ color: 'var(--text-muted)' }}>
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" fontSize={10} stroke="transparent" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} fontSize={10}
                       stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <RTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="rate" name="Conv. %" radius={[0, 6, 6, 0]} maxBarSize={14}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#22C55E' : i === 1 ? '#3B82F6' : i === 2 ? '#8B5CF6' : '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table — 2 col */}
        <div className="xl:col-span-2">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3"
               style={{ color: 'var(--text-muted)' }}>
            All Channels
          </div>
          <div className="overflow-x-auto max-h-[200px]">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="pb-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>#</th>
                  <th className="pb-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Source</th>
                  <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Leads</th>
                  <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Conv <Tooltip tooltipKey="sourceConvRate" alignRight />
                  </th>
                </tr>
              </thead>
              <tbody>
                {perf.map((p, idx) => {
                  const rateColor = idx === 0 ? '#22C55E' : idx <= 2 ? '#F59E0B' : 'var(--text-secondary)';
                  return (
                    <tr key={idx} className="transition-colors hover:bg-white/[0.025]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 pr-3 font-mono text-[11px]"
                          style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td className="py-2.5 font-medium truncate max-w-[120px]"
                          style={{ color: 'var(--text-primary)' }}>{p.source}</td>
                      <td className="py-2.5 text-right font-mono"
                          style={{ color: 'var(--text-secondary)' }}>{p.assigned}</td>
                      <td className="py-2.5 text-right font-mono font-semibold"
                          style={{ color: rateColor }}>{p.enrollmentRate.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
