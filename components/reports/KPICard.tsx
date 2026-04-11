interface KPICardProps {
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
}

const DELTA_COLORS = {
  positive: '#16A34A',
  negative: '#DC2626',
  neutral: '#94A3B8',
};

export default function KPICard({ label, value, delta, deltaType }: KPICardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#94A3B8',
          fontFamily: 'var(--font-dm-sans)',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0F172A',
          fontFamily: 'var(--font-dm-sans)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: DELTA_COLORS[deltaType],
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {delta}
      </div>
    </div>
  );
}
