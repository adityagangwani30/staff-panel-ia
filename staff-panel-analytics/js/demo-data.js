const CFG = {
  today: new Date('2026-07-03T09:00:00'),
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
  statusClass: {
    'DNP 1': 'st-dnp1',
    'DNP 2': 'st-dnp2',
    'DNP 3': 'st-dnp3',
    'DNP 4': 'st-dnp4',
    'DNP 5': 'st-dnp5',
    'NATC': 'st-natc',
    'Cold Lead': 'st-cold',
    'Warm Lead': 'st-warm',
    'Hot Lead': 'st-hot',
    'Call Back': 'st-callback',
    'Interested': 'st-interested',
    'Consultation Booked': 'st-cons-booked',
    'Consultation Done': 'st-cons-done',
    'Consultation Submitted': 'st-cons-sub',
    'Documents Submitted': 'st-docs-sub',
    'Applied': 'st-applied',
    'Enrolled': 'st-enrolled',
    'Lost/Dead': 'st-lost'
  },
  chartColors: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    purple: '#a855f7',
    info: '#06b6d4',
    teal: '#14b8a6',
    pink: '#ec4899',
    slate: '#64748b'
  },
  palette: ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#ec4899', '#14b8a6', '#ef4444', '#64748b', '#f97316', '#8b5cf6', '#f43f5e', '#0ea5e9', '#84cc16', '#d946ef', '#10b981', '#f59e0b', '#78716c'],

  staff: [
    { id: 'S001', name: 'Dr. Suhail', role: 'Founder', sourceCentre: 'all', reportsTo: null, profile: 'star-performer' },
    { id: 'S002', name: 'Vanshta Verma', role: 'BranchManager', sourceCentre: 'Delhi Office', reportsTo: 'S001', profile: 'high-performer' },
    { id: 'S005', name: 'Kunal Taswala', role: 'BranchManager', sourceCentre: 'Raipur Office', reportsTo: 'S001', profile: 'medium-performer' },
    { id: 'S006', name: 'Hemant Vaidya', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'star-performer' },
    { id: 'S007', name: 'Firdauss', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S008', name: 'Mehak Khan', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S014', name: 'Sofiya Khan', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'low-performer' },
    { id: 'S015', name: 'Payal Shankhwar', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'medium-performer' },
    { id: 'S016', name: 'Aditya Gangwani', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'star-performer' },
    { id: 'S017', name: 'Heena Bandhe', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'high-performer' }
  ],

  firstNames: ['Aarav','Priya','Rohan','Ananya','Vikram','Sneha','Kabir','Ishita','Arjun','Meera','Dev','Riya','Aditya','Kavya','Rahul','Neha','Sahil','Pooja','Karan','Divya','Nikhil','Sanya','Yash','Tanya','Aryan','Simran','Varun','Nisha','Manav','Alisha','Rohit','Preeti','Siddharth','Radhika','Harsh','Anjali','Vivek','Shreya','Amit','Kriti'],
  lastNames: ['Sharma','Verma','Iyer','Nair','Reddy','Gupta','Malhotra','Kapoor','Chatterjee','Menon','Joshi','Bhat','Rao','Singh','Patel','Mehta','Chawla','Bose','Pillai','Kulkarni'],
  guardianSuffixes: ['Father', 'Mother'],
  emailProviders: ['gmail.com', 'yahoo.com', 'outlook.com', 'rediffmail.com', 'hotmail.com'],
  statusOrder: {
    'DNP 1': 0, 'DNP 2': 1, 'DNP 3': 2, 'DNP 4': 3, 'DNP 5': 4,
    'NATC': 5, 'Cold Lead': 6, 'Warm Lead': 7, 'Hot Lead': 8, 'Call Back': 9,
    'Interested': 10, 'Consultation Booked': 11, 'Consultation Done': 12,
    'Consultation Submitted': 13, 'Documents Submitted': 14, 'Applied': 15,
    'Enrolled': 16, 'Lost/Dead': -1
  }
};

let _seed = 98765;
function seededRandom() {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  _seed = (a * _seed + c) % m;
  return _seed / (m - 1);
}

