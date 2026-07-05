'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock, AlertTriangle, Star,
} from 'lucide-react';
import { Lead, StaffMember } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';

interface StaffAnalyticsProps {
  allLeads: Lead[];
  staffList: StaffMember[];
}

/* ─── Color tokens ───────────────────────────────────────────────────── */
const KPI_COLORS: Record<string, { icon: string; glow: string }> = {
  blue:   { icon: 'text-blue-400',   glow: 'rgba(59,130,246,0.08)'  },
  teal:   { icon: 'text-teal-400',   glow: 'rgba(20,184,166,0.08)'  },
  green:  { icon: 'text-green-400',  glow: 'rgba(34,197,94,0.08)'   },
  purple: { icon: 'text-purple-400', glow: 'rgba(139,92,246,0.08)'  },
  amber:  { icon: 'text-amber-400',  glow: 'rgba(245,158,11,0.08)'  },
  red:    { icon: 'text-red-400',    glow: 'rgba(239,68,68,0.08)'   },
  pink:   { icon: 'text-pink-400',   glow: 'rgba(236,72,153,0.08)'  },
  slate:  { icon: 'text-slate-400',  glow: 'rgba(100,116,139,0.06)' },
};

const DONUT_COLORS = [
  '#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444',
  '#06B6D4','#F97316','#14B8A6','#EC4899','#64748B',
];

const FUNNEL_COLORS = ['#3B82F6','#6366F1','#8B5CF6','#A855F7','#06B6D4','#14B8A6','#22C55E'];

/* ─── Animation ───────────────────────────────────────────────────────── */
const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const card: Variants     = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 24 } } };

/* ─── Custom donut tooltip ────────────────────────────────────────────── */
const DonutTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-[12px] shadow-xl"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <div className="font-semibold">{payload[0].name}</div>
      <div style={{ color: 'var(--text-muted)' }}>{payload[0].value} leads</div>
    </div>
  );
};

