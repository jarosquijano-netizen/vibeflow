'use client';

import { ACTIVITY_LOG } from '@/lib/arcade-data';

const MONO = "'JetBrains Mono', monospace";

export default function ArcadeActivityFeed() {
  return (
    <div
      style={{
        background: '#0E0E13',
        padding: 24,
        borderRadius: 12,
        border: '1px solid rgba(59,75,61,0.2)',
        flex: 1,
        minHeight: 300,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          opacity: 0.7,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: '#00FF88', lineHeight: 1 }}>⬡</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#00FF88',
            fontWeight: 700,
          }}
        >
          SYSTEM_LOGS // ACTIVITY_FEED
        </span>
      </div>

      {/* Log lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
        {ACTIVITY_LOG.map((entry, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 11, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(0,255,136,0.5)', opacity: 0.6, flexShrink: 0 }}>
              [{entry.time}]
            </span>
            <span style={{ color: entry.color, fontWeight: 700, flexShrink: 0 }}>
              {entry.label}
            </span>
            <span style={{ color: '#B9CBB9' }}>{entry.message}</span>
          </div>
        ))}

        {/* Blinking cursor line */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'arcade-pulse 1.5s ease-in-out infinite',
            color: 'rgba(0,255,136,0.8)',
          }}
        >
          <span
            style={{
              background: '#00FF88',
              color: '#003919',
              padding: '0 4px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginRight: 8,
            }}
          >
            RUN
          </span>
          Initializing arcade protocol 0.9.1...
        </div>
      </div>

      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          opacity: 0.07,
          fontSize: 80,
          lineHeight: 1,
          fontFamily: MONO,
          color: '#00FF88',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        ⬡
      </div>

      <style>{`
        @keyframes arcade-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
