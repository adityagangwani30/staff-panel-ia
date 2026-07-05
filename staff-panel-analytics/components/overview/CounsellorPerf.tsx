import React from 'react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface CounsellorPerfProps {
  leads: Lead[];
}

export function CounsellorPerf({ leads }: CounsellorPerfProps) {
  const counsellors = CFG.staff.filter(s => s.role !== 'Founder');
  const perf = Calc.counsellorPerformance(leads, counsellors).sort((a, b) => b.assigned - a.assigned);

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
              <th className="py-2.5">Counsellor</th>
              <th className="py-2.5">Centre</th>
              <th className="py-2.5 text-right">
                Assigned <Tooltip tooltipKey="assignedLeads" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Active <Tooltip tooltipKey="activeLeads" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Follow-ups Due <Tooltip tooltipKey="staffPendingFollowups" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Enrolled <Tooltip tooltipKey="enrolled" alignRight />
              </th>
              <th className="py-2.5 text-right">
                Conv. Rate <Tooltip tooltipKey="conversionRate" alignRight />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30 text-slate-300">
            {perf.map((p, idx) => {
              const rateClass = p.enrollmentRate > 10 ? 'text-green-400' : p.enrollmentRate > 5 ? 'text-amber-400' : 'text-slate-400';
              return (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{p.name}</td>
                  <td className="py-3 text-slate-400">{p.centre}</td>
                  <td className="py-3 text-right font-mono">{p.assigned}</td>
                  <td className="py-3 text-right font-mono">{p.active}</td>
                  <td className="py-3 text-right font-mono">{p.followupsDue}</td>
                  <td className="py-3 text-right font-mono">{p.enrolled}</td>
                  <td className={`py-3 text-right font-mono font-bold ${rateClass}`}>
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
