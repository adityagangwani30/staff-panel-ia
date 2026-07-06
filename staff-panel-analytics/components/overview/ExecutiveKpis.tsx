'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock,
  AlertTriangle, BarChart3, ClipboardCheck, UserX, Ban, Activity,
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { KPI_COLOR_MAP, fadeStaggerContainer, fadeSlideItem } from '@/lib/ui';
import { exploreLeads, toMidnight, MS_PER_DAY } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface ExecutiveKpisProps {
  leads: Lead[];
  onExplore: (title: string, leads: Lead[]) => void;
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
  filterFn: (l: Lead) => boolean;
}

function buildStats(leads: Lead[]): StatDef[] {
  const today = CFG.today;
  const midnight = toMidnight(today);

  return [
    {
      label: 'Total Leads',
      value: Calc.totalAssigned(leads),
      fmt: 'n',
      color: 'blue',
      icon: Users,
      tooltipKey: 'totalLeads',
      filterFn: () => true,
    },
    {
      label: 'Active Leads',
      value: Calc.activeLeads(leads),
      fmt: 'n',
      color: 'teal',
      icon: Target,
      tooltipKey: 'activeLeads',
      filterFn: l => Calc._isActive(l),
    },
    {
      label: 'Enrolled',
      value: Calc.enrolled(leads),
      fmt: 'n',
      color: 'green',
      icon: CheckCircle2,
      tooltipKey: 'enrolled',
      filterFn: l => Calc._isEnrolled(l),
    },
    {
      label: 'Conversion Rate',
      value: Calc.enrollmentRate(leads),
      fmt: '%',
      color: 'purple',
      icon: TrendingUp,
      tooltipKey: 'conversionRate',
      alignRight: true,
      filterFn: l => Calc._isEnrolled(l),
    },
    {
      label: 'Follow-ups Due Today',
      value: Calc.followupsDueToday(leads),
      fmt: 'n',
      color: 'amber',
      icon: Clock,
      tooltipKey: 'followupsDueToday',
      filterFn: l => !!l.followUpDate && new Date(l.followUpDate).toDateString() === today.toDateString(),
    },
    {
      label: 'Overdue Follow-ups',
      value: Calc.overdueFollowups(leads),
      fmt: 'n',
      color: 'red',
      icon: AlertTriangle,
      tooltipKey: 'overdueFollowups',
      filterFn: l => !!l.followUpDate && new Date(l.followUpDate) < midnight && Calc._isActive(l),
    },
    {
      label: 'Consultation Booked',
      value: Calc.consultationBooked(leads),
      fmt: 'n',
      color: 'cyan',
      icon: BarChart3,
      tooltipKey: 'consultationBooked',
      filterFn: l => l.status === 'Consultation Booked' && Calc._isActive(l),
    },
    {
      label: 'Applications Submitted',
      value: Calc.applicationsSubmitted(leads),
      fmt: 'n',
      color: 'indigo',
      icon: ClipboardCheck,
      tooltipKey: 'applicationsSubmitted',
      filterFn: l => l.status === 'Applied' && Calc._isActive(l),
    },
    {
      label: 'Unassigned Leads',
      value: Calc.unassignedLeads(leads),
      fmt: 'n',
      color: 'slate',
      icon: UserX,
      tooltipKey: 'unassignedLeads',
      filterFn: l => !l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorId === 'CS-UNASSIGNED',
    },
    {
      label: 'Lost / Dead Leads',
      value: Calc.lostLeads(leads),
      fmt: 'n',
      color: 'stone',
      icon: Ban,
      tooltipKey: 'lostLeads',
      alignRight: true,
      filterFn: l => Calc._isLost(l),
    },
    {
      label: '30-Day Inactive',
      value: Calc.inactiveLeads(leads, 30),
      fmt: 'n',
      color: 'rose',
      icon: Activity,
      tooltipKey: 'inactiveLeads30',
      filterFn: l => {
        const last = Calc.getLastActivityDate(l);
        return !!last && last <= new Date(midnight.getTime() - 30 * MS_PER_DAY) && Calc._isActive(l);
      },
    },
    {
      label: '60-Day Inactive',
      value: Calc.inactiveLeads(leads, 60),
      fmt: 'n',
      color: 'rose',
      icon: Activity,
      tooltipKey: 'inactiveLeads60',
      filterFn: l => {
        const last = Calc.getLastActivityDate(l);
        return !!last && last <= new Date(midnight.getTime() - 60 * MS_PER_DAY) && Calc._isActive(l);
      },
    },
    {
      label: '90-Day Inactive',
      value: Calc.inactiveLeads(leads, 90),
      fmt: 'n',
      color: 'rose',
      icon: Activity,
      tooltipKey: 'inactiveLeads90',
      alignRight: true,
      filterFn: l => {
        const last = Calc.getLastActivityDate(l);
        return !!last && last <= new Date(midnight.getTime() - 90 * MS_PER_DAY) && Calc._isActive(l);
      },
    },
  ];
}

const BASE_CARD = 'ia-card p-5 flex flex-col select-none transition-all duration-200 group text-left w-full cursor-pointer';

export function ExecutiveKpis({ leads, onExplore }: ExecutiveKpisProps) {
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

        return (
          <motion.button
            key={idx}
            variants={fadeSlideItem}
            onClick={() => exploreLeads(onExplore, stat.label, leads.filter(stat.filterFn))}
            whileHover={{ y: -2 }}
            className={BASE_CARD}
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Top row — icon + tooltip */}
            <div className="flex items-center justify-between mb-4 w-full">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cs.glow }}
              >
                <Icon className={`w-4 h-4 ${cs.icon}`} />
              </div>
              <Tooltip tooltipKey={stat.tooltipKey} alignRight={stat.alignRight} />
            </div>

            {/* Value */}
            <div
              className="font-mono font-bold tracking-tight text-white leading-none"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
            >
              {displayValue}
            </div>

            {/* Label */}
            <div className="mt-2 text-[12px] font-medium leading-snug flex-grow" style={{ color: 'var(--text-secondary)' }}>
              {stat.label}
            </div>

            {/* Clickable indicator */}
            <div
              className="mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-semibold transition-colors duration-200 w-full"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/40 group-hover:bg-blue-400 transition-colors duration-200" />
              <span className="group-hover:text-blue-400 transition-colors duration-200">Click to explore</span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
