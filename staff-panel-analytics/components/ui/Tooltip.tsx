'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MetricTooltipDefs } from '@/lib/tooltips';

interface TooltipProps {
  tooltipKey: string;
  alignRight?: boolean;
}

export function Tooltip({ tooltipKey, alignRight = false }: TooltipProps) {
  const info = MetricTooltipDefs[tooltipKey];
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  if (!info) return null;

  const open  = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); };
  const close = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 120); };

  return (
    <div
      className="relative inline-block z-20"
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <button
        type="button"
        className="flex items-center justify-center w-4 h-4 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{ color: 'var(--text-muted)' }}
        aria-label={`Information about ${info.def.slice(0, 40)}`}
        onClick={e => { e.stopPropagation(); setIsOpen(v => !v); }}
        onFocus={open}
        onBlur={close}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx={12} cy={12} r={10} />
          <line x1={12} y1={16} x2={12} y2={12} />
          <line x1={12} y1={8} x2={12.01} y2={8} />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={`absolute bottom-full mb-2.5 w-72 rounded-xl p-4 text-[12px] shadow-2xl z-50 ${
              alignRight ? 'right-0' : 'left-1/2 -translate-x-1/2'
            }`}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong, rgba(255,255,255,0.12))',
            }}
            onMouseEnter={open}
            onMouseLeave={close}
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
            {/* Arrow */}
            <div
              className={`absolute top-full border-[5px] border-transparent ${alignRight ? 'right-3' : 'left-1/2 -translate-x-1/2'}`}
              style={{ borderTopColor: 'rgba(255,255,255,0.12)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
