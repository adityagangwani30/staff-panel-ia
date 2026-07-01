export type Student = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  university: string
  intake: string
  admissionStage: 'Lead' | 'Applied' | 'Under Review' | 'Interview' | 'Accepted' | 'Enrolled' | 'Rejected'
  assignedStaff: string
  assignedCounselor?: string
  priority: 'High' | 'Medium' | 'Low'
  registrationDate: Date
  photo?: string
  personalInfo?: {
    dateOfBirth: string
    nationality: string
    passportNumber: string
    passportExpiry: string
  }
  academicInfo?: {
    degree: string
    gpa: number
    graduationDate: string
  }
}

export type DocumentRecord = {
  id: string
  studentId: string
  name: string
  category: 'Identity' | 'Academic' | 'Financial' | 'Visa' | 'Accommodation'
  status: 'Missing' | 'Uploaded' | 'Under Review' | 'Verified' | 'Rejected' | 'Resubmission Required'
  uploadedAt?: Date
  reviewedAt?: Date
  reviewer?: string
  comments?: string
  expiryDate?: Date
}

export type Task = {
  id: string
  studentId: string
  title: string
  description: string
  dueDate: Date
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Pending' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled'
  assignedTo: string
}

export type Activity = {
  id: string
  studentId: string
  type: 'document_upload' | 'status_change' | 'note_added' | 'task_completed'
  description: string
  timestamp: Date
}

export type Notification = {
  id: string
  type: 'urgent' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export type Application = {
  id: string
  studentId: string
  universityName: string
  programName: string
  applicationDate: Date
  status: 'Draft' | 'Preparing' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'Revision Required'
  applicationFee: number
  notes?: string
  offerLetter?: string
  deadline?: Date
}

export type Payment = {
  id: string
  studentId: string
  type: 'Registration Fee' | 'University Fee' | 'Visa Fee' | 'Hostel Fee' | 'Insurance' | 'Flight Charges'
  amount: number
  currency: string
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  dueDate: Date
  paidDate?: Date
  description: string
}

export type VisaRecord = {
  id: string
  studentId: string
  visaType: string
  applicationDate: Date
  status:
    | 'Document Collection'
    | 'Visa Application'
    | 'Appointment Scheduled'
    | 'Biometrics'
    | 'Interview'
    | 'Visa Approved'
    | 'Visa Issued'
    | 'Travel Ready'
  appointmentDate?: Date
  visaNumber?: string
  expiryDate?: Date
  documents: {
    passportCopy: boolean
    fundingProof: boolean
    accommodationProof: boolean
    medicalCertificate: boolean
    policeNoCrime: boolean
  }
}

export type Communication = {
  id: string
  studentId: string
  type: 'internal_note' | 'counselor_update' | 'email' | 'call'
  author: string
  content: string
  timestamp: Date
  mentions?: string[]
}

export type WorkflowStage = {
  id: string
  name: string
  order: number
  color: string
  isCompleted: boolean
}

export type StaffMember = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Senior Counselor' | 'Counselor' | 'Associate'
  assignedStudentsCount: number
  joinDate: Date
}

export type AutomationRule = {
  id: string
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  isActive: boolean
  createdDate: Date
}

export type SLAMetric = {
  id: string
  name: string
  target: number
  actual: number
  status: 'On Track' | 'At Risk' | 'Breached'
  dueDate: Date
}

export const STUDENT_STAGES = [
  'Lead',
  'Applied',
  'Under Review',
  'Interview',
  'Accepted',
  'Enrolled',
  'Rejected',
] as const

export const TASK_STATUSES = ['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled'] as const
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export const DOCUMENT_STATUSES = [
  'Missing',
  'Uploaded',
  'Under Review',
  'Verified',
  'Rejected',
  'Resubmission Required',
] as const
export const APPLICATION_STATUSES = [
  'Draft',
  'Preparing',
  'Submitted',
  'Under Review',
  'Accepted',
  'Rejected',
  'Revision Required',
] as const
export const PAYMENT_TYPES = [
  'Registration Fee',
  'University Fee',
  'Visa Fee',
  'Hostel Fee',
  'Insurance',
  'Flight Charges',
] as const
export const VISA_STATUSES = [
  'Document Collection',
  'Visa Application',
  'Appointment Scheduled',
  'Biometrics',
  'Interview',
  'Visa Approved',
  'Visa Issued',
  'Travel Ready',
] as const

