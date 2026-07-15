'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Download, Upload, RotateCcw, SlidersHorizontal, Building2 } from 'lucide-react';
import { getSharedDataset, updateSharedLeads, updateSharedStaff } from '@/lib/demoData';
import { DataLoader } from '@/lib/dataLoader';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { FilterState, Lead, StaffMember } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { FilterChip } from '@/components/shared/FilterChip';
import { ExecutiveKpis }  from '@/components/overview/ExecutiveKpis';
import { ActionCentre }   from '@/components/overview/ActionCentre';
import { PipelineFunnel } from '@/components/overview/PipelineFunnel';
import { StatusDist }     from '@/components/overview/StatusDist';
import { SourcePerf }     from '@/components/overview/SourcePerf';
import { CounsellorPerf } from '@/components/overview/CounsellorPerf';
import { RecentLeads }    from '@/components/overview/RecentLeads';
import { LeadsModal }     from '@/components/overview/LeadsModal';
import { StaffAnalytics } from '@/components/staff/StaffAnalytics';

/* ─── Constants ──────────────────────────────────────────────────────── */
const DATE_OPTIONS: { value: FilterState['dateRange']; label: string }[] = [
  { value: 'all',    label: 'All Time' },
  { value: 'today',  label: 'Today' },
  { value: '7d',     label: 'Last 7 Days' },
  { value: '30d',    label: 'Last 30 Days' },
  { value: '90d',    label: 'Last 90 Days' },
  { value: 'month',  label: 'This Month' },
  { value: 'year',   label: 'This Year' },
  { value: 'custom', label: 'Custom Range…' },
];

