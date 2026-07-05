const State = {
  currentUser: {
    role: 'Founder',
    name: 'Dr. Suhail',
    id: 'S001',
    sourceCentre: 'all'
  },
  filters: {
    from: null,
    to: null,
    sourceCentre: 'all',
    counsellor: 'all',
    source: 'all',
    status: 'all'
  },
  filtered: [],
  charts: {},
  activeTab: 'lead',
  allTabs: ['lead', 'counsellor', 'followup', 'source', 'geography', 'application']
};

function getVisibleTabs(role) {
  switch (role) {
    case 'Counsellor':
      return ['lead', 'counsellor', 'followup'];
    default:
      return State.allTabs;
  }
}

function updateTabVisibility() {
  const visible = getVisibleTabs(State.currentUser.role);
  document.querySelectorAll('.tab').forEach(tab => {
    tab.style.display = visible.includes(tab.dataset.tab) ? '' : 'none';
  });
  if (!visible.includes(State.activeTab)) {
    State.activeTab = visible[0];
  }
}

const fmt = {
  int(n) {
    if (n == null || isNaN(n) || !isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  },
  pct(n, d) { return (isFinite(n) && !isNaN(n) ? n : 0).toFixed(d || 1) + '%'; },
  dec(n, d) { return (isFinite(n) && !isNaN(n) ? n : 0).toFixed(d || 1); },
  date(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; },
  dateFull(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; },
  currency(n) { if (n == null || isNaN(n)) return '—'; return '₹' + Math.round(n).toLocaleString('en-IN'); }
};

const SECTION_DEFS = {
  lead: 'Lead Analytics provides an overview of the entire lead pipeline — from acquisition through enrollment. Use this section to track pipeline health, identify bottlenecks, and monitor lead volume trends.',
  counsellor: 'Counsellor Analytics measures individual counsellor productivity and performance. Use this section to identify top performers, compare workloads, and optimise team resource allocation.',
  followup: 'Follow-up Analytics tracks scheduled and overdue lead follow-ups. Use this section to monitor counsellor follow-up discipline and reduce lead stagnation.',
  source: 'Lead Source Analytics evaluates lead generation performance across all acquisition channels. Use this section to optimise marketing spend and identify high-enrolling sources.',
  geography: 'Geography Analytics reveals where prospective students are located. Use this section to target regional marketing efforts and understand demographic distribution.',
  application: 'Application Overview provides a summary of student applications, preferred destinations, and fee details across the pipeline.'
};

const METRIC_DEFS = {
  'total-leads': 'Total number of leads assigned within the selected scope. Calculation: Count of all leads. This is the primary volume metric for pipeline sizing.',
  'new-leads-today': 'Number of leads entered today. Calculation: Count of leads where entry date is today. Provides a snapshot of daily intake velocity.',
  'new-leads': 'Number of new leads generated in the selected period (default: last 7 days). Calculation: Count of leads entered within the period. Helps track acquisition momentum.',
  'active-leads': 'Leads currently active in the pipeline — not enrolled and not lost. Calculation: Total leads minus enrolled and lost. Measures current workload and opportunity pool.',
  'enrolled': 'Total number of leads that have enrolled. Calculation: Count of leads with Status = Enrolled. The primary success metric for the sales pipeline.',
  'pending-followups': 'Number of follow-ups scheduled for future dates and still pending. Calculation: Count of leads with a future follow-up date. Indicates upcoming counsellor workload.',
  'overdue-followups': 'Number of follow-ups past their scheduled date without completion. Calculation: Count of leads with a past follow-up date where status is not Enrolled or Lost/Dead. High numbers may indicate poor follow-up discipline.',
  'avg-calls': 'Average number of calls made per lead. Calculation: Sum of Calls ÷ Total Leads. Helps assess counsellor persistence and outreach effort.',
  'leads-assigned': 'Total number of leads assigned to counsellors or teams. Calculation: Count of all leads. Useful as a denominator for per-counsellor performance metrics.',
  'enrollment-rate': 'Percentage of assigned leads that have enrolled. Calculation: (Enrolled / Total Leads) × 100. The primary success metric for the sales pipeline.',
  'lost-leads': 'Number of leads lost during the selected period. Calculation: Count of leads with Status = Lost/Dead. Tracking lost leads helps identify objection patterns and churn.',
  'followups-due-today': 'Number of follow-ups scheduled for today. Calculation: Count of leads where follow-up date is today. Actionable metric for daily counsellor task planning.',
  'followups-due-tomorrow': 'Number of follow-ups scheduled for tomorrow. Calculation: Count of leads where follow-up date is tomorrow. Enables proactive planning.',
  'total-by-source': 'Total number of leads attributed to each acquisition source. Calculation: Count of leads grouped by Source. Helps evaluate which marketing channels drive volume.',
  'enrolled-by-source': 'Number of enrollments from each acquisition source. Calculation: Count of leads with Status = Enrolled, grouped by Source. Measures source quality beyond volume.',
  'enroll-rate-by-source': 'Enrollment rate comparison across acquisition sources. Calculation: (Enrolled per Source / Leads per Source) × 100. Identifies highest-value acquisition channels.',
  'best-source': 'The acquisition source with the highest enrollment rate (minimum 5 leads). Calculation: Source with max (Enrolled / Leads) where Leads ≥ 5. Quick reference for channel effectiveness.',
  'top-states': 'States with the highest number of leads. Calculation: Count of leads grouped by State, sorted descending. Useful for regional targeting and resource allocation.',
  'top-cities': 'Cities with the highest number of leads. Calculation: Count of leads grouped by City, sorted descending. Enables city-level marketing focus.',
  'chart-status-dist': 'Doughnut chart showing the breakdown of leads by their current pipeline status. Each segment represents a status group and its proportion of the total.',
  'chart-funnel': 'Horizontal funnel chart showing stage-by-stage lead progression from first contact through to enrollment. Each stage width is proportional to the number of leads reaching that stage.',
  'chart-leaderboard': 'Bar chart ranking counsellors by enrollment count. Shows top performers at a glance for management recognition and performance review.',
  'chart-calls-counsellor': 'Bar chart showing average calls per counsellor. Helps identify differences in outreach persistence across the team.',
  'chart-followup-timeline': 'Bar chart showing the upcoming follow-up schedule for the next 7 days. Each bar represents the number of follow-ups scheduled on that day.',
  'chart-overdue-dist': 'Bar chart showing overdue follow-ups grouped by counsellor. Identifies which counsellors have the most overdue follow-ups requiring attention.',
  'chart-calls-dist': 'Doughnut chart showing the distribution of leads by call ranges (0, 1-2, 3-5, 6-10, 10+). Helps understand outreach patterns.',
  'chart-source-dist': 'Doughnut chart showing lead volume distribution by acquisition source. Each segment represents a source and its share of total leads.',
  'chart-source-enroll-rate': 'Bar chart comparing enrollment rates across acquisition sources. Higher bars indicate sources with better conversion performance.',
  'chart-source-centre-comp': 'Grouped bar chart comparing lead volume and enrollment counts across source centres. High-level regional performance comparison.',
  'chart-state-dist': 'Bar chart showing the top states by lead volume. Useful for geographic targeting and understanding regional demand.',
  'chart-city-dist': 'Bar chart showing the top cities by lead volume. Enables city-level marketing and operational planning.'
};

function tooltipHtml(key) {
  const definition = METRIC_DEFS[key];
  if (!definition) return '';
  return `<span class="tooltip-wrap"><span class="info-btn" data-tooltip-key="${key}"><svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span><span class="tooltip-bubble">${escapeHtml(definition)}</span></span>`;
}

function sectionTooltipHtml(key) {
  const text = SECTION_DEFS[key];
  if (!text) return '';
  return `<span class="tooltip-wrap"><span class="info-btn" data-tooltip-key="section-${key}"><svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span><span class="tooltip-bubble">${escapeHtml(text)}</span></span>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function exportCSV(rows, filename) {
  if (!rows || !rows.length) { alert('No data to export for the current section.'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function kpiCardHtml(label, target, opts) {
  const o = opts || {};
  const icon = o.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>';
  const color = o.color || 'primary';
  const tooltip = o.tooltipKey ? tooltipHtml(o.tooltipKey) : '';
  const isPct = o.isPct;
  const sub = o.sub || '';
  const displayVal = isPct ? fmt.pct(target, 1) : (typeof target === 'string' ? escapeHtml(target) : fmt.int(target));
  return `<div class="kpi-card"><div class="kpi-top"><div class="kpi-icon" style="background:var(--${color}-tint);color:var(--${color})">${icon}</div>${o.badge ? `<span class="card-tag">${o.badge}</span>` : ''}</div><div class="kpi-label">${label}${tooltip}</div><div class="kpi-value">${displayVal}</div><div class="kpi-trend-row">${o.trend ? trendHtml(o.trend) : ''}${sub ? `<span class="kpi-sub">${sub}</span>` : ''}</div></div>`;
}

function cardHtml(title, sub, bodyHtml, tooltipKey) {
  const tooltip = tooltipKey ? tooltipHtml(tooltipKey) : '';
  return `<div class="card" style="margin-bottom:12px"><div class="card-head"><div><div class="card-title">${title}${tooltip}</div><div class="card-sub">${sub}</div></div></div>${bodyHtml}</div>`;
}

function emptyStateHtml(message, subtitle) {
  const sub = subtitle || 'Try adjusting or clearing the filters above.';
  return `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><div class="et">${escapeHtml(message)}</div><div class="et-sub">${escapeHtml(sub)}</div></div>`;
}

function trendHtml(trend) {
  if (!trend) return '';
  const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
  const color = trend.direction === 'up' ? 'var(--success)' : trend.direction === 'down' ? 'var(--danger)' : 'var(--text-muted)';
  return `<span class="trend-indicator" style="color:${color}">${arrow} ${trend.value}%</span>`;
}

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function statusBadge(status) {
  const cls = CFG.statusClass[status] || 'st-default';
  return `<span class="badge ${cls}">${status}</span>`;
}

function iconUsers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>'; }
function iconPhone() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'; }
function iconCheck() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconTarget() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'; }
function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }
function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'; }
function iconBarChart() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'; }
function iconMap() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'; }
function iconTrendingUp() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'; }

function drawChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    const parent = canvas.parentElement;
    if (parent && !parent.querySelector('.empty-state')) {
      parent.innerHTML = emptyStateHtml('Chart library not loaded.');
    }
    return;
  }
  const hasData = config && config.data && Array.isArray(config.data.datasets) &&
    config.data.datasets.some(ds => Array.isArray(ds.data) && ds.data.some(v => v > 0));
  if (!hasData) {
    const parent = canvas.parentElement;
    if (parent) {
      parent.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    }
    return;
  }
  try {
    if (State.charts[canvasId]) { State.charts[canvasId].destroy(); delete State.charts[canvasId]; }
    config.data.datasets.forEach(ds => {
      if (Array.isArray(ds.data)) ds.data = ds.data.map(v => (v === null || v === undefined || isNaN(v) || !isFinite(v)) ? 0 : v);
    });
    State.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
  } catch (err) {
    console.error('Chart error:', err);
  }
}

function drawFunnel(containerId, stages) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const max = stages.length ? stages[0].count : 1;
  const hasData = stages.some(s => s.count > 0);
  if (!hasData) {
    container.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }
  container.innerHTML = `<div class="funnel">${stages.map((s, i) => {
    const pct = max ? (s.count / max) * 100 : 0;
    return `<div class="funnel-row"><div class="funnel-label">${s.stage}</div><div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(pct, 6)}%;background:${CFG.palette[i % CFG.palette.length]}">${s.count}</div></div><div class="funnel-pct">${i === 0 ? '100%' : fmt.pct(stages[0].count ? (s.count / stages[0].count) * 100 : 0, 0)}</div></div>`;
  }).join('')}</div>`;
}

// ============================================================
// EXECUTIVE KPIs
// ============================================================

function renderExecutiveKpis(leads) {
  const container = document.getElementById('executiveKpis');
  if (!container) return;
  if (!leads.length) {
    container.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  container.innerHTML =
    kpiCardHtml('Total Leads', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), tooltipKey: 'total-leads' }) +
    kpiCardHtml('New Leads (7d)', Calc.newLeadsPeriod(leads, 7), { color: 'info', icon: iconBarChart(), tooltipKey: 'new-leads' }) +
    kpiCardHtml('Active Leads', Calc.activeLeads(leads), { color: 'teal', icon: iconTarget(), tooltipKey: 'active-leads' }) +
    kpiCardHtml('Lost / Dead', Calc.lost(leads), { color: 'danger', icon: iconAlert(), tooltipKey: 'lost-leads' }) +
    kpiCardHtml('Enrolled', Calc.enrolled(leads), { color: 'success', icon: iconCheck(), tooltipKey: 'enrolled' }) +
    kpiCardHtml('Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'warning', icon: iconClock(), tooltipKey: 'pending-followups' }) +
    kpiCardHtml('Avg Calls', Calc.averageCalls(leads), { color: 'slate', icon: iconPhone(), tooltipKey: 'avg-calls', sub: fmt.dec(Calc.averageCalls(leads), 1) + ' per lead' }) +
    kpiCardHtml('Enrollment Rate', Calc.enrollmentRate(leads), { color: 'purple', icon: iconTrendingUp(), tooltipKey: 'enrollment-rate', isPct: true });
}

// ============================================================
// 1. LEAD ANALYTICS
// ============================================================

function renderLeadAnalytics(leads) {
  const panel = document.getElementById('panel-lead');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const statusDist = Calc.statusDistribution(leads);
  const funnel = Calc.funnelStages(leads);

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Lead Analytics${sectionTooltipHtml('lead')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Total Leads', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), tooltipKey: 'total-leads' })}
      ${kpiCardHtml('New Leads (7d)', Calc.newLeadsPeriod(leads, 7), { color: 'info', icon: iconBarChart(), tooltipKey: 'new-leads' })}
      ${kpiCardHtml('Active Leads', Calc.activeLeads(leads), { color: 'teal', icon: iconTarget(), tooltipKey: 'active-leads' })}
      ${kpiCardHtml('Enrolled', Calc.enrolled(leads), { color: 'success', icon: iconCheck(), tooltipKey: 'enrolled' })}
      ${kpiCardHtml('Lost / Dead', Calc.lost(leads), { color: 'danger', icon: iconAlert(), tooltipKey: 'lost-leads' })}
      ${kpiCardHtml('Enrollment Rate', Calc.enrollmentRate(leads), { color: 'purple', icon: iconTrendingUp(), tooltipKey: 'enrollment-rate', isPct: true })}
    </div>
    <div class="grid-2b">
      ${cardHtml('Lead Status Distribution', 'Current breakdown by pipeline status', '<div class="chart-wrap h260"><canvas id="chart-lead-status"></canvas></div>', 'chart-status-dist')}
      ${cardHtml('Lead Conversion Funnel', 'Stage-by-stage progression', '<div id="funnel-lead" style="padding-top:6px"></div>', 'chart-funnel')}
    </div>`;

  drawChart('chart-lead-status', {
    type: 'doughnut',
    data: {
      labels: statusDist.map(d => d.status),
      datasets: [{ data: statusDist.map(d => d.count), backgroundColor: CFG.palette, borderWidth: 1, borderColor: '#0c0c0e' }]
    },
    options: Charts.donutOpts()
  });

  drawFunnel('funnel-lead', funnel);
}

// ============================================================
// 2. COUNSELLOR ANALYTICS
// ============================================================

function renderCounsellorAnalytics(leads) {
  const panel = document.getElementById('panel-counsellor');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const councillors = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');
  const perf = Calc.counsellorPerformance(leads, councillors).sort((a, b) => b.assigned - a.assigned);

  const totalCounsellors = councillors.length;
  const assignedLeads = Calc.totalAssigned(leads);
  const unassignedLeads = leads.filter(l => !l.counsellorId || l.counsellorName === 'Unassigned').length;
  const avgLeadsPerCounsellor = totalCounsellors ? assignedLeads / totalCounsellors : 0;

  const showComparison = perf.length > 1;

  const stackStatuses = ['DNP 1', 'DNP 3', 'NATC', 'Cold Lead', 'Warm Lead', 'Hot Lead', 'Interested', 'Call Back', 'Consultation Booked', 'Applied', 'Enrolled', 'Lost/Dead'];
  const stackColors = {
    'DNP 1': '#64748b', 'DNP 3': '#94a3b8', 'NATC': '#a78bfa', 'Cold Lead': '#60a5fa',
    'Warm Lead': '#34d399', 'Hot Lead': '#f87171', 'Interested': '#22d3ee',
    'Call Back': '#eab308', 'Consultation Booked': '#a855f7', 'Applied': '#3b82f6',
    'Enrolled': '#4ade80', 'Lost/Dead': '#f87171'
  };

  const statusData = perf.map(p => {
    const cl = leads.filter(l => l.counsellorId === p.id);
    const counts = {};
    stackStatuses.forEach(s => { counts[s] = 0; });
    cl.forEach(l => { if (stackStatuses.includes(l.status)) counts[l.status]++; });
    return { name: p.name, assigned: p.assigned, avgCalls: p.avgCalls, statusCounts: counts };
  });

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Counsellor Analytics${sectionTooltipHtml('counsellor')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Total Counsellors', totalCounsellors, { color: 'primary', icon: iconUsers() })}
      ${kpiCardHtml('Assigned Leads', assignedLeads, { color: 'teal', icon: iconTarget() })}
      ${kpiCardHtml('Unassigned Leads', unassignedLeads, { color: 'warning', icon: iconAlert() })}
      ${kpiCardHtml('Average Leads per Counsellor', avgLeadsPerCounsellor, { color: 'purple', icon: iconBarChart(), sub: fmt.dec(avgLeadsPerCounsellor, 1) + ' per counsellor' })}
    </div>
    ${showComparison ? `
    <div class="grid-3">
      ${cardHtml('Leads per Counsellor', 'Total assigned leads by counsellor', '<div class="chart-wrap h260"><canvas id="chart-leads-per-counsellor"></canvas></div>')}
      ${cardHtml('Lead Status Distribution by Counsellor', 'Status breakdown per counsellor', '<div class="chart-wrap h260"><canvas id="chart-counsellor-status-dist"></canvas></div>')}
      ${cardHtml('Average Calls by Counsellor', 'Call effort per counsellor', '<div class="chart-wrap h260"><canvas id="chart-counsellor-calls"></canvas></div>', 'chart-calls-counsellor')}
    </div>` : `
    <div class="empty-state" style="margin-bottom:12px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      <div class="et">Insufficient counsellors for comparison</div>
      <div class="et-sub">Counsellor comparison charts require more than one counsellor with assigned leads.</div>
    </div>`}`;

  if (showComparison) {
    drawChart('chart-leads-per-counsellor', {
      type: 'bar',
      data: {
        labels: perf.map(p => p.name),
        datasets: [Charts.barDS('Assigned Leads', perf.map(p => p.assigned), CFG.chartColors.primary)]
      },
      options: Charts.barOpts()
    });

    drawChart('chart-counsellor-status-dist', {
      type: 'bar',
      data: {
        labels: statusData.map(d => d.name),
        datasets: stackStatuses.map(s => ({
          label: s,
          data: statusData.map(d => d.statusCounts[s]),
          backgroundColor: stackColors[s],
          borderRadius: 0,
          maxBarThickness: 24
        }))
      },
      options: Charts.stackOpts()
    });

    drawChart('chart-counsellor-calls', {
      type: 'bar',
      data: {
        labels: perf.map(p => p.name),
        datasets: [Charts.barDS('Avg Calls', perf.map(p => p.avgCalls), CFG.chartColors.warning)]
      },
      options: Charts.barOpts()
    });
  }
}

// ============================================================
// 3. FOLLOW-UP ANALYTICS
// ============================================================

function renderFollowupAnalytics(leads) {
  const panel = document.getElementById('panel-followup');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const dueToday = Calc.followupsDueToday(leads);
  const dueTomorrow = Calc.followupsDueTomorrow(leads);
  const overdue = Calc.overdueFollowups(leads);
  const avgCalls = Calc.averageCalls(leads);
  const timeline = Calc.followupTimeline(leads);
  const callDist = Calc.callsDistribution(leads);

  const upcomingByCounsellor = Calc.groupBy(leads.filter(l => l.followUpDate && l.followUpDate >= CFG.today && Calc._isActive(l)), l => l.counsellorName);
  const upcomingDist = [];
  upcomingByCounsellor.forEach((group, name) => { upcomingDist.push({ counsellor: name, count: group.length }); });
  upcomingDist.sort((a, b) => b.count - a.count);

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Follow-up Analytics${sectionTooltipHtml('followup')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Follow-ups Due Today', dueToday, { color: 'warning', icon: iconClock(), tooltipKey: 'followups-due-today' })}
      ${kpiCardHtml('Follow-ups Due Tomorrow', dueTomorrow, { color: 'info', icon: iconClock(), tooltipKey: 'followups-due-tomorrow' })}
      ${kpiCardHtml('Overdue Follow-ups', overdue, { color: 'danger', icon: iconAlert(), tooltipKey: 'overdue-followups' })}
      ${kpiCardHtml('Average Calls', avgCalls, { color: 'slate', icon: iconPhone(), tooltipKey: 'avg-calls' })}
    </div>
    <div class="grid-3">
      ${cardHtml('Upcoming Follow-up Timeline', 'Next 7 days schedule', '<div class="chart-wrap h260"><canvas id="chart-followup-timeline"></canvas></div>', 'chart-followup-timeline')}
      ${cardHtml('Upcoming Follow-up Distribution', 'By counsellor', '<div class="chart-wrap h260"><canvas id="chart-upcoming-dist"></canvas></div>')}
      ${cardHtml('Calls Distribution', 'Breakdown across leads', '<div class="chart-wrap h260"><canvas id="chart-call-dist"></canvas></div>', 'chart-calls-dist')}
    </div>`;

  drawChart('chart-followup-timeline', {
    type: 'bar',
    data: {
      labels: timeline.labels,
      datasets: [Charts.barDS('Follow-ups', timeline.counts, CFG.chartColors.warning)]
    },
    options: Charts.barOpts()
  });

  drawChart('chart-upcoming-dist', {
    type: 'bar',
    data: {
      labels: upcomingDist.map(d => d.counsellor),
      datasets: [Charts.barDS('Upcoming', upcomingDist.map(d => d.count), CFG.chartColors.info)]
    },
    options: Charts.barOpts()
  });

  drawChart('chart-call-dist', {
    type: 'doughnut',
    data: {
      labels: callDist.map(d => d.label + ' calls'),
      datasets: [{ data: callDist.map(d => d.count), backgroundColor: [CFG.chartColors.slate, CFG.chartColors.info, CFG.chartColors.warning, CFG.chartColors.danger, CFG.chartColors.purple], borderWidth: 1, borderColor: '#0c0c0e' }]
    },
    options: Charts.donutOpts()
  });
}

// ============================================================
// 4. LEAD SOURCE ANALYTICS
// ============================================================

function renderSourceAnalytics(leads) {
  const panel = document.getElementById('panel-source');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const sources = window.IntelAbroadData.sources;
  const srcPerf = Calc.sourcePerformance(leads, sources);
  const centres = window.IntelAbroadData.sourceCentres;
  const centrePerf = Calc.sourceCentrePerformance(leads, centres);

  const totalBySource = srcPerf.reduce((s, r) => s + r.assigned, 0);
  const topSource = srcPerf.reduce((best, s) => s.assigned > best.assigned ? s : best, srcPerf[0] || { source: '—', assigned: 0 });
  const sortedSources = [...srcPerf].sort((a, b) => b.assigned - a.assigned);

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Lead Source Analytics${sectionTooltipHtml('source')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Total Leads by Source', totalBySource, { color: 'primary', icon: iconUsers(), tooltipKey: 'total-by-source' })}
      ${kpiCardHtml('Enrolled by Source', srcPerf.reduce((s, r) => s + r.enrolled, 0), { color: 'success', icon: iconCheck(), tooltipKey: 'enrolled-by-source' })}
      ${kpiCardHtml('Enrollment Rate', Calc.enrollmentRate(leads), { color: 'purple', icon: iconTarget(), tooltipKey: 'enroll-rate-by-source', isPct: true })}
      ${kpiCardHtml('Top Lead Source', topSource.source, { color: 'warning', icon: iconTarget(), sub: fmt.int(topSource.assigned) + ' leads' })}
    </div>
    <div class="grid-3">
      ${cardHtml('Lead Source Distribution', 'Volume by acquisition source', '<div class="chart-wrap h260"><canvas id="chart-source-dist"></canvas></div>', 'chart-source-dist')}
      ${cardHtml('Top Lead Sources', 'Ranked by lead volume', '<div class="chart-wrap h260"><canvas id="chart-top-sources"></canvas></div>')}
      ${cardHtml('Source Centre Comparison', 'Lead & enrollment performance', '<div class="chart-wrap h260"><canvas id="chart-centre-compare"></canvas></div>', 'chart-source-centre-comp')}
    </div>`;

  drawChart('chart-source-dist', {
    type: 'doughnut',
    data: {
      labels: srcPerf.map(s => s.source),
      datasets: [{ data: srcPerf.map(s => s.assigned), backgroundColor: CFG.palette, borderWidth: 1, borderColor: '#0c0c0e' }]
    },
    options: Charts.donutOpts()
  });

  drawChart('chart-top-sources', {
    type: 'bar',
    data: {
      labels: sortedSources.map(s => s.source),
      datasets: [Charts.barDS('Leads', sortedSources.map(s => s.assigned), CFG.chartColors.primary)]
    },
    options: Charts.barOpts()
  });

  drawChart('chart-centre-compare', {
    type: 'bar',
    data: {
      labels: centrePerf.map(c => c.centre),
      datasets: [
        Charts.barDS('Leads', centrePerf.map(c => c.assigned), CFG.chartColors.primary),
        Charts.barDS('Enrolled', centrePerf.map(c => c.enrolled), CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });
}

// ============================================================
// 5. GEOGRAPHY ANALYTICS
// ============================================================

function renderGeographyAnalytics(leads) {
  const panel = document.getElementById('panel-geography');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const statesDist = Calc.stateDistribution(leads);
  const citiesDist = Calc.cityDistribution(leads);
  const topStates = Calc.topValues(statesDist, 5);
  const topCities = Calc.topValues(citiesDist, 5);

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Geography Analytics${sectionTooltipHtml('geography')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Top State', topStates.length ? topStates[0].dimension : '—', { color: 'primary', icon: iconMap(), tooltipKey: 'top-states', sub: topStates.length ? fmt.int(topStates[0].count) + ' Leads' : '' })}
      ${kpiCardHtml('Top City', topCities.length ? topCities[0].dimension : '—', { color: 'info', icon: iconMap(), tooltipKey: 'top-cities', sub: topCities.length ? fmt.int(topCities[0].count) + ' Leads' : '' })}
      ${kpiCardHtml('States Covered', statesDist.length, { color: 'teal', icon: iconMap() })}
      ${kpiCardHtml('Cities Covered', citiesDist.length, { color: 'purple', icon: iconMap() })}
    </div>
    <div class="grid-2b">
      ${cardHtml('State-wise Lead Distribution', 'Top states by lead volume', '<div class="chart-wrap h260"><canvas id="chart-state-dist"></canvas></div>', 'chart-state-dist')}
      ${cardHtml('City-wise Lead Distribution', 'Top cities by lead volume', '<div class="chart-wrap h260"><canvas id="chart-city-dist"></canvas></div>', 'chart-city-dist')}
    </div>`;

  drawChart('chart-state-dist', {
    type: 'bar',
    data: {
      labels: topStates.map(r => r.dimension),
      datasets: [Charts.barDS('Leads', topStates.map(r => r.count), CFG.chartColors.primary)]
    },
    options: Charts.barOpts()
  });

  drawChart('chart-city-dist', {
    type: 'bar',
    data: {
      labels: topCities.map(r => r.dimension),
      datasets: [Charts.barDS('Leads', topCities.map(r => r.count), CFG.chartColors.info)]
    },
    options: Charts.barOpts()
  });
}

// ============================================================
// 6. APPLICATION OVERVIEW
// ============================================================

function renderApplicationAnalytics(leads) {
  const panel = document.getElementById('panel-application');
  if (!panel) return;
  if (!leads.length) {
    panel.innerHTML = emptyStateHtml('No analytics available for the selected filters.');
    return;
  }

  const applied = leads.filter(l => l.status === 'Applied' || l.status === 'Enrolled' || l.status === 'Documents Submitted');
  const enrolled = leads.filter(l => l.status === 'Enrolled');
  const totalFee = applied.reduce((s, l) => s + (l.fee || 0), 0);
  const visaGranted = leads.filter(l => l.visa === 'Yes').length;

  const countriesMap = Calc.groupBy(leads, l => l.preferredCountry || 'Unknown');
  const countriesData = [];
  countriesMap.forEach((group, country) => {
    countriesData.push({ country, count: group.length });
  });
  countriesData.sort((a, b) => b.count - a.count);

  const topCountries = countriesData.slice(0, 5);

  panel.innerHTML = `
    <div class="section-title-row" style="margin-bottom:12px"><h2 class="section-title">Application Overview${sectionTooltipHtml('application')}</h2></div>
    <div class="kpi-grid kpi-grid-4">
      ${kpiCardHtml('Applications Submitted', applied.length, { color: 'primary', icon: iconCheck() })}
      ${kpiCardHtml('Enrolled', enrolled.length, { color: 'success', icon: iconTarget() })}
      ${kpiCardHtml('Total Fee Collected', totalFee, { color: 'purple', icon: iconBarChart(), sub: fmt.currency(totalFee) })}
      ${kpiCardHtml('Visa Granted', visaGranted, { color: 'info', icon: iconCheck() })}
    </div>
    <div class="grid-2b">
      ${cardHtml('Top Preferred Countries', 'Most popular study destinations', '<div class="chart-wrap h260"><canvas id="chart-top-countries"></canvas></div>')}
      ${cardHtml('Visa Status Distribution', 'Visa processing overview', '<div class="chart-wrap h260"><canvas id="chart-visa-dist"></canvas></div>')}
    </div>`;

  drawChart('chart-top-countries', {
    type: 'bar',
    data: {
      labels: topCountries.map(r => r.country),
      datasets: [Charts.barDS('Leads', topCountries.map(r => r.count), CFG.chartColors.primary)]
    },
    options: Charts.barOpts()
  });

  const visaDist = [
    { label: 'Yes', count: visaGranted },
    { label: 'In Progress', count: leads.filter(l => l.visa === 'In Progress').length },
    { label: 'No', count: leads.filter(l => l.visa === 'No').length }
  ];

  drawChart('chart-visa-dist', {
    type: 'doughnut',
    data: {
      labels: visaDist.map(d => d.label),
      datasets: [{ data: visaDist.map(d => d.count), backgroundColor: [CFG.chartColors.success, CFG.chartColors.warning, CFG.chartColors.slate], borderWidth: 1, borderColor: '#0c0c0e' }]
    },
    options: Charts.donutOpts()
  });
}

// ============================================================
// TAB SWITCHING
// ============================================================

function switchTab(tabName) {
  const visible = getVisibleTabs(State.currentUser.role);
  if (!visible.includes(tabName)) tabName = visible[0];
  const panels = document.querySelectorAll('.tab-panel');
  panels.forEach(p => p.classList.remove('active'));
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));
  const activePanel = document.getElementById('panel-' + tabName);
  if (activePanel) activePanel.classList.add('active');
  const activeTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');
  State.activeTab = tabName;
  renderActiveTab(State.filtered);
}

function renderActiveTab(leads) {
  switch (State.activeTab) {
    case 'lead': renderLeadAnalytics(leads); break;
    case 'counsellor': renderCounsellorAnalytics(leads); break;
    case 'followup': renderFollowupAnalytics(leads); break;
    case 'source': renderSourceAnalytics(leads); break;
    case 'geography': renderGeographyAnalytics(leads); break;
    case 'application': renderApplicationAnalytics(leads); break;
  }
}

// ============================================================
// SECTION-SPECIFIC EXPORT
// ============================================================

function exportCurrentSection() {
  const leads = State.filtered;
  if (!leads.length) { alert('No data to export for the current section.'); return; }

  const tab = State.activeTab;
  let rows, filename;

  switch (tab) {
    case 'lead':
      rows = leads.map(l => ({
        LeadID: l.id, StudentName: l.studentName, Phone: l.phone, Source: l.source,
        Status: l.status, EntryDate: fmt.dateFull(l.entryDate),
        Calls: l.calls, Enrolled: l.status === 'Enrolled' ? 'Yes' : 'No'
      }));
      filename = 'lead_analytics.csv';
      break;

    case 'counsellor':
      const councillors = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');
      const perf = Calc.counsellorPerformance(leads, councillors);
      rows = perf.filter(p => p.assigned > 0).map(p => ({
        Counsellor: p.name, Centre: p.centre, LeadsAssigned: p.assigned,
        ActiveLeads: p.active, Enrolled: p.enrolled,
        EnrollmentRate: fmt.pct(p.enrollmentRate), AvgCalls: fmt.dec(p.avgCalls)
      }));
      filename = 'counsellor_analytics.csv';
      break;

    case 'followup':
      const today = CFG.today;
      rows = leads.filter(l => l.followUpDate).map(l => ({
        LeadID: l.id, StudentName: l.studentName, Counsellor: l.counsellorName,
        FollowUpDate: fmt.dateFull(l.followUpDate), Status: l.status,
        Calls: l.calls,
        Overdue: l.followUpDate < today && Calc._isActive(l) ? 'Yes' : 'No'
      }));
      filename = 'followup_analytics.csv';
      break;

    case 'source':
      const sources = window.IntelAbroadData.sources;
      const srcPerf = Calc.sourcePerformance(leads, sources);
      rows = srcPerf.map(s => ({
        Source: s.source, Leads: s.assigned, Enrolled: s.enrolled,
        EnrollmentRate: fmt.pct(s.enrollmentRate)
      }));
      filename = 'source_analytics.csv';
      break;

    case 'geography':
      rows = leads.map(l => ({
        LeadID: l.id, StudentName: l.studentName, State: l.state,
        City: l.city, Status: l.status
      }));
      filename = 'geography_analytics.csv';
      break;

    case 'application':
      rows = leads.map(l => ({
        LeadID: l.id, StudentName: l.studentName, Status: l.status,
        PreferredCountry: l.preferredCountry, PreferredUniversity: l.preferredUniversity,
        Fee: l.fee, Visa: l.visa, Calls: l.calls
      }));
      filename = 'application_overview.csv';
      break;

    default:
      rows = leads.map(l => ({
        LeadID: l.id, StudentName: l.studentName, Phone: l.phone, Source: l.source,
        Status: l.status, EntryDate: fmt.dateFull(l.entryDate)
      }));
      filename = 'insights_export.csv';
  }

  exportCSV(rows, filename);
}

// ============================================================
// FILTERS
// ============================================================

function applyFilters() {
  const f = State.filters;
  const user = State.currentUser;

  let allowedLeads = window.IntelAbroadData.leads;

  if (user.role === 'Counsellor') {
    f.sourceCentre = user.sourceCentre;
    f.counsellor = user.id;
  } else if (user.role === 'TeamLead') {
    f.sourceCentre = user.sourceCentre;
    const teamMembers = window.IntelAbroadData.staff.filter(s => s.reportsTo === user.id || s.id === user.id).map(s => s.id);
    allowedLeads = allowedLeads.filter(l => teamMembers.includes(l.counsellorId));
    if (f.counsellor !== 'all' && !teamMembers.includes(f.counsellor)) f.counsellor = 'all';
  } else if (user.role === 'BranchManager') {
    f.sourceCentre = user.sourceCentre;
    allowedLeads = allowedLeads.filter(l => l.sourceCentre === user.sourceCentre);
  }

  State.filtered = allowedLeads.filter(l => {
    const targetDate = l.entryDate;
    if (!targetDate && (f.from || f.to)) return false;
    if (f.from && targetDate < f.from) return false;
    if (f.to && targetDate > f.to) return false;
    if (f.sourceCentre !== 'all' && l.sourceCentre !== f.sourceCentre) return false;
    if (f.counsellor !== 'all' && l.counsellorId !== f.counsellor) return false;
    if (f.source !== 'all' && l.source !== f.source) return false;
    if (f.status !== 'all' && l.status !== f.status) return false;
    return true;
  });
}

function renderChips() {
  const f = State.filters;
  const user = State.currentUser;
  const chips = [];
  if (f.from) chips.push(['From: ' + fmt.date(f.from), 'from']);
  if (f.to) chips.push(['To: ' + fmt.date(f.to), 'to']);
  if (user.role !== 'Counsellor' && f.counsellor !== 'all') {
    const s = window.IntelAbroadData.staff.find(s => s.id === f.counsellor);
    chips.push(['Counsellor: ' + (s ? s.name : f.counsellor), 'counsellor']);
  }
  if (f.source !== 'all') chips.push(['Source: ' + f.source, 'source']);
  if (f.status !== 'all') chips.push(['Status: ' + f.status, 'status']);

  const row = document.getElementById('chipRow');
  if (!row) return;
  row.innerHTML = chips.map(pair => '<span class="chip">' + escapeHtml(pair[0]) + '<button data-clear="' + pair[1] + '">✕</button></span>').join('');
  row.querySelectorAll('button[data-clear]').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.clear;
      if (key === 'from') { f.from = null; document.getElementById('fDateFrom').value = ''; }
      else if (key === 'to') { f.to = null; document.getElementById('fDateTo').value = ''; }
      else if (key === 'counsellor') { f.counsellor = 'all'; document.getElementById('fCounsellor').value = 'all'; }
      else if (key === 'source') { f.source = 'all'; document.getElementById('fSource').value = 'all'; }
      else if (key === 'status') { f.status = 'all'; document.getElementById('fStatus').value = 'all'; }
      runPipeline();
    });
  });
}

