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

interface CounsellorPerfProps {
  leads: Lead[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-[12px] shadow-xl min-w-[150px]"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <div className="font-semibold mb-1.5">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CounsellorPerf({ leads }: CounsellorPerfProps) {
  const counsellors = CFG.staff.filter((s: any) => s.role !== 'Founder');

  const perf = useMemo(() =>
    Calc.counsellorPerformance(leads, counsellors).sort((a, b) => b.enrolled - a.enrolled),
    [leads, counsellors]
  );

  const chartData = useMemo(() =>
    perf.slice(0, 6).map(p => ({
      name: p.name.split(' ')[0],
      fullName: p.name,
      enrolled: p.enrolled,
      assigned: p.assigned,
    })),
    [perf]
  );

  return (
    <div className="ia-card p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Chart — 3 col */}
        <div className="xl:col-span-3 h-[220px]">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3"
               style={{ color: 'var(--text-muted)' }}>
            Top Counsellors — Enrollments
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
                <YAxis dataKey="name" type="category" width={70} fontSize={10}
                       stroke="transparent" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <RTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="enrolled" name="Enrolled" radius={[0, 6, 6, 0]} maxBarSize={14}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#22C55E' : i === 1 ? '#14B8A6' : i === 2 ? '#3B82F6' : '#64748B'} />
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
            All Counsellors
          </div>
          <div className="overflow-x-auto max-h-[200px]">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="pb-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Leads</th>
                  <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>FU</th>
                  <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Conv <Tooltip tooltipKey="conversionRate" alignRight />
                  </th>
                </tr>
              </thead>
              <tbody>
                {perf.map((p, idx) => {
                  const rateColor = p.enrollmentRate > 10 ? '#22C55E' : p.enrollmentRate > 5 ? '#F59E0B' : 'var(--text-secondary)';
                  return (
                    <tr key={idx} className="transition-colors hover:bg-white/[0.025]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 font-medium truncate max-w-[110px]"
                          style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                      <td className="py-2.5 text-right font-mono"
                          style={{ color: 'var(--text-secondary)' }}>{p.assigned}</td>
                      <td className="py-2.5 text-right font-mono"
                          style={{ color: '#F59E0B' }}>{p.followupsDue}</td>
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
