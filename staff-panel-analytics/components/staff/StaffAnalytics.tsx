'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Star 
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

export function StaffAnalytics({ allLeads, staffList }: StaffAnalyticsProps) {
  const [selectedStaffId, setSelectedStaffId] = useState('all');

  // Helper: recursive reports mapping
  const getStaffReportIds = (staffId: string): string[] => {
    const ids = [staffId];
    const directReports = staffList.filter(s => s.reportsTo === staffId);
    directReports.forEach(dr => {
      ids.push(...getStaffReportIds(dr.id));
    });
    return ids;
  };

  // Resolve leads scoped to selected staff member
  const staffLeads = useMemo(() => {
    if (selectedStaffId === 'all') return allLeads;
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (!staff) return [];

    if (staff.role === 'Founder') {
      return allLeads;
    } else if (staff.role === 'BranchManager') {
      return allLeads.filter(l => l.sourceCentre === staff.sourceCentre);
    } else if (staff.role === 'TeamLead') {
      const reportIds = getStaffReportIds(selectedStaffId);
      return allLeads.filter(l => reportIds.includes(l.counsellorId));
    } else {
      // Counsellor
      return allLeads.filter(l => l.counsellorId === selectedStaffId);
    }
  }, [selectedStaffId, allLeads, staffList]);

  // Group selector options
  const groupedStaff = useMemo(() => {
    return {
      managers: staffList.filter(s => s.role === 'BranchManager'),
      leads: staffList.filter(s => s.role === 'TeamLead'),
      counsellors: staffList.filter(s => s.role === 'Counsellor')
    };
  }, [staffList]);

  // Recharts Status Distribution Data
  const chartData = useMemo(() => {
    const dist = Calc.statusDistribution(staffLeads);
    return dist
      .filter(d => d.count > 0)
      .map(d => ({
        name: d.status,
        value: d.count,
        color: CFG.statusColors[d.status] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);
  }, [staffLeads]);

  // KPI Calculations
  const activeLeads = Calc.activeLeads(staffLeads);
  const enrolled = Calc.enrolled(staffLeads);
  const convRate = Calc.enrollmentRate(staffLeads);
  const dueToday = Calc.followupsDueToday(staffLeads);
  const overdue = Calc.overdueFollowups(staffLeads);
  const hotLeads = Calc.hotLeads(staffLeads);
  const delay = Calc.averageFollowupDelay(staffLeads);

  const kpiCards = [
    { label: 'Assigned Leads', value: staffLeads.length, color: 'blue', icon: Users, tooltipKey: 'assignedLeads' },
    { label: 'Active Leads', value: activeLeads, color: 'teal', icon: Target, tooltipKey: 'activeLeads' },
    { label: 'Enrolled', value: enrolled, color: 'green', icon: CheckCircle2, tooltipKey: 'enrolled' },
    { label: 'Conversion Rate', value: `${convRate.toFixed(1)}%`, color: 'purple', icon: TrendingUp, tooltipKey: 'conversionRate', alignRight: true },
    { label: 'Follow-ups Due Today', value: dueToday, color: 'amber', icon: Clock, tooltipKey: 'followupsDueToday' },
    { label: 'Overdue Follow-ups', value: overdue, color: 'red', icon: AlertTriangle, tooltipKey: 'overdueFollowups' },
    { label: 'Hot Leads', value: hotLeads, color: 'pink', icon: Star, tooltipKey: 'hotLeads' },
    { label: 'Average Follow-up Delay', value: `${delay.toFixed(1)}d`, color: 'slate', icon: Clock, tooltipKey: 'averageFollowupDelay', alignRight: true }
  ];

  const colorStyles: Record<string, { bg: string, text: string, border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'hover:border-blue-500/30' },
    teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'hover:border-teal-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'hover:border-green-500/30' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'hover:border-purple-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'hover:border-amber-500/30' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'hover:border-red-500/30' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'hover:border-pink-500/30' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'hover:border-slate-500/30' }
  };

  const personalFunnelStages = Calc.pipelineStages(staffLeads);
  const personalFunnelMax = personalFunnelStages[0]?.count || 0;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Select Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800/60">
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 select-none">
          Staff Performance Analytics
          <Tooltip tooltipKey="assignedLeads" />
        </h2>
        <Select
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="min-w-[220px]"
        >
          <option value="all">All Staff (Organisation)</option>
          <optgroup label="Branch Managers">
            {groupedStaff.managers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sourceCentre})</option>)}
          </optgroup>
          <optgroup label="Team Leads">
            {groupedStaff.leads.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sourceCentre})</option>)}
          </optgroup>
          <optgroup label="Counsellors">
            {groupedStaff.counsellors.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sourceCentre})</option>)}
          </optgroup>
        </Select>
      </div>

      {/* Scoped KPI Grid */}
      {staffLeads.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 border border-slate-800/40 rounded-xl text-slate-500 text-xs">
          No leads assigned under this staff member scope for the selected filters.
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          >
            {kpiCards.map((card, idx) => {
              const Icon = card.icon;
              const colors = colorStyles[card.color] || colorStyles.slate;
              return (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className={`p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm hover:border-slate-800 transition-all duration-200 flex flex-col justify-between h-[120px]`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Tooltip tooltipKey={card.tooltipKey} alignRight={card.alignRight} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      {card.label}
                    </div>
                    <div className="text-xl font-bold tracking-tight text-slate-100 select-all font-mono">
                      {card.value}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Personal Funnel and Distribution charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel (2/3 columns) */}
            <div className="lg:col-span-2 p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-2 border-b border-slate-800/40">
                Personal Pipeline
              </div>
              {personalFunnelStages.map((stage, idx) => {
                const widthPct = personalFunnelMax ? (stage.count / personalFunnelMax) * 100 : 0;
                const color = CFG.palette[idx % CFG.palette.length];
                const pctFromTotal = personalFunnelMax ? (stage.count / personalFunnelMax) * 100 : 0;

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-32 text-xs font-semibold text-slate-300 truncate text-right">
                      {stage.stage}
                    </div>
                    <div className="flex-1 h-8 bg-slate-950/60 rounded-lg overflow-hidden border border-slate-800/40 relative flex items-center">
                      <div 
                        className="h-full rounded-r transition-all duration-500 ease-out flex items-center justify-end px-3 font-mono text-[10px] sm:text-xs font-bold text-slate-950"
                        style={{ 
                          width: `${Math.max(widthPct, 6)}%`, 
                          backgroundColor: color 
                        }}
                      >
                        {stage.count > 0 && <span className="opacity-90">{stage.count}</span>}
                      </div>
                      {stage.count === 0 && (
                        <span className="pl-3 font-mono text-xs text-slate-600 font-medium">0</span>
                      )}
                    </div>
                    <div className="w-12 text-xs font-mono text-slate-400 font-bold text-left">
                      {idx === 0 ? '100%' : `${pctFromTotal.toFixed(0)}%`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Distribution (1/3 column) */}
            <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-2 border-b border-slate-800/40">
                Personal Status Distribution
              </div>
              <div className="flex-1 min-h-[260px] flex items-center justify-center relative">
                {chartData.length === 0 ? (
                  <div className="text-xs text-slate-500">No status data.</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#f8fafc'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                      <span className="text-2xl font-black text-slate-100 font-mono">
                        {activeLeads}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                        Active Leads
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Performance Summary Table */}
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none pb-3 border-b border-slate-800/60">
              Performance Summary
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-800/40">
                    <th className="py-2.5">Metric</th>
                    <th className="py-2.5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30 text-slate-300">
                  <tr className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      Assigned Leads <Tooltip tooltipKey="assignedLeads" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold">{staffLeads.length}</td>
                  </tr>
                  <tr className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      Completed Follow-ups <Tooltip tooltipKey="staffCompletedFollowups" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-green-400">
                      {staffLeads.filter(l => l.calls > 0).length}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      Pending Follow-ups <Tooltip tooltipKey="staffPendingFollowups" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-amber-400">
                      {Calc.pendingFollowups(staffLeads)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      Overdue Follow-ups <Tooltip tooltipKey="overdueFollowups" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-red-400">
                      {Calc.overdueFollowups(staffLeads)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      Enrollment Rate <Tooltip tooltipKey="conversionRate" />
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-purple-400">
                      {convRate.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
