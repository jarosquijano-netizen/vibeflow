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
  Gamepad2,
  Shield,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

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

const SYNC_ERROR_COUNT = 0;

/* ------------------------------------------------------------------ */
/*  Default NavItem                                                     */
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
/*  Cyber NavItem                                                       */
/* ------------------------------------------------------------------ */
function CyberNavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  isLive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  isActive: boolean;
  collapsed: boolean;
  isLive?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;

  return (
    <Link
      href={href}
      data-nav-active={isActive ? 'true' : undefined}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        height: 44,
        paddingLeft: collapsed ? 0 : 16,
        paddingRight: collapsed ? 0 : 16,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        color: active ? '#00FF88' : '#6B7280',
        background: active ? '#1A1A28' : 'transparent',
        borderRight: isActive ? '2px solid #00FF88' : '2px solid transparent',
        textDecoration: 'none',
        transition: 'all 100ms ease',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon
          size={16}
          style={{ color: active ? '#00FF88' : '#6B7280', display: 'block', flexShrink: 0 }}
        />
        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
      </div>
      {!collapsed && isLive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span
            className="animate-blink"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00FF88',
              boxShadow: '0 0 6px rgba(0,255,136,0.6)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#00FF88',
              letterSpacing: '0.06em',
            }}
          >
            LIVE
          </span>
        </div>
      )}
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
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
    setIsAdmin(localStorage.getItem('vibeflow-is-admin') === 'true');
    setMounted(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  const width = mounted ? (collapsed ? 56 : 220) : 220;

  /* ═══════════════════════════════════════════════════════════════ */
  /*  CYBER SIDEBAR                                                  */
  /* ═══════════════════════════════════════════════════════════════ */
  if (theme === 'cyber') {
    return (
      <aside
        style={{
          width,
          minWidth: width,
          maxWidth: width,
          height: '100vh',
          background: '#12121E',
          borderRight: '1px solid #3B4B3D',
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
            padding: collapsed ? '16px 0' : '24px 24px 16px',
            flexShrink: 0,
            minHeight: 72,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {!collapsed ? (
            <>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                <span style={{ color: '#00FF88' }}>VIBE</span>
                <span style={{ color: '#BF00FF' }}>FLOW</span>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  letterSpacing: '0.12em',
                  marginTop: 4,
                }}
              >
                v0.1 // core_system
              </div>
            </>
          ) : (
            <div style={{ width: 24, height: 24, margin: '0 auto' }} />
          )}
        </div>

        {/* ── User Card ── */}
        {!collapsed && (
          <div style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 12, flexShrink: 0 }}>
            <div
              style={{
                background: '#1A1A28',
                border: '1px solid #3B4B3D',
                borderRadius: 12,
                padding: 12,
              }}
            >
              {/* Avatar + identity */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#2A2A3E',
                      border: '2px solid #00FF88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00FF88',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    JD
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#00FF88',
                      border: '2px solid #0D0D17',
                      boxShadow: '0 0 6px rgba(0,255,136,0.6)',
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#F0FFF4',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      lineHeight: 1.2,
                      marginBottom: 4,
                    }}
                  >
                    OPERATOR
                  </div>
                  <span
                    style={{
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.2)',
                      borderRadius: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: '#00FF88',
                      padding: '2px 6px',
                    }}
                  >
                    LVL 7
                  </span>
                </div>
              </div>

              {/* XP bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    PROGRESS
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      color: '#00FF88',
                    }}
                  >
                    2,450 / 3,000 XP
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: '#35343A',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '82%',
                      background: 'linear-gradient(90deg, #00FF88, #3CD7FF)',
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 8 }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6B7280',
                    paddingLeft: 16,
                    paddingRight: 16,
                    marginBottom: 2,
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
                <CyberNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  collapsed={collapsed}
                />
              ))}
              {group.label === 'Workspace' && (
                <CyberNavItem
                  href="/dashboard/arcade"
                  label="ARCADE"
                  icon={Gamepad2}
                  isActive={pathname === '/dashboard/arcade'}
                  collapsed={collapsed}
                  isLive
                />
              )}
              {group.label === 'System' && isAdmin && (
                <Link
                  href="/dashboard/controller"
                  title={collapsed ? 'CTRL_ROOM' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    height: 44,
                    paddingLeft: collapsed ? 0 : 16,
                    paddingRight: collapsed ? 0 : 16,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: pathname === '/dashboard/controller' ? '#FF4444' : '#6B7280',
                    background: pathname === '/dashboard/controller' ? 'rgba(255,68,68,0.08)' : 'transparent',
                    borderRight: pathname === '/dashboard/controller' ? '2px solid #FF4444' : '2px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 100ms ease',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ position: 'relative', flexShrink: 0 }}>
                      <Shield
                        size={16}
                        style={{
                          color: pathname === '/dashboard/controller' ? '#FF4444' : '#6B7280',
                          display: 'block',
                        }}
                      />
                      {!collapsed && (
                        <span
                          className="animate-blink"
                          style={{
                            position: 'absolute',
                            top: -3,
                            right: -3,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#FF4444',
                            boxShadow: '0 0 6px rgba(255,68,68,0.8)',
                          }}
                        />
                      )}
                    </span>
                    {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>CTRL_ROOM</span>}
                  </div>
                  {!collapsed && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        color: '#FF4444',
                        background: 'rgba(255,68,68,0.15)',
                        border: '1px solid rgba(255,68,68,0.3)',
                        borderRadius: 4,
                        padding: '1px 5px',
                        letterSpacing: '0.06em',
                        flexShrink: 0,
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* ── Bottom ── */}
        <div style={{ flexShrink: 0 }}>
          {/* Leaderboard widget */}
          {!collapsed && (
            <div
              style={{
                margin: '0 16px 12px',
                background: '#1A1A28',
                border: '1px solid #3B4B3D',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#00FF88',
                }}
              >
                🏆 #3 THIS WEEK
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#00FF88',
                  letterSpacing: '0.04em',
                }}
              >
                ↑2
              </span>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            style={{
              width: '100%',
              height: 32,
              background: 'none',
              border: 'none',
              borderTop: '1px solid #3B4B3D',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: '#6B7280',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#00FF88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>COLLAPSE</span>
              </>
            )}
          </button>
        </div>
      </aside>
    );
  }

  /* ═══════════════════════════════════════════════════════════════ */
  /*  DEFAULT SIDEBAR                                                */
  /* ═══════════════════════════════════════════════════════════════ */
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
            {group.label === 'System' && isAdmin && (
              <NavItem
                href="/dashboard/controller"
                label="Controller Room"
                icon={Shield}
                isActive={pathname === '/dashboard/controller'}
                collapsed={collapsed}
              />
            )}
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ flexShrink: 0 }}>
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
