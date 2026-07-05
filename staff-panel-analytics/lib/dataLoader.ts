import * as XLSX from 'xlsx';
import { Lead, StaffMember } from './types';

export const DataLoader = {
  normalizeStatus(s: string): string {
    if (!s) return '';
    const statusMap: Record<string, string> = {
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
    };
    const key = s.toLowerCase().trim();
    return statusMap[key] || (key.charAt(0).toUpperCase() + key.slice(1));
  },

  normalizeCounsellorName(s: string): string {
    return String(s || '').trim();
  },

  parseDate(val: any): Date | null {
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

  parseNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  },

  transformData(rows: any[]): Lead[] {
    let idCounter = 1;
    const leads: Lead[] = [];

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

      const entryDate = this.parseDate(row['Entry Date'] || row['entryDate'] || row['Date'] || row['date']) || new Date();
      const updatedDate = this.parseDate(row['Updated Date'] || row['updatedDate'] || row['Last Activity Date Time'] || row['lastActivityDateTime']) || entryDate;

      const lead: Lead = {
        id: 'XL-' + String(++idCounter).padStart(4, '0'),
        studentName: String(row['Name'] || row['name'] || '').trim(),
        phone: String(row['Phone'] || row['phone'] || '').trim(),
        guardianName: String(row['Guardian Name'] || row['guardianName'] || '').trim(),
        guardianPhone: String(row['Guardian Phone'] || row['guardianPhone'] || '').trim(),
        status: status,
        counsellorName: counsellorName,
        counsellorId: counsellorId,
        entryDate: entryDate,
        followUpDate: this.parseDate(row['Follow-up Date'] || row['followUpDate'] || row['Next Follow-up'] || row['nextFollowUp']),
        calls: this.parseNumber(row['Calls'] || row['calls'] || row['Call Attempts'] || row['callAttempts']),
        lastCallStatus: String(row['Last Call Status'] || row['lastCallStatus'] || row['Call Outcome'] || row['callOutcome'] || '').trim() || null,
        notes: String(row['Notes'] || row['notes'] || '').trim(),
        updatedDate: updatedDate,
        city: city,
        state: state,
        neet: String(row['NEET'] || row['neet'] || '').trim(),
        pcbPercentage: this.parseNumber(row['PCB %'] || row['pcbPercentage'] || row['PCB'] || ''),
        preferredCountry: preferredCountry,
        preferredUniversity: preferredUniversity,
        source: String(row['Source'] || row['source'] || '').trim() || 'Imported',
        sourceCentre: String(row['Source Centre'] || row['sourceCentre'] || '').trim() || 'Other',
        fee: this.parseNumber(row['Fee'] || row['fee'] || ''),
        visa: String(row['Visa'] || row['visa'] || '').trim(),
        activityLog: [{ date: entryDate, type: 'Created', details: 'Lead imported from spreadsheet' }]
      };

      if (lead.studentName || lead.phone) {
        leads.push(lead);
      }
    });

    return leads;
  },

  generateStaffFromData(leads: Lead[], existingStaff: StaffMember[]): StaffMember[] {
    const nameMap = new Map<string, StaffMember>();
    existingStaff.forEach(s => nameMap.set(s.name, s));

    const counsellorMap = new Map<string, { name: string, centreCounts: Record<string, number> }>();
    leads.forEach(l => {
      if (!l.counsellorName || l.counsellorName === 'Unassigned' || l.counsellorName === 'unassigned') return;
      const key = l.counsellorName;
      if (!counsellorMap.has(key)) {
        counsellorMap.set(key, { name: key, centreCounts: {} });
      }
      const record = counsellorMap.get(key)!;
      const sc = l.sourceCentre || 'Unknown';
      record.centreCounts[sc] = (record.centreCounts[sc] || 0) + 1;
    });

    const generated: StaffMember[] = [];
    counsellorMap.forEach((record, name) => {
      if (nameMap.has(name)) {
        generated.push({ ...nameMap.get(name)! });
      } else {
        const centres = Object.entries(record.centreCounts)
          .sort((a, b) => b[1] - a[1]);
        const mainCentre = centres.length ? centres[0][0] : 'Delhi Office';
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
  }
};
