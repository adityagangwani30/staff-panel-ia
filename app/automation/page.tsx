'use client'

import { AppLayout } from '@/components/app-shell/layout'
import { mockAutomationRules, mockSLAMetrics } from '@/lib/mock-data'
import { useState } from 'react'
import { Plus, AlertCircle, Clock, CheckCircle2, Zap } from 'lucide-react'

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules] = useState(mockAutomationRules)
  const [metrics] = useState(mockSLAMetrics)

  const breachedMetrics = metrics.filter((m) => m.status === 'Breached')
  const atRiskMetrics = metrics.filter((m) => m.status === 'At Risk')
  const onTrackMetrics = metrics.filter((m) => m.status === 'On Track')

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automation & SLA Monitoring</h1>
          <p className="text-muted-foreground mt-2">Manage automation rules and track SLA compliance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4" />
            Automation Rules
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'sla'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            SLA Monitoring
          </button>
        </div>

        {/* Automation Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Active Rules</h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Rule
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rules.map((rule) => (
                <div key={rule.id} className={`border border-border rounded-lg p-6 ${!rule.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{rule.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            rule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Trigger</p>
                      <p className="text-foreground mt-1">{rule.trigger}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Conditions</p>
                      <ul className="text-foreground mt-1 space-y-1">
                        {rule.conditions.map((cond, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{cond}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Actions</p>
                      <ul className="text-foreground mt-1 space-y-1">
                        {rule.actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <button className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-medium text-foreground hover:bg-background/80 transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-medium text-foreground hover:bg-background/80 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLA Monitoring Tab */}
        {activeTab === 'sla' && (
          <div className="space-y-6">
            {/* Breached Metrics */}
            {breachedMetrics.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-red-400">SLA Breaches ({breachedMetrics.length})</h3>
                </div>

                <div className="space-y-3">
                  {breachedMetrics.map((metric) => (
                    <div key={metric.id} className="bg-background rounded-lg p-4 border border-red-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{metric.name}</p>
                        <span className="text-xs font-medium text-red-400 bg-red-500/20 px-2 py-1 rounded">
                          Breached
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: {metric.target}h | Actual: {metric.actual}h | Due: {metric.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* At Risk Metrics */}
            {atRiskMetrics.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-400">At Risk ({atRiskMetrics.length})</h3>
                </div>

                <div className="space-y-3">
                  {atRiskMetrics.map((metric) => (
                    <div key={metric.id} className="bg-background rounded-lg p-4 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{metric.name}</p>
                        <span className="text-xs font-medium text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                          At Risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: {metric.target}h | Actual: {metric.actual}h | Due: {metric.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* On Track Metrics */}
            {onTrackMetrics.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-green-400">On Track ({onTrackMetrics.length})</h3>
                </div>

                <div className="space-y-3">
                  {onTrackMetrics.map((metric) => (
                    <div key={metric.id} className="bg-background rounded-lg p-4 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">{metric.name}</p>
                        <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded">
                          On Track
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: {metric.target}h | Actual: {metric.actual}h | Due: {metric.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
