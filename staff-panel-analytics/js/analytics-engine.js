const Calc = {
  _isEnrolled(l) { return l.status === 'Enrolled'; },
  _isLost(l) { return l.status === 'Lost/Dead'; },
  _isActive(l) { return !this._isEnrolled(l) && !this._isLost(l); },

  totalAssigned(leads) {
    return leads.length;
  },

  enrolled(leads) {
    return leads.filter(l => this._isEnrolled(l)).length;
  },

  lost(leads) {
    return leads.filter(l => this._isLost(l)).length;
  },

  activeLeads(leads) {
    return leads.filter(l => this._isActive(l)).length;
  },

  enrollmentRate(leads) {
    const t = this.totalAssigned(leads);
    return t ? (this.enrolled(leads) / t) * 100 : 0;
  },

  newLeads(leads, today) {
    const target = today || CFG.today;
    const key = target.toDateString();
    return leads.filter(l => l.entryDate && l.entryDate.toDateString() === key).length;
  },

  newLeadsPeriod(leads, days, today) {
    const target = today || CFG.today;
    const cutoff = addDays(target, -days);
    return leads.filter(l => l.entryDate && l.entryDate >= cutoff).length;
  },

  pendingFollowups(leads, today) {
    const target = today || CFG.today;
    return leads.filter(l => l.followUpDate && l.followUpDate >= target && this._isActive(l)).length;
  },

  overdueFollowups(leads, today) {
    const target = today || CFG.today;
    return leads.filter(l => l.followUpDate && l.followUpDate < target && this._isActive(l)).length;
  },

  followupsDueToday(leads, today) {
    const target = today || CFG.today;
    const key = target.toDateString();
    return leads.filter(l => l.followUpDate && l.followUpDate.toDateString() === key).length;
  },

  followupsDueTomorrow(leads, today) {
    const target = today || CFG.today;
    const tomorrow = addDays(target, 1);
    const key = tomorrow.toDateString();
    return leads.filter(l => l.followUpDate && l.followUpDate.toDateString() === key).length;
  },

  averageCalls(leads) {
    if (!leads.length) return 0;
    return leads.reduce((sum, l) => sum + (l.calls || 0), 0) / leads.length;
  },

  groupBy(leads, keyFn) {
    const map = new Map();
    leads.forEach(l => {
      const k = keyFn(l);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(l);
    });
    return map;
  },

  statusDistribution(leads) {
    const map = this.groupBy(leads, l => l.status);
    return CFG.statuses.map(s => ({ status: s, count: (map.get(s) || []).length }));
  },

  funnelStages(leads) {
    const active = leads.filter(l => !this._isLost(l));
    const order = CFG.statusOrder;
    const funnelOrder = ['DNP 1', 'DNP 5', 'NATC', 'Cold Lead', 'Warm Lead', 'Hot Lead', 'Call Back', 'Interested', 'Consultation Booked', 'Consultation Done', 'Consultation Submitted', 'Documents Submitted', 'Applied', 'Enrolled'];

    function progressedAtLeast(s, minStage) {
      if (s === 'Enrolled') return true;
      if (s === 'Lost/Dead') return false;
      return (order[s] || 0) >= (order[minStage] || 0);
    }

    const stages = funnelOrder.map((stage, i) => {
      const prev = i === 0 ? active.length : stages[i - 1].count;
      const count = Math.min(prev, active.filter(l => progressedAtLeast(l.status, stage)).length);
      return { stage, count };
    });

    return stages;
  },

  stateDistribution(leads) {
    return this._dimensionDistribution(leads, 'state');
  },

  cityDistribution(leads) {
    return this._dimensionDistribution(leads, 'city');
  },

  _dimensionDistribution(leads, field) {
    const map = this.groupBy(leads, l => l[field]);
    const rows = [];
    map.forEach((group, key) => {
      rows.push({
        dimension: key,
        count: group.length
      });
    });
    rows.sort((a, b) => b.count - a.count);
    return rows;
  },

  topValues(distribution, n) {
    return distribution.slice(0, n || 5);
  },

  sourceCentrePerformance(leads, centres) {
    return centres.map(c => {
      const cl = leads.filter(l => l.sourceCentre === c);
      return {
        centre: c,
        assigned: cl.length,
        active: this.activeLeads(cl),
        enrolled: this.enrolled(cl),
        enrollmentRate: cl.length ? (this.enrolled(cl) / cl.length) * 100 : 0
      };
    });
  },

  sourcePerformance(leads, sources) {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const enrolled = this.enrolled(sl);
      return {
        source: s,
        assigned: sl.length,
        enrolled: enrolled,
        enrollmentRate: sl.length ? (enrolled / sl.length) * 100 : 0
      };
    });
  },

  counsellorPerformance(leads, counsellors) {
    return counsellors.map(c => {
      const cl = leads.filter(l => l.counsellorId === c.id);
      return {
        id: c.id,
        name: c.name,
        centre: c.sourceCentre,
        role: c.role,
        assigned: cl.length,
        active: this.activeLeads(cl),
        enrolled: this.enrolled(cl),
        enrollmentRate: cl.length ? (this.enrolled(cl) / cl.length) * 100 : 0,
        avgCalls: this.averageCalls(cl)
      };
    }).filter(r => r.assigned > 0);
  },

  followupTimeline(leads, days, today) {
    const t = today || CFG.today;
    const d = days || 7;
    const labels = [];
    const counts = [];
    for (let i = 0; i < d; i++) {
      const day = addDays(t, i);
      const key = day.toDateString();
      labels.push(day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      counts.push(leads.filter(l => l.followUpDate && l.followUpDate.toDateString() === key).length);
    }
    return { labels, counts };
  },

  callsDistribution(leads) {
    const buckets = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '10+': 0 };
    leads.forEach(l => {
      const ca = l.calls || 0;
      if (ca === 0) buckets['0']++;
      else if (ca <= 2) buckets['1-2']++;
      else if (ca <= 5) buckets['3-5']++;
      else if (ca <= 10) buckets['6-10']++;
      else buckets['10+']++;
    });
    return Object.entries(buckets).map(([label, count]) => ({ label, count }));
  },

  hasColumn(name) {
    if (!DataLoader.rawHeaders || !DataLoader.rawHeaders.length) return false;
    return DataLoader.rawHeaders.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
  }
};

window.Calc = Calc;
