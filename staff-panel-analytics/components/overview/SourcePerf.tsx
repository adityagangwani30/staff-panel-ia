'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface SourcePerfProps {
  leads: Lead[];
}

export function SourcePerf({ leads }: SourcePerfProps) {
  const sources = CFG.sources;
  const perf = useMemo(() => {
    return Calc.sourcePerformance(leads, sources)
      .sort((a, b) => b.enrollmentRate - a.enrollmentRate);
  }, [leads, sources]);

  // Recharts bar chart mapping data
  const chartData = useMemo(() => {
    return perf.slice(0, 5).map(p => ({
      name: p.source,
      assigned: p.assigned,
      enrolled: p.enrolled,
      convRate: parseFloat(p.enrollmentRate.toFixed(1))
    }));
  }, [perf]);

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left: Recharts Horizontal Bar Chart */}
        <div className="h-[250px] flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-2 border-b border-slate-800/40">
            Top 5 Channels (Conversion Rate)
          </div>
          <div className="flex-1 mt-3">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#475569" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={80} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="convRate" name="Conv. %" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Detailed Ranking Grid Table */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-2 border-b border-slate-800/40">
            All Channels Summary
          </div>
          <div className="overflow-x-auto max-h-[220px] mt-2 scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
                  <th className="py-2 w-8 text-center">#</th>
                  <th className="py-2">Source</th>
                  <th className="py-2 text-right">Leads</th>
                  <th className="py-2 text-right">Enr</th>
                  <th className="py-2 text-right">
                    Conv % <Tooltip tooltipKey="sourceConvRate" alignRight />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-slate-300">
                {perf.map((p, idx) => {
                  const rankClass = idx === 0 ? 'text-green-400 font-bold' : idx <= 2 ? 'text-amber-400 font-semibold' : 'text-slate-500';
                  return (
                    <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                      <td className={`py-2 text-center font-mono ${rankClass}`}>{idx + 1}</td>
                      <td className="py-2 font-semibold text-slate-200 truncate max-w-[120px]">{p.source}</td>
                      <td className="py-2 text-right font-mono">{p.assigned}</td>
                      <td className="py-2 text-right font-mono text-green-400/90">{p.enrolled}</td>
                      <td className={`py-2 text-right font-mono font-bold ${idx === 0 ? 'text-green-400' : idx <= 2 ? 'text-amber-400' : 'text-slate-400'}`}>
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
