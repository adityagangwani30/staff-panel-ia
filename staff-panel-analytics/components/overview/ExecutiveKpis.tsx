'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  ClipboardCheck, 
  UserX, 
  Ban,
  Activity
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { Tooltip } from '@/components/ui/Tooltip';

interface ExecutiveKpisProps {
  leads: Lead[];
  onInactiveCardClick: (days: number) => void;
}

export function ExecutiveKpis({ leads, onInactiveCardClick }: ExecutiveKpisProps) {
  const stats = [
    { label: 'Total Leads', value: Calc.totalAssigned(leads), color: 'blue', icon: Users, tooltipKey: 'totalLeads' },
    { label: 'Active Leads', value: Calc.activeLeads(leads), color: 'teal', icon: Target, tooltipKey: 'activeLeads' },
    { label: 'Enrolled', value: Calc.enrolled(leads), color: 'green', icon: CheckCircle2, tooltipKey: 'enrolled' },
    { label: 'Overall Conversion Rate', value: Calc.enrollmentRate(leads), isPct: true, color: 'purple', icon: TrendingUp, tooltipKey: 'conversionRate' },
    { label: 'Follow-ups Due Today', value: Calc.followupsDueToday(leads), color: 'amber', icon: Clock, tooltipKey: 'followupsDueToday', alignRight: true },
    { label: 'Overdue Follow-ups', value: Calc.overdueFollowups(leads), color: 'red', icon: AlertTriangle, tooltipKey: 'overdueFollowups' },
    { label: 'Consultation Booked', value: Calc.consultationBooked(leads), color: 'cyan', icon: BarChart3, tooltipKey: 'consultationBooked' },
    { label: 'Applications Submitted', value: Calc.applicationsSubmitted(leads), color: 'indigo', icon: ClipboardCheck, tooltipKey: 'applicationsSubmitted' },
    { label: 'Unassigned Leads', value: Calc.unassignedLeads(leads), color: 'slate', icon: UserX, tooltipKey: 'unassignedLeads' },
    { label: 'Lost / Dead Leads', value: Calc.lostLeads(leads), color: 'stone', icon: Ban, tooltipKey: 'lostLeads', alignRight: true },
    { label: '30-Day Inactive Leads', value: Calc.inactiveLeads30(leads), color: 'rose', icon: Activity, tooltipKey: 'inactiveLeads30', isClickable: true, days: 30 },
    { label: '60-Day Inactive Leads', value: Calc.inactiveLeads60(leads), color: 'rose', icon: Activity, tooltipKey: 'inactiveLeads60', isClickable: true, days: 60 },
    { label: '90-Day Inactive Leads', value: Calc.inactiveLeads90(leads), color: 'rose', icon: Activity, tooltipKey: 'inactiveLeads90', alignRight: true, isClickable: true, days: 90 }
  ];

  const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'hover:border-blue-500/30' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'hover:border-teal-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'hover:border-green-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'hover:border-purple-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'hover:border-amber-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'hover:border-red-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'hover:border-cyan-500/30' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'hover:border-indigo-500/30' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'hover:border-slate-500/30' },
    stone: { bg: 'bg-stone-500/10', text: 'text-stone-400', border: 'hover:border-stone-500/30' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'hover:border-rose-500/30 hover:border-red-500/35' }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colors = colorStyles[stat.color] || colorStyles.slate;
        const valueStr = stat.isPct 
          ? `${stat.value.toFixed(1)}%` 
          : stat.value.toLocaleString();

        const cardContent = (
          <div className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                <Icon className="w-4 h-4" />
              </div>
              <Tooltip tooltipKey={stat.tooltipKey} alignRight={stat.alignRight} />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                {stat.label}
              </div>
              <div className="text-xl font-extrabold tracking-tight text-slate-100 font-mono">
                {valueStr}
              </div>
            </div>

            {stat.isClickable ? (
              <div className="text-[9px] text-red-400/80 font-semibold flex items-center gap-1 select-none border-t border-slate-800/40 pt-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                Click to explore logs
              </div>
            ) : (
              <div className="h-4 mt-1.5" />
            )}
          </div>
        );

        if (stat.isClickable) {
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              onClick={() => onInactiveCardClick(stat.days)}
              whileHover={{ y: -2 }}
              className={`p-4 bg-slate-900/45 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 select-none flex flex-col h-[132px] ${colors.border}`}
            >
              {cardContent}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={`p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm flex flex-col h-[132px] hover:border-slate-800 transition-all duration-200 ${colors.border}`}
          >
            {cardContent}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
