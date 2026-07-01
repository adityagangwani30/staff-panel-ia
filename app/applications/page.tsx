'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { StatusBadge } from '@/components/status-badge'
import { mockApplications, mockStudents, type Application } from '@/lib/mock-data'
import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const STATUSES = ['Draft', 'Preparing', 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Revision Required']
const UNIVERSITIES = Array.from(new Set(mockApplications.map((a) => a.universityName))).sort()

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    university: '',
  })
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const filteredApplications = useMemo(() => {
    return mockApplications.filter((app) => {
      const student = mockStudents.find((s) => s.id === app.studentId)
      const matchesSearch =
        (student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (student?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        app.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.universityName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !filters.status || app.status === filters.status
      const matchesUniversity = !filters.university || app.universityName === filters.university

      return matchesSearch && matchesStatus && matchesUniversity
    })
  }, [searchQuery, filters])

  const statusStats = useMemo(() => {
    return STATUSES.map((status) => ({
      status,
      count: mockApplications.filter((a) => a.status === status).length,
    }))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-2">Track and manage all university applications</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {statusStats.map((stat) => (
            <div key={stat.status} className="bg-card border border-border rounded-lg p-4">
              <div className="text-2xl font-bold text-foreground">{stat.count}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.status}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name, program, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'status', label: 'Status', options: STATUSES },
              { key: 'university', label: 'University', options: UNIVERSITIES },
            ].map((filterGroup) => (
              <div key={filterGroup.key} className="relative">
                <button
                  onClick={() =>
                    setExpandedFilter(expandedFilter === filterGroup.key ? null : filterGroup.key)
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:border-primary/50 transition-colors"
                >
                  {filterGroup.label}
                  {filters[filterGroup.key as keyof typeof filters] && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {filters[filterGroup.key as keyof typeof filters]}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {expandedFilter === filterGroup.key && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max">
                    <button
                      onClick={() => {
                        setFilters((f) => ({ ...f, [filterGroup.key]: '' }))
                        setExpandedFilter(null)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 first:rounded-t-lg"
                    >
                      Clear
                    </button>
                    {filterGroup.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilters((f) => ({ ...f, [filterGroup.key]: option }))
                          setExpandedFilter(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background/50 last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border bg-background/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">University</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Program</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Applied</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredApplications.map((app) => {
                const student = mockStudents.find((s) => s.id === app.studentId)
                const deadline = app.deadline
                  ? new Date(app.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'

                return (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="cursor-pointer transition-colors hover:bg-background/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {student?.firstName} {student?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{app.universityName}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{app.programName}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge kind="application" status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(app.applicationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">${app.applicationFee}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{deadline}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No applications found. Try adjusting your search or filters.</p>
          </div>
        )}

        {selectedApp && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-background/50 backdrop-blur-sm"
            onClick={() => setSelectedApp(null)}
          >
            <div
              className="w-full max-w-md max-h-screen overflow-y-auto border-l border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold text-foreground">Application Details</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Student</div>
                  <div className="font-medium text-foreground">
                    {mockStudents.find((s) => s.id === selectedApp.studentId)?.firstName}{' '}
                    {mockStudents.find((s) => s.id === selectedApp.studentId)?.lastName}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">University</div>
                  <div className="font-medium text-foreground">{selectedApp.universityName}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Program</div>
                  <div className="font-medium text-foreground">{selectedApp.programName}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                  <StatusBadge kind="application" status={selectedApp.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Application Date
                    </div>
                    <div className="font-medium text-foreground">
                      {new Date(selectedApp.applicationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Application Fee</div>
                    <div className="font-medium text-foreground">${selectedApp.applicationFee}</div>
                  </div>
                </div>

                {selectedApp.deadline && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Deadline</div>
                    <div className="font-medium text-foreground">
                      {new Date(selectedApp.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}

                {selectedApp.notes && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Notes</div>
                    <div className="text-foreground">{selectedApp.notes}</div>
                  </div>
                )}

                {selectedApp.offerLetter && (
                  <div className="border-t border-border pt-4">
                    <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                      View Offer Letter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
