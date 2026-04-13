'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Idea } from '@/lib/idea-data';
import type { Feature } from '@/types';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

const TEAM_MEMBERS = ['Jordan Davies', 'Sara Kim', 'Marcus Bell', 'Alex Chen', 'Priya Patel'];
const QUARTER_OPTIONS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'];
const SIZE_OPTIONS: (Feature['size'] | '')[] = ['', 'XS', 'S', 'M', 'L', 'XL'];

interface PromoteFormData {
  id: string;
  quarter: string;
  owner: string;
  size: Feature['size'];
}

interface Props {
  idea: Idea | null;
  onConfirm: (idea: Idea, data: PromoteFormData) => void;
  onClose: () => void;
}

export default function PromoteModal({ idea, onConfirm, onClose }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [quarter, setQuarter] = useState('Q2 2026');
  const [owner, setOwner] = useState('Jordan Davies');
  const [size, setSize] = useState<Feature['size']>(null);

  if (!idea) return null;

  const inputStyle: React.CSSProperties = {
    background: isCyber ? '#0A0A0F' : '#F8FAFC',
    border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
    borderRadius: 4,
    fontFamily: isCyber ? MONO : 'inherit',
    fontSize: 13,
    color: isCyber ? '#F0FFF4' : '#0F172A',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
  };

  const focusBorder = isCyber ? '#00FF88' : '#2563EB';

  function handleConfirm() {
    if (!idea) return;
    onConfirm(idea, {
      id: `f-${Date.now()}`,
      quarter,
      owner,
      size,
    });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          background: isCyber ? '#1A1A28' : '#FFFFFF',
          border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
          borderRadius: 8,
          padding: 32,
          boxShadow: isCyber
            ? '0 0 60px rgba(0,255,136,0.1)'
            : '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          {isCyber ? (
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 18,
                fontWeight: 900,
                color: '#00FF88',
              }}
            >
              // PROMOTE_TO_BOARD
            </div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
              Promote to Feature Board
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isCyber ? '#4B5563' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = isCyber ? '#4B5563' : '#94A3B8'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <div
          style={{
            fontFamily: isCyber ? MONO : 'inherit',
            fontSize: isCyber ? 12 : 13,
            color: isCyber ? '#6B7280' : '#64748B',
            marginBottom: 20,
          }}
        >
          This idea will appear on the Feature Board in the IDEA column.
        </div>

        {/* Idea summary card */}
        <div
          style={{
            background: isCyber ? '#111118' : '#F8FAFC',
            border: `1px solid ${isCyber ? '#2A2A3E' : '#E2E8F0'}`,
            borderRadius: 6,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: isCyber ? DISPLAY : 'inherit',
              fontSize: 14,
              fontWeight: 700,
              color: isCyber ? '#F0FFF4' : '#0F172A',
              marginBottom: 6,
            }}
          >
            {idea.title}
          </div>
          {idea.problemStatement && (
            <div
              style={{
                fontSize: 12,
                color: isCyber ? '#4B5563' : '#64748B',
                marginBottom: 8,
                fontStyle: 'italic',
              }}
            >
              {idea.problemStatement}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {idea.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10,
                  background: isCyber ? '#0A0A0F' : '#E2E8F0',
                  color: isCyber ? '#4B5563' : '#475569',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {tag}
              </span>
            ))}
            <span style={{ fontSize: 11, color: isCyber ? '#4B5563' : '#94A3B8' }}>
              ▲ {idea.votes} votes
            </span>
          </div>
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: isCyber ? '#4B5563' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Quarter
            </label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = isCyber ? '#3B4B3D' : '#E2E8F0'; }}
            >
              {QUARTER_OPTIONS.map((q) => (
                <option key={q} value={q} style={{ background: isCyber ? '#0A0A0F' : '#FFF' }}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: isCyber ? '#4B5563' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Initial Owner
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = isCyber ? '#3B4B3D' : '#E2E8F0'; }}
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m} style={{ background: isCyber ? '#0A0A0F' : '#FFF' }}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: isCyber ? '#4B5563' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              T-Shirt Estimate{' '}
              <span style={{ color: isCyber ? '#3B4B3D' : '#CBD5E1', fontWeight: 400 }}>(optional)</span>
            </label>
            <select
              value={size ?? ''}
              onChange={(e) => setSize((e.target.value as Feature['size']) || null)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = focusBorder; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = isCyber ? '#3B4B3D' : '#E2E8F0'; }}
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s ?? 'none'} value={s ?? ''} style={{ background: isCyber ? '#0A0A0F' : '#FFF' }}>
                  {s || 'TBD — AI will suggest'}
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
              background: isCyber ? '#00FF88' : '#2563EB',
              color: isCyber ? '#000000' : '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontFamily: isCyber ? DISPLAY : 'inherit',
              fontWeight: 900,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: isCyber ? '0.1em' : '0.05em',
              cursor: 'pointer',
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isCyber
                ? '0 0 20px rgba(0,255,136,0.4)'
                : '0 4px 12px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {isCyber ? 'PROMOTE_TO_BOARD' : '⚡ Promote to Feature Board'}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 42,
              padding: '0 20px',
              background: 'none',
              border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
              borderRadius: 4,
              fontFamily: isCyber ? MONO : 'inherit',
              fontSize: 13,
              color: isCyber ? '#4B5563' : '#64748B',
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = isCyber ? '#6B7280' : '#94A3B8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = isCyber ? '#3B4B3D' : '#E2E8F0'; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
