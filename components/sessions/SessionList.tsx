'use client';

import type { VibeSession } from '@/types';

interface SessionListProps {
  sessions: VibeSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                        */
/* ------------------------------------------------------------------ */
function getMonthKey(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase(); // "JUNE 2026"
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday} ${day} ${monthAbbr}`;
}

function getStatusDotColor(session: VibeSession): string {
  const today = new Date().toISOString().slice(0, 10);
  if (session.prototypeUrl) return '#16A34A';
  if (session.date === today) return '#D97706';
  return '#CBD5E1';
}

/* ------------------------------------------------------------------ */
/*  SessionList                                                         */
/* ------------------------------------------------------------------ */
export default function SessionList({ sessions, selectedId, onSelect, onNew }: SessionListProps) {
  /* Group by month, preserving order */
  const monthGroups: { month: string; items: VibeSession[] }[] = [];
  const seen = new Set<string>();
  for (const s of sessions) {
    const key = getMonthKey(s.date);
    if (!seen.has(key)) {
      seen.add(key);
      monthGroups.push({ month: key, items: [] });
    }
    monthGroups[monthGroups.length - 1].items.push(s);
  }
  /* Fix: items may be pushed to wrong group if sessions are not contiguous by month */
  const groupMap = new Map<string, VibeSession[]>();
  for (const s of sessions) {
    const key = getMonthKey(s.date);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(s);
  }
  const orderedGroups: { month: string; items: VibeSession[] }[] = [];
  const seenKeys = new Set<string>();
  for (const s of sessions) {
    const key = getMonthKey(s.date);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      orderedGroups.push({ month: key, items: groupMap.get(key)! });
    }
  }

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
      }}
    >
      {/* ── Sticky header ── */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#0F172A',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Vibe Sessions
        </span>
        <button
          onClick={onNew}
          style={{
            height: 28,
            paddingLeft: 8,
            paddingRight: 8,
            fontSize: 12,
            color: '#2563EB',
            background: 'none',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            borderRadius: 0,
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          + New
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {orderedGroups.map(({ month, items }) => (
          <div key={month}>
            {/* Month separator — sticky */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                background: '#FFFFFF',
                zIndex: 10,
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {month}
              </span>
              <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
            </div>

            {/* Session items */}
            {items.map((session) => {
              const isSelected = session.id === selectedId;
              const dotColor = getStatusDotColor(session);
              return (
                <div
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F1F5F9',
                    borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
                    background: isSelected ? '#EFF6FF' : 'transparent',
                    position: 'relative',
                    transition: 'background 100ms ease, border-left-color 100ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Status dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: dotColor,
                    }}
                  />

                  {/* Title */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingRight: 16,
                      fontFamily: 'var(--font-dm-sans)',
                    }}
                  >
                    {session.title}
                  </div>

                  {/* Date + duration */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {formatShortDate(session.date)}
                    </span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {session.duration}h
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        background: '#F0FDF4',
                        color: '#16A34A',
                        padding: '2px 6px',
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                    >
                      {session.linkedFeatureIds.length} feature{session.linkedFeatureIds.length !== 1 ? 's' : ''}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        background: '#EFF6FF',
                        color: '#2563EB',
                        padding: '2px 6px',
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                    >
                      {session.promptIds.length} prompt{session.promptIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
