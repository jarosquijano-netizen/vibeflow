'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { FeatureMetrics } from '@/lib/reports-engine';
import { relativeTime } from '@/lib/reports-engine';

const MONO = "'JetBrains Mono', monospace";

const STATUS_COLORS: Record<string, { color: string; bg: string; cyberColor: string; cyberBg: string }> = {
  IDEA:        { color: '#94A3B8', bg: '#F8FAFC',  cyberColor: '#6B7280',  cyberBg: 'rgba(107,114,128,0.1)' },
  SCOPING:     { color: '#7C3AED', bg: '#F5F3FF',  cyberColor: '#BF00FF',  cyberBg: 'rgba(191,0,255,0.1)' },
  PROTOTYPING: { color: '#2563EB', bg: '#EFF6FF',  cyberColor: '#00D4FF',  cyberBg: 'rgba(0,212,255,0.1)' },
  BUILDING:    { color: '#D97706', bg: '#FFF7ED',  cyberColor: '#FFB800',  cyberBg: 'rgba(255,184,0,0.1)' },
  DONE:        { color: '#16A34A', bg: '#F0FDF4',  cyberColor: '#00FF88',  cyberBg: 'rgba(0,255,136,0.1)' },
  PARKED:      { color: '#DC2626', bg: '#FEF2F2',  cyberColor: '#FF4444',  cyberBg: 'rgba(255,68,68,0.1)' },
};

const SIZE_COLORS: Record<string, string> = {
  XS: '#64748B', S: '#16A34A', M: '#2563EB', L: '#D97706', XL: '#DC2626',
};
const SIZE_CYBER: Record<string, string> = {
  XS: '#64748B', S: '#00FF88', M: '#00D4FF', L: '#FFB800', XL: '#FF4444',
};

function timeColor(hours: number, isCyber: boolean): string {
  if (hours < 1) return isCyber ? '#4B5563' : '#94A3B8';
  if (hours < 5) return isCyber ? '#F0FFF4' : '#0F172A';
  if (hours < 20) return '#FFB800';
  return isCyber ? '#FF4444' : '#DC2626';
}

function autoColor(pct: number | null, isCyber: boolean): string {
  if (pct === null) return isCyber ? '#4B5563' : '#94A3B8';
  if (pct >= 70) return isCyber ? '#00FF88' : '#16A34A';
  if (pct < 50) return '#FFB800';
  return isCyber ? '#9CA3AF' : '#64748B';
}

type SortKey = 'featureTitle' | 'status' | 'sessionCount' | 'totalHours' | 'sessionDays' | 'completionPct' | 'lastSessionDate';

interface FeatureVelocityTableProps {
  metrics: FeatureMetrics[];
}

