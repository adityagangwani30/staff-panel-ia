'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Lead } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface RecentLeadsProps {
  leads: Lead[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.025 } },
};
const row: Variants = {
  hidden: { opacity: 0, y: 4 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

export function RecentLeads({ leads }: RecentLeadsProps) {
  const recent = [...leads]
    .filter(l => l.entryDate)
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 12);

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
          <motion.tbody variants={container} initial="hidden" animate="show">
            {recent.map((l, idx) => {
              const date = new Date(l.entryDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              return (
                <motion.tr
                  key={idx}
                  variants={row}
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
                    {date}
                  </td>
                </motion.tr>
              );
            })}
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
