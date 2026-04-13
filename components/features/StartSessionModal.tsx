'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Zap } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { saveActiveSession } from '@/lib/feature-store';
import { dispatchXPEvent } from '@/lib/xp-engine';
import type { Feature, VibeSession } from '@/types';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

const DURATION_OPTIONS = [
  { label: '30 min', value: 0.5 },
  { label: '1 hr',   value: 1   },
  { label: '2 hr',   value: 2   },
  { label: '3 hr',   value: 3   },
  { label: '4 hr+',  value: 4   },
];

interface Props {
  feature: Feature | null;
  onStart: (session: Partial<VibeSession>) => void;
  onClose: () => void;
}

export default function StartSessionModal({ feature, onStart, onClose }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const router = useRouter();

  const [goal, setGoal] = useState(
    feature ? `Build and iterate on: ${feature.title}` : ''
  );
  const [duration, setDuration] = useState(2);

  if (!feature) return null;

  const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
    IDEA:        { color: '#94A3B8', bg: isCyber ? 'rgba(148,163,184,0.1)' : '#F1F5F9' },
    SCOPING:     { color: '#7C3AED', bg: isCyber ? 'rgba(124,58,237,0.1)' : '#EDE9FE' },
    PROTOTYPING: { color: '#2563EB', bg: isCyber ? 'rgba(37,99,235,0.1)'  : '#DBEAFE' },
    BUILDING:    { color: '#D97706', bg: isCyber ? 'rgba(217,119,6,0.1)'  : '#FEF3C7' },
    DONE:        { color: '#16A34A', bg: isCyber ? 'rgba(22,163,74,0.1)'  : '#DCFCE7' },
    PARKED:      { color: '#DC2626', bg: isCyber ? 'rgba(220,38,38,0.1)'  : '#FEE2E2' },
  };

  const statusCfg = STATUS_CONFIG[feature.status] ?? STATUS_CONFIG.IDEA;

  const C = {
    overlay:     isCyber ? 'rgba(0,0,0,0.7)'       : 'rgba(0,0,0,0.5)',
    panel:       isCyber ? '#1A1A28'                : '#FFFFFF',
    border:      isCyber ? '#3B4B3D'                : '#E2E8F0',
    shadow:      isCyber ? '0 0 40px rgba(191,0,255,0.15)' : '0 20px 60px rgba(0,0,0,0.2)',
    previewBg:   isCyber ? '#111118'                : '#F8FAFC',
    inputBg:     isCyber ? '#0A0A0F'                : '#F8FAFC',
    inputBorder: isCyber ? '#3B4B3D'                : '#E2E8F0',
    inputFocus:  isCyber ? '#BF00FF'                : '#7C3AED',
    text:        isCyber ? '#F0FFF4'                : '#0F172A',
    muted:       isCyber ? '#6B7280'                : '#94A3B8',
    ctaBg:       isCyber ? '#BF00FF'                : '#7C3AED',
    ctaText:     '#FFFFFF',
    ctaHover:    isCyber ? '0 0 20px rgba(191,0,255,0.5)' : '0 4px 12px rgba(124,58,237,0.4)',
  };

  function handleConfirm() {
    if (!feature) return;
    const newSession: VibeSession = {
      id: `session-${Date.now()}`,
      title: `${feature.title} — ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().slice(0, 10),
      duration,
      goal,
      status: 'OPEN',
      linkedFeatureIds: [feature.id],
      promptIds: [],
      prototypeUrl: undefined,
      notes: { worked: '', improve: '' },
      backlogItems: [],
      jiraSyncedIds: [],
    };

    saveActiveSession(newSession);
    onStart(newSession);

    dispatchXPEvent({
      id: `session-start-${Date.now()}`,
      label: 'Session started',
      amount: 50,
      timestamp: Date.now(),
    });

    onClose();
    router.push(`/dashboard/sessions?session=${newSession.id}`);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 4,
    fontFamily: isCyber ? MONO : 'inherit',
    fontSize: 13,
    color: C.text,
    padding: '8px 12px',
    outline: 'none',
    resize: 'none' as const,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: C.overlay,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 32,
          boxShadow: C.shadow,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          {isCyber ? (
            <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 900, color: '#BF00FF' }}>
              // START_SESSION
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
              Start Vibe Session
            </div>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Feature preview */}
        <div
          style={{
            background: C.previewBg,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: isCyber ? DISPLAY : 'inherit', fontSize: 14, fontWeight: 700, color: C.text }}>
              {feature.title}
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: isCyber ? MONO : 'inherit',
                fontWeight: 600,
                color: statusCfg.color,
                background: statusCfg.bg,
                padding: '1px 6px',
                borderRadius: 3,
                textTransform: 'uppercase',
              }}
            >
              {feature.status}
            </span>
            {feature.size && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: isCyber ? MONO : 'inherit',
                  color: isCyber ? '#FFB800' : '#475569',
                  background: isCyber ? 'rgba(255,184,0,0.08)' : '#F1F5F9',
                  padding: '1px 6px',
                  borderRadius: 3,
                }}
              >
                {feature.size}
              </span>
            )}
          </div>
          {feature.problemStatement && (
            <div
              style={{
                fontSize: 12,
                color: C.muted,
                fontFamily: isCyber ? MONO : 'inherit',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {feature.problemStatement}
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Session Goal
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={isCyber ? '// what are you building today?' : 'What are you trying to build today?'}
              rows={3}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.inputBorder; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Duration Estimate
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.inputBorder; }}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: isCyber ? '#0A0A0F' : '#FFF' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              height: 42,
              background: C.ctaBg,
              color: C.ctaText,
              border: 'none',
              borderRadius: 4,
              fontFamily: isCyber ? DISPLAY : 'inherit',
              fontWeight: 900,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: isCyber ? '0.08em' : '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = C.ctaHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Zap size={14} />
            {isCyber ? 'START_SESSION ⚡' : 'Start Session ⚡'}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 42,
              padding: '0 20px',
              background: 'none',
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              fontFamily: isCyber ? MONO : 'inherit',
              fontSize: 13,
              color: C.muted,
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = isCyber ? '#6B7280' : '#94A3B8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
