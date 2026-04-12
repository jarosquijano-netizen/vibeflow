'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { GanttFeature } from '@/components/roadmap/GanttRow';
import { useTheme } from '@/components/providers/ThemeProvider';

const SIZE_COLORS: Record<string, string> = {
  XS: '#64748B', S: '#16A34A', M: '#2563EB', L: '#D97706', XL: '#DC2626',
};

const CYBER_SIZE: Record<string, string> = {
  XS: '#64748B', S: '#00FF88', M: '#00D4FF', L: '#FFB800', XL: '#FF4444',
};

const RATIONALE: Record<string, string> = {
  f1:  'Scope matched initial estimate',
  f2:  'Scope expanded after technical discovery',
  f3:  'More integration complexity than expected',
  f4:  'Well-calibrated for scope',
  f5:  'Well-calibrated for scope',
  f6:  'Well-calibrated for scope',
  f7:  'Hidden EU compliance work added scope',
  f8:  'Well-calibrated for scope',
  f9:  'Carrier API variability underestimated',
  f10: 'Well-calibrated for scope',
  f11: 'Well-calibrated for scope',
  f12: 'Well-calibrated for scope',
  f13: 'Finance reconciliation rules complex',
  f14: 'Mobile offline requirements added scope',
};

const MONO = "'JetBrains Mono', monospace";

interface AISizingReportProps {
  features: GanttFeature[];
}

export default function AISizingReport({ features }: AISizingReportProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const accepted = features.filter((f) => f.aiAccepted).length;
  const total = features.length;
  const rate = Math.round((accepted / total) * 100);

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <div
        style={{
          background: '#0A0A0F',
          border: '1px solid #3B4B3D',
          borderLeft: '3px solid #BF00FF',
          boxShadow: 'inset 3px 0 12px rgba(191,0,255,0.1)',
          padding: 16,
        }}
      >
        {/* Header */}
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: '#BF00FF',
          }}
        >
          ✦ AI_SIZING_QUALITY_REPORT
        </span>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ height: 28, borderBottom: '1px solid #2A2A3E' }}>
              {['FEATURE', 'AI SUGGESTED', 'FINAL SIZE', 'ACCEPTED', 'RATIONALE'].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: '#6B7280',
                    fontWeight: 700,
                    textAlign: 'left',
                    letterSpacing: '0.06em',
                    paddingLeft: 8,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => {
              const aiCol = CYBER_SIZE[f.aiSuggestedSize] ?? '#64748B';
              const finalCol = CYBER_SIZE[f.size] ?? '#64748B';
              return (
                <tr
                  key={f.id}
                  style={{
                    height: 34,
                    borderBottom: '1px solid #2A2A3E',
                    background: i % 2 === 1 ? '#0D0D17' : '#0A0A0F',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? '#0D0D17' : '#0A0A0F'; }}
                >
                  {/* Feature title */}
                  <td
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: '#9CA3AF',
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingLeft: 8,
                    }}
                  >
                    {f.title}
                  </td>

                  {/* AI suggested size */}
                  <td style={{ paddingLeft: 8 }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: aiCol,
                        border: `1px solid ${aiCol}4D`,
                        background: `${aiCol}1A`,
                        padding: '1px 6px',
                        fontWeight: 700,
                      }}
                    >
                      {f.aiSuggestedSize}
                    </span>
                  </td>

                  {/* Final size */}
                  <td style={{ paddingLeft: 8 }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: finalCol,
                        border: `1px solid ${finalCol}4D`,
                        background: `${finalCol}1A`,
                        padding: '1px 6px',
                        fontWeight: 700,
                      }}
                    >
                      {f.size}
                    </span>
                  </td>

                  {/* Accepted */}
                  <td style={{ paddingLeft: 8 }}>
                    {f.aiAccepted
                      ? <CheckCircle size={14} style={{ color: '#00FF88', filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.3))' }} />
                      : <AlertTriangle size={14} style={{ color: '#FFB800' }} />
                    }
                  </td>

                  {/* Rationale */}
                  <td
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: '#6B7280',
                      paddingLeft: 8,
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {RATIONALE[f.id] ?? 'Well-calibrated for scope'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom stat row */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #2A2A3E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 12, color: '#BF00FF', fontWeight: 700 }}>
            ✦ {rate}% acceptance rate — AI sizing is well-calibrated
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563' }}>
            {accepted} of {total} features
          </span>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  DEFAULT RENDER                                                   */
  /* ================================================================ */
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: 16,
      }}
    >
      {/* Header */}
      <div style={{ borderLeft: '3px solid #7C3AED', paddingLeft: 12 }}>
        <span
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#7C3AED',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          ✦ AI Sizing Quality Report
        </span>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ height: 28, borderBottom: '1px solid #E2E8F0' }}>
            {['FEATURE', 'AI SUGGESTED', 'FINAL SIZE', 'ACCEPTED', 'RATIONALE'].map((h) => (
              <th
                key={h}
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  fontWeight: 700,
                  textAlign: 'left',
                  letterSpacing: '0.06em',
                  paddingLeft: 8,
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr
              key={f.id}
              style={{
                height: 32,
                borderBottom: '1px solid #F1F5F9',
                background: i % 2 === 1 ? '#F8FAFC' : '#FFFFFF',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? '#F8FAFC' : '#FFFFFF'; }}
            >
              <td style={{ fontSize: 12, color: '#0F172A', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 8, fontFamily: 'var(--font-dm-sans)' }}>
                {f.title}
              </td>
              <td style={{ paddingLeft: 8 }}>
                <span style={{ background: SIZE_COLORS[f.aiSuggestedSize] ?? '#94A3B8', color: '#FFFFFF', fontSize: 10, fontWeight: 600, padding: '2px 6px', fontFamily: 'var(--font-dm-sans)' }}>
                  {f.aiSuggestedSize}
                </span>
              </td>
              <td style={{ paddingLeft: 8 }}>
                <span style={{ background: SIZE_COLORS[f.size] ?? '#94A3B8', color: '#FFFFFF', fontSize: 10, fontWeight: 600, padding: '2px 6px', fontFamily: 'var(--font-dm-sans)' }}>
                  {f.size}
                </span>
              </td>
              <td style={{ paddingLeft: 8 }}>
                {f.aiAccepted
                  ? <CheckCircle size={14} style={{ color: '#16A34A' }} />
                  : <AlertTriangle size={14} style={{ color: '#D97706' }} />
                }
              </td>
              <td style={{ fontSize: 11, color: '#94A3B8', paddingLeft: 8, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-dm-sans)' }}>
                {RATIONALE[f.id] ?? 'Well-calibrated for scope'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom stat row */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, color: '#7C3AED', fontFamily: 'var(--font-dm-sans)' }}>
          ✦ {rate}% acceptance rate — AI sizing is well-calibrated
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
          {accepted} of {total} features
        </span>
      </div>
    </div>
  );
}
