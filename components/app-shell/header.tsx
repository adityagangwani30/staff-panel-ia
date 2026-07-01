'use client'

import { Search, Bell, LogOut, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { mockNotifications } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const unreadNotifications = mockNotifications.filter((n) => !n.read)

  return (
    <header className="h-16 bg-card border-b border-border fixed top-0 right-0 left-64 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students, tasks..."
            className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-background rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-0 z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadNotifications.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {unreadNotifications.length} unread
                  </p>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.length > 0 ? (
                  mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-4 border-b border-border last:border-b-0 hover:bg-background/50 transition-colors cursor-pointer',
                        !notif.read && 'bg-background/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            notif.type === 'urgent' && 'bg-destructive',
                            notif.type === 'warning' && 'bg-yellow-500',
                            notif.type === 'info' && 'bg-primary'
                          )}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(notif.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-background rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-medium text-primary-foreground">
              SJ
            </div>
            <span className="text-sm text-foreground hidden sm:inline">Sarah Johnson</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-0 z-50">
              <div className="p-4 border-b border-border">
                <p className="font-medium text-foreground">Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">Admin Staff</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <hr className="my-2 border-border" />
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-background rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
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
