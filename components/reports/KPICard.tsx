'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface KPICardProps {
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
}

const DELTA_COLORS = {
  positive: '#16A34A',
  negative: '#DC2626',
  neutral:  '#94A3B8',
};

const CYBER_DELTA_COLORS = {
  positive: '#00FF88',
  negative: '#FF4444',
  neutral:  '#4B5563',
};

const CYBER_ACCENT = {
  positive: '#00FF88',
  negative: '#FF4444',
  neutral:  '#2A2A3E',
};

const MONO = "'JetBrains Mono', monospace";

export default function KPICard({ label, value, delta, deltaType }: KPICardProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [hovered, setHovered] = useState(false);

  if (isCyber) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#111118',
          borderTop: `3px solid ${CYBER_ACCENT[deltaType]}`,
          borderRight: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#2A2A3E'}`,
          borderBottom: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#2A2A3E'}`,
          borderLeft: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#2A2A3E'}`,
          borderRadius: 6,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          boxShadow: hovered ? '0 0 16px rgba(0,255,136,0.05)' : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#2A2A3E',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 32,
            fontWeight: 700,
            color: '#F8F8F2',
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: CYBER_DELTA_COLORS[deltaType],
          }}
        >
          {delta}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#94A3B8',
          fontFamily: 'var(--font-dm-sans)',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: '#0F172A',
          fontFamily: 'var(--font-dm-sans)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: DELTA_COLORS[deltaType],
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {delta}
      </div>
    </div>
  );
}
