# IntelAbroad CRM Analytics — Business Rules & Metric Specification

This document serves as the official product and engineering specification for all metrics, KPIs, pipeline logic, and data dependencies implemented within the IntelAbroad Overview Dashboard.

---

## 1. Core Business Rules

The system logic is governed by these core definitions:

### Rule 1: Active Lead
A lead is classified as **Active** if it is currently inside the admission pipeline and has not reached a terminal success or terminal loss status.
* **Logic**: `Status ≠ "Enrolled" AND Status ≠ "Lost/Dead"`

### Rule 2: Lost Lead
A lead is classified as **Lost/Dead** if it has dropped out of the funnel due to lack of interest, low academic scores, or direct rejection.
* **Logic**: `Status == "Lost/Dead"`

### Rule 3: Overdue Follow-up
An active lead is classified as **Overdue** if it has a scheduled action point date that is earlier than midnight of the current day.
* **Logic**: `Follow-Up Date < Current Day Midnight AND Active Lead`

### Rule 4: Staff Scope Hierarchy
Staff scope is computed recursively to aggregate direct reports:
* **Founder / Owner**: All leads.
* **Branch Manager**: All leads where `Source Centre` matches their assigned centre office.
* **Team Lead**: All leads assigned to their ID or the IDs of counsellors reporting to them.
* **Counsellor**: Only leads assigned to their ID.

---

## 2. Core KPI Definitions

### Metric: Total Leads
* **Purpose**: Measures the absolute size of the lead database.
* **Definition**: Count of all records inside the active scoped dataset.
* **Formula**: `COUNT(All Scoped Leads)`
* **Dataset Columns Used**: `Name` (for identity)
* **Derived Fields Used**: `Staff Scope`
* **Edge Cases**: Division by zero is avoided (defaults to 0).

### Metric: Active Leads
* **Purpose**: Measures the size of the active pipeline.
* **Definition**: Count of all leads currently progressing through admission stages.
* **Formula**: `COUNT(Status ≠ "Enrolled" AND Status ≠ "Lost/Dead")`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: `Active Lead`

### Metric: Enrolled
* **Purpose**: Measures overall business conversion volume.
* **Definition**: Total leads who have completed enrollment.
* **Formula**: `COUNT(Status == "Enrolled")`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: None

### Metric: Conversion Rate
* **Purpose**: Core business performance efficiency score.
* **Definition**: Percentage of assigned leads that completed enrollment.
* **Formula**: `(Enrolled Leads / Total Leads) * 100`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: `Enrolled`, `Total Leads`
* **Edge Cases**: If Total Leads is 0, the Conversion Rate defaults to `0.0%`.

### Metric: Follow-ups Due Today
* **Purpose**: Operational target for the current day.
* **Definition**: Number of leads scheduled for a follow-up action today.
* **Formula**: `COUNT(Follow-Up Date == Today)`
* **Dataset Columns Used**: `Follow-Up Date`
* **Derived Fields Used**: None

### Metric: Overdue Follow-ups
* **Purpose**: Measures workload backup and delayed responses.
* **Definition**: Number of active leads whose follow-up date has passed.
* **Formula**: `COUNT(Follow-Up Date < Today AND Active Lead)`
* **Dataset Columns Used**: `Follow-Up Date`, `Status`
* **Derived Fields Used**: `Active Lead`, `Overdue Follow-up`

### Metric: Average Follow-up Delay
* **Purpose**: Quality assurance metric for task responsiveness.
* **Definition**: The average number of days follow-ups are delayed for overdue leads.
* **Formula**: `SUM(Today - Follow-Up Date) / COUNT(Overdue Follow-ups)`
* **Dataset Columns Used**: `Follow-Up Date`, `Status`
* **Derived Fields Used**: `Overdue Follow-up`, `Active Lead`

### Metric: Consultation Booked
* **Purpose**: Mid-funnel progression volume.
* **Definition**: Number of active leads currently scheduled for a consultation.
* **Formula**: `COUNT(Status == "Consultation Booked" AND Active Lead)`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: `Active Lead`

### Metric: Applications Submitted
* **Purpose**: High-funnel pipeline volume.
* **Definition**: Number of active leads who have submitted their applications.
* **Formula**: `COUNT(Status == "Applied" AND Active Lead)`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: `Active Lead`

