'use client';

import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Download, Upload, RotateCcw, SlidersHorizontal,
  ChevronDown, X, Building2
} from 'lucide-react';
import { getInitialDataset } from '@/lib/demoData';
import { DataLoader } from '@/lib/dataLoader';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { FilterState, Lead, StaffMember } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';

// Sections
import { ExecutiveKpis }  from '@/components/overview/ExecutiveKpis';
import { ActionCentre }   from '@/components/overview/ActionCentre';
import { PipelineFunnel } from '@/components/overview/PipelineFunnel';
import { StatusDist }     from '@/components/overview/StatusDist';
import { SourcePerf }     from '@/components/overview/SourcePerf';
import { CounsellorPerf } from '@/components/overview/CounsellorPerf';
import { RecentLeads }    from '@/components/overview/RecentLeads';
import { LeadsModal }     from '@/components/overview/LeadsModal';
import { StaffAnalytics } from '@/components/staff/StaffAnalytics';

/* ─── Date range labels ──────────────────────────────────────────────── */
const DATE_OPTIONS = [
  { value: 'all',    label: 'All Time' },
  { value: 'today',  label: 'Today' },
  { value: '7d',     label: 'Last 7 Days' },
  { value: '30d',    label: 'Last 30 Days' },
  { value: '90d',    label: 'Last 90 Days' },
  { value: 'month',  label: 'This Month' },
  { value: 'year',   label: 'This Year' },
  { value: 'custom', label: 'Custom Range…' },
];

