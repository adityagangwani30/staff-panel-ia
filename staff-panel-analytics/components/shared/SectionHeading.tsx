interface SectionHeadingProps {
  title: string;
  sub?: string;
}

/** Consistent two-line section header used throughout the dashboard. */
export function SectionHeading({ title, sub }: SectionHeadingProps) {
  return (
    <div className="mb-4">
      <h2 className="text-[20px] font-semibold text-white leading-tight">{title}</h2>
      {sub && (
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
