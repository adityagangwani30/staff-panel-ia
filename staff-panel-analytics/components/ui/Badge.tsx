'use client';

import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

/** Maps every IntelAbroad CRM status to its pill styling. */
const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
  // ── DNP series ────────────────────────────────────────────────────
  'DNP 1': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  'DNP 2': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  'DNP 3': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  'DNP 4': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-500' },
  'DNP 5': { bg: 'bg-zinc-500/10', text: 'text-zinc-400', dot: 'bg-zinc-500' },

  // ── Not reachable ─────────────────────────────────────────────────
  'NATC':                    { bg: 'bg-stone-500/10', text: 'text-stone-400', dot: 'bg-stone-500', label: 'NATC' },
  'Not Answering The Call':  { bg: 'bg-stone-500/10', text: 'text-stone-400', dot: 'bg-stone-500', label: 'NATC' },
  'DNP':                     { bg: 'bg-zinc-500/10',  text: 'text-zinc-400',  dot: 'bg-zinc-500' },

  // ── Temperature ───────────────────────────────────────────────────
  'Cold Lead': { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-500' },
  'Warm Lead': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
  'Hot Lead':  { bg: 'bg-orange-500/10',text: 'text-orange-400',dot: 'bg-orange-500' },

  // ── Callback / Follow-up ─────────────────────────────────────────
  'Call Back':  { bg: 'bg-violet-500/10',text: 'text-violet-400',dot: 'bg-violet-500' },
  'Follow Up':  { bg: 'bg-sky-500/10',   text: 'text-sky-400',   dot: 'bg-sky-500' },
  'Callback':   { bg: 'bg-violet-500/10',text: 'text-violet-400',dot: 'bg-violet-500' },

  // ── Active pipeline ───────────────────────────────────────────────
  'Interested':              { bg: 'bg-blue-500/10',  text: 'text-blue-400',  dot: 'bg-blue-500' },
  'Consultation Booked':     { bg: 'bg-cyan-500/10',  text: 'text-cyan-400',  dot: 'bg-cyan-500' },
  'Consultation Done':       { bg: 'bg-teal-500/10',  text: 'text-teal-400',  dot: 'bg-teal-500' },
  'Consultation Submitted':  { bg: 'bg-lime-500/10',  text: 'text-lime-400',  dot: 'bg-lime-500' },
  'Documents Submitted':     { bg: 'bg-indigo-500/10',text: 'text-indigo-400',dot: 'bg-indigo-500' },
  'Applied':                 { bg: 'bg-purple-500/10',text: 'text-purple-400',dot: 'bg-purple-500' },

  // ── Terminal ─────────────────────────────────────────────────────
  'Enrolled':    { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  'Lost/Dead':   { bg: 'bg-red-500/10',   text: 'text-red-400',   dot: 'bg-red-500' },
  'Lost':        { bg: 'bg-red-500/10',   text: 'text-red-400',   dot: 'bg-red-500' },
  'Dead':        { bg: 'bg-red-500/10',   text: 'text-red-400',   dot: 'bg-red-500' },
  'Not Interested': { bg: 'bg-rose-500/10',text: 'text-rose-400', dot: 'bg-rose-500' },

  // ── Misc ─────────────────────────────────────────────────────────
  'Unassigned': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
};

const FALLBACK = { bg: 'bg-white/5', text: 'text-[#A1A1AA]', dot: 'bg-[#71717A]' };

export function Badge({ status, className = '' }: BadgeProps) {
  const style = STATUS_MAP[status] ?? FALLBACK;
  const label = style.label ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full 
                  text-[11px] font-semibold tracking-wide whitespace-nowrap 
                  ${style.bg} ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {label}
    </span>
  );
}
