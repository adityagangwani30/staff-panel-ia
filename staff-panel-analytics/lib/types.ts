export interface ActivityLogEntry {
  date: Date;
  type: string;
  details?: string;
}

export interface Lead {
  id: string;
  studentName: string;
  phone: string;
  guardianName?: string;
  guardianPhone?: string;
  status: string;
  counsellorId: string;
  counsellorName: string;
  followUpDate: Date | null;
  calls: number;
  lastCallStatus: string | null;
  notes?: string;
  entryDate: Date;
  updatedDate: Date;
  activityLog?: ActivityLogEntry[];
  city?: string;
  state?: string;
  neet?: string;
  pcbPercentage?: number;
  preferredCountry?: string;
  preferredUniversity?: string;
  source: string;
  sourceCentre: string;
  fee?: number;
  visa?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Founder' | 'BranchManager' | 'TeamLead' | 'Counsellor';
  sourceCentre: string;
  reportsTo: string | null;
  profile?: string;
}

export interface FilterState {
  dateRange: 'all' | 'today' | '7d' | '30d' | '90d' | 'month' | 'year' | 'custom';
  customFrom: string | null;
  customTo: string | null;
  source: string;
  status: string;
}

export interface StageInfo {
  stage: string;
  count: number;
  stageConversion: number;
  dropOff: number;
}

export interface SourcePerfInfo {
  source: string;
  assigned: number;
  enrolled: number;
  enrollmentRate: number;
}

export interface CounsellorPerfInfo {
  id: string;
  name: string;
  centre: string;
  role: string;
  assigned: number;
  active: number;
  enrolled: number;
  enrollmentRate: number;
  followupsDue: number;
}
