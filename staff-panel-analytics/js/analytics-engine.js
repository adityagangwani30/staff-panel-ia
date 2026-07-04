/* ============================================================
   ANALYTICS CALCULATION ENGINE — IntelAbroad Staff Panel
   ============================================================ */

const Calc = {
  totalAssigned(leads) {
    return leads.length;
  },

  contacted(leads) {
    return leads.filter(l => l.firstContactDate).length;
  },

  converted(leads) {
    return leads.filter(l => l.converted).length;
  },

  lost(leads) {
    return leads.filter(l => l.lost).length;
  },

  activeLeads(leads) {
    return leads.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length;
  },

  conversionRate(leads) {
    const t = this.totalAssigned(leads);
    return t ? (this.converted(leads) / t) * 100 : 0;
  },

  contactRate(leads) {
    const t = this.totalAssigned(leads);
    return t ? (this.contacted(leads) / t) * 100 : 0;
  },

  callsCompleted(leads) {
    return leads.reduce((sum, l) => sum + (l.calls ? l.calls.length : 0), 0);
  },

  followupsCompleted(leads) {
    return leads.reduce((sum, l) => sum + (l.followUps ? l.followUps.filter(f => f.completed).length : 0), 0);
  },

  followupsTotal(leads) {
    return leads.reduce((sum, l) => sum + (l.followUps ? l.followUps.length : 0), 0);
  },

  followupCompletionRate(leads) {
    const t = this.followupsTotal(leads);
    return t ? (this.followupsCompleted(leads) / t) * 100 : 0;
  },

  pendingFollowups(leads, today = CFG.today) {
    return leads.reduce((sum, l) => {
      if (!l.followUps) return sum;
      return sum + l.followUps.filter(f => !f.completed && f.dueDate < today).length;
    }, 0);
  },

  avgResponseTime(leads) {
    const withResp = leads.filter(l => l.responseTimeHours != null);
    if (!withResp.length) return 0;
    return withResp.reduce((sum, l) => sum + l.responseTimeHours, 0) / withResp.length;
  },

  avgLeadAging(leads, today = CFG.today) {
    const open = leads.filter(l => !l.converted && !l.lost);
    if (!open.length) return 0;
    return open.reduce((sum, l) => sum + this.daysBetween(l.assignedDate, today), 0) / open.length;
  },

  // SLA Compliance: contacted within 24 hours of assignment
  slaComplianceRate(leads) {
    const contactedLeads = leads.filter(l => l.firstContactDate != null);
    if (!contactedLeads.length) return 0;
    const compliant = contactedLeads.filter(l => l.responseTimeHours <= 24).length;
    return (compliant / contactedLeads.length) * 100;
  },

  // Simplified Productivity Score (0 to 100)
  // 40% Conversion Rate, 30% Follow-up Completion, 20% Response Time SLA, 10% Calls Completed
  counsellorProductivity(cLeads) {
    if (!cLeads.length) return 0;

    const convRate = this.conversionRate(cLeads);
    const convPts = Math.min(40, (convRate / 100) * 40);

    const fuRate = this.followupCompletionRate(cLeads);
    const fuPts = Math.min(30, (fuRate / 100) * 30);

    const slaRate = this.slaComplianceRate(cLeads);
    const slaPts = Math.min(20, (slaRate / 100) * 20);

    const calls = this.callsCompleted(cLeads);
    const callsPts = Math.min(10, calls * 2);

    return Math.round(convPts + fuPts + slaPts + callsPts);
  },

  // Overall Productivity Score (average of individual counselor scores)
  productivity(leads) {
    const map = this.groupBy(leads, l => l.counsellorId);
    if (!map.size) return 0;
    let sum = 0;
    map.forEach((cLeads) => {
      sum += this.counsellorProductivity(cLeads);
    });
    return sum / map.size;
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
    return CFG.statuses.map(s => {
      return { status: s, count: (map.get(s) || []).length };
    });
  },

  funnelStages(leads) {
    const order = CFG.funnelStages;
    const rank = {
      'New': 0,
      'Contacted': 1,
      'Follow-up': 2,
      'Qualified': 3,
      'Converted': 4,
      'Lost': -1
    };
    return order.map((stage, i) => {
      return {
        stage: stage,
        count: leads.filter(l => l.status !== 'Lost' && rank[l.status] >= i).length
      };
    });
  },

  dailySeries(leads, days = 14, today = CFG.today) {
    const labels = [];
    const assigned = [];
    const converted = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = addDays(today, -i);
      const key = day.toDateString();
      labels.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      assigned.push(leads.filter(l => l.assignedDate.toDateString() === key).length);
      converted.push(leads.filter(l => l.converted && l.lastActivityDate.toDateString() === key).length);
    }
    return { labels, assigned, converted };
  },

  monthlySeries(leads, months = 6, today = CFG.today) {
    const labels = [];
    const assigned = [];
    const converted = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const next = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
      assigned.push(leads.filter(l => l.assignedDate >= d && l.assignedDate < next).length);
      converted.push(leads.filter(l => l.converted && l.lastActivityDate >= d && l.lastActivityDate < next).length);
    }
    return { labels, assigned, converted };
  },

  counsellorPerformance(leads, counsellors) {
    return counsellors.map(c => {
      const cl = leads.filter(l => l.counsellorId === c.id);
      const assigned = cl.length;
      const converted = cl.filter(l => l.converted).length;
      const pending = this.pendingFollowups(cl);
      const totalWhatsApp = cl.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0);
      return {
        id: c.id,
        name: c.name,
        branch: c.branch,
        assigned: assigned,
        converted: converted,
        conversionRate: assigned ? (converted / assigned) * 100 : 0,
        pending: pending,
        calls: this.callsCompleted(cl),
        whatsApp: totalWhatsApp,
        followups: this.followupsCompleted(cl),
        responseTime: this.avgResponseTime(cl),
        aging: this.avgLeadAging(cl),
        productivity: this.counsellorProductivity(cl),
        slaCompliance: this.slaComplianceRate(cl)
      };
    }).filter(r => r.assigned > 0);
  },

  branchPerformance(leads, branches) {
    return branches.map(b => {
      const bl = leads.filter(l => l.branch === b);
      const assigned = bl.length;
      const converted = bl.filter(l => l.converted).length;
      return {
        branch: b,
        assigned: assigned,
        active: this.activeLeads(bl),
        converted: converted,
        conversionRate: assigned ? (converted / assigned) * 100 : 0,
        productivity: this.productivity(bl),
        slaCompliance: this.slaComplianceRate(bl),
        avgResponse: this.avgResponseTime(bl),
        avgAging: this.avgLeadAging(bl),
        pendingFU: this.pendingFollowups(bl),
        overdueFU: this.overdueFollowups(bl).length
      };
    });
  },

  sourcePerformance(leads, sources) {
    return sources.map(s => {
      const sl = leads.filter(l => l.source === s);
      const assigned = sl.length;
      const converted = sl.filter(l => l.converted).length;
      return {
        source: s,
        assigned: assigned,
        converted: converted,
        conversionRate: assigned ? (converted / assigned) * 100 : 0,
        avgResponse: this.avgResponseTime(sl)
      };
    });
  },

  overdueFollowups(leads, today = CFG.today) {
    const rows = [];
    leads.forEach(l => {
      if (!l.followUps) return;
      l.followUps.filter(f => !f.completed && f.dueDate < today).forEach(f => {
        rows.push({
          leadId: l.id,
          student: l.studentName,
          counsellor: l.counsellorName,
          branch: l.branch,
          dueDate: f.dueDate,
          overdueDays: this.daysBetween(f.dueDate, today),
          status: l.status
        });
      });
    });
    return rows.sort((a, b) => b.overdueDays - a.overdueDays);
  },

  daysBetween(a, b) {
    const aDate = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const bDate = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((bDate - aDate) / (1000 * 60 * 60 * 24));
  },

  // Lead Re-engagement: inactivity buckets
  inactiveLeads(leads, days, today = CFG.today) {
    return leads.filter(l => {
      if (l.converted || l.lost) return false;
      const lastAct = l.lastActivityDate || l.assignedDate;
      return this.daysBetween(lastAct, today) >= days;
    });
  },

  reEngagementBuckets(leads, today = CFG.today) {
    const active = leads.filter(l => !l.converted && !l.lost);
    const total = active.length;
    const buckets = [30, 60, 90];
    const prevPeriodMultiplier = 1.5; // compare to (days * 1.5) ago
    return buckets.map(days => {
      const count = this.inactiveLeads(leads, days, today).length;
      const prevCount = this.inactiveLeads(leads, Math.round(days * prevPeriodMultiplier), today).length;
      return {
        label: days + '+ days',
        days,
        count,
        pct: total ? (count / total) * 100 : 0,
        trend: prevCount ? count - prevCount : 0
      };
    });
  },

  // Recovery trend: mock weekly recovered vs dormant counts
  recoveryTrend(weeks = 4, today = CFG.today) {
    const labels = [];
    const dormant = [];
    const recovered = [];
    for (let i = weeks - 1; i >= 0; i--) {
      labels.push('W' + (weeks - i));
      // Mock: dormant count decreases slightly, recovered count increases slightly over recent weeks
      const baseDormant = 40 + Math.floor(Math.random() * 15) - i * 2;
      const baseRecovered = 8 + Math.floor(Math.random() * 6) + i * 1;
      dormant.push(Math.max(0, baseDormant));
      recovered.push(Math.max(0, baseRecovered));
    }
    return { labels, dormant, recovered };
  },

  // Quick insights for re-engagement (returns plain text data; UI handles HTML)
  reEngagementInsights(leads, today = CFG.today) {
    const insights = [];

    const dormant30 = this.inactiveLeads(leads, 30, today);

    // Branch with most dormant leads
    const branchMap = new Map();
    dormant30.forEach(l => {
      branchMap.set(l.branch, (branchMap.get(l.branch) || 0) + 1);
    });
    let topBranch = { branch: '', count: 0 };
    branchMap.forEach((count, branch) => {
      if (count > topBranch.count) topBranch = { branch, count };
    });
    if (topBranch.branch) {
      insights.push({ type: 'branch', text: `Most dormant leads belong to ${topBranch.branch} (${topBranch.count} leads).` });
    }

    // Counsellor with most inactive leads
    const csMap = new Map();
    dormant30.forEach(l => {
      csMap.set(l.counsellorName, (csMap.get(l.counsellorName) || 0) + 1);
    });
    let topCS = { name: '', count: 0 };
    csMap.forEach((count, name) => {
      if (count > topCS.count) topCS = { name, count };
    });
    if (topCS.name) {
      insights.push({ type: 'counsellor', text: `Counsellor ${topCS.name} has the highest number of inactive leads (${topCS.count}).` });
    }

    // 60-day trend using reEngagementBuckets
    const buckets = this.reEngagementBuckets(leads, today);
    const bucket60 = buckets.find(b => b.days === 60);
    if (bucket60 && Math.abs(bucket60.trend) > 0) {
      const direction = bucket60.trend > 0 ? 'increased' : 'decreased';
      insights.push({ type: 'trend', text: `60-Day dormant leads ${direction} by ${Math.abs(bucket60.trend)} this period.` });
    }

    // Mock recovery rate
    const recoveryRate = 10 + Math.floor(Math.random() * 8);
    const prevRecoveryRate = recoveryRate - 2 - Math.floor(Math.random() * 4);
    const diff = recoveryRate - prevRecoveryRate;
    const recDirection = diff >= 0 ? 'improved' : 'declined';
    insights.push({ type: 'recovery', text: `Recovery rate ${recDirection} by ${Math.abs(diff)}% compared to last period.` });

    return insights;
  },

  // Lead Objection Analytics
  objectionBreakdown(leads) {
    const withObj = leads.filter(l => l.objection);
    const map = new Map();
    CFG.objections.forEach(o => map.set(o, 0));
    withObj.forEach(l => {
      map.set(l.objection, (map.get(l.objection) || 0) + 1);
    });
    let total = withObj.length;
    let mostCommon = { reason: '', count: 0 };
    const rows = CFG.objections.map(o => {
      const c = map.get(o) || 0;
      if (c > mostCommon.count) { mostCommon = { reason: o, count: c }; }
      return { reason: o, count: c, pct: total ? (c / total) * 100 : 0 };
    });
    return { rows, total, mostCommon };
  },

  // Call Outcome Analytics
  callOutcomeBreakdown(leads) {
    const outcomeMap = new Map();
    const outcomes = ['Interested', 'Not Interested', 'Busy', "Didn't Answer", 'Call Back Later', 'Wrong Number'];
    outcomes.forEach(o => outcomeMap.set(o, 0));

    leads.forEach(l => {
      if (l.calls) {
        l.calls.forEach(c => {
          const mapped = c.outcome;
          if (outcomeMap.has(mapped)) {
            outcomeMap.set(mapped, outcomeMap.get(mapped) + 1);
          }
        });
      }
    });

    let total = 0;
    outcomeMap.forEach(v => total += v);
    let mostCommon = { outcome: '', count: 0 };
    const rows = outcomes.map(o => {
      const c = outcomeMap.get(o) || 0;
      if (c > mostCommon.count) { mostCommon = { outcome: o, count: c }; }
      return { outcome: o, count: c, pct: total ? (c / total) * 100 : 0 };
    });
    return { rows, total, mostCommon };
  },

  leadsContactedToday(leads, today = CFG.today) {
    return leads.filter(l => l.firstContactDate &&
      l.firstContactDate.toDateString() === today.toDateString()).length;
  }
};

window.Calc = Calc;
