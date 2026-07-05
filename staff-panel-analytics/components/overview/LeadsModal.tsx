'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Lead } from '@/lib/types';
import { Calc } from '@/lib/calculations';
import { Badge } from '@/components/ui/Badge';

interface LeadsModalProps {
  isOpen: boolean;
  title: string;
  leadsList: Lead[];
  onClose: () => void;
}

export function LeadsModal({ isOpen, title, leadsList, onClose }: LeadsModalProps) {
  // Keyboard: Escape closes; trap focus within modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leads-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: '1px solid var(--border)' }}>
              <h3
                id="leads-modal-title"
                className="text-[15px] font-semibold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
                <span
                  className="px-2 py-0.5 text-[11px] font-bold rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                >
                  {leadsList.length}
                </span>
              </h3>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {leadsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                       style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                         style={{ color: 'var(--text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    No leads match this category.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full text-left text-[12px] border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        {['Name', 'Phone', 'Assigned To', 'Source', 'Last Activity', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap"
                              style={{ color: 'var(--text-muted)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leadsList.map((l, idx) => {
                        const lastAct = Calc.getLastActivityDate(l);
                        const lastActStr = lastAct
                          ? lastAct.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—';
                        return (
                          <tr key={idx} className="transition-colors hover:bg-white/[0.025]"
                              style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {l.studentName}
                            </td>
                            <td className="px-4 py-3 font-mono select-all" style={{ color: 'var(--text-secondary)' }}>
                              {l.phone}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                              {l.counsellorName || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                              {l.source}
                            </td>
                            <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-muted)' }}>
                              {lastActStr}
                            </td>
                            <td className="px-4 py-3">
                              <Badge status={l.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