/* ─── Section heading component ─────────────────────────────────────── */
function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[20px] font-semibold text-white leading-tight">{title}</h2>
      {sub && <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

/* ─── Active filter chip ─────────────────────────────────────────────── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ background: 'rgba(59,130,246,0.12)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.2)' }}>
      {label}
      <button onClick={onRemove} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-400/20 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const initial = useMemo(() => getInitialDataset(), []);

  const [rawLeads,    setRawLeads]    = useState<Lead[]>(initial.leads);
  const [staffList,   setStaffList]   = useState<StaffMember[]>(initial.staff);
  const [fileName,    setFileName]    = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(CFG.today);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    customFrom: null,
    customTo: null,
    source: 'all',
    status: 'all',
  });

  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; leads: Lead[] }>({
    isOpen: false, title: '', leads: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Filter computation ── */
  const filteredLeads = useMemo(() => {
    let result = [...rawLeads];
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

  const resetFilters = () => setFilters({ dateRange: 'all', customFrom: null, customTo: null, source: 'all', status: 'all' });
  const hasActiveFilters = filters.dateRange !== 'all' || filters.source !== 'all' || filters.status !== 'all';

  /* ── Export ── */
  const handleExport = () => {
    if (!filteredLeads.length) { alert('No data available to export.'); return; }
    const rows = filteredLeads.map(l => ({
      LeadID: l.id, StudentName: l.studentName, Phone: l.phone, Source: l.source,
      Status: l.status, Assignee: l.counsellorName, Centre: l.sourceCentre,
      State: l.state || '', City: l.city || '',
      EntryDate: new Date(l.entryDate).toLocaleDateString(), Calls: l.calls,
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
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const json     = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const imported = DataLoader.transformData(json);
        const staff    = DataLoader.generateStaffFromData(imported, initial.staff);
        setRawLeads(imported); setStaffList(staff);
        setFileName(file.name); setLastUpdated(new Date());
      } catch (err: any) { alert('Failed to parse file: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  };

  /* ── Inactive modal ── */
  const handleInactiveCardClick = (days: number) => {
    const limit = new Date(new Date(CFG.today.toDateString()).getTime() - days * 86400000);
    const inactive = filteredLeads.filter(l => {
      const act = Calc.getLastActivityDate(l);
      return act && act <= limit && Calc._isActive(l);
    });
    setModalState({ isOpen: true, title: `${days}-Day Inactive Leads`, leads: inactive });
  };

  /* ── Time display ── */
  const timeDisplay = lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + '  ·  ' + lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ━━━ TOP NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
              style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>

        {/* Brand */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white">IntelAbroad</div>
            <div className="text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Overview Dashboard
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Custom date inputs */}
          {filters.dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px]"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <input type="date" value={filters.customFrom || ''}
                     onChange={e => setFilters({ ...filters, customFrom: e.target.value || null })}
                     className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                     style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>to</span>
              <input type="date" value={filters.customTo || ''}
                     onChange={e => setFilters({ ...filters, customTo: e.target.value || null })}
                     className="bg-transparent border-none text-[11px] font-mono focus:outline-none"
                     style={{ color: 'var(--text-secondary)' }} />
            </div>
          )}

          {/* Date range select */}
          <Select value={filters.dateRange}
                  onChange={e => setFilters({ ...filters, dateRange: e.target.value as any, customFrom: null, customTo: null })}>
            {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>

          {/* Upload */}
          <input type="file" ref={fileInputRef} onChange={handleExcelUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>

          {/* Export */}
          <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                  style={{ background: '#3B82F6', color: 'white' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#2563EB')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3B82F6')}>
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* Last updated */}
          <div className="hidden md:block pl-3 text-[10px] font-mono select-none"
               style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}>
            {timeDisplay}
          </div>
        </div>
      </header>

      {/* ━━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-10">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-[36px] font-bold text-white leading-tight">
            Organisation Overview
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time CRM analytics across all branches and counsellors
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
             style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold select-none"
                 style={{ color: 'var(--text-muted)' }}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </div>
            <Select value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}>
              <option value="all">All Channels</option>
              {CFG.sources.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="all">All Statuses</option>
              {CFG.statuses.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </Select>
            {hasActiveFilters && (
              <button onClick={resetFilters}
                      className="flex items-center gap-1 text-[12px] font-medium transition-colors"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FCA5A5')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#EF4444')}>
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Active chips */}
          <div className="flex flex-wrap gap-2">
            {filters.dateRange !== 'all' && (
              <FilterChip
                label={DATE_OPTIONS.find(o => o.value === filters.dateRange)?.label ?? filters.dateRange}
                onRemove={() => setFilters({ ...filters, dateRange: 'all', customFrom: null, customTo: null })}
              />
            )}
            {filters.source !== 'all' && (
              <FilterChip label={filters.source} onRemove={() => setFilters({ ...filters, source: 'all' })} />
            )}
            {filters.status !== 'all' && (
              <FilterChip label={filters.status} onRemove={() => setFilters({ ...filters, status: 'all' })} />
            )}
          </div>
        </div>

        {/* ── Section 1: Executive KPIs ── */}
        <section>
          <SectionHeading title="Executive KPIs" sub="Organisation-wide metrics for the selected time period" />
          <ExecutiveKpis leads={filteredLeads} onInactiveCardClick={handleInactiveCardClick} />
        </section>

        {/* ── Section 2: Admission Pipeline ── */}
        <section>
          <SectionHeading title="Admission Pipeline Funnel" sub="Lead progression through every stage of the IntelAbroad workflow" />
          <PipelineFunnel leads={filteredLeads} />
        </section>

        {/* ── Section 3: Today's Action Centre ── */}
        <section>
          <SectionHeading title="Today's Action Centre" sub="Items that require immediate attention" />
          <ActionCentre leads={filteredLeads} />
        </section>

        {/* ── Section 4: Status Distribution + Counsellor Performance ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionHeading title="Status Distribution" sub="Lead spread across all CRM statuses" />
            <StatusDist leads={filteredLeads} />
          </div>
          <div>
            <SectionHeading title="Counsellor Performance" sub="Enrollment ranking by individual counsellors" />
            <CounsellorPerf leads={filteredLeads} />
          </div>
        </section>

        {/* ── Section 5: Source Performance + Recent Leads ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <SectionHeading title="Source Performance" sub="Lead acquisition and conversion by marketing channel" />
            <SourcePerf leads={filteredLeads} />
          </div>
          <div>
            <SectionHeading title="Recent Admissions" sub="Most recently entered leads in the CRM" />
            <RecentLeads leads={filteredLeads} />
          </div>
        </section>

        {/* ── Section 6: Staff Analytics ── */}
        <section className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <StaffAnalytics allLeads={filteredLeads} staffList={staffList} />
        </section>

      </main>

      {/* ── Inactive leads modal ── */}
      <LeadsModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        leadsList={modalState.leads}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </div>
  );
}