function refreshDynamicFilters() {
  const leads = window.IntelAbroadData.leads;
  const unique = (field) => { const s = new Set(leads.map(l => l[field]).filter(Boolean)); return Array.from(s).sort(); };

  const statusSel = document.getElementById('fStatus');
  const sourceSel = document.getElementById('fSource');

  if (statusSel) {
    const current = statusSel.value;
    statusSel.innerHTML = '<option value="all">All Statuses</option>';
    unique('status').forEach(v => statusSel.appendChild(new Option(v, v)));
    statusSel.value = current !== 'all' && unique('status').includes(current) ? current : 'all';
  }
  if (sourceSel) {
    const current = sourceSel.value;
    sourceSel.innerHTML = '<option value="all">Any Source</option>';
    unique('source').forEach(v => sourceSel.appendChild(new Option(v, v)));
    sourceSel.value = current !== 'all' && unique('source').includes(current) ? current : 'all';
  }

  updateSourcePillMenu();
}

function updateSourcePillMenu() {
  const menu = document.getElementById('sourceMenu');
  if (!menu) return;
  const centres = window.IntelAbroadData.sourceCentres || [];
  const current = menu.querySelector('.dropdown-item.active');
  const currentVal = current ? current.dataset.val : 'all';
  menu.innerHTML = '<button class="dropdown-item" data-val="all">All Centres</button>';
  centres.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'dropdown-item';
    btn.dataset.val = c;
    btn.textContent = c;
    if (c === currentVal) btn.classList.add('active');
    btn.addEventListener('click', () => {
      State.filters.sourceCentre = c;
      document.querySelector('.branch-name-text').textContent = c;
      document.querySelectorAll('#sourceMenu .dropdown-item').forEach(i => i.classList.remove('active'));
      btn.classList.add('active');
      runPipeline();
    });
    menu.appendChild(btn);
  });
}

