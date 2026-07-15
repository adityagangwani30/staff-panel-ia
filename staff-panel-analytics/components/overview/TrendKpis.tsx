'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Phone, Zap } from 'lucide-react';
import { KPI_COLOR_MAP, fadeStaggerContainer, fadeSlideItem } from '@/lib/ui';
import { KpiMetricSummary } from '@/lib/trendCalculations';

interface TrendKpisProps {
  summaries: {
    newLeads: KpiMetricSummary;
    conversionRate: KpiMetricSummary;
    callsMade: KpiMetricSummary;
    staffActivity: KpiMetricSummary;
  };
  dateRange: string;
}

const BASE_CARD = 'ia-card p-5 flex flex-col select-none transition-all duration-200 group text-left w-full relative overflow-hidden';

export function TrendKpis({ summaries, dateRange }: TrendKpisProps) {
  // Format comparison description text
  let comparisonLabel = 'Compared to Previous Period';
  if (dateRange === '7d') comparisonLabel = 'Compared to Previous 7 Days';
  else if (dateRange === '30d') comparisonLabel = 'Compared to Previous 30 Days';
  else if (dateRange === '90d') comparisonLabel = 'Compared to Previous 90 Days';
  else if (dateRange === '12m') comparisonLabel = 'Compared to Previous 12 Months';

  const cards = [
    {
      label: 'New Leads Trend',
      value: summaries.newLeads.current.toLocaleString(),
      metric: summaries.newLeads,
      color: 'blue',
      icon: Users,
      isPercentage: false,
    },
    {
      label: 'Lead Conversion Rate Trend',
      value: `${summaries.conversionRate.current.toFixed(1)}%`,
      metric: summaries.conversionRate,
      color: 'purple',
      icon: TrendingUp,
      isPercentage: true,
    },
    {
      label: 'Calls Made Trend',
      value: summaries.callsMade.current.toLocaleString(),
      metric: summaries.callsMade,
      color: 'amber',
      icon: Phone,
      isPercentage: false,
    },
    {
      label: 'Staff Activity Trend',
      value: summaries.staffActivity.current.toLocaleString(),
      metric: summaries.staffActivity,
      color: 'green',
      icon: Zap,
      isPercentage: false,
    },
  ];

  return (
    <motion.div
      variants={fadeStaggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const cs = KPI_COLOR_MAP[card.color];
        const { pctChange, isPositive } = card.metric;

        // Custom formatting for percentage changes
        const changeText = pctChange === 0
          ? '0%'
          : `${isPositive ? '▲' : '▼'} ${Math.abs(pctChange).toFixed(1)}%`;

        const badgeColor = pctChange === 0
          ? 'rgba(113,113,122,0.1)'
          : isPositive
            ? 'rgba(34,197,94,0.1)'
            : 'rgba(239,68,68,0.1)';

        const badgeTextColor = pctChange === 0
          ? 'var(--text-secondary)'
          : isPositive
            ? '#4ADE80'
            : '#F87171';

        return (
          <motion.div
            key={idx}
            variants={fadeSlideItem}
            whileHover={{ y: -2 }}
            className={BASE_CARD}
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Top Row: Icon puck */}
            <div className="flex items-center justify-between mb-4 w-full">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cs.glow }}
              >
                <Icon className={`w-5 h-5 ${cs.icon}`} />
              </div>

              {/* Comparison indicator */}
              <div
                className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-tight"
                style={{ background: badgeColor, color: badgeTextColor }}
              >
                {changeText}
              </div>
            </div>

            {/* Value */}
            <div
              className="font-mono font-bold tracking-tight text-white leading-none"
              style={{ fontSize: 'clamp(28px, 3.5vw, 36px)' }}
            >
              {card.value}
            </div>

            {/* Label */}
            <div className="mt-2 text-[13px] font-semibold text-white">
              {card.label}
            </div>

            {/* Comparison description */}
            <div
              className="mt-3 pt-3 border-t text-[11px] font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {comparisonLabel}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
