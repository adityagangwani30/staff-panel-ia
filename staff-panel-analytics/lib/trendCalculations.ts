import { CFG } from './constants';
import { Lead } from './types';
import { MS_PER_DAY } from './utils';

export interface TrendPeriodBoundaries {
  currentFrom: Date;
  currentTo: Date;
  previousFrom: Date;
  previousTo: Date;
  groupBy: 'daily' | 'weekly' | 'monthly';
}

export interface ChartDataPoint {
  label: string;
  'New Leads': number;
  'Conversion Rate': number;
  'Calls Made': number;
  'Staff Activity': number;
}

export interface KpiMetricSummary {
  current: number;
  previous: number;
  pctChange: number;
  isPositive: boolean;
}

export const TrendCalc = {
  /**
   * Determine boundaries and grouping settings for the active date range.
   */
  getPeriodBoundaries(
    range: '7d' | '30d' | '90d' | '12m' | 'custom',
    customFromStr: string | null,
    customToStr: string | null,
    today = CFG.today
  ): TrendPeriodBoundaries {
    const to = new Date(today.toDateString() + 'T23:59:59');
    let currentFrom: Date;
    let currentTo = to;
    let previousFrom: Date;
    let previousTo: Date;
    let groupBy: 'daily' | 'weekly' | 'monthly' = 'daily';

    if (range === '7d') {
      currentFrom = new Date(to.getTime() - 7 * MS_PER_DAY + 1000);
      currentFrom.setHours(0, 0, 0, 0);
      previousTo = new Date(currentFrom.getTime() - 1000);
      previousFrom = new Date(previousTo.getTime() - 7 * MS_PER_DAY + 1000);
      previousFrom.setHours(0, 0, 0, 0);
      groupBy = 'daily';
    } else if (range === '30d') {
      currentFrom = new Date(to.getTime() - 30 * MS_PER_DAY + 1000);
      currentFrom.setHours(0, 0, 0, 0);
      previousTo = new Date(currentFrom.getTime() - 1000);
      previousFrom = new Date(previousTo.getTime() - 30 * MS_PER_DAY + 1000);
      previousFrom.setHours(0, 0, 0, 0);
      groupBy = 'daily';
    } else if (range === '90d') {
      currentFrom = new Date(to.getTime() - 90 * MS_PER_DAY + 1000);
      currentFrom.setHours(0, 0, 0, 0);
      previousTo = new Date(currentFrom.getTime() - 1000);
      previousFrom = new Date(previousTo.getTime() - 90 * MS_PER_DAY + 1000);
      previousFrom.setHours(0, 0, 0, 0);
      groupBy = 'weekly';
    } else if (range === '12m') {
      currentFrom = new Date(to.getTime() - 365 * MS_PER_DAY + 1000);
      currentFrom.setHours(0, 0, 0, 0);
      previousTo = new Date(currentFrom.getTime() - 1000);
      previousFrom = new Date(previousTo.getTime() - 365 * MS_PER_DAY + 1000);
      previousFrom.setHours(0, 0, 0, 0);
      groupBy = 'monthly';
    } else {
      // Custom range: fallback to 30d if dates are not selected
      const fromDate = customFromStr ? new Date(customFromStr) : new Date(today.getTime() - 30 * MS_PER_DAY);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = customToStr ? new Date(customToStr + 'T23:59:59') : to;

      currentFrom = fromDate;
      currentTo = toDate;

      const durationMs = currentTo.getTime() - currentFrom.getTime();
      previousTo = new Date(currentFrom.getTime() - 1000);
      previousFrom = new Date(previousTo.getTime() - durationMs);
      previousFrom.setHours(0, 0, 0, 0);

      const durationDays = durationMs / MS_PER_DAY;
      if (durationDays <= 7) {
        groupBy = 'daily';
      } else if (durationDays <= 35) {
        groupBy = 'daily';
      } else if (durationDays <= 120) {
        groupBy = 'weekly';
      } else {
        groupBy = 'monthly';
      }
    }

    return { currentFrom, currentTo, previousFrom, previousTo, groupBy };
  },

  /**
   * Helper to calculate percentage growth safely.
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  },

  /**
   * Extract all completed call activity timestamps.
   */
  getAllCallLogs(leads: Lead[]): Date[] {
    const logs: Date[] = [];
    leads.forEach(lead => {
      lead.activityLog?.forEach(log => {
        if (log.type === 'Call Completed') {
          logs.push(new Date(log.date));
        }
      });
    });
    return logs;
  },

  /**
   * Extract all tracked activities.
   */
  getAllStaffActivities(leads: Lead[]): Date[] {
    const logs: Date[] = [];
    leads.forEach(lead => {
      lead.activityLog?.forEach(log => {
        // Count all activity logs since they represent staff CRM action (Call, WhatsApp, Note, Status change, etc.)
        logs.push(new Date(log.date));
      });
    });
    return logs;
  },

  /**
   * Get overall summaries for the four trend metrics.
   */
  getTrendSummaries(leads: Lead[], p: TrendPeriodBoundaries) {
    const calls = this.getAllCallLogs(leads);
    const activities = this.getAllStaffActivities(leads);

    // 1. New Leads
    const currentNewLeads = leads.filter(
      l => new Date(l.entryDate) >= p.currentFrom && new Date(l.entryDate) <= p.currentTo
    ).length;
    const prevNewLeads = leads.filter(
      l => new Date(l.entryDate) >= p.previousFrom && new Date(l.entryDate) <= p.previousTo
    ).length;
    const leadsChange = this.calculatePercentageChange(currentNewLeads, prevNewLeads);

    // 2. Lead Conversion Rate
    const currentLeadsGroup = leads.filter(
      l => new Date(l.entryDate) >= p.currentFrom && new Date(l.entryDate) <= p.currentTo
    );
    const prevLeadsGroup = leads.filter(
      l => new Date(l.entryDate) >= p.previousFrom && new Date(l.entryDate) <= p.previousTo
    );

    const currentEnrolled = currentLeadsGroup.filter(l => l.status === 'Enrolled').length;
    const currentTotal = currentLeadsGroup.length;
    const currentConvRate = currentTotal > 0 ? (currentEnrolled / currentTotal) * 100 : 0;

    const prevEnrolled = prevLeadsGroup.filter(l => l.status === 'Enrolled').length;
    const prevTotal = prevLeadsGroup.length;
    const prevConvRate = prevTotal > 0 ? (prevEnrolled / prevTotal) * 100 : 0;
    const convChange = this.calculatePercentageChange(currentConvRate, prevConvRate);

    // 3. Calls Made
    const currentCalls = calls.filter(d => d >= p.currentFrom && d <= p.currentTo).length;
    const prevCalls = calls.filter(d => d >= p.previousFrom && d <= p.previousTo).length;
    const callsChange = this.calculatePercentageChange(currentCalls, prevCalls);

    // 4. Staff Activity
    const currentAct = activities.filter(d => d >= p.currentFrom && d <= p.currentTo).length;
    const prevAct = activities.filter(d => d >= p.previousFrom && d <= p.previousTo).length;
    const actChange = this.calculatePercentageChange(currentAct, prevAct);

    return {
      newLeads: {
        current: currentNewLeads,
        previous: prevNewLeads,
        pctChange: leadsChange,
        isPositive: leadsChange >= 0
      } as KpiMetricSummary,
      conversionRate: {
        current: currentConvRate,
        previous: prevConvRate,
        pctChange: convChange,
        isPositive: convChange >= 0
      } as KpiMetricSummary,
      callsMade: {
        current: currentCalls,
        previous: prevCalls,
        pctChange: callsChange,
        isPositive: callsChange >= 0
      } as KpiMetricSummary,
      staffActivity: {
        current: currentAct,
        previous: prevAct,
        pctChange: actChange,
        isPositive: actChange >= 0
      } as KpiMetricSummary
    };
  },

  /**
   * Group data points into specific intervals for charting.
   */
  generateChartData(leads: Lead[], p: TrendPeriodBoundaries): ChartDataPoint[] {
    const calls = this.getAllCallLogs(leads);
    const activities = this.getAllStaffActivities(leads);
    const chartData: ChartDataPoint[] = [];

    const current = new Date(p.currentFrom);
    const MS_PER_DAY_VAL = MS_PER_DAY;

    if (p.groupBy === 'daily') {
      while (current <= p.currentTo) {
        const start = new Date(current);
        start.setHours(0, 0, 0, 0);
        const end = new Date(current);
        end.setHours(23, 59, 59, 999);

        const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Filter items
        const leadsInInterval = leads.filter(l => {
          const d = new Date(l.entryDate);
          return d >= start && d <= end;
        });
        const enrolled = leadsInInterval.filter(l => l.status === 'Enrolled').length;
        const convRate = leadsInInterval.length > 0 ? (enrolled / leadsInInterval.length) * 100 : 0;

        const callsInInterval = calls.filter(d => d >= start && d <= end).length;
        const actsInInterval = activities.filter(d => d >= start && d <= end).length;

        chartData.push({
          label,
          'New Leads': leadsInInterval.length,
          'Conversion Rate': parseFloat(convRate.toFixed(1)),
          'Calls Made': callsInInterval,
          'Staff Activity': actsInInterval
        });

        current.setDate(current.getDate() + 1);
      }
    } else if (p.groupBy === 'weekly') {
      // 7-day intervals
      while (current <= p.currentTo) {
        const start = new Date(current);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start.getTime() + 7 * MS_PER_DAY_VAL - 1000);
        end.setHours(23, 59, 59, 999);

        const actualEnd = end > p.currentTo ? p.currentTo : end;
        const label = 'W/o ' + start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const leadsInInterval = leads.filter(l => {
          const d = new Date(l.entryDate);
          return d >= start && d <= actualEnd;
        });
        const enrolled = leadsInInterval.filter(l => l.status === 'Enrolled').length;
        const convRate = leadsInInterval.length > 0 ? (enrolled / leadsInInterval.length) * 100 : 0;

        const callsInInterval = calls.filter(d => d >= start && d <= actualEnd).length;
        const actsInInterval = activities.filter(d => d >= start && d <= actualEnd).length;

        chartData.push({
          label,
          'New Leads': leadsInInterval.length,
          'Conversion Rate': parseFloat(convRate.toFixed(1)),
          'Calls Made': callsInInterval,
          'Staff Activity': actsInInterval
        });

        current.setDate(current.getDate() + 7);
      }
    } else if (p.groupBy === 'monthly') {
      // Calendar month intervals
      const temp = new Date(current.getFullYear(), current.getMonth(), 1);
      while (temp <= p.currentTo) {
        const start = new Date(temp);
        start.setHours(0, 0, 0, 0);
        const end = new Date(temp.getFullYear(), temp.getMonth() + 1, 0, 23, 59, 59, 999);

        const actualStart = start < p.currentFrom ? p.currentFrom : start;
        const actualEnd = end > p.currentTo ? p.currentTo : end;

        const label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const leadsInInterval = leads.filter(l => {
          const d = new Date(l.entryDate);
          return d >= actualStart && d <= actualEnd;
        });
        const enrolled = leadsInInterval.filter(l => l.status === 'Enrolled').length;
        const convRate = leadsInInterval.length > 0 ? (enrolled / leadsInInterval.length) * 100 : 0;

        const callsInInterval = calls.filter(d => d >= actualStart && d <= actualEnd).length;
        const actsInInterval = activities.filter(d => d >= actualStart && d <= actualEnd).length;

        chartData.push({
          label,
          'New Leads': leadsInInterval.length,
          'Conversion Rate': parseFloat(convRate.toFixed(1)),
          'Calls Made': callsInInterval,
          'Staff Activity': actsInInterval
        });

        temp.setMonth(temp.getMonth() + 1);
      }
    }

    return chartData;
  }
};
