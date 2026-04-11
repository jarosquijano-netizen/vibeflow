'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { useXPContext } from '@/lib/xp-engine';
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
    .toUpperCase();
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
/*  Streak helpers                                                      */
/* ------------------------------------------------------------------ */
function getCalendarDays(sessions: VibeSession[], streak: number): boolean[] {
  const dates = new Set(sessions.map((s) => s.date));
  const mostRecent = sessions[0]?.date;
  if (!mostRecent) return Array(7).fill(false);

  const days: boolean[] = [];
  const anchor = new Date(mostRecent + 'T12:00:00');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push(dates.has(dateStr));
  }
  return days;
}

/* XP per session (rough estimate) */
function sessionXPEstimate(session: VibeSession): number {
  let xp = 0;
  if (session.goal) xp += 50;
  if (session.prototypeUrl) xp += 100;
  if (session.notes.worked) xp += 75;
  xp += session.backlogItems.length * 25;
  if (session.status === 'CLOSED') xp += 200;
  return xp;
}

/* ------------------------------------------------------------------ */
/*  Build ordered month groups                                          */
/* ------------------------------------------------------------------ */
function buildGroups(sessions: VibeSession[]) {
  const groupMap = new Map<string, VibeSession[]>();
  for (const s of sessions) {
    const key = getMonthKey(s.date);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(s);
  }
  const orderedGroups: { month: string; items: VibeSession[] }[] = [];
  const seen = new Set<string>();
  for (const s of sessions) {
    const key = getMonthKey(s.date);
    if (!seen.has(key)) {
      seen.add(key);
      orderedGroups.push({ month: key, items: groupMap.get(key)! });
    }
  }
  return orderedGroups;
}

/* ------------------------------------------------------------------ */
/*  SessionList                                                         */
/* ------------------------------------------------------------------ */
export default function SessionList({ sessions, selectedId, onSelect, onNew }: SessionListProps) {
  const { theme } = useTheme();
  const { xpState } = useXPContext();
  const isCyber = theme === 'cyber';

  const orderedGroups = buildGroups(sessions);
  const calendarDays = getCalendarDays(sessions, xpState.streak);
  const today = new Date().toISOString().slice(0, 10).slice(0, 7);

  /* ═══════════════════════════════════════════════════════════════ */
  /*  CYBER VARIANT                                                  */
  /* ═══════════════════════════════════════════════════════════════ */
  if (isCyber) {
    return (
      <div
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: '1px solid rgba(59,75,61,0.3)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: '#0D0D17',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(59,75,61,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: '#E4E1E9',
            }}
          >
            VIBE_SESSIONS
          </span>
          <button
            onClick={onNew}
            style={{
              height: 28,
              paddingLeft: 10,
              paddingRight: 10,
              fontSize: 12,
              color: '#00FF88',
              background: 'none',
              border: '1px solid rgba(0,255,136,0.3)',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              letterSpacing: '0.04em',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,255,136,0.1)';
              e.currentTarget.style.borderColor = '#00FF88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)';
            }}
          >
            + NEW
          </button>
        </div>

        {/* ── Streak Banner ── */}
        <div
          style={{
            margin: '12px 16px 4px',
            padding: '12px 16px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #001A10 0%, #0A0A0F 100%)',
            border: '1px solid rgba(0,255,136,0.2)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: '#FFB800',
              }}
            >
              🔥 {xpState.streak} DAY STREAK
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: '#9CA3AF',
                textTransform: 'uppercase',
              }}
            >
              {today.replace('-', '/')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {calendarDays.map((active, i) => (
              <div
                key={i}
                title={active ? 'Session logged' : 'No session'}
                style={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  background: active
                    ? 'rgba(0,255,136,0.8)'
                    : 'rgba(0,255,136,0.1)',
                  border: `1px solid ${active ? '#00FF88' : 'rgba(0,255,136,0.2)'}`,
                  boxShadow: active ? '0 0 8px rgba(0,255,136,0.27)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Scrollable session list ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {orderedGroups.map(({ month, items }) => (
            <div key={month}>
              {/* Month separator */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#0D0D17',
                  zIndex: 10,
                  padding: '6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    textTransform: 'uppercase',
                    color: '#4B5563',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {month}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(59,75,61,0.2)' }} />
              </div>

              {/* Session items */}
              {items.map((session) => {
                const isSelected = session.id === selectedId;
                const isOpen = session.status === 'OPEN';
                const xpEst = sessionXPEstimate(session);

                return (
                  <div
                    key={session.id}
                    onClick={() => onSelect(session.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: isOpen
                        ? isSelected ? 'rgba(0,255,136,0.06)' : '#1F1F25'
                        : isSelected ? 'rgba(27,27,32,0.7)' : 'rgba(27,27,32,0.4)',
                      borderLeft: `4px solid ${isOpen ? '#00FF88' : '#2A2A3E'}`,
                      opacity: isOpen ? 1 : 0.7,
                      transition: 'opacity 120ms ease, background 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.opacity = isOpen ? '1' : '0.7';
                    }}
                  >
                    {/* Status label */}
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: isOpen ? '#00FF88' : '#4B5563',
                        marginBottom: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {isOpen ? `IN_PROGRESS_${session.id.slice(-3)}` : `COMPLETED_${session.id.slice(-3)}`}
                    </div>

                    {/* Title */}
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: isOpen ? '#FFFFFF' : '#9CA3AF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 6,
                      }}
                    >
                      {session.title}
                    </div>

                    {/* Footer row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          color: isOpen ? '#9CA3AF' : '#4B5563',
                        }}
                      >
                        {formatShortDate(session.date)} · {session.duration}h
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: isOpen ? '#00FF88' : '#4B5563',
                        }}
                      >
                        +{xpEst} XP
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

  /* ═══════════════════════════════════════════════════════════════ */
  /*  DEFAULT VARIANT                                                */
  /* ═══════════════════════════════════════════════════════════════ */
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
                    opacity: session.status === 'CLOSED' ? 0.8 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
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

                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 16 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: session.status === 'CLOSED' ? '#94A3B8' : '#0F172A',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                    >
                      {session.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: session.status === 'OPEN' ? '#16A34A' : '#94A3B8',
                        background: session.status === 'OPEN' ? '#F0FDF4' : '#F8FAFC',
                        border: `1px solid ${session.status === 'OPEN' ? '#BBF7D0' : '#E2E8F0'}`,
                        padding: '2px 6px',
                        marginLeft: 6,
                        flexShrink: 0,
                        fontFamily: 'var(--font-dm-sans)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {session.status === 'OPEN' ? '● Open' : '● Closed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {formatShortDate(session.date)}
                    </span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {session.duration}h
                    </span>
                  </div>

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
