'use client';

import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useTheme } from '@/components/providers/ThemeProvider';

const MONO = "'JetBrains Mono', monospace";

const WEEKLY_DATA = [
  { week: 'W19', hours: 3.5, sessions: 2 },
  { week: 'W20', hours: 7.0, sessions: 4 },
  { week: 'W21', hours: 5.5, sessions: 3 },
  { week: 'W22', hours: 9.0, sessions: 5 },
  { week: 'W23', hours: 6.5, sessions: 4 },
  { week: 'W24', hours: 11.0, sessions: 6 },
  { week: 'W25', hours: 8.0, sessions: 5 },
  { week: 'W26', hours: 4.5, sessions: 3 },
];

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}

function DefaultTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const hours = payload.find((p) => p.name === 'hours')?.value ?? 0;
  const sessions = payload.find((p) => p.name === 'sessions')?.value ?? 0;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: '8px 10px',
        fontSize: 12,
        fontFamily: 'var(--font-dm-sans)',
        borderRadius: 4,
      }}
    >
      <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#2563EB' }}>{hours}h logged</div>
      <div style={{ color: '#7C3AED' }}>{sessions} sessions</div>
    </div>
  );
}

function CyberTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const hours = payload.find((p) => p.name === 'hours')?.value ?? 0;
  const sessions = payload.find((p) => p.name === 'sessions')?.value ?? 0;
  return (
    <div
      style={{
        background: '#0D0D17',
        border: '1px solid #3B4B3D',
        padding: '8px 10px',
        fontFamily: MONO,
        fontSize: 12,
        borderRadius: 4,
      }}
    >
      <div style={{ color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#00FF88' }}>{hours}H LOGGED</div>
      <div style={{ color: '#BF00FF' }}>{sessions} SESSIONS</div>
    </div>
  );
}

interface SessionTimeChartProps {
  /** Optionally override with real data */
  data?: { week: string; hours: number; sessions: number }[];
}

export default function SessionTimeChart({ data = WEEKLY_DATA }: SessionTimeChartProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const barColor = isCyber ? '#00FF88' : '#2563EB';
  const lineColor = isCyber ? '#BF00FF' : '#7C3AED';
  const gridColor = isCyber ? '#2A2A3E' : '#F1F5F9';
  const axisColor = isCyber ? '#4B5563' : '#94A3B8';
  const cardBg = isCyber ? '#111118' : '#FFFFFF';
  const cardBorder = isCyber ? '#2A2A3E' : '#E2E8F0';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
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
          marginBottom: 4,
        }}
      >
        {isCyber ? '// SESSION_HOURS_WEEKLY' : 'Session Hours by Week'}
      </div>
      <div
        style={{
          fontSize: 11,
          color: isCyber ? '#4B5563' : '#CBD5E1',
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          marginBottom: 12,
        }}
      >
        {isCyber ? 'BARS = hours · LINE = session count' : 'Bars = hours logged · Line = session count'}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fill: axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="hours"
            domain={[0, 15]}
            tick={{ fontSize: 11, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fill: axisColor }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
          />
          <YAxis
            yAxisId="sessions"
            orientation="right"
            domain={[0, 10]}
            tick={{ fontSize: 11, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fill: axisColor }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={isCyber ? <CyberTooltip /> : <DefaultTooltip />}
            cursor={{ fill: isCyber ? 'rgba(0,255,136,0.03)' : 'rgba(37,99,235,0.05)' }}
          />
          <Bar
            yAxisId="hours"
            dataKey="hours"
            name="hours"
            fill={barColor}
            radius={[2, 2, 0, 0]}
            maxBarSize={32}
            opacity={isCyber ? 0.85 : 1}
          />
          <Line
            yAxisId="sessions"
            dataKey="sessions"
            name="sessions"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: lineColor }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
