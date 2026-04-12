'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Shortcuts data                                                       */
/* ------------------------------------------------------------------ */
const SHORTCUTS = [
  { combo: ['⌘', 'K'], desc: 'Global search' },
  { combo: ['⌘', 'N'], desc: 'New feature' },
  { combo: ['⌘', 'P'], desc: 'New prompt' },
  { combo: ['⌘', 'S'], desc: 'New session' },
  { combo: ['Esc'],     desc: 'Close panel' },
  { combo: ['?'],       desc: 'Show shortcuts' },
  { combo: ['↑', '↓'], desc: 'Navigate results' },
  { combo: ['↵'],       desc: 'Select result' },
];

/* ------------------------------------------------------------------ */
/*  KeyboardShortcuts                                                    */
/* ------------------------------------------------------------------ */
export default function KeyboardShortcuts() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.addEventListener('open-keyboard-shortcuts', openModal);
    return () => window.removeEventListener('open-keyboard-shortcuts', openModal);
  }, [openModal]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeModal]);

  if (!open) return null;

  const left = SHORTCUTS.slice(0, 4);
  const right = SHORTCUTS.slice(4);

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
          }}
        />

        {/* Panel */}
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 480,
            background: '#0D0D17',
            border: '1px solid #2A2A3E',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.03)',
            zIndex: 101,
            borderRadius: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderBottom: '1px solid #1A1A2A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                color: '#00FF88',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              // KEYBOARD_SHORTCUTS
            </span>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                color: '#2A2A3E',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#00FF88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#2A2A3E'; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 24, background: '#0A0A0F' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, rowGap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {left.map(({ combo, desc }) => (
                  <ShortcutRow key={desc} combo={combo} desc={desc} isCyber />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {right.map(({ combo, desc }) => (
                  <ShortcutRow key={desc} combo={combo} desc={desc} isCyber />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ================================================================ */
  /*  DEFAULT RENDER                                                   */
  /* ================================================================ */
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeModal}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 101,
          borderRadius: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-dm-sans)' }}>
            Keyboard Shortcuts
          </span>
          <button
            onClick={closeModal}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: '#94A3B8',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, rowGap: 12 }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {left.map(({ combo, desc }) => (
                <ShortcutRow key={desc} combo={combo} desc={desc} isCyber={false} />
              ))}
            </div>
            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {right.map(({ combo, desc }) => (
                <ShortcutRow key={desc} combo={combo} desc={desc} isCyber={false} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ShortcutRow({ combo, desc, isCyber }: { combo: string[]; desc: string; isCyber: boolean }) {
  if (isCyber) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {combo.map((key, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {i > 0 && combo.length > 1 && (
                <span style={{ fontFamily: MONO, fontSize: 10, color: '#2A2A3E', margin: '0 1px' }}>+</span>
              )}
              <kbd
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  background: '#0E0E13',
                  border: '1px solid #2A2A3E',
                  padding: '2px 8px',
                  borderRadius: 0,
                  color: '#4B5563',
                }}
              >
                {key}
              </kbd>
            </span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#4B5563', fontFamily: MONO }}>{desc}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {combo.map((key, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && combo.length > 1 && <span style={{ fontSize: 10, color: '#94A3B8', margin: '0 1px' }}>+</span>}
            <kbd
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '2px 8px',
                borderRadius: 0,
                color: '#475569',
              }}
            >
              {key}
            </kbd>
          </span>
        ))}
      </div>
      <span style={{ fontSize: 13, color: '#475569', fontFamily: 'var(--font-dm-sans)' }}>{desc}</span>
    </div>
  );
}
