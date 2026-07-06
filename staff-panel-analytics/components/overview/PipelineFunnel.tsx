'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { FUNNEL_PALETTE, fadeStaggerContainer, fadeSlideRow } from '@/lib/ui';
import { Tooltip } from '@/components/ui/Tooltip';
import { exploreLeads } from '@/lib/utils';

interface PipelineFunnelProps {
  leads: Lead[];
  onExplore: (title: string, leads: Lead[]) => void;
}

export function PipelineFunnel({ leads, onExplore }: PipelineFunnelProps) {
  const stages = useMemo(() => Calc.pipelineStages(leads), [leads]);
  const max = stages[0]?.count || 0;

  const handleExploreStage = (stageName: string, index: number) => {
    const order = CFG.statusOrder;
    const filterFn = (l: Lead) => {
      if (Calc._isLost(l)) return false;
      if (index === 0) return true; // 'Total Leads' stage
      return (order[l.status] ?? -999) >= (order[stageName] ?? -999);
    };
    exploreLeads(onExplore, `${stageName} Stage`, leads.filter(filterFn));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── Funnel bars (2/3) ─────────────────────────────────── */}
      <motion.div
        variants={fadeStaggerContainer}
        initial="hidden"
        animate="show"
        className="ia-card p-6 lg:col-span-2 space-y-3"
        style={{ background: 'var(--bg-card)' }}
      >
        {stages.map((stage, idx) => {
          const pct = max ? (stage.count / max) * 100 : 0;
          const color = FUNNEL_PALETTE[idx % FUNNEL_PALETTE.length];

          return (
            <motion.button
              key={idx}
              variants={fadeSlideRow}
              onClick={() => handleExploreStage(stage.stage, idx)}
              className="w-full text-left group p-2 -m-2 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer block select-none focus:outline-none"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5 w-full">
                <span className="text-[13px] font-medium transition-colors duration-200 group-hover:text-blue-400"
                      style={{ color: 'var(--text-secondary)' }}>
                  {stage.stage}
                </span>
                <span className="font-mono text-[13px] font-semibold text-white flex items-center gap-2">
                  {stage.count.toLocaleString()}
                  <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                    {idx === 0 ? '100%' : `${pct.toFixed(1)}%`}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-400/0 group-hover:text-blue-400/80 transition-all duration-200 ml-1">
                    Explore →
                  </span>
                </span>
              </div>

              {/* Bar track */}
              <div
                className="h-3 rounded-full overflow-hidden transition-all duration-200 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.15)]"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(pct, stage.count > 0 ? 2 : 0)}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Conversion detail table (1/3) ─────────────────────── */}
      <div
        className="ia-card p-6 flex flex-col"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="text-[11px] font-bold uppercase tracking-widest mb-4"
             style={{ color: 'var(--text-muted)' }}>
          Stage Conversion
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="pb-2 pr-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Stage</th>
                <th className="pb-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Conv <Tooltip tooltipKey="stageConversion" alignRight />
                </th>
                <th className="pb-2 text-right pl-3 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Drop <Tooltip tooltipKey="dropOff" alignRight />
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, idx) => {
                const convColor = stage.stageConversion > 50
                  ? '#22C55E' : stage.stageConversion > 25
                  ? '#F59E0B' : '#EF4444';
                const dropColor = stage.dropOff > 50
                  ? '#EF4444' : stage.dropOff > 25
                  ? '#F59E0B' : '#22C55E';

                return (
                  <tr
                    key={idx}
                    onClick={() => handleExploreStage(stage.stage, idx)}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-white/[0.04] cursor-pointer group"
                  >
                    <td className="py-2.5 pr-3 font-medium truncate max-w-[90px] group-hover:text-blue-400 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}>
                      {stage.stage}
                    </td>
                    {idx === 0 ? (
                      <>
                        <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>—</td>
                        <td className="py-2.5 text-right pl-3" style={{ color: 'var(--text-muted)' }}>—</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 text-right font-mono font-semibold"
                            style={{ color: convColor }}>
                          {stage.stageConversion.toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-right pl-3 font-mono font-semibold"
                            style={{ color: dropColor }}>
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
