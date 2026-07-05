const Calc = {
  _isEnrolled(l) { return l.status === 'Enrolled'; },
  _isLost(l) { return l.status === 'Lost/Dead'; },
  _isActive(l) { return !this._isEnrolled(l) && !this._isLost(l); },

  totalAssigned(leads) { return leads.length; },

  enrolled(leads) { return leads.filter(l => this._isEnrolled(l)).length; },

  lost(leads) { return leads.filter(l => this._isLost(l)).length; },

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

  averageCalls(leads) {
    if (!leads.length) return 0;
    return leads.reduce((sum, l) => sum + (l.calls || 0), 0) / leads.length;
  },

  applicationsSubmitted(leads) {
    const statusOrder = CFG.statusOrder;
    return leads.filter(l => (statusOrder[l.status] || 0) >= (statusOrder['Documents Submitted'] || 0)).length;
  },

  consultationBooked(leads) {
    return leads.filter(l => l.status === 'Consultation Booked' || l.status === 'Consultation Done' || l.status === 'Consultation Submitted' || l.status === 'Documents Submitted' || l.status === 'Applied' || l.status === 'Enrolled').length;
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

  stateDistribution(leads) { return this._dimensionDistribution(leads, 'state'); },

  cityDistribution(leads) { return this._dimensionDistribution(leads, 'city'); },

  _dimensionDistribution(leads, field) {
    const map = this.groupBy(leads, l => l[field]);
    const rows = [];
    map.forEach((group, key) => { rows.push({ dimension: key, count: group.length }); });
    rows.sort((a, b) => b.count - a.count);
    return rows;
  },

  topValues(distribution, n) { return distribution.slice(0, n || 5); },

  sourceCentrePerformance(leads, centres) {
    return centres.map(c => {
      const cl = leads.filter(l => l.sourceCentre === c);
      return { centre: c, assigned: cl.length, active: this.activeLeads(cl), enrolled: this.enrolled(cl), enrollmentRate: cl.length ? (this.enrolled(cl) / cl.length) * 100 : 0 };
    });
  },

  recentLeads(leads, count) {
    return [...leads].filter(l => l.entryDate).sort((a, b) => b.entryDate - a.entryDate).slice(0, count || 10);
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
      return { id: c.id, name: c.name, centre: c.sourceCentre, role: c.role, assigned: cl.length, active: this.activeLeads(cl), enrolled: this.enrolled(cl), enrollmentRate: cl.length ? (this.enrolled(cl) / cl.length) * 100 : 0, avgCalls: this.averageCalls(cl) };
    }).filter(r => r.assigned > 0);
  },

  followupTimeline(leads, days, today) {
    const t = today || CFG.today;
    const d = days || 7;
    const labels = [], counts = [];
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
    leads.forEach(l => { const ca = l.calls || 0; if (ca === 0) buckets['0']++; else if (ca <= 2) buckets['1-2']++; else if (ca <= 5) buckets['3-5']++; else if (ca <= 10) buckets['6-10']++; else buckets['10+']++; });
    return Object.entries(buckets).map(([label, count]) => ({ label, count }));
  },

  generateActivityEvents(leads) {
    const events = [];
    const order = CFG.statusOrder;
    const eventTypes = [
      { stage: 'Consultation Booked', minOrder: order['Consultation Booked'], type: 'consultation_booked' },
      { stage: 'Consultation Done', minOrder: order['Consultation Done'], type: 'consultation_done' },
      { stage: 'Documents Submitted', minOrder: order['Documents Submitted'], type: 'documents_submitted' },
      { stage: 'Applied', minOrder: order['Applied'], type: 'applied' },
      { stage: 'Enrolled', minOrder: order['Enrolled'], type: 'enrolled' }
    ];

    leads.forEach(l => {
      if (l.entryDate) {
        events.push({ time: l.entryDate, leadId: l.id, leadName: l.studentName, type: 'lead_added', action: 'Lead added — ' + l.studentName });
      }

      if (l.updatedDate && l.updatedDate.getTime() !== (l.entryDate || l.updatedDate).getTime()) {
        events.push({ time: l.updatedDate, leadId: l.id, leadName: l.studentName, type: 'status_updated', action: 'Status updated to ' + l.status + ' — ' + l.studentName });
      }

      const leadOrder = order[l.status] || 0;
      eventTypes.forEach(et => {
        if (leadOrder >= et.minOrder) {
          const eventDate = new Date(l.entryDate);
          const daysSinceEntry = Math.max(1, Math.floor((l.updatedDate - l.entryDate) / (1000 * 60 * 60 * 24)));
          const offset = l.status === 'Enrolled' ? daysSinceEntry : Math.floor(daysSinceEntry * (et.minOrder / order['Enrolled']));
          eventDate.setDate(eventDate.getDate() + Math.max(1, Math.min(offset, daysSinceEntry)));
          if (eventDate <= l.updatedDate) {
            events.push({ time: eventDate, leadId: l.id, leadName: l.studentName, type: et.type, action: et.stage + ' — ' + l.studentName });
          }
        }
      });
    });

    events.sort((a, b) => b.time - a.time);
    return events;
  },

  hasColumn(name) {
    if (!DataLoader.rawHeaders || !DataLoader.rawHeaders.length) return false;
    return DataLoader.rawHeaders.some(h => h.toLowerCase().trim() === name.toLowerCase().trim());
  }
};

window.Calc = Calc;
