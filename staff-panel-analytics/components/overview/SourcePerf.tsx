'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { ChartTooltip } from '@/components/shared/ChartTooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { exploreLeads } from '@/lib/utils';

interface SourcePerfProps {
  leads: Lead[];
  onExplore: (title: string, leads: Lead[]) => void;
}

const BAR_COLORS = ['#22C55E', '#3B82F6', '#8B5CF6', '#64748B'];

export function SourcePerf({ leads, onExplore }: SourcePerfProps) {
  const perf = useMemo(
    () => Calc.sourcePerformance(leads, CFG.sources).sort((a, b) => b.enrollmentRate - a.enrollmentRate),
    [leads],
  );

  const chartData = useMemo(
    () => perf.slice(0, 6).map(p => ({
      name: p.source.length > 14 ? p.source.slice(0, 14) + '…' : p.source,
      fullName: p.source,
      'Conv. %': parseFloat(p.enrollmentRate.toFixed(1)),
    })),
    [perf],
  );

  const handleBarClick = (data: any) => {
    if (data && data.payload) {
      const payload = data.payload;
      exploreLeads(onExplore, `Leads from ${payload.fullName}`, leads.filter(l => l.source === payload.fullName));
    }
  };

  const exploreSourceLeads = (source: string) => {
    exploreLeads(onExplore, `Leads from ${source}`, leads.filter(l => l.source === source));
  };

  const exploreSourceEnrolled = (source: string) => {
    exploreLeads(onExplore, `Enrolled Leads — ${source}`, leads.filter(l => l.source === source && Calc._isEnrolled(l)));
  };

  return (
    <div className="ia-card p-6" style={{ background: 'var(--bg-card)' }}>
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
                <XAxis type="number" fontSize={10} stroke="transparent"
                       tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} fontSize={10}
                       stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <RTooltip
                  content={props => <ChartTooltip {...props} valueSuffix="%" />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="Conv. %" radius={[0, 6, 6, 0]} maxBarSize={14} onClick={handleBarClick}>
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)]}
                      className="cursor-pointer outline-none transition-all duration-200 hover:opacity-85"
                    />
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
                    <tr key={idx} className="transition-colors hover:bg-white/[0.015]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 pr-3 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      <td
                        onClick={() => exploreSourceLeads(p.source)}
                        className="py-2.5 font-medium truncate max-w-[120px] cursor-pointer hover:text-blue-400 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {p.source}
                      </td>
                      <td
                        onClick={() => exploreSourceLeads(p.source)}
                        className="py-2.5 text-right font-mono cursor-pointer hover:text-blue-400 hover:font-bold transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {p.assigned}
                      </td>
                      <td
                        onClick={() => exploreSourceEnrolled(p.source)}
                        className="py-2.5 text-right font-mono font-semibold cursor-pointer hover:text-green-400 transition-all"
                        style={{ color: rateColor }}
                      >
                        {p.enrollmentRate.toFixed(1)}%
                      </td>
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
