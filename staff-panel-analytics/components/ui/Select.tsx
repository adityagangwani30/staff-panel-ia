'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label className="text-[12px] font-semibold select-none" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`appearance-none text-[12px] font-medium rounded-lg px-3 py-1.5 pr-8 
                      focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer 
                      transition-colors ${className}`}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none"
             style={{ color: 'var(--text-muted)' }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
