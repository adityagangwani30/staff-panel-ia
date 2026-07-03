/* ============================================================
   UI CONTROLLER & INTERACTION ENGINE — IntelAbroad Staff Panel
   ============================================================ */

const State = {
  // Active logged-in user simulation
  currentUser: {
    role: 'Founder',
    name: 'Dr. Suhail',
    id: 'S001',
    branch: 'all'
  },
  filters: {
    dateType: 'entry', // 'entry', 'updated', 'followup'
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
  theme: 'dark',
  charts: {},
  tables: {},
  counsellorViewId: null // If set, displays individual counsellor dashboard
};

// Utilities for UI formatting
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

// Metric Definitions for Tooltips
const METRIC_DEFS = {
  // KPIs
  'total-assigned': 'Total number of leads assigned within the selected scope.',
  'contacted': 'Leads that have been contacted (have a recorded first contact date).',
  'calls': 'Total number of telephone calls completed with leads.',
  'whatsapp': 'Total number of WhatsApp messages exchanged with leads.',
  'followups-completed': 'Total number of scheduled follow-ups successfully marked as completed.',
  'pending-followups': 'Number of follow-ups that are yet to be completed.',
  'avg-response': 'Average time taken by a counsellor to make the first contact with a lead.',
  'conversion-rate': 'Percentage of assigned leads that have been successfully converted.',
  'team-members': 'Number of active counselors in the team.',
  'avg-workload': 'Average number of leads assigned per counselor.',
  'followup-compliance': 'Percentage of follow-ups completed on time.',
  'team-avg-response': 'Average time taken by team members to contact leads.',
  'overdue-followups': 'Number of follow-ups that have passed their scheduled date without completion.',
  'total-source-volume': 'Total volume of leads generated across all active sources.',
  'top-conversion-channel': 'Acquisition channel with the highest lead-to-admit conversion rate.',
  'blended-quality': 'Aggregated quality score of leads across all active sources.',
  'leading-volume-generator': 'Acquisition channel that generated the highest number of leads.',
  'total-leads-managed': 'Total number of leads managed at the organizational level.',
  'converted-leads': 'Total number of leads successfully converted.',
  'blended-conversion-rate': 'Overall lead conversion efficiency across the company.',
  'sla-response-compliance': 'Percentage of leads contacted within the 24-hour SLA window.',
  'avg-lead-aging': 'Average number of days a lead has remained active since it was assigned.',

  // Charts
  'chart-daily-activity': 'Daily volume of assigned vs converted leads over the last 14 days.',
  'chart-funnel-dist': 'Distribution of leads across current funnel statuses.',
  'chart-weekly-flow': 'Weekly comparison of assigned vs converted leads over the last 8 weeks.',
  'chart-funnel-progression': 'Cumulative conversion funnel progression from new leads to converted.',
  'chart-monthly-lead-flow': 'Monthly trend of assigned vs converted leads over the last 6 months.',
  'chart-top-counsellors': 'Counsellors with the highest conversion numbers in scope.',
  'chart-counsellor-metrics': 'Individual performance metrics of counselors in scope.',
  'chart-workload-status': 'Workload status breakdown per counselor.',
  'chart-followup-compliance-breakdown': 'Breakdown of completed, pending, and overdue follow-ups.',
  'chart-response-latency-trends': 'Weekly trend of team average response latency.',
  'chart-overdue-followups-heatmap': 'Heatmap of overdue follow-ups by branch and day of the week.',
  'chart-overdue-followups-action': 'List of urgent follow-ups overdue for immediate action.',
  'chart-branch-admission-output': 'Assigned vs converted lead comparison by branch office.',
  'chart-lead-share-by-branch': 'Percentage share of total leads across branch offices.',
  'chart-monthly-lead-growth': 'Monthly lead volume growth trends for the top 3 branches.',
  'chart-branch-operational-ranking': 'Operational performance and efficiency metrics of branch offices.',
  'chart-source-admission-volumetrics': 'Total lead volume generated per acquisition source.',
  'chart-source-efficiency-metrics': 'Assigned vs converted leads comparison by acquisition source.',
  'chart-conversion-efficiency-trends': 'Monthly conversion rate trend by acquisition source.',
  'chart-lead-quality-score-by-channel': 'Lead Quality Score based on conversion, SLA, and qualification progression.',
  'chart-lead-acquisition-performance': 'Acquisition channel performance metrics sorted by volume.',
  'chart-admissions-conversion-funnel': 'Stage-by-stage distribution of converted leads.',
  'chart-branch-admissions-performance': 'Conversion output comparison by branch.',
  'chart-blended-conversion-trends': '6-month historic lead-to-admit conversion rate trend.',
  'chart-active-pipeline-stages': 'Pipeline stage breakdown of all currently active cases.',
  'chart-admissions-pipeline-aging': 'Days elapsed since case assignment for open leads.',
  'chart-sla-compliance-response-latency': 'SLA compliance rate compared with average response latency.',
  'chart-mom-lead-volume-growth': 'Month-over-month lead volume growth percentage.',
  'chart-daily-counselor-activity-logs': 'Counsellor actions logged daily (calls, WhatsApp, emails).',
  'chart-counsellor-leaderboard': 'Leaderboard of top performing counselors.',
  'chart-operational-insights-anomalies': 'Automated insights and anomaly alerts.',
  'chart-whatsapp-vs-calls-log-trend': 'Weekly calls logged vs WhatsApp messages exchanged.',
  'chart-preferred-country-distribution': 'Leads distribution by preferred destination country.',
  'chart-chronological-activity-log': 'Recent updates and events logged on assigned cases.',
  'chart-assigned-lead-records': 'Operational details of leads assigned to this counselor.'
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

// Counter count-up micro interaction
function animateCounter(elNode, target, opts = {}) {
  const isPct = opts.isPct;
  const decimals = opts.decimals ?? 0;
  const duration = 400;
  const start = performance.now();
  
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = target * eased;
    let text = val.toFixed(decimals);
    
    if (isPct) text = text + '%';
    else text = Number(text).toLocaleString('en-US');
    
    elNode.textContent = text;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function runCounters(root) {
  root.querySelectorAll('[data-target]').forEach(node => {
    let target = parseFloat(node.dataset.target);
    if (isNaN(target) || !isFinite(target)) target = 0;
    animateCounter(node, target, {
      isPct: !!node.dataset.ispct,
      decimals: node.dataset.decimals != null ? parseInt(node.dataset.decimals) : 0
    });
  });
}

// CSV Export
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

// Table rendering engine with paging, sorting, selection
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
  
  // Table search
  if (ts.search) {
    const q = ts.search.toLowerCase();
    data = data.filter(r => cols.some(c => String(r[c.key]).toLowerCase().includes(q)));
  }

  // Table sort
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
    
    // Sanitize chart datasets to prevent NaN, Infinity, undefined, null
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

// Global Filter engine
function applyFilters() {
  const f = State.filters;
  const user = State.currentUser;
  
  // Set filters base scope based on User Role Permissions
  let allowedLeads = window.IntelAbroadData.leads;
  
  if (user.role === 'Counsellor') {
    f.branch = user.branch;
    f.counsellor = user.id;
  } else if (user.role === 'TeamLead') {
    f.branch = user.branch;
    // Limit SList to team members
    const teamMembers = window.IntelAbroadData.staff
      .filter(s => s.reportsTo === user.id || s.id === user.id)
      .map(s => s.id);
    allowedLeads = allowedLeads.filter(l => teamMembers.includes(l.counsellorId));
    
    // Filter assignee picker scope
    if (f.counsellor !== 'all' && !teamMembers.includes(f.counsellor)) {
      f.counsellor = 'all';
    }
  } else if (user.role === 'BranchManager') {
    f.branch = user.branch;
    // Limit to branch leads
    allowedLeads = allowedLeads.filter(l => l.branch === user.branch);
  }

  State.filtered = allowedLeads.filter(l => {
    // 1. Date Type Filters
    let targetDate = l.assignedDate;
    if (f.dateType === 'updated') targetDate = l.lastActivityDate;
    else if (f.dateType === 'followup') {
      targetDate = l.followUps && l.followUps.length ? l.followUps[0].dueDate : null;
    }

    if (!targetDate && (f.from || f.to)) return false;

    if (f.from && targetDate < f.from) return false;
    if (f.to && targetDate > f.to) return false;

    // 2. Branch Filter
    if (f.branch !== 'all' && l.branch !== f.branch) return false;

    // 3. Counsellor Filter
    if (f.counsellor !== 'all' && l.counsellorId !== f.counsellor) return false;

    // 4. Source Filter
    if (f.source !== 'all' && l.source !== f.source) return false;

    // 5. Status Filter
    if (f.status !== 'all' && l.status !== f.status) return false;

    // 6. Text Search Filter
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

// Render Filter Chips
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

// Layout Widget Templates
function kpiCardHtml(id, label, target, opts = {}) {
  const icon = opts.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>';
  const color = opts.color || 'primary';
  const trend = opts.trend;
  const sub = opts.sub || '';
  const attrs = `data-target="${target}"${opts.isPct ? ' data-ispct="1"' : ''}${opts.decimals != null ? ` data-decimals="${opts.decimals}"` : ''}`;
  const tooltip = opts.tooltipKey ? tooltipHtml(opts.tooltipKey) : '';
  
  return `
    <div class="kpi-card">
      <div class="kpi-top">
        <div class="kpi-icon" style="background:var(--${color}-tint);color:var(--${color})">${icon}</div>
        ${opts.badge ? `<span class="card-tag">${opts.badge}</span>` : ''}
      </div>
      <div class="kpi-label">${label}${tooltip}</div>
      <div class="kpi-value" id="${id}" ${attrs}>0</div>
      <div class="kpi-trend-row">
        ${trend ? `<span class="kpi-trend ${trend.dir}">${trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '—'} ${trend.text}</span>` : ''}
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

// Render Funnel List
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

// Render Overdue heatmap
function drawHeatmap(containerId, branches, leads) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const overdue = Calc.overdueFollowups(leads);
  
  const matrix = branches.map(b => {
    return days.map((_, d) => overdue.filter(r => r.branch === b && new Date(r.dueDate).getDay() === d).length);
  });
  
  const flat = matrix.flat();
  const max = Math.max(...flat, 1);
  
  let html = '<div class="heat-label"></div>' + days.map(d => `<div class="heat-label" style="justify-content:center">${d}</div>`).join('');
  
  branches.forEach((b, i) => {
    html += `<div class="heat-label">${b.split(' ')[0]}</div>`;
    matrix[i].forEach(v => {
      const alpha = v > 0 ? 0.15 + (v / max) * 0.75 : 0;
      const bg = v > 0 ? `rgba(239, 68, 68, ${alpha.toFixed(2)})` : '#18181b';
      const borderStyle = v > 0 ? 'border: 1px solid rgba(239, 68, 68, 0.4);' : '';
      html += `<div class="heat-cell" style="background:${bg};${borderStyle}">${v || ''}</div>`;
    });
  });
  
  container.innerHTML = `<div class="heatmap">${html}</div>`;
}

// Operational Insights
function buildInsightsList(leads, branchPerf, perf) {
  const out = [];
  const topBranch = branchPerf.slice().sort((a,b) => b.conversionRate - a.conversionRate)[0];
  if (topBranch) {
    out.push({ color: 'success', text: `<b>${topBranch.branch}</b> reports the highest operational conversion at <b>${fmt.pct(topBranch.conversionRate)}</b>.` });
  }
  const topCounsellor = perf.slice().sort((a,b) => b.converted - a.converted)[0];
  if (topCounsellor) {
    out.push({ color: 'primary', text: `<b>${topCounsellor.name}</b> converted the most leads in scope (<b>${topCounsellor.converted} converted</b>).` });
  }
  const overdue = Calc.overdueFollowups(leads);
  if (overdue.length) {
    out.push({ color: 'danger', text: `<b>${overdue.length} follow-ups</b> are overdue. Branch heads must intervene immediately.` });
  }
  const avgSla = Calc.slaComplianceRate(leads);
  out.push({ color: 'info', text: `Blended response SLA compliance stands at <b>${fmt.pct(avgSla)}</b> contacted within 24 hours.` });
  
  const slowest = branchPerf.slice().sort((a,b) => a.slaCompliance - b.slaCompliance)[0];
  if (slowest) {
    out.push({ color: 'warning', text: `<b>${slowest.branch}</b> has the lowest SLA compliance (<b>${fmt.pct(slowest.slaCompliance)}</b>). Re-evaluate counselor workloads.` });
  }
  return out;
}

// ============================================================
// TAB RENDERING TRIGGERS
// ============================================================

function renderCounsellorTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-counsellor');
  
  const trend = { dir: 'up', text: '+3.5% vs prev month' };

  const kpis = 
    kpiCardHtml('k-c-assigned', 'Total Leads Assigned', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), trend: trend, tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-c-contacted', 'Leads Contacted', Calc.contacted(leads), { color: 'info', icon: iconPhone(), sub: fmt.pct(Calc.contactRate(leads)) + ' contact rate', tooltipKey: 'contacted' }) +
    kpiCardHtml('k-c-calls', 'Calls Completed', Calc.callsCompleted(leads), { color: 'purple', icon: iconCall(), sub: `Avg calls/conv: ${Calc.avgCallsPerConversion(leads).toFixed(1)}`, tooltipKey: 'calls' }) +
    kpiCardHtml('k-c-whatsapp', 'WhatsApp Chats Logged', leads.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0), { color: 'pink', icon: iconMessage(), tooltipKey: 'whatsapp' }) +
    kpiCardHtml('k-c-fu', 'Follow-ups Completed', Calc.followupsCompleted(leads), { color: 'teal', icon: iconCheck(), sub: `Avg FUs/conv: ${Calc.avgFollowupsPerConversion(leads).toFixed(1)}`, tooltipKey: 'followups-completed' }) +
    kpiCardHtml('k-c-pending', 'Pending Follow-ups', Calc.pendingFollowups(leads), { color: 'danger', icon: iconAlert(), sub: `${Calc.overdueFollowups(leads).length} overdue`, tooltipKey: 'pending-followups' }) +
    kpiCardHtml('k-c-resp', 'Avg Response Time', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), decimals: 1, sub: fmt.pct(Calc.slaComplianceRate(leads)) + ' SLA compliance', tooltipKey: 'avg-response' }) +
    kpiCardHtml('k-c-aging', 'Lead Conversion Rate', Calc.conversionRate(leads), { color: 'success', icon: iconTarget(), isPct: true, decimals: 1, sub: `Avg aging: ${Calc.avgLeadAging(leads).toFixed(0)} days`, tooltipKey: 'conversion-rate' });

  panel.innerHTML = `
    <div class="kpi-grid">${kpis}</div>
    <div class="grid-2">
      ${cardHtml('Daily Activity Volume', 'Leads assigned vs converted — last 14 days', '<div class="chart-wrap h260"><canvas id="chart-c-daily"></canvas></div>', false, 'chart-daily-activity')}
      ${cardHtml('Lead Funnel Distribution', 'Current mix across lead funnel stages', '<div class="chart-wrap h260"><canvas id="chart-c-status"></canvas></div>', false, 'chart-funnel-dist')}
    </div>
    <div class="grid-2">
      ${cardHtml('Weekly Flow Comparison', 'Assigned vs converted — last 8 weeks', '<div class="chart-wrap h260"><canvas id="chart-c-weekly"></canvas></div>', false, 'chart-weekly-flow')}
      ${cardHtml('Conversion Funnel Progression', 'Cumulative lead stage completion', '<div id="funnel-c" style="padding-top:6px"></div>', false, 'chart-funnel-progression')}
    </div>
    <div class="grid-2">
      ${cardHtml('Monthly Lead Flow', '6-month assigned vs converted trends', '<div class="chart-wrap h260"><canvas id="chart-c-monthly"></canvas></div>', false, 'chart-monthly-lead-flow')}
      ${cardHtml('Top Counsellors by Conversion', 'Ranked by conversions closed', '<div class="chart-wrap h260"><canvas id="chart-c-top"></canvas></div>', false, 'chart-top-counsellors')}
    </div>
    ${cardHtml('Counsellor Performance Metrics', 'Workload and operational latency per counselor in scope', '<div id="table-c-perf"></div>', true, 'chart-counsellor-metrics')}`;

  runCounters(panel);

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

  const weekly = Calc.weeklySeries(leads, 8);
  drawChart('chart-c-weekly', {
    type: 'bar',
    data: {
      labels: weekly.labels,
      datasets: [
        Charts.barDS('Assigned', weekly.assigned, CFG.chartColors.primary),
        Charts.barDS('Converted', weekly.converted, CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });

  drawFunnel('funnel-c', Calc.funnelStages(leads));

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

  const perf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder'))
                   .sort((a,b) => b.converted - a.converted)
                   .slice(0, 8);
  drawChart('chart-c-top', {
    type: 'bar',
    data: {
      labels: perf.map(p => p.name),
      datasets: [Charts.barDS('Converted', perf.map(p => p.converted), CFG.chartColors.purple)]
    },
    options: Charts.hbarOpts()
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
      // Find staff id
      const staffMember = window.IntelAbroadData.staff.find(s => s.name === rowId);
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
      ${kpiCardHtml('k-t-team', 'Team Members Handled', perf.length, { color: 'primary', icon: iconUsers(), tooltipKey: 'team-members' })}
      ${kpiCardHtml('k-t-workload', 'Avg Workload / Counsellor', perf.length ? Calc.totalAssigned(leads) / perf.length : 0, { color: 'info', icon: iconLayers(), decimals: 1, tooltipKey: 'avg-workload' })}
      ${kpiCardHtml('k-t-fu', 'Follow-up Compliance', Calc.followupCompletionRate(leads), { color: 'success', icon: iconCheck(), isPct: true, decimals: 1, tooltipKey: 'followup-compliance' })}
      ${kpiCardHtml('k-t-resp', 'Team Avg Response', Calc.avgResponseTime(leads), { color: 'warning', icon: iconClock(), decimals: 1, sub: 'hours average', tooltipKey: 'team-avg-response' })}
      ${kpiCardHtml('k-t-overdue', 'Overdue Follow-ups', overdue.length, { color: 'danger', icon: iconAlert(), sub: fmt.pct(Calc.slaComplianceRate(leads)) + ' SLA Compliance', tooltipKey: 'overdue-followups' })}
    </div>
    <div class="grid-2">
      ${cardHtml('Workload Status Distribution', 'Assigned leads status split per counselor', '<div class="chart-wrap h300"><canvas id="chart-t-stack"></canvas></div>', false, 'chart-workload-status')}
      ${cardHtml('Follow-up Compliance breakdown', 'Completed vs pending vs overdue follow-ups', '<div class="chart-wrap h300"><canvas id="chart-t-pie"></canvas></div>', false, 'chart-followup-compliance-breakdown')}
    </div>
    <div class="grid-2">
      ${cardHtml('Response Latency Trends', 'Team average response latency — weekly', '<div class="chart-wrap h260"><canvas id="chart-t-line"></canvas></div>', false, 'chart-response-latency-trends')}
      ${cardHtml('Overdue Follow-ups Heatmap', 'Critical follow-ups overdue by branch office and day of week due', '<div id="heat-t" style="padding-top:8px"></div>', false, 'chart-overdue-followups-heatmap')}
    </div>
    ${cardHtml('Overdue Follow-ups Action List', 'Immediate counselor attention needed', '<div id="table-t-overdue"></div>', true, 'chart-overdue-followups-action')}`;

  runCounters(panel);

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

  const fuCompleted = Calc.followupsCompleted(leads);
  const fuOverdue = overdue.length;
  const fuPending = Math.max(Calc.followupsTotal(leads) - fuCompleted - fuOverdue, 0);

  drawChart('chart-t-pie', {
    type: 'pie',
    data: {
      labels: ['Completed', 'Pending', 'Overdue'],
      datasets: [{
        data: [fuCompleted, fuPending, fuOverdue],
        backgroundColor: [CFG.chartColors.success, CFG.chartColors.warning, CFG.chartColors.danger],
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
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

  drawHeatmap('heat-t', window.IntelAbroadData.branches, leads);

  renderTable('table-t-overdue', [
    { key: 'leadId', label: 'Lead ID' },
    { key: 'student', label: 'Student', render: r => `<span class="name-cell">${escapeHtml(r.student)}</span>` },
    { key: 'counsellor', label: 'Counsellor' },
    { key: 'branch', label: 'Branch' },
    { key: 'dueDate', label: 'Due Date', render: r => fmt.dateFull(r.dueDate) },
    { key: 'overdueDays', label: 'Days Overdue', render: r => `${r.overdueDays}d` },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) }
  ], overdue, { defaultSort: 'overdueDays' });
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
          <div class="mini-stat-label">Conversion</div>
          <div class="mini-stat-val">${fmt.pct(b.conversionRate)}</div>
        </div>
        <div>
          <div class="mini-stat-label">Productivity</div>
          <div class="mini-stat-val">${b.productivity.toFixed(0)}</div>
        </div>
        <div>
          <div class="mini-stat-label">SLA Compliance</div>
          <div class="mini-stat-val">${fmt.pct(b.slaCompliance)}</div>
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
      ${cardHtml('Branch Lead Conversion', 'Assigned vs converted leads by branch office', '<div class="chart-wrap h280"><canvas id="chart-b-compare"></canvas></div>', false, 'chart-branch-admission-output')}
      ${cardHtml('Lead share by Branch', 'Percentage share of company leads by branch', '<div class="chart-wrap h280"><canvas id="chart-b-dist"></canvas></div>', false, 'chart-lead-share-by-branch')}
    </div>
    ${cardHtml('Monthly Lead Growth Trends', 'Assigned cases volume growth for top 3 branches', '<div class="chart-wrap h280"><canvas id="chart-b-growth"></canvas></div>', false, 'chart-monthly-lead-growth')}
    ${cardHtml('Branch Operational Performance Ranking', 'Branch offices sorted by conversion efficiency', '<div id="table-b-rank"></div>', true, 'chart-branch-operational-ranking')}`;

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

  drawChart('chart-b-dist', {
    type: 'doughnut',
    data: {
      labels: branchPerf.map(b => b.branch),
      datasets: [{
        data: branchPerf.map(b => b.assigned),
        backgroundColor: CFG.palette,
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
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

  renderTable('table-b-rank', [
    { key: 'branch', label: 'Branch Office' },
    { key: 'assigned', label: 'Total Leads' },
    { key: 'active', label: 'Active Leads' },
    { key: 'converted', label: 'Converted' },
    { key: 'conversionRate', label: 'Conversion %', render: r => fmt.pct(r.conversionRate) },
    { key: 'productivity', label: 'Productivity Score', render: r => r.productivity.toFixed(0) },
    { key: 'slaCompliance', label: 'SLA Compliance %', render: r => fmt.pct(r.slaCompliance) },
    { key: 'avgResponse', label: 'Avg Response', render: r => fmt.hours(r.avgResponse) },
    { key: 'avgAging', label: 'Lead Aging', render: r => fmt.days(r.avgAging) }
  ], branchPerf, { defaultSort: 'conversionRate' });
}

function renderSourceTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-source');
  const srcPerf = Calc.sourcePerformance(leads, window.IntelAbroadData.sources);
  const best = srcPerf.slice().sort((a,b) => b.conversionRate - a.conversionRate)[0] || { source: '—', conversionRate: 0 };
  const biggest = srcPerf.slice().sort((a,b) => b.assigned - a.assigned)[0] || { source: '—', assigned: 0 };

  panel.innerHTML = `
    <div class="kpi-grid">
      ${kpiCardHtml('k-s-total', 'Total Source Volume', Calc.totalAssigned(leads), { color: 'primary', icon: iconUsers(), sub: `across ${window.IntelAbroadData.sources.length} active channels`, tooltipKey: 'total-source-volume' })}
      ${kpiCardHtml('k-s-convrate', 'Top Conversion Channel', best.conversionRate, { color: 'success', icon: iconTarget(), isPct: true, decimals: 1, sub: best.source, tooltipKey: 'top-conversion-channel' })}
      ${kpiCardHtml('k-s-quality', 'Blended Quality Factor', Calc.leadQualityScore(leads), { color: 'info', icon: iconCheck(), sub: 'Global quality score', tooltipKey: 'blended-quality' })}
      ${kpiCardHtml('k-s-campaign', 'Leading Volume Generator', biggest.assigned, { color: 'purple', icon: iconLayers(), sub: biggest.source, tooltipKey: 'leading-volume-generator' })}
    </div>
    <div class="grid-2">
      ${cardHtml('Source Lead Volumetrics', 'Total leads generated per channel', '<div class="chart-wrap h280"><canvas id="chart-s-funnel"></canvas></div>', false, 'chart-source-admission-volumetrics')}
      ${cardHtml('Source Efficiency Metrics', 'Assigned vs converted metrics by acquisition source', '<div class="chart-wrap h280"><canvas id="chart-s-compare"></canvas></div>', false, 'chart-source-efficiency-metrics')}
    </div>
    <div class="grid-2">
      ${cardHtml('Conversion Efficiency Trends', 'Monthly conversion rate by source', '<div class="chart-wrap h260"><canvas id="chart-s-trend"></canvas></div>', false, 'chart-conversion-efficiency-trends')}
      ${cardHtml('Lead Quality Score by Channel', 'Lead Quality Score based on conversion, SLA, and qualification progression', '<div class="chart-wrap h260"><canvas id="chart-s-quality"></canvas></div>', false, 'chart-lead-quality-score-by-channel')}
    </div>
    ${cardHtml('Lead Acquisition Performance', 'Channel performance metrics sorted by volume', '<div id="table-s-perf"></div>', true, 'chart-lead-acquisition-performance')}`;

  runCounters(panel);

  const sorted = srcPerf.slice().sort((a,b) => b.assigned - a.assigned);
  drawChart('chart-s-funnel', {
    type: 'bar',
    data: {
      labels: sorted.map(s => s.source),
      datasets: [Charts.barDS('Assigned', sorted.map(s => s.assigned), CFG.chartColors.info)]
    },
    options: Charts.hbarOpts()
  });

  drawChart('chart-s-compare', {
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

  const months = Calc.monthlySeries(leads, 6).labels;
  const trendVals = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i, 1);
    const next = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i + 1, 1);
    const ml = leads.filter(l => l.assignedDate >= d && l.assignedDate < next);
    trendVals.push(Calc.conversionRate(ml));
  }

  drawChart('chart-s-trend', {
    type: 'line',
    data: {
      labels: months,
      datasets: [Charts.lineDS('Conversion Rate', trendVals, CFG.chartColors.success, true)]
    },
    options: Charts.lineOpts(true)
  });

  drawChart('chart-s-quality', {
    type: 'bar',
    data: {
      labels: srcPerf.map(s => s.source),
      datasets: [{
        label: 'Quality Score (0-100)',
        data: srcPerf.map(s => Math.round(s.qualityScore)),
        backgroundColor: CFG.chartColors.teal,
        borderRadius: 4
      }]
    },
    options: Charts.barOpts()
  });

  renderTable('table-s-perf', [
    { key: 'source', label: 'Acquisition Source' },
    { key: 'assigned', label: 'Total Leads' },
    { key: 'converted', label: 'Converted' },
    { key: 'conversionRate', label: 'Conversion %', render: r => fmt.pct(r.conversionRate) },
    { key: 'qualityScore', label: 'Quality Score (LQS)', render: r => `${r.qualityScore.toFixed(0)}/100` },
    { key: 'avgResponse', label: 'Avg Latency', render: r => fmt.hours(r.avgResponse) },
    { key: 'avgCalls', label: 'Avg Calls/Conv', render: r => r.avgCalls.toFixed(1) },
    { key: 'avgFUs', label: 'Avg FUs/Conv', render: r => r.avgFUs.toFixed(1) }
  ], srcPerf, { defaultSort: 'assigned' });
}

function renderManagementTab() {
  const leads = State.filtered;
  const panel = document.getElementById('panel-management');
  const branchPerf = Calc.branchPerformance(leads, window.IntelAbroadData.branches);
  const perf = Calc.counsellorPerformance(leads, window.IntelAbroadData.staff.filter(s => s.role !== 'Founder')).sort((a,b) => b.converted - a.converted);
  
  const activeCount = Calc.activeLeads(leads);
  const monthly = Calc.monthlySeries(leads, 6);
  const lastGrowth = Calc.growth(monthly.assigned[5], monthly.assigned[4]);
  const forecastNext = Math.round(monthly.assigned[5] * (1 + Math.max(lastGrowth, 0) / 100));

  panel.innerHTML = `
    <div class="summary-strip">
      ${summaryCardHtml('Total Leads Managed', fmt.int(leads.length), 'linear-gradient(135deg,#3b82f6,#60a5fa)', `Active cases: ${activeCount}`, 'total-leads-managed')}
      ${summaryCardHtml('Converted Leads', fmt.int(Calc.converted(leads)), 'linear-gradient(135deg,#22c55e,#4ade80)', 'Leads successfully converted', 'converted-leads')}
      ${summaryCardHtml('Conversion Rate', fmt.pct(Calc.conversionRate(leads)), 'linear-gradient(135deg,#a855f7,#c084fc)', 'Overall lead conversion efficiency', 'blended-conversion-rate')}
      ${summaryCardHtml('SLA Compliance', fmt.pct(Calc.slaComplianceRate(leads)), 'linear-gradient(135deg,#eab308,#facc15)', 'Contact within 24 hours rate', 'sla-response-compliance')}
    </div>
    <div class="grid-2">
      ${cardHtml('Lead Conversion Funnel', 'Stage distribution company-wide', '<div id="funnel-m" style="padding-top:6px"></div>', false, 'chart-admissions-conversion-funnel')}
      ${cardHtml('Branch Conversion Performance', 'Assigned vs converted leads by branch', '<div class="chart-wrap h260"><canvas id="chart-m-branch"></canvas></div>', false, 'chart-branch-admissions-performance')}
    </div>
    <div class="grid-2">
      ${cardHtml('Conversion Trends', '6-month historic conversion rate performance', '<div class="chart-wrap h240"><canvas id="chart-m-trend"></canvas></div>', false, 'chart-blended-conversion-trends')}
      ${cardHtml('Active Pipeline Stages', 'Active cases breakdown in pipeline stages', '<div class="chart-wrap h240"><canvas id="chart-m-pipeline"></canvas></div>', false, 'chart-active-pipeline-stages')}
    </div>
    <div class="grid-2">
      ${cardHtml('Lead Pipeline Aging', 'Days elapsed since case assignment (open deals only)', '<div class="chart-wrap h240"><canvas id="chart-m-aging"></canvas></div>', false, 'chart-admissions-pipeline-aging')}
      ${cardHtml('SLA Compliance & Response Latency', 'SLA Response compliance rate vs Average response latency', '<div class="chart-wrap h240"><canvas id="chart-m-revenue"></canvas></div>', false, 'chart-sla-compliance-response-latency')}
    </div>
    <div class="grid-2">
      ${cardHtml('MoM Lead Volume Growth', 'Percentage change in assigned leads volume', '<div class="chart-wrap h230"><canvas id="chart-m-growth"></canvas></div>', false, 'chart-mom-lead-volume-growth')}
      ${cardHtml('Daily Counselor activity logs', 'Total calls, WhatsApp, emails logged by counselors — last 14 days', '<div class="chart-wrap h230"><canvas id="chart-m-daily"></canvas></div>', false, 'chart-daily-counselor-activity-logs')}
    </div>
    <div class="grid-2">
      ${cardHtml('Counsellor Leaderboard', 'Top counsellors sorted by conversions', '<div id="table-m-leader"></div>', false, 'chart-counsellor-leaderboard')}
      ${cardHtml('Operational Insights & Anomalies', 'Automated alerts based on filtered metrics', '<div class="insight-list" id="insights-m"></div>', false, 'chart-operational-insights-anomalies')}
    </div>`;

  runCounters(panel);

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

  const openStatuses = CFG.statuses.filter(s => s !== 'Converted' && s !== 'Lost');
  const pipeDist = openStatuses.map(s => leads.filter(l => l.status === s).length);
  drawChart('chart-m-pipeline', {
    type: 'doughnut',
    data: {
      labels: openStatuses,
      datasets: [{
        data: pipeDist,
        backgroundColor: CFG.palette,
        borderWidth: 1,
        borderColor: '#0c0c0e'
      }]
    },
    options: Charts.donutOpts()
  });

  const agingBuckets = [[0, 15], [16, 30], [31, 60], [61, 90], [91, 9999]];
  const agingLabels = ['0-15d', '16-30d', '31-60d', '61-90d', '90d+'];
  const openLeads = leads.filter(l => !l.converted && !l.lost);
  const agingCounts = agingBuckets.map(b => openLeads.filter(l => {
    const d = Calc.daysBetween(l.assignedDate, CFG.today);
    return d >= b[0] && d <= b[1];
  }).length);

  drawChart('chart-m-aging', {
    type: 'bar',
    data: {
      labels: agingLabels,
      datasets: [Charts.barDS('Open cases count', agingCounts, CFG.chartColors.warning)]
    },
    options: Charts.barOpts()
  });

  const slaTrend = [];
  const latencyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i, 1);
    const next = new Date(CFG.today.getFullYear(), CFG.today.getMonth() - i + 1, 1);
    const ml = leads.filter(l => l.assignedDate >= d && l.assignedDate < next);
    slaTrend.push(Calc.slaComplianceRate(ml));
    latencyTrend.push(Calc.avgResponseTime(ml));
  }

  drawChart('chart-m-revenue', {
    type: 'line',
    data: {
      labels: monthly.labels,
      datasets: [
        { label: 'SLA Compliance %', data: slaTrend, borderColor: CFG.chartColors.primary, backgroundColor: 'transparent', tension: 0.35, pointRadius: 2, borderWidth: 2 },
        { label: 'Avg Latency (hrs)', data: latencyTrend, borderColor: CFG.chartColors.warning, backgroundColor: 'transparent', tension: 0.35, pointRadius: 2, borderWidth: 2 }
      ]
    },
    options: Charts.lineOpts()
  });

  const growthVals = [];
  for (let i = 1; i < monthly.assigned.length; i++) {
    growthVals.push(Calc.growth(monthly.assigned[i], monthly.assigned[i-1]));
  }
  drawChart('chart-m-growth', {
    type: 'bar',
    data: {
      labels: monthly.labels.slice(1),
      datasets: [{
        label: 'Growth %',
        data: growthVals,
        backgroundColor: growthVals.map(v => v >= 0 ? CFG.chartColors.success : CFG.chartColors.danger),
        borderRadius: 4
      }]
    },
    options: Charts.barOpts()
  });

  const daily14 = Calc.dailySeries(leads, 14);
  const dailyActivity = daily14.labels.map((_, idx) => {
    const day = addDays(CFG.today, -(13 - idx));
    const key = day.toDateString();
    return leads.reduce((s, l) => s + l.activityLog.filter(a => a.date.toDateString() === key).length, 0);
  });

  drawChart('chart-m-daily', {
    type: 'bar',
    data: {
      labels: daily14.labels,
      datasets: [Charts.barDS('Counselor actions logged', dailyActivity, CFG.chartColors.teal)]
    },
    options: Charts.barOpts()
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
      const staffMember = window.IntelAbroadData.staff.find(s => s.name === rowId);
      if (staffMember) showCounsellorProfile(staffMember.id);
    }
  });

  const insights = buildInsightsList(leads, branchPerf, perf);
  const insightsHtml = insights.map(i => `
    <div class="insight-item">
      <span class="insight-dot" style="background:${CFG.chartColors[i.color] || '#3b82f6'}"></span>
      <div class="insight-text">${i.text}</div>
    </div>
  `).join('');
  document.getElementById('insights-m').innerHTML = insightsHtml;
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

  // Find manager name
  const manager = window.IntelAbroadData.staff.find(s => s.id === staff.reportsTo) || { name: 'Dr. Suhail (Founder)' };

  // 12 KPI card string
  const kpiSectionHtml = 
    kpiCardHtml('k-ind-assigned', 'Total Leads Assigned', cLeads.length, { color: 'primary', icon: iconUsers(), tooltipKey: 'total-assigned' }) +
    kpiCardHtml('k-ind-contacted', 'Leads Contacted', Calc.contacted(cLeads), { color: 'info', icon: iconPhone(), sub: fmt.pct(Calc.contactRate(cLeads)) + ' contacted', tooltipKey: 'contacted' }) +
    kpiCardHtml('k-ind-calls', 'Calls Completed', Calc.callsCompleted(cLeads), { color: 'purple', icon: iconCall(), tooltipKey: 'calls' }) +
    kpiCardHtml('k-ind-whatsapp', 'WhatsApp Chats', cLeads.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0), { color: 'pink', icon: iconMessage(), tooltipKey: 'whatsapp' }) +
    kpiCardHtml('k-ind-fu', 'FUs Completed', Calc.followupsCompleted(cLeads), { color: 'teal', icon: iconCheck(), sub: fmt.pct(Calc.followupCompletionRate(cLeads)) + ' rate', tooltipKey: 'followups-completed' }) +
    kpiCardHtml('k-ind-pending', 'Pending FUs', Calc.pendingFollowups(cLeads), { color: 'warning', icon: iconAlert(), sub: `${overdueList.length} overdue`, tooltipKey: 'pending-followups' }) +
    kpiCardHtml('k-ind-overdue', 'Overdue Follow-ups', overdueList.length, { color: 'danger', icon: iconAlert(), tooltipKey: 'overdue-followups' }) +
    kpiCardHtml('k-ind-latency', 'Avg Response Time', Calc.avgResponseTime(cLeads), { color: 'warning', icon: iconClock(), decimals: 1, sub: fmt.pct(Calc.slaComplianceRate(cLeads)) + ' SLA', tooltipKey: 'avg-response' }) +
    kpiCardHtml('k-ind-aging', 'Avg Lead Aging', Calc.avgLeadAging(cLeads), { color: 'slate', icon: iconHourglass(), decimals: 0, tooltipKey: 'avg-lead-aging' }) +
    kpiCardHtml('k-ind-conv', 'Conversion Rate', Calc.conversionRate(cLeads), { color: 'success', icon: iconTarget(), isPct: true, decimals: 1, tooltipKey: 'conversion-rate' });

  // Chronological activity timeline logs
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
  // Sort descending chronological
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

  // Toggle DOM view container
  document.getElementById('mainDashboard').style.display = 'none';
  const cDashboard = document.getElementById('counsellorDashboard');
  cDashboard.classList.add('active');

  cDashboard.innerHTML = `
    <!-- Back Header -->
    <div class="back-btn-row">
      <button class="back-btn" id="exitProfileBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Tab Dashboard
      </button>
    </div>

    <!-- Profile details -->
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

    <!-- KPI Grid -->
    <div class="kpi-grid">${kpiSectionHtml}</div>

    <!-- Charts row 1 -->
    <div class="grid-2">
      ${cardHtml('Daily Lead Activity', 'Leads assigned vs converted — last 14 days', '<div class="chart-wrap h260"><canvas id="chart-ind-daily"></canvas></div>', false, 'chart-daily-activity')}
      ${cardHtml('Lead status ratio', 'Doughnut chart of all assigned leads in status steps', '<div class="chart-wrap h260"><canvas id="chart-ind-status"></canvas></div>', false, 'chart-funnel-dist')}
    </div>

    <!-- Charts row 2 -->
    <div class="grid-2">
      ${cardHtml('Weekly Lead Progress', 'Assigned vs converted — last 8 weeks', '<div class="chart-wrap h260"><canvas id="chart-ind-weekly"></canvas></div>', false, 'chart-weekly-flow')}
      ${cardHtml('Lead Funnel Progression', 'Funnel analysis of this counselor\'s leads', '<div id="funnel-ind" style="padding-top:6px"></div>', false, 'chart-funnel-progression')}
    </div>

    <!-- Charts row 3 -->
    <div class="grid-2">
      ${cardHtml('WhatsApp vs Calls log trend', 'Weekly logged calls vs WhatsApp messages exchanged', '<div class="chart-wrap h260"><canvas id="chart-ind-contacts"></canvas></div>', false, 'chart-whatsapp-vs-calls-log-trend')}
    </div>

    <!-- Activity timeline and leads list -->
    <div class="grid-2">
      ${cardHtml('Chronological Activity Log', 'Recent calls, WhatsApp messages, and status updates logged', `<div class="timeline-container">${timelineHtml}</div>`, false, 'chart-chronological-activity-log')}
      ${cardHtml('Assigned Lead Records', 'Filter, search and select student details assigned to this counselor', '<div id="table-ind-leads"></div>', false, 'chart-assigned-lead-records')}
    </div>`;

  runCounters(cDashboard);

  // Wire back button
  document.getElementById('exitProfileBtn').addEventListener('click', () => {
    State.counsellorViewId = null;
    cDashboard.classList.remove('active');
    document.getElementById('mainDashboard').style.display = 'flex';
    runPipeline(false);
  });

  // Daily Chart
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

  // Status doughnut
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

  // Weekly bar
  const weekly = Calc.weeklySeries(cLeads, 8);
  drawChart('chart-ind-weekly', {
    type: 'bar',
    data: {
      labels: weekly.labels,
      datasets: [
        Charts.barDS('Assigned', weekly.assigned, CFG.chartColors.primary),
        Charts.barDS('Converted', weekly.converted, CFG.chartColors.success)
      ]
    },
    options: Charts.barOpts()
  });

  drawFunnel('funnel-ind', Calc.funnelStages(cLeads));

  // WhatsApp vs Calls logs trend (Weekly, 8 weeks)
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

  // Leads list
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
  
  // Reset tabs labels
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

  // Force click first active tab if current tab is hidden
  const currentTabButton = document.querySelector(`.tab[data-tab="${State.activeTab}"]`);
  if (!currentTabButton || currentTabButton.style.display === 'none') {
    // Select first visible tab
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

  // Clear options except "Any Assignee"
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

// Branch Dropdown configurations
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
    // Lock to manager's branch
    pill.style.pointerEvents = 'none';
    pill.querySelector('svg').style.display = 'none';
    pill.querySelector('.branch-name-text').textContent = user.branch;
    State.filters.branch = user.branch;
  }
}

// "View Counsellor" dropdown selector (top bar)
function renderCounsellorSelectorPill() {
  const user = State.currentUser;
  const pill = document.getElementById('counsellorPill');
  const menu = document.getElementById('counsellorMenu');
  if (!pill || !menu) return;

  if (user.role === 'Counsellor') {
    // Counsellor cannot view other profiles
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

// Pipeline processor
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

// Wire Event listeners
function wireEvents() {
  // Pill selections
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

  // Role Switcher logic
  const roleSwitcher = document.getElementById('demoRoleSwitcher');
  if (roleSwitcher) {
    roleSwitcher.addEventListener('change', () => {
      const val = roleSwitcher.value;
      
      // Clear counsellor view when switching roles
      State.counsellorViewId = null;
      document.getElementById('counsellorDashboard').classList.remove('active');
      document.getElementById('mainDashboard').style.display = 'flex';

      // Update simulated currentUser details
      if (val === 'Founder') {
        State.currentUser = { role: 'Founder', name: 'Dr. Suhail', id: 'S001', branch: 'all' };
      } else if (val === 'BranchManager') {
        State.currentUser = { role: 'BranchManager', name: 'Vanshta Verma', id: 'S002', branch: 'Delhi Office' };
      } else if (val === 'TeamLead') {
        State.currentUser = { role: 'TeamLead', name: 'Hemant Vaidya', id: 'S006', branch: 'Delhi Office' };
      } else if (val === 'Counsellor') {
        State.currentUser = { role: 'Counsellor', name: 'Aditya Gangwani', id: 'S016', branch: 'Raipur Office' };
      }

      // Update sidebar footer profile card
      document.getElementById('sidebarProfileName').textContent = State.currentUser.name;
      document.getElementById('sidebarProfileEmail').textContent = 
        State.currentUser.role === 'Founder' ? 'founder@intelabroad.com' :
        State.currentUser.role === 'BranchManager' ? 'delhi.manager@intelabroad.com' :
        State.currentUser.role === 'TeamLead' ? 'delhi.lead@intelabroad.com' : 'aditya@intelabroad.com';

      // Reset state filters to avoid invalid scoping
      State.filters.branch = State.currentUser.branch;
      State.filters.counsellor = 'all';

      // Redecorate widgets
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

  document.getElementById('refreshBtn')?.addEventListener('click', () => {
    const icon = document.querySelector('#refreshBtn svg');
    if (icon) icon.style.animation = 'spin .6s linear';
    setTimeout(() => { if (icon) icon.style.animation = ''; }, 650);
    runPipeline(true);
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

  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = State.theme;
    
    const textNode = document.getElementById('themeToggleText');
    if (textNode) {
      textNode.textContent = State.theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
    runPipeline(false);
  });

  // Tap/Click toggles for mobile tooltips
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
function iconCall() { return iconPhone(); }
function iconCheck() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconTarget() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'; }
function iconClock() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'; }
function iconAlert() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>'; }
function iconHourglass() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 2h14M5 22h14M18 2v4.5a5 5 0 01-2 4L12 13l-4-2.5a5 5 0 01-2-4V2M6 22v-4.5a5 5 0 012-4l4-2.5 4 2.5a5 5 0 012 4V22"/></svg>'; }
function iconLayers() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>'; }
function iconMessage() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'; }

// Initialization
function initUI() {
  populateFilterOptions();
  readFiltersFromForm();
  
  const spinStyle = document.createElement('style');
  spinStyle.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
  document.head.appendChild(spinStyle);
  
  wireEvents();
  
  // Set default initial view layout states
  toggleTabVisibility();
  updateBranchDropdownOptions();
  updateAssigneeDropdownOptions();
  renderCounsellorSelectorPill();
  
  runPipeline(true);
}

document.addEventListener('DOMContentLoaded', initUI);