const EMPTY_FILTER: FilterState = {
  dateRange: 'all', customFrom: null, customTo: null, source: 'all', status: 'all',
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const initial = useMemo(() => getSharedDataset(), []);

  const [rawLeads,    setRawLeads]    = useState<Lead[]>(initial.leads);
  const [staffList,   setStaffList]   = useState<StaffMember[]>(initial.staff);
  const [fileName,    setFileName]    = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters,     setFilters]     = useState<FilterState>(EMPTY_FILTER);
  const [modalState,  setModalState]  = useState<{ isOpen: boolean; title: string; leads: Lead[] }>({
    isOpen: false, title: '', leads: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Filter computation ── */
  const filteredLeads = useMemo(() => {
    let result = rawLeads;
    const { from, to } = Calc.getDateRangeBoundaries(filters.dateRange, filters.customFrom, filters.customTo);
    if (from || to) {
      result = result.filter(l => {
        const entry = new Date(l.entryDate);
        if (from && entry < from) return false;
        if (to   && entry > to)   return false;
        return true;
      });
    }
    if (filters.source !== 'all') result = result.filter(l => l.source === filters.source);
    if (filters.status !== 'all') result = result.filter(l => l.status === filters.status);
    return result;
  }, [rawLeads, filters]);

  const resetFilters = () => setFilters(EMPTY_FILTER);
  const hasActiveFilters =
    filters.dateRange !== 'all' || filters.source !== 'all' || filters.status !== 'all';

  /* ── Export ── */
  const handleExport = () => {
    if (!filteredLeads.length) { alert('No data to export.'); return; }
    const rows = filteredLeads.map(l => ({
      LeadID:    l.id,
      Name:      l.studentName,
      Phone:     l.phone,
      Source:    l.source,
      Status:    l.status,
      Assignee:  l.counsellorName,
      Centre:    l.sourceCentre,
      State:     l.state ?? '',
      City:      l.city ?? '',
      EntryDate: new Date(l.entryDate).toLocaleDateString(),
      Calls:     l.calls,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Overview Export');
    XLSX.writeFile(wb, fileName ? `export_${fileName}` : 'overview_export.xlsx');
  };

  /* ── File upload ── */
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data     = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const json     = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const imported = DataLoader.transformData(json);
        const staff    = DataLoader.generateStaffFromData(imported, initial.staff);
        setRawLeads(imported);
        setStaffList(staff);
        updateSharedLeads(imported);
        updateSharedStaff(staff);
        setFileName(file.name);
        setLastUpdated(new Date());
      } catch (err: unknown) {
        alert('Failed to parse file: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  /* ── Explore modal ── */
  const handleExplore = (title: string, leads: Lead[]) => {
    setModalState({ isOpen: true, title, leads });
  };

  /* ── Timestamp ── */
  const timeDisplay =
    lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    '  ·  ' +
    lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const setFilter = (patch: Partial<FilterState>) => setFilters(f => ({ ...f, ...patch }));

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
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors bg-blue-500/10 text-blue-400 font-semibold"
            >
              Overview
            </Link>
            <Link
              href="/demo-analytics"
              className="text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              Trend Analytics (Demo)
            </Link>
          </nav>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom date pickers */}
          {filters.dateRange === 'custom' && (
            <div
              className="flex items-center gap-1.5 rounded-lg px-2 py-1"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <input
                type="date"
                value={filters.customFrom ?? ''}
                onChange={e => setFilter({ customFrom: e.target.value || null })}
                className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                style={{ color: 'var(--text-secondary)' }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={filters.customTo ?? ''}
                onChange={e => setFilter({ customTo: e.target.value || null })}
                className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>
          )}

          {/* Date range */}
          <Select
            value={filters.dateRange}
            onChange={e => setFilter({ dateRange: e.target.value as FilterState['dateRange'], customFrom: null, customTo: null })}
          >
            {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>

          {/* File upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
            aria-label="Upload CRM spreadsheet"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{ background: '#3B82F6', color: 'white' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2563EB')}
            onMouseLeave={e => (e.currentTarget.style.background = '#3B82F6')}>
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* Last updated */}
          <div
            className="hidden md:block pl-3 text-[10px] font-mono select-none"
            style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}
          >
            {timeDisplay}
          </div>
        </div>
      </header>

      {/* ━━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-10">

        {/* Mobile Navigation fallback */}
        <div className="md:hidden flex gap-2 p-1.5 rounded-xl border border-zinc-800" style={{ background: 'var(--bg-secondary)' }}>
          <Link
            href="/"
            className="flex-1 text-center text-[12px] font-medium py-2 rounded-lg bg-blue-500/10 text-blue-400 font-semibold"
          >
            Overview
          </Link>
          <Link
            href="/demo-analytics"
            className="flex-1 text-center text-[12px] font-medium py-2 rounded-lg text-zinc-400 hover:text-white"
          >
            Trend Analytics
          </Link>
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-[36px] font-bold text-white leading-tight">Organisation Overview</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time CRM analytics across all branches and counsellors
          </p>
        </div>

        {/* Filter bar */}
        <div
          className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold select-none"
                 style={{ color: 'var(--text-muted)' }}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </div>

            <Select value={filters.source} onChange={e => setFilter({ source: e.target.value })}>
              <option value="all">All Channels</option>
              {CFG.sources.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>

            <Select value={filters.status} onChange={e => setFilter({ status: e.target.value })}>
              <option value="all">All Statuses</option>
              {CFG.statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-[12px] font-medium transition-colors"
                style={{ color: '#EF4444' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FCA5A5')}
                onMouseLeave={e => (e.currentTarget.style.color = '#EF4444')}
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Active filter chips */}
          <div className="flex flex-wrap gap-2">
            {filters.dateRange !== 'all' && (
              <FilterChip
                label={DATE_OPTIONS.find(o => o.value === filters.dateRange)?.label ?? filters.dateRange}
                onRemove={() => setFilter({ dateRange: 'all', customFrom: null, customTo: null })}
              />
            )}
            {filters.source !== 'all' && (
              <FilterChip label={filters.source} onRemove={() => setFilter({ source: 'all' })} />
            )}
            {filters.status !== 'all' && (
              <FilterChip label={filters.status} onRemove={() => setFilter({ status: 'all' })} />
            )}
          </div>
        </div>

        {/* Section 1 — Executive KPIs */}
        <section>
          <SectionHeading title="Executive KPIs" sub="Organisation-wide metrics for the selected time period" />
          <ExecutiveKpis leads={filteredLeads} onExplore={handleExplore} />
        </section>

        {/* Section 2 — Pipeline Funnel */}
        <section>
          <SectionHeading title="Admission Pipeline Funnel" sub="Lead progression through every stage of the IntelAbroad workflow" />
          <PipelineFunnel leads={filteredLeads} onExplore={handleExplore} />
        </section>

        {/* Section 3 — Action Centre */}
        <section>
          <SectionHeading title="Today's Action Centre" sub="Items that require immediate attention" />
          <ActionCentre leads={filteredLeads} onExplore={handleExplore} />
        </section>

        {/* Section 4 — Status Distribution + Counsellor Performance */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionHeading title="Status Distribution" sub="Lead spread across all CRM statuses" />
            <StatusDist leads={filteredLeads} onExplore={handleExplore} />
          </div>
          <div>
            <SectionHeading title="Counsellor Performance" sub="Enrollment ranking by individual counsellors" />
            <CounsellorPerf leads={filteredLeads} onExplore={handleExplore} />
          </div>
        </section>

        {/* Section 5 — Source Performance + Recent Leads */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionHeading title="Source Performance" sub="Lead acquisition and conversion by marketing channel" />
            <SourcePerf leads={filteredLeads} onExplore={handleExplore} />
          </div>
          <div>
            <SectionHeading title="New Leads" sub="Most recently entered leads in the CRM" />
            <RecentLeads leads={filteredLeads} />
          </div>
        </section>

        {/* Section 6 — Staff Analytics */}
        <section className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <StaffAnalytics allLeads={filteredLeads} staffList={staffList} onExplore={handleExplore} />
        </section>

      </main>

      {/* Inactive leads modal */}
      <LeadsModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        leadsList={modalState.leads}
        onClose={() => setModalState(s => ({ ...s, isOpen: false }))}
      />
    </div>
  );
}
