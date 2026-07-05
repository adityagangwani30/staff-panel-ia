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
  charts: {}
};

const fmt = {
  int(n) {
    if (n == null || isNaN(n) || !isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  },
  pct(n, d) { return (isFinite(n) && !isNaN(n) ? n : 0).toFixed(d || 1) + '%'; },
  dec(n, d) { return (isFinite(n) && !isNaN(n) ? n : 0).toFixed(d || 1); },
  date(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; },
  dateFull(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; },
  time(d) { return d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'; },
  currency(n) { if (n == null || isNaN(n)) return '—'; return '₹' + Math.round(n).toLocaleString('en-IN'); }
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function exportCSV(rows, filename) {
  if (!rows || !rows.length) { alert('No data to export.'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportCurrentSection() {
  const leads = State.filtered;
  if (!leads.length) { alert('No data to export.'); return; }
  const rows = leads.map(l => ({
    LeadID: l.id, StudentName: l.studentName, Phone: l.phone, Source: l.source,
    Status: l.status, Assignee: l.counsellorName, State: l.state, City: l.city,
    EntryDate: fmt.dateFull(l.entryDate), Calls: l.calls
  }));
  exportCSV(rows, 'overview_export.csv');
}

function kpiCardHtml(label, target, opts) {
  const o = opts || {};
  const icon = o.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>';
  const color = o.color || 'primary';
  const isPct = o.isPct;
  const sub = o.sub || '';
  const displayVal = isPct ? fmt.pct(target, 1) : (typeof target === 'string' ? escapeHtml(target) : fmt.int(target));
  return `<div class="kpi-card"><div class="kpi-top"><div class="kpi-icon" style="background:var(--${color}-tint);color:var(--${color})">${icon}</div></div><div class="kpi-label">${label}</div><div class="kpi-value">${displayVal}</div>${sub ? `<div class="kpi-trend-row"><span class="kpi-sub">${sub}</span></div>` : ''}</div>`;
}

function actionCardHtml(icon, color, label, count, desc) {
  return `<div class="action-card"><div class="action-card-icon" style="background:var(--${color}-tint);color:var(--${color})">${icon}</div><div class="action-card-body"><div class="action-card-count">${fmt.int(count)}</div><div class="action-card-label">${label}</div></div><div class="action-card-desc">${desc}</div></div>`;
}

function statusBadge(status) {
  const cls = CFG.statusClass[status] || 'st-default';
  return `<span class="badge ${cls}">${status}</span>`;
}

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function emptyStateHtml(message, subtitle) {
  const sub = subtitle || 'Try adjusting or clearing the filters above.';
  return `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="12"/></svg><div class="et">${escapeHtml(message)}</div><div class="et-sub">${escapeHtml(sub)}</div></div>`;
}

function iconUsers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>'; }
function iconPhone() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'; }
function iconCheck() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconTarget() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'; }
function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }
function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'; }
function iconBarChart() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>'; }
function iconTrendingUp() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'; }
function iconHot() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'; }
function iconRefresh() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>'; }
function iconUserPlus() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>'; }

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
      parent.innerHTML = emptyStateHtml('No data available for the selected filters.');
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
    container.innerHTML = emptyStateHtml('No data available for the selected filters.');
    return;
  }
  container.innerHTML = `<div class="funnel">${stages.map((s, i) => {
    const pct = max ? (s.count / max) * 100 : 0;
    return `<div class="funnel-row"><div class="funnel-label">${s.stage}</div><div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(pct, 6)}%;background:${CFG.palette[i % CFG.palette.length]}">${s.count}</div></div><div class="funnel-pct">${i === 0 ? '100%' : fmt.pct(stages[0].count ? (s.count / stages[0].count) * 100 : 0, 0)}</div></div>`;
  }).join('')}</div>`;
}

// ============================================================
// 1. EXECUTIVE KPIs
// ============================================================

function renderExecutiveKpis(leads) {
  const container = document.getElementById('executiveKpis');
  if (!container) return;
  if (!leads.length) {
    container.innerHTML = emptyStateHtml('No data available for the selected filters.');
    return;
  }

  container.innerHTML =
    kpiCardHtml('Total Leads', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers() }) +
    kpiCardHtml('New Leads (7d)', Calc.newLeadsPeriod(leads, 7), { color: 'info', icon: iconBarChart(), sub: fmt.int(Calc.newLeads(leads)) + ' today' }) +
    kpiCardHtml('Active Leads', Calc.activeLeads(leads), { color: 'teal', icon: iconTarget() }) +
    kpiCardHtml('Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'warning', icon: iconClock() }) +
    kpiCardHtml('Overdue Follow-ups', Calc.overdueFollowups(leads), { color: 'danger', icon: iconAlert() }) +
    kpiCardHtml('Avg Calls', Calc.averageCalls(leads), { color: 'slate', icon: iconPhone(), sub: fmt.dec(Calc.averageCalls(leads), 1) + ' per lead' }) +
    kpiCardHtml('Enrolled', Calc.enrolled(leads), { color: 'success', icon: iconCheck() }) +
    kpiCardHtml('Enrollment Rate', Calc.enrollmentRate(leads), { color: 'purple', icon: iconTrendingUp(), isPct: true });
}

// ============================================================
// 2. PIPELINE
// ============================================================

function renderPipeline(leads) {
  const stages = Calc.pipelineStages(leads);
  drawFunnel('pipelineFunnel', stages);

  const table = document.getElementById('pipelineTable');
  if (!table) return;
  if (!stages.length) {
    table.innerHTML = emptyStateHtml('No pipeline data available.');
    return;
  }
  table.innerHTML = `<table><thead><tr><th>Stage</th><th>Count</th><th>Stage Conversion</th><th>Drop-off</th></tr></thead><tbody>${stages.map((s, i) => {
    const convClass = s.stageConversion > 50 ? 'text-success' : s.stageConversion > 25 ? 'text-warning' : 'text-danger';
    const dropClass = s.dropOff > 50 ? 'text-danger' : s.dropOff > 25 ? 'text-warning' : 'text-success';
    return `<tr><td class="name-cell">${s.stage}</td><td>${fmt.int(s.count)}</td>${i === 0 ? '<td class="text-muted">—</td><td class="text-muted">—</td>' : `<td class="${convClass}">${fmt.pct(s.stageConversion, 1)}</td><td class="${dropClass}">${fmt.pct(s.dropOff, 1)}</td>`}</tr>`;
  }).join('')}</tbody></table>`;
}

// ============================================================
// 3. ACTION CENTRE
// ============================================================

function renderActionCentre(leads) {
  const container = document.getElementById('actionCards');
  if (!container) return;
  if (!leads.length) {
    container.innerHTML = emptyStateHtml('No data available.');
    return;
  }

  const dueToday = Calc.followupsDueToday(leads);
  const overdue = Calc.overdueFollowups(leads);
  const hotLeads = Calc.hotLeads(leads);
  const callbacks = Calc.callbackRequests(leads);
  const newToday = Calc.newLeads(leads);
  const dueTomorrow = Calc.followupsDueTomorrow(leads);

  const totalActions = dueToday + overdue + hotLeads + callbacks + newToday + dueTomorrow;
  const badge = document.getElementById('actionCountBadge');
  if (badge) badge.textContent = totalActions + ' items';

  container.innerHTML =
    actionCardHtml(iconClock(), 'warning', 'Follow-ups Due Today', dueToday, dueToday === 1 ? '1 follow-up scheduled for today' : dueToday + ' follow-ups scheduled for today') +
    actionCardHtml(iconAlert(), 'danger', 'Overdue Follow-ups', overdue, overdue === 1 ? '1 follow-up past its due date' : overdue + ' follow-ups past their due date') +
    actionCardHtml(iconHot(), 'pink', 'Hot Leads', hotLeads, hotLeads === 1 ? '1 hot lead ready for immediate contact' : hotLeads + ' hot leads ready for immediate contact') +
    actionCardHtml(iconRefresh(), 'purple', 'Callback Requests', callbacks, callbacks === 1 ? '1 lead requested a callback' : callbacks + ' leads requested a callback') +
    actionCardHtml(iconUserPlus(), 'info', 'New Leads Today', newToday, newToday === 1 ? '1 new lead added today' : newToday + ' new leads added today') +
    actionCardHtml(iconClock(), 'slate', 'Follow-ups Due Tomorrow', dueTomorrow, dueTomorrow === 1 ? '1 follow-up due tomorrow' : dueTomorrow + ' follow-ups due tomorrow');
}

// ============================================================
// 4. STATUS DISTRIBUTION
// ============================================================

function renderStatusDistribution(leads) {
  const canvasId = 'chartStatusDistOv';
  const dist = Calc.statusDistribution(leads);
  const hasData = dist.some(d => d.count > 0);

  if (!hasData) {
    const parent = document.getElementById(canvasId)?.parentElement;
    if (parent) parent.innerHTML = emptyStateHtml('No data available.');
    return;
  }

  drawChart(canvasId, {
    type: 'doughnut',
    data: {
      labels: dist.map(d => d.status + ' (' + d.count + ')'),
      datasets: [{ data: dist.map(d => d.count), backgroundColor: CFG.palette.slice(0, dist.length), borderWidth: 1, borderColor: '#0c0c0e' }]
    },
    options: Charts.donutOpts()
  });
}

// ============================================================
// 5. COUNSELLOR PERFORMANCE
// ============================================================

function renderCounsellorPerformance(leads) {
  const container = document.getElementById('counsellorPerfTable');
  if (!container) return;

  const staffList = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');
  const perf = Calc.counsellorPerformance(leads, staffList).sort((a, b) => b.assigned - a.assigned);

  if (!perf.length) {
    container.innerHTML = emptyStateHtml('No counsellor data available.');
    return;
  }

  container.innerHTML = `<div class="table-scroll"><table class="perf-table"><thead><tr><th>Counsellor</th><th>Centre</th><th>Assigned</th><th>Active</th><th>Follow-ups Due</th><th>Enrolled</th><th>Conv. Rate</th></tr></thead><tbody>${perf.map(p => {
    return `<tr><td class="name-cell">${escapeHtml(p.name)}</td><td>${escapeHtml(p.centre)}</td><td>${fmt.int(p.assigned)}</td><td>${fmt.int(p.active)}</td><td>${fmt.int(p.followupsDue)}</td><td>${fmt.int(p.enrolled)}</td><td class="${p.enrollmentRate > 10 ? 'text-success' : p.enrollmentRate > 5 ? 'text-warning' : 'text-muted'}">${fmt.pct(p.enrollmentRate, 1)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

// ============================================================
// 6. SOURCE PERFORMANCE
// ============================================================

function renderSourcePerformance(leads) {
  const container = document.getElementById('sourcePerfTable');
  if (!container) return;

  const sources = window.IntelAbroadData.sources;
  const perf = Calc.sourcePerformance(leads, sources).sort((a, b) => b.enrollmentRate - a.enrollmentRate);

  if (!perf.length) {
    container.innerHTML = emptyStateHtml('No source data available.');
    return;
  }

  container.innerHTML = `<div class="table-scroll"><table class="perf-table"><thead><tr><th>#</th><th>Source</th><th>Total Leads</th><th>Enrolled</th><th>Conv. Rate</th></tr></thead><tbody>${perf.map((p, i) => {
    const rankClass = i === 0 ? 'text-success' : i <= 2 ? 'text-warning' : 'text-muted';
    return `<tr><td class="rank-cell">${i + 1}</td><td class="name-cell">${escapeHtml(p.source)}</td><td>${fmt.int(p.assigned)}</td><td>${fmt.int(p.enrolled)}</td><td class="${rankClass}" style="font-weight:600">${fmt.pct(p.enrollmentRate, 1)}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}

// ============================================================
// OVERVIEW RENDER
// ============================================================

function renderOverview(leads) {
  renderExecutiveKpis(leads);
  renderPipeline(leads);
  renderActionCentre(leads);
  renderStatusDistribution(leads);
  renderCounsellorPerformance(leads);
  renderSourcePerformance(leads);
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
  renderOverview(State.filtered);
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
}

async function initUI() {
  try {
    await DataLoader.loadFromDefaultUrl();
  } catch (e) {}
  updateDataSourceBadge();
  populateFilterOptions();
  readFiltersFromForm();
  wireEvents();
  updateSourceDropdownOptions();
  updateAssigneeDropdownOptions();
  runPipeline();
}

document.addEventListener('DOMContentLoaded', initUI);
