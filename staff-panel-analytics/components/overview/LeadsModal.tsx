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
  // Listen for Escape key
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                {title}
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
                  {leadsList.length}
                </span>
              </h3>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800/60 rounded-lg focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {leadsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <svg className="w-12 h-12 stroke-current mb-2" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs">No leads match this category.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800/50 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/40 text-slate-400 font-semibold border-b border-slate-800/50">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Assigned To</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Last Activity</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30 text-slate-300">
                      {leadsList.map((l, idx) => {
                        const lastAct = Calc.getLastActivityDate(l);
                        const lastActStr = lastAct 
                          ? lastAct.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—';
                        return (
                          <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-200">{l.studentName}</td>
                            <td className="px-4 py-3 font-mono text-slate-400 select-all">{l.phone}</td>
                            <td className="px-4 py-3 text-slate-400">{l.counsellorName || 'Unassigned'}</td>
                            <td className="px-4 py-3 text-slate-400">{l.source}</td>
                            <td className="px-4 py-3 font-mono text-slate-400">{lastActStr}</td>
                            <td className="px-4 py-3"><Badge status={l.status} /></td>
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
