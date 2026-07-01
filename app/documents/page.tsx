'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { StatusBadge } from '@/components/status-badge'
import {
  DOCUMENT_STATUSES,
  getDocumentCompletionPercentage,
  mockDocuments,
  mockStudents,
  type DocumentRecord,
} from '@/lib/mock-data'
import { ChevronDown, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'

const CATEGORIES = Array.from(new Set(mockDocuments.map((document) => document.category))).sort()

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  })
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null)

  const filteredDocuments = useMemo(() => {
    return mockDocuments.filter((document) => {
      const student = mockStudents.find((s) => s.id === document.studentId)
      const matchesSearch =
        document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        document.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.lastName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !filters.status || document.status === filters.status
      const matchesCategory = !filters.category || document.category === filters.category

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchQuery, filters])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <p className="mt-2 text-muted-foreground">
              Track upload, verification, and completion status for student documents
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Completion</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {getDocumentCompletionPercentage()}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {DOCUMENT_STATUSES.map((status) => (
            <div key={status} className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{status}</div>
              <div className="mt-2 text-xl font-bold text-foreground">
                {mockDocuments.filter((document) => document.status === status).length}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by document name, category, or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'status', label: 'Status', options: DOCUMENT_STATUSES },
              { key: 'category', label: 'Category', options: CATEGORIES },
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Document</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Review</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocuments.map((document) => {
                const student = mockStudents.find((student) => student.id === document.studentId)
                return (
                  <tr
                    key={document.id}
                    onClick={() => setSelectedDocument(document)}
                    className="cursor-pointer transition-colors hover:bg-background/50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {student?.firstName} {student?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{document.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{document.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge kind="document" status={document.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {document.reviewedAt
                        ? new Date(document.reviewedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Pending'}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {document.expiryDate
                        ? new Date(document.expiryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No documents found. Try adjusting your search or filters.</p>
          </div>
        )}

        {selectedDocument && (
          <div
            className="fixed inset-0 z-50 flex items-end bg-background/50 backdrop-blur-sm"
            onClick={() => setSelectedDocument(null)}
          >
            <div
              className="w-full max-w-md max-h-screen overflow-y-auto border-l border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border p-6">
                <h2 className="text-xl font-bold text-foreground">Document Details</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Student</div>
                  <div className="font-medium text-foreground">
                    {mockStudents.find((student) => student.id === selectedDocument.studentId)?.firstName}{' '}
                    {mockStudents.find((student) => student.id === selectedDocument.studentId)?.lastName}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Document</div>
                  <div className="font-medium text-foreground">{selectedDocument.name}</div>
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                  <StatusBadge kind="document" status={selectedDocument.status} />
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Reviewer</div>
                  <div className="text-foreground">{selectedDocument.reviewer || 'Unassigned'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Uploaded</div>
                    <div className="text-foreground">
                      {selectedDocument.uploadedAt
                        ? new Date(selectedDocument.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Reviewed</div>
                    <div className="text-foreground">
                      {selectedDocument.reviewedAt
                        ? new Date(selectedDocument.reviewedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Pending'}
                    </div>
                  </div>
                </div>

                {selectedDocument.comments && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Comments</div>
                    <div className="rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                      {selectedDocument.comments}
                    </div>
                  </div>
                )}

                {selectedDocument.expiryDate && (
                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Expiry</div>
                    <div className="text-foreground">
                      {new Date(selectedDocument.expiryDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
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
