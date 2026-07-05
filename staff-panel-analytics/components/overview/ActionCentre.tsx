'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, RefreshCw, Star, BarChart3 } from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { Tooltip } from '@/components/ui/Tooltip';
import { Variants } from 'framer-motion';

interface ActionCentreProps {
  leads: Lead[];
}

export function ActionCentre({ leads }: ActionCentreProps) {
  const dueToday = Calc.followupsDueToday(leads);
  const overdue = Calc.overdueFollowups(leads);
  const callbacks = Calc.callbackRequests(leads);
  const hotLeads = Calc.hotLeads(leads);
  const consultations = Calc.consultationsScheduled(leads);

  const cards = [
    { label: 'Follow-ups Due Today', count: dueToday, desc: dueToday === 1 ? '1 follow-up scheduled for today' : `${dueToday} follow-ups scheduled for today`, color: 'amber', icon: Clock, tooltipKey: 'followupsDueToday' },
    { label: 'Overdue Follow-ups', count: overdue, desc: overdue === 1 ? '1 follow-up past its due date' : `${overdue} follow-ups past their due date`, color: 'red', icon: AlertTriangle, tooltipKey: 'overdueFollowups' },
    { label: 'Callback Requests', count: callbacks, desc: callbacks === 1 ? '1 lead requested a callback' : `${callbacks} leads requested a callback`, color: 'purple', icon: RefreshCw, tooltipKey: 'callbackRequests' },
    { label: 'Hot Leads', count: hotLeads, desc: hotLeads === 1 ? '1 hot lead ready for contact' : `${hotLeads} hot leads ready for contact`, color: 'pink', icon: Star, tooltipKey: 'hotLeads' },
    { label: 'Consultations Scheduled', count: consultations, desc: consultations === 1 ? '1 consultation scheduled' : `${consultations} consultations scheduled`, color: 'cyan', icon: BarChart3, tooltipKey: 'consultationsScheduled', alignRight: true }
  ];

  const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-l-amber-500 hover:border-amber-500/40' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-l-red-500 hover:border-red-500/40' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-l-purple-500 hover:border-purple-500/40' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-l-pink-500 hover:border-pink-500/40' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-l-cyan-500 hover:border-cyan-500/40' }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const colors = colorStyles[card.color];
        return (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className={`p-4 bg-slate-900/40 border border-slate-800/60 border-l-4 ${colors.border} rounded-r-xl rounded-l shadow-sm flex flex-col justify-between h-[150px] transition-all duration-200`}
          >
            <div className="flex justify-between items-start">
              <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                <Icon className="w-4 h-4" />
              </div>
              <Tooltip tooltipKey={card.tooltipKey} alignRight={card.alignRight} />
            </div>
            
            <div className="mt-3">
              <div className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono select-all">
                {card.count}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none mt-1">
                {card.label}
              </div>
              <p className="text-[9px] text-slate-500 select-none mt-1 leading-relaxed truncate">
                {card.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
