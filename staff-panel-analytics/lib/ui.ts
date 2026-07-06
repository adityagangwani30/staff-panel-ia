import { Variants } from 'framer-motion';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Shared UI Tokens — design system colour + animation source
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/** KPI icon accent colour token — used by ExecutiveKpis & StaffAnalytics */
export interface ColorToken {
  icon: string;  // Tailwind text-color class
  glow: string;  // rgba background for icon puck
}

export const KPI_COLOR_MAP: Record<string, ColorToken> = {
  blue:   { icon: 'text-blue-400',   glow: 'rgba(59,130,246,0.08)'  },
  teal:   { icon: 'text-teal-400',   glow: 'rgba(20,184,166,0.08)'  },
  green:  { icon: 'text-green-400',  glow: 'rgba(34,197,94,0.08)'   },
  purple: { icon: 'text-purple-400', glow: 'rgba(139,92,246,0.08)'  },
  amber:  { icon: 'text-amber-400',  glow: 'rgba(245,158,11,0.08)'  },
  red:    { icon: 'text-red-400',    glow: 'rgba(239,68,68,0.08)'   },
  cyan:   { icon: 'text-cyan-400',   glow: 'rgba(6,182,212,0.08)'   },
  indigo: { icon: 'text-indigo-400', glow: 'rgba(99,102,241,0.08)'  },
  slate:  { icon: 'text-slate-400',  glow: 'rgba(100,116,139,0.06)' },
  stone:  { icon: 'text-stone-400',  glow: 'rgba(120,113,108,0.06)' },
  rose:   { icon: 'text-rose-400',   glow: 'rgba(244,63,94,0.08)'   },
  pink:   { icon: 'text-pink-400',   glow: 'rgba(236,72,153,0.08)'  },
};

/** Ordered palette for donut / status charts */
export const CHART_PALETTE = [
  '#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444',
  '#06B6D4', '#F97316', '#14B8A6', '#EC4899', '#64748B',
];

/** Ordered palette for funnel bars (7 stages max) */
export const FUNNEL_PALETTE = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#06B6D4', '#14B8A6', '#22C55E',
];

/* ── Framer Motion shared variants ────────────────────────────────────── */

/** Stagger container — wraps a grid of cards */
export const fadeStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

/** Individual card that slides up */
export const fadeSlideItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
};

/** Tighter card variant used in StaffAnalytics KPIs */
export const fadeCardItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

/** Horizontal slide-in row used in funnel */
export const fadeSlideRow: Variants = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
};