function runPipeline() {
  applyFilters();
  renderChips();
  const leads = State.filtered;
  renderExecutiveKpis(leads);
  renderActiveTab(leads);
  updateLastUpdatedText();
}

function updateLastUpdatedText() {
  const node = document.getElementById('lastUpdated');
  if (node) node.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function updateDataSourceBadge() {
  const badge = document.getElementById('dataSourceBadge');
  if (!badge) return;
  if (DataLoader.source === 'excel') {
    badge.textContent = 'Real Data' + (DataLoader.fileName ? ' — ' + DataLoader.fileName : '');
    badge.className = 'data-source-badge real';
  } else {
    badge.textContent = 'Demo Data';
    badge.className = 'data-source-badge';
  }
}

// ============================================================
// DROPDOWNS
// ============================================================

function populateFilterOptions() {
  refreshDynamicFilters();
}

function readFiltersFromForm() {
  const f = State.filters;
  f.from = document.getElementById('fDateFrom')?.value ? new Date(document.getElementById('fDateFrom').value) : null;
  f.to = document.getElementById('fDateTo')?.value ? new Date(document.getElementById('fDateTo').value + 'T23:59:59') : null;
  f.counsellor = document.getElementById('fCounsellor')?.value || 'all';
  f.source = document.getElementById('fSource')?.value || 'all';
  f.status = document.getElementById('fStatus')?.value || 'all';
}

function updateAssigneeDropdownOptions() {
  const user = State.currentUser;
  const select = document.getElementById('fCounsellor');
  if (!select) return;
  select.innerHTML = '<option value="all">Any Assignee</option>';
  let allowedStaff = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');
  if (user.role === 'BranchManager') allowedStaff = allowedStaff.filter(s => s.sourceCentre === user.sourceCentre);
  else if (user.role === 'TeamLead') allowedStaff = allowedStaff.filter(s => s.reportsTo === user.id || s.id === user.id);
  else if (user.role === 'Counsellor') allowedStaff = allowedStaff.filter(s => s.id === user.id);
  allowedStaff.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => select.appendChild(new Option(s.name, s.id)));
  if (user.role === 'Counsellor') { select.disabled = true; select.value = user.id; }
  else { select.disabled = false; select.value = State.filters.counsellor; }
}

