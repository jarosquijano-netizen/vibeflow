'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

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
                <ShortcutRow key={desc} combo={combo} desc={desc} />
              ))}
            </div>
            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {right.map(({ combo, desc }) => (
                <ShortcutRow key={desc} combo={combo} desc={desc} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ShortcutRow({ combo, desc }: { combo: string[]; desc: string }) {
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