const STAFF_MEMBERS = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'James Wilson']

const UNIVERSITIES = [
  'Oxford University',
  'Cambridge University',
  'Harvard University',
  'MIT',
  'Stanford University',
  'Yale University',
  'Princeton University',
  'University of Chicago',
]

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'China',
  'Germany',
  'France',
  'Japan',
  'South Korea',
]

export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Arjun',
    lastName: 'Patel',
    email: 'arjun.patel@email.com',
    phone: '+91 98765 43210',
    country: 'India',
    university: 'Oxford University',
    intake: 'Fall 2024',
    admissionStage: 'Accepted',
    assignedStaff: 'Sarah Johnson',
    priority: 'High',
    registrationDate: new Date('2024-01-15'),
    assignedCounselor: 'Sarah Johnson',
    personalInfo: {
      dateOfBirth: '2001-05-20',
      nationality: 'Indian',
      passportNumber: 'A12345678',
      passportExpiry: '2033-05-20',
    },
    academicInfo: {
      degree: 'Bachelor of Engineering',
      gpa: 3.8,
      graduationDate: '2024-06-15',
    },
  },
  {
    id: '2',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@email.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    university: 'Cambridge University',
    intake: 'Spring 2025',
    admissionStage: 'Interview',
    assignedStaff: 'Michael Chen',
    priority: 'High',
    registrationDate: new Date('2024-02-10'),
    assignedCounselor: 'Michael Chen',
    personalInfo: {
      dateOfBirth: '2002-08-10',
      nationality: 'American',
      passportNumber: 'C87654321',
      passportExpiry: '2032-08-10',
    },
    academicInfo: {
      degree: 'Bachelor of Science',
      gpa: 3.9,
      graduationDate: '2024-05-20',
    },
  },
  {
    id: '3',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@email.com',
    phone: '+81 90-1234-5678',
    country: 'Japan',
    university: 'Harvard University',
    intake: 'Fall 2024',
    admissionStage: 'Under Review',
    assignedStaff: 'Emily Rodriguez',
    priority: 'Medium',
    registrationDate: new Date('2024-01-20'),
    assignedCounselor: 'Emily Rodriguez',
    personalInfo: {
      dateOfBirth: '2001-12-05',
      nationality: 'Japanese',
      passportNumber: 'XY9876543',
      passportExpiry: '2031-12-05',
    },
    academicInfo: {
      degree: 'Bachelor of Arts',
      gpa: 3.7,
      graduationDate: '2024-03-15',
    },
  },
  {
    id: '4',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    email: 'liam.oconnor@email.com',
    phone: '+353 87 123 4567',
    country: 'United Kingdom',
    university: 'MIT',
    intake: 'Fall 2024',
    admissionStage: 'Applied',
    assignedStaff: 'James Wilson',
    priority: 'Medium',
    registrationDate: new Date('2024-03-05'),
    assignedCounselor: 'James Wilson',
    personalInfo: {
      dateOfBirth: '2002-03-15',
      nationality: 'Irish',
      passportNumber: 'IE1122334',
      passportExpiry: '2034-03-15',
    },
    academicInfo: {
      degree: 'Bachelor of Engineering',
      gpa: 3.6,
      graduationDate: '2024-06-10',
    },
  },
  {
    id: '5',
    firstName: 'Sofia',
    lastName: 'Mueller',
    email: 'sofia.mueller@email.com',
    phone: '+49 30 12345678',
    country: 'Germany',
    university: 'Stanford University',
    intake: 'Spring 2025',
    admissionStage: 'Accepted',
    assignedStaff: 'Sarah Johnson',
    priority: 'Low',
    registrationDate: new Date('2024-02-28'),
    assignedCounselor: 'Sarah Johnson',
    personalInfo: {
      dateOfBirth: '2001-07-22',
      nationality: 'German',
      passportNumber: 'DE5566778',
      passportExpiry: '2032-07-22',
    },
    academicInfo: {
      degree: 'Bachelor of Science',
      gpa: 3.5,
      graduationDate: '2024-04-20',
    },
  },
  {
    id: '6',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@email.com',
    phone: '+61 2 1234 5678',
    country: 'Australia',
    university: 'Yale University',
    intake: 'Fall 2024',
    admissionStage: 'Enrolled',
    assignedStaff: 'Michael Chen',
    priority: 'Low',
    registrationDate: new Date('2024-01-08'),
    assignedCounselor: 'Michael Chen',
  },
  {
    id: '7',
    firstName: 'Chen',
    lastName: 'Wang',
    email: 'chen.wang@email.com',
    phone: '+86 10 1234 5678',
    country: 'China',
    university: 'Princeton University',
    intake: 'Spring 2025',
    admissionStage: 'Rejected',
    assignedStaff: 'Emily Rodriguez',
    priority: 'Low',
    registrationDate: new Date('2024-03-12'),
    assignedCounselor: 'Emily Rodriguez',
  },
  {
    id: '8',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie.dubois@email.com',
    phone: '+33 1 2345 6789',
    country: 'France',
    university: 'University of Chicago',
    intake: 'Fall 2024',
    admissionStage: 'Interview',
    assignedStaff: 'James Wilson',
    priority: 'High',
    registrationDate: new Date('2024-02-15'),
    assignedCounselor: 'James Wilson',
  },
]

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    studentId: '1',
    title: 'Review visa documents',
    description: 'Verify passport and visa documents',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'task-2',
    studentId: '2',
    title: 'Conduct interview',
    description: 'Schedule and conduct admission interview',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    priority: 'Critical',
    status: 'In Progress',
    assignedTo: 'Michael Chen',
  },
  {
    id: 'task-3',
    studentId: '8',
    title: 'Request additional documents',
    description: 'Request bank statements and proof of funds',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'Medium',
    status: 'Waiting',
    assignedTo: 'James Wilson',
  },
  {
    id: 'task-4',
    studentId: '3',
    title: 'Send acceptance letter',
    description: 'Prepare and send acceptance letter',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'Low',
    status: 'Cancelled',
    assignedTo: 'Emily Rodriguez',
  },
  {
    id: 'task-5',
    studentId: '5',
    title: 'Confirm hostel placement',
    description: 'Verify accommodation and share confirmation with the student',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'Completed',
    assignedTo: 'Sarah Johnson',
  },
]

