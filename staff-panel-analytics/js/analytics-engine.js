const Calc = {
  totalAssigned(leads) {
    return leads.length;
  },

  converted(leads) {
    return leads.filter(l => l.converted).length;
  },

  lost(leads) {
    return leads.filter(l => l.lost).length;
  },

  activeLeads(leads) {
    return leads.filter(l => !l.converted && !l.lost).length;
  },

  conversionRate(leads) {
    const t = this.totalAssigned(leads);
    return t ? (this.converted(leads) / t) * 100 : 0;
  },

  newLeads(leads, today) {
    const target = today || CFG.today;
    const key = target.toDateString();
    return leads.filter(l => l.assignedDate.toDateString() === key).length;
  },

  newLeadsPeriod(leads, days, today) {
    const target = today || CFG.today;
    const cutoff = addDays(target, -days);
    return leads.filter(l => l.assignedDate >= cutoff).length;
  },

  applicationsFiled(leads) {
    return leads.filter(l => l.applicationFiled === 'Yes').length;
  },

  applicationsPending(leads) {
    return leads.filter(l => !l.lost && l.applicationFiled !== 'Yes').length;
  },

  applicationConversionRate(leads) {
    const t = this.totalAssigned(leads);
    return t ? (this.applicationsFiled(leads) / t) * 100 : 0;
  },

  pendingFollowups(leads, today) {
    const target = today || CFG.today;
    return leads.filter(l => l.nextFollowUp && l.nextFollowUp >= target && !l.converted && !l.lost).length;
  },

  overdueFollowups(leads, today) {
    const target = today || CFG.today;
    return leads.filter(l => l.nextFollowUp && l.nextFollowUp < target && !l.converted && !l.lost).length;
  },

  followupsDueToday(leads, today) {
    const target = today || CFG.today;
    const key = target.toDateString();
    return leads.filter(l => l.nextFollowUp && l.nextFollowUp.toDateString() === key).length;
  },

  followupsDueTomorrow(leads, today) {
    const target = today || CFG.today;
    const tomorrow = addDays(target, 1);
    const key = tomorrow.toDateString();
    return leads.filter(l => l.nextFollowUp && l.nextFollowUp.toDateString() === key).length;
  },

  averageCallAttempts(leads) {
    if (!leads.length) return 0;
    return leads.reduce((sum, l) => sum + (l.callAttempts || 0), 0) / leads.length;
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
    const active = leads.filter(l => !l.lost);
    const order = { 'New': 0, 'Contacted': 1, 'Follow-up': 2, 'Interested': 3, 'Qualified': 4, 'Converted': 5 };

    function progress(s) { return order[s] !== undefined ? order[s] : 0; }
    const stageNew = active.length;
    const stageContacted = Math.min(stageNew, active.filter(l => l.status !== 'New').length);
    const stageInterested = Math.min(stageContacted, active.filter(l => progress(l.status) >= 2).length);
    const stageApps = Math.min(stageInterested, active.filter(l => l.applicationFiled === 'Yes').length);
    const stageConverted = Math.min(stageApps, active.filter(l => l.converted).length);

    return [
      { stage: 'New', count: stageNew },
      { stage: 'Contacted', count: stageContacted },
      { stage: 'Interested', count: stageInterested },
      { stage: 'Application Filed', count: stageApps },
      { stage: 'Converted', count: stageConverted }
    ];
  },

  monthlyApplicationTrend(leads, months, today) {
    const t = today || CFG.today;
    const m = months || 6;
    const labels = [];
    const filed = [];
    const pending = [];
    for (let i = m - 1; i >= 0; i--) {
      const d = new Date(t.getFullYear(), t.getMonth() - i, 1);
      const next = new Date(t.getFullYear(), t.getMonth() - i + 1, 1);
      const monthLeads = leads.filter(l => l.assignedDate >= d && l.assignedDate < next);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      filed.push(monthLeads.filter(l => l.applicationFiled === 'Yes').length);
      pending.push(monthLeads.filter(l => l.applicationFiled !== 'Yes' && !l.lost).length);
    }
    return { labels, filed, pending };
  },

  stateDistribution(leads) {
    return this._dimensionDistribution(leads, 'state');
  },

  cityDistribution(leads) {
    return this._dimensionDistribution(leads, 'city');
  },

  examCityDistribution(leads) {
    return this._dimensionDistribution(leads, 'examCity');
  },

  categoryDistribution(leads) {
    const map = this.groupBy(leads, l => l.category);
    return CFG.categories.map(c => ({ dimension: c, count: (map.get(c) || []).length }));
  },

  _dimensionDistribution(leads, field) {
    const map = this.groupBy(leads, l => l[field]);
    const rows = [];
    map.forEach((group, key) => {
      rows.push({
        dimension: key,
        count: group.length,
        applications: group.filter(l => l.applicationFiled === 'Yes').length
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
        applications: this.applicationsFiled(cl),
        converted: this.converted(cl),
        conversionRate: cl.length ? (this.converted(cl) / cl.length) * 100 : 0
      };
    });
  },

  sourcePerformance(leads, sources) {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const apps = this.applicationsFiled(sl);
      const conv = this.converted(sl);
      return {
        source: s,
        assigned: sl.length,
        applications: apps,
        converted: conv,
        conversionRate: sl.length ? (conv / sl.length) * 100 : 0,
        applicationRate: sl.length ? (apps / sl.length) * 100 : 0
      };
    });
  },

  counsellorPerformance(leads, counsellors) {
    return counsellors.map(c => {
      const cl = leads.filter(l => l.counsellorId === c.id);
      const apps = this.applicationsFiled(cl);
      return {
        id: c.id,
        name: c.name,
        centre: c.sourceCentre,
        role: c.role,
        assigned: cl.length,
        active: this.activeLeads(cl),
        applications: apps,
        converted: this.converted(cl),
        conversionRate: cl.length ? (this.converted(cl) / cl.length) * 100 : 0,
        avgCallAttempts: this.averageCallAttempts(cl)
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
      counts.push(leads.filter(l => l.nextFollowUp && l.nextFollowUp.toDateString() === key).length);
    }
    return { labels, counts };
  },

  callAttemptsDistribution(leads) {
    const buckets = { '0': 0, '1-2': 0, '3-5': 0, '6-10': 0, '10+': 0 };
    leads.forEach(l => {
      const ca = l.callAttempts || 0;
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
