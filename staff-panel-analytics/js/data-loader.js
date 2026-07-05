const DataLoader = {
  source: 'demo',
  fileName: null,
  rawHeaders: [],

  COLUMN_MAP: {
    'Entry Date': 'entryDate',
    'Name': 'studentName',
    'Phone': 'phone',
    'Guardian Name': 'guardianName',
    'Guardian Phone': 'guardianPhone',
    'Status': 'status',
    'Assigned To': 'counsellorName',
    'Follow-up Date': 'followUpDate',
    'Calls': 'calls',
    'Last Call Status': 'lastCallStatus',
    'Notes': 'notes',
    'Updated Date': 'updatedDate',
    'City / State': 'cityState',
    'NEET': 'neet',
    'PCB %': 'pcbPercentage',
    'Preferred Country / University': 'countryUni',
    'Source': 'source',
    'Fee': 'fee',
    'Visa': 'visa'
  },

  STATUS_MAP: {
    'dnp 1': 'DNP 1',
    'dnp 2': 'DNP 2',
    'dnp 3': 'DNP 3',
    'dnp 4': 'DNP 4',
    'dnp 5': 'DNP 5',
    'natc': 'NATC',
    'cold lead': 'Cold Lead',
    'cold': 'Cold Lead',
    'warm lead': 'Warm Lead',
    'warm': 'Warm Lead',
    'hot lead': 'Hot Lead',
    'hot': 'Hot Lead',
    'call back': 'Call Back',
    'callback': 'Call Back',
    'interested': 'Interested',
    'consultation booked': 'Consultation Booked',
    'consultation done': 'Consultation Done',
    'consultation submitted': 'Consultation Submitted',
    'consultation': 'Consultation Booked',
    'documents submitted': 'Documents Submitted',
    'docs submitted': 'Documents Submitted',
    'applied': 'Applied',
    'enrolled': 'Enrolled',
    'lost/dead': 'Lost/Dead',
    'lost': 'Lost/Dead',
    'dead': 'Lost/Dead'
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

    rows.forEach((row) => {
      const status = this.normalizeStatus(row['Status'] || row['status'] || '');
      const counsellorName = this.normalizeCounsellorName(row['Assigned To'] || row['assignedTo'] || '');
      const counsellorId = counsellorName && counsellorName !== 'Unassigned'
        ? 'CS-' + counsellorName.replace(/\s+/g, '').substring(0, 8)
        : 'CS-UNASSIGNED';

      let city = '', state = '';
      const cityStateRaw = String(row['City / State'] || row['cityState'] || '').trim();
      if (cityStateRaw.includes('/')) {
        const parts = cityStateRaw.split('/');
        city = parts[0].trim();
        state = parts[1].trim();
      } else if (cityStateRaw) {
        city = cityStateRaw;
        state = cityStateRaw;
      }

      let preferredCountry = '', preferredUniversity = '';
      const countryUniRaw = String(row['Preferred Country / University'] || row['countryUni'] || '').trim();
      if (countryUniRaw.includes('/')) {
        const parts = countryUniRaw.split('/');
        preferredCountry = parts[0].trim();
        preferredUniversity = parts[1].trim();
      } else {
        preferredCountry = countryUniRaw;
      }

      const lead = {
        id: 'XL-' + String(++idCounter).padStart(4, '0'),
        studentName: String(row['Name'] || row['name'] || '').trim(),
        phone: String(row['Phone'] || row['phone'] || '').trim(),
        guardianName: String(row['Guardian Name'] || row['guardianName'] || '').trim(),
        guardianPhone: String(row['Guardian Phone'] || row['guardianPhone'] || '').trim(),
        status: status,
        counsellorName: counsellorName,
        counsellorId: counsellorId,
        entryDate: this.parseDate(row['Entry Date'] || row['entryDate'] || row['Date'] || row['date']),
        followUpDate: this.parseDate(row['Follow-up Date'] || row['followUpDate'] || row['Next Follow-up'] || row['nextFollowUp']),
        calls: this.parseNumber(row['Calls'] || row['calls'] || row['Call Attempts'] || row['callAttempts']),
        lastCallStatus: String(row['Last Call Status'] || row['lastCallStatus'] || row['Call Outcome'] || row['callOutcome'] || '').trim() || null,
        notes: String(row['Notes'] || row['notes'] || '').trim(),
        updatedDate: this.parseDate(row['Updated Date'] || row['updatedDate'] || row['Last Activity Date Time'] || row['lastActivityDateTime']),
        city: city,
        state: state,
        neet: String(row['NEET'] || row['neet'] || '').trim(),
        pcbPercentage: this.parseNumber(row['PCB %'] || row['pcbPercentage'] || row['PCB'] || ''),
        preferredCountry: preferredCountry,
        preferredUniversity: preferredUniversity,
        source: String(row['Source'] || row['source'] || '').trim(),
        sourceCentre: String(row['Source Centre'] || row['sourceCentre'] || '').trim(),
        fee: this.parseNumber(row['Fee'] || row['fee'] || ''),
        visa: String(row['Visa'] || row['visa'] || '').trim()
      };

      if (!lead.updatedDate) lead.updatedDate = lead.entryDate || null;

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
      sourceCentres: unique('Source Centre')
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
        const order = [
          'DNP 1', 'DNP 2', 'DNP 3', 'DNP 4', 'DNP 5',
          'NATC', 'Cold Lead', 'Warm Lead', 'Hot Lead', 'Call Back',
          'Interested', 'Consultation Booked', 'Consultation Done',
          'Consultation Submitted', 'Documents Submitted', 'Applied',
          'Enrolled', 'Lost/Dead'
        ];
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
  }
};

window.DataLoader = DataLoader;
