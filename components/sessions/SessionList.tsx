'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useXPContext } from '@/lib/xp-engine';
import type { VibeSession } from '@/types';

interface SessionListProps {
  sessions: VibeSession[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

/* ------------------------------------------------------------------ */
/*  Date helpers                                                        */
/* ------------------------------------------------------------------ */
function getMonthKey(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function relativeDate(dateStr: string): string {
  const d = daysSince(dateStr);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthAbbr = date.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday} ${day} ${monthAbbr}`;
}

/* ------------------------------------------------------------------ */
/*  Session helpers                                                     */
/* ------------------------------------------------------------------ */
function getTotalHrs(session: VibeSession): string {
  const mins = session.totalMinutes ?? session.duration * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}`;
  return `${h}.${Math.round(m / 6)}`;
}

function getDayCount(session: VibeSession): number {
  return session.sessions?.length ?? 1;
}

function sessionXPEstimate(session: VibeSession): number {
  let xp = 0;
  if (session.goal) xp += 50;
  if (session.prototypeUrl) xp += 100;
  if (session.notes.worked) xp += 75;
  xp += session.backlogItems.length * 25;
  if (session.status === 'CLOSED') xp += 200;
  return xp;
}

function rankLabel(xp: number): { label: string; color: string } | null {
  if (xp > 1000) return { label: 'RANK S', color: '#FFB800' };
  if (xp > 700)  return { label: 'RANK A', color: '#FFB800' };
  if (xp > 400)  return { label: 'RANK B', color: '#6B7280' };
  return null;
}

/* ------------------------------------------------------------------ */
/*  Streak calendar helpers                                             */
/* ------------------------------------------------------------------ */
function getCalendarDays(sessions: VibeSession[]): boolean[] {
  const dates = new Set(sessions.map((s) => s.date));
  const mostRecent = sessions[0]?.date;
  if (!mostRecent) return Array(7).fill(false);
  const days: boolean[] = [];
  const anchor = new Date(mostRecent + 'T12:00:00');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    days.push(dates.has(d.toISOString().slice(0, 10)));
  }
  return days;
}

/* ------------------------------------------------------------------ */
/*  Group completed sessions by month                                   */
/* ------------------------------------------------------------------ */
function buildCompletedGroups(sessions: VibeSession[]) {
  const map = new Map<string, VibeSession[]>();
  for (const s of sessions) {
    const key = getMonthKey(s.lastActiveAt ?? s.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  const groups: { month: string; items: VibeSession[] }[] = [];
  const seen = new Set<string>();
  for (const s of sessions) {
    const key = getMonthKey(s.lastActiveAt ?? s.date);
    if (!seen.has(key)) {
      seen.add(key);
      groups.push({ month: key, items: map.get(key)! });
    }
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/*  Sorting                                                             */
/* ------------------------------------------------------------------ */
function sortByRecent(a: VibeSession, b: VibeSession) {
  return (
    new Date(b.lastActiveAt ?? b.date).getTime() -
    new Date(a.lastActiveAt ?? a.date).getTime()
  );
}

/* ------------------------------------------------------------------ */
/*  SessionList                                                         */
/* ------------------------------------------------------------------ */
export default function SessionList({ sessions, selectedId, onSelect, onNew }: SessionListProps) {
  const { theme } = useTheme();
  const { xpState } = useXPContext();
  const isCyber = theme === 'cyber';

  /* Collapse state for COMPLETED section */
  const [completedCollapsed, setCompletedCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('vibeflow-completed-collapsed');
      return saved ? JSON.parse(saved) : true;
    } catch { return true; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vibeflow-completed-collapsed', JSON.stringify(completedCollapsed));
    } catch { /* ignore */ }
  }, [completedCollapsed]);

  /* Classify sessions */
  const today = new Date().toDateString();

  const activeSessions = sessions
    .filter((s) => s.status === 'OPEN' &&
      new Date(s.lastActiveAt ?? s.date).toDateString() === today)
    .sort(sortByRecent);

  const pausedSessions = sessions
    .filter((s) => s.status === 'OPEN' &&
      new Date(s.lastActiveAt ?? s.date).toDateString() !== today)
    .sort(sortByRecent);

  const completedSessions = sessions
    .filter((s) => s.status === 'CLOSED')
    .sort(sortByRecent);

  const completedGroups = buildCompletedGroups(completedSessions);
  const calendarDays = getCalendarDays(sessions);
  const todayYM = new Date().toISOString().slice(0, 7).replace('-', '/');

  /* ================================================================= */
  /*  CYBER VARIANT                                                      */
  /* ================================================================= */
  if (isCyber) {
    return (
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid #3B4B3D',
        display: 'flex', flexDirection: 'column',
        height: '100%', background: '#12121E',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #3B4B3D',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: '#F0FFF4' }}>
            VIBE_SESSIONS
          </span>
          <button
            onClick={onNew}
            style={{
              height: 28, paddingLeft: 10, paddingRight: 10,
              fontSize: 12, color: '#00FF88', background: 'none',
              border: '1px solid rgba(0,255,136,0.3)', cursor: 'pointer',
              fontFamily: MONO, fontWeight: 700, letterSpacing: '0.04em',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.1)'; e.currentTarget.style.borderColor = '#00FF88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; }}
          >
            + NEW
          </button>
        </div>

        {/* Streak banner */}
        <div style={{
          margin: '12px 16px 4px',
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #001A10 0%, #0A0A0F 100%)',
          border: '1px solid rgba(0,255,136,0.2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 12, fontWeight: 700, color: '#FFB800' }}>
              🔥 {xpState.streak} DAY STREAK
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase' }}>
              {todayYM}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {calendarDays.map((active, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 2,
                background: active ? 'rgba(0,255,136,0.8)' : 'rgba(0,255,136,0.1)',
                border: `1px solid ${active ? '#00FF88' : 'rgba(0,255,136,0.2)'}`,
                boxShadow: active ? '0 0 8px rgba(0,255,136,0.27)' : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* Scrollable sections */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── ACTIVE section ── */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 20,
            padding: '6px 16px',
            background: '#0A0A0F',
            borderBottom: '1px solid #2A2A3E',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#00FF88', fontWeight: 700, letterSpacing: '0.12em' }}>
              // ACTIVE
            </span>
            <span style={{
              fontFamily: MONO, fontSize: 10,
              background: 'rgba(0,255,136,0.1)', color: '#00FF88',
              border: '1px solid rgba(0,255,136,0.3)',
              padding: '0 6px', borderRadius: 2,
            }}>
              {activeSessions.length}
            </span>
          </div>

          {activeSessions.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: MONO, fontSize: 12, color: '#2A2A3E', marginBottom: 6 }}>
                // NO_ACTIVE_SESSION
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: '#1A1A2A', marginBottom: 8 }}>
                {`> start one from a feature card`}
              </div>
              <a href="/dashboard/features" style={{ fontFamily: MONO, fontSize: 11, color: '#00FF88', textDecoration: 'none' }}>
                → FEATURE_BOARD
              </a>
            </div>
          ) : (
            activeSessions.map((session) => {
              const isSelected = session.id === selectedId;
              const xpEst = sessionXPEstimate(session);
              const totalHrs = getTotalHrs(session);
              const days = getDayCount(session);
              const mins = session.totalMinutes ?? 0;
              const timerLabel = mins > 0
                ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim()
                : '0m';
              return (
                <div
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  style={{
                    padding: 16, cursor: 'pointer',
                    background: isSelected ? 'rgba(0,255,136,0.1)' : '#1A1A28',
                    borderLeft: '4px solid #00FF88',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,255,136,0.06)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#1A1A28'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', flexShrink: 0 }} />
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#00FF88', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        ACTIVE
                      </span>
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#00FF88' }}>{timerLabel}</span>
                  </div>
                  <div style={{
                    fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: '#F0FFF4',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 6,
                  }}>
                    {session.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#00FF88', fontWeight: 700 }}>
                      +{xpEst} XP
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                      {days}d // {totalHrs}H
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* ── PAUSED section (only if any) ── */}
          {pausedSessions.length > 0 && (
            <>
              <div style={{
                position: 'sticky', top: 0, zIndex: 20,
                padding: '6px 16px',
                background: '#0A0A0F',
                borderBottom: '1px solid #2A2A3E',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#FFB800', fontWeight: 700, letterSpacing: '0.12em' }}>
                  // PAUSED
                </span>
                <span style={{
                  fontFamily: MONO, fontSize: 10,
                  background: 'rgba(255,184,0,0.1)', color: '#FFB800',
                  border: '1px solid rgba(255,184,0,0.3)',
                  padding: '0 6px', borderRadius: 2,
                }}>
                  {pausedSessions.length}
                </span>
              </div>
              <div style={{ padding: '4px 16px 6px', fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                {`> reopen to continue`}
              </div>
              {pausedSessions.map((session) => {
                const isSelected = session.id === selectedId;
                const xpEst = sessionXPEstimate(session);
                const totalHrs = getTotalHrs(session);
                const days = getDayCount(session);
                const lastActive = session.lastActiveAt ?? session.date;
                const ds = daysSince(lastActive);
                const rel = relativeDate(lastActive);
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelect(session.id)}
                    style={{
                      padding: 16, cursor: 'pointer',
                      background: isSelected ? 'rgba(255,184,0,0.08)' : '#111118',
                      borderLeft: '4px solid #FFB800',
                      opacity: isSelected ? 1 : 0.8,
                      transition: 'opacity 120ms ease, background 120ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; if (!isSelected) e.currentTarget.style.background = 'rgba(255,184,0,0.05)'; }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = '#111118'; } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        PAUSED_{ds}D
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                        Last: {rel}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: '#B9CBB9',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}>
                      {session.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                        +{xpEst} XP
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#3B4B3D' }}>
                        {days}d // {totalHrs}H
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ── COMPLETED section ── */}
          <div
            onClick={() => setCompletedCollapsed((c) => !c)}
            style={{
              position: 'sticky', top: 0, zIndex: 20,
              padding: '6px 16px',
              background: '#0A0A0F',
              borderBottom: '1px solid #2A2A3E',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#6B7280', fontWeight: 700, letterSpacing: '0.12em' }}>
              // COMPLETED
            </span>
            <span style={{
              fontFamily: MONO, fontSize: 10,
              background: '#1A1A28', color: '#4B5563',
              padding: '0 6px', borderRadius: 2,
            }}>
              {completedSessions.length}
            </span>
            <div style={{ flex: 1 }} />
            {completedCollapsed
              ? <ChevronDown size={14} color="#4B5563" />
              : <ChevronUp size={14} color="#4B5563" />
            }
          </div>

          {!completedCollapsed && completedGroups.map(({ month, items }) => (
            <div key={month}>
              <div style={{
                padding: '6px 16px',
                fontFamily: MONO, fontSize: 9, textTransform: 'uppercase',
                color: '#3B4B3D', letterSpacing: '0.1em',
                borderBottom: '1px solid #1A1A28',
              }}>
                {month}
              </div>
              {items.map((session) => {
                const isSelected = session.id === selectedId;
                const xpEst = sessionXPEstimate(session);
                const totalHrs = getTotalHrs(session);
                const rank = rankLabel(xpEst);
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelect(session.id)}
                    style={{
                      padding: 16, cursor: 'pointer',
                      background: isSelected ? 'rgba(42,42,62,0.6)' : '#0D0D17',
                      borderLeft: '4px solid #2A2A3E',
                      opacity: isSelected ? 0.9 : 0.6,
                      transition: 'opacity 120ms ease, background 120ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; if (!isSelected) e.currentTarget.style.background = 'rgba(42,42,62,0.3)'; }}
                    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = '#0D0D17'; } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CheckCircle size={10} color="#4B5563" />
                        <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          COMPLETED_{session.id.slice(-3)}
                        </span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#3B4B3D' }}>
                        {totalHrs}H
                      </span>
                    </div>
                    <div style={{
                      fontFamily: DISPLAY, fontSize: 13, color: '#6B7280',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}>
                      {session.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                        +{xpEst} XP
                      </span>
                      {rank && (
                        <span style={{ fontFamily: MONO, fontSize: 9, color: rank.color, fontWeight: 700 }}>
                          {rank.label}
                        </span>
                      )}
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

  /* ================================================================= */
  /*  DEFAULT VARIANT                                                    */
  /* ================================================================= */
  return (
    <div style={{
      width: 320, flexShrink: 0,
      borderRight: '1px solid #E2E8F0',
      display: 'flex', flexDirection: 'column',
      height: '100%', background: '#FFFFFF',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#FFFFFF', flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-dm-sans)' }}>
          Vibe Sessions
        </span>
        <button
          onClick={onNew}
          style={{
            height: 28, paddingLeft: 8, paddingRight: 8,
            fontSize: 12, color: '#2563EB', background: 'none',
            border: '1px solid #E2E8F0', cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans)', fontWeight: 500,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          + New
        </button>
      </div>

      {/* Scrollable sections */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── ACTIVE section ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 20,
          padding: '6px 16px',
          background: '#F0FDF4',
          borderBottom: '1px solid #BBF7D0',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#16A34A', letterSpacing: '0.1em', fontFamily: 'var(--font-dm-sans)' }}>
            Active
          </span>
          <span style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', padding: '0 6px', borderRadius: 10, fontFamily: 'var(--font-dm-sans)' }}>
            {activeSessions.length}
          </span>
        </div>

        {activeSessions.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', marginBottom: 4 }}>
              No active session
            </div>
            <div style={{ fontSize: 11, color: '#CBD5E1', fontFamily: 'var(--font-dm-sans)', marginBottom: 8 }}>
              Start one from a feature card.
            </div>
            <a href="/dashboard/features" style={{ fontSize: 11, color: '#2563EB', fontFamily: 'var(--font-dm-sans)', textDecoration: 'none' }}>
              → Feature Board
            </a>
          </div>
        ) : (
          activeSessions.map((session) => {
            const isSelected = session.id === selectedId;
            const xpEst = sessionXPEstimate(session);
            const totalHrs = getTotalHrs(session);
            const days = getDayCount(session);
            const mins = session.totalMinutes ?? 0;
            const timerLabel = mins > 0
              ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`.trim()
              : '0m';
            return (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderLeft: `4px solid ${isSelected ? '#16A34A' : '#16A34A'}`,
                  background: isSelected ? '#F0FDF4' : '#FFFFFF',
                  borderBottom: '1px solid #F1F5F9',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F0FDF4'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans)' }}>
                      Active
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#16A34A', fontFamily: 'var(--font-dm-sans)' }}>{timerLabel}</span>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: '#0F172A',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 4, fontFamily: 'var(--font-dm-sans)',
                }}>
                  {session.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, fontFamily: 'var(--font-dm-sans)' }}>
                    +{xpEst} XP
                  </span>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                    {days}d · {totalHrs}h
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* ── PAUSED section (only if any) ── */}
        {pausedSessions.length > 0 && (
          <>
            <div style={{
              position: 'sticky', top: 0, zIndex: 20,
              padding: '6px 16px',
              background: '#FFFBEB',
              borderBottom: '1px solid #FDE68A',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#D97706', letterSpacing: '0.1em', fontFamily: 'var(--font-dm-sans)' }}>
                Paused
              </span>
              <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', padding: '0 6px', borderRadius: 10, fontFamily: 'var(--font-dm-sans)' }}>
                {pausedSessions.length}
              </span>
            </div>
            <div style={{ padding: '4px 16px 6px', fontSize: 10, color: '#94A3B8', fontStyle: 'italic', fontFamily: 'var(--font-dm-sans)' }}>
              ↑ Reopen to continue
            </div>
            {pausedSessions.map((session) => {
              const isSelected = session.id === selectedId;
              const xpEst = sessionXPEstimate(session);
              const totalHrs = getTotalHrs(session);
              const days = getDayCount(session);
              const lastActive = session.lastActiveAt ?? session.date;
              const ds = daysSince(lastActive);
              const rel = relativeDate(lastActive);
              return (
                <div
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderLeft: `4px solid #D97706`,
                    background: isSelected ? '#FFFBEB' : 'rgba(255,251,235,0.3)',
                    borderBottom: '1px solid #F1F5F9',
                    opacity: isSelected ? 1 : 0.85,
                    transition: 'background 100ms ease, opacity 100ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; if (!isSelected) e.currentTarget.style.background = '#FFFBEB'; }}
                  onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'rgba(255,251,235,0.3)'; } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', fontFamily: 'var(--font-dm-sans)' }}>
                      ● Paused {ds}d
                    </span>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      Last: {rel}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#475569',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 4, fontFamily: 'var(--font-dm-sans)',
                  }}>
                    {session.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      +{xpEst} XP
                    </span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {days}d · {totalHrs}h
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── COMPLETED section ── */}
        <div
          onClick={() => setCompletedCollapsed((c) => !c)}
          style={{
            position: 'sticky', top: 0, zIndex: 20,
            padding: '6px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.1em', fontFamily: 'var(--font-dm-sans)' }}>
            Completed
          </span>
          <span style={{ fontSize: 10, background: '#E2E8F0', color: '#94A3B8', padding: '0 6px', borderRadius: 10, fontFamily: 'var(--font-dm-sans)' }}>
            {completedSessions.length}
          </span>
          <div style={{ flex: 1 }} />
          {completedCollapsed
            ? <ChevronDown size={14} color="#94A3B8" />
            : <ChevronUp size={14} color="#94A3B8" />
          }
        </div>

        {!completedCollapsed && completedGroups.map(({ month, items }) => (
          <div key={month}>
            <div style={{
              padding: '6px 16px',
              fontSize: 10, textTransform: 'uppercase',
              color: '#94A3B8', letterSpacing: '0.06em',
              borderBottom: '1px solid #F1F5F9',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              {month}
            </div>
            {items.map((session) => {
              const isSelected = session.id === selectedId;
              const xpEst = sessionXPEstimate(session);
              const totalHrs = getTotalHrs(session);
              const days = getDayCount(session);
              const rank = rankLabel(xpEst);
              return (
                <div
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderLeft: `4px solid #E2E8F0`,
                    background: isSelected ? '#F8FAFC' : 'rgba(255,255,255,0.7)',
                    borderBottom: '1px solid #F1F5F9',
                    opacity: isSelected ? 1 : 0.75,
                    transition: 'background 100ms ease, opacity 100ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={10} color="#94A3B8" />
                      <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                        Completed
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: '#CBD5E1', fontFamily: 'var(--font-dm-sans)' }}>
                      {totalHrs}h · {days}d
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13, color: '#64748B',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: 4, fontFamily: 'var(--font-dm-sans)',
                  }}>
                    {session.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      +{xpEst} XP
                    </span>
                    {rank && (
                      <span style={{ fontSize: 10, color: rank.color, fontWeight: 600, fontFamily: 'var(--font-dm-sans)' }}>
                        {rank.label}
                      </span>
                    )}
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
