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
import { exploreLeads, toMidnight } from '@/lib/utils';

interface CounsellorPerfProps {
  leads: Lead[];
  onExplore: (title: string, leads: Lead[]) => void;
}

const BAR_COLORS = ['#22C55E', '#14B8A6', '#3B82F6', '#64748B'];

export function CounsellorPerf({ leads, onExplore }: CounsellorPerfProps) {
  const counsellors = useMemo(() => CFG.staff.filter(s => s.role !== 'Founder'), []);

  const perf = useMemo(() =>
    Calc.counsellorPerformance(leads, counsellors).sort((a, b) => b.enrolled - a.enrolled),
    [leads, counsellors]
  );

  const chartData = useMemo(() =>
    perf.slice(0, 6).map(p => ({
      name: p.name.split(' ')[0],
      fullName: p.name,
      Enrolled: p.enrolled,
      id: p.id,
    })),
    [perf]
  );

  const handleBarClick = (data: any) => {
    if (data && data.payload) {
      const payload = data.payload;
      exploreLeads(
        onExplore,
        `Enrolled Leads — ${payload.fullName}`,
        leads.filter(l => l.counsellorId === payload.id && Calc._isEnrolled(l))
      );
    }
  };

  const exploreCounsellorLeads = (id: string, name: string) => {
    exploreLeads(onExplore, `Assigned Leads — ${name}`, leads.filter(l => l.counsellorId === id));
  };

  const exploreCounsellorFollowups = (id: string, name: string) => {
    const midnight = toMidnight(CFG.today);
    exploreLeads(
      onExplore,
      `Pending Follow-ups — ${name}`,
      leads.filter(l => l.counsellorId === id && !!l.followUpDate && new Date(l.followUpDate) >= midnight && Calc._isActive(l))
    );
  };

  const exploreCounsellorEnrolled = (id: string, name: string) => {
    exploreLeads(
      onExplore,
      `Enrolled Leads — ${name}`,
      leads.filter(l => l.counsellorId === id && Calc._isEnrolled(l))
    );
  };

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
                <RTooltip
                  content={props => <ChartTooltip {...props} />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="Enrolled" radius={[0, 6, 6, 0]} maxBarSize={14} onClick={handleBarClick}>
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
                    <tr key={idx} className="transition-colors hover:bg-white/[0.015]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                      <td
                        onClick={() => exploreCounsellorLeads(p.id, p.name)}
                        className="py-2.5 font-medium truncate max-w-[110px] cursor-pointer hover:text-blue-400 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {p.name}
                      </td>
                      <td
                        onClick={() => exploreCounsellorLeads(p.id, p.name)}
                        className="py-2.5 text-right font-mono cursor-pointer hover:text-blue-400 hover:font-bold transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {p.assigned}
                      </td>
                      <td
                        onClick={() => exploreCounsellorFollowups(p.id, p.name)}
                        className="py-2.5 text-right font-mono cursor-pointer hover:text-amber-400 hover:font-bold transition-all"
                        style={{ color: '#F59E0B' }}
                      >
                        {p.followupsDue}
                      </td>
                      <td
                        onClick={() => exploreCounsellorEnrolled(p.id, p.name)}
                        className="py-2.5 text-right font-mono font-semibold cursor-pointer hover:text-green-400 transition-all"
                        style={{ color: rateColor }}
                      >
                        {p.enrollmentRate.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
                {perf.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      No counsellors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
