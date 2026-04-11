'use client';

import type { Feature } from '@/types';

/* ------------------------------------------------------------------ */
/*  Config (shared via import in Column/Board)                         */
/* ------------------------------------------------------------------ */
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; lightBg: string }> = {
  IDEA:        { label: 'IDEA',        color: '#94A3B8', bg: '#F8FAFC', lightBg: '#F1F5F9' },
  SCOPING:     { label: 'SCOPING',     color: '#7C3AED', bg: '#F5F3FF', lightBg: '#EDE9FE' },
  PROTOTYPING: { label: 'PROTOTYPING', color: '#2563EB', bg: '#EFF6FF', lightBg: '#DBEAFE' },
  BUILDING:    { label: 'BUILDING',    color: '#D97706', bg: '#FFF7ED', lightBg: '#FEF3C7' },
  DONE:        { label: 'DONE',        color: '#16A34A', bg: '#F0FDF4', lightBg: '#DCFCE7' },
  PARKED:      { label: 'PARKED',      color: '#DC2626', bg: '#FEF2F2', lightBg: '#FEE2E2' },
};

export const SIZE_CONFIG: Record<string, { color: string }> = {
  XS: { color: '#64748B' },
  S:  { color: '#16A34A' },
  M:  { color: '#2563EB' },
  L:  { color: '#D97706' },
  XL: { color: '#DC2626' },
};

/* Owner avatar colors — deterministic from name hash */
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h;
}

function ownerColor(name: string) {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];
}

function ownerInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ------------------------------------------------------------------ */
/*  FeatureCard                                                        */
/* ------------------------------------------------------------------ */
interface FeatureCardProps {
  feature: Feature;
  isDragging?: boolean;
}

export default function FeatureCard({ feature, isDragging = false }: FeatureCardProps) {
  const statusColor = STATUS_CONFIG[feature.status]?.color ?? '#94A3B8';

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderLeft: `3px solid ${statusColor}`,
        border: `1px solid #E2E8F0`,
        borderLeftWidth: 3,
        borderLeftColor: statusColor,
        padding: 12,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'rotate(1deg)' : 'none',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (isDragging) return;
        const el = e.currentTarget;
        el.style.borderColor = '#2563EB';
        el.style.borderLeftColor = statusColor;
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        if (isDragging) return;
        const el = e.currentTarget;
        el.style.borderColor = '#E2E8F0';
        el.style.borderLeftColor = statusColor;
        el.style.transform = 'none';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Row 1 — Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#0F172A',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {feature.title}
      </div>

      {/* Row 2 — Problem statement */}
      <div
        style={{
          fontSize: 11,
          color: '#94A3B8',
          fontStyle: 'italic',
          marginTop: 4,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {feature.problemStatement}
      </div>

      {/* Row 3 — Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {/* Size badge */}
        {feature.size ? (
          <span
            style={{
              background: SIZE_CONFIG[feature.size]?.color ?? '#94A3B8',
              color: '#FFFFFF',
              fontSize: 10,
              textTransform: 'uppercase',
              fontWeight: 600,
              padding: '1px 6px',
            }}
          >
            {feature.size}
          </span>
        ) : (
          <span
            style={{
              background: '#7C3AED',
              color: '#FFFFFF',
              fontSize: 10,
              padding: '1px 6px',
              fontWeight: 600,
              animation: 'ai-pulse 2s ease-in-out infinite',
            }}
          >
            ✦ AI size?
          </span>
        )}

        {/* Jira badge */}
        {feature.jiraEpicId && (
          <span
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: 10,
              padding: '1px 6px',
            }}
          >
            {feature.jiraEpicId}
          </span>
        )}

        {/* Proto badge */}
        {feature.prototypeUrl && (
          <span
            style={{
              background: '#EFF6FF',
              color: '#2563EB',
              fontSize: 10,
              padding: '1px 6px',
            }}
          >
            proto ↗
          </span>
        )}
      </div>

      {/* Row 4 — Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 10, color: '#94A3B8' }}>{feature.quarter}</span>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: ownerColor(feature.owner),
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title={feature.owner}
        >
          {ownerInitials(feature.owner)}
        </div>
      </div>
    </div>
  );
}