### Metric: Unassigned Leads
* **Purpose**: Operational bottleneck indicator.
* **Definition**: Leads that have not been assigned to a counsellor.
* **Formula**: `COUNT(Counsellor Name is Empty OR Counsellor ID == "CS-UNASSIGNED")`
* **Dataset Columns Used**: `Assigned`
* **Derived Fields Used**: None

### Metric: Lost / Dead Leads
* **Purpose**: Measures absolute loss volume.
* **Formula**: `COUNT(Status == "Lost/Dead")`
* **Dataset Columns Used**: `Status`
* **Derived Fields Used**: None

### Metric: 30 / 60 / 90-Day Inactive Leads
* **Purpose**: Re-engagement opportunity identification.
* **Formula**: `COUNT(Last Activity Date <= Today - X Days AND Active Lead)`
* **Dataset Columns Used**: `Updated Date`, `Entry Date`, `Status`
* **Derived Fields Used**: `Active Lead`

---

## 3. Funnel Stages Definition

Leads flow through the pipeline according to a defined order governed by `CFG.statusOrder`:

| Stage | Funnel Order Index | Entry Criterion | Exit Criterion |
|---|---|---|---|
| **Total Leads** | `-999` (Base) | Lead entry. | Exited by transition to `Lost/Dead`. |
| **Interested** | `10` | Student expresses explicit interest. | Promotion to booked consultation. |
| **Consultation Booked** | `11` | Date set for counseling. | Consultation session executed. |
| **Consultation Done** | `12` | Counseling session finished. | Documents uploaded. |
| **Documents Submitted** | `14` | High school transcript and IDs received. | Application submitted to university. |
| **Applied** | `15` | Application sent to institution. | Enrollment fees paid. |
| **Enrolled** | `16` (Terminal Success) | Pay fees and register. | Core pipeline exit (Success). |

*Note: Inactive or DNP leads (index `0`–`9`) are counted under the "Total Leads" stage but have not reached the "Interested" stage.*

---

## 4. Status Definitions

* **DNP 1 to 5 (Did Not Pick)**: Dial attempts completed without answer. Kept in early outreach queue.
* **NATC (Not Answered The Call)**: Contact attempts made, no return response.
* **Cold Lead**: Expressed initial interest but remains passive.
* **Warm Lead**: Responsive lead engaging in discussion.
* **Hot Lead**: Expressed urgent interest or immediate admission request.
* **Call Back**: Scheduled for a telephone return.
* **Interested**: Verified study-abroad goal.
* **Consultation Booked**: Formally scheduled for slot.
* **Consultation Done**: Counseling profile created.
* **Consultation Submitted**: Academic profile sent to admissions.
* **Documents Submitted**: Transcripts received.
* **Applied**: Application active with university.
* **Enrolled**: Fees paid, admission secured.
* **Lost/Dead**: File archived (no longer active).

---

## 5. Filter Specifications

1. **Date Range Filter**: Filters records where the `Entry Date` falls within the boundary.
2. **Staff Selector**: Resolves the scope of matching records based on reporting hierarchy.
3. **Status Filter**: Direct filter matched against `Status`.
4. **Source Filter**: Direct filter matched against `Source`.

*Order of application: Date Filter ➔ Staff Scope Filter ➔ Source Filter ➔ Status Filter.*

---

## 6. Dependency Graph

| Metric | Dataset Columns Required | Derived Fields Used | Business Rules Applied | Output Type |
|---|---|---|---|---|
| **Conversion Rate** | `Status` | `Enrolled`, `Total Leads` | Ratio computation | Percentage (`%`) |
| **Pending Follow-ups** | `Follow-Up Date`, `Status` | `Active Lead` | Boundary limit check | Numeric (`Count`) |
| **Overdue Follow-ups** | `Follow-Up Date`, `Status` | `Active Lead` | Past-due check | Numeric (`Count`) |
| **Avg Follow-up Delay** | `Follow-Up Date`, `Status` | `Active Lead`, `Overdue Leads` | Delay average | Days (`d`) |
| **Inactive Leads** | `Updated Date`, `Status` | `Active Lead` | Days elapsed check | Numeric (`Count`) |
