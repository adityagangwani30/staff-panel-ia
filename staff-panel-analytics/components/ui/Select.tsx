import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <label className="text-xs font-semibold text-slate-400 select-none">{label}</label>}
      <div className="relative">
        <select
          className={`appearance-none bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-3.5 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
