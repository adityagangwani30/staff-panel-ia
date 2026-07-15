'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Building2, Calendar } from 'lucide-react';
import { getSharedDataset } from '@/lib/demoData';
import { Lead } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrendCalc } from '@/lib/trendCalculations';
import { TrendKpis } from '@/components/overview/TrendKpis';
import { TrendCharts } from '@/components/overview/TrendCharts';

const DATE_OPTIONS = [
  { value: '7d',     label: 'Last 7 Days' },
  { value: '30d',    label: 'Last 30 Days' },
  { value: '90d',    label: 'Last 90 Days' },
  { value: '12m',    label: 'Last 12 Months' },
  { value: 'custom', label: 'Custom Range…' },
];

export default function DemoAnalyticsPage() {
  // Generate the rich 365-day dataset for trends
  const initial = useMemo(() => getSharedDataset(), []);
  const [rawLeads] = useState<Lead[]>(initial.leads);

  // Global Time Filtering States (Defaulting to Last 30 Days as standard)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '12m' | 'custom'>('30d');
  const [customFrom, setCustomFrom] = useState<string | null>(null);
  const [customTo, setCustomTo] = useState<string | null>(null);

  // Recalculate Boundaries when Filters Change
  const periodBoundaries = useMemo(() => {
    return TrendCalc.getPeriodBoundaries(dateRange, customFrom, customTo);
  }, [dateRange, customFrom, customTo]);

  // Recalculate KPI metrics and Chart Data
  const summaries = useMemo(() => {
    return TrendCalc.getTrendSummaries(rawLeads, periodBoundaries);
  }, [rawLeads, periodBoundaries]);

  const chartData = useMemo(() => {
    return TrendCalc.generateChartData(rawLeads, periodBoundaries);
  }, [rawLeads, periodBoundaries]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ━━━ TOP NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}
      >
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-white">IntelAbroad</div>
              <div className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Staff Portal
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2 border-l pl-6 border-zinc-800">
            <Link
              href="/"
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              Overview
            </Link>
            <Link
              href="/demo-analytics"
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors bg-blue-500/10 text-blue-400 font-semibold"
            >
              Trend Analytics (Demo)
            </Link>
          </nav>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Date Pickers */}
          {dateRange === 'custom' && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="date"
                value={customFrom ?? ''}
                onChange={e => setCustomFrom(e.target.value || null)}
                className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Start date"
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={customTo ?? ''}
                onChange={e => setCustomTo(e.target.value || null)}
                className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="End date"
              />
            </div>
          )}

          {/* Date range picker */}
          <Select
            value={dateRange}
            onChange={e => {
              setDateRange(e.target.value as typeof dateRange);
              setCustomFrom(null);
              setCustomTo(null);
            }}
          >
            {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </header>

      {/* ━━━ MAIN CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-10">

        {/* Mobile Navigation fallback */}
        <div className="md:hidden flex gap-2 p-1.5 rounded-xl border border-zinc-800" style={{ background: 'var(--bg-secondary)' }}>
          <Link
            href="/"
            className="flex-1 text-center text-[12px] font-medium py-2 rounded-lg text-zinc-400 hover:text-white"
          >
            Overview
          </Link>
          <Link
            href="/demo-analytics"
            className="flex-1 text-center text-[12px] font-medium py-2 rounded-lg bg-blue-500/10 text-blue-400 font-semibold"
          >
            Trend Analytics
          </Link>
        </div>

        {/* Page Title & Details */}
        <div>
          <h1 className="text-[36px] font-bold text-white leading-tight">Trend Analytics</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Demo view of Phase 1 metrics over time, including previous period comparison indicators.
          </p>
        </div>

        {/* Filter State Banner */}
        <div
          className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 select-none">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Active Trend Interval:
            </span>
            <span className="text-[12px] px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700 font-semibold text-white capitalize">
              {periodBoundaries.groupBy}
            </span>
          </div>

          <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
            Date Range: {periodBoundaries.currentFrom.toLocaleDateString()} to {periodBoundaries.currentTo.toLocaleDateString()}
          </div>
        </div>

        {/* Section 1: KPI Trend Cards */}
        <section className="space-y-4">
          <SectionHeading title="Performance Summaries" sub="Key performance trends aggregated with comparison vs equivalent preceding duration" />
          <TrendKpis summaries={summaries} dateRange={dateRange} />
        </section>

        {/* Section 2: Interactive Trend Charts */}
        <section className="space-y-4">
          <SectionHeading title="Visual Analytics Trends" sub="Interactive timelines for leads, conversions, operations and staff activity logs" />
          <TrendCharts data={chartData} dateRange={dateRange} groupBy={periodBoundaries.groupBy} />
        </section>

      </main>
    </div>
  );
}
