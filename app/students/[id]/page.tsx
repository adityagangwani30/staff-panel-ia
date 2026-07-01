'use client'

import { AppLayout } from '@/components/app-shell/layout'
import {
  mockStudents,
  getTasksByStudentId,
  getActivitiesByStudentId,
  getApplicationsByStudentId,
  getPaymentsByStudentId,
  getVisaRecordByStudentId,
  getCommunicationsByStudentId,
  getDocumentsByStudentId,
  getDocumentCompletionPercentage,
  Student,
} from '@/lib/mock-data'
import { useState } from 'react'
import { ChevronLeft, FileText, Calendar, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'

const STAGE_STEPS = ['Lead', 'Applied', 'Under Review', 'Interview', 'Accepted', 'Enrolled', 'Rejected']

const TABS = ['Overview', 'Documents', 'Tasks', 'Applications', 'Payments', 'Visa', 'Communication', 'Notes', 'Timeline']

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string
  const student = mockStudents.find((s) => s.id === studentId)
  const [activeTab, setActiveTab] = useState('Overview')

  if (!student) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </AppLayout>
    )
  }

  const tasks = getTasksByStudentId(student.id)
  const activities = getActivitiesByStudentId(student.id)
  const applications = getApplicationsByStudentId(student.id)
  const payments = getPaymentsByStudentId(student.id)
  const visaRecord = getVisaRecordByStudentId(student.id)
  const communications = getCommunicationsByStudentId(student.id)
  const documents = getDocumentsByStudentId(student.id)
  const currentStageIndex = STAGE_STEPS.indexOf(student.admissionStage)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/students"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Students
        </Link>

        {/* Student Header */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-muted-foreground mt-2">{student.university}</p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Registered {formatDate(student.registrationDate)}
                </div>
              </div>
            </div>
            <div>
              <StatusBadge kind="student" status={student.admissionStage} />
            </div>
          </div>

          {/* Stage Progress */}
          <div className="mt-8">
            <p className="text-sm font-medium text-muted-foreground mb-4">Admission Progress</p>
            <div className="flex items-center gap-2">
              {STAGE_STEPS.map((stage, index) => (
                <div key={stage} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index <= currentStageIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < STAGE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        index < currentStageIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex border-b border-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'Overview' && <OverviewTab student={student} />}
            {activeTab === 'Documents' && <DocumentsTab documents={documents} />}
            {activeTab === 'Tasks' && <TasksTab tasks={tasks} />}
            {activeTab === 'Applications' && <ApplicationsTab applications={applications} />}
            {activeTab === 'Payments' && <PaymentsTab payments={payments} />}
            {activeTab === 'Visa' && <VisaTab visaRecord={visaRecord} />}
            {activeTab === 'Communication' && <CommunicationTab communications={communications} />}
            {activeTab === 'Timeline' && <TimelineTab activities={activities} />}
            {activeTab === 'Notes' && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Notes section coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function OverviewTab({ student }: { student: Student }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Personal Info */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</p>
            <p className="text-foreground mt-1">
              {student.firstName} {student.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="text-foreground mt-1">{student.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
            <p className="text-foreground mt-1">{student.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Country</p>
            <p className="text-foreground mt-1">{student.country}</p>
          </div>
          {student.personalInfo && (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Date of Birth
                </p>
                <p className="text-foreground mt-1">{formatDate(new Date(student.personalInfo.dateOfBirth))}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Nationality</p>
                <p className="text-foreground mt-1">{student.personalInfo.nationality}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Academic Info */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Academic Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">University</p>
            <p className="text-foreground mt-1">{student.university}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Intake</p>
            <p className="text-foreground mt-1">{student.intake}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Staff</p>
            <p className="text-foreground mt-1">{student.assignedStaff}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned Counselor</p>
            <p className="text-foreground mt-1">{student.assignedCounselor || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority</p>
            <PriorityBadge priority={student.priority} className="mt-1" />
          </div>
          {student.academicInfo && (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Degree</p>
                <p className="text-foreground mt-1">{student.academicInfo.degree}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">GPA</p>
                <p className="text-foreground mt-1">{student.academicInfo.gpa}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Passport Info */}
      {student.personalInfo && (
        <div>
          <h3 className="font-semibold text-foreground mb-4">Passport Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Passport Number</p>
              <p className="text-foreground mt-1">{student.personalInfo.passportNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Expiry Date</p>
              <p className="text-foreground mt-1">
                {formatDate(new Date(student.personalInfo.passportExpiry))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DocumentsTab({ documents }: { documents: ReturnType<typeof getDocumentsByStudentId> }) {
  const completion = getDocumentCompletionPercentage(documents[0]?.studentId)

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Document Completion</p>
          <p className="text-sm text-muted-foreground">{completion}% verified</p>
        </div>
        <div className="h-2 w-full rounded-full bg-background">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="space-y-3 mt-6">
        {documents.length > 0 ? (
          documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{document.name}</p>
                <p className="text-xs text-muted-foreground">{document.category}</p>
              </div>
              <StatusBadge kind="document" status={document.status} />
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No documents yet</p>
        )}
      </div>
    </div>
  )
}

function TasksTab({ tasks }: { tasks: any[] }) {
  return (
    <div className="space-y-3">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-foreground">{task.title}</h4>
              <PriorityBadge priority={task.priority} />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Due: {formatDate(task.dueDate)}</span>
              <StatusBadge kind="task" status={task.status} />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned</p>
      )}
    </div>
  )
}

function TimelineTab({ activities }: { activities: any[] }) {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
              {index < activities.length - 1 && <div className="w-0.5 h-12 bg-border my-2" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
      )}
    </div>
  )
}

function ApplicationsTab({ applications }: { applications: any[] }) {
  return (
    <div className="space-y-4">
      {applications.length > 0 ? (
        applications.map((app) => (
          <div key={app.id} className="p-4 bg-background rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-foreground">{app.universityName}</h4>
                <p className="text-sm text-muted-foreground mt-1">{app.programName}</p>
              </div>
              <StatusBadge kind="application" status={app.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              <span>Applied: {formatDate(app.applicationDate)}</span>
              <span>Fee: ${app.applicationFee}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
      )}
    </div>
  )
}

function PaymentsTab({ payments }: { payments: any[] }) {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-foreground mt-2">${totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Paid</p>
          <p className="text-2xl font-bold text-green-400 mt-2">${paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-2">${pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{payment.type}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{payment.description}</p>
                </div>
                <StatusBadge kind="payment" status={payment.status} />
              </div>
              <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-border">
                <span className="text-foreground font-medium">${payment.amount}</span>
                <span className="text-muted-foreground">
                  Due: {formatDate(payment.dueDate)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No payments recorded</p>
        )}
      </div>
    </div>
  )
}

function VisaTab({ visaRecord }: { visaRecord: any }) {
  if (!visaRecord) {
    return <p className="text-sm text-muted-foreground text-center py-8">No visa record yet</p>
  }

  const visaStages = [
    'Document Collection',
    'Visa Application',
    'Appointment Scheduled',
    'Biometrics',
    'Interview',
    'Visa Approved',
    'Visa Issued',
    'Travel Ready',
  ]
  const currentStageIndex = visaStages.indexOf(visaRecord.status)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{visaRecord.visaType}</h3>
            <p className="text-sm text-muted-foreground mt-1">Current Status: {visaRecord.status}</p>
          </div>
        </div>

        {/* Visa Progress */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">Visa Processing Progress</p>
          <div className="flex items-center gap-1">
            {visaStages.map((stage, index) => (
              <div key={stage} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    index <= currentStageIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                {index < visaStages.length - 1 && (
                  <div
                    className={`flex-1 h-1 rounded-full transition-colors mx-1 ${
                      index < currentStageIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Application Date</p>
          <p className="text-foreground font-medium mt-2">{formatDate(visaRecord.applicationDate)}</p>
        </div>

        {visaRecord.appointmentDate && (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Appointment Date</p>
            <p className="text-foreground font-medium mt-2">{formatDate(visaRecord.appointmentDate)}</p>
          </div>
        )}

        {visaRecord.visaNumber && (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Visa Number</p>
            <p className="text-foreground font-medium mt-2">{visaRecord.visaNumber}</p>
          </div>
        )}

        {visaRecord.expiryDate && (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Expiry Date</p>
            <p className="text-foreground font-medium mt-2">{formatDate(visaRecord.expiryDate)}</p>
          </div>
        )}
      </div>

      {/* Documents Checklist */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Required Documents</h4>
        <div className="space-y-2">
          {Object.entries(visaRecord.documents).map(([doc, submitted]: [string, any]) => (
            <div key={doc} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  submitted
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-slate-500/20 border-slate-500/50'
                }`}
              >
                {submitted && <span className="text-green-400">✓</span>}
              </div>
              <span className="text-sm text-foreground capitalize">
                {doc.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function CommunicationTab({ communications }: { communications: any[] }) {
  const typeIcons = {
    internal_note: '📝',
    counselor_update: '👤',
    email: '📧',
    call: '☎️',
  }

  const typeLabels = {
    internal_note: 'Internal Note',
    counselor_update: 'Counselor Update',
    email: 'Email',
    call: 'Call',
  }

  const typeBgColors = {
    internal_note: 'bg-slate-500/20 text-slate-400',
    counselor_update: 'bg-blue-500/20 text-blue-400',
    email: 'bg-purple-500/20 text-purple-400',
    call: 'bg-green-500/20 text-green-400',
  }

  return (
    <div className="space-y-6">
      <div className="bg-background border border-border rounded-lg p-4">
        <textarea
          placeholder="Add a new internal note or counselor update..."
          className="w-full bg-card border border-border rounded-lg p-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={4}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            <select className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="internal_note">Internal Note</option>
              <option value="counselor_update">Counselor Update</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Add Comment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {communications.length > 0 ? (
          communications.map((comm, index) => (
            <div key={comm.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-lg">
                  {typeIcons[comm.type as keyof typeof typeIcons]}
                </div>
                {index < communications.length - 1 && <div className="w-0.5 h-12 bg-border my-2" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="bg-background rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeBgColors[comm.type as keyof typeof typeBgColors]}`}
                      >
                        {typeLabels[comm.type as keyof typeof typeLabels]}
                      </span>
                      <p className="text-sm font-medium text-foreground ml-2 inline">{comm.author}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(comm.timestamp)}</p>
                  </div>
                  <p className="text-sm text-foreground mt-3">{comm.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No communications yet</p>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
