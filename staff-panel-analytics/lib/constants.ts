import { StaffMember } from './types';

export const CFG = {
  // ── Always use real current date in production ──────────────────────
  today: new Date(),

  sourceCentres: ['Delhi Office', 'Raipur Office'],
  sources: ['Facebook Ads', 'Google Ads', 'Instagram', 'Referral', 'Walk-in', 'Website', 'Education Fair', 'Agent Partner'],
  statuses: [
    'DNP 1', 'DNP 2', 'DNP 3', 'DNP 4', 'DNP 5',
    'NATC', 'Cold Lead', 'Warm Lead', 'Hot Lead', 'Call Back',
    'Interested', 'Consultation Booked', 'Consultation Done',
    'Consultation Submitted', 'Documents Submitted', 'Applied',
    'Enrolled', 'Lost/Dead'
  ],
  countries: ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'New Zealand', 'Ireland', 'France'],
  universities: [
    'Harvard University', 'MIT', 'Stanford University', 'University of Oxford',
    'University of Cambridge', 'University of Toronto', 'University of Melbourne',
    'University of Sydney', 'TU Munich', 'University of Auckland',
    'Trinity College Dublin', 'Sorbonne University', 'University of British Columbia',
    'Imperial College London', 'University of California Berkeley',
    'New York University', 'University of Chicago', 'University of Edinburgh',
    'McGill University', 'Australian National University'
  ],
  visaStatuses: ['Yes', 'No', 'In Progress'],
  callLastStatuses: ['Interested', 'Not Interested', 'Busy', "Didn't Answer", 'Call Back Later', 'Wrong Number', null],
  states: ['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Haryana', 'Punjab', 'Gujarat', 'West Bengal'],
  cities: ['Delhi', 'Mumbai', 'Nagpur', 'Raipur', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Jaipur', 'Jodhpur', 'Ahmedabad', 'Indore', 'Bhopal', 'Patna', 'Chandigarh', 'Ludhiana', 'Kolkata', 'Pune', 'Surat', 'Noida'],
  statusColors: {
    'DNP 1': '#64748b',
    'DNP 2': '#64748b',
    'DNP 3': '#64748b',
    'DNP 4': '#64748b',
    'DNP 5': '#64748b',
    'NATC': '#78716c',
    'Cold Lead': '#0ea5e9',
    'Warm Lead': '#3b82f6',
    'Hot Lead': '#ec4899',
    'Call Back': '#a855f7',
    'Interested': '#06b6d4',
    'Consultation Booked': '#14b8a6',
    'Consultation Done': '#10b981',
    'Consultation Submitted': '#84cc16',
    'Documents Submitted': '#f59e0b',
    'Applied': '#f97316',
    'Enrolled': '#22c55e',
    'Lost/Dead': '#ef4444'
  } as Record<string, string>,
  statusOrder: {
    'DNP 1': 0, 'DNP 2': 1, 'DNP 3': 2, 'DNP 4': 3, 'DNP 5': 4,
    'NATC': 5, 'Cold Lead': 6, 'Warm Lead': 7, 'Hot Lead': 8, 'Call Back': 9,
    'Interested': 10, 'Consultation Booked': 11, 'Consultation Done': 12,
    'Consultation Submitted': 13, 'Documents Submitted': 14, 'Applied': 15,
    'Enrolled': 16, 'Lost/Dead': -1
  } as Record<string, number>,
  staff: [
    { id: 'S001', name: 'Dr. Suhail',       role: 'Founder',        sourceCentre: 'all',          reportsTo: null,   profile: 'star-performer'   },
    { id: 'S002', name: 'Vanshta Verma',    role: 'BranchManager',  sourceCentre: 'Delhi Office', reportsTo: 'S001', profile: 'high-performer'   },
    { id: 'S005', name: 'Kunal Taswala',    role: 'BranchManager',  sourceCentre: 'Raipur Office',reportsTo: 'S001', profile: 'medium-performer' },
    { id: 'S006', name: 'Hemant Vaidya',    role: 'TeamLead',       sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'star-performer'   },
    { id: 'S007', name: 'Firdauss',         role: 'TeamLead',       sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S008', name: 'Mehak Khan',       role: 'TeamLead',       sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S014', name: 'Sofiya Khan',      role: 'Counsellor',     sourceCentre: 'Raipur Office',reportsTo: 'S005', profile: 'low-performer'    },
    { id: 'S015', name: 'Payal Shankhwar',  role: 'Counsellor',     sourceCentre: 'Raipur Office',reportsTo: 'S005', profile: 'medium-performer' },
    { id: 'S016', name: 'Aditya Gangwani',  role: 'Counsellor',     sourceCentre: 'Raipur Office',reportsTo: 'S005', profile: 'star-performer'   },
    { id: 'S017', name: 'Heena Bandhe',     role: 'Counsellor',     sourceCentre: 'Raipur Office',reportsTo: 'S005', profile: 'high-performer'   }
  ] as StaffMember[],
};
