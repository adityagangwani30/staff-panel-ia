'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock, AlertTriangle, Star,
} from 'lucide-react';
import { Lead, StaffMember } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { formatMetric, type MetricFmt } from '@/lib/utils';
import { KPI_COLOR_MAP, CHART_PALETTE, FUNNEL_PALETTE, fadeStaggerContainer, fadeCardItem } from '@/lib/ui';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { DonutTooltip } from '@/components/shared/ChartTooltip';

interface StaffAnalyticsProps {
  allLeads: Lead[];
  staffList: StaffMember[];
}

interface KpiCardDef {
  label: string;
  value: number;
  fmt: MetricFmt;
  color: keyof typeof KPI_COLOR_MAP;
  icon: React.ElementType;
  tooltipKey: string;
  alignRight?: boolean;
}

/** Recursively collect IDs of all staff reporting to the given ID. */
function getReportIds(id: string, staffList: StaffMember[]): string[] {
  const ids = [id];
  staffList.filter(s => s.reportsTo === id).forEach(dr => ids.push(...getReportIds(dr.id, staffList)));
  return ids;
}

export function StaffAnalytics({ allLeads, staffList }: StaffAnalyticsProps) {
  const [selectedStaffId, setSelectedStaffId] = useState('all');

  /* ── Scoped leads ── */
  const staffLeads = useMemo(() => {
    if (selectedStaffId === 'all') return allLeads;
    const member = staffList.find(x => x.id === selectedStaffId);
    if (!member) return [];
    if (member.role === 'Founder') return allLeads;
    if (member.role === 'BranchManager')
      return allLeads.filter(l => l.sourceCentre === member.sourceCentre);
    if (member.role === 'TeamLead') {
      const ids = getReportIds(selectedStaffId, staffList);
      return allLeads.filter(l => ids.includes(l.counsellorId));
    }
    return allLeads.filter(l => l.counsellorId === selectedStaffId);
  }, [selectedStaffId, allLeads, staffList]);

  /* ── Staff groups ── */
  const groups = useMemo(() => ({
    managers:    staffList.filter(s => s.role === 'BranchManager'),
    leads:       staffList.filter(s => s.role === 'TeamLead'),
    counsellors: staffList.filter(s => s.role === 'Counsellor'),
  }), [staffList]);

  /* ── KPI values ── */
  const activeLeads = Calc.activeLeads(staffLeads);
  const enrolled    = Calc.enrolled(staffLeads);
  const convRate    = Calc.enrollmentRate(staffLeads);
  const dueToday    = Calc.followupsDueToday(staffLeads);
  const overdue     = Calc.overdueFollowups(staffLeads);
  const hotLeads    = Calc.hotLeads(staffLeads);
  const delay       = Calc.averageFollowupDelay(staffLeads);

  const kpiCards: KpiCardDef[] = [
    { label: 'Assigned Leads',       value: staffLeads.length, fmt: 'n', color: 'blue',   icon: Users,         tooltipKey: 'assignedLeads' },
    { label: 'Active Leads',         value: activeLeads,       fmt: 'n', color: 'teal',   icon: Target,        tooltipKey: 'activeLeads' },
    { label: 'Enrolled',             value: enrolled,          fmt: 'n', color: 'green',  icon: CheckCircle2,  tooltipKey: 'enrolled' },
    { label: 'Conversion Rate',      value: convRate,          fmt: '%', color: 'purple', icon: TrendingUp,    tooltipKey: 'conversionRate', alignRight: true },
    { label: 'Follow-ups Due Today', value: dueToday,          fmt: 'n', color: 'amber',  icon: Clock,         tooltipKey: 'followupsDueToday' },
    { label: 'Overdue Follow-ups',   value: overdue,           fmt: 'n', color: 'red',    icon: AlertTriangle, tooltipKey: 'overdueFollowups' },
    { label: 'Hot Leads',            value: hotLeads,          fmt: 'n', color: 'pink',   icon: Star,          tooltipKey: 'hotLeads' },
    { label: 'Avg Follow-up Delay',  value: delay,             fmt: 'd', color: 'slate',  icon: Clock,         tooltipKey: 'averageFollowupDelay', alignRight: true },
  ];

  /* ── Donut data ── */
  const donutData = useMemo(() =>
    Calc.statusDistribution(staffLeads)
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((d, i) => ({ name: d.status, value: d.count, color: CHART_PALETTE[i % CHART_PALETTE.length] })),
    [staffLeads],
  );

  /* ── Funnel data ── */
  const funnelStages = useMemo(() => Calc.pipelineStages(staffLeads), [staffLeads]);
  const funnelMax = funnelStages[0]?.count ?? 0;

  /* ── Performance table rows ── */
  const perfRows: Array<{ label: string; value: number; fmt: MetricFmt; color: string; tip: string }> = [
    { label: 'Assigned Leads',     value: staffLeads.length,                           fmt: 'n', color: 'white',   tip: 'assignedLeads' },
    { label: 'Calls Made',         value: staffLeads.filter(l => l.calls > 0).length,  fmt: 'n', color: '#22C55E', tip: 'staffCompletedFollowups' },
    { label: 'Pending Follow-ups', value: Calc.pendingFollowups(staffLeads),            fmt: 'n', color: '#F59E0B', tip: 'staffPendingFollowups' },
    { label: 'Overdue Follow-ups', value: overdue,                                     fmt: 'n', color: '#EF4444', tip: 'overdueFollowups' },
    { label: 'Enrolled',           value: enrolled,                                    fmt: 'n', color: '#22C55E', tip: 'enrolled' },
    { label: 'Conversion Rate',    value: convRate,                                    fmt: '%', color: '#8B5CF6', tip: 'conversionRate' },
    { label: 'Avg Follow-up Delay',value: delay,                                      fmt: 'd', color: '#A1A1AA', tip: 'averageFollowupDelay' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
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

      {/* Empty state */}
      {staffLeads.length === 0 ? (
        <div className="ia-card p-12 text-center text-[13px]"
             style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          No leads assigned under this staff member scope.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStaffId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >

            {/* KPI Cards */}
            <motion.div
              variants={fadeStaggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {kpiCards.map((k, idx) => {
                const Icon = k.icon;
                const cs = KPI_COLOR_MAP[k.color];
                return (
                  <motion.div
                    key={idx}
                    variants={fadeCardItem}
                    className="ia-card p-5 flex flex-col gap-3"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: cs.glow }}>
                        <Icon className={`w-4 h-4 ${cs.icon}`} />
                      </div>
                      <Tooltip tooltipKey={k.tooltipKey} alignRight={k.alignRight} />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white" style={{ fontSize: 28 }}>
                        {formatMetric(k.value, k.fmt)}
                      </div>
                      <div className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {k.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Personal Funnel + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Funnel bars */}
              <div className="ia-card p-6 lg:col-span-2 space-y-4" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Personal Pipeline
                </div>
                {funnelStages.map((stage, idx) => {
                  const pct = funnelMax ? (stage.count / funnelMax) * 100 : 0;
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
                          style={{ background: FUNNEL_PALETTE[idx % FUNNEL_PALETTE.length] }}
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
                          <RTooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <span className="font-mono font-bold text-white" style={{ fontSize: 22 }}>{activeLeads}</span>
                        <span className="text-[9px] font-semibold mt-0.5 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Active</span>
                      </div>
                    </div>
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

            {/* Performance Summary Table */}
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
                  {perfRows.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.025] transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          {r.label}
                          <Tooltip tooltipKey={r.tip} />
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold" style={{ color: r.color }}>
                        {formatMetric(r.value, r.fmt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
