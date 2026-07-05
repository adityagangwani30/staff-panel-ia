'use client';

import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

/** Maps every known IntelAbroad status to its pill styling. */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  // ── Positive ──────────────────────────────────────────
  'Enrolled':                { bg: 'bg-green-500/12',  text: 'text-green-400',  dot: 'bg-green-400' },
  'Applied':                 { bg: 'bg-teal-500/12',   text: 'text-teal-400',   dot: 'bg-teal-400' },
  'Documents Submitted':     { bg: 'bg-cyan-500/12',   text: 'text-cyan-400',   dot: 'bg-cyan-400' },

  // ── Active / Warm ──────────────────────────────────────
  'Interested':              { bg: 'bg-blue-500/12',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  'Hot Lead':                { bg: 'bg-orange-500/12', text: 'text-orange-400', dot: 'bg-orange-400' },
  'Warm Lead':               { bg: 'bg-amber-500/12',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  'Consultation Done':       { bg: 'bg-indigo-500/12', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'Consultation Booked':     { bg: 'bg-purple-500/12', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Callback':                { bg: 'bg-violet-500/12', text: 'text-violet-400', dot: 'bg-violet-400' },
  'Follow Up':               { bg: 'bg-sky-500/12',    text: 'text-sky-400',    dot: 'bg-sky-400' },

  // ── Neutral / Cold ────────────────────────────────────
  'Cold Lead':               { bg: 'bg-slate-500/12',  text: 'text-slate-400',  dot: 'bg-slate-400' },
  'Not Answering The Call':  { bg: 'bg-zinc-500/12',   text: 'text-zinc-400',   dot: 'bg-zinc-400',  label: 'NATC' },
  'DNP':                     { bg: 'bg-zinc-500/12',   text: 'text-zinc-400',   dot: 'bg-zinc-400' },
  'Unassigned':              { bg: 'bg-gray-500/12',   text: 'text-gray-400',   dot: 'bg-gray-400' },

  // ── Negative ──────────────────────────────────────────
  'Lost/Dead':               { bg: 'bg-red-500/12',    text: 'text-red-400',    dot: 'bg-red-400' },
  'Dead':                    { bg: 'bg-red-500/12',    text: 'text-red-400',    dot: 'bg-red-400' },
  'Lost':                    { bg: 'bg-red-500/12',    text: 'text-red-400',    dot: 'bg-red-400' },
  'Not Interested':          { bg: 'bg-rose-500/12',   text: 'text-rose-400',   dot: 'bg-rose-400' },
};

const FALLBACK = { bg: 'bg-white/5', text: 'text-[#A1A1AA]', dot: 'bg-[#71717A]' };

export function Badge({ status, className = '' }: BadgeProps) {
  const style = STATUS_MAP[status] ?? FALLBACK;
  const label = style.label ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap ${style.bg} ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {label}
    </span>
  );
}
