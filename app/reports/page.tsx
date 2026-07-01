'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { getReportsData, mockApplications, mockPayments, mockTasks } from '@/lib/mock-data'
import { CheckCircle2, Clock, Download, DollarSign, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const data = getReportsData()

  const kpiCards = [
    {
      label: 'Active Students',
      value: data.activeStudents.toString(),
      icon: Users,
      color: 'bg-blue-500/20 text-blue-400',
      trend: '+5% from last month',
    },
    {
      label: 'Processed',
      value: data.processed.toString(),
      icon: CheckCircle2,
      color: 'bg-green-500/20 text-green-400',
      trend: 'Students moved to success states',
    },
    {
      label: 'Avg Processing Time',
      value: `${data.avgProcessingDays}d`,
      icon: Clock,
      color: 'bg-purple-500/20 text-purple-400',
      trend: '-2 days improvement',
    },
    {
      label: 'Visa Approval Rate',
      value: `${Math.round(data.visaApprovalRate * 100)}%`,
      icon: TrendingUp,
      color: 'bg-orange-500/20 text-orange-400',
      trend: 'Consistent performance',
    },
  ]

  const countryData = Object.entries(data.applicationsByCountry).map(([country, count]) => ({
    name: country,
    value: count as number,
  }))

  const universityData = Object.entries(data.applicationsByUniversity).map(([uni, count]) => ({
    name: uni,
    value: count as number,
  }))

  const pendingTasks = mockTasks.filter((t) => t.status !== 'Completed').slice(0, 8)
  const pendingPayments = mockPayments.filter((p) => p.status === 'Pending').length

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="mt-2 text-muted-foreground">Monitor key metrics and performance indicators</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                  <div className={`${kpi.color} rounded-lg p-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.trend}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Applications by Country</h3>
            <div className="space-y-3">
              {countryData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${(item.value / Math.max(...countryData.map((d) => d.value))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Applications by University</h3>
            <div className="space-y-3">
              {universityData.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background">
                    <div
                      className="h-2 rounded-full bg-accent transition-all"
                      style={{ width: `${(item.value / Math.max(...universityData.map((d) => d.value))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Staff Productivity</h3>
            <div className="space-y-4">
              {data.staffProductivity.map((staff) => (
                <div key={staff.name} className="flex items-center justify-between rounded-lg bg-background p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{staff.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {staff.completed} / {staff.students} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {Math.round((staff.completed / staff.students) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-lg font-semibold text-foreground">SLA Compliance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-background p-3">
                <span className="text-sm font-medium text-foreground">Overall SLA</span>
                <span className="text-sm font-bold text-green-400">{Math.round(data.slaCompliance * 100)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-background">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                  style={{ width: `${data.slaCompliance * 100}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Target: 95% • Current: {Math.round(data.slaCompliance * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-6 text-lg font-semibold text-foreground">Pending Work Overview</h3>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Applications</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.pendingApplications}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Payments</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{pendingPayments}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Documents</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{data.pendingDocuments}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingTasks.map((task) => (
                  <tr key={task.id} className="border-b border-border transition-colors hover:bg-background/50">
                    <td className="px-4 py-3 text-sm text-foreground">{task.title}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          task.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-400'
                            : task.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400'
                              : task.priority === 'Medium'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
