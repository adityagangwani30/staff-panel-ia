'use client'

import { cn } from '@/lib/utils'

const priorityStyles: Record<string, string> = {
  Low: 'bg-emerald-500/20 text-emerald-300',
  Medium: 'bg-amber-500/20 text-amber-300',
  High: 'bg-orange-500/20 text-orange-300',
  Critical: 'bg-red-500/20 text-red-300',
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        priorityStyles[priority] ?? 'bg-slate-500/20 text-slate-300',
        className,
      )}
    >
      {priority}
    </span>
  )
}
