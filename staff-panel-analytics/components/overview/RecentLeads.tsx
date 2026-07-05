'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Lead } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface RecentLeadsProps {
  leads: Lead[];
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  const recent = [...leads]
    .filter(l => l.entryDate)
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    .slice(0, 10);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }
  };

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-semibold border-b border-slate-800/40 select-none">
              <th className="py-2.5">Name</th>
              <th className="py-2.5">Assigned To</th>
              <th className="py-2.5">Status</th>
              <th className="py-2.5">Source</th>
              <th className="py-2.5 text-right">Entry Date</th>
            </tr>
          </thead>
          <motion.tbody 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-800/30 text-slate-300"
          >
            {recent.map((l, idx) => {
              const formattedDate = new Date(l.entryDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              return (
                <motion.tr 
                  key={idx} 
                  variants={rowVariants}
                  className="hover:bg-slate-950/20 transition-colors"
                >
                  <td className="py-3 font-semibold text-slate-200">{l.studentName}</td>
                  <td className="py-3 text-slate-400">{l.counsellorName || 'Unassigned'}</td>
                  <td className="py-3"><Badge status={l.status} /></td>
                  <td className="py-3 text-slate-400">{l.source}</td>
                  <td className="py-3 text-right font-mono text-slate-400">{formattedDate}</td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