export const mockDocuments: DocumentRecord[] = [
  {
    id: 'doc-1',
    studentId: '1',
    name: 'Passport Copy',
    category: 'Identity',
    status: 'Verified',
    uploadedAt: new Date('2024-02-01'),
    reviewedAt: new Date('2024-02-03'),
    reviewer: 'Sarah Johnson',
    comments: 'Passport verified and valid through the intake period.',
    expiryDate: new Date('2033-05-20'),
  },
  {
    id: 'doc-2',
    studentId: '1',
    name: 'Bank Statement',
    category: 'Financial',
    status: 'Under Review',
    uploadedAt: new Date('2024-02-10'),
    reviewer: 'Michael Chen',
    comments: 'Awaiting review for sufficiency of funds.',
  },
  {
    id: 'doc-3',
    studentId: '2',
    name: 'IELTS Score Report',
    category: 'Academic',
    status: 'Verified',
    uploadedAt: new Date('2024-02-12'),
    reviewedAt: new Date('2024-02-13'),
    reviewer: 'Emily Rodriguez',
    comments: 'Meets the university requirement.',
  },
  {
    id: 'doc-4',
    studentId: '3',
    name: 'Offer Letter',
    category: 'Academic',
    status: 'Uploaded',
    uploadedAt: new Date('2024-03-01'),
  },
  {
    id: 'doc-5',
    studentId: '4',
    name: 'Proof of Funds',
    category: 'Financial',
    status: 'Resubmission Required',
    uploadedAt: new Date('2024-03-06'),
    reviewedAt: new Date('2024-03-08'),
    reviewer: 'James Wilson',
    comments: 'Need clearer bank balance history with official stamp.',
  },
  {
    id: 'doc-6',
    studentId: '5',
    name: 'Visa Application Form',
    category: 'Visa',
    status: 'Verified',
    uploadedAt: new Date('2024-03-02'),
    reviewedAt: new Date('2024-03-05'),
    reviewer: 'Sarah Johnson',
  },
  {
    id: 'doc-7',
    studentId: '6',
    name: 'Accommodation Confirmation',
    category: 'Accommodation',
    status: 'Missing',
  },
  {
    id: 'doc-8',
    studentId: '8',
    name: 'Medical Certificate',
    category: 'Visa',
    status: 'Rejected',
    uploadedAt: new Date('2024-03-04'),
    reviewedAt: new Date('2024-03-06'),
    reviewer: 'Emily Rodriguez',
    comments: 'Clinic stamp not visible. Please resubmit.',
  },
  {
    id: 'doc-9',
    studentId: '2',
    name: 'Passport Copy',
    category: 'Identity',
    status: 'Verified',
    uploadedAt: new Date('2024-02-08'),
    reviewedAt: new Date('2024-02-09'),
    reviewer: 'Michael Chen',
    expiryDate: new Date('2032-08-10'),
  },
  {
    id: 'doc-10',
    studentId: '3',
    name: 'Passport Copy',
    category: 'Identity',
    status: 'Uploaded',
    uploadedAt: new Date('2024-01-22'),
  },
]

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    studentId: '1',
    type: 'document_upload',
    description: 'Passport document uploaded',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'activity-2',
    studentId: '2',
    type: 'status_change',
    description: 'Admission stage changed to Interview',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'activity-3',
    studentId: '1',
    type: 'note_added',
    description: 'Strong academic profile, recommend acceptance',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'activity-4',
    studentId: '3',
    type: 'document_upload',
    description: 'TOEFL scores submitted',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'activity-5',
    studentId: '5',
    type: 'status_change',
    description: 'Admission stage changed to Accepted',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'urgent',
    title: 'Visa documents overdue',
    message: 'Arjun Patel&apos;s visa documents are overdue for submission',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Interview pending',
    message: 'Emma Wilson interview needs to be scheduled',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'New application received',
    message: 'New student application from Liam O&apos;Connor',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
  },
]

