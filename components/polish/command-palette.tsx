'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Kanban, BookMarked, Zap, Settings, CalendarRange, BarChart2 } from 'lucide-react';
import { sampleFeatures, samplePrompts, sampleVibeSessions } from '@/lib/sample-data';
import { useTheme } from '@/components/providers/ThemeProvider';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Types                                                                */
/* ------------------------------------------------------------------ */
type ResultItem =
  | { kind: 'feature'; id: string; title: string; status: string }
  | { kind: 'prompt';  id: string; title: string; tool: string }
  | { kind: 'session'; id: string; title: string; date: string }
  | { kind: 'action';  id: string; label: string; icon: React.ReactNode; shortcut: string | null };

/* ------------------------------------------------------------------ */
/*  Config                                                               */
/* ------------------------------------------------------------------ */
const STATUS_COLOR: Record<string, string> = {
  IDEA: '#94A3B8', SCOPING: '#7C3AED', PROTOTYPING: '#2563EB',
  BUILDING: '#D97706', DONE: '#16A34A', PARKED: '#DC2626',
};

const CYBER_STATUS_COLOR: Record<string, string> = {
  IDEA: '#6B7280', SCOPING: '#BF00FF', PROTOTYPING: '#00D4FF',
  BUILDING: '#FFB800', DONE: '#00FF88', PARKED: '#FF4444',
};

const ACTIONS: ResultItem[] = [
  { kind: 'action', id: 'new-feature',  label: 'New Feature',   icon: <Kanban size={14} />,       shortcut: '⌘N' },
  { kind: 'action', id: 'new-prompt',   label: 'New Prompt',    icon: <BookMarked size={14} />,   shortcut: '⌘P' },
  { kind: 'action', id: 'new-session',  label: 'New Session',   icon: <Zap size={14} />,          shortcut: '⌘S' },
  { kind: 'action', id: 'go-roadmap',   label: 'Go to Roadmap', icon: <CalendarRange size={14} />, shortcut: null },
  { kind: 'action', id: 'go-reports',   label: 'Go to Reports', icon: <BarChart2 size={14} />,    shortcut: null },
];

