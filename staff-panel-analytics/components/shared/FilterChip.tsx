'use client';

import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

/** Removable filter pill displayed in the dashboard filter bar. */
export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{
        background: 'rgba(59,130,246,0.12)',
        color: '#93C5FD',
        border: '1px solid rgba(59,130,246,0.2)',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-400/20 transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
