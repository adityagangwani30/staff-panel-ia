/* ============================================================
   UI CONTROLLER & INTERACTION ENGINE — IntelAbroad Staff Panel
   ============================================================ */

const State = {
  currentUser: {
    role: 'Founder',
    name: 'Dr. Suhail',
    id: 'S001',
    branch: 'all'
  },
  filters: {
    dateType: 'entry',
    from: null,
    to: null,
    branch: 'all',
    counsellor: 'all',
    source: 'all',
    status: 'all',
    search: ''
  },
  filtered: [],
  activeTab: 'counsellor',
  charts: {},
  tables: {},
  counsellorViewId: null
};

const fmt = {
  int(n) {
    if (n == null || isNaN(n) || !isFinite(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  },
  pct(n, d = 1) { return (isFinite(n) && !isNaN(n) ? n : 0).toFixed(d) + '%'; },
  hours(n) {
    if (n == null || !isFinite(n) || isNaN(n)) return '—';
    return n < 1 ? Math.round(n * 60) + 'm' : n.toFixed(1) + 'h';
  },
  days(n) {
    if (n == null || isNaN(n) || !isFinite(n)) return '0d';
    return Math.round(n) + 'd';
  },
  date(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; },
  dateFull(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }
};

const METRIC_DEFS = {
  'total-assigned': 'Total number of leads assigned within the selected scope.',
  'contacted': 'Leads that have been contacted (have a recorded first contact date).',
  'calls': 'Total number of telephone calls completed with leads.',
  'whatsapp': 'Total number of WhatsApp messages exchanged with leads.',
  'followups-completed': 'Total number of scheduled follow-ups successfully marked as completed.',
  'pending-followups': 'Number of follow-ups that are yet to be completed.',
  'avg-response': 'Average time taken by a counsellor to make the first contact with a lead.',
  'conversion-rate': 'Percentage of assigned leads that have been successfully converted.',
  'overdue-followups': 'Number of follow-ups that have passed their scheduled date without completion.',
  'avg-lead-aging': 'Average number of days a lead has remained active since it was assigned.',
  'team-members': 'Number of active counselors in the team.',
  'avg-workload': 'Average number of leads assigned per counselor.',
  'followup-compliance': 'Percentage of follow-ups completed on time.',
  'team-avg-response': 'Average time taken by team members to contact leads.',
  'total-leads-managed': 'Total number of leads managed at the organizational level.',
  'converted-leads': 'Total number of leads successfully converted.',
  'sla-response-compliance': 'Percentage of leads contacted within the 24-hour SLA window.',
  'chart-daily-activity': 'Daily volume of assigned vs converted leads over the last 14 days.',
  'chart-lead-status-dist': 'Distribution of leads across current funnel statuses.',
  'chart-monthly-trend': 'Monthly trend of assigned vs converted leads over the last 6 months.',
  'chart-calls-vs-whatsapp': 'Weekly comparison of calls logged vs WhatsApp messages exchanged.',
  'chart-team-comparison': 'Comparison of team members by converted, open, and lost leads.',
  'chart-workload-dist': 'Workload status breakdown per counselor.',
  'chart-response-time-trend': 'Weekly trend of team average response latency.',
  'chart-branch-comparison': 'Assigned vs converted lead comparison by branch office.',
  'chart-monthly-growth': 'Monthly lead volume growth trends for branches.',
  'chart-counsellor-ranking': 'Counsellor ranking by performance within branch.',
  'chart-lead-volume': 'Total lead volume generated per acquisition source.',
  'chart-conversion-rate': 'Conversion rate comparison by acquisition source.',
  'chart-overall-funnel': 'Stage-by-stage distribution of leads through the conversion funnel.',
  'chart-m-branch-comparison': 'Conversion output comparison by branch.',
  'chart-monthly-conversion-trend': '6-month historic conversion rate trend.',
  'chart-counsellor-leaderboard': 'Leaderboard of top performing counselors.',
  'chart-lead-source-performance': 'Lead source performance comparison.',
  'chart-chronological-activity-log': 'Recent updates and events logged on assigned cases.',
  'chart-assigned-lead-records': 'Operational details of leads assigned to this counselor.',
  're-engagement': 'Leads with no activity for the specified period — opportunities for re-engagement.',
  'objection-tracking': 'Breakdown of stated reasons why leads did not convert, helping identify patterns.'
};

function tooltipHtml(key) {
  const definition = METRIC_DEFS[key];
  if (!definition) return '';
  return `
    <span class="tooltip-wrap">
      <span class="info-btn" data-tooltip-key="${key}">
        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      </span>
      <span class="tooltip-bubble">${escapeHtml(definition)}</span>
    </span>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function exportCSV(rows, filename) {
  if (!rows || !rows.length) {
    alert('No records matching current filters.');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')].concat(
    rows.map(r => headers.map(h => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderTable(containerId, cols, rows, opts = {}) {
  const key = containerId;
  if (!State.tables[key]) {
    State.tables[key] = {
      sortKey: opts.defaultSort || cols[0].key,
      sortDir: 'desc',
      page: 1,
      pageSize: opts.pageSize || 8,
      search: '',
      selectedRows: new Set()
    };
  }
  const ts = State.tables[key];

  let data = rows.slice();
  
  if (ts.search) {
    const q = ts.search.toLowerCase();
    data = data.filter(r => cols.some(c => String(r[c.key]).toLowerCase().includes(q)));
  }

  data.sort((a, b) => {
    const va = a[ts.sortKey];
    const vb = b[ts.sortKey];
    let cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return ts.sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(data.length / ts.pageSize));
  ts.page = Math.min(ts.page, totalPages);
  const pageRows = data.slice((ts.page - 1) * ts.pageSize, ts.page * ts.pageSize);

  const container = document.getElementById(containerId);
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        <div class="et">No matching records</div>
        <div>Try widening your filters or search terms.</div>
      </div>`;
    return;
  }

  function toggleRowSelection(rowId) {
    if (ts.selectedRows.has(rowId)) {
      ts.selectedRows.delete(rowId);
    } else {
      ts.selectedRows.add(rowId);
    }
    renderTable(containerId, cols, rows, opts);
  }

  const thead = '<tr>' +
    `<th class="td-checkbox">
      <div class="custom-chk ${ts.selectedRows.size === data.length ? 'checked' : ''}" id="chk-all-${containerId}"></div>
     </th>` +
    cols.map(c => {
      const isSorted = ts.sortKey === c.key;
      const arrow = isSorted ? (ts.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      return `<th data-key="${c.key}">${c.label}<span class="arrow">${arrow}</span></th>`;
    }).join('') + '</tr>';

  const tbody = pageRows.map((r, i) => {
    const rowId = r.id || `row-${i}`;
    const isSelected = ts.selectedRows.has(rowId);
    const cellsHtml = cols.map(c => {
      const val = c.render ? c.render(r, (ts.page - 1) * ts.pageSize + i) : escapeHtml(r[c.key]);
      return `<td>${val}</td>`;
    }).join('');
    
    return `<tr class="${isSelected ? 'selected-row' : ''} ${opts.clickableRows ? 'clickable-row' : ''}" data-rowid="${rowId}">
      <td class="td-checkbox">
        <div class="custom-chk ${isSelected ? 'checked' : ''}" data-chk-rowid="${rowId}"></div>
      </td>
      ${cellsHtml}
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div class="table-toolbar">
      <input class="table-search" placeholder="Search table…" value="${escapeHtml(ts.search)}" data-role="tsearch"/>
      <span class="card-tag">${data.length} records</span>
    </div>
    <div class="table-scroll">
      <table>
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
    <div class="pagination">
      <span>Page ${ts.page} of ${totalPages}</span>
      <div class="pg-btns">
        <button class="pg-btn" data-role="prev" ${ts.page === 1 ? 'disabled' : ''}>Prev</button>
        <button class="pg-btn" data-role="next" ${ts.page === totalPages ? 'disabled' : ''}>Next</button>
      </div>
    </div>`;

  container.querySelectorAll('th[data-key]').forEach(th => {
    th.addEventListener('click', () => {
      const k = th.dataset.key;
      if (ts.sortKey === k) {
        ts.sortDir = ts.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        ts.sortKey = k;
        ts.sortDir = 'desc';
      }
      renderTable(containerId, cols, rows, opts);
    });
  });

  container.querySelector('[data-role="tsearch"]').addEventListener('input', e => {
    ts.search = e.target.value;
    ts.page = 1;
    renderTable(containerId, cols, rows, opts);
  });

  container.querySelectorAll('[data-chk-rowid]').forEach(chk => {
    chk.addEventListener('click', e => {
      e.stopPropagation();
      toggleRowSelection(chk.dataset.chkRowid);
    });
  });

  container.querySelectorAll('tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      if (opts.onRowClick) {
        opts.onRowClick(tr.dataset.rowid);
      } else {
        toggleRowSelection(tr.dataset.rowid);
      }
    });
  });

  const chkAll = container.querySelector(`#chk-all-${containerId}`);
  if (chkAll) {
    chkAll.addEventListener('click', e => {
      e.stopPropagation();
      const allPageIds = data.map((r, idx) => r.id || `row-${idx}`);
      const isAllChecked = ts.selectedRows.size === data.length;
      if (isAllChecked) {
        ts.selectedRows.clear();
      } else {
        allPageIds.forEach(id => ts.selectedRows.add(id));
      }
      renderTable(containerId, cols, rows, opts);
    });
  }

  const prevBtn = container.querySelector('[data-role="prev"]');
  const nextBtn = container.querySelector('[data-role="next"]');
  if (prevBtn) prevBtn.addEventListener('click', () => { ts.page--; renderTable(containerId, cols, rows, opts); });
  if (nextBtn) nextBtn.addEventListener('click', () => { ts.page++; renderTable(containerId, cols, rows, opts); });
}