function randRange(min, max) { return seededRandom() * (max - min) + min; }
function randInt(min, max) { return Math.floor(seededRandom() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(seededRandom() * arr.length)]; }

function addDays(date, days) {
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

function pickWeightedStatus() {
  let r = seededRandom();
  let cum = 0;
  for (const g of _STATUS_GROUPS) {
    cum += g.weight;
    if (r <= cum) return pick(g.statuses);
  }
  return 'DNP 1';
}

function generateActivityLog(entryDate, updatedDate, status, calls, notes, followUpDate) {
  const log = [];
  log.push({ date: new Date(entryDate), type: 'Created', details: 'Lead created in CRM' });

  const totalDays = Math.max(0, Math.floor((new Date(updatedDate) - new Date(entryDate)) / (1000 * 60 * 60 * 24)));

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

  log.sort((a, b) => a.date - b.date);
  return log;
}

function generateLeadsData(staff, count) {
  const leads = [];

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
    let r = seededRandom();
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
  };

  const centreStaff = {};
  staff.forEach(s => {
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

      let assignee;
      let r = seededRandom();
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
      const profileBonus = { 'star-performer': 0.12, 'high-performer': 0.06, 'medium-performer': 0.02, 'low-performer': -0.02 };
      enrollProb += (profileBonus[assignee.profile] || 0);
      if (centre === 'Delhi Office') enrollProb += 0.03;
      if (centre === 'Raipur Office') enrollProb -= 0.01;
      enrollProb = Math.max(0.01, Math.min(0.60, enrollProb));

      let status;
      let rStatus = seededRandom();
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

      let neet;
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
        ? (['Interested in STEM programs', 'Looking for scholarships', 'Prefers city campus',
            'Needs accommodation assistance', 'Following up on application status',
            'Parents requested call back in evening', 'Concerned about visa processing time',
            'Wants to discuss course details', 'Asked about part-time work options',
            'Inquired about IELTS preparation support'][randInt(0, 9)])
        : '';

      leads.push({
        id: 'LD-' + leadIdCounter++,
        studentName: studentName,
        phone: '98' + String(randInt(10000000, 99999999)),
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        status: status,
        counsellorId: assignee.id,
        counsellorName: assignee.name,
        followUpDate: followUpDate,
        calls: calls,
        lastCallStatus: lastCallStatus,
        notes: notes,
        entryDate: entryDate,
        updatedDate: updatedDate,
        activityLog: generateActivityLog(entryDate, updatedDate, status, calls, notes, followUpDate),
        city: city,
        state: state,
        neet: neet,
        pcbPercentage: pcbPercentage,
        preferredCountry: country,
        preferredUniversity: university,
        source: source,
        sourceCentre: centre,
        fee: fee,
        visa: visa
      });
    }
  });

  return leads;
}

function getInitialDataset() {
  _seed = 98765;
  const staffList = CFG.staff.map(s => ({
    id: s.id, name: s.name, role: s.role,
    sourceCentre: s.sourceCentre, reportsTo: s.reportsTo, profile: s.profile
  }));
  const leads = generateLeadsData(staffList, 640);
  return { staff: staffList, leads: leads, sourceCentres: CFG.sourceCentres, sources: CFG.sources };
}

function getPersistedDataset() {
  try {
    const raw = localStorage.getItem('intelabroad_leads');
    if (raw) {
      const leads = JSON.parse(raw);
      leads.forEach(l => {
        if (l.entryDate) l.entryDate = new Date(l.entryDate);
        if (l.updatedDate) l.updatedDate = new Date(l.updatedDate);
        if (l.followUpDate) l.followUpDate = new Date(l.followUpDate);
        if (l.activityLog) {
          l.activityLog.forEach(a => a.date = new Date(a.date));
        }
      });
      const demo = getInitialDataset();
      return { leads: leads, staff: demo.staff, sourceCentres: demo.sourceCentres, sources: demo.sources };
    }
  } catch (e) {}
  return null;
}

window.IntelAbroadData = getPersistedDataset() || getInitialDataset();
