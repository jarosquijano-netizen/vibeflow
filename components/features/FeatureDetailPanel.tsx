'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Feature } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import { STATUS_CONFIG, SIZE_CONFIG, CYBER_STATUS_CONFIG } from './FeatureCard';
import AISizeEstimator from './AISizeEstimator';

interface FeatureDetailPanelProps {
  feature: Feature | null;
  onClose: () => void;
  onSizeAccepted: (id: string, size: string) => void;
}

export default function FeatureDetailPanel({
  feature,
  onClose,
  onSizeAccepted,
}: FeatureDetailPanelProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!feature) return null;

  const statusCfg = STATUS_CONFIG[feature.status];
  const cyberCfg = CYBER_STATUS_CONFIG[feature.status] ?? CYBER_STATUS_CONFIG.IDEA;

  /* ── Cyber panel ── */
  if (isCyber) {
    return (
      <>
        {/* Cyber backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />

        {/* Cyber panel */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            width: 480,
            background: '#0D0D17',
            borderLeft: '1px solid #2A2A3E',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 200ms ease forwards',
            overflowY: 'auto',
          }}
        >
          {/* Cyber header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              padding: '16px 24px',
              borderBottom: '1px solid #2A2A3E',
              flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#F8F8F2',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {feature.title}
              </h2>
              {/* Status badge inline */}
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: cyberCfg.color,
                    border: `1px solid ${cyberCfg.color}4D`,
                    background: cyberCfg.bg,
                    padding: '2px 8px',
                  }}
                >
                  {feature.status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28,
                height: 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4B5563',
                flexShrink: 0,
                padding: 0,
                transition: 'color 150ms ease, box-shadow 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F8F8F2';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(255,68,68,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4B5563';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Cyber body */}
          <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Quarter */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#3CD7FF',
                  border: '1px solid rgba(60,215,255,0.3)',
                  background: 'rgba(60,215,255,0.05)',
                  padding: '2px 8px',
                }}
              >
                {feature.quarter}
              </span>
              {/* Owner */}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#9CA3AF',
                  border: '1px solid #2A2A3E',
                  padding: '2px 8px',
                }}
              >
                {feature.owner}
              </span>
              {/* Size badge */}
              {feature.size && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: '#FFB800',
                    border: '1px solid rgba(255,184,0,0.3)',
                    background: 'rgba(255,184,0,0.05)',
                    padding: '2px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  SIZE: {feature.size}
                </span>
              )}
            </div>

            {/* Problem statement */}
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#4B5563',
                  marginBottom: 6,
                }}
              >
                {'// PROBLEM_STATEMENT'}
              </div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: '#6B7280',
                  lineHeight: 1.6,
                  margin: 0,
                  background: '#0A0A0F',
                  padding: 12,
                  borderLeft: '2px solid #2A2A3E',
                }}
              >
                {feature.problemStatement}
              </p>
            </div>

            {/* Jira / prototype links */}
            {(feature.jiraEpicId || feature.prototypeUrl) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {feature.jiraEpicId && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: '#4B5563',
                      border: '1px solid #2A2A3E',
                      background: '#0E0E13',
                      padding: '3px 8px',
                    }}
                  >
                    {feature.jiraEpicId}
                  </span>
                )}
                {feature.prototypeUrl && (
                  <a
                    href={feature.prototypeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: '#00D4FF',
                      border: '1px solid rgba(0,212,255,0.3)',
                      background: 'rgba(0,212,255,0.05)',
                      padding: '3px 8px',
                      textDecoration: 'none',
                    }}
                  >
                    proto ↗
                  </a>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: '#1A1A2A' }} />

            {/* AI Size Estimator */}
            <AISizeEstimator
              featureTitle={feature.title}
              problemStatement={feature.problemStatement}
              currentSize={feature.size}
              onSizeAccepted={(size) => onSizeAccepted(feature.id, size)}
            />
          </div>
        </div>

        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>
      </>
    );
  }

  /* ── Default panel ── */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 480,
          background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 200ms ease forwards',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {feature.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              flexShrink: 0,
              borderRadius: 0,
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: statusCfg.color,
                background: statusCfg.bg,
                borderLeft: `2px solid ${statusCfg.color}`,
                padding: '2px 8px',
              }}
            >
              {feature.status}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{feature.quarter}</span>
            <span style={{ fontSize: 12, color: '#475569' }}>{feature.owner}</span>
            {feature.size && (
              <span
                style={{
                  background: SIZE_CONFIG[feature.size]?.color ?? '#94A3B8',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  textTransform: 'uppercase',
                }}
              >
                {feature.size}
              </span>
            )}
          </div>

          {/* Problem statement */}
          <div>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#94A3B8',
                marginBottom: 6,
              }}
            >
              Problem Statement
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
              {feature.problemStatement}
            </p>
          </div>

          {/* Jira / prototype links */}
          {(feature.jiraEpicId || feature.prototypeUrl) && (
            <div style={{ display: 'flex', gap: 8 }}>
              {feature.jiraEpicId && (
                <span
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: 11,
                    padding: '3px 8px',
                  }}
                >
                  {feature.jiraEpicId}
                </span>
              )}
              {feature.prototypeUrl && (
                <a
                  href={feature.prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: 11,
                    padding: '3px 8px',
                    textDecoration: 'none',
                  }}
                >
                  proto ↗
                </a>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: '#E2E8F0' }} />

          {/* AI Size Estimator */}
          <AISizeEstimator
            featureTitle={feature.title}
            problemStatement={feature.problemStatement}
            currentSize={feature.size}
            onSizeAccepted={(size) => onSizeAccepted(feature.id, size)}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
