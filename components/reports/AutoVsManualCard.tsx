'use client';

import { PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { ReportsSummary } from '@/lib/reports-engine';

const MONO = "'JetBrains Mono', monospace";

interface AutoVsManualCardProps {
  summary: ReportsSummary;
  autoCount: number;
  manualCount: number;
}

export default function AutoVsManualCard({
  summary,
  autoCount,
  manualCount,
}: AutoVsManualCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const { autoStatusPct } = summary;
  const total = autoCount + manualCount;

  const autoColor = isCyber ? '#00FF88' : '#16A34A';
  const manualColor = isCyber ? '#2A2A3E' : '#E2E8F0';
  const cardBg = isCyber ? '#111118' : '#FFFFFF';
  const cardBorder = isCyber ? '#2A2A3E' : '#E2E8F0';
  const headerColor = isCyber ? '#BF00FF' : '#7C3AED';

  const donutData =
    total === 0
      ? [{ value: 1, color: manualColor }]
      : [
          { value: autoCount, color: autoColor },
          { value: manualCount, color: manualColor },
        ];

  const isHealthy = autoStatusPct >= 70;
  const calloutBg = isCyber ? '#001A10' : (isHealthy ? '#F0FDF4' : '#FFFBEB');
  const calloutBorder = isHealthy
    ? (isCyber ? '#00FF88' : '#16A34A')
    : '#D97706';
  const calloutText = isHealthy
    ? (isCyber ? '#00FF88' : '#16A34A')
    : '#D97706';

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
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: isCyber ? '0.1em' : '0.06em',
          color: headerColor,
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        {isCyber ? '✦ STATUS_AUTOMATION' : '✦ Status Update Automation'}
      </div>

      {/* Body: donut + right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <PieChart width={120} height={120}>
            <Pie
              data={donutData}
              cx={60}
              cy={60}
              innerRadius={38}
              outerRadius={56}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          {/* Center label */}
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
                fontSize: 20,
                fontWeight: 700,
                color: isCyber ? '#F0FFF4' : '#0F172A',
                lineHeight: 1,
              }}
            >
              {total === 0 ? '—' : `${autoStatusPct}%`}
            </div>
            <div
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 9,
                color: isCyber ? '#6B7280' : '#94A3B8',
                marginTop: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {isCyber ? 'AUTO' : 'automated'}
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: 13,
              fontWeight: 600,
              color: autoColor,
              marginBottom: 4,
            }}
          >
            {autoCount} {isCyber ? 'AUTO_UPDATES' : 'auto updates'}
          </div>
          <div
            style={{
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: 13,
              color: isCyber ? '#4B5563' : '#94A3B8',
              marginBottom: 16,
            }}
          >
            {manualCount} {isCyber ? 'MANUAL_UPDATES' : 'manual updates'}
          </div>

          {/* Callout */}
          <div
            style={{
              background: calloutBg,
              borderLeft: `3px solid ${calloutBorder}`,
              padding: '10px 12px',
              borderRadius: 3,
            }}
          >
            <p
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 11,
                color: calloutText,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {total === 0
                ? (isCyber
                    ? '// No status changes logged yet.'
                    : 'No status changes logged yet. Start closing sessions to track automation.')
                : isHealthy
                ? (isCyber
                    ? `✦ ${autoStatusPct}% of status updates happened automatically. Your team is focused on building, not updating boards.`
                    : `✦ ${autoStatusPct}% of status updates happened automatically. Your team is focused on building, not updating boards.`)
                : (isCyber
                    ? 'TIP: Fill in session goals and prototype URLs to increase automation.'
                    : 'Tip: Fill in session goals and prototype URLs to increase automation.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