export const mockCommunications: Communication[] = [
  {
    id: 'comm-1',
    studentId: '1',
    type: 'internal_note',
    author: 'Sarah Johnson',
    content: 'Student requires additional assistance with visa documentation. Scheduled follow-up call for tomorrow.',
    timestamp: new Date('2024-03-15 14:30'),
  },
  {
    id: 'comm-2',
    studentId: '1',
    type: 'counselor_update',
    author: 'Michael Chen',
    content: 'Counselor Update: Provided guidance on essay writing and application strategy. Student is progressing well.',
    timestamp: new Date('2024-03-14 10:15'),
  },
  {
    id: 'comm-3',
    studentId: '2',
    type: 'email',
    author: 'Emily Rodriguez',
    content: 'Email sent regarding payment reminder for second semester deposit.',
    timestamp: new Date('2024-03-13 09:00'),
  },
  {
    id: 'comm-4',
    studentId: '1',
    type: 'call',
    author: 'James Wilson',
    content: 'Call conducted: Discussed visa interview preparation and requirements.',
    timestamp: new Date('2024-03-12 15:45'),
  },
]

export const mockStaffMembers: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'Senior Counselor',
    assignedStudentsCount: 8,
    joinDate: new Date('2020-06-15'),
  },
  {
    id: 'staff-2',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'Counselor',
    assignedStudentsCount: 6,
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 'staff-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    role: 'Counselor',
    assignedStudentsCount: 7,
    joinDate: new Date('2022-01-10'),
  },
  {
    id: 'staff-4',
    name: 'James Wilson',
    email: 'james.wilson@university.edu',
    role: 'Associate',
    assignedStudentsCount: 4,
    joinDate: new Date('2023-03-20'),
  },
]

export const mockWorkflowStages: WorkflowStage[] = [
  { id: 'stage-1', name: 'Lead', order: 1, color: 'bg-slate-500', isCompleted: false },
  { id: 'stage-2', name: 'Applied', order: 2, color: 'bg-blue-500', isCompleted: false },
  { id: 'stage-3', name: 'Under Review', order: 3, color: 'bg-cyan-500', isCompleted: false },
  { id: 'stage-4', name: 'Interview', order: 4, color: 'bg-purple-500', isCompleted: false },
  { id: 'stage-5', name: 'Accepted', order: 5, color: 'bg-green-500', isCompleted: false },
  { id: 'stage-6', name: 'Enrolled', order: 6, color: 'bg-emerald-500', isCompleted: true },
  { id: 'stage-7', name: 'Rejected', order: 7, color: 'bg-red-500', isCompleted: false },
]

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Welcome Email on Application',
    trigger: 'Application Submitted',
    conditions: ['Student exists', 'Email verified'],
    actions: ['Send welcome email', 'Create onboarding task'],
    isActive: true,
    createdDate: new Date('2024-01-15'),
  },
  {
    id: 'auto-2',
    name: 'Payment Reminder',
    trigger: 'Payment due in 3 days',
    conditions: ['Payment pending', 'Email available'],
    actions: ['Send reminder email', 'Create follow-up task'],
    isActive: true,
    createdDate: new Date('2024-01-20'),
  },
  {
    id: 'auto-3',
    name: 'Visa Processing Alert',
    trigger: 'Visa status changes',
    conditions: ['Visa not approved after 60 days'],
    actions: ['Alert counselor', 'Escalate priority'],
    isActive: true,
    createdDate: new Date('2024-02-01'),
  },
  {
    id: 'auto-4',
    name: 'Monthly Report Generation',
    trigger: 'Last day of month',
    conditions: ['Always'],
    actions: ['Generate report', 'Send to admin'],
    isActive: false,
    createdDate: new Date('2024-02-10'),
  },
]

