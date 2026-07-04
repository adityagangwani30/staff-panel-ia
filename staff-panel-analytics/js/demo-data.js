const CFG = {
  today: new Date('2026-07-03T09:00:00'),
  sourceCentres: ['Delhi Office', 'Delhi 2026', 'Nagpur 2026', 'Raipur Office'],
  sources: ['Facebook Ads', 'Google Ads', 'Instagram', 'Referral', 'Walk-in', 'Website', 'Education Fair', 'Agent Partner'],
  statuses: ['New', 'Contacted', 'Follow-up', 'Interested', 'Qualified', 'Converted', 'Lost'],
  funnelStages: ['New', 'Contacted', 'Interested', 'Application Filed', 'Converted'],
  categories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
  states: ['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Bihar', 'Haryana', 'Punjab', 'Gujarat', 'West Bengal'],
  cities: ['Delhi', 'Mumbai', 'Nagpur', 'Raipur', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Jaipur', 'Jodhpur', 'Ahmedabad', 'Indore', 'Bhopal', 'Patna', 'Chandigarh', 'Ludhiana', 'Kolkata', 'Pune', 'Surat', 'Noida'],
  examCities: ['Delhi', 'Mumbai', 'Nagpur', 'Raipur', 'Lucknow', 'Jaipur', 'Ahmedabad', 'Bhopal', 'Patna', 'Chandigarh', 'Kolkata', 'Pune'],
  statusClass: {
    'New': 'st-new',
    'Contacted': 'st-contacted',
    'Follow-up': 'st-followup',
    'Interested': 'st-interested',
    'Qualified': 'st-qualified',
    'Converted': 'st-converted',
    'Lost': 'st-lost'
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
  palette: ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#ec4899', '#14b8a6', '#ef4444', '#64748b', '#f97316'],

  staff: [
    { id: 'S001', name: 'Dr. Suhail', role: 'Founder', sourceCentre: 'all', reportsTo: null, profile: 'star-performer' },
    { id: 'S002', name: 'Vanshta Verma', role: 'BranchManager', sourceCentre: 'Delhi Office', reportsTo: 'S001', profile: 'high-performer' },
    { id: 'S003', name: 'Raunaq', role: 'BranchManager', sourceCentre: 'Delhi 2026', reportsTo: 'S001', profile: 'medium-performer' },
    { id: 'S004', name: 'Dr. Roshan', role: 'BranchManager', sourceCentre: 'Nagpur 2026', reportsTo: 'S001', profile: 'high-performer' },
    { id: 'S005', name: 'Kunal Taswala', role: 'BranchManager', sourceCentre: 'Raipur Office', reportsTo: 'S001', profile: 'medium-performer' },
    { id: 'S006', name: 'Hemant Vaidya', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'star-performer' },
    { id: 'S007', name: 'Firdauss', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S008', name: 'Mehak Khan', role: 'TeamLead', sourceCentre: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S009', name: 'Monty Sharma', role: 'TeamLead', sourceCentre: 'Delhi 2026', reportsTo: 'S003', profile: 'medium-performer' },
    { id: 'S010', name: 'Adhira Saxena', role: 'Counsellor', sourceCentre: 'Delhi 2026', reportsTo: 'S009', profile: 'star-performer' },
    { id: 'S011', name: 'Vimlesh Tiwari', role: 'Counsellor', sourceCentre: 'Nagpur 2026', reportsTo: 'S004', profile: 'low-performer' },
    { id: 'S012', name: 'Gargi Raparia', role: 'Counsellor', sourceCentre: 'Nagpur 2026', reportsTo: 'S004', profile: 'high-performer' },
    { id: 'S013', name: 'Brinder Singh', role: 'Counsellor', sourceCentre: 'Nagpur 2026', reportsTo: 'S004', profile: 'medium-performer' },
    { id: 'S014', name: 'Sofiya Khan', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'low-performer' },
    { id: 'S015', name: 'Payal Shankhwar', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'medium-performer' },
    { id: 'S016', name: 'Aditya Gangwani', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'star-performer' },
    { id: 'S017', name: 'Heena Bandhe', role: 'Counsellor', sourceCentre: 'Raipur Office', reportsTo: 'S005', profile: 'high-performer' }
  ],

  firstNames: ['Aarav','Priya','Rohan','Ananya','Vikram','Sneha','Kabir','Ishita','Arjun','Meera','Dev','Riya','Aditya','Kavya','Rahul','Neha','Sahil','Pooja','Karan','Divya','Nikhil','Sanya','Yash','Tanya','Aryan','Simran','Varun','Nisha','Manav','Alisha','Rohit','Preeti','Siddharth','Radhika','Harsh','Anjali','Vivek','Shreya','Amit','Kriti'],
  lastNames: ['Sharma','Verma','Iyer','Nair','Reddy','Gupta','Malhotra','Kapoor','Chatterjee','Menon','Joshi','Bhat','Rao','Singh','Patel','Mehta','Chawla','Bose','Pillai','Kulkarni'],
  guardianSuffixes: ['Father', 'Mother'],
  emailProviders: ['gmail.com', 'yahoo.com', 'outlook.com', 'rediffmail.com', 'hotmail.com'],
  statusOrder: { 'New': 0, 'Contacted': 1, 'Follow-up': 2, 'Interested': 3, 'Qualified': 4, 'Converted': 5, 'Lost': -1 },

  callOutcomes: ['Interested', 'Not Interested', 'Busy', "Didn't Answer", 'Call Back Later', 'Wrong Number'],
  objectionReasons: ['Budget Constraints', 'Parents Not Convinced', 'Government College Preference', 'Joined Another Consultancy', 'Different Country Preference', 'Did Not Qualify NEET', 'Not Interested Anymore', 'No Response', 'Wants to Apply Next Year', 'Other']
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

function generateLeadsData(staff, count) {
  const leads = [];

  const sourceWeights = [
    { source: 'Facebook Ads', volumeWeight: 0.38, baseConv: 0.05 },
    { source: 'Google Ads', volumeWeight: 0.18, baseConv: 0.12 },
    { source: 'Instagram', volumeWeight: 0.15, baseConv: 0.08 },
    { source: 'Website', volumeWeight: 0.10, baseConv: 0.24 },
    { source: 'Referral', volumeWeight: 0.06, baseConv: 0.35 },
    { source: 'Walk-in', volumeWeight: 0.05, baseConv: 0.20 },
    { source: 'Agent Partner', volumeWeight: 0.05, baseConv: 0.15 },
    { source: 'Education Fair', volumeWeight: 0.03, baseConv: 0.10 }
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
    'Delhi Office': Math.floor(count * 0.44),
    'Delhi 2026': Math.floor(count * 0.26),
    'Nagpur 2026': Math.floor(count * 0.18),
    'Raipur Office': Math.floor(count * 0.12)
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

      let convProb = sw.baseConv;
      const profileBonus = { 'star-performer': 0.20, 'high-performer': 0.10, 'medium-performer': 0.04, 'low-performer': -0.04 };
      convProb += (profileBonus[assignee.profile] || 0);
      if (centre === 'Delhi Office') convProb += 0.04;
      if (centre === 'Raipur Office') convProb -= 0.02;
      convProb = Math.max(0.02, Math.min(0.85, convProb));

      let status = 'New';
      let rStatus = seededRandom();
      if (rStatus < convProb) {
        status = 'Converted';
      } else if (rStatus > 0.86) {
        status = 'Lost';
      } else {
        const openStatuses = ['New', 'Contacted', 'Follow-up', 'Interested', 'Qualified'];
        const weights = [0.10, 0.20, 0.25, 0.25, 0.20];
        let w = seededRandom();
        let cum = 0;
        for (let s = 0; s < openStatuses.length; s++) {
          cum += weights[s];
          if (w <= cum) { status = openStatuses[s]; break; }
        }
      }

      const isTodayLead = seededRandom() < 0.04;
      const daysAgo = isTodayLead ? randInt(0, 1) : randInt(2, 120);
      const assignedDate = addDays(CFG.today, -daysAgo);

      const firstName = pick(CFG.firstNames);
      const lastName = pick(CFG.lastNames);
      const studentName = firstName + ' ' + lastName;

      const state = pick(CFG.states);
      const city = randInt(0, 3) === 0 ? state : pick(CFG.cities);
      const examCity = pick(CFG.examCities);
      const category = pick(CFG.categories);
      const neetAppeared = seededRandom() < 0.7 ? 'Yes' : 'No';
      const guardianName = pick(CFG.guardianSuffixes) + ' of ' + studentName;
      const guardianPhone = '99' + String(randInt(10000000, 99999999));
      const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + randInt(10, 99) + '@' + pick(CFG.emailProviders);

      const nextFollowUp = (status !== 'Converted' && status !== 'Lost' && seededRandom() < 0.6)
        ? addDays(assignedDate, randInt(3, 30))
        : null;

      const callAttempts = (status === 'Converted') ? randInt(5, 15) :
                           (status === 'Lost') ? randInt(3, 10) :
                           (status === 'New') ? randInt(0, 2) : randInt(2, 8);

      const progressed = status !== 'New' && status !== 'Lost';
      const applicationFiled = status === 'Converted' ? 'Yes' :
                                (progressed && seededRandom() < 0.30 ? 'Yes' : 'No');

      const lastActivityDate = addDays(assignedDate, randInt(0, Math.min(daysAgo, 5)));

      leads.push({
        id: 'LD-' + leadIdCounter++,
        studentName: studentName,
        phone: '98' + String(randInt(10000000, 99999999)),
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        email: email,
        city: city,
        state: state,
        examCity: examCity,
        category: category,
        neetAppeared: neetAppeared,
        source: source,
        sourceCentre: centre,
        operator: assignee.name,
        status: status,
        counsellorId: assignee.id,
        counsellorName: assignee.name,
        assignedDate: assignedDate,
        lastActivityDate: lastActivityDate,
        nextFollowUp: nextFollowUp,
        callAttempts: callAttempts,
        applicationFiled: applicationFiled,
        converted: status === 'Converted',
        lost: status === 'Lost',
        callOutcome: null,
        objectionReason: null,
        objectionRemarks: null,
        firstContactDateTime: null
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
        if (l.assignedDate) l.assignedDate = new Date(l.assignedDate);
        if (l.nextFollowUp) l.nextFollowUp = new Date(l.nextFollowUp);
        if (l.lastActivityDate) l.lastActivityDate = new Date(l.lastActivityDate);
        if (l.firstContactDateTime) l.firstContactDateTime = new Date(l.firstContactDateTime);
      });
      const demo = getInitialDataset();
      return { leads: leads, staff: demo.staff, sourceCentres: demo.sourceCentres, sources: demo.sources };
    }
  } catch (e) {}
  return null;
}

window.IntelAbroadData = getPersistedDataset() || getInitialDataset();
