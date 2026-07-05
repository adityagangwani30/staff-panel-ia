import { CFG } from './constants';
import { Lead, StaffMember, ActivityLogEntry } from './types';

let _seed = 98765;
function seededRandom(): number {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  _seed = (a * _seed + c) % m;
  return _seed / (m - 1);
}

function randRange(min: number, max: number): number { return seededRandom() * (max - min) + min; }
function randInt(min: number, max: number): number { return Math.floor(seededRandom() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(seededRandom() * arr.length)]; }

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const _STATUS_GROUPS = [
  { statuses: ['DNP 1', 'DNP 2', 'DNP 3', 'DNP 4', 'DNP 5', 'NATC', 'Cold Lead'], weight: 0.40 },
  { statuses: ['Warm Lead', 'Hot Lead', 'Call Back'], weight: 0.18 },
  { statuses: ['Interested', 'Consultation Booked'], weight: 0.14 },
  { statuses: ['Consultation Done', 'Consultation Submitted', 'Documents Submitted'], weight: 0.08 },
  { statuses: ['Applied'], weight: 0.04 },
  { statuses: ['Enrolled'], weight: 0.06 },
  { statuses: ['Lost/Dead'], weight: 0.10 }
];

function pickWeightedStatus(): string {
  const r = seededRandom();
  let cum = 0;
  for (const g of _STATUS_GROUPS) {
    cum += g.weight;
    if (r <= cum) return pick(g.statuses);
  }
  return 'DNP 1';
}

function generateActivityLog(
  entryDate: Date,
  updatedDate: Date,
  status: string,
  calls: number,
  notes: string,
  followUpDate: Date | null
): ActivityLogEntry[] {
  const log: ActivityLogEntry[] = [];
  log.push({ date: new Date(entryDate), type: 'Created', details: 'Lead created in CRM' });

  const totalDays = Math.max(0, Math.floor((new Date(updatedDate).getTime() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24)));

  if (calls > 0) {
    for (let c = 0; c < calls; c++) {
      const callDays = totalDays > 0 ? Math.floor(seededRandom() * totalDays) : 0;
      const callDate = addDays(entryDate, callDays);
      log.push({ date: callDate, type: 'Call Completed', details: 'Outgoing call completed' });
    }
  }

  if (notes) {
    const noteDays = totalDays > 0 ? Math.floor(seededRandom() * totalDays) : 0;
    log.push({ date: addDays(entryDate, noteDays), type: 'Notes Added', details: notes });
  }

  const order = CFG.statusOrder;
  const statusVal = order[status] || 0;

  if (statusVal >= order['Interested']) {
    log.push({ date: addDays(entryDate, Math.min(totalDays, 2)), type: 'Status Changed', details: 'Status updated to Interested' });
  }
  if (statusVal >= order['Consultation Booked']) {
    log.push({ date: addDays(entryDate, Math.min(totalDays, 4)), type: 'Consultation Booked', details: 'Consultation scheduled' });
  }
  if (statusVal >= order['Consultation Done']) {
    log.push({ date: addDays(entryDate, Math.min(totalDays, 6)), type: 'Consultation Done', details: 'Consultation completed successfully' });
  }
  if (statusVal >= order['Documents Submitted']) {
    log.push({ date: addDays(entryDate, Math.min(totalDays, 8)), type: 'Documents Submitted', details: 'Academic documents uploaded' });
  }
  if (statusVal >= order['Applied']) {
    log.push({ date: addDays(entryDate, Math.min(totalDays, 10)), type: 'Applied', details: 'Application submitted to university' });
  }
  if (status === 'Enrolled') {
    log.push({ date: new Date(updatedDate), type: 'Status Changed', details: 'Status updated to Enrolled' });
  } else if (status === 'Lost/Dead') {
    log.push({ date: new Date(updatedDate), type: 'Status Changed', details: 'Status updated to Lost/Dead' });
  }

  log.sort((a, b) => a.date.getTime() - b.date.getTime());
  return log;
}

