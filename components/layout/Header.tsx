'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Kanban, BookMarked, Zap, ChevronDown } from 'lucide-react';
import ThemeSwitcher from '@/components/layout/ThemeSwitcher';
import { useTheme } from '@/components/providers/ThemeProvider';

interface HeaderProps {
  title: string;
  breadcrumb: string;
}

/* ------------------------------------------------------------------ */
/*  + New dropdown                                                      */
/* ------------------------------------------------------------------ */
const NEW_ITEMS = [
  { label: 'New Feature', icon: Kanban },
  { label: 'New Prompt', icon: BookMarked },
  { label: 'New Session', icon: Zap },
] as const;

function NewDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        minWidth: 160,
        zIndex: 50,
      }}
    >
      {NEW_ITEMS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          onClick={onClose}
        >
          <Icon size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                              */
/* ------------------------------------------------------------------ */
const NOTIFY_COUNT = 0;

export default function Header({ title, breadcrumb }: HeaderProps) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const { theme } = useTheme();

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /*  CYBER HEADER                                                   */
  /* ═══════════════════════════════════════════════════════════════ */
  if (theme === 'cyber') {
    return (
      <header
        style={{
          height: 52,
          background: '#12121E',
          borderBottom: '1px solid #3B4B3D',
          paddingLeft: 24,
          paddingRight: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexShrink: 0,
        }}
      >
        {/* ── Left: Title + Breadcrumb ── */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: '#F0FFF4',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <span style={{ color: '#6B7280', fontSize: 14 }}>|</span>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {breadcrumb}
          </div>
        </div>

        {/* ── Center: Terminal search ── */}
        <button
          onClick={openCommandPalette}
          style={{
            width: 320,
            height: 32,
            background: '#222230',
            border: 'none',
            borderBottom: '2px solid #3B4B3D',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 28,
            paddingRight: 8,
            gap: 8,
            cursor: 'text',
            flexShrink: 0,
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderBottomColor = '#00FF88';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderBottomColor = '#3B4B3D';
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: '#00FF88',
              userSelect: 'none',
            }}
          >
            &gt;
          </span>
          <span
            style={{
              flex: 1,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: '#6B7280',
              textAlign: 'left',
            }}
          >
            search_features...
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#6B7280',
              flexShrink: 0,
            }}
          >
            ⌘K
          </span>
        </button>

        {/* ── Right zone ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Q2 chip */}
          <button
            style={{
              height: 32,
              paddingLeft: 12,
              paddingRight: 12,
              background: '#222230',
              border: '1px solid #3B4B3D',
              color: '#B9CBB9',
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00FF88';
              e.currentTarget.style.color = '#00FF88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#3B4B3D';
              e.currentTarget.style.color = '#B9CBB9';
            }}
          >
            Q2 2026
            <ChevronDown size={12} style={{ color: '#6B7280' }} />
          </button>

          {/* Bell */}
          <button
            style={{
              width: 32,
              height: 32,
              background: 'none',
              border: '1px solid #3B4B3D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00FF88';
              e.currentTarget.style.color = '#00FF88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#3B4B3D';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <Bell size={16} />
          </button>

          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* + New button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNewMenu((v) => !v)}
              style={{
                height: 32,
                paddingLeft: 12,
                paddingRight: 12,
                background: '#00FF88',
                border: 'none',
                color: '#0A0A0F',
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 0 12px rgba(0,255,136,0.3)',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#00CC6A';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#00FF88';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,136,0.3)';
              }}
            >
              <Plus size={14} />
              New
            </button>
            {showNewMenu && <NewDropdown onClose={() => setShowNewMenu(false)} />}
          </div>
        </div>
      </header>
    );
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /*  DEFAULT HEADER                                                 */
  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <header
      style={{
        height: 52,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        paddingLeft: 24,
        paddingRight: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* ── Left: Title + Breadcrumb ── */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#0F172A',
            fontFamily: 'var(--font-dm-sans)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>{breadcrumb}</div>
      </div>

      {/* ── Center: Search ── */}
      <button
        onClick={openCommandPalette}
        style={{
          width: 320,
          height: 32,
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 8,
          gap: 8,
          cursor: 'text',
          flexShrink: 0,
        }}
      >
        <Search size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, color: '#94A3B8', textAlign: 'left' }}>
          Search features, prompts…
        </span>
        <span
          style={{
            background: '#E2E8F0',
            color: '#94A3B8',
            fontSize: 10,
            fontFamily: 'var(--font-jetbrains-mono)',
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 2,
            paddingBottom: 2,
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          ⌘K
        </span>
      </button>

      {/* ── Right zone ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Quarter button */}
        <button
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
            fontSize: 13,
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderRadius: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
        >
          Q2 2026
          <ChevronDown size={12} style={{ color: '#94A3B8' }} />
        </button>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 32,
              height: 32,
              background: 'none',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              borderRadius: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <Bell size={16} />
          </button>
          {NOTIFY_COUNT > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#DC2626',
                border: '1.5px solid #FFFFFF',
              }}
            />
          )}
        </div>

        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* + New button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNewMenu((v) => !v)}
            style={{
              height: 32,
              paddingLeft: 12,
              paddingRight: 12,
              background: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 13,
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderRadius: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
          >
            <Plus size={14} />
            New
          </button>
          {showNewMenu && <NewDropdown onClose={() => setShowNewMenu(false)} />}
        </div>
      </div>
    </header>
  );
}
