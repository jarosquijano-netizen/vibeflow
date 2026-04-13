'use client';

const MONO = "'JetBrains Mono', monospace";

const STATS = [
  { value: '45,120 XP', label: 'Total XP Distributed', color: '#00FF88' },
  { value: '14',        label: 'Features Shipped',      color: '#00FF88' },
  { value: '8',         label: 'Prizes Awarded',        color: '#FFD700' },
  { value: '5',         label: 'Active Operators',      color: '#00D4FF' },
];

export default function ControllerStats() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}
    >
      {STATS.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: '#111118',
            border: '1px solid #3B4B3D',
            borderTop: `2px solid ${stat.color}`,
            borderRadius: 6,
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              fontWeight: 900,
              color: stat.color,
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
