export interface TooltipDef {
  def: string;
  formula: string;
  data: string;
  business?: string;
}

export const MetricTooltipDefs: Record<string, TooltipDef> = {
  totalLeads: {
    def: 'Total number of lead records currently present in the CRM dataset.',
    formula: 'Total Leads = COUNT(All Lead Records)',
    data: 'Lead Dataset'
  },
  activeLeads: {
    def: 'Number of leads that are still active in the admission pipeline.',
    formula: 'COUNT(Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Status'
  },
  enrolled: {
    def: 'Total number of leads who have successfully completed enrollment.',
    formula: 'COUNT(Status = Enrolled)',
    data: 'Status'
  },
  conversionRate: {
    def: 'Percentage of all leads that have successfully enrolled.',
    formula: '(Enrolled Leads ÷ Total Leads) × 100',
    data: 'Status'
  },
  followupsDueToday: {
    def: 'Number of leads whose follow-up date is today.',
    formula: 'COUNT(Follow-Up Date = Today)',
    data: 'Follow-Up Date'
  },
  overdueFollowups: {
    def: 'Number of active leads whose follow-up date has passed.',
    formula: 'COUNT(Follow-Up Date < Today AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Follow-Up Date, Status'
  },
  consultationBooked: {
    def: 'Number of active leads currently scheduled for a consultation.',
    formula: 'COUNT(Status = Consultation Booked)',
    data: 'Status'
  },
  applicationsSubmitted: {
    def: 'Number of active leads who have submitted their applications.',
    formula: 'COUNT(Status = Applied)',
    data: 'Status'
  },
  unassignedLeads: {
    def: 'Leads that have not been assigned to any counsellor.',
    formula: 'COUNT(Counsellor Name is Empty OR Counsellor ID = CS-UNASSIGNED)',
    data: 'Counsellor Name, Counsellor ID'
  },
  lostLeads: {
    def: 'Leads that are no longer active due to rejection or lack of interest.',
    formula: 'COUNT(Status = Lost/Dead)',
    data: 'Status'
  },
  callbackRequests: {
    def: 'Number of active leads who requested a call back.',
    formula: 'COUNT((Status = Call Back OR Last Call Status = Call Back Later) AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Status, Last Call Status'
  },
  hotLeads: {
    def: 'High-priority active leads requiring urgent action.',
    formula: 'COUNT(Status = Hot Lead AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Status'
  },
  consultationsScheduled: {
    def: 'Number of active leads currently scheduled for a consultation.',
    formula: 'COUNT(Status = Consultation Booked AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Status'
  },
  assignedLeads: {
    def: 'Total leads assigned to the selected staff member.',
    formula: 'COUNT(Leads Assigned to Selected Staff Scope)',
    data: 'Counsellor ID / Branch / Hierarchy'
  },
  averageFollowupDelay: {
    def: 'Average number of days follow-ups are overdue for active leads.',
    formula: 'SUM(Today - Follow-Up Date) ÷ COUNT(Overdue Follow-ups in Staff Scope)',
    data: 'Follow-Up Date, Status'
  },
  stageConversion: {
    def: 'Percentage of leads progressing to this stage from the previous stage.',
    formula: '(Leads at Current Stage ÷ Leads at Previous Stage) × 100',
    data: 'Status (Order)'
  },
  dropOff: {
    def: 'Percentage of leads who did not progress to this stage from the previous stage.',
    formula: '((Leads at Previous Stage - Leads at Current Stage) ÷ Leads at Previous Stage) × 100',
    data: 'Status (Order)'
  },
  sourceLeads: {
    def: 'Total leads received from a specific marketing source.',
    formula: 'COUNT(Leads where Source = Channel)',
    data: 'Source'
  },
  sourceEnrolled: {
    def: 'Total enrolled leads from a specific marketing source.',
    formula: 'COUNT(Status = Enrolled where Source = Channel)',
    data: 'Source, Status'
  },
  sourceConvRate: {
    def: 'Percentage of leads from a particular source that successfully enrolled.',
    formula: '(Enrolled Leads from Source ÷ Total Leads from Source) × 100',
    data: 'Source, Status'
  },
  staffCompletedFollowups: {
    def: 'Count of leads in staff scope that have completed at least one call attempt.',
    formula: 'COUNT(Leads with Calls > 0 within Selected Staff Scope)',
    data: 'Calls, Counsellor ID'
  },
  staffPendingFollowups: {
    def: 'Count of active leads in staff scope with follow-up date scheduled today or in future.',
    formula: 'COUNT(Follow-Up Date ≥ Today AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Follow-Up Date, Status, Counsellor ID'
  },
  inactiveLeads30: {
    def: 'Number of active leads that have not had any recorded CRM activity during the last 30 days.',
    formula: 'COUNT(Last Activity Date ≤ Today - 30 Days AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Activity Log, Status',
    business: 'Identifies dormant leads that are ideal candidates for re-engagement campaigns such as WhatsApp broadcasts, follow-up calls, and email nurturing.'
  },
  inactiveLeads60: {
    def: 'Number of active leads that have not had any recorded CRM activity during the last 60 days.',
    formula: 'COUNT(Last Activity Date ≤ Today - 60 Days AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Activity Log, Status',
    business: 'Highlights leads requiring standard manager reviews or team redistribution to prevent drop-off.'
  },
  inactiveLeads90: {
    def: 'Number of active leads that have not had any recorded CRM activity during the last 90 days.',
    formula: 'COUNT(Last Activity Date ≤ Today - 90 Days AND Status ≠ Enrolled AND Status ≠ Lost/Dead)',
    data: 'Activity Log, Status',
    business: 'Flags long-term dormant leads that should be assigned to special re-engagement queues or archived if unresponsive.'
  }
};
