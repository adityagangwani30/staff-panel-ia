'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { StatusBadge } from '@/components/status-badge'
import { getPaymentsSummary, mockPayments, mockStudents, type Payment } from '@/lib/mock-data'
import { AlertCircle, CheckCircle, ChevronDown, Clock, DollarSign, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

const PAYMENT_TYPES = Array.from(new Set(mockPayments.map((p) => p.type))).sort()
const STATUSES = ['Pending', 'Completed', 'Failed', 'Refunded']

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  })
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const student = mockStudents.find((s) => s.id === payment.studentId)
      const matchesSearch =
        (student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (student?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = !filters.type || payment.type === filters.type
      const matchesStatus = !filters.status || payment.status === filters.status

      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchQuery, filters])

  const summary = getPaymentsSummary()

  const statusIcons = {
    Pending: Clock,
    Completed: CheckCircle,
    Failed: AlertCircle,
    Refunded: CheckCircle,
  }

  const typeStats = useMemo(() => {
    return PAYMENT_TYPES.map((type) => ({
      type,
      count: mockPayments.filter((p) => p.type === type).length,
      total: mockPayments.filter((p) => p.type === type).reduce((sum, p) => sum + p.amount, 0),
    }))
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-2">Track and manage all student payments</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Total Amount</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  ${(summary.total / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Completed</p>
                <p className="mt-2 text-3xl font-bold text-green-400">
                  ${(summary.completed / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-400">
                  ${(summary.pending / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="rounded-lg bg-yellow-500/20 p-3 text-yellow-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Failed</p>
                <p className="mt-2 text-3xl font-bold text-red-400">
                  ${(summary.failed / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="rounded-lg bg-red-500/20 p-3 text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {typeStats.map((stat) => (
            <div key={stat.type} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 text-sm text-muted-foreground">{stat.type}</div>
              <div className="text-lg font-bold text-foreground">{stat.count}</div>
              <div className="mt-2 text-xs text-muted-foreground">${stat.total.toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'type', label: 'Type', options: PAYMENT_TYPES },
              { key: 'status', label: 'Status', options: STATUSES },
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((payment) => {
                const student = mockStudents.find((s) => s.id === payment.studentId)
                const StatusIcon = statusIcons[payment.status as keyof typeof statusIcons]
                const dueDate = new Date(payment.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })

                return (
                  <tr
                    key={payment.id}
                    onClick={() => setSelectedPayment(payment)}
                    className="cursor-pointer transition-colors hover:bg-background/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {student?.firstName} {student?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{payment.type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <StatusBadge kind="payment" status={payment.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{dueDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No payments found. Try adjusting your search or filters.</p>
          </div>
        )}

        {selectedPayment && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-background/50 backdrop-blur-sm"
            onClick={() => setSelectedPayment(null)}
          >
            <div
              className="w-full max-w-md max-h-screen overflow-y-auto border-l border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold text-foreground">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Student</div>
                  <div className="font-medium text-foreground">
                    {mockStudents.find((s) => s.id === selectedPayment.studentId)?.firstName}{' '}
                    {mockStudents.find((s) => s.id === selectedPayment.studentId)?.lastName}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Type</div>
                  <div className="font-medium text-foreground">{selectedPayment.type}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Description</div>
                  <div className="text-foreground">{selectedPayment.description}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                  <StatusBadge kind="payment" status={selectedPayment.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Amount</div>
                    <div className="text-lg font-bold text-foreground">
                      ${selectedPayment.amount.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Currency</div>
                    <div className="font-medium text-foreground">{selectedPayment.currency}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Due Date</div>
                    <div className="text-foreground">
                      {new Date(selectedPayment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {selectedPayment.paidDate && (
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Paid Date</div>
                      <div className="text-foreground">
                        {new Date(selectedPayment.paidDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Edit Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
