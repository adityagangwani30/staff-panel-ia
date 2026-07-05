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

const STAGE_COLORS = [
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // purple
  '#A855F7', // violet
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#22C55E', // green
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const row: Variants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
};

export function PipelineFunnel({ leads }: PipelineFunnelProps) {
  const stages = Calc.pipelineStages(leads);
  const max = stages[0]?.count || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* ── Funnel bars (2/3) ─────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="ia-card p-6 lg:col-span-2 space-y-4"
        style={{ background: 'var(--bg-card)' }}
      >
        {stages.map((stage, idx) => {
          const pct = max ? (stage.count / max) * 100 : 0;
          const color = STAGE_COLORS[idx % STAGE_COLORS.length];

          return (
            <motion.div key={idx} variants={row}>
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stage.stage}
                </span>
                <span className="font-mono text-[13px] font-semibold text-white">
                  {stage.count.toLocaleString()}
                  <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                    {idx === 0 ? '100%' : `${pct.toFixed(1)}%`}
                  </span>
                </span>
              </div>

              {/* Bar track */}
              <div
                className="h-3 rounded-full overflow-hidden"
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
            </motion.div>
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
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="py-2.5 pr-3 font-medium truncate max-w-[90px]"
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
