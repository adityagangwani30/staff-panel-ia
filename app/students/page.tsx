'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { mockStudents } from '@/lib/mock-data'
import { useState, useMemo } from 'react'
import { Search, ChevronDown, X, CheckSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'

const COUNTRIES = Array.from(new Set(mockStudents.map((s) => s.country))).sort()
const UNIVERSITIES = Array.from(new Set(mockStudents.map((s) => s.university))).sort()
const INTAKES = Array.from(new Set(mockStudents.map((s) => s.intake))).sort()
const STAGES = ['Lead', 'Applied', 'Under Review', 'Interview', 'Accepted', 'Enrolled', 'Rejected']
const STAFF = Array.from(new Set(mockStudents.map((s) => s.assignedStaff))).sort()
const COUNSELORS = Array.from(new Set(mockStudents.map((s) => s.assignedCounselor || s.assignedStaff))).sort()
const PRIORITIES = ['High', 'Medium', 'Low']

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState(mockStudents)
  const [filters, setFilters] = useState({
    country: '',
    university: '',
    intake: '',
    stage: '',
    staff: '',
    counselor: '',
    priority: '',
  })
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkAction, setBulkAction] = useState<string | null>(null)
  const [actionData, setActionData] = useState<string | null>(null)
  const [bulkNotice, setBulkNotice] = useState<string | null>(null)

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCountry = !filters.country || student.country === filters.country
      const matchesUniversity = !filters.university || student.university === filters.university
      const matchesIntake = !filters.intake || student.intake === filters.intake
      const matchesStage = !filters.stage || student.admissionStage === filters.stage
      const matchesStaff = !filters.staff || student.assignedStaff === filters.staff
      const matchesCounselor =
        !filters.counselor || (student.assignedCounselor || student.assignedStaff) === filters.counselor
      const matchesPriority = !filters.priority || student.priority === filters.priority

      return (
        matchesSearch &&
        matchesCountry &&
        matchesUniversity &&
        matchesIntake &&
        matchesStage &&
        matchesStaff &&
        matchesCounselor &&
        matchesPriority
      )
    })
  }, [searchQuery, filters, students])

  const applyBulkAction = () => {
    const selectedIds = new Set(selectedStudents)

    if (bulkAction === 'reassign' && actionData) {
      setStudents((current) =>
        current.map((student) =>
          selectedIds.has(student.id)
            ? { ...student, assignedStaff: actionData }
            : student,
        ),
      )
      setBulkNotice(`Reassigned ${selectedIds.size} student(s) to ${actionData}.`)
    }

    if (bulkAction === 'status' && actionData) {
      setStudents((current) =>
        current.map((student) =>
          selectedIds.has(student.id) ? { ...student, admissionStage: actionData as (typeof student)['admissionStage'] } : student,
        ),
      )
      setBulkNotice(`Updated ${selectedIds.size} student(s) to ${actionData}.`)
    }

    if (bulkAction === 'priority' && actionData) {
      setStudents((current) =>
        current.map((student) =>
          selectedIds.has(student.id) ? { ...student, priority: actionData as (typeof student)['priority'] } : student,
        ),
      )
      setBulkNotice(`Updated ${selectedIds.size} student(s) to ${actionData} priority.`)
    }

    if (bulkAction === 'notification' && actionData) {
      setBulkNotice(`Notification queued for ${selectedIds.size} student(s): ${actionData}`)
    }

    setSelectedStudents(new Set())
    setBulkAction(null)
    setActionData(null)
    setShowBulkActions(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-2">Manage and view all student applications</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'country', label: 'Country', options: COUNTRIES },
              { key: 'university', label: 'University', options: UNIVERSITIES },
              { key: 'intake', label: 'Intake', options: INTAKES },
              { key: 'stage', label: 'Stage', options: STAGES },
              { key: 'staff', label: 'Staff', options: STAFF },
              { key: 'counselor', label: 'Counselor', options: COUNSELORS },
              { key: 'priority', label: 'Priority', options: PRIORITIES },
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
                    <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">
                      {filters[filterGroup.key as keyof typeof filters]}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {expandedFilter === filterGroup.key && (
                  <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-lg shadow-lg z-50 min-w-48">
                    <button
                      onClick={() => {
                        setFilters({ ...filters, [filterGroup.key]: '' })
                        setExpandedFilter(null)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors border-b border-border"
                    >
                      All {filterGroup.label}
                    </button>
                    {filterGroup.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilters({ ...filters, [filterGroup.key]: option })
                          setExpandedFilter(null)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          filters[filterGroup.key as keyof typeof filters] === option
                            ? 'bg-primary/20 text-primary'
                            : 'text-foreground hover:bg-background'
                        }`}
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

        {/* Students Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-6 py-4 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(new Set(filteredStudents.map((s) => s.id)))
                        } else {
                          setSelectedStudents(new Set())
                        }
                        setShowBulkActions(e.target.checked && filteredStudents.length > 0)
                      }}
                      className="rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    University
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Intake
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Counselor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedStudents)
                          if (e.target.checked) {
                            newSelected.add(student.id)
                          } else {
                            newSelected.delete(student.id)
                          }
                          setSelectedStudents(newSelected)
                          setShowBulkActions(newSelected.size > 0)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground cursor-pointer">
                      <Link href={`/students/${student.id}`} className="block">
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.country}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.university}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.intake}</td>
                    <td className="px-6 py-4">
                      <StatusBadge kind="student" status={student.admissionStage} />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.assignedStaff}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {student.assignedCounselor || student.assignedStaff}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={student.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No students found matching your filters</p>
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students
        </div>

        {bulkNotice && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
            {bulkNotice}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {showBulkActions && selectedStudents.size > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg p-4 shadow-lg flex items-center gap-4 z-50">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{selectedStudents.size} selected</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBulkAction('reassign')
                  setShowBulkActions(false)
                }}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background/80 transition-colors"
              >
                Reassign Staff
              </button>
              <button
                onClick={() => {
                  setBulkAction('status')
                  setShowBulkActions(false)
                }}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background/80 transition-colors"
              >
                Update Stage
              </button>
              <button
                onClick={() => {
                  setBulkAction('priority')
                  setShowBulkActions(false)
                }}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background/80 transition-colors"
              >
                Change Priority
              </button>
              <button
                onClick={() => {
                  setBulkAction('notification')
                  setShowBulkActions(false)
                }}
                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background/80 transition-colors"
              >
                Send Notification
              </button>
              <button
                onClick={() => {
                  setSelectedStudents(new Set())
                  setShowBulkActions(false)
                }}
                className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Action Modal */}
        {bulkAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {bulkAction === 'reassign' && 'Reassign Staff'}
                  {bulkAction === 'status' && 'Update Admission Stage'}
                  {bulkAction === 'priority' && 'Change Priority'}
                  {bulkAction === 'notification' && 'Send Notification'}
                </h3>
                <button
                  onClick={() => setBulkAction(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                {bulkAction === 'reassign' && (
                  <select
                    value={actionData || ''}
                    onChange={(e) => setActionData(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select staff member...</option>
                    {STAFF.map((staff) => (
                      <option key={staff} value={staff}>
                        {staff}
                      </option>
                    ))}
                  </select>
                )}

                {bulkAction === 'status' && (
                  <select
                    value={actionData || ''}
                    onChange={(e) => setActionData(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select stage...</option>
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                )}

                {bulkAction === 'priority' && (
                  <select
                    value={actionData || ''}
                    onChange={(e) => setActionData(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select priority...</option>
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                )}

                {bulkAction === 'notification' && (
                  <textarea
                    value={actionData || ''}
                    onChange={(e) => setActionData(e.target.value)}
                    placeholder="Enter your message..."
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyBulkAction}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Apply to {selectedStudents.size}
                </button>
                <button
                  onClick={() => {
                    setBulkAction(null)
                    setActionData(null)
                    setShowBulkActions(true)
                  }}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-medium hover:bg-background/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