/* ─── Component ──────────────────────────────────────────────────────── */
export function StaffAnalytics({ allLeads, staffList }: StaffAnalyticsProps) {
  const [selectedStaffId, setSelectedStaffId] = useState('all');

  /* Resolve scope */
  const getReportIds = (id: string): string[] => {
    const ids = [id];
    staffList.filter(s => s.reportsTo === id).forEach(dr => ids.push(...getReportIds(dr.id)));
    return ids;
  };

  const staffLeads = useMemo(() => {
    if (selectedStaffId === 'all') return allLeads;
    const s = staffList.find(x => x.id === selectedStaffId);
    if (!s) return [];
    if (s.role === 'Founder') return allLeads;
    if (s.role === 'BranchManager') return allLeads.filter(l => l.sourceCentre === s.sourceCentre);
    if (s.role === 'TeamLead') {
      const ids = getReportIds(selectedStaffId);
      return allLeads.filter(l => ids.includes(l.counsellorId));
    }
    return allLeads.filter(l => l.counsellorId === selectedStaffId);
  }, [selectedStaffId, allLeads, staffList]);

  /* Staff groups for select */
  const groups = useMemo(() => ({
    managers:   staffList.filter(s => s.role === 'BranchManager'),
    leads:      staffList.filter(s => s.role === 'TeamLead'),
    counsellors:staffList.filter(s => s.role === 'Counsellor'),
  }), [staffList]);

  /* KPI values */
  const activeLeads = Calc.activeLeads(staffLeads);
  const enrolled    = Calc.enrolled(staffLeads);
  const convRate    = Calc.enrollmentRate(staffLeads);
  const dueToday    = Calc.followupsDueToday(staffLeads);
  const overdue     = Calc.overdueFollowups(staffLeads);
  const hotLeads    = Calc.hotLeads(staffLeads);
  const delay       = Calc.averageFollowupDelay(staffLeads);

  const kpiCards = [
    { label: 'Assigned Leads',         value: staffLeads.length,   fmt: 'n', color: 'blue',   icon: Users,         tooltipKey: 'assignedLeads' },
    { label: 'Active Leads',           value: activeLeads,          fmt: 'n', color: 'teal',   icon: Target,        tooltipKey: 'activeLeads' },
    { label: 'Enrolled',               value: enrolled,             fmt: 'n', color: 'green',  icon: CheckCircle2,  tooltipKey: 'enrolled' },
    { label: 'Conversion Rate',        value: convRate,             fmt: '%', color: 'purple', icon: TrendingUp,    tooltipKey: 'conversionRate', alignRight: true },
    { label: 'Follow-ups Due Today',   value: dueToday,             fmt: 'n', color: 'amber',  icon: Clock,         tooltipKey: 'followupsDueToday' },
    { label: 'Overdue Follow-ups',     value: overdue,              fmt: 'n', color: 'red',    icon: AlertTriangle, tooltipKey: 'overdueFollowups' },
    { label: 'Hot Leads',              value: hotLeads,             fmt: 'n', color: 'pink',   icon: Star,          tooltipKey: 'hotLeads' },
    { label: 'Avg Follow-up Delay',    value: delay,                fmt: 'd', color: 'slate',  icon: Clock,         tooltipKey: 'averageFollowupDelay', alignRight: true },
  ];

  /* Donut data */
  const donutData = useMemo(() => {
    const dist = Calc.statusDistribution(staffLeads);
    return dist.filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((d, i) => ({ name: d.status, value: d.count, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  }, [staffLeads]);

  /* Funnel data */
  const funnelStages = Calc.pipelineStages(staffLeads);
  const funnelMax    = funnelStages[0]?.count || 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-white">Staff Performance Analytics</h2>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Scoped metrics — select a staff member to drill down
          </p>
        </div>
        <Select
          value={selectedStaffId}
          onChange={e => setSelectedStaffId(e.target.value)}
          className="min-w-[220px]"
        >
          <option value="all">All Staff (Organisation)</option>
          <optgroup label="Branch Managers">
            {groups.managers.map(s => <option key={s.id} value={s.id}>{s.name} — {s.sourceCentre}</option>)}
          </optgroup>
          <optgroup label="Team Leads">
            {groups.leads.map(s => <option key={s.id} value={s.id}>{s.name} — {s.sourceCentre}</option>)}
          </optgroup>
          <optgroup label="Counsellors">
            {groups.counsellors.map(s => <option key={s.id} value={s.id}>{s.name} — {s.sourceCentre}</option>)}
          </optgroup>
        </Select>
      </div>

      {/* ── Empty state ── */}
      {staffLeads.length === 0 ? (
        <div className="ia-card p-12 text-center text-[13px]" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          No leads assigned under this staff member scope.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={selectedStaffId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }} className="space-y-6">

            {/* ── KPI Cards ── */}
            <motion.div variants={container} initial="hidden" animate="show"
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {kpiCards.map((k, idx) => {
                const Icon = k.icon;
                const cs = KPI_COLORS[k.color];
                const displayVal = k.fmt === '%' ? `${k.value.toFixed(1)}%`
                  : k.fmt === 'd' ? `${k.value.toFixed(1)}d`
                  : k.value.toLocaleString();
                return (
                  <motion.div key={idx} variants={card}
                              className="ia-card p-5 flex flex-col gap-3" style={{ background: 'var(--bg-card)' }}>
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: cs.glow }}>
                        <Icon className={`w-4 h-4 ${cs.icon}`} />
                      </div>
                      <Tooltip tooltipKey={k.tooltipKey} alignRight={k.alignRight} />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white" style={{ fontSize: 28 }}>{displayVal}</div>
                      <div className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{k.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Personal Funnel + Donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Funnel bars */}
              <div className="ia-card p-6 lg:col-span-2 space-y-4" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Personal Pipeline
                </div>
                {funnelStages.map((stage, idx) => {
                  const pct = funnelMax ? (stage.count / funnelMax) * 100 : 0;
                  const color = FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {stage.stage}
                        </span>
                        <span className="font-mono text-[12px] font-semibold text-white">
                          {stage.count}
                          <span className="ml-2 text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                            {idx === 0 ? '100%' : `${pct.toFixed(0)}%`}
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, stage.count > 0 ? 2 : 0)}%` }}
                          transition={{ duration: 0.65, ease: 'easeOut', delay: idx * 0.04 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Donut */}
              <div className="ia-card p-6 flex flex-col" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                  Status Distribution
                </div>
                {donutData.length > 0 ? (
                  <>
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={46} outerRadius={62}
                               paddingAngle={2} dataKey="value" strokeWidth={0}>
                            {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <RTooltip content={<DonutTip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <span className="font-mono font-bold text-white" style={{ fontSize: 22 }}>{activeLeads}</span>
                        <span className="text-[9px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Active</span>
                      </div>
                    </div>
                    {/* Mini legend */}
                    <div className="mt-4 space-y-1.5 overflow-y-auto max-h-[120px]">
                      {donutData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                          </div>
                          <span className="font-mono font-semibold text-white">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    No data
                  </div>
                )}
              </div>
            </div>

            {/* ── Performance Summary Table ── */}
            <div className="ia-card p-6" style={{ background: 'var(--bg-card)' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                Performance Summary
              </div>
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="pb-3 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Metric</th>
                    <th className="pb-3 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Assigned Leads',       val: staffLeads.length,                              fmt: 'n', color: 'white',   tip: 'assignedLeads' },
                    { label: 'Calls Made',            val: staffLeads.filter(l => l.calls > 0).length,    fmt: 'n', color: '#22C55E', tip: 'staffCompletedFollowups' },
                    { label: 'Pending Follow-ups',    val: Calc.pendingFollowups(staffLeads),              fmt: 'n', color: '#F59E0B', tip: 'staffPendingFollowups' },
                    { label: 'Overdue Follow-ups',    val: Calc.overdueFollowups(staffLeads),              fmt: 'n', color: '#EF4444', tip: 'overdueFollowups' },
                    { label: 'Enrolled',              val: enrolled,                                       fmt: 'n', color: '#22C55E', tip: 'enrolled' },
                    { label: 'Conversion Rate',       val: convRate,                                       fmt: '%', color: '#8B5CF6', tip: 'conversionRate' },
                    { label: 'Avg Follow-up Delay',   val: delay,                                          fmt: 'd', color: '#A1A1AA', tip: 'averageFollowupDelay' },
                  ].map((r, i) => {
                    const display = r.fmt === '%' ? `${r.val.toFixed(1)}%`
                      : r.fmt === 'd' ? `${r.val.toFixed(1)} days`
                      : r.val.toLocaleString();
                    return (
                      <tr key={i} className="hover:bg-white/[0.025] transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-3 font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                          {r.label}
                          <Tooltip tooltipKey={r.tip} />
                        </td>
                        <td className="py-3 text-right font-mono font-semibold" style={{ color: r.color }}>{display}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
