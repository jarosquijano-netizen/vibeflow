'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

type AccentType = 'green' | 'cyan' | 'purple' | 'default';

interface KPICardProps {
  label: string;
  value: string;
  delta: string;
  deltaType: 'positive' | 'negative' | 'neutral';
  accent?: AccentType;
}

const DELTA_COLORS = {
  positive: '#16A34A',
  negative: '#DC2626',
  neutral:  '#94A3B8',
};

const CYBER_DELTA_COLORS = {
  positive: '#00FF88',
  negative: '#FF4444',
  neutral:  '#6B7280',
};

/* Top border accent color per accent type */
const ACCENT_BORDER: Record<AccentType, { default: string; cyber: string }> = {
  green:   { default: '#16A34A', cyber: '#00FF88' },
  cyan:    { default: '#0EA5E9', cyber: '#00D4FF' },
  purple:  { default: '#7C3AED', cyber: '#BF00FF' },
  default: { default: '', cyber: '' }, // fallback to deltaType
};

/* Fallback top-border by deltaType */
const CYBER_ACCENT: Record<string, string> = {
  positive: '#00FF88',
  negative: '#FF4444',
  neutral:  '#3B4B3D',
};
const DEFAULT_ACCENT: Record<string, string> = {
  positive: '#16A34A',
  negative: '#DC2626',
  neutral:  '#E2E8F0',
};

const MONO = "'JetBrains Mono', monospace";

export default function KPICard({
  label,
  value,
  delta,
  deltaType,
  accent = 'default',
}: KPICardProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [hovered, setHovered] = useState(false);

  const accentCfg = ACCENT_BORDER[accent];
  const topColor = isCyber
    ? (accentCfg.cyber || CYBER_ACCENT[deltaType])
    : (accentCfg.default || DEFAULT_ACCENT[deltaType]);

  if (isCyber) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#111118',
          borderTop: `3px solid ${topColor}`,
          borderRight: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#3B4B3D'}`,
          borderBottom: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#3B4B3D'}`,
          borderLeft: `1px solid ${hovered ? 'rgba(0,255,136,0.3)' : '#3B4B3D'}`,
          borderRadius: 6,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          boxShadow: hovered ? `0 0 16px ${topColor}12` : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6B7280',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 32,
            fontWeight: 700,
            color: '#F0FFF4',
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
        borderTop: `3px solid ${topColor || '#E2E8F0'}`,
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
