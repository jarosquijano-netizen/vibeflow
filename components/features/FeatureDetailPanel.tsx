'use client';

import { useEffect, useState } from 'react';
import { X, Zap } from 'lucide-react';
import Link from 'next/link';
import type { Feature } from '@/types';
import { useTheme } from '@/components/providers/ThemeProvider';
import { STATUS_CONFIG, SIZE_CONFIG, CYBER_STATUS_CONFIG } from './FeatureCard';
import AISizeEstimator from './AISizeEstimator';
import StartSessionModal from './StartSessionModal';
import { getActiveSessions } from '@/lib/feature-store';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

interface SessionStub {
  id: string;
  title: string;
}

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
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [linkedSessions, setLinkedSessions] = useState<SessionStub[]>([]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!feature) return;
    const sessions = getActiveSessions();
    const linked = sessions
      .filter((s) => s.linkedFeatureIds.includes(feature.id))
      .map((s) => ({ id: s.id, title: s.title }));
    setLinkedSessions(linked);
  }, [feature]);

  if (!feature) return null;

  const statusCfg = STATUS_CONFIG[feature.status];
  const cyberCfg = CYBER_STATUS_CONFIG[feature.status] ?? CYBER_STATUS_CONFIG.IDEA;

  /* ── Cyber panel ── */
  if (isCyber) {
    return (
      <>
        {/* Backdrop */}
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

        {/* Panel */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: '100%',
            width: 480,
            background: '#12121E',
            borderLeft: '1px solid #3B4B3D',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
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
              padding: '16px 24px',
              borderBottom: '1px solid #3B4B3D',
              flexShrink: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#F0FFF4',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {feature.title}
              </h2>
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: MONO,
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
                color: '#6B7280',
                flexShrink: 0,
                padding: 0,
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F0FFF4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#3CD7FF', border: '1px solid rgba(60,215,255,0.3)', background: 'rgba(60,215,255,0.05)', padding: '2px 8px' }}>
                {feature.quarter}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#B9CBB9', border: '1px solid #3B4B3D', padding: '2px 8px' }}>
                {feature.owner}
              </span>
              {feature.size && (
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#FFB800', border: '1px solid rgba(255,184,0,0.3)', background: 'rgba(255,184,0,0.05)', padding: '2px 8px', textTransform: 'uppercase' }}>
                  SIZE: {feature.size}
                </span>
              )}
            </div>

            {/* Problem statement */}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: 6 }}>
                {'// PROBLEM_STATEMENT'}
              </div>
              <p style={{ fontFamily: MONO, fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: 0, background: '#111118', padding: 12, borderLeft: '2px solid #3B4B3D' }}>
                {feature.problemStatement}
              </p>
            </div>

            {/* Jira / prototype links */}
            {(feature.jiraEpicId || feature.prototypeUrl) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {feature.jiraEpicId && (
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#6B7280', border: '1px solid #3B4B3D', background: '#0E0E13', padding: '3px 8px' }}>
                    {feature.jiraEpicId}
                  </span>
                )}
                {feature.prototypeUrl && (
                  <a
                    href={feature.prototypeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: MONO, fontSize: 10, color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.05)', padding: '3px 8px', textDecoration: 'none' }}
                  >
                    proto ↗
                  </a>
                )}
              </div>
            )}

            {/* ── VIBE SESSION section ── */}
            <div style={{ background: '#111118', border: '1px solid #2A2A3E', borderRadius: 6, padding: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280', marginBottom: 12 }}>
                {'// VIBE_SESSION'}
              </div>

              {linkedSessions.length === 0 ? (
                <>
                  <button
                    onClick={() => setShowSessionModal(true)}
                    style={{
                      width: '100%',
                      height: 36,
                      background: '#BF00FF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 4,
                      fontFamily: DISPLAY,
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'box-shadow 150ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(191,0,255,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <Zap size={13} />
                    ⚡ START_SESSION
                  </button>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563', marginTop: 8 }}>
                    Start a focused building session for this feature.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', marginBottom: 8 }}>
                    {linkedSessions.length} session{linkedSessions.length !== 1 ? 's' : ''} logged
                  </div>
                  {linkedSessions.slice(0, 2).map((s) => (
                    <div key={s.id} style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      · {s.title}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => setShowSessionModal(true)}
                      style={{
                        flex: 1,
                        height: 32,
                        background: 'rgba(191,0,255,0.1)',
                        border: '1px solid rgba(191,0,255,0.4)',
                        borderRadius: 4,
                        fontFamily: MONO,
                        fontSize: 11,
                        color: '#BF00FF',
                        cursor: 'pointer',
                        transition: 'box-shadow 150ms ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 10px rgba(191,0,255,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      ⚡ Start New Session
                    </button>
                    <Link
                      href="/dashboard/sessions"
                      style={{ fontFamily: MONO, fontSize: 11, color: '#00D4FF', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                      View All →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#2A2A3E' }} />

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

        {showSessionModal && (
          <StartSessionModal
            feature={feature}
            onStart={() => {}}
            onClose={() => setShowSessionModal(false)}
          />
        )}
      </>
    );
  }

  /* ── Default panel ── */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 40 }}
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
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
            {feature.title}
          </h2>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexShrink: 0, padding: 0 }}
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
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: 6 }}>
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
                <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', fontSize: 11, padding: '3px 8px' }}>
                  {feature.jiraEpicId}
                </span>
              )}
              {feature.prototypeUrl && (
                <a href={feature.prototypeUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#EFF6FF', color: '#2563EB', fontSize: 11, padding: '3px 8px', textDecoration: 'none' }}>
                  proto ↗
                </a>
              )}
            </div>
          )}

          {/* ── VIBE SESSION section ── */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: 16 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', fontWeight: 600, marginBottom: 12 }}>
              Vibe Session
            </div>

            {linkedSessions.length === 0 ? (
              <>
                <button
                  onClick={() => setShowSessionModal(true)}
                  style={{
                    width: '100%',
                    height: 36,
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'box-shadow 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <Zap size={14} />
                  ⚡ Start Vibe Session
                </button>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>
                  Start a focused building session for this feature.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>
                  {linkedSessions.length} session{linkedSessions.length !== 1 ? 's' : ''} logged
                </div>
                {linkedSessions.slice(0, 2).map((s) => (
                  <div key={s.id} style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    · {s.title}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => setShowSessionModal(true)}
                    style={{
                      flex: 1,
                      height: 32,
                      background: 'none',
                      border: '1px solid #7C3AED',
                      borderRadius: 4,
                      fontSize: 12,
                      color: '#7C3AED',
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Start New Session
                  </button>
                  <Link
                    href="/dashboard/sessions"
                    style={{ fontSize: 12, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    View All Sessions →
                  </Link>
                </div>
              </>
            )}
          </div>

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

      {showSessionModal && (
        <StartSessionModal
          feature={feature}
          onStart={() => {}}
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </>
  );
}
