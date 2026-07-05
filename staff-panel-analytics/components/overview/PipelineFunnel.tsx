'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Tooltip } from '@/components/ui/Tooltip';

interface PipelineFunnelProps {
  leads: Lead[];
}

export function PipelineFunnel({ leads }: PipelineFunnelProps) {
  const stages = Calc.pipelineStages(leads);
  const max = stages[0]?.count || 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Funnel (2 Columns wide) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="lg:col-span-2 p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm space-y-3.5"
      >
        {stages.map((stage, idx) => {
          const widthPct = max ? (stage.count / max) * 100 : 0;
          const color = CFG.palette[idx % CFG.palette.length];
          const pctFromTotal = max ? (stage.count / max) * 100 : 0;

          return (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              {/* Label */}
              <div className="w-36 text-xs font-semibold text-slate-300 truncate text-right">
                {stage.stage}
              </div>
              
              {/* Funnel Track */}
              <div className="flex-1 h-9 bg-slate-950/60 rounded-lg overflow-hidden border border-slate-800/40 relative flex items-center">
                {/* Colored Fill */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(widthPct, 6)}%` }}
                  transition={{ duration: 0.65, ease: 'easeOut', delay: idx * 0.03 }}
                  className="h-full rounded-r flex items-center justify-end px-3 font-mono text-[11px] font-extrabold text-slate-950"
                  style={{ backgroundColor: color }}
                >
                  {stage.count > 0 && <span className="opacity-90">{stage.count}</span>}
                </motion.div>
                {stage.count === 0 && (
                  <span className="pl-3 font-mono text-xs text-slate-600 font-medium">0</span>
                )}
              </div>
              
              {/* Pct label */}
              <div className="w-12 text-xs font-mono text-slate-400 font-bold text-left">
                {idx === 0 ? '100%' : `${pctFromTotal.toFixed(0)}%`}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Conversion Table (1 Column wide) */}
      <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-3 border-b border-slate-800/60">
          Conversion Detail
        </div>
        <div className="flex-1 overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
                <th className="py-2">Stage</th>
                <th className="py-2 text-right">Count</th>
                <th className="py-2 text-right">
                  Stage Conv. <Tooltip tooltipKey="stageConversion" alignRight />
                </th>
                <th className="py-2 text-right">
                  Drop-off <Tooltip tooltipKey="dropOff" alignRight />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-slate-300">
              {stages.map((stage, idx) => {
                const convClass = stage.stageConversion > 50 ? 'text-green-400' : stage.stageConversion > 25 ? 'text-amber-400' : 'text-red-400';
                const dropClass = stage.dropOff > 50 ? 'text-red-400' : stage.dropOff > 25 ? 'text-amber-400' : 'text-green-400';
                
                return (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">{stage.stage}</td>
                    <td className="py-2.5 text-right font-mono font-semibold">{stage.count}</td>
                    {idx === 0 ? (
                      <>
                        <td className="py-2.5 text-right text-slate-500 font-medium">—</td>
                        <td className="py-2.5 text-right text-slate-500 font-medium">—</td>
                      </>
                    ) : (
                      <>
                        <td className={`py-2.5 text-right font-mono font-bold ${convClass}`}>
                          {stage.stageConversion.toFixed(1)}%
                        </td>
                        <td className={`py-2.5 text-right font-mono font-bold ${dropClass}`}>
                          {stage.dropOff.toFixed(1)}%
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
