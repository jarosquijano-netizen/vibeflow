'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Kanban, BookMarked, Zap, ChevronDown } from 'lucide-react';
import ThemeSwitcher from '@/components/layout/ThemeSwitcher';

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
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
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
            color: '#0F172A',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          onClick={onClose}
        >
          <Icon size={14} style={{ color: '#475569', flexShrink: 0 }} />
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

  function openCommandPalette() {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  }

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

        {/* Theme switcher */}
        <ThemeSwitcher />

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
