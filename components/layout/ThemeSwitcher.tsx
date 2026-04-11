'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { THEMES } from '@/lib/themes';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Switch theme"
        style={{
          width: 32,
          height: 32,
          background: 'none',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          borderRadius: 0,
          transition: 'color 120ms ease, background 120ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        <Palette size={16} />
      </button>

      {/* Popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 224,
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: 6,
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 12,
              paddingBottom: 8,
              fontSize: 10,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-primary)',
            }}
          >
            Theme
          </div>

          {/* Theme options */}
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  background: isActive ? 'var(--color-accent-light)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'var(--color-bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Color swatch */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: t.preview,
                    flexShrink: 0,
                    boxShadow: isActive ? `0 0 0 2px ${t.preview}` : 'none',
                  }}
                />

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-primary)',
                      lineHeight: 1.3,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 1,
                    }}
                  >
                    {t.description}
                  </div>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <Check
                    size={14}
                    style={{ color: 'var(--color-accent)', flexShrink: 0 }}
                  />
                )}
              </button>
            );
          })}

          {/* Footer */}
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              borderTop: '1px solid var(--color-border)',
              fontSize: 10,
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-primary)',
            }}
          >
            More themes coming soon
          </div>
        </div>
      )}
    </div>
  );
}
