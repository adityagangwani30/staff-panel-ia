'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock,
  AlertTriangle, BarChart3, ClipboardCheck, UserX, Ban, Activity
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { Tooltip } from '@/components/ui/Tooltip';

interface ExecutiveKpisProps {
  leads: Lead[];
  onInactiveCardClick: (days: number) => void;
}

/* ─── KPI card definition ──────────────────────────────────────────────── */
type StatDef = {
  label: string;
  value: number;
  isPct?: boolean;
  color: 'blue'|'teal'|'green'|'purple'|'amber'|'red'|'cyan'|'indigo'|'slate'|'stone'|'rose';
  icon: React.ElementType;
  tooltipKey: string;
  alignRight?: boolean;
  isClickable?: boolean;
  days?: number;
};

const COLOR_STYLES: Record<string, { icon: string; glow: string; hover: string }> = {
  blue:   { icon: 'text-blue-400',   glow: 'rgba(59,130,246,0.08)',   hover: 'rgba(59,130,246,0.12)'  },
  teal:   { icon: 'text-teal-400',   glow: 'rgba(20,184,166,0.08)',   hover: 'rgba(20,184,166,0.12)'  },
  green:  { icon: 'text-green-400',  glow: 'rgba(34,197,94,0.08)',    hover: 'rgba(34,197,94,0.12)'   },
  purple: { icon: 'text-purple-400', glow: 'rgba(139,92,246,0.08)',   hover: 'rgba(139,92,246,0.12)'  },
  amber:  { icon: 'text-amber-400',  glow: 'rgba(245,158,11,0.08)',   hover: 'rgba(245,158,11,0.12)'  },
  red:    { icon: 'text-red-400',    glow: 'rgba(239,68,68,0.08)',    hover: 'rgba(239,68,68,0.12)'   },
  cyan:   { icon: 'text-cyan-400',   glow: 'rgba(6,182,212,0.08)',    hover: 'rgba(6,182,212,0.12)'   },
  indigo: { icon: 'text-indigo-400', glow: 'rgba(99,102,241,0.08)',   hover: 'rgba(99,102,241,0.12)'  },
  slate:  { icon: 'text-slate-400',  glow: 'rgba(100,116,139,0.06)',  hover: 'rgba(100,116,139,0.1)'  },
  stone:  { icon: 'text-stone-400',  glow: 'rgba(120,113,108,0.06)',  hover: 'rgba(120,113,108,0.1)'  },
  rose:   { icon: 'text-rose-400',   glow: 'rgba(239,68,68,0.08)',    hover: 'rgba(239,68,68,0.12)'   },
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export function ExecutiveKpis({ leads, onInactiveCardClick }: ExecutiveKpisProps) {
  const stats: StatDef[] = [
    { label: 'Total Leads',              value: Calc.totalAssigned(leads),         color: 'blue',   icon: Users,          tooltipKey: 'totalLeads' },
    { label: 'Active Leads',             value: Calc.activeLeads(leads),            color: 'teal',   icon: Target,         tooltipKey: 'activeLeads' },
    { label: 'Enrolled',                 value: Calc.enrolled(leads),               color: 'green',  icon: CheckCircle2,   tooltipKey: 'enrolled' },
    { label: 'Conversion Rate',          value: Calc.enrollmentRate(leads),         color: 'purple', icon: TrendingUp,     tooltipKey: 'conversionRate', isPct: true },
    { label: 'Follow-ups Due Today',     value: Calc.followupsDueToday(leads),      color: 'amber',  icon: Clock,          tooltipKey: 'followupsDueToday', alignRight: true },
    { label: 'Overdue Follow-ups',       value: Calc.overdueFollowups(leads),       color: 'red',    icon: AlertTriangle,  tooltipKey: 'overdueFollowups' },
    { label: 'Consultation Booked',      value: Calc.consultationBooked(leads),     color: 'cyan',   icon: BarChart3,      tooltipKey: 'consultationBooked' },
    { label: 'Applications Submitted',   value: Calc.applicationsSubmitted(leads),  color: 'indigo', icon: ClipboardCheck, tooltipKey: 'applicationsSubmitted' },
    { label: 'Unassigned Leads',         value: Calc.unassignedLeads(leads),        color: 'slate',  icon: UserX,          tooltipKey: 'unassignedLeads' },
    { label: 'Lost / Dead Leads',        value: Calc.lostLeads(leads),              color: 'stone',  icon: Ban,            tooltipKey: 'lostLeads', alignRight: true },
    { label: '30-Day Inactive',          value: Calc.inactiveLeads30(leads),        color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads30', isClickable: true, days: 30 },
    { label: '60-Day Inactive',          value: Calc.inactiveLeads60(leads),        color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads60', isClickable: true, days: 60 },
    { label: '90-Day Inactive',          value: Calc.inactiveLeads90(leads),        color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads90', isClickable: true, days: 90, alignRight: true },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const cs = COLOR_STYLES[stat.color];
        const displayValue = stat.isPct
          ? `${stat.value.toFixed(1)}%`
          : stat.value.toLocaleString();

        const cardBody = (
          <>
            {/* Top row — icon + tooltip */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cs.glow }}
              >
                <Icon className={`w-4 h-4 ${cs.icon}`} />
              </div>
              <Tooltip tooltipKey={stat.tooltipKey} alignRight={stat.alignRight} />
            </div>

            {/* Value */}
            <div className="font-mono font-bold tracking-tight text-white leading-none"
                 style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              {displayValue}
            </div>

            {/* Label */}
            <div className="mt-2 text-[12px] font-medium leading-snug"
                 style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>

            {/* Clickable indicator */}
            {stat.isClickable && (
              <div className="mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-semibold text-rose-400/80"
                   style={{ borderColor: 'var(--border)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Click to explore
              </div>
            )}
          </>
        );

        const baseClass = `ia-card p-5 flex flex-col select-none transition-all duration-200`;

        if (stat.isClickable) {
          return (
            <motion.button
              key={idx}
              variants={item}
              onClick={() => onInactiveCardClick(stat.days!)}
              whileHover={{ y: -2 }}
              className={`${baseClass} cursor-pointer text-left w-full`}
              style={{ background: 'var(--bg-card)' }}
            >
              {cardBody}
            </motion.button>
          );
        }

        return (
          <motion.div
            key={idx}
            variants={item}
            className={`${baseClass}`}
            style={{ background: 'var(--bg-card)' }}
          >
            {cardBody}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
