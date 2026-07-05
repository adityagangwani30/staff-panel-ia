'use client';

import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  SlidersHorizontal,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { getInitialDataset } from '@/lib/demoData';
import { DataLoader } from '@/lib/dataLoader';
import { Calc } from '@/lib/calculations';
import { CFG } from '@/lib/constants';
import { FilterState, Lead, StaffMember } from '@/lib/types';
import { Select } from '@/components/ui/Select';

// Components
import { ExecutiveKpis } from '@/components/overview/ExecutiveKpis';
import { ActionCentre } from '@/components/overview/ActionCentre';
import { PipelineFunnel } from '@/components/overview/PipelineFunnel';
import { SourcePerf } from '@/components/overview/SourcePerf';
import { CounsellorPerf } from '@/components/overview/CounsellorPerf';
import { RecentLeads } from '@/components/overview/RecentLeads';
import { LeadsModal } from '@/components/overview/LeadsModal';
import { StaffAnalytics } from '@/components/staff/StaffAnalytics';

export default function DashboardPage() {
  const initial = useMemo(() => getInitialDataset(), []);
  
  const [rawLeads, setRawLeads] = useState<Lead[]>(initial.leads);
  const [staffList, setStaffList] = useState<StaffMember[]>(initial.staff);
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(CFG.today);

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'all',
    customFrom: null,
    customTo: null,
    source: 'all',
    status: 'all'
  });

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    leads: Lead[];
  }>({
    isOpen: false,
    title: '',
    leads: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute filtered dataset
  const filteredLeads = useMemo(() => {
    let result = [...rawLeads];

    // 1. Date Range Filter (by Entry Date)
    const { from, to } = Calc.getDateRangeBoundaries(filters.dateRange, filters.customFrom, filters.customTo);
    if (from || to) {
      result = result.filter(l => {
        const entry = new Date(l.entryDate);
        if (from && entry < from) return false;
        if (to && entry > to) return false;
        return true;
      });
    }

    // 2. Source Filter
    if (filters.source !== 'all') {
      result = result.filter(l => l.source === filters.source);
    }

    // 3. Status Filter
    if (filters.status !== 'all') {
      result = result.filter(l => l.status === filters.status);
    }

    return result;
  }, [rawLeads, filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      customFrom: null,
      customTo: null,
      source: 'all',
      status: 'all'
    });
  };

  // CSV Exporter
  const handleExport = () => {
    if (!filteredLeads.length) {
      alert('No data available to export.');
      return;
    }
    const rows = filteredLeads.map(l => ({
      LeadID: l.id,
      StudentName: l.studentName,
      Phone: l.phone,
      Source: l.source,
      Status: l.status,
      Assignee: l.counsellorName,
      Centre: l.sourceCentre,
      State: l.state || '',
      City: l.city || '',
      EntryDate: l.entryDate.toLocaleDateString(),
      Calls: l.calls
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Overview Export');
    XLSX.writeFile(wb, fileName ? `export_${fileName}` : 'overview_export.xlsx');
  };

  // XLSX parser file upload hook
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const importedLeads = DataLoader.transformData(json);
        const updatedStaff = DataLoader.generateStaffFromData(importedLeads, initial.staff);

        setRawLeads(importedLeads);
        setStaffList(updatedStaff);
        setFileName(file.name);
        setLastUpdated(new Date());
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Click card handle -> Inactive Leads details popup mapping
  const handleInactiveCardClick = (days: number) => {
    const todayMidnight = new Date(CFG.today.toDateString());
    const limit = new Date(todayMidnight.getTime() - days * 24 * 60 * 60 * 1000);

    const inactive = filteredLeads.filter(l => {
      const act = Calc.getLastActivityDate(l);
      return act && act <= limit && Calc._isActive(l);
    });

    setModalState({
      isOpen: true,
      title: `${days}-Day Inactive Leads`,
      leads: inactive
    });
  };

  // Helper date formatter string
  const formattedLastUpdated = lastUpdated.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ', ' + lastUpdated.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Brand */}
        <div className="space-y-0.5 select-none">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">IntelAbroad Overview</h1>
          </div>
          <p className="text-[10px] text-slate-500">Continuous CRM analytics and counseling telemetry</p>
        </div>

        {/* Topbar Date Range Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Custom start/end picker inputs */}
          {filters.dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg p-1">
              <input 
                type="date" 
                value={filters.customFrom || ''} 
                onChange={(e) => setFilters({ ...filters, customFrom: e.target.value || null })}
                className="bg-transparent border-none text-[11px] text-slate-300 font-mono focus:outline-none px-1"
              />
              <span className="text-[10px] text-slate-500 font-bold uppercase select-none">to</span>
              <input 
                type="date" 
                value={filters.customTo || ''} 
                onChange={(e) => setFilters({ ...filters, customTo: e.target.value || null })}
                className="bg-transparent border-none text-[11px] text-slate-300 font-mono focus:outline-none px-1"
              />
            </div>
          )}

          <Select
            value={filters.dateRange}
            onChange={(e) => setFilters({ 
              ...filters, 
              dateRange: e.target.value as any,
              customFrom: null,
              customTo: null
            })}
          >
            <option value="all">All Time (Default)</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range...</option>
          </Select>

          {/* Hidden File uploader */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleExcelUpload}
            accept=".xlsx,.xls,.csv" 
            className="hidden" 
          />

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-lg transition-all"
            title="Upload CSV / Excel dataset"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/10 transition-all"
            title="Export filtered records as Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>

          {/* Last Updated Widget */}
          <div className="pl-3 border-l border-slate-800/80 text-[10px] select-none leading-tight flex flex-col text-slate-400">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[8px]">Updated</span>
            <span className="font-mono mt-0.5">{formattedLastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        
        {/* Dynamic Filters Bar */}
        <section className="bg-slate-900/25 border border-slate-900 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none">
              <SlidersHorizontal className="w-4 h-4" />
              Quick Filters
            </div>

            {/* Source select */}
            <Select 
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <option value="all">All Channels</option>
              {CFG.sources.map(src => <option key={src} value={src}>{src}</option>)}
            </Select>

            {/* Status select */}
            <Select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              {CFG.statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </Select>

            {/* Reset Filters trigger */}
            {(filters.dateRange !== 'all' || filters.source !== 'all' || filters.status !== 'all') && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Chips representation */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium border border-slate-800">
                <Calendar className="w-3 h-3 text-slate-500" />
                Range: {filters.dateRange}
              </span>
            )}
            {filters.source !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium border border-slate-800">
                <Layers className="w-3 h-3 text-slate-500" />
                Source: {filters.source}
              </span>
            )}
          </div>
        </section>

        {/* Section 1: Executive KPI Metrics */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
            Executive KPI Indicators
          </h2>
          <ExecutiveKpis leads={filteredLeads} onInactiveCardClick={handleInactiveCardClick} />
        </section>

        {/* Section 2: Pipeline Funnel Conversion Visualizer */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
            Admission Pipeline Funnel (Complete Organisation)
          </h2>
          <PipelineFunnel leads={filteredLeads} />
        </section>

        {/* Section 3: Action Centre */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
            Today&apos;s Action Center
          </h2>
          <ActionCentre leads={filteredLeads} />
        </section>

        {/* Section 4: Channel & Counselling Rankings */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
              Source Performance Metrics
            </h2>
            <SourcePerf leads={filteredLeads} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
              Counsellor Performance Metrics
            </h2>
            <CounsellorPerf leads={filteredLeads} />
          </div>
        </section>

        {/* Section 5: Recent Admissions */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 select-none">
            Recent Admissions Registry
          </h2>
          <RecentLeads leads={filteredLeads} />
        </section>

        {/* Section 6: Staff Analytics Panel */}
        <section className="pt-8 border-t border-slate-900">
          <StaffAnalytics allLeads={filteredLeads} staffList={staffList} />
        </section>
      </main>

      {/* Leads list overlay modal dialog */}
      <LeadsModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        leadsList={modalState.leads}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </div>
  );
}
