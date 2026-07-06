'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { MetricTooltipDefs } from '@/lib/tooltips';

interface TooltipProps {
  tooltipKey: string;
  alignRight?: boolean;
}

export function Tooltip({ tooltipKey, alignRight = false }: TooltipProps) {
  const info = MetricTooltipDefs[tooltipKey];

  if (!info) return null;

  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            className="flex items-center justify-center w-4 h-4 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            aria-label={`Information about ${info.def.slice(0, 40)}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={16} x2={12} y2={12} />
              <line x1={12} y1={8} x2={12.01} y2={8} />
            </svg>
          </button>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            align={alignRight ? 'end' : 'center'}
            sideOffset={6}
            className="z-50 w-72 rounded-xl p-4 text-[12px] shadow-2xl select-text
                       animate-in fade-in-0 zoom-in-95 duration-100 ease-out"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong, rgba(255,255,255,0.12))',
              color: 'var(--text-primary)',
            }}
          >
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Definition
                </p>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{info.def}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Formula
                </p>
                <code
                  className="block font-mono text-[11px] px-2.5 py-1.5 rounded-lg break-all"
                  style={{
                    color: '#93C5FD',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                  }}
                >
                  {info.formula}
                </code>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Data Used
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>{info.data}</p>
              </div>
              {info.business && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                    Business Use
                  </p>
                  <p className="italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{info.business}</p>
                </div>
              )}
            </div>
            <TooltipPrimitive.Arrow
              className="fill-current"
              style={{ color: 'var(--border-strong, rgba(255,255,255,0.12))' }}
              width={10}
              height={5}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