function updateSourceDropdownOptions() {
  const user = State.currentUser;
  const pill = document.getElementById('sourcePill');
  const menu = document.getElementById('sourceMenu');
  if (!pill) return;
  if (user.role === 'Founder') {
    pill.style.pointerEvents = 'auto';
    pill.querySelector('svg').style.display = 'block';
    pill.querySelector('.branch-name-text').textContent = State.filters.sourceCentre === 'all' ? 'All Centres' : State.filters.sourceCentre;
  } else {
    pill.style.pointerEvents = 'none';
    pill.querySelector('svg').style.display = 'none';
    pill.querySelector('.branch-name-text').textContent = user.sourceCentre;
    State.filters.sourceCentre = user.sourceCentre;
  }
}

// ============================================================
// EXCEL UPLOAD HANDLING
// ============================================================

function handleExcelUpload(file) {
  DataLoader.parseExcelFile(file).then(result => {
    DataLoader.applyDataset(result.leads, result.meta);
    DataLoader.fileName = file.name;
    refreshDynamicFilters();
    updateDataSourceBadge();
    updateAssigneeDropdownOptions();
    runPipeline();
  }).catch(err => {
    alert('Failed to parse file: ' + err.message);
  });
}

function handleReloadDemo() {
  DataLoader.resetToDemo();
  refreshDynamicFilters();
  updateDataSourceBadge();
  updateAssigneeDropdownOptions();
  runPipeline();
}