function drawChart(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    console.warn(`Chart.js is not loaded. Cannot render chart on canvas #${canvasId}`);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = canvas.offsetWidth || 300;
      canvas.height = canvas.offsetHeight || 200;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#71717a';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Chart.js CDN not reachable (Offline)', canvas.width / 2, canvas.height / 2);
    }
    return;
  }
  try {
    if (State.charts[canvasId]) {
      State.charts[canvasId].destroy();
      delete State.charts[canvasId];
    }
    
    if (config && config.data && Array.isArray(config.data.datasets)) {
      config.data.datasets.forEach(ds => {
        if (Array.isArray(ds.data)) {
          ds.data = ds.data.map(val => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
              return 0;
            }
            return val;
          });
        }
      });
    }
    
    State.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
  } catch (err) {
    console.error(`Failed to create chart on canvas #${canvasId}:`, err);
  }
}

function applyFilters() {
  const f = State.filters;
  const user = State.currentUser;
  
  let allowedLeads = window.IntelAbroadData.leads;
  
  if (user.role === 'Counsellor') {
    f.branch = user.branch;
    f.counsellor = user.id;
  } else if (user.role === 'TeamLead') {
    f.branch = user.branch;
    const teamMembers = window.IntelAbroadData.staff
      .filter(s => s.reportsTo === user.id || s.id === user.id)
      .map(s => s.id);
    allowedLeads = allowedLeads.filter(l => teamMembers.includes(l.counsellorId));
    
    if (f.counsellor !== 'all' && !teamMembers.includes(f.counsellor)) {
      f.counsellor = 'all';
    }
  } else if (user.role === 'BranchManager') {
    f.branch = user.branch;
    allowedLeads = allowedLeads.filter(l => l.branch === user.branch);
  }

  State.filtered = allowedLeads.filter(l => {
    let targetDate = l.assignedDate;
    if (f.dateType === 'updated') targetDate = l.lastActivityDate;
    else if (f.dateType === 'followup') {
      targetDate = l.followUps && l.followUps.length ? l.followUps[0].dueDate : null;
    }

    if (!targetDate && (f.from || f.to)) return false;

    if (f.from && targetDate < f.from) return false;
    if (f.to && targetDate > f.to) return false;

    if (f.branch !== 'all' && l.branch !== f.branch) return false;
    if (f.counsellor !== 'all' && l.counsellorId !== f.counsellor) return false;
    if (f.source !== 'all' && l.source !== f.source) return false;
    if (f.status !== 'all' && l.status !== f.status) return false;

    if (f.search) {
      const q = f.search.toLowerCase();
      const matchesName = l.studentName.toLowerCase().includes(q);
      const matchesCounsellor = l.counsellorName.toLowerCase().includes(q);
      const matchesId = l.id.toLowerCase().includes(q);
      if (!matchesName && !matchesCounsellor && !matchesId) return false;
    }

    return true;
  });
}

function renderChips() {
  const f = State.filters;
  const user = State.currentUser;
  const chips = [];
  
  if (f.from) chips.push([`From: ${fmt.date(f.from)}`, 'from']);
  if (f.to) chips.push([`To: ${fmt.date(f.to)}`, 'to']);
  
  if (user.role !== 'Counsellor' && f.counsellor !== 'all') {
    const s = window.IntelAbroadData.staff.find(s => s.id === f.counsellor);
    chips.push([`Counsellor: ${s ? s.name : f.counsellor}`, 'counsellor']);
  }
  if (f.source !== 'all') chips.push([`Source: ${f.source}`, 'source']);
  if (f.status !== 'all') chips.push([`Status: ${f.status}`, 'status']);
  if (f.search) chips.push([`Search: "${f.search}"`, 'search']);

  const row = document.getElementById('chipRow');
  if (!row) return;

  row.innerHTML = chips.map(pair => `
    <span class="chip">
      ${escapeHtml(pair[0])}
      <button data-clear="${pair[1]}">✕</button>
    </span>
  `).join('');

  row.querySelectorAll('button[data-clear]').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.clear;
      if (key === 'from') { f.from = null; document.getElementById('fDateFrom').value = ''; }
      else if (key === 'to') { f.to = null; document.getElementById('fDateTo').value = ''; }
      else if (key === 'counsellor') { f.counsellor = 'all'; document.getElementById('fCounsellor').value = 'all'; }
      else if (key === 'source') { f.source = 'all'; document.getElementById('fSource').value = 'all'; }
      else if (key === 'status') { f.status = 'all'; document.getElementById('fStatus').value = 'all'; }
      else if (key === 'search') { f.search = ''; document.getElementById('fSearch').value = ''; }
      runPipeline();
    });
  });
}

function kpiCardHtml(id, label, target, opts = {}) {
  const icon = opts.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>';
  const color = opts.color || 'primary';
  const sub = opts.sub || '';
  const tooltip = opts.tooltipKey ? tooltipHtml(opts.tooltipKey) : '';
  
  return `
    <div class="kpi-card">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:var(--${color}-tint);color:var(--${color})">${icon}</div>
        ${opts.badge ? `<span class="card-tag">${opts.badge}</span>` : ''}
      </div>
      <div class="kpi-label">${label}${tooltip}</div>
      <div class="kpi-value">${fmt.int(target)}${opts.isPct ? '%' : ''}</div>
      <div class="kpi-trend-row">
        ${sub ? `<span class="kpi-sub">${sub}</span>` : ''}
      </div>
    </div>`;
}

