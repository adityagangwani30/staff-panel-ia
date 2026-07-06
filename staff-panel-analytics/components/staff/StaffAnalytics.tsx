'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts';
import {
  Users, Target, CheckCircle2, TrendingUp, Clock, AlertTriangle, Star,
} from 'lucide-react';
import { Lead, StaffMember } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { formatMetric, type MetricFmt, exploreLeads, toMidnight, MS_PER_DAY } from '@/lib/utils';
import { KPI_COLOR_MAP, CHART_PALETTE, FUNNEL_PALETTE, fadeStaggerContainer, fadeCardItem } from '@/lib/ui';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { DonutTooltip } from '@/components/shared/ChartTooltip';

interface StaffAnalyticsProps {
  allLeads: Lead[];
  staffList: StaffMember[];
  onExplore: (title: string, leads: Lead[]) => void;
}

interface KpiCardDef {
  label: string;
  value: number;
  fmt: MetricFmt;
  color: keyof typeof KPI_COLOR_MAP;
  icon: React.ElementType;
  tooltipKey: string;
  alignRight?: boolean;
  filterFn: (l: Lead) => boolean;
}

function getReportIds(id: string, staffList: StaffMember[]): string[] {
  const ids = [id];
  staffList.filter(s => s.reportsTo === id).forEach(dr => ids.push(...getReportIds(dr.id, staffList)));
  return ids;
}

