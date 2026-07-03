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

  // Applications count
  applicationsSubmitted(leads) {
    return leads.filter(l => l.appStatus === 'Submitted' || l.appStatus === 'Accepted').length;
  },

  // Visas count
  visaFiled(leads) {
    return leads.filter(l => l.visaStatus === 'Filed' || l.visaStatus === 'Approved').length;
  },

  // Weighted Activity-Based Productivity Score (0 to 100)
  counsellorProductivity(cLeads) {
    if (!cLeads.length) return 0;
    
    // 1. Calls (5 pts each, max 25)
    const calls = this.callsCompleted(cLeads);
    const callsPts = Math.min(25, calls * 5);
    
    // 2. Follow-ups (8 pts each, max 40)
    const fus = this.followupsCompleted(cLeads);
    const fusPts = Math.min(40, fus * 8);
    
    // 3. WhatsApp conversations count (0.5 pts each message exchange, max 15)
    const wa = cLeads.reduce((sum, l) => sum + (l.whatsAppCount || 0), 0);
    const waPts = Math.min(15, wa * 0.5);
    
    // 4. Response Time SLA (max 10 points based on SLA rate)
    const slaRate = this.slaComplianceRate(cLeads);
    const slaPts = (slaRate / 100) * 10;
    
    // 5. Applications submitted (+5 pts each, max 10)
    const apps = this.applicationsSubmitted(cLeads);
    const appsPts = Math.min(10, apps * 5);
    
    // 6. Conversion Rate (max 20 points, scaled up to 50% conversion)
    const convRate = this.conversionRate(cLeads);
    const convPts = Math.min(20, convRate * 0.4);
    
    return Math.round(callsPts + fusPts + waPts + slaPts + appsPts + convPts);
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

  // Lead Quality Score (LQS) based on source characteristics (0 to 100)
  leadQualityScore(leads) {
    if (!leads.length) return 0;

    // 1. Conversion Rate weight (40%)
    const convRate = this.conversionRate(leads);
    const convPts = Math.min(40, convRate * 3.33); // 12% conversion yields full 40 pts

    // 2. Qualified Lead % weight (30%)
    const rank = {
      'New': 0, 'Contacted': 1, 'Follow-up': 1, 'Qualified': 2,
      'Application Sent': 3, 'Visa Filed': 4, 'Converted': 5, 'Lost': -1
    };
    const qualifiedCount = leads.filter(l => l.status !== 'Lost' && rank[l.status] >= 2).length;
    const qualRate = (qualifiedCount / leads.length) * 100;
    const qualPts = (qualRate / 100) * 30;

    // 3. Follow-up compliance weight (15%)
    const fuRate = this.followupCompletionRate(leads);
    const fuPts = (fuRate / 100) * 15;

    // 4. SLA compliance weight (15%)
    const slaRate = this.slaComplianceRate(leads);
    const slaPts = (slaRate / 100) * 15;

    return Math.round(convPts + qualPts + fuPts + slaPts);
  },

  avgCallsPerConversion(leads) {
    const convertedLeads = leads.filter(l => l.converted);
    if (!convertedLeads.length) return 0;
    return this.callsCompleted(convertedLeads) / convertedLeads.length;
  },

  avgFollowupsPerConversion(leads) {
    const convertedLeads = leads.filter(l => l.converted);
    if (!convertedLeads.length) return 0;
    return this.followupsCompleted(convertedLeads) / convertedLeads.length;
  },

  growth(curr, prev) {
    if (!prev) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
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
      'Follow-up': 1,
      'Qualified': 2,
      'Application Sent': 3,
      'Visa Filed': 4,
      'Converted': 5,
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

  weeklySeries(leads, weeks = 8, today = CFG.today) {
    const labels = [];
    const assigned = [];
    const converted = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const start = addDays(today, -(i + 1) * 7);
      const end = addDays(today, -i * 7);
      labels.push('W' + (weeks - i));
      assigned.push(leads.filter(l => l.assignedDate >= start && l.assignedDate < end).length);
      converted.push(leads.filter(l => l.converted && l.lastActivityDate >= start && l.lastActivityDate < end).length);
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
        appsSubmitted: this.applicationsSubmitted(bl),
        visaFiled: this.visaFiled(bl),
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
      
      const totalCalls = this.callsCompleted(sl);
      const avgCalls = converted ? totalCalls / converted : 0;
      
      const totalFUs = this.followupsCompleted(sl);
      const avgFUs = converted ? totalFUs / converted : 0;

      return {
        source: s,
        assigned: assigned,
        converted: converted,
        conversionRate: assigned ? (converted / assigned) * 100 : 0,
        qualityScore: this.leadQualityScore(sl),
        avgResponse: this.avgResponseTime(sl),
        avgCalls: avgCalls,
        avgFUs: avgFUs
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
  }
};

window.Calc = Calc;
