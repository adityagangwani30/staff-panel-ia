'use client';

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface StatusDistProps {
  leads: Lead[];
}

export function StatusDist({ leads }: StatusDistProps) {
  const chartData = useMemo(() => {
    const dist = Calc.statusDistribution(leads);
    return dist
      .filter(d => d.count > 0)
      .map(d => ({
        name: d.status,
        value: d.count,
        color: CFG.statusColors[d.status] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const activeCount = useMemo(() => {
    return Calc.activeLeads(leads);
  }, [leads]);

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-6">
      {/* Recharts Pie Visualizer */}
      <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
        {chartData.length === 0 ? (
          <div className="text-xs text-slate-500 font-semibold select-none">No active leads</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={84}
                  paddingAngle={2.5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Total Active Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
              <span className="text-2xl font-black text-slate-100 tracking-tight leading-none">
                {activeCount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Active Leads
              </span>
            </div>
          </>
        )}
      </div>

      {/* Grid Legend showing counts & indicators */}
      <div className="flex-1 w-full max-h-[190px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
        {chartData.map((d, index) => (
          <div key={index} className="flex items-center justify-between text-xs hover:bg-slate-900/20 py-0.5 rounded transition-all">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-slate-900 flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-slate-300 font-medium truncate max-w-[140px] sm:max-w-none">
                {d.name}
              </span>
            </div>
            <span className="font-mono text-slate-400 font-semibold">{d.value}</span>
          </div>
        ))}
        {chartData.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No matching records found.</p>
        )}
      </div>
    </div>
  );
}
