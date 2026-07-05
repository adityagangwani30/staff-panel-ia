import { CFG } from './constants';
import { Lead, StaffMember, StageInfo, SourcePerfInfo, CounsellorPerfInfo } from './types';

export const Calc = {
  _isEnrolled(l: Lead) { return l.status === 'Enrolled'; },
  _isLost(l: Lead) { return l.status === 'Lost/Dead'; },
  _isActive(l: Lead) { return !this._isEnrolled(l) && !this._isLost(l); },

  totalAssigned(leads: Lead[]) { return leads.length; },

  enrolled(leads: Lead[]) { return leads.filter(l => this._isEnrolled(l)).length; },

  activeLeads(leads: Lead[]) { return leads.filter(l => this._isActive(l)).length; },

  enrollmentRate(leads: Lead[]) {
    const t = this.totalAssigned(leads);
    return t ? (this.enrolled(leads) / t) * 100 : 0;
  },

  pendingFollowups(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    return leads.filter(l => l.followUpDate && new Date(l.followUpDate) >= targetMidnight && this._isActive(l)).length;
  },

  overdueFollowups(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    return leads.filter(l => l.followUpDate && new Date(l.followUpDate) < targetMidnight && this._isActive(l)).length;
  },

  followupsDueToday(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const key = target.toDateString();
    return leads.filter(l => l.followUpDate && new Date(l.followUpDate).toDateString() === key).length;
  },

  hotLeads(leads: Lead[]) {
    return leads.filter(l => l.status === 'Hot Lead' && this._isActive(l)).length;
  },

  callbackRequests(leads: Lead[]) {
    return leads.filter(l => (l.status === 'Call Back' || l.lastCallStatus === 'Call Back Later') && this._isActive(l)).length;
  },

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
    return CFG.statuses.map(s => ({ status: s, count: (map.get(s) || []).length }));
  },

  pipelineStages(leads: Lead[]): StageInfo[] {
    const order = CFG.statusOrder;
    const nonLost = leads.filter(l => !this._isLost(l));

    // Each stage includes leads AT or BEYOND that funnel position
    const stageDefs = [
      { stage: 'Total Leads',          minOrder: -999 },  // all leads (incl. early DNP)
      { stage: 'Interested',           minOrder: order['Interested'] },
      { stage: 'Consultation Booked',  minOrder: order['Consultation Booked'] },
      { stage: 'Consultation Done',    minOrder: order['Consultation Done'] },
      { stage: 'Documents Submitted',  minOrder: order['Documents Submitted'] },
      { stage: 'Applied',              minOrder: order['Applied'] },
      { stage: 'Enrolled',             minOrder: order['Enrolled'] },
    ];

    const stages: StageInfo[] = [];
    for (let i = 0; i < stageDefs.length; i++) {
      const sd = stageDefs[i];
      // Stage 0 = all non-lost leads; subsequent stages = leads whose status >= minOrder
      const count = i === 0
        ? nonLost.length
        : nonLost.filter(l => (order[l.status] ?? -999) >= sd.minOrder).length;
      const prevCount = i > 0 ? stages[i - 1].count : count;
      const stageConv = prevCount > 0 ? (count / prevCount) * 100 : 0;
      const dropOff   = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
      stages.push({ stage: sd.stage, count, stageConversion: stageConv, dropOff });
    }
    return stages;
  },

  sourcePerformance(leads: Lead[], sources: string[]): SourcePerfInfo[] {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const enrolled = this.enrolled(sl);
      return { source: s, assigned: sl.length, enrolled, enrollmentRate: sl.length ? (enrolled / sl.length) * 100 : 0 };
    });
  },

  counsellorPerformance(leads: Lead[], counsellors: StaffMember[]): CounsellorPerfInfo[] {
    return counsellors.map(c => {
      const cl = leads.filter(l => l.counsellorId === c.id);
      const assigned = cl.length;
      const active = this.activeLeads(cl);
      const enrolled = this.enrolled(cl);
      const enrollmentRate = assigned ? (enrolled / assigned) * 100 : 0;
      const followupsDue = this.pendingFollowups(cl);
      return { id: c.id, name: c.name, centre: c.sourceCentre, role: c.role, assigned, active, enrolled, enrollmentRate, followupsDue };
    }).filter(r => r.assigned > 0);
  },

  consultationBooked(leads: Lead[]) {
    return leads.filter(l => l.status === 'Consultation Booked' && this._isActive(l)).length;
  },

  applicationsSubmitted(leads: Lead[]) {
    return leads.filter(l => l.status === 'Applied' && this._isActive(l)).length;
  },

  unassignedLeads(leads: Lead[]) {
    return leads.filter(l => !l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorId === 'CS-UNASSIGNED').length;
  },

  lostLeads(leads: Lead[]) {
    return leads.filter(l => this._isLost(l)).length;
  },

  // NOTE: consultationsScheduled is an alias for consultationBooked — use consultationBooked directly.

  averageFollowupDelay(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    const overdueLeads = leads.filter(l => l.followUpDate && new Date(l.followUpDate) < targetMidnight && this._isActive(l));
    if (!overdueLeads.length) return 0;
    const sum = overdueLeads.reduce((total, l) => {
      const diffMs = targetMidnight.getTime() - new Date(l.followUpDate!).getTime();
      return total + (diffMs / (1000 * 60 * 60 * 24));
    }, 0);
    return sum / overdueLeads.length;
  },

  getLastActivityDate(lead: Lead): Date | null {
    if (lead.activityLog && lead.activityLog.length) {
      const dates = lead.activityLog.map(a => new Date(a.date).getTime()).filter(t => !isNaN(t));
      if (dates.length) {
        return new Date(Math.max(...dates));
      }
    }
    return lead.updatedDate ? new Date(lead.updatedDate) : lead.entryDate ? new Date(lead.entryDate) : null;
  },

  inactiveLeads30(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    const limit = new Date(targetMidnight.getTime() - 30 * 24 * 60 * 60 * 1000);
    return leads.filter(l => {
      const act = this.getLastActivityDate(l);
      return act && act <= limit && this._isActive(l);
    }).length;
  },

  inactiveLeads60(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    const limit = new Date(targetMidnight.getTime() - 60 * 24 * 60 * 60 * 1000);
    return leads.filter(l => {
      const act = this.getLastActivityDate(l);
      return act && act <= limit && this._isActive(l);
    }).length;
  },

  inactiveLeads90(leads: Lead[], today?: Date) {
    const target = today || CFG.today;
    const targetMidnight = new Date(target.toDateString());
    const limit = new Date(targetMidnight.getTime() - 90 * 24 * 60 * 60 * 1000);
    return leads.filter(l => {
      const act = this.getLastActivityDate(l);
      return act && act <= limit && this._isActive(l);
    }).length;
  },

  getDateRangeBoundaries(range: string, customFrom: string | null, customTo: string | null) {
    const today = CFG.today;
    let from: Date | null = null;
    let to: Date | null = null;

    switch (range) {
      case 'today':
        from = new Date(today.toDateString());
        to = new Date(today.toDateString() + 'T23:59:59');
        break;
      case '7d':
        to = new Date(today.toDateString() + 'T23:59:59');
        from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000 + 1000);
        from.setHours(0, 0, 0, 0);
        break;
      case '30d':
        to = new Date(today.toDateString() + 'T23:59:59');
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000 + 1000);
        from.setHours(0, 0, 0, 0);
        break;
      case '90d':
        to = new Date(today.toDateString() + 'T23:59:59');
        from = new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000 + 1000);
        from.setHours(0, 0, 0, 0);
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        from = customFrom ? new Date(customFrom) : null;
        to = customTo ? new Date(customTo + 'T23:59:59') : null;
        break;
    }
    return { from, to };
  }
};
