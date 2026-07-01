'use client'

import { AppLayout } from '@/components/app-shell/layout'
import {
  mockStudents,
  mockActivities,
  getTasksDueToday,
  getOverdueTasks,
  getPendingDocuments,
  getPendingApplications,
  getVisaCases,
} from '@/lib/mock-data'
import { Users, FileText, AlertCircle, Clock, CheckCircle2, ClipboardList, Plane } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const tasksDueToday = getTasksDueToday()
  const overdueTasks = getOverdueTasks()
  const pendingDocs = getPendingDocuments()
  const kpiData = [
    {
      label: 'Students Assigned',
      value: mockStudents.length.toString(),
      icon: Users,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      label: 'Tasks Due Today',
      value: tasksDueToday.length.toString(),
      icon: Clock,
      color: 'bg-yellow-500/20 text-yellow-400',
    },
    {
      label: 'Pending Documents',
      value: pendingDocs.toString(),
      icon: FileText,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      label: 'Pending Applications',
      value: getPendingApplications().toString(),
      icon: ClipboardList,
      color: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      label: 'Visa Cases',
      value: getVisaCases().toString(),
      icon: Plane,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      label: 'Overdue Tasks',
      value: overdueTasks.length.toString(),
      icon: AlertCircle,
      color: 'bg-red-500/20 text-red-400',
    },
  ]

  const recentActivities = mockActivities.slice(0, 8)

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s your overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                    <p className="text-4xl font-bold text-foreground mt-2">{kpi.value}</p>
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Due Today */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Tasks Due Today</h2>
              <Link
                href="/tasks"
                className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>
            {tasksDueToday.length > 0 ? (
              <div className="space-y-3">
                {tasksDueToday.map((task) => {
                  const student = mockStudents.find((s) => s.id === task.studentId)
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors"
                    >
                      <div
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          task.priority === 'High'
                            ? 'bg-red-500'
                            : task.priority === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ${
                          task.priority === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : task.priority === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks due today</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const student = mockStudents.find((s) => s.id === activity.studentId)
                return (
                  <div key={activity.id} className="text-sm border-l-2 border-primary/30 pl-4 py-2">
                    <p className="text-foreground font-medium">
                      {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Admission Stage Overview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Students by Admission Stage</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Applied', 'Under Review', 'Interview', 'Accepted', 'Enrolled', 'Rejected'].map(
              (stage) => {
                const count = mockStudents.filter((s) => s.admissionStage === stage).length
                return (
                  <div key={stage} className="bg-background rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stage}</p>
                  </div>
                )
              }
            )}
          </div>
        </div>
      </div>
    </AppLayout>
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
