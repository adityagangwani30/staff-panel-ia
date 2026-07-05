import React from 'react';
import { CFG } from '@/lib/constants';

interface BadgeProps {
  status: string;
}

export function Badge({ status }: BadgeProps) {
  const color = CFG.statusColors[status] || '#64748b';
  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold select-none border"
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}45`,
        color: color
      }}
    >
      {status}
    </span>
  );
}
