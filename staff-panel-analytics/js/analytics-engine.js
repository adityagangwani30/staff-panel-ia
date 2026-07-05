const Calc = {
  _isEnrolled(l) { return l.status === 'Enrolled'; },
  _isLost(l) { return l.status === 'Lost/Dead'; },
  _isActive(l) { return !this._isEnrolled(l) && !this._isLost(l); },

  totalAssigned(leads) { return leads.length; },

  enrolled(leads) { return leads.filter(l => this._isEnrolled(l)).length; },

  activeLeads(leads) { return leads.filter(l => this._isActive(l)).length; },

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

  hotLeads(leads) {
    return leads.filter(l => l.status === 'Hot Lead' && this._isActive(l)).length;
  },

  callbackRequests(leads) {
    return leads.filter(l => (l.status === 'Call Back' || l.lastCallStatus === 'Call Back Later') && this._isActive(l)).length;
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

  pipelineStages(leads) {
    const active = leads.filter(l => !this._isLost(l));
    const order = CFG.statusOrder;

    const stageDefs = [
      { stage: 'Total Leads', minOrder: 0 },
      { stage: 'Interested', minOrder: order['Interested'] },
      { stage: 'Consultation Booked', minOrder: order['Consultation Booked'] },
      { stage: 'Consultation Done', minOrder: order['Consultation Done'] },
      { stage: 'Documents Submitted', minOrder: order['Documents Submitted'] },
      { stage: 'Applied', minOrder: order['Applied'] },
      { stage: 'Enrolled', minOrder: order['Enrolled'] }
    ];

    const stages = [];
    for (let i = 0; i < stageDefs.length; i++) {
      const sd = stageDefs[i];
      const count = active.filter(l => (order[l.status] || 0) >= sd.minOrder).length;
      const prevCount = i > 0 ? stages[i - 1].count : active.length;
      const stageConv = prevCount > 0 ? (count / prevCount) * 100 : 0;
      const dropOff = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
      stages.push({ stage: sd.stage, count, stageConversion: stageConv, dropOff: dropOff });
    }
    return stages;
  },

  sourcePerformance(leads, sources) {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const enrolled = this.enrolled(sl);
      return { source: s, assigned: sl.length, enrolled, enrollmentRate: sl.length ? (enrolled / sl.length) * 100 : 0 };
    });
  },

  counsellorPerformance(leads, counsellors) {
    return counsellors.map(c => {
      const cl = leads.filter(l => l.counsellorId === c.id);
      return { id: c.id, name: c.name, centre: c.sourceCentre, role: c.role, assigned: cl.length, active: this.activeLeads(cl), enrolled: this.enrolled(cl), enrollmentRate: cl.length ? (this.enrolled(cl) / cl.length) * 100 : 0, followupsDue: this.pendingFollowups(cl) };
    }).filter(r => r.assigned > 0);
  },

  consultationBooked(leads) {
    return leads.filter(l => l.status === 'Consultation Booked' && this._isActive(l)).length;
  },

  applicationsSubmitted(leads) {
    return leads.filter(l => l.status === 'Applied' && this._isActive(l)).length;
  },

  unassignedLeads(leads) {
    return leads.filter(l => !l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorId === 'CS-UNASSIGNED').length;
  },

  lostLeads(leads) {
    return leads.filter(l => this._isLost(l)).length;
  },

  consultationsScheduled(leads) {
    return leads.filter(l => l.status === 'Consultation Booked' && this._isActive(l)).length;
  },

  averageFollowupDelay(leads, today) {
    const target = today || CFG.today;
    const overdueLeads = leads.filter(l => l.followUpDate && l.followUpDate < target && this._isActive(l));
    if (!overdueLeads.length) return 0;
    const sum = overdueLeads.reduce((total, l) => {
      const diffMs = target.getTime() - l.followUpDate.getTime();
      return total + (diffMs / (1000 * 60 * 60 * 24));
    }, 0);
    return sum / overdueLeads.length;
  }
};

window.Calc = Calc;
