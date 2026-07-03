/* ============================================================
   REALISTIC DEMO DATA GENERATOR — IntelAbroad Staff Panel
   ============================================================ */

const CFG = {
  today: new Date('2026-07-03T09:00:00'),
  branches: ['Delhi Office', 'Delhi 2026', 'Nagpur 2026', 'Raipur Office'],
  sources: ['Facebook Ads', 'Google Ads', 'Instagram', 'Referral', 'Walk-in', 'Website', 'Education Fair', 'Agent Partner'],
  statuses: ['New', 'Contacted', 'Follow-up', 'Qualified', 'Converted', 'Lost'],
  funnelStages: ['New', 'Contacted', 'Follow-up', 'Qualified', 'Converted'],
  statusClass: {
    'New': 'st-new',
    'Contacted': 'st-contacted',
    'Follow-up': 'st-followup',
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
  
  // Specific organizational hierarchy
  staff: [
    { id: 'S001', name: 'Dr. Suhail', role: 'Founder', branch: 'all', reportsTo: null, profile: 'star-performer' },
    
    { id: 'S002', name: 'Vanshta Verma', role: 'BranchManager', branch: 'Delhi Office', reportsTo: 'S001', profile: 'high-performer' },
    { id: 'S003', name: 'Raunaq', role: 'BranchManager', branch: 'Delhi 2026', reportsTo: 'S001', profile: 'medium-performer' },
    { id: 'S004', name: 'Dr. Roshan', role: 'BranchManager', branch: 'Nagpur 2026', reportsTo: 'S001', profile: 'high-performer' },
    { id: 'S005', name: 'Kunal Taswala', role: 'BranchManager', branch: 'Raipur Office', reportsTo: 'S001', profile: 'medium-performer' },
    
    { id: 'S006', name: 'Hemant Vaidya', role: 'TeamLead', branch: 'Delhi Office', reportsTo: 'S002', profile: 'star-performer' },
    { id: 'S007', name: 'Firdauss', role: 'TeamLead', branch: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S008', name: 'Mehak Khan', role: 'TeamLead', branch: 'Delhi Office', reportsTo: 'S002', profile: 'medium-performer' },
    { id: 'S009', name: 'Monty Sharma', role: 'TeamLead', branch: 'Delhi 2026', reportsTo: 'S003', profile: 'medium-performer' },
    
    { id: 'S010', name: 'Adhira Saxena', role: 'Counsellor', branch: 'Delhi 2026', reportsTo: 'S009', profile: 'star-performer' },
    
    { id: 'S011', name: 'Vimlesh Tiwari', role: 'Counsellor', branch: 'Nagpur 2026', reportsTo: 'S004', profile: 'low-performer' },
    { id: 'S012', name: 'Gargi Raparia', role: 'Counsellor', branch: 'Nagpur 2026', reportsTo: 'S004', profile: 'high-performer' },
    { id: 'S013', name: 'Brinder Singh', role: 'Counsellor', branch: 'Nagpur 2026', reportsTo: 'S004', profile: 'medium-performer' },
    
    { id: 'S014', name: 'Sofiya Khan', role: 'Counsellor', branch: 'Raipur Office', reportsTo: 'S005', profile: 'low-performer' },
    { id: 'S015', name: 'Payal Shankhwar', role: 'Counsellor', branch: 'Raipur Office', reportsTo: 'S005', profile: 'medium-performer' },
    { id: 'S016', name: 'Aditya Gangwani', role: 'Counsellor', branch: 'Raipur Office', reportsTo: 'S005', profile: 'star-performer' },
    { id: 'S017', name: 'Heena Bandhe', role: 'Counsellor', branch: 'Raipur Office', reportsTo: 'S005', profile: 'high-performer' }
  ],

  firstNames: ['Aarav','Priya','Rohan','Ananya','Vikram','Sneha','Kabir','Ishita','Arjun','Meera','Dev','Riya','Aditya','Kavya','Rahul','Neha','Sahil','Pooja','Karan','Divya','Nikhil','Sanya','Yash','Tanya','Aryan','Simran','Varun','Nisha','Manav','Alisha','Rohit','Preeti','Siddharth','Radhika','Harsh','Anjali','Vivek','Shreya','Amit','Kriti'],
  lastNames: ['Sharma','Verma','Iyer','Nair','Reddy','Gupta','Malhotra','Kapoor','Chatterjee','Menon','Joshi','Bhat','Rao','Singh','Patel','Mehta','Chawla','Bose','Pillai','Kulkarni'],

  // Lead management CRM — no admission/visa fields
};

let _seed = 98765;
function seededRandom() {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;
  _seed = (a * _seed + c) % m;
  return _seed / (m - 1);
}

function randRange(min, max) {
  return seededRandom() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
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

  // Map counts per branch
  const branchLeadsCount = {
    'Delhi Office': Math.floor(count * 0.44),
    'Delhi 2026': Math.floor(count * 0.26),
    'Nagpur 2026': Math.floor(count * 0.18),
    'Raipur Office': Math.floor(count * 0.12)
  };

  // Group staff assignees by branch
  // Founder (S001) does not get direct lead assignments, others do.
  const branchStaff = {};
  staff.forEach(s => {
    if (s.id === 'S001') return;
    if (!branchStaff[s.branch]) branchStaff[s.branch] = [];
    branchStaff[s.branch].push(s);
  });

  const staffWorkloads = {};
  staff.forEach(s => { staffWorkloads[s.id] = 0; });

  let leadIdCounter = 6110;

  CFG.branches.forEach(branch => {
    const branchCount = branchLeadsCount[branch] || 25;
    const branchSList = branchStaff[branch] || [];
    if (branchSList.length === 0) return;

    for (let i = 0; i < branchCount; i++) {
      const sw = getWeightedSource();
      const source = sw.source;
      
      // Counsellor assignment based on workload distribution
      let assignee;
      let r = seededRandom();
      if (r < 0.45) {
        assignee = branchSList.find(s => s.profile === 'star-performer') || branchSList[0];
      } else if (r < 0.80) {
        assignee = branchSList.find(s => s.profile === 'high-performer') || branchSList[0];
      } else if (r < 0.95) {
        assignee = branchSList.find(s => s.profile === 'medium-performer') || branchSList[0];
      } else {
        assignee = branchSList.find(s => s.profile === 'low-performer') || branchSList[0];
      }

      staffWorkloads[assignee.id]++;

      let convProb = sw.baseConv;
      if (assignee.profile === 'star-performer') convProb += 0.20;
      else if (assignee.profile === 'high-performer') convProb += 0.10;
      else if (assignee.profile === 'medium-performer') convProb += 0.04;
      else convProb -= 0.04;

      if (branch === 'Delhi Office') convProb += 0.04;
      if (branch === 'Raipur Office') convProb -= 0.02;

      convProb = Math.max(0.02, Math.min(0.85, convProb));

      let status = 'New';
      let rStatus = seededRandom();

      if (rStatus < convProb) {
        status = 'Converted';
      } else if (rStatus > 0.86) {
        status = 'Lost';
      } else {
        const openStatusChoices = ['Contacted', 'Follow-up', 'Qualified'];
        let w = seededRandom();
        if (w < 0.15) status = 'New';
        else if (w < 0.35) status = 'Contacted';
        else if (w < 0.65) status = 'Follow-up';
        else status = 'Qualified';
      }

      const daysAgo = randInt(2, 120);
      const assignedDate = addDays(CFG.today, -daysAgo);

      const contacted = status !== 'New';
      let responseHours = null;
      let firstContactDate = null;
      if (contacted) {
        let baseResponse = randRange(1, 14);
        const workloadCount = staffWorkloads[assignee.id];
        baseResponse += workloadCount * 0.45; 
        
        if (assignee.profile === 'star-performer') baseResponse *= 0.55;
        else if (assignee.profile === 'low-performer') baseResponse *= 2.0;

        responseHours = Math.max(0.2, baseResponse);
        firstContactDate = addHours(assignedDate, responseHours);
      }

      // Follow-ups
      const followUps = [];
      let followUpCount = 0;
      if (daysAgo > 8) {
        followUpCount = randInt(1, Math.min(6, Math.floor(daysAgo / 6)));
      }
      
      for (let f = 0; f < followUpCount; f++) {
        const due = addDays(assignedDate, randInt(2, Math.max(3, daysAgo - 1)));
        const completed = due < CFG.today ? (assignee.profile === 'star-performer' ? seededRandom() < 0.92 : (assignee.profile === 'low-performer' ? seededRandom() < 0.45 : seededRandom() < 0.78)) : false;
        followUps.push({
          dueDate: due,
          completed: completed,
          completedDate: completed ? addDays(due, randInt(0, 2)) : null
        });
      }

      // Calls
      const calls = [];
      let callCount = contacted ? randInt(1, 5) : 0;
      if (status === 'Converted') callCount = randInt(3, 7);
      for (let c = 0; c < callCount; c++) {
        calls.push({
          date: addDays(assignedDate, randInt(0, daysAgo)),
          durationMin: randInt(1, 15),
          outcome: pick(['Connected', 'No Answer', 'Follow-up Scheduled', 'Interested', 'Busy'])
        });
      }

      let whatsAppCount = 0;
      if (contacted) {
        whatsAppCount = randInt(3, 12);
        if (status === 'Converted') whatsAppCount = randInt(15, 35);
      }

      // Activity logs
      const activityLog = [];
      const actTypes = ['Call', 'WhatsApp', 'Email', 'Status Change', 'Meeting', 'Note'];
      const activityCount = randInt(2, 6);
      for (let a = 0; a < activityCount; a++) {
        activityLog.push({
          date: addDays(assignedDate, randInt(0, daysAgo)),
          type: pick(actTypes),
          note: 'Counsellor logged lead activity'
        });
      }
      activityLog.sort((a,b) => a.date - b.date);

      const lastActivityDate = activityLog.length ? activityLog[activityLog.length - 1].date : assignedDate;

      leads.push({
        id: 'LD-' + leadIdCounter++,
        studentName: pick(CFG.firstNames) + ' ' + pick(CFG.lastNames),
        phone: '98' + String(randInt(10000000, 99999999)),
        branch: branch,
        counsellorId: assignee.id,
        counsellorName: assignee.name,
        source: source,
        status: status,
        assignedDate: assignedDate,
        firstContactDate: firstContactDate,
        lastActivityDate: lastActivityDate,
        converted: status === 'Converted',
        lost: status === 'Lost',
        responseTimeHours: responseHours,
        followUps: followUps,
        calls: calls,
        whatsAppCount: whatsAppCount,
        activityLog: activityLog
      });
    }
  });

  return leads;
}

function getInitialDataset() {
  _seed = 98765;

  const staffList = CFG.staff.map(s => {
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      branch: s.branch,
      reportsTo: s.reportsTo,
      profile: s.profile
    };
  });

  const leads = generateLeadsData(staffList, 640);

  return {
    staff: staffList,
    leads: leads,
    branches: CFG.branches,
    sources: CFG.sources
  };
}

window.IntelAbroadData = getInitialDataset();
