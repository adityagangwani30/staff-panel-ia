const LeadsUI = {
  state: {
    leads: [],
    filtered: [],
    searchQuery: '',
    statusFilter: 'all',
    outcomeFilter: 'all',
    editingLeadId: null,
    activityLog: [],
    currentUser: { name: 'Dr. Suhail', role: 'Founder' }
  },

  init() {
    this.loadData();
    this.wireEvents();
    this.render();
    this.updateBadge();
    this.loadActivityLog();
    this.loadCurrentUser();
  },

  loadData() {
    const saved = this.restorePersistedState();
    if (saved) {
      window.IntelAbroadData.leads = saved;
      this.state.leads = saved;
      this.applyFilters();
      return;
    }
    const data = window.IntelAbroadData;
    this.state.leads = data.leads || [];
    this.applyFilters();
  },

  getVisibleLeads() {
    const s = this.state;
    return s.leads.filter(l => {
      if (s.searchQuery) {
        const q = s.searchQuery.toLowerCase();
        const name = (l.studentName || '').toLowerCase();
        const phone = (l.phone || '').toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      if (s.statusFilter !== 'all' && l.status !== s.statusFilter) return false;
      if (s.outcomeFilter === 'none' && l.lastCallStatus) return false;
      if (s.outcomeFilter !== 'all' && s.outcomeFilter !== 'none' && l.lastCallStatus !== s.outcomeFilter) return false;
      return true;
    });
  },

  applyFilters() {
    this.state.filtered = this.getVisibleLeads();
  },

  render() {
    const tbody = document.getElementById('leadsBody');
    const noLeads = document.getElementById('noLeads');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    const leads = this.state.filtered;

    totalCount.textContent = this.state.leads.length;
    visibleCount.textContent = leads.length;

    if (!leads.length) {
      tbody.innerHTML = '';
      noLeads.style.display = 'block';
      return;
    }
    noLeads.style.display = 'none';

    tbody.innerHTML = leads.map(l => {
      const lastAct = l.updatedDate ? this.fmtDateTime(l.updatedDate) : '—';
      const outcomeHtml = l.lastCallStatus ? `<span class="outcome-badge ${this.outcomeClass(l.lastCallStatus)}">${this.escapeHtml(l.lastCallStatus)}</span>` : '<span style="color:var(--text-muted);font-size:11px">Pending</span>';
      const assignee = l.counsellorName && l.counsellorName !== 'Unassigned' ? this.escapeHtml(l.counsellorName) : '<span class="unassigned">Unassigned</span>';
      const isClosed = l.status === 'Enrolled' || l.status === 'Lost/Dead';
      return `<tr>
        <td class="name-cell">${this.escapeHtml(l.studentName || '—')}</td>
        <td class="phone-cell">${this.escapeHtml(l.phone || '—')}</td>
        <td>${this.escapeHtml(l.source || '—')}</td>
        <td>${this.statusBadge(l.status)}</td>
        <td>${assignee}</td>
        <td>${outcomeHtml}</td>
        <td>${l.calls != null ? l.calls : 0}</td>
        <td style="font-size:11px;color:var(--text-muted)">${lastAct}</td>
        <td class="actions-cell">${isClosed ? '<span style="color:var(--text-muted);font-size:11px">Closed</span>' : '<button class="call-btn" data-lead-id="' + l.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>Complete Call</button>'}</td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.call-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openCallModal(btn.dataset.leadId));
    });
  },

  openCallModal(leadId) {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;
    this.state.editingLeadId = leadId;
    document.getElementById('callModalLead').innerHTML = 'Recording call outcome for <strong>' + this.escapeHtml(lead.studentName) + '</strong>';
    document.getElementById('callOutcomeSelect').value = '';
    document.getElementById('saveCallBtn').disabled = true;
    document.getElementById('callModal').classList.add('active');
  },

  closeCallModal() {
    document.getElementById('callModal').classList.remove('active');
    this.state.editingLeadId = null;
  },

  saveCall() {
    const leadId = this.state.editingLeadId;
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const outcome = document.getElementById('callOutcomeSelect').value;
    if (!outcome) return;

    const now = new Date();

    lead.lastCallStatus = outcome;
    lead.calls = (lead.calls || 0) + 1;
    lead.updatedDate = now;

    if (DataLoader.rawHeaders && !DataLoader.rawHeaders.some(h => h.toLowerCase() === 'last call status')) {
      DataLoader.rawHeaders.push('Last Call Status');
    }

    this.addActivity(lead, 'call', 'Call completed — ' + outcome, { outcome });
    window.IntelAbroadData.leads = this.state.leads;
    this.persistState();
    this.closeCallModal();
    this.render();
  },

  addActivity(lead, type, action, details) {
    const now = new Date();
    const user = this.getCurrentUser();
    const entry = {
      time: now,
      leadId: lead.id,
      leadName: lead.studentName,
      type: type,
      action: action,
      user: { name: user.name, role: user.role },
      details: details || null
    };
    this.state.activityLog.unshift(entry);
    this.renderActivityLog();
    this.persistActivityLog();
  },

  renderActivityLog() {
    const container = document.getElementById('activityItems');
    const log = this.state.activityLog;
    if (!log.length) {
      container.innerHTML = '<div class="activity-item"><span class="activity-desc" style="color:var(--text-muted)">No recent activity.</span></div>';
      return;
    }
    container.innerHTML = log.slice(0, 30).map(e => {
      const type = e.type || 'call';
      const userStr = e.user ? e.user.name : 'System';
      return '<div class="activity-item">' +
        '<span class="activity-time">' + this.fmtTime(e.time) + '</span>' +
        '<span class="activity-icon ' + this.escapeHtml(type) + '"></span>' +
        '<span class="activity-desc"><strong>' + this.escapeHtml(e.leadName) + '</strong> — ' + this.escapeHtml(e.action) + ' <span class="activity-user">by ' + this.escapeHtml(userStr) + '</span></span>' +
        '</div>';
    }).join('');
  },

  persistActivityLog() {
    try {
      localStorage.setItem('intelabroad_activity_log', JSON.stringify(this.state.activityLog));
    } catch (e) {}
  },

  persistState() {
    try {
      localStorage.setItem('intelabroad_leads', JSON.stringify(this.state.leads));
    } catch (e) {}
  },

  restorePersistedState() {
    try {
      const raw = localStorage.getItem('intelabroad_leads');
      if (raw) {
        const leads = JSON.parse(raw);
        leads.forEach(l => {
          if (l.entryDate) l.entryDate = new Date(l.entryDate);
          if (l.updatedDate) l.updatedDate = new Date(l.updatedDate);
          if (l.followUpDate) l.followUpDate = new Date(l.followUpDate);
        });
        return leads;
      }
    } catch (e) {}
    return null;
  },

  loadActivityLog() {
    try {
      const raw = localStorage.getItem('intelabroad_activity_log');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state.activityLog = parsed.map(e => ({
          ...e,
          time: new Date(e.time),
          type: e.type || 'call',
          user: e.user || { name: 'System', role: 'Unknown' },
          details: e.details || null
        }));
        this.renderActivityLog();
      }
    } catch (e) {}
  },

  exportCsv() {
    const leads = this.state.filtered;
    if (!leads.length) { alert('No leads to export.'); return; }
    const rows = leads.map(l => ({
      LeadID: l.id,
      StudentName: l.studentName,
      Phone: l.phone,
      Source: l.source,
      Status: l.status,
      AssignedTo: l.counsellorName || '',
      LastCallStatus: l.lastCallStatus || '',
      Calls: l.calls || 0,
      EntryDate: l.entryDate ? this.fmtDateTimeFull(l.entryDate) : '',
      FollowUpDate: l.followUpDate ? this.fmtDateTimeFull(l.followUpDate) : '',
      Notes: l.notes || ''
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads_export_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  },

  outcomeClass(val) {
    const map = {
      'Interested': 'interested',
      'Not Interested': 'not-interested',
      'Busy': 'busy',
      "Didn't Answer": 'didnt-answer',
      'Call Back Later': 'call-back',
      'Wrong Number': 'wrong-number'
    };
    return map[val] || '';
  },

  statusBadge(status) {
    const cls = CFG.statusClass[status] || 'st-default';
    return '<span class="badge ' + cls + '">' + this.escapeHtml(status) + '</span>';
  },

  updateBadge() {
    const badge = document.getElementById('dataSourceBadge');
    if (!badge) return;
    if (DataLoader.source === 'excel') {
      badge.textContent = 'Real Data' + (DataLoader.fileName ? ' — ' + DataLoader.fileName : '');
      badge.className = 'data-source-badge real';
    } else {
      badge.textContent = 'Demo Data';
      badge.className = 'data-source-badge';
    }
  },

  wireEvents() {
    const searchInput = document.getElementById('leadsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.state.searchQuery = searchInput.value;
        this.applyFilters();
        this.render();
      });
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      const uniqueStatuses = [...new Set(this.state.leads.map(l => l.status).filter(Boolean))].sort();
      statusFilter.innerHTML = '<option value="all">All Statuses</option>' + uniqueStatuses.map(s => '<option value="' + s + '">' + s + '</option>').join('');
      statusFilter.addEventListener('change', () => {
        this.state.statusFilter = statusFilter.value;
        this.applyFilters();
        this.render();
      });
    }

    const outcomeFilter = document.getElementById('outcomeFilter');
    if (outcomeFilter) {
      outcomeFilter.addEventListener('change', () => {
        this.state.outcomeFilter = outcomeFilter.value;
        this.applyFilters();
        this.render();
      });
    }

    document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (outcomeFilter) outcomeFilter.value = 'all';
      this.state.searchQuery = '';
      this.state.statusFilter = 'all';
      this.state.outcomeFilter = 'all';
      this.applyFilters();
      this.render();
    });

    document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportCsv());

    // Call modal events
    const callOutcomeSelect = document.getElementById('callOutcomeSelect');
    if (callOutcomeSelect) {
      callOutcomeSelect.addEventListener('change', () => {
        const val = callOutcomeSelect.value;
        const saveBtn = document.getElementById('saveCallBtn');
        saveBtn.disabled = !val;
      });
    }

    document.getElementById('saveCallBtn')?.addEventListener('click', () => this.saveCall());
    document.getElementById('cancelCallBtn')?.addEventListener('click', () => this.closeCallModal());
    document.getElementById('callModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeCallModal();
    });

    // Reload demo
    document.getElementById('reloadDemoBtn')?.addEventListener('click', () => {
      try { localStorage.removeItem('intelabroad_leads'); } catch (e) {}
      DataLoader.resetToDemo();
      this.state.leads = window.IntelAbroadData.leads;
      this.applyFilters();
      this.render();
      this.updateBadge();
    });

    // Role switcher
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
          user = candidate ? { role: val, name: candidate.name, id: candidate.id, sourceCentre: candidate.sourceCentre || 'all' } : { role: val, name: val, id: 'X-' + val, sourceCentre: 'all' };
        }
        document.getElementById('sidebarProfileName').textContent = user.name;
        document.getElementById('sidebarProfileEmail').textContent = user.role === 'Founder' ? 'founder@intelabroad.com' : user.name.toLowerCase().replace(/\s+/g, '.') + '@intelabroad.com';
        this.state.currentUser = { name: user.name, role: user.role };
      });
    }

    // Sidebar collapse
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.toggle('open'); });
      document.addEventListener('click', () => { sidebar.classList.remove('open'); });
    }

    // Source centre pill
    const sourcePill = document.getElementById('sourcePill');
    const sourceMenu = document.getElementById('sourceMenu');
    if (sourcePill && sourceMenu) {
      const centres = window.IntelAbroadData.sourceCentres || [];
      sourceMenu.innerHTML = '<button class="dropdown-item" data-val="all">All Centres</button>' +
        centres.map(c => '<button class="dropdown-item" data-val="' + this.escapeHtml(c) + '">' + this.escapeHtml(c) + '</button>').join('');
      sourcePill.addEventListener('click', e => { e.stopPropagation(); sourceMenu.classList.toggle('show'); });
      sourceMenu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          document.querySelector('.branch-name-text').textContent = item.dataset.val === 'all' ? 'All Centres' : item.dataset.val;
          sourceMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });
      document.addEventListener('click', () => { sourceMenu?.classList.remove('show'); });
    }

    // Update last updated
    const updateTime = () => { const el = document.getElementById('lastUpdated'); if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); };
    updateTime();
    setInterval(updateTime, 60000);
  },

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  fmtDateTime(d) {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    if (diff < 1) return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diff < 2) return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },

  fmtDateTimeFull(d) {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 19).replace('T', ' ');
  },

  fmtTime(d) {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },

  loadCurrentUser() {
    const switcher = document.getElementById('demoRoleSwitcher');
    if (switcher) {
      const nameEl = document.getElementById('sidebarProfileName');
      this.state.currentUser = {
        name: nameEl ? nameEl.textContent : switcher.value,
        role: switcher.value
      };
    }
  },

  getCurrentUser() {
    return this.state.currentUser || { name: 'System', role: 'Unknown' };
  }
};

document.addEventListener('DOMContentLoaded', () => LeadsUI.init());
