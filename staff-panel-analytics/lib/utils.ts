import { Lead } from './types';

/** Milliseconds in one day — avoids magic numbers throughout the codebase */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Value format codes used across KPI cards and tables */
export type MetricFmt = 'n' | '%' | 'd';

/**
 * Format a numeric KPI value for display.
 * @param value  The raw number
 * @param fmt    'n' = integer locale string, '%' = 1dp percentage, 'd' = 1dp days
 */
export function formatMetric(value: number, fmt: MetricFmt): string {
  if (fmt === '%') return `${value.toFixed(1)}%`;
  if (fmt === 'd') return `${value.toFixed(1)}d`;
  return value.toLocaleString();
}

/**
 * Format a Date for display in tables.
 * @param date  A Date object or date string
 * @returns     Formatted string like "Jun 15, 2025" or "—" if null
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns a Date set to midnight on the given date.
 */
export function toMidnight(date: Date): Date {
  return new Date(date.toDateString());
}

/**
 * Standardized click-to-explore handler for the drill-down system.
 * Handles empty checks consistently and invokes the explorer modal callback.
 */
export function exploreLeads(
  onExplore: (title: string, leads: Lead[]) => void,
  title: string,
  leads: Lead[]
) {
  if (!leads || leads.length === 0) {
    alert('No matching leads found.');
    return;
  }
  onExplore(title, leads);
}
