'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { StatusBadge } from '@/components/status-badge'
import { mockStudents, mockVisaRecords, type VisaRecord } from '@/lib/mock-data'
import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const VISA_STATUSES = [
  'Document Collection',
  'Visa Application',
  'Appointment Scheduled',
  'Biometrics',
  'Interview',
  'Visa Approved',
  'Visa Issued',
  'Travel Ready',
]

const VISA_TYPES = Array.from(new Set(mockVisaRecords.map((v) => v.visaType))).sort()

export default function VisaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  })
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)
  const [selectedVisa, setSelectedVisa] = useState<VisaRecord | null>(null)

  const filteredVisas = useMemo(() => {
    return mockVisaRecords.filter((visa) => {
      const student = mockStudents.find((s) => s.id === visa.studentId)
      const matchesSearch =
        (student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (student?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        visa.visaType.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !filters.status || visa.status === filters.status
      const matchesType = !filters.type || visa.visaType === filters.type

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, filters])

  const statusStats = useMemo(() => {
    return VISA_STATUSES.map((status) => ({
      status,
      count: mockVisaRecords.filter((v) => v.status === status).length,
    }))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visa Management</h1>
          <p className="text-muted-foreground mt-2">Track and manage student visa applications</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Visa Processing Pipeline</h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {VISA_STATUSES.map((status, index) => (
              <div key={status} className="flex min-w-max flex-1 items-center">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
                {index < VISA_STATUSES.length - 1 && <div className="mx-2 h-1 flex-1 bg-border" />}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {statusStats.map((stat) => (
              <div key={stat.status} className="rounded-full bg-background px-3 py-1 text-xs">
                <span className="text-muted-foreground">{stat.status}:</span>
                <span className="ml-1 font-bold text-foreground">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name or visa type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'status', label: 'Status', options: VISA_STATUSES },
              { key: 'type', label: 'Type', options: VISA_TYPES },
            ].map((filterGroup) => (
              <div key={filterGroup.key} className="relative">
                <button
                  onClick={() =>
                    setExpandedFilter(expandedFilter === filterGroup.key ? null : filterGroup.key)
                  }
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/50"
                >
                  {filterGroup.label}
                  {filters[filterGroup.key as keyof typeof filters] && (
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {filters[filterGroup.key as keyof typeof filters]}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {expandedFilter === filterGroup.key && (
                  <div className="absolute left-0 top-full z-10 mt-1 min-w-max rounded-lg border border-border bg-card shadow-lg">
                    <button
                      onClick={() => {
                        setFilters((f) => ({ ...f, [filterGroup.key]: '' }))
                        setExpandedFilter(null)
                      }}
                      className="block w-full rounded-t-lg px-4 py-2 text-left text-sm text-muted-foreground hover:bg-background/50 hover:text-foreground"
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

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-background/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Visa Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Application Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Appointment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Visa Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredVisas.map((visa) => {
                const student = mockStudents.find((s) => s.id === visa.studentId)
                const appDate = new Date(visa.applicationDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                const apptDate = visa.appointmentDate
                  ? new Date(visa.appointmentDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'

                return (
                  <tr
                    key={visa.id}
                    onClick={() => setSelectedVisa(visa)}
                    className="cursor-pointer transition-colors hover:bg-background/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {student?.firstName} {student?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{visa.visaType}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge kind="visa" status={visa.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{appDate}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{apptDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {visa.visaNumber || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredVisas.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No visa records found. Try adjusting your search or filters.</p>
          </div>
        )}

        {selectedVisa && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-background/50 backdrop-blur-sm"
            onClick={() => setSelectedVisa(null)}
          >
            <div
              className="w-full max-w-md max-h-screen overflow-y-auto border-l border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold text-foreground">Visa Details</h2>
                <button
                  onClick={() => setSelectedVisa(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Student</div>
                  <div className="font-medium text-foreground">
                    {mockStudents.find((s) => s.id === selectedVisa.studentId)?.firstName}{' '}
                    {mockStudents.find((s) => s.id === selectedVisa.studentId)?.lastName}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Visa Type</div>
                  <div className="font-medium text-foreground">{selectedVisa.visaType}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                  <StatusBadge kind="visa" status={selectedVisa.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Application Date
                    </div>
                    <div className="text-foreground">
                      {new Date(selectedVisa.applicationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {selectedVisa.appointmentDate && (
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Appointment
                      </div>
                      <div className="text-foreground">
                        {new Date(selectedVisa.appointmentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {selectedVisa.visaNumber && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Visa Number</div>
                    <div className="font-medium text-foreground">{selectedVisa.visaNumber}</div>
                  </div>
                )}

                {selectedVisa.expiryDate && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Expiry Date</div>
                    <div className="text-foreground">
                      {new Date(selectedVisa.expiryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Required Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedVisa.documents).map(([doc, submitted]) => (
                      <div key={doc} className="flex items-center gap-3 rounded bg-background p-2">
                        <div
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 ${
                            submitted
                              ? 'border-green-500/50 bg-green-500/20'
                              : 'border-slate-500/50 bg-slate-500/20'
                          }`}
                        >
                          {submitted && <span className="text-xs text-green-400">✓</span>}
                        </div>
                        <span className="text-sm text-foreground capitalize">
                          {doc.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