/* ------------------------------------------------------------------ */
/*  CommandPalette                                                       */
/* ------------------------------------------------------------------ */
export default function CommandPalette() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Open/close handlers */
  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const onEvent = () => openPalette();
    window.addEventListener('open-command-palette', onEvent);
    return () => window.removeEventListener('open-command-palette', onEvent);
  }, [openPalette]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  /* Build filtered results */
  const q = query.toLowerCase();

  const featureResults: ResultItem[] = q
    ? sampleFeatures
        .filter((f) => f.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((f) => ({ kind: 'feature', id: f.id, title: f.title, status: f.status }))
    : [];

  const promptResults: ResultItem[] = q
    ? samplePrompts
        .filter((p) => p.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((p) => ({ kind: 'prompt', id: p.id, title: p.title, tool: p.tool }))
    : [];

  const sessionResults: ResultItem[] = q
    ? sampleVibeSessions
        .filter((s) => s.title.toLowerCase().includes(q))
        .slice(0, 5)
        .map((s) => ({ kind: 'session', id: s.id, title: s.title, date: s.date }))
    : [];

  const actionResults: ResultItem[] = !q ? ACTIONS : [];

  /* Flat list for keyboard nav */
  const allResults: ResultItem[] = [
    ...featureResults,
    ...promptResults,
    ...sessionResults,
    ...actionResults,
  ];

  const noResults = q && allResults.length === 0;

  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closePalette(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(allResults.length, 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + Math.max(allResults.length, 1)) % Math.max(allResults.length, 1));
      }
      if (e.key === 'Enter' && allResults[selectedIndex]) {
        const item = allResults[selectedIndex];
        console.log('command palette select', item);
        closePalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selectedIndex, allResults, closePalette]);

  if (!open) return null;

  /* ── Render helpers ── */
  let globalIdx = 0;

  function ResultRow({
    item,
    idx,
    left,
    right,
  }: {
    item: ResultItem;
    idx: number;
    left: React.ReactNode;
    right: React.ReactNode;
  }) {
    const isSelected = idx === selectedIndex;

    if (isCyber) {
      return (
        <div
          onClick={() => { console.log('command palette select', item); closePalette(); }}
          onMouseEnter={() => setSelectedIndex(idx)}
          style={{
            height: 36,
            paddingLeft: isSelected ? 14 : 16,
            paddingRight: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            background: isSelected ? '#001A10' : 'transparent',
            borderLeft: isSelected ? '2px solid #00FF88' : '2px solid transparent',
            transition: 'background 80ms ease',
          }}
        >
          {left}
          {right}
        </div>
      );
    }

    return (
      <div
        onClick={() => { console.log('command palette select', item); closePalette(); }}
        onMouseEnter={() => setSelectedIndex(idx)}
        style={{
          height: 36,
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          background: isSelected ? '#EFF6FF' : 'transparent',
          transition: 'background 80ms ease',
        }}
      >
        {left}
        {right}
      </div>
    );
  }

  function GroupHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    if (isCyber) {
      return (
        <div
          style={{
            height: 28,
            paddingLeft: 16,
            paddingRight: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#0D0D17',
            borderBottom: '1px solid #1A1A2A',
            borderTop: '1px solid #1A1A2A',
          }}
        >
          <span style={{ color: '#2A2A3E', display: 'flex' }}>{icon}</span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              fontWeight: 700,
              color: '#2A2A3E',
              letterSpacing: '0.06em',
            }}
          >
            // {label.toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <div
        style={{
          height: 28,
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <span style={{ color: '#94A3B8', display: 'flex' }}>{icon}</span>
        <span
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={closePalette}
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
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 560,
            background: '#0D0D17',
            border: '1px solid #2A2A3E',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,136,0.05)',
            zIndex: 101,
            borderRadius: 0,
          }}
        >
          {/* Search input */}
          <div
            style={{
              height: 48,
              paddingLeft: 16,
              paddingRight: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #2A2A3E',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 16, color: '#00FF88', flexShrink: 0, fontWeight: 700 }}>
              &gt;
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="search features, prompts, sessions..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                fontFamily: MONO,
                color: '#F8F8F2',
                background: 'transparent',
              }}
            />
            <kbd
              style={{
                background: '#0E0E13',
                border: '1px solid #2A2A3E',
                color: '#2A2A3E',
                fontSize: 10,
                fontFamily: MONO,
                padding: '2px 8px',
                flexShrink: 0,
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {noResults && (
              <div
                style={{
                  textAlign: 'center',
                  paddingTop: 32,
                  paddingBottom: 32,
                  fontFamily: MONO,
                  fontSize: 12,
                  color: '#2A2A3E',
                }}
              >
                // NO_RESULTS_FOR &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Features */}
            {featureResults.length > 0 && (
              <>
                <GroupHeader icon={<Kanban size={12} />} label="Features" />
                {featureResults.map((item) => {
                  const idx = globalIdx++;
                  if (item.kind !== 'feature') return null;
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      left={
                        <>
                          <Kanban size={14} style={{ color: '#2A2A3E', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: MONO }}>
                            {item.title}
                          </span>
                        </>
                      }
                      right={
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: '#2A2A3E', background: '#0E0E13', border: '1px solid #1A1A2A', padding: '1px 6px', fontFamily: MONO }}>FEATURE</span>
                          <span style={{ fontSize: 10, color: CYBER_STATUS_COLOR[item.status] ?? '#2A2A3E', background: '#0E0E13', border: '1px solid #1A1A2A', padding: '1px 6px', fontFamily: MONO }}>{item.status}</span>
                        </div>
                      }
                    />
                  );
                })}
              </>
            )}

            {/* Prompts */}
            {promptResults.length > 0 && (
              <>
                <GroupHeader icon={<BookMarked size={12} />} label="Prompts" />
                {promptResults.map((item) => {
                  const idx = globalIdx++;
                  if (item.kind !== 'prompt') return null;
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      left={
                        <>
                          <BookMarked size={14} style={{ color: '#2A2A3E', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: MONO }}>
                            {item.title}
                          </span>
                        </>
                      }
                      right={
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: '#2A2A3E', background: '#0E0E13', border: '1px solid #1A1A2A', padding: '1px 6px', fontFamily: MONO }}>PROMPT</span>
                          <span style={{ fontSize: 10, color: '#4B5563', background: '#0E0E13', border: '1px solid #1A1A2A', padding: '1px 6px', fontFamily: MONO }}>{item.tool}</span>
                        </div>
                      }
                    />
                  );
                })}
              </>
            )}

            {/* Sessions */}
            {sessionResults.length > 0 && (
              <>
                <GroupHeader icon={<Zap size={12} />} label="Sessions" />
                {sessionResults.map((item) => {
                  const idx = globalIdx++;
                  if (item.kind !== 'session') return null;
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      left={
                        <>
                          <Zap size={14} style={{ color: '#2A2A3E', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: MONO }}>
                            {item.title}
                          </span>
                        </>
                      }
                      right={
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, color: '#2A2A3E', background: '#0E0E13', border: '1px solid #1A1A2A', padding: '1px 6px', fontFamily: MONO }}>SESSION</span>
                          <span style={{ fontSize: 11, color: '#4B5563', fontFamily: MONO }}>{item.date}</span>
                        </div>
                      }
                    />
                  );
                })}
              </>
            )}

            {/* Actions */}
            {actionResults.length > 0 && (
              <>
                <GroupHeader icon={<Settings size={12} />} label="Actions" />
                {actionResults.map((item) => {
                  const idx = globalIdx++;
                  if (item.kind !== 'action') return null;
                  return (
                    <ResultRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      left={
                        <>
                          <span style={{ color: '#2A2A3E', display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                          <span style={{ flex: 1, fontSize: 12, color: '#9CA3AF', fontFamily: MONO }}>
                            {item.label}
                          </span>
                        </>
                      }
                      right={
                        item.shortcut ? (
                          <kbd style={{ background: '#0E0E13', border: '1px solid #2A2A3E', fontSize: 10, fontFamily: MONO, padding: '1px 6px', flexShrink: 0, color: '#4B5563' }}>
                            {item.shortcut}
                          </kbd>
                        ) : null
                      }
                    />
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #1A1A2A',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              background: '#0A0A0F',
            }}
          >
            {[
              { key: '↑↓', desc: 'navigate' },
              { key: '↵', desc: 'select' },
              { key: 'esc', desc: 'close' },
            ].map(({ key, desc }) => (
              <span
                key={key}
                style={{
                  fontSize: 10,
                  color: '#2A2A3E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: MONO,
                }}
              >
                <kbd
                  style={{
                    background: '#0E0E13',
                    border: '1px solid #2A2A3E',
                    padding: '1px 4px',
                    fontSize: 10,
                    fontFamily: MONO,
                    borderRadius: 0,
                    color: '#4B5563',
                  }}
                >
                  {key}
                </kbd>
                <span>{desc}</span>
              </span>
            ))}
          </div>
        </div>

        <style>{`
          input::placeholder { color: #2A2A3E; }
        `}</style>
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
        onClick={closePalette}
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
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 560,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 101,
          borderRadius: 0,
        }}
      >
        {/* Search input */}
        <div
          style={{
            height: 48,
            paddingLeft: 16,
            paddingRight: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Search size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Search features, prompts, sessions..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontFamily: 'var(--font-dm-sans)',
              color: '#0F172A',
              background: 'transparent',
            }}
          />
          <kbd
            style={{
              background: '#F1F5F9',
              color: '#94A3B8',
              fontSize: 10,
              fontFamily: 'monospace',
              padding: '2px 8px',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {noResults && (
            <div
              style={{
                textAlign: 'center',
                paddingTop: 32,
                paddingBottom: 32,
                fontSize: 13,
                color: '#94A3B8',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Features */}
          {featureResults.length > 0 && (
            <>
              <GroupHeader icon={<Kanban size={12} />} label="Features" />
              {featureResults.map((item) => {
                const idx = globalIdx++;
                if (item.kind !== 'feature') return null;
                return (
                  <ResultRow
                    key={item.id}
                    item={item}
                    idx={idx}
                    left={
                      <>
                        <Kanban size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-dm-sans)' }}>
                          {item.title}
                        </span>
                      </>
                    }
                    right={
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>Feature</span>
                        <span style={{ fontSize: 10, color: STATUS_COLOR[item.status] ?? '#94A3B8', background: '#F8FAFC', padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>{item.status}</span>
                      </div>
                    }
                  />
                );
              })}
            </>
          )}

          {/* Prompts */}
          {promptResults.length > 0 && (
            <>
              <GroupHeader icon={<BookMarked size={12} />} label="Prompts" />
              {promptResults.map((item) => {
                const idx = globalIdx++;
                if (item.kind !== 'prompt') return null;
                return (
                  <ResultRow
                    key={item.id}
                    item={item}
                    idx={idx}
                    left={
                      <>
                        <BookMarked size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-dm-sans)' }}>
                          {item.title}
                        </span>
                      </>
                    }
                    right={
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>Prompt</span>
                        <span style={{ fontSize: 10, color: '#64748B', background: '#F1F5F9', padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>{item.tool}</span>
                      </div>
                    }
                  />
                );
              })}
            </>
          )}

          {/* Sessions */}
          {sessionResults.length > 0 && (
            <>
              <GroupHeader icon={<Zap size={12} />} label="Sessions" />
              {sessionResults.map((item) => {
                const idx = globalIdx++;
                if (item.kind !== 'session') return null;
                return (
                  <ResultRow
                    key={item.id}
                    item={item}
                    idx={idx}
                    left={
                      <>
                        <Zap size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-dm-sans)' }}>
                          {item.title}
                        </span>
                      </>
                    }
                    right={
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: '#94A3B8', background: '#F1F5F9', padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>Session</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>{item.date}</span>
                      </div>
                    }
                  />
                );
              })}
            </>
          )}

          {/* Actions */}
          {actionResults.length > 0 && (
            <>
              <GroupHeader icon={<Settings size={12} />} label="Actions" />
              {actionResults.map((item) => {
                const idx = globalIdx++;
                if (item.kind !== 'action') return null;
                return (
                  <ResultRow
                    key={item.id}
                    item={item}
                    idx={idx}
                    left={
                      <>
                        <span style={{ color: '#94A3B8', display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, color: '#0F172A', fontFamily: 'var(--font-dm-sans)' }}>
                          {item.label}
                        </span>
                      </>
                    }
                    right={
                      item.shortcut ? (
                        <kbd style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: 10, fontFamily: 'monospace', padding: '1px 6px', flexShrink: 0 }}>
                          {item.shortcut}
                        </kbd>
                      ) : null
                    }
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #F1F5F9',
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 8,
            paddingBottom: 8,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {[
            { key: '↑↓', desc: 'navigate' },
            { key: '↵', desc: 'select' },
            { key: 'esc', desc: 'close' },
          ].map(({ key, desc }) => (
            <span
              key={key}
              style={{
                fontSize: 10,
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'monospace',
              }}
            >
              <kbd
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  padding: '1px 4px',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  borderRadius: 0,
                }}
              >
                {key}
              </kbd>
              <span style={{ fontFamily: 'var(--font-dm-sans)' }}>{desc}</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