// ============================================================
// INIT
// ============================================================

function wireEvents() {
  const sourcePill = document.getElementById('sourcePill');
  const sourceMenu = document.getElementById('sourceMenu');
  if (sourcePill && sourceMenu) {
    sourcePill.addEventListener('click', e => { e.stopPropagation(); sourceMenu.classList.toggle('show'); });
    sourceMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        State.filters.sourceCentre = item.dataset.val;
        sourcePill.querySelector('.branch-name-text').textContent = item.dataset.val === 'all' ? 'All Centres' : item.dataset.val;
        sourceMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        runPipeline();
      });
    });
  }

  document.addEventListener('click', () => { sourceMenu?.classList.remove('show'); });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => { const tn = tab.dataset.tab; if (tn) switchTab(tn); });
  });

  const roleSwitcher = document.getElementById('demoRoleSwitcher');
  if (roleSwitcher) {
    roleSwitcher.addEventListener('change', () => {
      const val = roleSwitcher.value;
      const staffList = window.IntelAbroadData.staff || [];
      let user;
      if (val === 'Founder') {
        user = { role: 'Founder', name: 'Dr. Suhail', id: 'S001', sourceCentre: 'all' };
      } else {
        const candidate = staffList.find(s => s.role === val);
        if (candidate) {
          user = { role: val, name: candidate.name, id: candidate.id, sourceCentre: candidate.sourceCentre || 'all' };
        } else {
          user = { role: val, name: val, id: 'X-' + val, sourceCentre: 'all' };
        }
      }
      State.currentUser = user;
      document.getElementById('sidebarProfileName').textContent = user.name;
      document.getElementById('sidebarProfileEmail').textContent =
        user.role === 'Founder' ? 'founder@intelabroad.com' : user.name.toLowerCase().replace(/\s+/g, '.') + '@intelabroad.com';
      State.filters.sourceCentre = user.sourceCentre;
      State.filters.counsellor = 'all';
      updateTabVisibility();
      updateSourceDropdownOptions();
      updateAssigneeDropdownOptions();
      runPipeline();
    });
  }

  document.getElementById('applyFiltersBtn')?.addEventListener('click', () => { readFiltersFromForm(); runPipeline(); });
  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    ['fDateFrom', 'fDateTo'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['fCounsellor', 'fSource', 'fStatus'].forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
    State.filters.from = null; State.filters.to = null; State.filters.counsellor = 'all';
    State.filters.source = 'all'; State.filters.status = 'all';
    runPipeline();
  });

  document.getElementById('exportCsvBtn')?.addEventListener('click', exportCurrentSection);
  document.getElementById('printBtn')?.addEventListener('click', () => { window.print(); });

  document.getElementById('excelUpload')?.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) handleExcelUpload(e.target.files[0]);
  });

  document.getElementById('reloadDemoBtn')?.addEventListener('click', handleReloadDemo);

  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.toggle('open'); });
    document.addEventListener('click', () => { sidebar.classList.remove('open'); });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.info-btn');
    if (btn) {
      e.stopPropagation();
      const isActive = btn.classList.contains('active');
      document.querySelectorAll('.info-btn.active').forEach(b => b.classList.remove('active'));
      if (!isActive) btn.classList.add('active');
    } else {
      document.querySelectorAll('.info-btn.active').forEach(b => b.classList.remove('active'));
    }
  });
}

async function initUI() {
  try {
    await DataLoader.loadFromDefaultUrl();
  } catch (e) {
    // CSV not available, demo data already loaded by demo-data.js
  }
  updateDataSourceBadge();
  populateFilterOptions();
  readFiltersFromForm();
  wireEvents();
  updateTabVisibility();
  updateSourceDropdownOptions();
  updateAssigneeDropdownOptions();
  runPipeline();
}

document.addEventListener('DOMContentLoaded', initUI);
