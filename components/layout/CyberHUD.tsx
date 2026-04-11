'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

const XP_CURRENT = 1250;
const XP_NEXT_LEVEL = 2000;
const XP_PROGRESS = XP_CURRENT / XP_NEXT_LEVEL;

export default function CyberHUD() {
  const { theme } = useTheme();
  if (theme !== 'cyber') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 192,
        background: 'rgba(10, 10, 15, 0.92)',
        border: '1px solid #2A2A3E',
        padding: '10px 12px',
        zIndex: 200,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.08), 0 4px 24px rgba(0,0,0,0.4)',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#4B5563',
          marginBottom: 4,
        }}
      >
        Session XP
      </div>

      {/* XP value */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#00FF88',
          lineHeight: 1,
          textShadow: '0 0 12px rgba(0, 255, 136, 0.5)',
          marginBottom: 6,
        }}
      >
        {XP_CURRENT.toLocaleString()}
        <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 4, fontWeight: 400 }}>
          / {XP_NEXT_LEVEL.toLocaleString()}
        </span>
      </div>

      {/* XP progress bar */}
      <div
        style={{
          height: 3,
          background: '#1F1F25',
          border: '1px solid #2A2A3E',
          marginBottom: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${XP_PROGRESS * 100}%`,
            background: 'linear-gradient(90deg, #00FF88, #00CC6A)',
            boxShadow: '0 0 6px rgba(0, 255, 136, 0.6)',
            transition: 'width 600ms ease',
          }}
        />
      </div>

      {/* Level */}
      <div
        style={{
          fontSize: 10,
          color: '#9CA3AF',
          letterSpacing: '0.04em',
          marginBottom: 4,
        }}
      >
        LVL 7 &middot; SENIOR VIBE CODER
      </div>

      {/* Streak */}
      <div
        style={{
          fontSize: 11,
          color: '#FFB800',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span>🔥</span>
        <span style={{ fontWeight: 600 }}>7 DAY STREAK</span>
      </div>
    </div>
  );
}
