'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Kanban,
  List,
  BookMarked,
  Zap,
  CalendarRange,
  BarChart2,
  RefreshCw,
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Nav config                                                          */
/* ------------------------------------------------------------------ */
const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { label: 'Feature Board', href: '/dashboard/features', icon: Kanban },
      { label: 'Backlog', href: '/dashboard/backlog', icon: List },
      { label: 'Prompt Library', href: '/dashboard/prompts', icon: BookMarked },
      { label: 'Vibe Sessions', href: '/dashboard/sessions', icon: Zap },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Roadmap', href: '/dashboard/roadmap', icon: CalendarRange },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart2 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Sync Monitor', href: '/dashboard/sync', icon: RefreshCw, errorDot: true },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings2 },
    ],
  },
] as const;

/* Fake error count — wire up to real state later */
const SYNC_ERROR_COUNT = 0;

/* ------------------------------------------------------------------ */
/*  Single nav item                                                     */
/* ------------------------------------------------------------------ */
function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  showErrorDot,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  isActive: boolean;
  collapsed: boolean;
  showErrorDot?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = isActive
    ? 'rgba(37,99,235,0.08)'
    : hovered
    ? 'rgba(255,255,255,0.05)'
    : 'transparent';

  const color = isActive || hovered ? '#FFFFFF' : '#94A3B8';
  const iconColor = isActive ? '#2563EB' : '#475569';

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 8,
        height: 34,
        paddingLeft: collapsed ? 0 : 12,
        paddingRight: collapsed ? 0 : 12,
        fontSize: 13,
        color,
        background: bg,
        borderLeft: isActive ? '2px solid #2563EB' : '2px solid transparent',
        textDecoration: 'none',
        transition: 'all 100ms ease',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <span style={{ position: 'relative', flexShrink: 0 }}>
        <Icon size={16} style={{ color: iconColor, display: 'block' }} />
        {showErrorDot && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#DC2626',
              border: '1.5px solid #0D1B2A',
            }}
          />
        )}
      </span>
      {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = 'vibeflow-sidebar-collapsed';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userHovered, setUserHovered] = useState(false);
  const pathname = usePathname();

  /* Hydrate from localStorage after mount to avoid SSR mismatch */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  /* Render at expanded width before mount to avoid layout shift */
  const width = mounted ? (collapsed ? 56 : 220) : 220;

  return (
    <aside
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        height: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 200ms ease, min-width 200ms ease, max-width 200ms ease',
        flexShrink: 0,
      }}
    >
      {/* ── Wordmark ── */}
      <div
        style={{
          padding: 16,
          paddingBottom: 8,
          flexShrink: 0,
          minHeight: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {!collapsed ? (
          <>
            <div style={{ fontSize: 18, lineHeight: 1.2 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Vibe</span>
              <span style={{ color: '#2563EB', fontWeight: 400 }}>Flow</span>
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>v0.1</div>
          </>
        ) : (
          /* Keep consistent height when collapsed */
          <div style={{ width: 24, height: 24 }} />
        )}
      </div>

      {/* ── Nav groups ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 8 }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#475569',
                  paddingLeft: 12,
                  paddingRight: 12,
                  marginBottom: 4,
                  marginTop: 16,
                }}
              >
                {group.label}
              </div>
            )}
            {(group.items as ReadonlyArray<{
              label: string;
              href: string;
              icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
              errorDot?: boolean;
            }>).map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                collapsed={collapsed}
                showErrorDot={item.errorDot && SYNC_ERROR_COUNT > 0}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ flexShrink: 0 }}>
        {/* Separator */}
        <div style={{ height: 1, background: '#1B3A6B', margin: '0 0' }} />

        {/* User row */}
        <div
          style={{
            height: 48,
            paddingLeft: 12,
            paddingRight: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'default',
            position: 'relative',
          }}
          onMouseEnter={() => setUserHovered(true)}
          onMouseLeave={() => setUserHovered(false)}
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            JD
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Jordan Davies
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Senior PM</div>
              </div>
              {userHovered && (
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#94A3B8',
                    flexShrink: 0,
                  }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          style={{
            width: '100%',
            height: 32,
            background: 'none',
            border: 'none',
            borderTop: '1px solid #1B3A6B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: '#475569',
            fontSize: 11,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
