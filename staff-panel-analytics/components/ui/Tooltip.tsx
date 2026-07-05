'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MetricTooltipDefs } from '@/lib/tooltips';

interface TooltipProps {
  tooltipKey: string;
  alignRight?: boolean;
}

export function Tooltip({ tooltipKey, alignRight = false }: TooltipProps) {
  const info = MetricTooltipDefs[tooltipKey];
  const [isOpen, setIsOpen] = useState(false);

  if (!info) return null;

  return (
    <div 
      className="relative inline-block z-10"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="text-slate-400 hover:text-slate-200 transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        aria-label={`Information about ${tooltipKey}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <circle cx={12} cy={12} r={10} />
          <line x1={12} y1={16} x2={12} y2={12} />
          <line x1={12} y1={8} x2={12.01} y2={8} />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute bottom-full mb-2 w-64 bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs shadow-xl text-left ${
              alignRight ? 'right-0' : 'left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="space-y-2">
              <div>
                <strong className="text-slate-300 font-bold block mb-0.5">Definition</strong>
                <p className="text-slate-400 leading-relaxed">{info.def}</p>
              </div>
              <div>
                <strong className="text-slate-300 font-bold block mb-0.5">Formula</strong>
                <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/50 block font-mono break-all mt-0.5">
                  {info.formula}
                </code>
              </div>
              <div>
                <strong className="text-slate-300 font-bold block mb-0.5">Data Used</strong>
                <p className="text-slate-400">{info.data}</p>
              </div>
              {info.business && (
                <div>
                  <strong className="text-slate-300 font-bold block mb-0.5">Business Use</strong>
                  <p className="text-slate-400 italic leading-relaxed">{info.business}</p>
                </div>
              )}
            </div>
            {/* Popover arrow */}
            <div 
              className={`absolute top-full border-4 border-transparent border-t-slate-900 ${
                alignRight ? 'right-3' : 'left-1/2 -translate-x-1/2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
