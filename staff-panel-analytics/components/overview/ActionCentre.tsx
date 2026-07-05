'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, Star, CalendarCheck } from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { Tooltip } from '@/components/ui/Tooltip';

interface ActionCentreProps {
  leads: Lead[];
}

type ActionCard = {
  label: string;
  count: number;
  sub: string;
  accentColor: string;
  accentBg: string;
  icon: React.ElementType;
  tooltipKey: string;
  alignRight?: boolean;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

export function ActionCentre({ leads }: ActionCentreProps) {
  const dueToday     = Calc.followupsDueToday(leads);
  const overdue      = Calc.overdueFollowups(leads);
  const callbacks    = Calc.callbackRequests(leads);
  const hotLeads     = Calc.hotLeads(leads);
  const consultations= Calc.consultationBooked(leads);

  const cards: ActionCard[] = [
    {
      label: 'Follow-ups Due Today',
      count: dueToday,
      sub: dueToday === 1 ? 'scheduled for today' : 'scheduled for today',
      accentColor: '#F59E0B',
      accentBg: 'rgba(245,158,11,0.08)',
      icon: Clock,
      tooltipKey: 'followupsDueToday',
    },
    {
      label: 'Overdue Follow-ups',
      count: overdue,
      sub: 'past their due date',
      accentColor: '#EF4444',
      accentBg: 'rgba(239,68,68,0.08)',
      icon: AlertTriangle,
      tooltipKey: 'overdueFollowups',
    },
    {
      label: 'Callback Requests',
      count: callbacks,
      sub: 'leads requested callback',
      accentColor: '#8B5CF6',
      accentBg: 'rgba(139,92,246,0.08)',
      icon: RefreshCw,
      tooltipKey: 'callbackRequests',
    },
    {
      label: 'Hot Leads',
      count: hotLeads,
      sub: 'ready for immediate contact',
      accentColor: '#F97316',
      accentBg: 'rgba(249,115,22,0.08)',
      icon: Star,
      tooltipKey: 'hotLeads',
    },
    {
      label: 'Consultations Scheduled',
      count: consultations,
      sub: 'in the pipeline',
      accentColor: '#06B6D4',
      accentBg: 'rgba(6,182,212,0.08)',
      icon: CalendarCheck,
      tooltipKey: 'consultationsScheduled',
      alignRight: true,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -2 }}
            className="ia-card p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Accent top line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
              style={{ background: card.accentColor }}
            />

            {/* Icon + tooltip */}
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.accentBg }}
              >
                <Icon className="w-4 h-4" style={{ color: card.accentColor }} />
              </div>
              <Tooltip tooltipKey={card.tooltipKey} alignRight={card.alignRight} />
            </div>

            {/* Count */}
            <div>
              <div
                className="font-mono font-bold leading-none"
                style={{ fontSize: 'clamp(32px, 5vw, 44px)', color: card.accentColor }}
              >
                {card.count}
              </div>
              <div className="mt-1.5 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {card.label}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {card.count === 1 ? `1 ${card.sub}` : `${card.count} ${card.sub}`}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