export default function FeatureVelocityTable({ metrics }: FeatureVelocityTableProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [sortKey, setSortKey] = useState<SortKey>('totalHours');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sorted = [...metrics].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const cardBg = isCyber ? '#0A0A0F' : '#FFFFFF';
  const cardBorder = isCyber ? '#2A2A3E' : '#E2E8F0';
  const headerBg = isCyber ? '#12121E' : '#F8FAFC';
  const rowAlt = isCyber ? '#0D0D17' : '#F8FAFC';
  const rowHover = isCyber ? 'rgba(0,255,136,0.03)' : '#EFF6FF';
  const expandBg = isCyber ? '#08080E' : '#F8FAFC';
  const thColor = isCyber ? '#6B7280' : '#94A3B8';
  const bodyColor = isCyber ? '#9CA3AF' : '#0F172A';
  const metaColor = isCyber ? '#4B5563' : '#94A3B8';

  const COLS: { label: string; key: SortKey | null; width?: number | string }[] = [
    { label: isCyber ? 'FEATURE' : 'Feature', key: 'featureTitle' },
    { label: isCyber ? 'STATUS' : 'Status', key: 'status', width: 110 },
    { label: isCyber ? 'SESSIONS' : 'Sessions', key: 'sessionCount', width: 80 },
    { label: isCyber ? 'TIME' : 'Total Time', key: 'totalHours', width: 88 },
    { label: isCyber ? 'DAYS' : 'Session Days', key: 'sessionDays', width: 80 },
    { label: isCyber ? 'AUTO%' : 'Auto %', key: null, width: 64 },
    { label: isCyber ? 'TASKS' : 'Tasks', key: 'completionPct', width: 100 },
    { label: isCyber ? 'LAST_ACTIVE' : 'Last Active', key: 'lastSessionDate', width: 100 },
  ];

  function sortIndicator(key: SortKey | null) {
    if (!key) return null;
    if (sortKey !== key) return <span style={{ marginLeft: 3, color: metaColor }}>↕</span>;
    return <span style={{ marginLeft: 3, color: isCyber ? '#00FF88' : '#2563EB' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      {/* Header bar */}
      <div
        style={{
          padding: '12px 16px',
          background: headerBg,
          borderBottom: `1px solid ${cardBorder}`,
        }}
      >
        <div
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: isCyber ? 11 : 13,
            fontWeight: 700,
            color: isCyber ? '#6B7280' : '#0F172A',
            textTransform: isCyber ? 'uppercase' : 'none',
            letterSpacing: isCyber ? '0.08em' : 0,
          }}
        >
          {isCyber ? '// FEATURE_VELOCITY' : 'Feature Velocity'}
        </div>
        <div
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 11,
            color: metaColor,
            marginTop: 2,
          }}
        >
          {isCyber
            ? '// Time invested per feature across all vibe sessions'
            : 'Time invested per feature across all vibe sessions'}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: headerBg, borderBottom: `1px solid ${cardBorder}`, height: 32 }}>
            {COLS.map(({ label, key, width }) => (
              <th
                key={label}
                onClick={key ? () => handleSort(key) : undefined}
                style={{
                  paddingLeft: 12,
                  paddingRight: 4,
                  textAlign: 'left',
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: thColor,
                  cursor: key ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  width: width ?? undefined,
                }}
              >
                {label}{sortIndicator(key)}
              </th>
            ))}
            <th style={{ width: 28 }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => {
            const statusCfg = STATUS_COLORS[m.status] ?? STATUS_COLORS.IDEA;
            const isExpanded = expandedId === m.featureId;
            const rowBg = i % 2 === 1 ? rowAlt : cardBg;

            const autoTotal = m.autoAdvances + m.manualAdvances;
            const autoPct = autoTotal === 0 ? null : Math.round((m.autoAdvances / autoTotal) * 100);

            const hoursColor = timeColor(m.totalHours, isCyber);
            const autoPctColor = autoColor(autoPct, isCyber);

            return (
              <>
                <tr
                  key={m.featureId}
                  style={{
                    height: 36,
                    borderBottom: `1px solid ${cardBorder}`,
                    background: isExpanded ? (isCyber ? 'rgba(0,255,136,0.04)' : '#EFF6FF') : rowBg,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : m.featureId)}
                  onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = rowHover; }}
                  onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = rowBg; }}
                >
                  {/* Feature */}
                  <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontSize: 13,
                          fontWeight: 500,
                          color: bodyColor,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 180,
                          display: 'block',
                        }}
                      >
                        {m.featureTitle}
                      </span>
                      {m.size && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#FFFFFF',
                            background: isCyber
                              ? (SIZE_CYBER[m.size] ?? '#64748B')
                              : (SIZE_COLORS[m.size] ?? '#64748B'),
                            padding: '1px 5px',
                            flexShrink: 0,
                            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          }}
                        >
                          {m.size}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isCyber ? statusCfg.cyberColor : statusCfg.color,
                        background: isCyber ? statusCfg.cyberBg : statusCfg.bg,
                        border: isCyber ? `1px solid ${statusCfg.cyberColor}44` : 'none',
                        padding: '1px 6px',
                        textTransform: 'uppercase',
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.status}
                    </span>
                  </td>

                  {/* Sessions */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        color: m.sessionCount === 0 ? metaColor : bodyColor,
                      }}
                    >
                      {m.sessionCount === 0 ? '—' : `${m.sessionCount}`}
                    </span>
                  </td>

                  {/* Total time */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        fontWeight: m.totalHours >= 5 ? 700 : 400,
                        color: hoursColor,
                      }}
                    >
                      {m.totalMinutes === 0 ? '—' : `${m.totalHours}h`}
                    </span>
                  </td>

                  {/* Session days */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        color: m.sessionDays === 0 ? metaColor : bodyColor,
                      }}
                    >
                      {m.sessionDays === 0 ? '—' : `${m.sessionDays}d`}
                    </span>
                  </td>

                  {/* Auto % */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        fontWeight: autoPct !== null && autoPct >= 70 ? 700 : 400,
                        color: autoPctColor,
                      }}
                    >
                      {autoPct === null ? '—' : `${autoPct}%`}
                    </span>
                  </td>

                  {/* Tasks progress */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    {m.tasksTotal === 0 ? (
                      <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: metaColor }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 56,
                            height: 4,
                            background: isCyber ? '#2A2A3E' : '#E2E8F0',
                            flexShrink: 0,
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${m.completionPct}%`,
                              background: isCyber ? '#00FF88' : '#16A34A',
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 10, color: metaColor, whiteSpace: 'nowrap' }}>
                          {m.tasksDone}/{m.tasksTotal}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Last active */}
                  <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 11,
                        color: metaColor,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.lastSessionDate ? relativeTime(m.lastSessionDate) : '—'}
                    </span>
                  </td>

                  {/* Expand toggle */}
                  <td style={{ paddingRight: 8, textAlign: 'center', color: metaColor }}>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </td>
                </tr>

                {/* Expanded row */}
                {isExpanded && (
                  <tr key={`${m.featureId}-expanded`}>
                    <td
                      colSpan={9}
                      style={{
                        padding: '12px 24px',
                        background: expandBg,
                        borderBottom: `1px solid ${cardBorder}`,
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Timeline of session dates */}
                        <div>
                          <div
                            style={{
                              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                              fontSize: 10,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: isCyber ? '#00D4FF' : '#2563EB',
                              fontWeight: 700,
                              marginBottom: 8,
                            }}
                          >
                            {isCyber ? '// SESSION_TIMELINE' : 'Session Timeline'}
                          </div>
                          {m.sessionCount === 0 ? (
                            <div style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: metaColor }}>
                              {isCyber ? '// no sessions linked' : 'No sessions linked yet'}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {m.firstSessionDate && (
                                <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                                  <span style={{ color: isCyber ? '#6B7280' : '#94A3B8' }}>First:</span>
                                  <span>{m.firstSessionDate}</span>
                                </div>
                              )}
                              {m.lastSessionDate && (
                                <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                                  <span style={{ color: isCyber ? '#6B7280' : '#94A3B8' }}>Last:</span>
                                  <span>{m.lastSessionDate}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                                <span style={{ color: isCyber ? '#6B7280' : '#94A3B8' }}>Total:</span>
                                <span>{m.totalHours}h across {m.sessionDays} active day{m.sessionDays !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Auto status changes */}
                        <div>
                          <div
                            style={{
                              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                              fontSize: 10,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color: isCyber ? '#BF00FF' : '#7C3AED',
                              fontWeight: 700,
                              marginBottom: 8,
                            }}
                          >
                            {isCyber ? '// STATUS_CHANGES' : 'Status Changes'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                              <span style={{ color: isCyber ? '#00FF88' : '#16A34A' }}>Auto:</span>
                              <span>{m.autoAdvances} change{m.autoAdvances !== 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                              <span style={{ color: isCyber ? '#6B7280' : '#94A3B8' }}>Manual:</span>
                              <span>{m.manualAdvances} change{m.manualAdvances !== 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: metaColor }}>
                              <span style={{ color: isCyber ? '#6B7280' : '#94A3B8' }}>Tasks done:</span>
                              <span>{m.tasksDone}/{m.tasksTotal} ({m.completionPct}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
