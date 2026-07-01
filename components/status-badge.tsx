'use client'

import { cn } from '@/lib/utils'

type StatusKind = 'student' | 'task' | 'document' | 'application' | 'payment' | 'visa' | 'sla'

const statusStyles: Record<StatusKind, Record<string, string>> = {
  student: {
    Lead: 'bg-slate-500/20 text-slate-300',
    Applied: 'bg-blue-500/20 text-blue-300',
    'Under Review': 'bg-cyan-500/20 text-cyan-300',
    Interview: 'bg-purple-500/20 text-purple-300',
    Accepted: 'bg-green-500/20 text-green-300',
    Enrolled: 'bg-emerald-500/20 text-emerald-300',
    Rejected: 'bg-red-500/20 text-red-300',
  },
  task: {
    Pending: 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-300',
    Waiting: 'bg-amber-500/20 text-amber-300',
    Completed: 'bg-green-500/20 text-green-300',
    Cancelled: 'bg-red-500/20 text-red-300',
  },
  document: {
    Missing: 'bg-slate-500/20 text-slate-300',
    Uploaded: 'bg-blue-500/20 text-blue-300',
    'Under Review': 'bg-amber-500/20 text-amber-300',
    Verified: 'bg-green-500/20 text-green-300',
    Rejected: 'bg-red-500/20 text-red-300',
    'Resubmission Required': 'bg-purple-500/20 text-purple-300',
  },
  application: {
    Draft: 'bg-slate-500/20 text-slate-300',
    Preparing: 'bg-cyan-500/20 text-cyan-300',
    Submitted: 'bg-blue-500/20 text-blue-300',
    'Under Review': 'bg-amber-500/20 text-amber-300',
    Accepted: 'bg-green-500/20 text-green-300',
    Rejected: 'bg-red-500/20 text-red-300',
    'Revision Required': 'bg-purple-500/20 text-purple-300',
  },
  payment: {
    Pending: 'bg-amber-500/20 text-amber-300',
    Completed: 'bg-green-500/20 text-green-300',
    Failed: 'bg-red-500/20 text-red-300',
    Refunded: 'bg-blue-500/20 text-blue-300',
  },
  visa: {
    'Document Collection': 'bg-slate-500/20 text-slate-300',
    'Visa Application': 'bg-blue-500/20 text-blue-300',
    'Appointment Scheduled': 'bg-cyan-500/20 text-cyan-300',
    Biometrics: 'bg-purple-500/20 text-purple-300',
    Interview: 'bg-amber-500/20 text-amber-300',
    'Visa Approved': 'bg-green-500/20 text-green-300',
    'Visa Issued': 'bg-emerald-500/20 text-emerald-300',
    'Travel Ready': 'bg-indigo-500/20 text-indigo-300',
  },
  sla: {
    'On Track': 'bg-green-500/20 text-green-300',
    'At Risk': 'bg-amber-500/20 text-amber-300',
    Breached: 'bg-red-500/20 text-red-300',
  },
}

export function StatusBadge({
  kind,
  status,
  className,
}: {
  kind: StatusKind
  status: string
  className?: string
}) {
  const variant = statusStyles[kind][status] ?? 'bg-slate-500/20 text-slate-300'

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', variant, className)}>
      {status}
    </span>
  )
}
