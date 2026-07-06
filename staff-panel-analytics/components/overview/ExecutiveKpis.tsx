'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock,
  AlertTriangle, BarChart3, ClipboardCheck, UserX, Ban, Activity,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { KPI_COLOR_MAP, fadeStaggerContainer, fadeSlideItem } from '@/lib/ui';
import { Tooltip } from '@/components/ui/Tooltip';

interface ExecutiveKpisProps {
  leads: Lead[];
  onInactiveCardClick: (days: number) => void;
}

type KpiColor = keyof typeof KPI_COLOR_MAP;

interface StatDef {
  label: string;
  value: number;
  fmt: 'n' | '%';
  color: KpiColor;
  icon: React.ElementType;
  tooltipKey: string;
  alignRight?: boolean;
  isClickable?: boolean;
  days?: number;
}

function buildStats(leads: Lead[]): StatDef[] {
  return [
    { label: 'Total Leads',            value: Calc.totalAssigned(leads),       fmt: 'n', color: 'blue',   icon: Users,          tooltipKey: 'totalLeads' },
    { label: 'Active Leads',           value: Calc.activeLeads(leads),          fmt: 'n', color: 'teal',   icon: Target,         tooltipKey: 'activeLeads' },
    { label: 'Enrolled',               value: Calc.enrolled(leads),             fmt: 'n', color: 'green',  icon: CheckCircle2,   tooltipKey: 'enrolled' },
    { label: 'Conversion Rate',        value: Calc.enrollmentRate(leads),       fmt: '%', color: 'purple', icon: TrendingUp,     tooltipKey: 'conversionRate', alignRight: true },
    { label: 'Follow-ups Due Today',   value: Calc.followupsDueToday(leads),    fmt: 'n', color: 'amber',  icon: Clock,          tooltipKey: 'followupsDueToday' },
    { label: 'Overdue Follow-ups',     value: Calc.overdueFollowups(leads),     fmt: 'n', color: 'red',    icon: AlertTriangle,  tooltipKey: 'overdueFollowups' },
    { label: 'Consultation Booked',    value: Calc.consultationBooked(leads),   fmt: 'n', color: 'cyan',   icon: BarChart3,      tooltipKey: 'consultationBooked' },
    { label: 'Applications Submitted', value: Calc.applicationsSubmitted(leads),fmt: 'n', color: 'indigo', icon: ClipboardCheck, tooltipKey: 'applicationsSubmitted' },
    { label: 'Unassigned Leads',       value: Calc.unassignedLeads(leads),      fmt: 'n', color: 'slate',  icon: UserX,          tooltipKey: 'unassignedLeads' },
    { label: 'Lost / Dead Leads',      value: Calc.lostLeads(leads),            fmt: 'n', color: 'stone',  icon: Ban,            tooltipKey: 'lostLeads', alignRight: true },
    { label: '30-Day Inactive',        value: Calc.inactiveLeads(leads, 30),    fmt: 'n', color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads30', isClickable: true, days: 30 },
    { label: '60-Day Inactive',        value: Calc.inactiveLeads(leads, 60),    fmt: 'n', color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads60', isClickable: true, days: 60 },
    { label: '90-Day Inactive',        value: Calc.inactiveLeads(leads, 90),    fmt: 'n', color: 'rose',   icon: Activity,       tooltipKey: 'inactiveLeads90', isClickable: true, days: 90, alignRight: true },
  ];
}

const BASE_CARD = 'ia-card p-5 flex flex-col select-none transition-all duration-200';

export function ExecutiveKpis({ leads, onInactiveCardClick }: ExecutiveKpisProps) {
  const stats = buildStats(leads);

  return (
    <motion.div
      variants={fadeStaggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const cs = KPI_COLOR_MAP[stat.color];
        const displayValue = stat.fmt === '%'
          ? `${stat.value.toFixed(1)}%`
          : stat.value.toLocaleString();

        const body = (
          <>
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cs.glow }}
              >
                <Icon className={`w-4 h-4 ${cs.icon}`} />
              </div>
              <Tooltip tooltipKey={stat.tooltipKey} alignRight={stat.alignRight} />
            </div>

            <div
              className="font-mono font-bold tracking-tight text-white leading-none"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {displayValue}
            </div>

            <div className="mt-2 text-[12px] font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>

            {stat.isClickable && (
              <div
                className="mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-semibold text-rose-400/80"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                Click to explore
              </div>
            )}
          </>
        );

        if (stat.isClickable) {
          return (
            <motion.button
              key={idx}
              variants={fadeSlideItem}
              onClick={() => onInactiveCardClick(stat.days!)}
              whileHover={{ y: -2 }}
              className={`${BASE_CARD} cursor-pointer text-left w-full`}
              style={{ background: 'var(--bg-card)' }}
            >
              {body}
            </motion.button>
          );
        }

        return (
          <motion.div
            key={idx}
            variants={fadeSlideItem}
            className={BASE_CARD}
            style={{ background: 'var(--bg-card)' }}
          >
            {body}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
