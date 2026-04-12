'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

/* ------------------------------------------------------------------ */
/*  Exported type — imported by GanttChart, RoadmapPage, AISizingReport */
/* ------------------------------------------------------------------ */
export interface GanttFeature {
  id: string;
  title: string;
  owner: string;
  status: string;
  size: string;
  quarter: string;
  progress: number;
  jiraEpicId: string | null;
  startDate: string;
  endDate: string;
  aiSuggestedSize: string;
  aiAccepted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
export const LABEL_WIDTH = 240;
export const TIMELINE_WIDTH = 1440;
const YEAR_DAYS = 365;
const ROW_HEIGHT = 36;

/* ------------------------------------------------------------------ */
/*  Config — Default                                                    */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  IDEA:        { color: '#94A3B8', bg: '#F8FAFC' },
  SCOPING:     { color: '#7C3AED', bg: '#F5F3FF' },
  PROTOTYPING: { color: '#2563EB', bg: '#EFF6FF' },
  BUILDING:    { color: '#D97706', bg: '#FFF7ED' },
  DONE:        { color: '#16A34A', bg: '#F0FDF4' },
  PARKED:      { color: '#DC2626', bg: '#FEF2F2' },
};

/* ------------------------------------------------------------------ */
/*  Config — Cyber                                                      */
/* ------------------------------------------------------------------ */
export const CYBER_STATUS_CONFIG: Record<string, { color: string; glow: string; bg: string }> = {
  IDEA:        { color: '#6B7280', glow: 'rgba(107,114,128,0.4)', bg: 'rgba(107,114,128,0.08)' },
  SCOPING:     { color: '#BF00FF', glow: 'rgba(191,0,255,0.4)',   bg: 'rgba(191,0,255,0.08)'   },
  PROTOTYPING: { color: '#00D4FF', glow: 'rgba(0,212,255,0.4)',   bg: 'rgba(0,212,255,0.08)'   },
  BUILDING:    { color: '#FFB800', glow: 'rgba(255,184,0,0.4)',   bg: 'rgba(255,184,0,0.08)'   },
  DONE:        { color: '#00FF88', glow: 'rgba(0,255,136,0.4)',   bg: 'rgba(0,255,136,0.08)'   },
  PARKED:      { color: '#FF4444', glow: 'rgba(255,68,68,0.4)',   bg: 'rgba(255,68,68,0.08)'   },
};

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];
function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h;
}
export function ownerColor(name: string) { return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]; }
export function ownerInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function dateToX(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const jan1 = new Date(2026, 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  return (Math.max(0, days) / YEAR_DAYS) * TIMELINE_WIDTH;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ------------------------------------------------------------------ */
/*  GanttRow                                                            */
/* ------------------------------------------------------------------ */
interface GanttRowProps {
  feature: GanttFeature;
  rowIndex: number;
}

export default function GanttRow({ feature, rowIndex }: GanttRowProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [hovered, setHovered] = useState(false);
  const [barHovered, setBarHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const statusCfg = STATUS_CONFIG[feature.status] ?? STATUS_CONFIG.IDEA;
  const cyberCfg = CYBER_STATUS_CONFIG[feature.status] ?? CYBER_STATUS_CONFIG.IDEA;
  const isAlt = rowIndex % 2 === 1;

  const barLeft = Math.min(dateToX(feature.startDate), TIMELINE_WIDTH);
  const barRight = Math.min(dateToX(feature.endDate), TIMELINE_WIDTH);
  const barWidth = Math.max(4, barRight - barLeft);
  const progressWidth = barWidth * feature.progress;

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <div
        style={{
          display: 'flex',
          height: ROW_HEIGHT,
          borderBottom: '1px solid #2A2A3E',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMousePos(null); setBarHovered(false); }}
      >
        {/* ── LABEL ZONE — cyber ── */}
        <div
          style={{
            width: LABEL_WIDTH,
            flexShrink: 0,
            paddingLeft: 16,
            paddingRight: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: hovered ? '#111118' : '#0A0A0F',
            position: 'sticky',
            left: 0,
            zIndex: 2,
            borderRight: '1px solid #2A2A3E',
            transition: 'background 100ms ease',
          }}
        >
          {/* Owner avatar */}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: ownerColor(feature.owner),
              color: '#FFFFFF',
              fontSize: 7,
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

          {/* Title + hover status badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                fontWeight: 600,
                color: '#B9CBB9',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: hovered ? 1.2 : 'normal',
              }}
            >
              {feature.title}
            </div>
            {hovered && (
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  color: cyberCfg.color,
                  background: cyberCfg.bg,
                  padding: '0 4px',
                  display: 'inline-block',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: '14px',
                }}
              >
                {feature.status}
              </div>
            )}
          </div>
        </div>

        {/* ── GANTT ZONE — cyber ── */}
        <div
          style={{
            width: TIMELINE_WIDTH,
            flexShrink: 0,
            position: 'relative',
            background: hovered ? 'rgba(0,255,136,0.02)' : (isAlt ? '#0D0D17' : '#0A0A0F'),
          }}
        >
          {/* Month grid lines */}
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (i + 1) * 120,
                top: 0,
                bottom: 0,
                width: 1,
                background: '#2A2A3E',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* GANTT BAR — cyber */}
          <div
            style={{
              position: 'absolute',
              left: barLeft,
              top: 6,
              height: 24,
              width: barWidth,
              background: hexToRgba(cyberCfg.color, 0.6),
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: 0,
              boxShadow: barHovered ? `0 0 8px ${cyberCfg.glow}` : 'none',
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={() => setBarHovered(true)}
            onMouseLeave={() => setBarHovered(false)}
            onMouseMove={(e) => setMousePos({ x: e.clientX + 14, y: e.clientY - 8 })}
            onClick={() => console.log('open feature detail', feature.id)}
          >
            {/* Progress fill */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: progressWidth,
                background: hexToRgba(cyberCfg.color, 0.9),
              }}
            />

            {/* Title inside bar */}
            {barWidth > 80 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: '#FFFFFF',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {feature.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── TOOLTIP — cyber ── */}
        {mousePos && (
          <div
            style={{
              position: 'fixed',
              left: mousePos.x,
              top: mousePos.y,
              zIndex: 1000,
              background: '#12121E',
              border: '1px solid #3B4B3D',
              padding: 12,
              minWidth: 180,
              maxWidth: 240,
              pointerEvents: 'none',
              borderRadius: 6,
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: '#F0FFF4', marginBottom: 6 }}>
              {feature.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', minWidth: 48 }}>owner</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9CA3AF' }}>{feature.owner}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', minWidth: 48 }}>status</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: cyberCfg.color }}>{feature.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', minWidth: 48 }}>size</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9CA3AF' }}>{feature.size}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', minWidth: 48 }}>backlog</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9CA3AF' }}>{Math.round(feature.progress * 10)}/10 done</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', minWidth: 48 }}>jira</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: '#9CA3AF' }}>{feature.jiraEpicId ?? '—'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================ */
  /*  DEFAULT RENDER                                                   */
  /* ================================================================ */
  return (
    <div
      style={{
        display: 'flex',
        height: ROW_HEIGHT,
        borderBottom: '1px solid #F1F5F9',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos(null); }}
    >
      {/* ── LABEL ZONE ── */}
      <div
        style={{
          width: LABEL_WIDTH,
          flexShrink: 0,
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: hovered ? '#F8FAFC' : '#FFFFFF',
          position: 'sticky',
          left: 0,
          zIndex: 2,
          borderRight: '1px solid #F1F5F9',
          transition: 'background 100ms ease',
        }}
      >
        {/* Owner avatar */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: ownerColor(feature.owner),
            color: '#FFFFFF',
            fontSize: 7,
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

        {/* Title + hover status badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#0F172A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-dm-sans)',
              lineHeight: hovered ? 1.2 : 'normal',
            }}
          >
            {feature.title}
          </div>
          {hovered && (
            <div
              style={{
                fontSize: 9,
                color: statusCfg.color,
                background: statusCfg.bg,
                padding: '0 4px',
                display: 'inline-block',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: '14px',
              }}
            >
              {feature.status}
            </div>
          )}
        </div>
      </div>

      {/* ── GANTT ZONE ── */}
      <div
        style={{
          width: TIMELINE_WIDTH,
          flexShrink: 0,
          position: 'relative',
          background: isAlt ? '#F8FAFC' : '#FFFFFF',
        }}
      >
        {/* Month grid lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (i + 1) * 120,
              top: 0,
              bottom: 0,
              width: 1,
              background: '#F1F5F9',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* GANTT BAR */}
        <div
          style={{
            position: 'absolute',
            left: barLeft,
            top: 6,
            height: 24,
            width: barWidth,
            background: hexToRgba(statusCfg.color, 0.18),
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: 0,
          }}
          onMouseMove={(e) => setMousePos({ x: e.clientX + 14, y: e.clientY - 8 })}
          onMouseLeave={() => setMousePos(null)}
          onClick={() => console.log('open feature detail', feature.id)}
        >
          {/* Progress fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: progressWidth,
              background: statusCfg.color,
            }}
          />

          {/* Title inside bar */}
          {barWidth > 80 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 500,
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {feature.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── TOOLTIP (fixed, follows mouse) ── */}
      {mousePos && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x,
            top: mousePos.y,
            zIndex: 1000,
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '8px 10px',
            fontSize: 12,
            minWidth: 180,
            maxWidth: 240,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, fontFamily: 'var(--font-dm-sans)' }}>
            {feature.title}
          </div>
          <div style={{ color: '#94A3B8', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-dm-sans)' }}>
            {feature.owner}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ background: statusCfg.color, color: '#FFFFFF', fontSize: 10, padding: '1px 5px', fontWeight: 600 }}>
              {feature.status}
            </span>
            <span style={{ background: '#334155', color: '#FFFFFF', fontSize: 10, padding: '1px 5px', fontWeight: 600 }}>
              {feature.size}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
            Backlog: {Math.round(feature.progress * 10)}/10 done
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
            Jira: {feature.jiraEpicId ?? '—'}
          </div>
        </div>
      )}
    </div>
  );
}
