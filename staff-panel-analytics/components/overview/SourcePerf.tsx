import React from 'react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface SourcePerfProps {
  leads: Lead[];
}

export function SourcePerf({ leads }: SourcePerfProps) {
  const sources = CFG.sources;
  const perf = Calc.sourcePerformance(leads, sources).sort((a, b) => b.enrollmentRate - a.enrollmentRate);

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
              <th className="py-2.5 w-12 text-center">#</th>
              <th className="py-2.5">Source</th>
              <th className="py-2.5 text-right">
                Total Leads <Tooltip tooltipKey="sourceLeads" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Enrolled <Tooltip tooltipKey="sourceEnrolled" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Conv. Rate <Tooltip tooltipKey="sourceConvRate" alignRight />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30 text-slate-300">
            {perf.map((p, idx) => {
              const rankClass = idx === 0 ? 'text-green-400 font-bold' : idx <= 2 ? 'text-amber-400 font-semibold' : 'text-slate-500';
              return (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className={`py-3 text-center font-mono ${rankClass}`}>{idx + 1}</td>
                  <td className="py-3 font-semibold text-slate-200">{p.source}</td>
                  <td className="py-3 text-right font-mono">{p.assigned}</td>
                  <td className="py-3 text-right font-mono">{p.enrolled}</td>
                  <td className={`py-3 text-right font-mono font-bold ${idx === 0 ? 'text-green-400' : idx <= 2 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {p.enrollmentRate.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