export const mockSLAMetrics: SLAMetric[] = [
  {
    id: 'sla-1',
    name: 'Application Response Time',
    target: 48,
    actual: 42,
    status: 'On Track',
    dueDate: new Date('2024-03-31'),
  },
  {
    id: 'sla-2',
    name: 'Document Verification',
    target: 72,
    actual: 68,
    status: 'On Track',
    dueDate: new Date('2024-03-31'),
  },
  {
    id: 'sla-3',
    name: 'Visa Interview Scheduling',
    target: 10,
    actual: 12,
    status: 'At Risk',
    dueDate: new Date('2024-03-25'),
  },
  {
    id: 'sla-4',
    name: 'Payment Processing',
    target: 24,
    actual: 28,
    status: 'Breached',
    dueDate: new Date('2024-03-20'),
  },
]

export function getStudentById(id: string): Student | undefined {
  return mockStudents.find((s) => s.id === id)
}

export function getTasksByStudentId(studentId: string): Task[] {
  return mockTasks.filter((t) => t.studentId === studentId)
}

export function getActivitiesByStudentId(studentId: string): Activity[] {
  return mockActivities.filter((a) => a.studentId === studentId)
}

export function getDocumentsByStudentId(studentId: string): DocumentRecord[] {
  return mockDocuments.filter((d) => d.studentId === studentId)
}

export function getDocumentCompletionPercentage(studentId?: string): number {
  const documents = studentId ? getDocumentsByStudentId(studentId) : mockDocuments
  if (documents.length === 0) {
    return 0
  }

  const verified = documents.filter((document) => document.status === 'Verified').length
  return Math.round((verified / documents.length) * 100)
}

export function getTasksDueToday(): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockTasks.filter((t) => {
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime() && t.status !== 'Completed'
  })
}

export function getOverdueTasks(): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return mockTasks.filter((t) => {
    const dueDate = new Date(t.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() < today.getTime() && t.status !== 'Completed'
  })
}

export function getPendingDocuments(): number {
  return mockDocuments.filter((document) => document.status !== 'Verified').length
}

export function getPendingApplications(): number {
  return mockApplications.filter((application) =>
    ['Draft', 'Preparing', 'Submitted', 'Under Review', 'Revision Required'].includes(application.status),
  ).length
}

export function getVisaCases(): number {
  return mockVisaRecords.length
}

export function getApplicationsByStudentId(studentId: string): Application[] {
  return mockApplications.filter((a) => a.studentId === studentId)
}

export function getPaymentsByStudentId(studentId: string): Payment[] {
  return mockPayments.filter((p) => p.studentId === studentId)
}

export function getVisaRecordByStudentId(studentId: string): VisaRecord | undefined {
  return mockVisaRecords.find((v) => v.studentId === studentId)
}

export function getApplicationById(id: string): Application | undefined {
  return mockApplications.find((a) => a.id === id)
}

export function getPaymentById(id: string): Payment | undefined {
  return mockPayments.find((p) => p.id === id)
}

export function getVisaRecordById(id: string): VisaRecord | undefined {
  return mockVisaRecords.find((v) => v.id === id)
}

export function getPaymentsSummary() {
  return {
    total: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    completed: mockPayments.filter((p) => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0),
    pending: mockPayments.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
    failed: mockPayments.filter((p) => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0),
  }
}

export function getCommunicationsByStudentId(studentId: string): Communication[] {
  return mockCommunications.filter((c) => c.studentId === studentId)
}

export function getStaffMemberById(id: string): StaffMember | undefined {
  return mockStaffMembers.find((s) => s.id === id)
}

