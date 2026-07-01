'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { mockWorkflowStages, mockStaffMembers } from '@/lib/mock-data'
import { useState } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('workflow')
  const [stages, setStages] = useState(mockWorkflowStages)
  const [newStageName, setNewStageName] = useState('')

  const handleAddStage = () => {
    if (newStageName.trim()) {
      setStages([
        ...stages,
        {
          id: `stage-${Date.now()}`,
          name: newStageName,
          order: stages.length + 1,
          color: 'bg-blue-500',
          isCompleted: false,
        },
      ])
      setNewStageName('')
    }
  }

  const handleRemoveStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id))
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure workflows, staff, and system settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'workflow'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Workflow Stages
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'staff'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Staff & Roles
          </button>
        </div>

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Admission Pipeline</h2>

              <div className="space-y-3 mb-6">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">Stage {stage.order}</p>
                    </div>
                    {stages.length > 2 && (
                      <button
                        onClick={() => handleRemoveStage(stage.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Add new stage..."
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddStage()
                  }}
                />
                <button
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Stage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Staff Members</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Students
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Join Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStaffMembers.map((staff) => (
                      <tr key={staff.id} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{staff.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{staff.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{staff.assignedStudentsCount}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {staff.joinDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
