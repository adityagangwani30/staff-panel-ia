'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lead } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { fadeStaggerContainer, fadeSlideItem } from '@/lib/ui';

interface RecentLeadsProps {
  leads: Lead[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  const recent = useMemo(() =>
    [...leads]
      .filter(l => l.entryDate)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 10),
    [leads]
  );

  return (
    <div className="ia-card p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Assigned To', 'Status', 'Source', 'Entry Date'].map((h, i) => (
                <th
                  key={h}
                  className={`pb-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap
                              ${i === 4 ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={fadeStaggerContainer} initial="hidden" animate="show">
            {recent.map((l, idx) => (
              <motion.tr
                key={idx}
                variants={fadeSlideItem}
                className="group transition-colors hover:bg-white/[0.025]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="py-3 pr-4 font-semibold text-[13px]"
                    style={{ color: 'var(--text-primary)' }}>
                  {l.studentName}
                </td>
                <td className="py-3 pr-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {l.counsellorName || (
                    <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <Badge status={l.status} />
                </td>
                <td className="py-3 pr-4 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {l.source}
                </td>
                <td className="py-3 text-right font-mono text-[12px]"
                    style={{ color: 'var(--text-muted)' }}>
                  {formatDate(l.entryDate)}
                </td>
              </motion.tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[13px]"
                    style={{ color: 'var(--text-muted)' }}>
                  No recent leads found
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
