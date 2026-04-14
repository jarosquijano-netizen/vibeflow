'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { SyncEvent } from '@/lib/sync-data';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Event type config                                                   */
/* ------------------------------------------------------------------ */
const EVENT_ICON: Record<string, { label: string; bg: string }> = {
  JIRA_SYNC:        { label: 'J',  bg: '#0052CC' },
  STATUS_AUTO:      { label: '⚡', bg: '#BF00FF' },
  FEATURE_PROMOTED: { label: '↗',  bg: '#2563EB' },
  SESSION_CLOSED:   { label: '✓',  bg: '#16A34A' },
  XP_AWARDED:       { label: '★',  bg: '#D97706' },
  ERROR:            { label: '×',  bg: '#DC2626' },
};

/* ------------------------------------------------------------------ */
/*  Relative time (live-updating)                                       */
/* ------------------------------------------------------------------ */
function useRelativeTime(timestamp: string): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function compute() {
      const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
      if (diff < 60) { setLabel('just now'); return; }
      const mins = Math.floor(diff / 60);
      if (mins < 60) { setLabel(`${mins}m ago`); return; }
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) { setLabel(`${hrs}h ago`); return; }
      setLabel(`${Math.floor(hrs / 24)}d ago`);
    }
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [timestamp]);

  return label;
}

/* ------------------------------------------------------------------ */
/*  Single event row                                                    */
/* ------------------------------------------------------------------ */
function EventRow({ event, isCyber }: { event: SyncEvent; isCyber: boolean }) {
  const timeLabel = useRelativeTime(event.timestamp);
  const iconCfg = EVENT_ICON[event.type] ?? EVENT_ICON.ERROR;

  const titleColor  = isCyber ? '#B9CBB9' : '#0F172A';
  const detailColor = isCyber ? '#4B5563' : '#94A3B8';
  const timeColor   = isCyber ? '#4B5563' : '#94A3B8';
  const rowHover    = isCyber ? '#16161E' : '#F8FAFC';

  const statusDot: Record<string, string> = {
    OK:      isCyber ? '#00FF88' : '#16A34A',
    WARNING: '#D97706',
    ERROR:   isCyber ? '#FF4444' : '#DC2626',
    SYNCING: isCyber ? '#00D4FF' : '#2563EB',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 16px',
        borderBottom: `1px solid ${isCyber ? '#1A1A28' : '#F1F5F9'}`,
        transition: 'background 100ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = rowHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Left: icon circle */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: iconCfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#FFFFFF',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {iconCfg.label}
      </div>

      {/* Center */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: titleColor,
            marginBottom: 2,
          }}
        >
          {event.title}
        </div>
        <div
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 11,
            color: detailColor,
            marginBottom: event.jiraId || event.xpAmount || event.status === 'ERROR' ? 5 : 0,
          }}
        >
          {event.detail}
        </div>

        {/* Sub-chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {event.jiraId && (
            <span
              style={{
                fontSize: 10,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                color: isCyber ? '#00D4FF' : '#2563EB',
                background: isCyber ? 'rgba(0,212,255,0.08)' : '#EFF6FF',
                border: `1px solid ${isCyber ? 'rgba(0,212,255,0.3)' : '#BFDBFE'}`,
                padding: '1px 6px',
                borderRadius: 3,
              }}
            >
              #{event.jiraId}
            </span>
          )}
          {event.xpAmount !== undefined && (
            <span
              style={{
                fontSize: 10,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                color: isCyber ? '#FFB800' : '#D97706',
                fontWeight: 700,
              }}
            >
              +{event.xpAmount} XP
            </span>
          )}
          {event.status === 'ERROR' && (
            <span
              style={{
                fontSize: 10,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                color: isCyber ? '#FF4444' : '#DC2626',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isCyber ? 'VIEW_DETAILS →' : 'View details →'}
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 11,
            color: timeColor,
            whiteSpace: 'nowrap',
          }}
        >
          {timeLabel}
        </span>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: statusDot[event.status] ?? statusDot.OK,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SyncEventFeed                                                       */
/* ------------------------------------------------------------------ */
interface SyncEventFeedProps {
  events: SyncEvent[];
  onClear: () => void;
}

export default function SyncEventFeed({ events, onClear }: SyncEventFeedProps) {
  const { theme } = useTheme();
  const isCyber   = theme === 'cyber';
  const feedRef   = useRef<HTMLDivElement>(null);

  const cardBg     = isCyber ? '#0D0D17' : '#FFFFFF';
  const cardBorder = isCyber ? '#2A2A3E' : '#E2E8F0';
  const headerBg   = isCyber ? '#111118' : '#F8FAFC';
  const labelColor = isCyber ? '#6B7280' : '#0F172A';

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: headerBg,
          borderBottom: `1px solid ${cardBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: isCyber ? 11 : 13,
            fontWeight: 700,
            color: labelColor,
            textTransform: isCyber ? 'uppercase' : 'none',
            letterSpacing: isCyber ? '0.08em' : 0,
          }}
        >
          {isCyber ? '// EVENT_LOG' : 'Event Log'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isCyber ? '#00FF88' : '#16A34A',
                display: 'inline-block',
                animation: 'livePulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 11,
                color: isCyber ? '#00FF88' : '#16A34A',
                fontWeight: 600,
              }}
            >
              {isCyber ? 'LIVE' : '● Live'}
            </span>
          </div>

          {/* Clear button */}
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: 11,
              color: isCyber ? '#4B5563' : '#94A3B8',
              padding: 0,
              transition: 'color 100ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isCyber ? '#FF4444' : '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isCyber ? '#4B5563' : '#94A3B8';
            }}
          >
            {isCyber ? 'CLEAR' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Event list */}
      <div ref={feedRef} style={{ flex: 1, overflowY: 'auto' }}>
        {events.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120,
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: isCyber ? 12 : 13,
              color: isCyber ? '#2A2A3E' : '#94A3B8',
            }}
          >
            {isCyber ? '// NO_EVENTS_YET' : 'No sync events yet'}
          </div>
        ) : (
          events.map((event) => (
            <EventRow key={event.id} event={event} isCyber={isCyber} />
          ))
        )}
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
