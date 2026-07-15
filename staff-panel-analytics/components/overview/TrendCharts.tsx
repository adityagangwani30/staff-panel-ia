'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from 'recharts';
import { ChartDataPoint } from '@/lib/trendCalculations';
import { ChartTooltip } from '@/components/shared/ChartTooltip';

interface TrendChartsProps {
  data: ChartDataPoint[];
  dateRange: string;
  groupBy: 'daily' | 'weekly' | 'monthly';
}

export function TrendCharts({ data, dateRange, groupBy }: TrendChartsProps) {
  // Determine if Calls Made should show as a Bar Chart (short ranges: 7d, 30d) or Line/Area Chart (long ranges: 90d, 12m, custom > 35d)
  const isCallsShortRange = dateRange === '7d' || dateRange === '30d' || (dateRange === 'custom' && data.length <= 35);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* 1. New Leads Trend */}
      <div className="ia-card p-6 flex flex-col" style={{ background: 'var(--bg-card)' }}>
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-white tracking-wide uppercase">New Leads Trend</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Daily volume of newly created CRM leads
          </p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNewLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" dy={8} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <RTooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="New Leads"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNewLeads)"
                activeDot={{ r: 5, strokeWidth: 0, fill: '#3B82F6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Lead Conversion Rate Trend */}
      <div className="ia-card p-6 flex flex-col" style={{ background: 'var(--bg-card)' }}>
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-white tracking-wide uppercase">Conversion Rate Trend</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Cohort conversion rate percentage over time
          </p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" dy={8} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <RTooltip content={<ChartTooltip valueSuffix="%" />} />
              <Area
                type="monotone"
                dataKey="Conversion Rate"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorConversion)"
                activeDot={{ r: 5, strokeWidth: 0, fill: '#8B5CF6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Calls Made Trend */}
      <div className="ia-card p-6 flex flex-col" style={{ background: 'var(--bg-card)' }}>
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-white tracking-wide uppercase">Calls Made Trend</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {isCallsShortRange ? 'Bar representation for short periods' : 'Line trend for longer timelines'}
          </p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isCallsShortRange ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" dy={8} tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RTooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="Calls Made"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" dy={8} tickLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <RTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Calls Made"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                  activeDot={{ r: 5, strokeWidth: 0, fill: '#F59E0B' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Staff Activity Trend */}
      <div className="ia-card p-6 flex flex-col" style={{ background: 'var(--bg-card)' }}>
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-white tracking-wide uppercase">Staff Activity Trend</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            CRM actions (Calls, WhatsApp messages, updates) completed
          </p>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" dy={8} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <RTooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="Staff Activity"
                stroke="#22C55E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActivity)"
                activeDot={{ r: 5, strokeWidth: 0, fill: '#22C55E' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
