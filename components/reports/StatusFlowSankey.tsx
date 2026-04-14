'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@/components/providers/ThemeProvider';

const MONO = "'JetBrains Mono', monospace";

const STATUS_DATA = [
  { name: 'IDEA',        value: 3,  color: '#94A3B8', cyberColor: '#6B7280' },
  { name: 'SCOPING',     value: 2,  color: '#7C3AED', cyberColor: '#BF00FF' },
  { name: 'PROTOTYPING', value: 3,  color: '#2563EB', cyberColor: '#00D4FF' },
  { name: 'BUILDING',    value: 6,  color: '#D97706', cyberColor: '#FFB800' },
  { name: 'DONE',        value: 8,  color: '#16A34A', cyberColor: '#00FF88' },
  { name: 'PARKED',      value: 2,  color: '#DC2626', cyberColor: '#FF4444' },
];

const TOTAL = STATUS_DATA.reduce((s, d) => s + d.value, 0);

export default function StatusFlowSankey() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const data = STATUS_DATA.map((d) => ({
    ...d,
    fill: isCyber ? d.cyberColor : d.color,
  }));

  return (
    <div
      style={{
        background: isCyber ? '#111118' : '#FFFFFF',
        border: `1px solid ${isCyber ? '#2A2A3E' : '#E2E8F0'}`,
        borderRadius: 6,
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: isCyber ? '0.1em' : '0.06em',
          color: isCyber ? '#6B7280' : '#94A3B8',
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {isCyber ? '// FEATURE_STATUS' : 'Feature Status'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              cx={80}
              cy={80}
              innerRadius={50}
              outerRadius={74}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 22,
                fontWeight: isCyber ? 700 : 600,
                color: isCyber ? '#F0FFF4' : '#0F172A',
                lineHeight: 1,
              }}
            >
              {TOTAL}
            </div>
            <div
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 10,
                color: isCyber ? '#6B7280' : '#94A3B8',
                marginTop: 2,
                textTransform: 'uppercase',
              }}
            >
              total
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
          {data.map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: d.fill,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  fontSize: 11,
                  color: isCyber ? '#6B7280' : '#475569',
                  flex: 1,
                }}
              >
                {d.name}
              </span>
              <span
                style={{
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  fontSize: 11,
                  color: isCyber ? '#4B5563' : '#94A3B8',
                }}
              >
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
