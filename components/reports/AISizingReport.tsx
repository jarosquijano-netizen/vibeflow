'use client';

import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { GanttFeature } from '@/components/roadmap/GanttRow';

const SIZE_COLORS: Record<string, string> = {
  XS: '#64748B', S: '#16A34A', M: '#2563EB', L: '#D97706', XL: '#DC2626',
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

interface AISizingReportProps {
  features: GanttFeature[];
}

export default function AISizingReport({ features }: AISizingReportProps) {
  const accepted = features.filter((f) => f.aiAccepted).length;
  const total = features.length;
  const rate = Math.round((accepted / total) * 100);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: 16,
      }}
    >
      {/* Header */}
      <div
        style={{
          borderLeft: '3px solid #7C3AED',
          paddingLeft: 12,
        }}
      >
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
              {/* Feature title */}
              <td
                style={{
                  fontSize: 12,
                  color: '#0F172A',
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingLeft: 8,
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {f.title}
              </td>

              {/* AI suggested size */}
              <td style={{ paddingLeft: 8 }}>
                <span
                  style={{
                    background: SIZE_COLORS[f.aiSuggestedSize] ?? '#94A3B8',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 6px',
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  {f.aiSuggestedSize}
                </span>
              </td>

              {/* Final size */}
              <td style={{ paddingLeft: 8 }}>
                <span
                  style={{
                    background: SIZE_COLORS[f.size] ?? '#94A3B8',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 6px',
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  {f.size}
                </span>
              </td>

              {/* Accepted */}
              <td style={{ paddingLeft: 8 }}>
                {f.aiAccepted
                  ? <CheckCircle size={14} style={{ color: '#16A34A' }} />
                  : <AlertTriangle size={14} style={{ color: '#D97706' }} />
                }
              </td>

              {/* Rationale */}
              <td
                style={{
                  fontSize: 11,
                  color: '#94A3B8',
                  paddingLeft: 8,
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
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
