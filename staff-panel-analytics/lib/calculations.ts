import { CFG } from './constants';
import { Lead, StaffMember, StageInfo, SourcePerfInfo, CounsellorPerfInfo } from './types';
import { MS_PER_DAY, toMidnight } from './utils';

export const Calc = {
  /* ─── Status predicates ────────────────────────────────────────────── */
  _isEnrolled(l: Lead) { return l.status === 'Enrolled'; },
  _isLost(l: Lead)     { return l.status === 'Lost/Dead'; },
  _isActive(l: Lead)   { return !this._isEnrolled(l) && !this._isLost(l); },

  /* ─── Core counts ──────────────────────────────────────────────────── */
  totalAssigned(leads: Lead[]) { return leads.length; },
  enrolled(leads: Lead[])      { return leads.filter(l => this._isEnrolled(l)).length; },
  activeLeads(leads: Lead[])   { return leads.filter(l => this._isActive(l)).length; },
  lostLeads(leads: Lead[])     { return leads.filter(l => this._isLost(l)).length; },

  enrollmentRate(leads: Lead[]) {
    const t = this.totalAssigned(leads);
    return t ? (this.enrolled(leads) / t) * 100 : 0;
  },

  /* ─── Follow-up metrics ────────────────────────────────────────────── */
  pendingFollowups(leads: Lead[], today = CFG.today) {
    const midnight = toMidnight(today);
    return leads.filter(l =>
      l.followUpDate && new Date(l.followUpDate) >= midnight && this._isActive(l)
    ).length;
  },

  overdueFollowups(leads: Lead[], today = CFG.today) {
    const midnight = toMidnight(today);
    return leads.filter(l =>
      l.followUpDate && new Date(l.followUpDate) < midnight && this._isActive(l)
    ).length;
  },

  followupsDueToday(leads: Lead[], today = CFG.today) {
    const key = today.toDateString();
    return leads.filter(l =>
      l.followUpDate && new Date(l.followUpDate).toDateString() === key
    ).length;
  },

  averageFollowupDelay(leads: Lead[], today = CFG.today): number {
    const midnight = toMidnight(today);
    const overdue = leads.filter(l =>
      l.followUpDate && new Date(l.followUpDate) < midnight && this._isActive(l)
    );
    if (!overdue.length) return 0;
    const totalMs = overdue.reduce((sum, l) =>
      sum + (midnight.getTime() - new Date(l.followUpDate!).getTime()), 0
    );
    return totalMs / overdue.length / MS_PER_DAY;
  },

  /* ─── Status-based counts ──────────────────────────────────────────── */
  hotLeads(leads: Lead[]) {
    return leads.filter(l => l.status === 'Hot Lead' && this._isActive(l)).length;
  },

  callbackRequests(leads: Lead[]) {
    return leads.filter(
      l => (l.status === 'Call Back' || l.lastCallStatus === 'Call Back Later') && this._isActive(l)
    ).length;
  },

  consultationBooked(leads: Lead[]) {
    return leads.filter(l => l.status === 'Consultation Booked' && this._isActive(l)).length;
  },

  applicationsSubmitted(leads: Lead[]) {
    return leads.filter(l => l.status === 'Applied' && this._isActive(l)).length;
  },

  unassignedLeads(leads: Lead[]) {
    return leads.filter(
      l => !l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorId === 'CS-UNASSIGNED'
    ).length;
  },

  /* ─── Distributions ────────────────────────────────────────────────── */
  groupBy<K>(leads: Lead[], keyFn: (l: Lead) => K): Map<K, Lead[]> {
    const map = new Map<K, Lead[]>();
    leads.forEach(l => {
      const k = keyFn(l);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(l);
    });
    return map;
  },

  statusDistribution(leads: Lead[]) {
    const map = this.groupBy(leads, l => l.status);
    return CFG.statuses.map(s => ({ status: s, count: map.get(s)?.length ?? 0 }));
  },

  /* ─── Pipeline funnel ──────────────────────────────────────────────── */
  pipelineStages(leads: Lead[]): StageInfo[] {
    const order = CFG.statusOrder;
    const nonLost = leads.filter(l => !this._isLost(l));

    const stageDefs = [
      { stage: 'Total Leads',         minOrder: -999 },
      { stage: 'Interested',          minOrder: order['Interested'] },
      { stage: 'Consultation Booked', minOrder: order['Consultation Booked'] },
      { stage: 'Consultation Done',   minOrder: order['Consultation Done'] },
      { stage: 'Documents Submitted', minOrder: order['Documents Submitted'] },
      { stage: 'Applied',             minOrder: order['Applied'] },
      { stage: 'Enrolled',            minOrder: order['Enrolled'] },
    ];

    const stages: StageInfo[] = [];
    for (let i = 0; i < stageDefs.length; i++) {
      const { stage, minOrder } = stageDefs[i];
      const count = i === 0
        ? nonLost.length
        : nonLost.filter(l => (order[l.status] ?? -999) >= minOrder).length;
      const prev = i > 0 ? stages[i - 1].count : count;
      stages.push({
        stage,
        count,
        stageConversion: prev > 0 ? (count / prev) * 100 : 0,
        dropOff:         prev > 0 ? ((prev - count) / prev) * 100 : 0,
      });
    }
    return stages;
  },

  /* ─── Performance tables ───────────────────────────────────────────── */
  sourcePerformance(leads: Lead[], sources: string[]): SourcePerfInfo[] {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const enrolled = this.enrolled(sl);
      return {
        source: s,
        assigned: sl.length,
        enrolled,
        enrollmentRate: sl.length ? (enrolled / sl.length) * 100 : 0,
      };
    });
  },

  counsellorPerformance(leads: Lead[], counsellors: StaffMember[]): CounsellorPerfInfo[] {
    return counsellors
      .map(c => {
        const cl = leads.filter(l => l.counsellorId === c.id);
        const assigned = cl.length;
        const enrolled = this.enrolled(cl);
        return {
          id: c.id,
          name: c.name,
          centre: c.sourceCentre,
          role: c.role,
          assigned,
          active: this.activeLeads(cl),
          enrolled,
          enrollmentRate: assigned ? (enrolled / assigned) * 100 : 0,
          followupsDue: this.pendingFollowups(cl),
        };
      })
      .filter(r => r.assigned > 0);
  },

  /* ─── Activity / inactivity ────────────────────────────────────────── */
  getLastActivityDate(lead: Lead): Date | null {
    if (lead.activityLog?.length) {
      const timestamps = lead.activityLog
        .map(a => new Date(a.date).getTime())
        .filter(t => !isNaN(t));
      if (timestamps.length) return new Date(Math.max(...timestamps));
    }
    if (lead.updatedDate) return new Date(lead.updatedDate);
    if (lead.entryDate)   return new Date(lead.entryDate);
    return null;
  },

  /**
   * Count active leads with no CRM activity in the last `days` days.
   * Consolidates the former inactiveLeads30 / 60 / 90 functions.
   */
  inactiveLeads(leads: Lead[], days: number, today = CFG.today): number {
    const midnight = toMidnight(today);
    const cutoff = new Date(midnight.getTime() - days * MS_PER_DAY);
    return leads.filter(l => {
      const last = this.getLastActivityDate(l);
      return last && last <= cutoff && this._isActive(l);
    }).length;
  },

  /* ─── Date range filter ────────────────────────────────────────────── */
  getDateRangeBoundaries(
    range: string,
    customFrom: string | null,
    customTo: string | null,
  ): { from: Date | null; to: Date | null } {
    const today = CFG.today;

    if (range === 'today') {
      return {
        from: toMidnight(today),
        to:   new Date(today.toDateString() + 'T23:59:59'),
      };
    }

    const nDayRanges: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
    if (nDayRanges[range] !== undefined) {
      const to   = new Date(today.toDateString() + 'T23:59:59');
      const from = new Date(to.getTime() - nDayRanges[range] * MS_PER_DAY + 1000);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }

    if (range === 'month') {
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to:   new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59),
      };
    }

    if (range === 'year') {
      return {
        from: new Date(today.getFullYear(), 0, 1),
        to:   new Date(today.getFullYear(), 11, 31, 23, 59, 59),
      };
    }

    if (range === 'custom') {
      return {
        from: customFrom ? new Date(customFrom) : null,
        to:   customTo ? new Date(customTo + 'T23:59:59') : null,
      };
    }

    return { from: null, to: null };
  },
};
