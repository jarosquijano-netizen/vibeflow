'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { XPEvent } from '@/lib/xp-engine';

interface CyberXPFeedProps {
  events: XPEvent[];
}

export default function CyberXPFeed({ events }: CyberXPFeedProps) {
  const { theme } = useTheme();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (theme !== 'cyber') return null;

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        borderLeft: '1px solid rgba(59,75,61,0.1)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
        background: 'transparent',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#4B5563',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        // XP_LOG
      </div>

      {/* Events */}
      {events.length === 0 ? (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: '#4B5563',
          }}
        >
          &gt; awaiting actions...
          <span className="animate-blink">_</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((event) => {
            const age = now - event.timestamp;
            const isOld = age > 10000;
            return (
              <div
                key={event.id}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  padding: 8,
                  background: 'rgba(0,26,16,0.4)',
                  borderLeft: '2px solid #00FF88',
                  opacity: isOld ? 0.6 : 1,
                  transition: 'opacity 500ms ease',
                }}
              >
                <div style={{ color: '#00FF88', fontWeight: 700, marginBottom: 2 }}>
                  +{event.amount} XP
                </div>
                <div style={{ color: '#9CA3AF' }}>{event.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
