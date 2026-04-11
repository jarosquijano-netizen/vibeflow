'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Feature } from '@/types';
import { STATUS_CONFIG, SIZE_CONFIG } from './FeatureCard';
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
  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!feature) return null;

  const statusCfg = STATUS_CONFIG[feature.status];

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
            {/* Status badge */}
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

            {/* Quarter */}
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{feature.quarter}</span>

            {/* Owner */}
            <span style={{ fontSize: 12, color: '#475569' }}>{feature.owner}</span>

            {/* Size badge if set */}
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
