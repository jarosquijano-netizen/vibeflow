'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { relativeTime } from '@/lib/reports-engine';
import {
  type SyncIntegration,
  type SyncStatus,
  statusBorderColor,
} from '@/lib/sync-data';

const MONO = "'JetBrains Mono', monospace";

interface SyncHealthCardProps {
  integration: SyncIntegration;
  onSync: (id: string) => void;
}

function StatusBadge({ status, isCyber }: { status: SyncStatus; isCyber: boolean }) {
  const color = statusBorderColor(status, isCyber);
  const labels: Record<SyncStatus, string> = {
    OK:      '● ONLINE',
    WARNING: '● WARNING',
    ERROR:   '× ERROR',
    SYNCING: '◌ SYNCING',
  };
  return (
    <span
      style={{
        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
        fontSize: 11,
        fontWeight: 700,
        color,
        letterSpacing: isCyber ? '0.06em' : 0,
        animation: status === 'SYNCING' ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {labels[status]}
    </span>
  );
}

export default function SyncHealthCard({ integration, onSync }: SyncHealthCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [hovered, setHovered] = useState(false);

  const borderColor = statusBorderColor(integration.status, isCyber);
  const cardBg      = isCyber ? '#111118' : '#FFFFFF';
  const cardBorder  = isCyber ? '#2A2A3E' : '#E2E8F0';
  const titleColor  = isCyber ? '#F0FFF4' : '#0F172A';
  const metaColor   = isCyber ? '#6B7280' : '#94A3B8';
  const bodyColor   = isCyber ? '#9CA3AF' : '#475569';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        borderLeft: `4px solid ${borderColor}`,
        borderTop: `1px solid ${hovered ? borderColor : cardBorder}`,
        borderRight: `1px solid ${hovered ? borderColor : cardBorder}`,
        borderBottom: `1px solid ${hovered ? borderColor : cardBorder}`,
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        flex: 1,
        transition: 'border-color 150ms ease',
        boxShadow: isCyber && hovered ? `0 0 16px ${borderColor}18` : 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon circle */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isCyber ? '#1A1A28' : '#F1F5F9',
              border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: borderColor,
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              flexShrink: 0,
            }}
          >
            {integration.icon}
          </div>
          {/* Name */}
          <span
            style={{
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: 15,
              fontWeight: 700,
              color: titleColor,
              textTransform: isCyber ? 'uppercase' : 'none',
              letterSpacing: isCyber ? '0.04em' : 0,
            }}
          >
            {isCyber ? integration.name.replace(' ', '_') : integration.name}
          </span>
        </div>
        <StatusBadge status={integration.status} isCyber={isCyber} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: metaColor }}>
          Last sync: {relativeTime(integration.lastSync)}
        </span>
        <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: bodyColor }}>
          {integration.itemsSynced} synced
        </span>
        {integration.errors > 0 && (
          <span
            style={{
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              fontSize: 12,
              fontWeight: 700,
              color: isCyber ? '#FF4444' : '#DC2626',
            }}
          >
            {integration.errors} error{integration.errors !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Sync button */}
      <button
        onClick={() => onSync(integration.id)}
        style={{
          marginTop: 16,
          width: '100%',
          height: 32,
          background: isCyber ? 'transparent' : '#FFFFFF',
          border: `1px solid ${isCyber ? '#00D4FF' : '#E2E8F0'}`,
          color: isCyber ? '#00D4FF' : '#475569',
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          fontSize: 12,
          fontWeight: isCyber ? 700 : 500,
          cursor: 'pointer',
          borderRadius: 0,
          letterSpacing: isCyber ? '0.06em' : 0,
          transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isCyber ? 'rgba(0,212,255,0.05)' : '#F8FAFC';
          if (!isCyber) e.currentTarget.style.borderColor = '#CBD5E1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isCyber ? 'transparent' : '#FFFFFF';
          if (!isCyber) e.currentTarget.style.borderColor = '#E2E8F0';
        }}
      >
        {isCyber ? 'SYNC_NOW' : 'Sync Now'}
      </button>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