export function generateLeadsData(staffList: StaffMember[], count: number): Lead[] {
  _seed = 98765; // Reset seed to lock values
  const leads: Lead[] = [];

  const sourceWeights = [
    { source: 'Facebook Ads', volumeWeight: 0.38, baseEnroll: 0.02 },
    { source: 'Google Ads', volumeWeight: 0.18, baseEnroll: 0.06 },
    { source: 'Instagram', volumeWeight: 0.15, baseEnroll: 0.04 },
    { source: 'Website', volumeWeight: 0.10, baseEnroll: 0.12 },
    { source: 'Referral', volumeWeight: 0.06, baseEnroll: 0.20 },
    { source: 'Walk-in', volumeWeight: 0.05, baseEnroll: 0.10 },
    { source: 'Agent Partner', volumeWeight: 0.05, baseEnroll: 0.08 },
    { source: 'Education Fair', volumeWeight: 0.03, baseEnroll: 0.05 }
  ];

  function getWeightedSource() {
    const r = seededRandom();
    let sum = 0;
    for (const sw of sourceWeights) {
      sum += sw.volumeWeight;
      if (r <= sum) return sw;
    }
    return sourceWeights[0];
  }

  const centreLeadsCount = {
    'Delhi Office': Math.floor(count * 0.65),
    'Raipur Office': Math.floor(count * 0.35)
  } as Record<string, number>;

  const centreStaff = {} as Record<string, StaffMember[]>;
  staffList.forEach(s => {
    if (s.id === 'S001') return;
    if (!centreStaff[s.sourceCentre]) centreStaff[s.sourceCentre] = [];
    centreStaff[s.sourceCentre].push(s);
  });

  let leadIdCounter = 6110;

  CFG.sourceCentres.forEach(centre => {
    const centreCount = centreLeadsCount[centre] || 25;
    const centreSList = centreStaff[centre] || [];
    if (centreSList.length === 0) return;

    for (let i = 0; i < centreCount; i++) {
      const sw = getWeightedSource();
      const source = sw.source;

      let assignee: StaffMember;
      const r = seededRandom();
      if (r < 0.45) {
        assignee = centreSList.find(s => s.profile === 'star-performer') || centreSList[0];
      } else if (r < 0.80) {
        assignee = centreSList.find(s => s.profile === 'high-performer') || centreSList[0];
      } else if (r < 0.95) {
        assignee = centreSList.find(s => s.profile === 'medium-performer') || centreSList[0];
      } else {
        assignee = centreSList.find(s => s.profile === 'low-performer') || centreSList[0];
      }

      let enrollProb = sw.baseEnroll;
      const profileBonus = { 'star-performer': 0.12, 'high-performer': 0.06, 'medium-performer': 0.02, 'low-performer': -0.02 } as Record<string, number>;
      enrollProb += (profileBonus[assignee.profile || ''] || 0);
      if (centre === 'Delhi Office') enrollProb += 0.03;
      if (centre === 'Raipur Office') enrollProb -= 0.01;
      enrollProb = Math.max(0.01, Math.min(0.60, enrollProb));

      let status = '';
      const rStatus = seededRandom();
      if (rStatus < enrollProb) {
        status = 'Enrolled';
      } else if (rStatus > 0.88) {
        status = 'Lost/Dead';
      } else {
        status = pickWeightedStatus();
      }

      const isTodayLead = seededRandom() < 0.04;
      const daysAgo = isTodayLead ? randInt(0, 1) : randInt(2, 120);
      const entryDate = addDays(CFG.today, -daysAgo);
      const updatedDate = addDays(entryDate, randInt(0, Math.min(daysAgo, 14)));

      const firstName = pick(CFG.firstNames);
      const lastName = pick(CFG.lastNames);
      const studentName = firstName + ' ' + lastName;

      const state = pick(CFG.states);
      const city = randInt(0, 3) === 0 ? state : pick(CFG.cities);
      const guardianName = pick(CFG.guardianSuffixes) + ' of ' + studentName;
      const guardianPhone = '99' + String(randInt(10000000, 99999999));

      const followUpDate = (status !== 'Enrolled' && status !== 'Lost/Dead' && seededRandom() < 0.55)
        ? addDays(entryDate, randInt(3, 30))
        : null;

      const calls = (status === 'Enrolled') ? randInt(5, 18) :
                    (status === 'Lost/Dead') ? randInt(3, 12) :
                    (status === 'DNP 1' || status === 'DNP 2') ? randInt(0, 2) : randInt(2, 10);

      const lastCallStatus = calls > 0 ? pick(CFG.callLastStatuses.filter(Boolean)) : null;

      let neet: string;
      if (seededRandom() < 0.7) {
        neet = String(randInt(120, 720));
      } else {
        neet = 'No';
      }

      const pcbPercentage = parseFloat((randRange(40, 98)).toFixed(1));
      const country = pick(CFG.countries);
      const university = pick(CFG.universities);
      const fee = randInt(500000, 3500000);
      const visa = status === 'Enrolled' ? 'Yes' : (seededRandom() < 0.15 ? 'Yes' : (seededRandom() < 0.3 ? 'In Progress' : 'No'));

      const notes = seededRandom() < 0.2
        ? pick(['Interested in STEM programs', 'Looking for scholarships', 'Prefers city campus',
            'Needs accommodation assistance', 'Following up on application status',
            'Parents requested call back in evening', 'Concerned about visa processing time',
            'Wants to discuss course details', 'Asked about part-time work options',
            'Inquired about IELTS preparation support'])
        : '';

      leads.push({
        id: 'LD-' + leadIdCounter++,
        studentName,
        phone: '98' + String(randInt(10000000, 99999999)),
        guardianName,
        guardianPhone,
        status,
        counsellorId: assignee.id,
        counsellorName: assignee.name,
        followUpDate,
        calls,
        lastCallStatus,
        notes,
        entryDate,
        updatedDate,
        activityLog: generateActivityLog(entryDate, updatedDate, status, calls, notes, followUpDate),
        city,
        state,
        neet,
        pcbPercentage,
        preferredCountry: country,
        preferredUniversity: university,
        source,
        sourceCentre: centre,
        fee,
        visa
      });
    }
  });

  return leads;
}

export function getInitialDataset() {
  const staffList = [...CFG.staff];
  const leads = generateLeadsData(staffList, 640);
  return { staff: staffList, leads, sourceCentres: CFG.sourceCentres, sources: CFG.sources };
}