export function getReportsData() {
  const activeStudents = mockStudents.length
  const processed = mockStudents.filter((s) => ['Accepted', 'Enrolled'].includes(s.admissionStage)).length
  const avgProcessingDays = 45
  const visaApprovalRate = 0.92
  const slaCompliance = 0.88
  const pendingDocuments = getPendingDocuments()
  const pendingApplications = getPendingApplications()
  const visaCases = getVisaCases()

  const applicationsByCountry = mockStudents.reduce(
    (acc, s) => {
      acc[s.country] = (acc[s.country] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const applicationsByUniversity = mockStudents.reduce(
    (acc, s) => {
      acc[s.university] = (acc[s.university] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const staffProductivity = mockStaffMembers.map((staff) => ({
    name: staff.name,
    students: staff.assignedStudentsCount,
    completed: Math.min(staff.assignedStudentsCount, Math.max(0, Math.round(staff.assignedStudentsCount * 0.75))),
  }))

  return {
    activeStudents,
    processed,
    avgProcessingDays,
    visaApprovalRate,
    slaCompliance,
    pendingDocuments,
    pendingApplications,
    visaCases,
    applicationsByCountry,
    applicationsByUniversity,
    staffProductivity,
  }
}

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    studentId: '1',
    universityName: 'Oxford University',
    programName: 'MSc Computer Science',
    applicationDate: new Date('2024-01-15'),
    status: 'Accepted',
    applicationFee: 75,
    offerLetter: 'Offer letter attached',
    deadline: new Date('2024-04-30'),
  },
  {
    id: 'app-2',
    studentId: '1',
    universityName: 'Cambridge University',
    programName: 'MSc Engineering',
    applicationDate: new Date('2024-01-20'),
    status: 'Revision Required',
    applicationFee: 75,
    deadline: new Date('2024-05-15'),
  },
  {
    id: 'app-3',
    studentId: '2',
    universityName: 'Harvard University',
    programName: 'MBA',
    applicationDate: new Date('2024-02-10'),
    status: 'Accepted',
    applicationFee: 275,
    offerLetter: 'Offer letter attached',
  },
  {
    id: 'app-4',
    studentId: '3',
    universityName: 'MIT',
    programName: 'PhD Physics',
    applicationDate: new Date('2024-01-20'),
    status: 'Preparing',
    applicationFee: 125,
    deadline: new Date('2024-06-30'),
  },
  {
    id: 'app-5',
    studentId: '4',
    universityName: 'MIT',
    programName: 'MSc Aeronautics',
    applicationDate: new Date('2024-03-05'),
    status: 'Submitted',
    applicationFee: 125,
    deadline: new Date('2024-07-15'),
  },
  {
    id: 'app-6',
    studentId: '5',
    universityName: 'Stanford University',
    programName: 'MSc Data Science',
    applicationDate: new Date('2024-02-28'),
    status: 'Preparing',
    applicationFee: 275,
  },
  {
    id: 'app-7',
    studentId: '6',
    universityName: 'Yale University',
    programName: 'LLM Law',
    applicationDate: new Date('2024-01-08'),
    status: 'Accepted',
    applicationFee: 150,
  },
  {
    id: 'app-8',
    studentId: '8',
    universityName: 'University of Chicago',
    programName: 'MSc Economics',
    applicationDate: new Date('2024-02-15'),
    status: 'Under Review',
    applicationFee: 200,
    deadline: new Date('2024-06-15'),
  },
]

export const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    studentId: '1',
    type: 'Registration Fee',
    amount: 75,
    currency: 'GBP',
    status: 'Completed',
    dueDate: new Date('2024-01-30'),
    paidDate: new Date('2024-01-25'),
    description: 'Oxford University application fee',
  },
  {
    id: 'pay-2',
    studentId: '1',
    type: 'University Fee',
    amount: 75,
    currency: 'GBP',
    status: 'Completed',
    dueDate: new Date('2024-02-05'),
    paidDate: new Date('2024-02-01'),
    description: 'Cambridge University application fee',
  },
  {
    id: 'pay-3',
    studentId: '1',
    type: 'University Fee',
    amount: 5000,
    currency: 'GBP',
    status: 'Pending',
    dueDate: new Date('2024-04-15'),
    description: 'Course deposit for Oxford University',
  },
  {
    id: 'pay-4',
    studentId: '2',
    type: 'Registration Fee',
    amount: 275,
    currency: 'USD',
    status: 'Completed',
    dueDate: new Date('2024-02-25'),
    paidDate: new Date('2024-02-20'),
    description: 'Harvard University MBA application fee',
  },
  {
    id: 'pay-5',
    studentId: '2',
    type: 'University Fee',
    amount: 60000,
    currency: 'USD',
    status: 'Pending',
    dueDate: new Date('2024-08-01'),
    description: 'First semester tuition - Harvard MBA',
  },
  {
    id: 'pay-6',
    studentId: '3',
    type: 'Registration Fee',
    amount: 125,
    currency: 'USD',
    status: 'Completed',
    dueDate: new Date('2024-02-05'),
    paidDate: new Date('2024-02-02'),
    description: 'MIT PhD application fee',
  },
  {
    id: 'pay-7',
    studentId: '4',
    type: 'Registration Fee',
    amount: 125,
    currency: 'USD',
    status: 'Pending',
    dueDate: new Date('2024-03-20'),
    description: 'MIT MSc application fee',
  },
  {
    id: 'pay-8',
    studentId: '5',
    type: 'Visa Fee',
    amount: 300,
    currency: 'EUR',
    status: 'Completed',
    dueDate: new Date('2024-03-15'),
    paidDate: new Date('2024-03-10'),
    description: 'Schengen visa application fee',
  },
  {
    id: 'pay-9',
    studentId: '6',
    type: 'Flight Charges',
    amount: 500,
    currency: 'AUD',
    status: 'Completed',
    dueDate: new Date('2024-02-01'),
    paidDate: new Date('2024-01-28'),
    description: 'University processing fee',
  },
  {
    id: 'pay-10',
    studentId: '8',
    type: 'Registration Fee',
    amount: 200,
    currency: 'USD',
    status: 'Pending',
    dueDate: new Date('2024-03-10'),
    description: 'University of Chicago application fee',
  },
]

export const mockVisaRecords: VisaRecord[] = [
  {
    id: 'visa-1',
    studentId: '1',
    visaType: 'UK Student Visa',
    applicationDate: new Date('2024-02-01'),
    status: 'Document Collection',
    appointmentDate: new Date('2024-03-15'),
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: true,
      medicalCertificate: true,
      policeNoCrime: true,
    },
  },
  {
    id: 'visa-2',
    studentId: '2',
    visaType: 'US Student Visa (F-1)',
    applicationDate: new Date('2024-02-15'),
    status: 'Appointment Scheduled',
    appointmentDate: new Date('2024-03-20'),
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: true,
      medicalCertificate: true,
      policeNoCrime: false,
    },
  },
  {
    id: 'visa-3',
    studentId: '3',
    visaType: 'US Student Visa (F-1)',
    applicationDate: new Date('2024-01-25'),
    status: 'Visa Approved',
    visaNumber: 'US-2024-001234',
    expiryDate: new Date('2028-01-25'),
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: true,
      medicalCertificate: true,
      policeNoCrime: true,
    },
  },
  {
    id: 'visa-4',
    studentId: '4',
    visaType: 'UK Student Visa',
    applicationDate: new Date('2024-03-01'),
    status: 'Biometrics',
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: false,
      medicalCertificate: true,
      policeNoCrime: true,
    },
  },
  {
    id: 'visa-5',
    studentId: '5',
    visaType: 'Germany Student Visa',
    applicationDate: new Date('2024-02-20'),
    status: 'Visa Application',
    appointmentDate: new Date('2024-04-10'),
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: true,
      medicalCertificate: false,
      policeNoCrime: true,
    },
  },
  {
    id: 'visa-6',
    studentId: '6',
    visaType: 'Australia Student Visa',
    applicationDate: new Date('2024-01-10'),
    status: 'Travel Ready',
    visaNumber: 'AU-2024-005678',
    expiryDate: new Date('2027-01-10'),
    documents: {
      passportCopy: true,
      fundingProof: true,
      accommodationProof: true,
      medicalCertificate: true,
      policeNoCrime: true,
    },
  },
  {
    id: 'visa-7',
    studentId: '8',
    visaType: 'US Student Visa (F-1)',
    applicationDate: new Date('2024-03-01'),
    status: 'Document Collection',
    documents: {
      passportCopy: true,
      fundingProof: false,
      accommodationProof: false,
      medicalCertificate: false,
      policeNoCrime: true,
    },
  },
]
