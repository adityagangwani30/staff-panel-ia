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
  're-engagement-section': 'Lead Re-engagement Analytics helps identify dormant leads that have not been contacted for an extended period. These insights enable counsellors and management to plan targeted follow-up campaigns, improve lead recovery, and increase overall conversion opportunities.',
  'objection-analytics': 'Lead Objection Analytics helps identify the most common reasons why leads do not convert. These insights enable management to improve counselling strategies, marketing communication, and overall lead conversion.',
  'call-outcome-analytics': 'Call Outcome Analytics provides visibility into the outcomes of counselling calls, helping management identify communication trends, improve follow-up strategies, and understand where leads are dropping off.',
  'leads-contacted-today': 'Number of leads contacted for the first time today.'
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

function renderOverviewDashboard() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-overview');
  if (!panel) return;

  const branchPerf = Calc.branchPerformance(leads, window.IntelAbroadData.branches);
  const srcPerf = Calc.sourcePerformance(leads, window.IntelAbroadData.sources);
  const perf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder')).sort((a,b) => b.converted - a.converted);
  const todayContacted = Calc.leadsContactedToday(leads);

  // 1. Executive KPI Cards
  const kpis =
    kpiCardHtml('k-ov-total', 'Total Leads', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-ov-active', 'Active Leads', Calc.activeLeads(leads), { color: 'info', icon: iconTarget(), tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-ov-convrate', 'Conversion Rate', Calc.conversionRate(leads), { color: 'success', icon: iconTarget(), isPct: true, tooltipKey: 'conversion-rate' }) +
    kpiCardHtml('k-ov-pending', 'Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'warning', icon: iconAlert(), tooltipKey: 'pending-followups' }) +
    kpiCardHtml('k-ov-resp', 'Average Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), tooltipKey: 'avg-response' }) +
    kpiCardHtml('k-ov-contacted', 'Leads Contacted Today', todayContacted, { color: 'teal', icon: iconPhone(), tooltipKey: 'leads-contacted-today' });

  // 3. Lead Re-engagement KPIs
  const buckets = Calc.reEngagementBuckets(leads);
  const totalDormant = buckets.reduce((sum, b) => sum + b.count, 0);
  const totalLeads = leads.length;
  const reKpis =
    kpiCardHtml('k-re-30', '30-Day Inactive Leads', buckets[0].count, { color: 'warning', icon: iconClock(), sub: fmt.pct(buckets[0].pct) + ' of active', tooltipKey: 're-engagement' }) +
    kpiCardHtml('k-re-60', '60-Day Inactive Leads', buckets[1].count, { color: 'danger', icon: iconHourglass(), sub: fmt.pct(buckets[1].pct) + ' of active', tooltipKey: 're-engagement' }) +
    kpiCardHtml('k-re-90', '90+ Day Inactive Leads', buckets[2].count, { color: 'slate', icon: iconAlert(), sub: fmt.pct(buckets[2].pct) + ' of active', tooltipKey: 're-engagement' }) +
    kpiCardHtml('k-re-total', 'Total Dormant Leads', totalDormant, { color: 'primary', icon: iconUsers(), sub: fmt.pct(totalLeads ? (totalDormant / totalLeads) * 100 : 0) + ' of total leads', tooltipKey: 're-engagement' });

  // 4. Lead Objection Analytics
  const obj = Calc.objectionBreakdown(leads);
  const objRows = obj.rows.map(r => {
    const pctWidth = obj.total ? Math.max((r.count / obj.total) * 100, 2) : 0;
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

  // 5. Call Outcome Analytics
  const callOutcome = Calc.callOutcomeBreakdown(leads);

  panel.innerHTML = `
    <div class="kpi-grid">${kpis}</div>

    ${cardHtml('Lead Funnel', 'Stage-by-stage distribution through the conversion pipeline', '<div id="funnel-overview" style="padding-top:6px"></div>', false, 'chart-overall-funnel')}

    <div class="section-divider">
      <div class="section-title-row">
        <h2 class="section-title">Lead Re-engagement Analytics${tooltipHtml('re-engagement-section')}</h2>
      </div>
    </div>
    <div class="kpi-grid">${reKpis}</div>
    ${cardHtml('Dormant Lead Distribution', 'Inactive lead breakdown by period', '<div class="chart-wrap h260"><canvas id="chart-re-dist"></canvas></div>', false, 're-engagement')}

    <div class="section-divider">
      <div class="section-title-row">
        <h2 class="section-title">Lead Objection Analytics${tooltipHtml('objection-analytics')}</h2>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div>
          <div class="card-sub">Reasons leads did not convert — most common: <strong>${escapeHtml(obj.mostCommon.reason)}</strong> (${fmt.int(obj.mostCommon.count)})</div>
        </div>
      </div>
      <div style="margin-top:8px">${objRows}</div>
    </div>

    <div class="section-divider">
      <div class="section-title-row">
        <h2 class="section-title">Call Outcome Analytics${tooltipHtml('call-outcome-analytics')}</h2>
      </div>
    </div>
    <div class="grid-2">
      ${cardHtml('Outcome Distribution', 'Breakdown of call outcomes across all interactions', '<div class="chart-wrap h260"><canvas id="chart-call-outcome"></canvas></div>', false, 'call-outcome-analytics')}
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Outcome Summary</div>
            <div class="card-sub">Count and percentage by outcome type</div>
          </div>
        </div>
        <div id="call-outcome-table"></div>
      </div>
    </div>

    <div class="section-divider">
      <div class="section-title-row">
        <h2 class="section-title">Branch Performance</h2>
      </div>
    </div>
    <div class="grid-2">
      ${cardHtml('Branch Comparison', 'Assigned vs converted leads by branch office', '<div class="chart-wrap h260"><canvas id="chart-branch-overview"></canvas></div>', false, 'chart-branch-comparison')}
      ${cardHtml('Lead Source Performance', 'Lead volume and conversion by source', '<div class="chart-wrap h260"><canvas id="chart-source-overview"></canvas></div>', false, 'chart-lead-source-performance')}
    </div>

    ${cardHtml('Counsellor Leaderboard', 'Top counsellors by conversions and productivity', '<div id="table-leader-overview"></div>', true, 'chart-counsellor-leaderboard')}`;

  // 2. Draw Funnel
  drawFunnel('funnel-overview', Calc.funnelStages(leads));

  // 3. Draw Dormant Lead Distribution chart
  drawChart('chart-re-dist', {
    type: 'bar',
    data: {
      labels: buckets.map(b => b.label),
      datasets: [Charts.barDS('Inactive Leads', buckets.map(b => b.count), CFG.chartColors.warning)]
    },
    options: Charts.barOpts()
  });

  // 5. Draw Call Outcome Distribution chart
  const outcomeLabels = callOutcome.rows.map(r => r.outcome);
  const outcomeData = callOutcome.rows.map(r => r.count);
  drawChart('chart-call-outcome', {
    type: 'doughnut',
    data: {
      labels: outcomeLabels,
      datasets: [{
        data: outcomeData,
        backgroundColor: [CFG.chartColors.success, CFG.chartColors.danger, CFG.chartColors.warning, CFG.chartColors.slate, CFG.chartColors.info, CFG.chartColors.pink],
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
  });

  // Call Outcome table
  renderTable('call-outcome-table', [
    { key: 'outcome', label: 'Outcome' },
    { key: 'count', label: 'Count', render: r => fmt.int(r.count) },
    { key: 'pct', label: 'Percentage', render: r => fmt.pct(r.pct) }
  ], callOutcome.rows, { defaultSort: 'count' });

  // 6. Branch Performance chart
  drawChart('chart-branch-overview', {
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

  // 7. Lead Source Performance chart
  drawChart('chart-source-overview', {
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

  // 8. Counsellor Leaderboard table
  renderTable('table-leader-overview', [
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
        Back to Overview
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
      ${cardHtml('Lead Status Distribution', 'Current lead status breakdown', '<div class="chart-wrap h260"><canvas id="chart-ind-status"></canvas></div>', false, 'chart-lead-status-dist')}
      ${cardHtml('Lead Funnel', 'Stage-by-stage distribution through the conversion pipeline', '<div id="funnel-ind" style="padding-top:6px"></div>', false, 'chart-overall-funnel')}
    </div>`;

  document.getElementById('exitProfileBtn').addEventListener('click', () => {
    State.counsellorViewId = null;
    cDashboard.classList.remove('active');
    document.getElementById('mainDashboard').style.display = 'flex';
    runPipeline(false);
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

  drawFunnel('funnel-ind', Calc.funnelStages(cLeads));
}

// ============================================================
// DYNAMIC VIEW LAYOUT SWITCHING
// ============================================================

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

function runPipeline(showTransition = true) {
  applyFilters();
  renderChips();
  
  if (State.counsellorViewId) {
    showCounsellorProfile(State.counsellorViewId);
    updateLastUpdatedText();
  } else {
    if (showTransition) {
      triggerLoadingTransition(() => {
        renderOverviewDashboard();
        updateLastUpdatedText();
      });
    } else {
      renderOverviewDashboard();
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
  const panelId = 'panel-overview';
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
  
  updateBranchDropdownOptions();
  updateAssigneeDropdownOptions();
  renderCounsellorSelectorPill();
  
  runPipeline(true);
}

document.addEventListener('DOMContentLoaded', initUI);