function cardHtml(title, sub, bodyHtml, wide = false, tooltipKey = null) {
  const tooltip = tooltipKey ? tooltipHtml(tooltipKey) : '';
  return `
    <div class="card" ${wide ? 'style="margin-bottom:12px"' : ''}>
      <div class="card-head">
        <div>
          <div class="card-title">${title}${tooltip}</div>
          <div class="card-sub">${sub}</div>
        </div>
      </div>
      ${bodyHtml}
    </div>`;
}

function summaryCardHtml(label, value, bg, sub, tooltipKey = null) {
  const tooltip = tooltipKey ? tooltipHtml(tooltipKey) : '';
  return `
    <div class="summary-card" style="background:${bg}">
      <h3>${label}${tooltip}</h3>
      <div class="sv">${value}</div>
      <div class="ss">${sub}</div>
    </div>`;
}

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function statusBadge(status) {
  return `<span class="badge ${CFG.statusClass[status] || ''}">${status}</span>`;
}

function callsBadge(count) {
  return `<span class="calls-badge">${count}</span>`;
}

function drawFunnel(containerId, stages) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const max = stages.length ? stages[0].count : 1;
  const html = stages.map((s, i) => {
    const pct = max ? (s.count / max) * 100 : 0;
    const color = CFG.palette[i % CFG.palette.length];
    return `
      <div class="funnel-row">
        <div class="funnel-label">${s.stage}</div>
        <div class="funnel-track"><div class="funnel-fill" style="width:${Math.max(pct, 6)}%;background:${color}">${s.count}</div></div>
        <div class="funnel-pct">${i === 0 ? '100%' : fmt.pct(stages[0].count ? (s.count / stages[0].count) * 100 : 0, 0)}</div>
      </div>`;
  }).join('');
  container.innerHTML = `<div class="funnel">${html}</div>`;
}

// ============================================================
// TAB RENDERING TRIGGERS
// ============================================================

function renderCounsellorTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-counsellor');
  
  const overdueCount = Calc.overdueFollowups(leads).length;
  const kpis = 
    kpiCardHtml('k-c-assigned', 'Total Leads Assigned', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-c-contacted', 'Leads Contacted', Calc.contacted(leads), { color: 'info', icon: iconPhone(), sub: fmt.pct(Calc.contactRate(leads)) + ' contact rate', tooltipKey: 'contacted' }) +
    kpiCardHtml('k-c-calls', 'Calls Completed', Calc.callsCompleted(leads), { color: 'purple', icon: iconPhone(), tooltipKey: 'calls' }) +
    kpiCardHtml('k-c-whatsapp', 'WhatsApp Conversations', leads.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0), { color: 'pink', icon: iconMessage(), tooltipKey: 'whatsapp' }) +
    kpiCardHtml('k-c-fu', 'Follow-ups Completed', Calc.followupsCompleted(leads), { color: 'teal', icon: iconCheck(), tooltipKey: 'followups-completed' }) +
    kpiCardHtml('k-c-pending', 'Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'warning', icon: iconAlert(), sub: `${overdueCount} overdue`, tooltipKey: 'pending-followups' }) +
    kpiCardHtml('k-c-overdue', 'Overdue Follow-ups', overdueCount, { color: 'danger', icon: iconAlert(), tooltipKey: 'overdue-followups' }) +
    kpiCardHtml('k-c-resp', 'Average Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), sub: fmt.pct(Calc.slaComplianceRate(leads)) + ' SLA compliance', tooltipKey: 'avg-response' }) +
    kpiCardHtml('k-c-aging', 'Lead Aging', Calc.avgLeadAging(leads), { color: 'slate', icon: iconHourglass(), tooltipKey: 'avg-lead-aging' }) +
    kpiCardHtml('k-c-conv', 'Conversion Rate', Calc.conversionRate(leads), { color: 'success', icon: iconTarget(), isPct: true, tooltipKey: 'conversion-rate' }) +
    kpiCardHtml('k-c-prod', 'Productivity Score', Calc.productivity(leads), { color: 'primary', icon: iconTarget(), sub: 'Simplified score', tooltipKey: 'conversion-rate' });

  panel.innerHTML = `
    <div class="kpi-grid">${kpis}</div>
    <div class="grid-2">
      ${cardHtml('Daily Performance', 'Leads assigned vs converted — last 14 days', '<div class="chart-wrap h260"><canvas id="chart-c-daily"></canvas></div>', false, 'chart-daily-activity')}
      ${cardHtml('Lead Status Distribution', 'Current mix across lead statuses', '<div class="chart-wrap h260"><canvas id="chart-c-status"></canvas></div>', false, 'chart-lead-status-dist')}
    </div>
    <div class="grid-2">
      ${cardHtml('Monthly Performance Trend', '6-month assigned vs converted trends', '<div class="chart-wrap h260"><canvas id="chart-c-monthly"></canvas></div>', false, 'chart-monthly-trend')}
      ${cardHtml('Calls vs WhatsApp Activity', 'Weekly logged calls vs WhatsApp messages exchanged', '<div class="chart-wrap h260"><canvas id="chart-c-contacts"></canvas></div>', false, 'chart-calls-vs-whatsapp')}
    </div>
    ${cardHtml('Counsellor Performance', 'Performance metrics per counselor', '<div id="table-c-perf"></div>', true, 'chart-counsellor-metrics')}`;

  const daily = Calc.dailySeries(leads, 14);
  drawChart('chart-c-daily', {
    type: 'line',
    data: {
      labels: daily.labels,
      datasets: [
        Charts.lineDS('Assigned', daily.assigned, CFG.chartColors.primary),
        Charts.lineDS('Converted', daily.converted, CFG.chartColors.success)
      ]
    },
    options: Charts.lineOpts()
  });

  const dist = Calc.statusDistribution(leads);
  drawChart('chart-c-status', {
    type: 'doughnut',
    data: {
      labels: dist.map(d => d.status),
      datasets: [{
        data: dist.map(d => d.count),
        backgroundColor: CFG.palette,
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
  });

  const monthly = Calc.monthlySeries(leads, 6);
  drawChart('chart-c-monthly', {
    type: 'line',
    data: {
      labels: monthly.labels,
      datasets: [
        Charts.lineDS('Assigned', monthly.assigned, CFG.chartColors.primary, true),
        Charts.lineDS('Converted', monthly.converted, CFG.chartColors.success, true)
      ]
    },
    options: Charts.lineOpts()
  });

  // Calls vs WhatsApp - weekly trend (8 weeks)
  const callsTrend = [];
  const waTrend = [];
  const labels = [];
  for (let i = 7; i >= 0; i--) {
    const start = addDays(CFG.today, -(i + 1) * 7);
    const end = addDays(CFG.today, -i * 7);
    const wl = leads.filter(l => l.assignedDate >= start && l.assignedDate < end);
    labels.push('W' + (8 - i));
    callsTrend.push(Calc.callsCompleted(wl));
    waTrend.push(wl.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0));
  }
  drawChart('chart-c-contacts', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        Charts.barDS('Calls Logged', callsTrend, CFG.chartColors.purple),
        Charts.barDS('WhatsApp Chat Count', waTrend, CFG.chartColors.pink)
      ]
    },
    options: Charts.barOpts()
  });

  const allPerf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder'));
  renderTable('table-c-perf', [
    { key: 'name', label: 'Counsellor', render: r => `<span class="avatar">${initials(r.name)}</span><span class="name-cell">${escapeHtml(r.name)}</span>` },
    { key: 'branch', label: 'Branch' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'converted', label: 'Converted' },
    { key: 'conversionRate', label: 'Conversion %', render: r => fmt.pct(r.conversionRate) },
    { key: 'slaCompliance', label: 'SLA Compliance %', render: r => fmt.pct(r.slaCompliance) },
    { key: 'productivity', label: 'Productivity Score', render: r => r.productivity },
    { key: 'pending', label: 'Pending FU' },
    { key: 'calls', label: 'Calls', render: r => callsBadge(r.calls) },
    { key: 'whatsApp', label: 'WhatsApp' },
    { key: 'responseTime', label: 'Avg Latency', render: r => fmt.hours(r.responseTime) },
  ], allPerf, { 
    defaultSort: 'converted', 
    clickableRows: true, 
    onRowClick: (rowId) => {
      const staffMember = window.IntelAbroadData.staff.find(s => s.id === rowId);
      if (staffMember) showCounsellorProfile(staffMember.id);
    }
  });
}

function renderTeamLeadTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-teamlead');
  const perf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder'));
  const overdue = Calc.overdueFollowups(leads);

  panel.innerHTML = `
    <div class="kpi-grid">
      ${kpiCardHtml('k-t-team', 'Team Performance', perf.length, { color: 'primary', icon: iconUsers(), tooltipKey: 'team-members' })}
      ${kpiCardHtml('k-t-convrate', 'Team Conversion Rate', Calc.conversionRate(leads), { color: 'success', icon: iconTarget(), isPct: true, tooltipKey: 'conversion-rate' })}
      ${kpiCardHtml('k-t-workload', 'Average Workload', perf.length ? (Calc.totalAssigned(leads) / perf.length).toFixed(1) : 0, { color: 'info', icon: iconLayers(), tooltipKey: 'avg-workload' })}
      ${kpiCardHtml('k-t-resp', 'Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), tooltipKey: 'team-avg-response' })}
      ${kpiCardHtml('k-t-fu', 'Follow-up Compliance', Calc.followupCompletionRate(leads), { color: 'success', icon: iconCheck(), isPct: true, tooltipKey: 'followup-compliance' })}
      ${kpiCardHtml('k-t-pending', 'Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'warning', icon: iconAlert(), tooltipKey: 'pending-followups' })}
      ${kpiCardHtml('k-t-overdue', 'Overdue Follow-ups', overdue.length, { color: 'danger', icon: iconAlert(), tooltipKey: 'overdue-followups' })}
    </div>
    <div class="grid-2">
      ${cardHtml('Team Comparison', 'Assigned leads status split per counselor', '<div class="chart-wrap h300"><canvas id="chart-t-stack"></canvas></div>', false, 'chart-team-comparison')}
      ${cardHtml('Response Time Trend', 'Team average response latency — weekly', '<div class="chart-wrap h260"><canvas id="chart-t-line"></canvas></div>', false, 'chart-response-time-trend')}
    </div>
    <div class="grid-2">
      ${cardHtml('Workload Distribution', 'Lead status breakdown across the team', '<div class="chart-wrap h260"><canvas id="chart-t-workload"></canvas></div>', false, 'chart-workload-dist')}
    </div>`;

  const top = perf.sort((a,b) => b.assigned - a.assigned).slice(0, 10);
  const openCount = top.map(p => {
    const cl = leads.filter(l => l.counsellorId === p.id);
    return cl.filter(l => !l.converted && !l.lost).length;
  });

  drawChart('chart-t-stack', {
    type: 'bar',
    data: {
      labels: top.map(p => p.name),
      datasets: [
        { label: 'Converted', data: top.map(p => p.converted), backgroundColor: CFG.chartColors.success, borderRadius: 4, stack: 's' },
        { label: 'Open Cases', data: openCount, backgroundColor: CFG.chartColors.primary, borderRadius: 4, stack: 's' },
        { label: 'Lost Leads', data: top.map(p => leads.filter(l => l.counsellorId === p.id && l.lost).length), backgroundColor: CFG.chartColors.danger, borderRadius: 4, stack: 's' }
      ]
    },
    options: Charts.stackOpts()
  });

  const weeks = 8;
  const labels = [];
  const respVals = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(CFG.today, -(i + 1) * 7);
    const end = addDays(CFG.today, -i * 7);
    const wl = leads.filter(l => l.assignedDate >= start && l.assignedDate < end);
    labels.push('W' + (weeks - i));
    respVals.push(Calc.avgResponseTime(wl));
  }

  drawChart('chart-t-line', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [Charts.lineDS('Avg Response (hrs)', respVals, CFG.chartColors.warning)]
    },
    options: Charts.lineOpts()
  });

  const workloadDist = Calc.statusDistribution(leads);
  drawChart('chart-t-workload', {
    type: 'doughnut',
    data: {
      labels: workloadDist.map(d => d.status),
      datasets: [{
        data: workloadDist.map(d => d.count),
        backgroundColor: CFG.palette,
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
  });
}

function renderBranchTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-branch');
  const branchPerf = Calc.branchPerformance(leads, window.IntelAbroadData.branches);
  
  const branchCards = branchPerf.map(b => `
    <div class="card">
      <div class="card-head">
        <span class="card-title">${b.branch}</span>
        <span class="card-tag">${b.assigned} leads</span>
      </div>
      <div style="display:flex; justify-content:space-between; gap:6px; flex-wrap:wrap">
        <div>
          <div class="mini-stat-label">Conversion Rate</div>
          <div class="mini-stat-val">${fmt.pct(b.conversionRate)}</div>
        </div>
        <div>
          <div class="mini-stat-label">Productivity</div>
          <div class="mini-stat-val">${b.productivity.toFixed(0)}</div>
        </div>
        <div>
          <div class="mini-stat-label">Avg Response</div>
          <div class="mini-stat-val">${fmt.hours(b.avgResponse)}</div>
        </div>
        <div>
          <div class="mini-stat-label">Pending FU</div>
          <div class="mini-stat-val">${b.pendingFU}</div>
        </div>
      </div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))">${branchCards}</div>
    <div class="grid-2">
      ${cardHtml('Branch Comparison', 'Assigned vs converted leads by branch office', '<div class="chart-wrap h280"><canvas id="chart-b-compare"></canvas></div>', false, 'chart-branch-comparison')}
      ${cardHtml('Monthly Growth', 'Monthly lead volume growth trends for top branches', '<div class="chart-wrap h280"><canvas id="chart-b-growth"></canvas></div>', false, 'chart-monthly-growth')}
    </div>
    ${cardHtml('Counsellor Ranking', 'Counsellor performance ranking by branch', '<div id="table-b-rank"></div>', true, 'chart-counsellor-ranking')}`;

  drawChart('chart-b-compare', {
    type: 'bar',
    data: {
      labels: branchPerf.map(b => b.branch),
      datasets: [
        Charts.barDS('Assigned', branchPerf.map(b => b.assigned), CFG.chartColors.primary),
        Charts.barDS('Converted', branchPerf.map(b => b.converted), CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });

  const topBranches = branchPerf.slice().sort((a,b) => b.assigned - a.assigned).slice(0, 3).map(b => b.branch);
  const monthLabels = Calc.monthlySeries(leads, 6).labels;
  const growthDatasets = topBranches.map((b, i) => {
    const bl = leads.filter(l => l.branch === b);
    const series = Calc.monthlySeries(bl, 6);
    return Charts.lineDS(b, series.assigned, CFG.palette[i]);
  });

  drawChart('chart-b-growth', {
    type: 'line',
    data: { labels: monthLabels, datasets: growthDatasets },
    options: Charts.lineOpts()
  });

  const allCounsellors = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder'));
  const branchRanking = allCounsellors.slice().sort((a, b) => b.productivity - a.productivity);
  renderTable('table-b-rank', [
    { key: 'name', label: 'Counsellor', render: r => `<span class="avatar">${initials(r.name)}</span><span class="name-cell">${escapeHtml(r.name)}</span>` },
    { key: 'branch', label: 'Branch' },
    { key: 'conversionRate', label: 'Conversion %', render: r => fmt.pct(r.conversionRate) },
    { key: 'productivity', label: 'Productivity', render: r => r.productivity },
    { key: 'pending', label: 'Pending FU' },
    { key: 'responseTime', label: 'Avg Response', render: r => fmt.hours(r.responseTime) }
  ], branchRanking, { defaultSort: 'productivity' });
}

function renderSourceTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-source');
  const srcPerf = Calc.sourcePerformance(leads, window.IntelAbroadData.sources);

  panel.innerHTML = `
    <div class="kpi-grid">
      ${kpiCardHtml('k-s-volume', 'Lead Volume', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), sub: `across ${window.IntelAbroadData.sources.length} sources`, tooltipKey: 'total-assigned' })}
      ${kpiCardHtml('k-s-convrate', 'Conversion Rate', Calc.conversionRate(leads), { color: 'success', icon: iconTarget(), isPct: true, tooltipKey: 'conversion-rate' })}
      ${kpiCardHtml('k-s-resp', 'Average Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), tooltipKey: 'avg-response' })}
    </div>
    <div class="grid-2">
      ${cardHtml('Lead Volume', 'Total leads generated per source', '<div class="chart-wrap h280"><canvas id="chart-s-volume"></canvas></div>', false, 'chart-lead-volume')}
      ${cardHtml('Conversion Rate', 'Conversion rate by acquisition source', '<div class="chart-wrap h280"><canvas id="chart-s-convrate"></canvas></div>', false, 'chart-conversion-rate')}
    </div>`;

  const sorted = srcPerf.slice().sort((a,b) => b.assigned - a.assigned);
  drawChart('chart-s-volume', {
    type: 'bar',
    data: {
      labels: sorted.map(s => s.source),
      datasets: [Charts.barDS('Lead Volume', sorted.map(s => s.assigned), CFG.chartColors.info)]
    },
    options: Charts.hbarOpts()
  });

  drawChart('chart-s-convrate', {
    type: 'bar',
    data: {
      labels: srcPerf.map(s => s.source),
      datasets: [
        Charts.barDS('Conversion Rate', srcPerf.map(s => s.conversionRate), CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });
}

function renderManagementTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-management');
  const branchPerf = Calc.branchPerformance(leads, window.IntelAbroadData.branches);
  const perf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder')).sort((a,b) => b.converted - a.converted);
  
  const activeCount = Calc.activeLeads(leads);
  const monthly = Calc.monthlySeries(leads, 6);
  panel.innerHTML = `
    <div class="summary-strip">
      ${summaryCardHtml('Total Leads', fmt.int(leads.length), 'linear-gradient(135deg,#3b82f6,#60a5fa)', `Active leads: ${activeCount}`, 'total-leads-managed')}
      ${summaryCardHtml('Active Leads', fmt.int(activeCount), 'linear-gradient(135deg,#06b6d4,#22d3ee)', 'Leads currently in progress', 'total-leads-managed')}
      ${summaryCardHtml('Converted Leads', fmt.int(Calc.converted(leads)), 'linear-gradient(135deg,#22c55e,#4ade80)', 'Leads successfully converted', 'converted-leads')}
      ${summaryCardHtml('Conversion Rate', fmt.pct(Calc.conversionRate(leads)), 'linear-gradient(135deg,#a855f7,#c084fc)', 'Overall conversion efficiency', 'conversion-rate')}
    </div>
    <div class="kpi-grid">
      ${kpiCardHtml('k-m-resp', 'Average Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), sub: fmt.pct(Calc.slaComplianceRate(leads)) + ' SLA compliance', tooltipKey: 'avg-response' })}
      ${kpiCardHtml('k-m-aging', 'Lead Aging', Calc.avgLeadAging(leads), { color: 'slate', icon: iconHourglass(), tooltipKey: 'avg-lead-aging' })}
      ${kpiCardHtml('k-m-sla', 'SLA Compliance', Calc.slaComplianceRate(leads), { color: 'info', icon: iconClock(), isPct: true, tooltipKey: 'sla-response-compliance' })}
      ${kpiCardHtml('k-m-fucomp', 'Follow-up Compliance', Calc.followupCompletionRate(leads), { color: 'success', icon: iconCheck(), isPct: true, tooltipKey: 'followup-compliance' })}
    </div>
    <div class="grid-2">
      ${cardHtml('Overall Funnel', 'Stage-wise distribution company-wide', '<div id="funnel-m" style="padding-top:6px"></div>', false, 'chart-overall-funnel')}
      ${cardHtml('Branch Comparison', 'Assigned vs converted leads by branch', '<div class="chart-wrap h260"><canvas id="chart-m-branch"></canvas></div>', false, 'chart-m-branch-comparison')}
    </div>
    <div class="grid-2">
      ${cardHtml('Monthly Conversion Trend', '6-month historic conversion rate trend', '<div class="chart-wrap h240"><canvas id="chart-m-trend"></canvas></div>', false, 'chart-monthly-conversion-trend')}
      ${cardHtml('Counsellor Leaderboard', 'Top counsellors sorted by conversions', '<div id="table-m-leader"></div>', false, 'chart-counsellor-leaderboard')}
    </div>
    <div class="grid-2">
      ${cardHtml('Lead Source Performance', 'Lead volume and conversion by source', '<div class="chart-wrap h260"><canvas id="chart-m-source"></canvas></div>', false, 'chart-lead-source-performance')}
    </div>
    <div class="grid-2">
      ${renderReEngagementCard(leads)}
      ${renderObjectionCard(leads)}
    </div>`;

  drawFunnel('funnel-m', Calc.funnelStages(leads));

  drawChart('chart-m-branch', {
    type: 'bar',
    data: {
      labels: branchPerf.map(b => b.branch),
      datasets: [
        Charts.barDS('Assigned', branchPerf.map(b => b.assigned), CFG.chartColors.primary),
        Charts.barDS('Converted', branchPerf.map(b => b.converted), CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });

  const trendVals = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i, 1);
    const next = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i + 1, 1);
    const ml = leads.filter(l => l.assignedDate >= d && l.assignedDate < next);
    trendVals.push(Calc.conversionRate(ml));
  }
  drawChart('chart-m-trend', {
    type: 'line',
    data: {
      labels: monthly.labels,
      datasets: [Charts.lineDS('Conversion Rate', trendVals, CFG.chartColors.purple, true)]
    },
    options: Charts.lineOpts(true)
  });

  renderTable('table-m-leader', [
    { key: 'rank', label: '#', render: (r, i) => `<span class="rank-cell">${i + 1}</span>` },
    { key: 'name', label: 'Counsellor', render: r => `<span class="avatar">${initials(r.name)}</span><span class="name-cell">${escapeHtml(r.name)}</span>` },
    { key: 'branch', label: 'Branch Office' },
    { key: 'converted', label: 'Converted' },
    { key: 'conversionRate', label: 'Conversion %', render: r => fmt.pct(r.conversionRate) },
    { key: 'productivity', label: 'Productivity', render: r => r.productivity }
  ], perf.slice(0, 8), { 
    defaultSort: 'converted', 
    pageSize: 8, 
    clickableRows: true, 
    onRowClick: (rowId) => {
      const staffMember = window.IntelAbroadData.staff.find(s => s.id === rowId);
      if (staffMember) showCounsellorProfile(staffMember.id);
    }
  });

  const srcPerf = Calc.sourcePerformance(leads, window.IntelAbroadData.sources);
  drawChart('chart-m-source', {
    type: 'bar',
    data: {
      labels: srcPerf.map(s => s.source),
      datasets: [
        Charts.barDS('Assigned', srcPerf.map(s => s.assigned), CFG.chartColors.primary),
        Charts.barDS('Converted', srcPerf.map(s => s.converted), CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });
}

function renderReEngagementCard(leads) {
  const buckets = Calc.reEngagementBuckets(leads);
  const rows = buckets.map(b => {
    const trendIcon = b.trend > 0 ? '↑' : b.trend < 0 ? '↓' : '→';
    const trendColor = b.trend > 0 ? 'var(--danger)' : b.trend < 0 ? 'var(--success)' : 'var(--text-muted)';
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-soft)">
        <div>
          <div style="font-weight:600;color:var(--text-2);font-size:13px">${b.label}</div>
          <div style="font-size:11px;color:var(--text-muted)">${fmt.pct(b.pct)} of active leads</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:var(--text-1)">${fmt.int(b.count)}</div>
          <div style="font-size:11px;color:${trendColor}">${trendIcon} ${fmt.int(Math.abs(b.trend))} vs prev.</div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Lead Re-engagement${tooltipHtml('re-engagement')}</div>
          <div class="card-sub">Active leads inactive for extended periods</div>
        </div>
      </div>
      ${rows}
    </div>`;
}

function renderObjectionCard(leads) {
  const obj = Calc.objectionBreakdown(leads);
  const total = obj.total;

  const rows = obj.rows.map(r => {
    const pctWidth = total ? Math.max((r.count / total) * 100, 2) : 0;
    return `
      <div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
          <span style="color:var(--text-2)">${escapeHtml(r.reason)}</span>
          <span style="color:var(--text-muted)">${fmt.int(r.count)} (${fmt.pct(r.pct)})</span>
        </div>
        <div style="background:var(--surface-hover);border-radius:4px;height:6px;overflow:hidden">
          <div style="height:100%;width:${pctWidth}%;background:var(--danger);border-radius:4px;transition:width .3s"></div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-title">Lead Objection Tracking${tooltipHtml('objection-tracking')}</div>
          <div class="card-sub">Reasons leads did not convert — most common: <strong>${escapeHtml(obj.mostCommon.reason)}</strong> (${fmt.int(obj.mostCommon.count)})</div>
        </div>
      </div>
      <div style="margin-top:8px">${rows}</div>
    </div>`;
}

// ============================================================
// INDIVIDUAL COUNSELLOR DRILL-DOWN DASHBOARD
// ============================================================

function showCounsellorProfile(counsellorId) {
  const staff = window.IntelAbroadData.staff.find(s => s.id === counsellorId);
  if (!staff) return;

  const cLeads = window.IntelAbroadData.leads.filter(l => l.counsellorId === counsellorId);
  const overdueList = Calc.overdueFollowups(cLeads);

  const activeCount = Calc.activeLeads(cLeads);
  const convertedCount = Calc.converted(cLeads);
  const lostCount = Calc.lost(cLeads);

  const manager = window.IntelAbroadData.staff.find(s => s.id === staff.reportsTo) || { name: 'Dr. Suhail (Founder)' };

  const kpiSectionHtml = 
    kpiCardHtml('k-ind-assigned', 'Total Leads Assigned', cLeads.length, { color: 'primary', icon: iconUsers(), tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-ind-contacted', 'Leads Contacted', Calc.contacted(cLeads), { color: 'info', icon: iconPhone(), sub: fmt.pct(Calc.contactRate(cLeads)) + ' contacted', tooltipKey: 'contacted' }) +
    kpiCardHtml('k-ind-calls', 'Calls Completed', Calc.callsCompleted(cLeads), { color: 'purple', icon: iconPhone(), tooltipKey: 'calls' }) +
    kpiCardHtml('k-ind-whatsapp', 'WhatsApp Conversations', cLeads.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0), { color: 'pink', icon: iconMessage(), tooltipKey: 'whatsapp' }) +
    kpiCardHtml('k-ind-fu', 'Follow-ups Completed', Calc.followupsCompleted(cLeads), { color: 'teal', icon: iconCheck(), tooltipKey: 'followups-completed' }) +
    kpiCardHtml('k-ind-pending', 'Pending Follow-ups', Calc.pendingFollowups(cLeads), { color: 'warning', icon: iconAlert(), sub: `${overdueList.length} overdue`, tooltipKey: 'pending-followups' }) +
    kpiCardHtml('k-ind-overdue', 'Overdue Follow-ups', overdueList.length, { color: 'danger', icon: iconAlert(), tooltipKey: 'overdue-followups' }) +
    kpiCardHtml('k-ind-latency', 'Average Response Time', Calc.avgResponseTime(cLeads), { color: 'warning', icon: iconClock(), sub: fmt.pct(Calc.slaComplianceRate(cLeads)) + ' SLA', tooltipKey: 'avg-response' }) +
    kpiCardHtml('k-ind-aging', 'Lead Aging', Calc.avgLeadAging(cLeads), { color: 'slate', icon: iconHourglass(), tooltipKey: 'avg-lead-aging' }) +
    kpiCardHtml('k-ind-conv', 'Conversion Rate', Calc.conversionRate(cLeads), { color: 'success', icon: iconTarget(), isPct: true, tooltipKey: 'conversion-rate' }) +
    kpiCardHtml('k-ind-prod', 'Productivity Score', Calc.counsellorProductivity(cLeads), { color: 'primary', icon: iconTarget(), sub: 'Simplified score', tooltipKey: 'conversion-rate' });

  const allLogs = [];
  cLeads.forEach(l => {
    l.activityLog.forEach(a => {
      allLogs.push({
        date: a.date,
        type: a.type,
        student: l.studentName,
        leadId: l.id,
        note: a.note
      });
    });
  });
  allLogs.sort((a, b) => b.date - a.date);
  const recentLogs = allLogs.slice(0, 15);

  const timelineHtml = recentLogs.length ? recentLogs.map(log => `
    <div class="timeline-item ${log.type}">
      <span class="timeline-badge"></span>
      <div class="timeline-content">
        <div class="timeline-header">
          <strong>${log.type}</strong> recorded on lead <a href="#" style="text-decoration: underline; color: var(--primary)">${log.student} (${log.leadId})</a>
        </div>
        <div class="timeline-desc">${log.note}</div>
        <div class="timeline-time">${fmt.dateFull(log.date)}</div>
      </div>
    </div>
  `).join('') : '<div class="empty-state">No recent activity logs found for this counsellor.</div>';

  document.getElementById('mainDashboard').style.display = 'none';
  const cDashboard = document.getElementById('counsellorDashboard');
  cDashboard.classList.add('active');

  cDashboard.innerHTML = `
    <div class="back-btn-row">
      <button class="back-btn" id="exitProfileBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Tab Dashboard
      </button>
    </div>

    <div class="counsellor-profile-header">
      <div class="profile-meta-left">
        <div class="profile-avatar-large">${initials(staff.name)}</div>
        <div class="profile-details-text">
          <h2>${staff.name}</h2>
          <div class="profile-details-sub">
            <span>Counsellor</span>
            <span class="profile-bullet-dot"></span>
            <span>${staff.branch}</span>
            <span class="profile-bullet-dot"></span>
            <span>Reports to: ${manager.name}</span>
            <span class="profile-bullet-dot"></span>
            <span>Productivity Score: <strong>${Calc.counsellorProductivity(cLeads)}/100</strong></span>
          </div>
        </div>
      </div>
      <div class="profile-meta-right">
        <div class="profile-stat-box">
          <div class="profile-stat-lbl">Active</div>
          <div class="profile-stat-val" style="color:var(--primary)">${activeCount}</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-lbl">Converted</div>
          <div class="profile-stat-val" style="color:var(--success)">${convertedCount}</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-lbl">Lost</div>
          <div class="profile-stat-val" style="color:var(--danger)">${lostCount}</div>
        </div>
      </div>
    </div>

    <div class="kpi-grid">${kpiSectionHtml}</div>

    <div class="grid-2">
      ${cardHtml('Daily Performance', 'Leads assigned vs converted — last 14 days', '<div class="chart-wrap h260"><canvas id="chart-ind-daily"></canvas></div>', false, 'chart-daily-activity')}
      ${cardHtml('Lead Status Distribution', 'Current lead status breakdown', '<div class="chart-wrap h260"><canvas id="chart-ind-status"></canvas></div>', false, 'chart-lead-status-dist')}
    </div>

    <div class="grid-2">
      ${cardHtml('Calls vs WhatsApp Activity', 'Weekly logged calls vs WhatsApp messages exchanged', '<div class="chart-wrap h260"><canvas id="chart-ind-contacts"></canvas></div>', false, 'chart-calls-vs-whatsapp')}
    </div>

    <div class="grid-2">
      ${cardHtml('Recent Activities', 'Latest calls, WhatsApp messages, and status updates', `<div class="timeline-container">${timelineHtml}</div>`, false, 'chart-chronological-activity-log')}
      ${cardHtml('Assigned Leads', 'Lead details assigned to this counselor', '<div id="table-ind-leads"></div>', false, 'chart-assigned-lead-records')}
    </div>`;

  document.getElementById('exitProfileBtn').addEventListener('click', () => {
    State.counsellorViewId = null;
    cDashboard.classList.remove('active');
    document.getElementById('mainDashboard').style.display = 'flex';
    runPipeline(false);
  });

  const daily = Calc.dailySeries(cLeads, 14);
  drawChart('chart-ind-daily', {
    type: 'line',
    data: {
      labels: daily.labels,
      datasets: [
        Charts.lineDS('Assigned', daily.assigned, CFG.chartColors.primary),
        Charts.lineDS('Converted', daily.converted, CFG.chartColors.success)
      ]
    },
    options: Charts.lineOpts()
  });

  const dist = Calc.statusDistribution(cLeads);
  drawChart('chart-ind-status', {
    type: 'doughnut',
    data: {
      labels: dist.map(d => d.status),
      datasets: [{
        data: dist.map(d => d.count),
        backgroundColor: CFG.palette,
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
  });

  const callsTrend = [];
  const waTrend = [];
  const labels = [];
  for (let i = 7; i >= 0; i--) {
    const start = addDays(CFG.today, -(i + 1) * 7);
    const end = addDays(CFG.today, -i * 7);
    const wl = cLeads.filter(l => l.assignedDate >= start && l.assignedDate < end);
    labels.push('W' + (8 - i));
    callsTrend.push(Calc.callsCompleted(wl));
    waTrend.push(wl.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0));
  }

  drawChart('chart-ind-contacts', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        Charts.barDS('Calls Logged', callsTrend, CFG.chartColors.purple),
        Charts.barDS('WhatsApp Chat Count', waTrend, CFG.chartColors.pink)
      ]
    },
    options: Charts.barOpts()
  });

  renderTable('table-ind-leads', [
    { key: 'studentName', label: 'Lead Name', render: r => `<span class="name-cell">${escapeHtml(r.studentName)}</span>` },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: 'source', label: 'Source' },
    { key: 'responseTimeHours', label: 'Response', render: r => fmt.hours(r.responseTimeHours) },
    { key: 'assignedDate', label: 'Age', render: r => fmt.days(Calc.daysBetween(r.assignedDate, CFG.today)) }
  ], cLeads, { defaultSort: 'assignedDate', pageSize: 6 });
}

// ============================================================
// DYNAMIC VIEW LAYOUT SWITCHING
// ============================================================

function toggleTabVisibility() {
  const user = State.currentUser;
  const tabs = document.querySelectorAll('.tab');
  
  document.getElementById('tab-counsellor').textContent = 'Counsellor Analytics';
  
  tabs.forEach(t => t.style.display = 'none');

  if (user.role === 'Founder') {
    tabs.forEach(t => t.style.display = 'block');
  } else if (user.role === 'BranchManager') {
    document.getElementById('tab-counsellor').style.display = 'block';
    document.getElementById('tab-teamlead').style.display = 'block';
    document.getElementById('tab-source').style.display = 'block';
  } else if (user.role === 'TeamLead') {
    document.getElementById('tab-counsellor').style.display = 'block';
    document.getElementById('tab-teamlead').style.display = 'block';
  } else if (user.role === 'Counsellor') {
    const cTab = document.getElementById('tab-counsellor');
    cTab.textContent = 'My Performance';
    cTab.style.display = 'block';
  }

  const currentTabButton = document.querySelector(`.tab[data-tab="${State.activeTab}"]`);
  if (!currentTabButton || currentTabButton.style.display === 'none') {
    const firstVisible = Array.from(tabs).find(t => t.style.display !== 'none');
    if (firstVisible) {
      tabs.forEach(t => t.classList.remove('active'));
      firstVisible.classList.add('active');
      State.activeTab = firstVisible.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + State.activeTab).classList.add('active');
    }
  }
}

function updateAssigneeDropdownOptions() {
  const user = State.currentUser;
  const select = document.getElementById('fCounsellor');
  if (!select) return;

  select.innerHTML = '<option value="all">Any Assignee</option>';

  let allowedStaff = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');

  if (user.role === 'BranchManager') {
    allowedStaff = allowedStaff.filter(s => s.branch === user.branch);
  } else if (user.role === 'TeamLead') {
    allowedStaff = allowedStaff.filter(s => s.reportsTo === user.id || s.id === user.id);
  } else if (user.role === 'Counsellor') {
    allowedStaff = allowedStaff.filter(s => s.id === user.id);
  }

  allowedStaff.sort((a,b) => a.name.localeCompare(b.name)).forEach(s => {
    select.appendChild(new Option(s.name, s.id));
  });

  if (user.role === 'Counsellor') {
    select.disabled = true;
    select.value = user.id;
  } else {
    select.disabled = false;
    select.value = State.filters.counsellor;
  }
}

function updateBranchDropdownOptions() {
  const user = State.currentUser;
  const pill = document.getElementById('branchPill');
  const menu = document.getElementById('branchMenu');
  if (!pill) return;

  if (user.role === 'Founder') {
    pill.style.pointerEvents = 'auto';
    pill.querySelector('svg').style.display = 'block';
    pill.querySelector('.branch-name-text').textContent = State.filters.branch === 'all' ? 'All Branches' : State.filters.branch;
  } else {
    pill.style.pointerEvents = 'none';
    pill.querySelector('svg').style.display = 'none';
    pill.querySelector('.branch-name-text').textContent = user.branch;
    State.filters.branch = user.branch;
  }
}

function renderCounsellorSelectorPill() {
  const user = State.currentUser;
  const pill = document.getElementById('counsellorPill');
  const menu = document.getElementById('counsellorMenu');
  if (!pill || !menu) return;

  if (user.role === 'Counsellor') {
    pill.style.display = 'none';
    return;
  }

  pill.style.display = 'inline-flex';

  let list = window.IntelAbroadData.staff.filter(s => s.role !== 'Founder');
  if (user.role === 'BranchManager') {
    list = list.filter(s => s.branch === user.branch);
  } else if (user.role === 'TeamLead') {
    list = list.filter(s => s.reportsTo === user.id || s.id === user.id);
  }

  menu.innerHTML = list.map(s => `
    <button class="dropdown-item" data-id="${s.id}">${escapeHtml(s.name)}</button>
  `).join('');

  menu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      showCounsellorProfile(item.dataset.id);
    });
  });
}

function renderActiveTab() {
  if (State.activeTab === 'counsellor') renderCounsellorTab();
  else if (State.activeTab === 'teamlead') renderTeamLeadTab();
  else if (State.activeTab === 'branch') renderBranchTab();
  else if (State.activeTab === 'source') renderSourceTab();
  else if (State.activeTab === 'management') renderManagementTab();
}

function runPipeline(showTransition = true) {
  applyFilters();
  renderChips();
  
  if (State.counsellorViewId) {
    showCounsellorProfile(State.counsellorViewId);
    updateLastUpdatedText();
  } else {
    if (showTransition) {
      triggerLoadingTransition(() => {
        renderActiveTab();
        updateLastUpdatedText();
      });
    } else {
      renderActiveTab();
      updateLastUpdatedText();
    }
  }
}

function updateLastUpdatedText() {
  const node = document.getElementById('lastUpdated');
  if (node) {
    node.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}

function triggerLoadingTransition(callback) {
  const panelId = `panel-${State.activeTab}`;
  const panel = document.getElementById(panelId);
  if (!panel) return;
  
  const skeletonHtml = `
    <div class="kpi-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
    <div class="grid-2">
      <div class="skeleton skeleton-chart"></div>
      <div class="skeleton skeleton-chart"></div>
    </div>
    <div class="skeleton skeleton-table"></div>`;
    
  panel.innerHTML = skeletonHtml;
  
  setTimeout(() => {
    callback();
  }, 220);
}

function populateFilterOptions() {
  const sSel = document.getElementById('fSource');
  const stSel = document.getElementById('fStatus');

  if (sSel) {
    window.IntelAbroadData.sources.forEach(s => sSel.appendChild(new Option(s, s)));
  }

  if (stSel) {
    CFG.statuses.forEach(s => stSel.appendChild(new Option(s, s)));
  }
}

function readFiltersFromForm() {
  const f = State.filters;
  f.from = document.getElementById('fDateFrom')?.value ? new Date(document.getElementById('fDateFrom').value) : null;
  f.to = document.getElementById('fDateTo')?.value ? new Date(document.getElementById('fDateTo').value + 'T23:59:59') : null;
  f.counsellor = document.getElementById('fCounsellor')?.value || 'all';
  f.source = document.getElementById('fSource')?.value || 'all';
  f.status = document.getElementById('fStatus')?.value || 'all';
  f.search = document.getElementById('fSearch')?.value.trim() || '';
}

function wireEvents() {
  const branchPill = document.getElementById('branchPill');
  const branchMenu = document.getElementById('branchMenu');
  if (branchPill && branchMenu) {
    branchPill.addEventListener('click', e => {
      e.stopPropagation();
      branchMenu.classList.toggle('show');
    });
    branchMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        State.filters.branch = item.dataset.val;
        branchPill.querySelector('.branch-name-text').textContent = item.dataset.val === 'all' ? 'All Branches' : item.dataset.val;
        runPipeline();
      });
    });
  }

  const counsellorPill = document.getElementById('counsellorPill');
  const counsellorMenu = document.getElementById('counsellorMenu');
  if (counsellorPill && counsellorMenu) {
    counsellorPill.addEventListener('click', e => {
      e.stopPropagation();
      counsellorMenu.classList.toggle('show');
    });
  }

  document.addEventListener('click', () => {
    branchMenu?.classList.remove('show');
    counsellorMenu?.classList.remove('show');
  });

  const roleSwitcher = document.getElementById('demoRoleSwitcher');
  if (roleSwitcher) {
    roleSwitcher.addEventListener('change', () => {
      const val = roleSwitcher.value;
      
      State.counsellorViewId = null;
      document.getElementById('counsellorDashboard').classList.remove('active');
      document.getElementById('mainDashboard').style.display = 'flex';

      if (val === 'Founder') {
        State.currentUser = { role: 'Founder', name: 'Dr. Suhail', id: 'S001', branch: 'all' };
      } else if (val === 'BranchManager') {
        State.currentUser = { role: 'BranchManager', name: 'Vanshta Verma', id: 'S002', branch: 'Delhi Office' };
      } else if (val === 'TeamLead') {
        State.currentUser = { role: 'TeamLead', name: 'Hemant Vaidya', id: 'S006', branch: 'Delhi Office' };
      } else if (val === 'Counsellor') {
        State.currentUser = { role: 'Counsellor', name: 'Aditya Gangwani', id: 'S016', branch: 'Raipur Office' };
      }

      document.getElementById('sidebarProfileName').textContent = State.currentUser.name;
      document.getElementById('sidebarProfileEmail').textContent = 
        State.currentUser.role === 'Founder' ? 'founder@intelabroad.com' :
        State.currentUser.role === 'BranchManager' ? 'delhi.manager@intelabroad.com' :
        State.currentUser.role === 'TeamLead' ? 'delhi.lead@intelabroad.com' : 'aditya@intelabroad.com';

      State.filters.branch = State.currentUser.branch;
      State.filters.counsellor = 'all';

      toggleTabVisibility();
      updateBranchDropdownOptions();
      updateAssigneeDropdownOptions();
      renderCounsellorSelectorPill();
      
      runPipeline(true);
    });
  }

  document.getElementById('applyFiltersBtn')?.addEventListener('click', () => {
    readFiltersFromForm();
    runPipeline();
  });

  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    if (document.getElementById('fDateFrom')) document.getElementById('fDateFrom').value = '';
    if (document.getElementById('fDateTo')) document.getElementById('fDateTo').value = '';
    if (document.getElementById('fCounsellor')) document.getElementById('fCounsellor').value = 'all';
    if (document.getElementById('fSource')) document.getElementById('fSource').value = 'all';
    if (document.getElementById('fStatus')) document.getElementById('fStatus').value = 'all';
    if (document.getElementById('fSearch')) document.getElementById('fSearch').value = '';
    
    State.filters.from = null;
    State.filters.to = null;
    State.filters.counsellor = 'all';
    State.filters.source = 'all';
    State.filters.status = 'all';
    State.filters.search = '';
    
    runPipeline();
  });

  document.getElementById('fSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      readFiltersFromForm();
      runPipeline();
    }
  });

  document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.filters.dateType = btn.dataset.type;
      runPipeline();
    });
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      State.activeTab = tab.dataset.tab;
      
      const panel = document.getElementById('panel-' + State.activeTab);
      if (panel) {
        panel.classList.add('active');
      }
      runPipeline(true);
    });
  });

  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    const rows = State.filtered.map(l => ({
      LeadID: l.id,
      StudentName: l.studentName,
      Branch: l.branch,
      Counsellor: l.counsellorName,
      Source: l.source,
      Status: l.status,
      AssignedDate: l.assignedDate.toISOString().slice(0, 10),
      LastActivity: l.lastActivityDate.toISOString().slice(0, 10),
      Converted: l.converted ? 'Yes' : 'No'
    }));
    exportCSV(rows, 'intelabroad_staff_panel_analytics_operational.csv');
  });

  document.getElementById('printBtn')?.addEventListener('click', () => {
    window.print();
  });

  const sidebar = document.getElementById('sidebar');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', e => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.info-btn');
    if (btn) {
      e.stopPropagation();
      const isActive = btn.classList.contains('active');
      document.querySelectorAll('.info-btn.active').forEach(b => b.classList.remove('active'));
      if (!isActive) {
        btn.classList.add('active');
      }
    } else {
      document.querySelectorAll('.info-btn.active').forEach(b => b.classList.remove('active'));
    }
  });
}

function iconUsers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>'; }
function iconPhone() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>'; }
function iconCheck() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconTarget() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'; }
function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }
function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'; }
function iconHourglass() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 2h14M5 22h14M18 2v4.5a5 5 0 01-2 4L12 13l-4-2.5a5 5 0 01-2-4V2M6 22v-4.5a5 5 0 012-4l4-2.5 4 2.5a5 5 0 012 4V22"/></svg>'; }
function iconLayers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>'; }
function iconMessage() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'; }

function initUI() {
  populateFilterOptions();
  readFiltersFromForm();
  wireEvents();
  
  toggleTabVisibility();
  updateBranchDropdownOptions();
  updateAssigneeDropdownOptions();
  renderCounsellorSelectorPill();
  
  runPipeline(true);
}

document.addEventListener('DOMContentLoaded', initUI);
