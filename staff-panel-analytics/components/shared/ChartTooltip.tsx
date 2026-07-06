/** Shared Recharts custom tooltip — design-token aware. */

interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly any[];
  label?: any;
  /** Suffix appended after numeric values (e.g. '%') */
  valueSuffix?: string;
}

export function ChartTooltip({ active, payload, label, valueSuffix = '' }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5 text-[12px] shadow-xl min-w-[140px]"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      {label !== undefined && label !== null && (
        <div className="font-semibold mb-1.5">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span
            className="font-mono font-semibold"
            style={{ color: p.color ?? 'var(--text-primary)' }}
          >
            {p.value}{valueSuffix}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Single-item donut tooltip — shows name + lead count. */
export function DonutTooltip({ active, payload }: Pick<ChartTooltipProps, 'active' | 'payload'>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px] shadow-xl"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="font-semibold">{payload[0].name}</div>
      <div style={{ color: 'var(--text-muted)' }}>{payload[0].value} leads</div>
    </div>
  );
}
