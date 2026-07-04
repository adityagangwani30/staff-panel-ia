const DataLoader = {
  source: 'demo',
  fileName: null,
  rawHeaders: [],

  COLUMN_MAP: {
    'Date': 'assignedDate',
    'Name': 'studentName',
    'Phone': 'phone',
    'Guardian Name': 'guardianName',
    'Guardian Phone': 'guardianPhone',
    'Email': 'email',
    'City': 'city',
    'State': 'state',
    'Exam City': 'examCity',
    'Category': 'category',
    'NEET Appeared': 'neetAppeared',
    'Source': 'source',
    'Source Centre': 'sourceCentre',
    'Operator': 'operator',
    'Status': 'status',
    'Assigned To': 'counsellorName',
    'Next Follow-up': 'nextFollowUpRaw',
    'Call Attempts': 'callAttempts',
    'Application Filed': 'applicationFiled',
    'Call Outcome': 'callOutcome',
    'Objection Reason': 'objectionReason',
    'Objection Remarks': 'objectionRemarks',
    'First Contact Date Time': 'firstContactDateTime',
    'Last Activity Date Time': 'lastActivityDateTime'
  },

  STATUS_MAP: {
    'new': 'New',
    'lost': 'Lost',
    'warm_lead': 'Contacted',
    'cold_lead': 'New',
    'interested': 'Interested',
    'hot_lead': 'Qualified',
    'call_back': 'Follow-up',
    'enrolled': 'Converted'
  },

  normalizeStatus(s) {
    if (!s) return '';
    const key = s.toLowerCase().trim();
    return this.STATUS_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1));
  },

  normalizeCounsellorName(s) {
    return String(s || '').trim();
  },

  parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          this.rawHeaders = json.length ? Object.keys(json[0]) : [];
          const leads = this.transformData(json);
          const meta = this.extractMetadata(json);
          resolve({ leads, meta, rowCount: json.length });
        } catch (err) {
          reject(new Error('Failed to parse file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  },

  transformData(rows) {
    const leads = [];
    let idCounter = 1;

    rows.forEach((row, idx) => {
      const status = this.normalizeStatus(row['Status'] || row['status'] || '');
      const counsellorName = this.normalizeCounsellorName(row['Assigned To'] || row['assignedTo'] || '');
      const counsellorId = counsellorName && counsellorName !== 'Unassigned'
        ? 'CS-' + counsellorName.replace(/\s+/g, '').substring(0, 8)
        : 'CS-UNASSIGNED';

      const lead = {
        id: 'XL-' + String(++idCounter).padStart(4, '0'),
        studentName: String(row['Name'] || row['name'] || '').trim(),
        phone: String(row['Phone'] || row['phone'] || '').trim(),
        guardianName: String(row['Guardian Name'] || row['guardianName'] || '').trim(),
        guardianPhone: String(row['Guardian Phone'] || row['guardianPhone'] || '').trim(),
        email: String(row['Email'] || row['email'] || '').trim(),
        city: String(row['City'] || row['city'] || '').trim(),
        state: String(row['State'] || row['state'] || '').trim(),
        examCity: String(row['Exam City'] || row['examCity'] || '').trim(),
        category: String(row['Category'] || row['category'] || '').trim(),
        neetAppeared: String(row['NEET Appeared'] || row['neetAppeared'] || '').trim(),
        source: String(row['Source'] || row['source'] || '').trim(),
        sourceCentre: String(row['Source Centre'] || row['sourceCentre'] || '').trim(),
        operator: String(row['Operator'] || row['operator'] || '').trim(),
        status: status,
        counsellorName: counsellorName,
        counsellorId: counsellorId,
        assignedDate: this.parseDate(row['Date'] || row['assignedDate'] || row['date']),
        nextFollowUp: this.parseDate(row['Next Follow-up'] || row['nextFollowUp'] || row['nextFollowUpRaw']),
        callAttempts: this.parseNumber(row['Call Attempts'] || row['callAttempts']),
        applicationFiled: this.parseYesNo(row['Application Filed'] || row['applicationFiled']),
        lastActivityDate: null,
        converted: false,
        lost: false,
        callOutcome: null,
        objectionReason: null,
        objectionRemarks: null,
        firstContactDateTime: null
      };

      lead.converted = lead.status === 'Converted';
      lead.lost = lead.status === 'Lost';
      lead.lastActivityDate = lead.assignedDate || null;

      const outcomeRaw = String(row['Call Outcome'] || row['callOutcome'] || '').trim();
      if (outcomeRaw) lead.callOutcome = outcomeRaw;
      const objReasonRaw = String(row['Objection Reason'] || row['objectionReason'] || '').trim();
      if (objReasonRaw) lead.objectionReason = objReasonRaw;
      const objRemarksRaw = String(row['Objection Remarks'] || row['objectionRemarks'] || '').trim();
      if (objRemarksRaw) lead.objectionRemarks = objRemarksRaw;
      const fcdt = this.parseDate(row['First Contact Date Time'] || row['firstContactDateTime'] || row['firstContactDate'] || '');
      if (fcdt) lead.firstContactDateTime = fcdt;
      const ladt = this.parseDate(row['Last Activity Date Time'] || row['lastActivityDateTime'] || row['lastActivityDate'] || '');
      if (ladt) lead.lastActivityDate = ladt;

      if (lead.studentName || lead.phone) {
        leads.push(lead);
      }
    });

    return leads;
  },

  extractMetadata(rows) {
    const unique = (field) => {
      const vals = new Set();
      rows.forEach(r => {
        const v = String(r[field] || '').trim();
        if (v) vals.add(v);
      });
      return Array.from(vals).sort();
    };

    return {
      statuses: unique('Status'),
      counsellors: unique('Assigned To'),
      sources: unique('Source'),
      sourceCentres: unique('Source Centre'),
      categories: unique('Category'),
      cities: unique('City'),
      states: unique('State'),
      examCities: unique('Exam City')
    };
  },

  generateStaffFromData(leads, existingStaff) {
    const nameMap = new Map();
    existingStaff.forEach(s => nameMap.set(s.name, s));

    const counsellorMap = new Map();
    leads.forEach(l => {
      if (!l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorName === 'unassigned') return;
      const key = l.counsellorName;
      if (!counsellorMap.has(key)) {
        counsellorMap.set(key, { name: key, centreCounts: {} });
      }
      const record = counsellorMap.get(key);
      const sc = l.sourceCentre || 'Unknown';
      record.centreCounts[sc] = (record.centreCounts[sc] || 0) + 1;
    });

    const generated = [];
    counsellorMap.forEach((record, name) => {
      if (nameMap.has(name)) {
        const demo = nameMap.get(name);
        generated.push({ ...demo });
      } else {
        const centres = Object.entries(record.centreCounts)
          .sort((a, b) => b[1] - a[1]);
        const mainCentre = centres.length ? centres[0][0] : 'Unknown';
        const id = 'CS-' + name.replace(/\s+/g, '').substring(0, 8);
        generated.push({
          id: id,
          name: name,
          role: 'Counsellor',
          sourceCentre: mainCentre,
          reportsTo: null,
          profile: 'medium-performer'
        });
      }
    });

    return generated;
  },

  applyDataset(leads, meta) {
    window.IntelAbroadData.leads = leads;

    const demoStaff = window.IntelAbroadData._demoStaff || window.IntelAbroadData.staff || [];
    if (!window.IntelAbroadData._demoStaff) {
      window.IntelAbroadData._demoStaff = JSON.parse(JSON.stringify(demoStaff));
    }

    const newStaff = this.generateStaffFromData(leads, window.IntelAbroadData._demoStaff);
    window.IntelAbroadData.staff = newStaff;

    if (meta) {
      if (meta.statuses && meta.statuses.length) {
        const order = ['New', 'Contacted', 'Follow-up', 'Interested', 'Qualified', 'Converted', 'Lost'];
        const normalized = [...new Set(meta.statuses.map(s => this.normalizeStatus(s)).filter(Boolean))];
        normalized.sort((a, b) => {
          const ai = order.indexOf(a), bi = order.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        CFG.statuses = normalized;
      }
      if (meta.sources && meta.sources.length) window.IntelAbroadData.sources = meta.sources;
      if (meta.sourceCentres && meta.sourceCentres.length) window.IntelAbroadData.sourceCentres = meta.sourceCentres;
    }

    this.source = 'excel';
  },

  async loadFromDefaultUrl(url) {
    const csvUrl = url || './leads-export-2026-07-04.csv';
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('File not found: ' + csvUrl);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    this.rawHeaders = json.length ? Object.keys(json[0]) : [];
    const leads = this.transformData(json);
    const meta = this.extractMetadata(json);
    this.applyDataset(leads, meta);
    this.source = 'excel';
    this.fileName = csvUrl.split('/').pop();
    return { leads, meta, rowCount: json.length };
  },

  resetToDemo() {
    const demoData = getInitialDataset();
    window.IntelAbroadData.leads = demoData.leads;
    window.IntelAbroadData.staff = window.IntelAbroadData._demoStaff
      ? JSON.parse(JSON.stringify(window.IntelAbroadData._demoStaff))
      : demoData.staff;
    window.IntelAbroadData.sources = demoData.sources;
    window.IntelAbroadData.sourceCentres = demoData.sourceCentres;
    CFG.statuses = ['New', 'Contacted', 'Follow-up', 'Interested', 'Qualified', 'Converted', 'Lost'];
    this.source = 'demo';
    this.fileName = null;
    this.rawHeaders = [];
    try { localStorage.removeItem('intelabroad_leads'); } catch (e) {}
  },

  parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
      const d = new Date((val - 25569) * 86400 * 1000);
      if (!isNaN(d.getTime())) return d;
    }
    const s = String(val).trim();
    if (!s) return null;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const parts = s.split(/[/\-\.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      if (a > 1900) return new Date(a, (b || 1) - 1, c || 1);
      if (c > 1900) return new Date(c, (a || 1) - 1, b || 1);
    }
    return null;
  },

  parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  },

  parseYesNo(val) {
    if (!val) return 'No';
    const s = String(val).trim().toLowerCase();
    if (s === 'yes' || s === 'y' || s === '1' || s === 'true') return 'Yes';
    return 'No';
  }
};

window.DataLoader = DataLoader;
