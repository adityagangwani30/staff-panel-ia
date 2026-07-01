'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { mockTasks, mockStudents } from '@/lib/mock-data'
import { useState, useMemo } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'

type StatusFilter = 'All' | 'Pending' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled'
type PriorityFilter = 'All' | 'Low' | 'Medium' | 'High' | 'Critical'

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All')

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
      return matchesStatus && matchesPriority
    })
  }, [statusFilter, priorityFilter])

  const tasksByStatus = {
    Pending: filteredTasks.filter((t) => t.status === 'Pending'),
    'In Progress': filteredTasks.filter((t) => t.status === 'In Progress'),
    Waiting: filteredTasks.filter((t) => t.status === 'Waiting'),
    Completed: filteredTasks.filter((t) => t.status === 'Completed'),
    Cancelled: filteredTasks.filter((t) => t.status === 'Cancelled'),
  }

  const statusStats = [
    {
      label: 'Pending',
      count: tasksByStatus.Pending.length,
      icon: AlertCircle,
      color: 'text-yellow-400 bg-yellow-500/20',
    },
    {
      label: 'In Progress',
      count: tasksByStatus['In Progress'].length,
      icon: Clock,
      color: 'text-blue-400 bg-blue-500/20',
    },
    {
      label: 'Completed',
      count: tasksByStatus.Completed.length,
      icon: CheckCircle2,
      color: 'text-green-400 bg-green-500/20',
    },
    {
      label: 'Waiting',
      count: tasksByStatus.Waiting.length,
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/20',
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage and track all student-related tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-lg p-6 flex items-start justify-between"
              >
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.count}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <label className="text-sm text-muted-foreground flex items-center">Status:</label>
            {(['All', 'Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:border-primary/50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <label className="text-sm text-muted-foreground flex items-center">Priority:</label>
            {(['All', 'Low', 'Medium', 'High', 'Critical'] as PriorityFilter[]).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  priorityFilter === priority
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:border-primary/50'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="space-y-6">
          {['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled'].map((status) => (
            <div key={status}>
              <h2 className="text-lg font-semibold text-foreground mb-4">{status}</h2>
              {tasksByStatus[status as keyof typeof tasksByStatus].length > 0 ? (
                <div className="grid gap-3">
                  {tasksByStatus[status as keyof typeof tasksByStatus].map((task) => {
                    const student = mockStudents.find((s) => s.id === task.studentId)
                    return (
                      <div
                        key={task.id}
                        className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge kind="task" status={task.status} />
                          </div>
                        </div>

                        <p className="text-sm text-foreground mb-4">{task.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Assigned to: {task.assignedTo}</span>
                          <span>
                            Due: {task.dueDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <p className="text-muted-foreground">No tasks in this category</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