export function StaffAnalytics({ allLeads, staffList, onExplore }: StaffAnalyticsProps) {
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

  /* ── Staff Member Display Name ── */
  const selectedStaffName = useMemo(() => {
    if (selectedStaffId === 'all') return 'All Staff';
    return staffList.find(s => s.id === selectedStaffId)?.name ?? 'Staff';
  }, [selectedStaffId, staffList]);

  /* ── KPI values ── */
  const activeLeads = Calc.activeLeads(staffLeads);
  const enrolled    = Calc.enrolled(staffLeads);
  const convRate    = Calc.enrollmentRate(staffLeads);
  const dueToday    = Calc.followupsDueToday(staffLeads);
  const overdue     = Calc.overdueFollowups(staffLeads);
  const hotLeads    = Calc.hotLeads(staffLeads);
  const delay       = Calc.averageFollowupDelay(staffLeads);

  const midnight = toMidnight(CFG.today);

  const kpiCards: KpiCardDef[] = useMemo(() => [
    {
      label: 'Assigned Leads',
      value: staffLeads.length,
      fmt: 'n',
      color: 'blue',
      icon: Users,
      tooltipKey: 'assignedLeads',
      filterFn: () => true,
    },
    {
      label: 'Active Leads',
      value: activeLeads,
      fmt: 'n',
      color: 'teal',
      icon: Target,
      tooltipKey: 'activeLeads',
      filterFn: l => Calc._isActive(l),
    },
    {
      label: 'Enrolled',
      value: enrolled,
      fmt: 'n',
      color: 'green',
      icon: CheckCircle2,
      tooltipKey: 'enrolled',
      filterFn: l => Calc._isEnrolled(l),
    },
    {
      label: 'Conversion Rate',
      value: convRate,
      fmt: '%',
      color: 'purple',
      icon: TrendingUp,
      tooltipKey: 'conversionRate',
      alignRight: true,
      filterFn: l => Calc._isEnrolled(l),
    },
    {
      label: 'Follow-ups Due Today',
      value: dueToday,
      fmt: 'n',
      color: 'amber',
      icon: Clock,
      tooltipKey: 'followupsDueToday',
      filterFn: l => !!l.followUpDate && new Date(l.followUpDate).toDateString() === CFG.today.toDateString(),
    },
    {
      label: 'Overdue Follow-ups',
      value: overdue,
      fmt: 'n',
      color: 'red',
      icon: AlertTriangle,
      tooltipKey: 'overdueFollowups',
      filterFn: l => !!l.followUpDate && new Date(l.followUpDate) < midnight && Calc._isActive(l),
    },
    {
      label: 'Hot Leads',
      value: hotLeads,
      fmt: 'n',
      color: 'pink',
      icon: Star,
      tooltipKey: 'hotLeads',
      filterFn: l => l.status === 'Hot Lead' && Calc._isActive(l),
    },
    {
      label: 'Avg Follow-up Delay',
      value: delay,
      fmt: 'd',
      color: 'slate',
      icon: Clock,
      tooltipKey: 'averageFollowupDelay',
      alignRight: true,
      filterFn: l => !!l.followUpDate && new Date(l.followUpDate) < midnight && Calc._isActive(l),
    },
  ], [staffLeads.length, activeLeads, enrolled, convRate, dueToday, overdue, hotLeads, delay, midnight]);

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

  const handleCellClick = (statusName: string) => {
    exploreLeads(
      onExplore,
      `${statusName} Status — ${selectedStaffName}`,
      staffLeads.filter(l => l.status === statusName)
    );
  };

  const handleExploreStage = (stageName: string, index: number) => {
    const order = CFG.statusOrder;
    const filterFn = (l: Lead) => {
      if (Calc._isLost(l)) return false;
      if (index === 0) return true;
      return (order[l.status] ?? -999) >= (order[stageName] ?? -999);
    };
    exploreLeads(onExplore, `${stageName} Stage — ${selectedStaffName}`, staffLeads.filter(filterFn));
  };

  /* ── Performance table rows ── */
  const perfRows = useMemo(() => [
    {
      label: 'Assigned Leads',
      value: staffLeads.length,
      fmt: 'n' as MetricFmt,
      color: 'white',
      tip: 'assignedLeads',
      subset: staffLeads,
    },
    {
      label: 'Calls Made',
      value: staffLeads.filter(l => l.calls > 0).length,
      fmt: 'n' as MetricFmt,
      color: '#22C55E',
      tip: 'staffCompletedFollowups',
      subset: staffLeads.filter(l => l.calls > 0),
    },
    {
      label: 'Pending Follow-ups',
      value: Calc.pendingFollowups(staffLeads),
      fmt: 'n' as MetricFmt,
      color: '#F59E0B',
      tip: 'staffPendingFollowups',
      subset: staffLeads.filter(l => !!l.followUpDate && new Date(l.followUpDate) >= midnight && Calc._isActive(l)),
    },
    {
      label: 'Overdue Follow-ups',
      value: overdue,
      fmt: 'n' as MetricFmt,
      color: '#EF4444',
      tip: 'overdueFollowups',
      subset: staffLeads.filter(l => !!l.followUpDate && new Date(l.followUpDate) < midnight && Calc._isActive(l)),
    },
    {
      label: 'Enrolled',
      value: enrolled,
      fmt: 'n' as MetricFmt,
      color: '#22C55E',
      tip: 'enrolled',
      subset: staffLeads.filter(l => Calc._isEnrolled(l)),
    },
    {
      label: 'Conversion Rate',
      value: convRate,
      fmt: '%' as MetricFmt,
      color: '#8B5CF6',
      tip: 'conversionRate',
      subset: staffLeads.filter(l => Calc._isEnrolled(l)),
    },
    {
      label: 'Avg Follow-up Delay',
      value: delay,
      fmt: 'd' as MetricFmt,
      color: '#A1A1AA',
      tip: 'averageFollowupDelay',
      subset: staffLeads.filter(l => !!l.followUpDate && new Date(l.followUpDate) < midnight && Calc._isActive(l)),
    },
  ], [staffLeads, overdue, enrolled, convRate, delay, midnight]);

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
                  <motion.button
                    key={idx}
                    variants={fadeCardItem}
                    whileHover={{ y: -2 }}
                    onClick={() => exploreLeads(onExplore, `${k.label} — ${selectedStaffName}`, staffLeads.filter(k.filterFn))}
                    className="ia-card p-5 flex flex-col gap-3 group text-left w-full cursor-pointer select-none focus:outline-none"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: cs.glow }}>
                        <Icon className={`w-4 h-4 ${cs.icon}`} />
                      </div>
                      <Tooltip tooltipKey={k.tooltipKey} alignRight={k.alignRight} />
                    </div>
                    <div className="flex-grow">
                      <div className="font-mono font-bold text-white" style={{ fontSize: 28 }}>
                        {formatMetric(k.value, k.fmt)}
                      </div>
                      <div className="text-[12px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {k.label}
                      </div>
                    </div>

                    {/* Explore hint */}
                    <div
                      className="mt-1 pt-3 border-t flex items-center gap-1.5 text-[10px] font-semibold transition-colors duration-200 w-full"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/40 group-hover:bg-blue-400 transition-colors duration-200" />
                      <span className="group-hover:text-blue-400 transition-colors duration-200">Click to explore</span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Personal Funnel + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Funnel bars */}
              <div className="ia-card p-6 lg:col-span-2 space-y-3" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Personal Pipeline
                </div>
                {funnelStages.map((stage, idx) => {
                  const pct = funnelMax ? (stage.count / funnelMax) * 100 : 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleExploreStage(stage.stage, idx)}
                      className="w-full text-left group p-1.5 -m-1.5 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer block select-none focus:outline-none"
                    >
                      <div className="flex items-center justify-between mb-1 w-full">
                        <span className="text-[12px] font-medium transition-colors duration-200 group-hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>
                          {stage.stage}
                        </span>
                        <span className="font-mono text-[12px] font-semibold text-white flex items-center gap-1.5">
                          {stage.count}
                          <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                            {idx === 0 ? '100%' : `${pct.toFixed(0)}%`}
                          </span>
                          <span className="text-[9px] font-bold text-blue-400/0 group-hover:text-blue-400/80 transition-all duration-200 ml-1">
                            Explore →
                          </span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(pct, stage.count > 0 ? 2 : 0)}%` }}
                          transition={{ duration: 0.65, ease: 'easeOut', delay: idx * 0.04 }}
                          className="h-full rounded-full"
                          style={{ background: FUNNEL_PALETTE[idx % FUNNEL_PALETTE.length] }}
                        />
                      </div>
                    </button>
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
                            {donutData.map((d, i) => (
                              <Cell
                                key={i}
                                fill={d.color}
                                onClick={() => handleCellClick(d.name)}
                                className="cursor-pointer outline-none transition-all duration-200 hover:opacity-85"
                              />
                            ))}
                          </Pie>
                          <RTooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <button
                        onClick={() => exploreLeads(onExplore, `Active Leads — ${selectedStaffName}`, staffLeads.filter(l => Calc._isActive(l)))}
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto cursor-pointer focus:outline-none group/centre"
                      >
                        <span className="font-mono font-bold text-white transition-colors group-hover/centre:text-blue-400" style={{ fontSize: 22 }}>
                          {activeLeads}
                        </span>
                        <span className="text-[9px] font-semibold mt-0.5 uppercase tracking-widest transition-colors group-hover/centre:text-blue-400" style={{ color: 'var(--text-muted)' }}>
                          Active
                        </span>
                      </button>
                    </div>
                    <div className="mt-4 space-y-1.5 overflow-y-auto max-h-[120px]">
                      {donutData.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => handleCellClick(d.name)}
                          className="group flex items-center justify-between text-[11px] w-full text-left hover:bg-white/[0.02] p-1 rounded transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                            <span className="truncate transition-colors group-hover:text-blue-400" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                          </div>
                          <span className="font-mono font-semibold text-white group-hover:text-blue-400 transition-colors">{d.value}</span>
                        </button>
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
                    <tr
                      key={i}
                      onClick={() => exploreLeads(onExplore, `${r.label} — ${selectedStaffName}`, r.subset)}
                      className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                          {r.label}
                          <span onClick={e => e.stopPropagation()}>
                            <Tooltip tooltipKey={r.tip} />
                          </span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold group-hover:text-blue-400 transition-colors" style={{ color: r.color }}>
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
