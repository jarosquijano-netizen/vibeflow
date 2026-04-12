'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import type { BacklogItem } from '@/types';

const MONO = "'JetBrains Mono', monospace";

export const BACKLOG_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'Todo',        color: '#94A3B8', bg: '#F8FAFC' },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF' },
  DONE:        { label: 'Done',        color: '#16A34A', bg: '#F0FDF4' },
};

const CYBER_BACKLOG_STATUS: Record<string, {
  label: string; color: string; bg: string; border: string; shadow?: string;
}> = {
  TODO: {
    label: 'TODO',
    color: '#9CA3AF',
    bg: 'rgba(107,114,128,0.15)',
    border: 'rgba(107,114,128,0.4)',
  },
  IN_PROGRESS: {
    label: 'IN PROG',
    color: '#00D4FF',
    bg: 'rgba(0,212,255,0.1)',
    border: 'rgba(0,212,255,0.4)',
  },
  DONE: {
    label: 'DONE',
    color: '#00FF88',
    bg: 'rgba(0,255,136,0.1)',
    border: 'rgba(0,255,136,0.4)',
    shadow: '0 0 8px rgba(0,255,136,0.15)',
  },
};

const STATUS_CYCLE: BacklogItem['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface BacklogItemRowProps {
  item: BacklogItem;
  onChange: (updated: BacklogItem) => void;
  readOnly?: boolean;
  isCyber?: boolean;
}

function CyberStatusBadge({
  status,
  onClick,
}: {
  status: BacklogItem['status'];
  onClick?: () => void;
}) {
  const cfg = CYBER_BACKLOG_STATUS[status] ?? CYBER_BACKLOG_STATUS.TODO;
  return (
    <span
      onClick={onClick}
      title={onClick ? 'Click to change status' : undefined}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        boxShadow: cfg.shadow,
        fontFamily: MONO,
        fontSize: 10,
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

export default function BacklogItemRow({
  item,
  onChange,
  readOnly = false,
  isCyber = false,
}: BacklogItemRowProps) {
  const [hovered, setHovered] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const cfg = BACKLOG_STATUS_CONFIG[item.status] ?? BACKLOG_STATUS_CONFIG.TODO;

  useEffect(() => {
    if (editingTitle) inputRef.current?.focus();
  }, [editingTitle]);

  function commitTitle() {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== item.title) {
      onChange({ ...item, title: trimmed });
    } else {
      setTitleDraft(item.title);
    }
  }

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onChange({ ...item, status: next });
  }

  /* ── Cyber render (div-based flex rows) ── */
  if (isCyber) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #1A1A28',
          background: hovered ? '#16161E' : 'transparent',
          transition: 'background 100ms ease',
        }}
      >
        {/* Task cell — flex 1 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8, minWidth: 0 }}>
          {editingTitle && !readOnly ? (
            <input
              ref={inputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') { setTitleDraft(item.title); setEditingTitle(false); }
              }}
              style={{
                flex: 1,
                width: '100%',
                background: '#111118',
                border: 'none',
                borderBottom: '1px solid #00FF88',
                outline: 'none',
                fontFamily: MONO,
                fontSize: 13,
                color: '#F0FFF4',
                padding: '2px 0',
              }}
            />
          ) : (
            <span
              onClick={() => { if (!readOnly) setEditingTitle(true); }}
              style={{
                flex: 1,
                fontFamily: MONO,
                fontSize: 13,
                color: '#B9CBB9',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: readOnly ? 'default' : 'text',
                textDecoration: item.status === 'DONE' ? 'line-through' : 'none',
                opacity: item.status === 'DONE' ? 0.5 : 1,
              }}
            >
              {item.title}
            </span>
          )}
        </div>

        {/* Status cell — w-28 */}
        <div style={{ width: 112, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <CyberStatusBadge
            status={item.status}
            onClick={readOnly ? undefined : cycleStatus}
          />
        </div>

        {/* Jira cell — w-24 */}
        <div style={{ width: 96, flexShrink: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: item.jiraId ? '#00D4FF' : '#3B4B3D',
            }}
          >
            {item.jiraId || '—'}
          </span>
        </div>

        {/* Actions cell — w-8 */}
        <div style={{ width: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hovered && !readOnly && (
            <Pencil
              size={14}
              style={{ color: '#3B4B3D', cursor: 'pointer', transition: 'color 150ms' }}
              onClick={() => setEditingTitle(true)}
            />
          )}
        </div>
      </div>
    );
  }

  /* ── Default theme render (table row) ── */
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 32,
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFC' : 'transparent',
        transition: 'background 100ms ease',
      }}
    >
      {/* TASK */}
      <td style={{ paddingRight: 8 }}>
        {editingTitle && !readOnly ? (
          <input
            ref={inputRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitleDraft(item.title);
                setEditingTitle(false);
              }
            }}
            style={{
              width: '100%',
              height: 24,
              border: '1px solid #2563EB',
              background: '#F8FAFC',
              fontSize: 13,
              paddingLeft: 4,
              outline: 'none',
              borderRadius: 0,
              fontFamily: 'var(--font-dm-sans)',
              color: '#0F172A',
            }}
          />
        ) : (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: readOnly ? 'default' : 'text' }}
            onClick={() => { if (!readOnly) setEditingTitle(true); }}
          >
            <span
              style={{
                fontSize: 13,
                color: readOnly ? '#475569' : '#0F172A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                fontFamily: 'var(--font-dm-sans)',
                textDecoration: item.status === 'DONE' ? 'line-through' : 'none',
                opacity: item.status === 'DONE' ? 0.5 : 1,
              }}
            >
              {item.title}
            </span>
            {hovered && !readOnly && (
              <Pencil size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
            )}
          </div>
        )}
      </td>

      {/* STATUS — click to cycle */}
      <td style={{ paddingRight: 8, whiteSpace: 'nowrap' }}>
        <button
          onClick={readOnly ? undefined : cycleStatus}
          title={readOnly ? undefined : 'Click to change status'}
          style={{
            background: cfg.bg,
            color: cfg.color,
            fontSize: 10,
            padding: '2px 6px',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
            border: 'none',
            cursor: readOnly ? 'default' : 'pointer',
            borderRadius: 0,
            transition: 'opacity 100ms ease',
          }}
          onMouseEnter={readOnly ? undefined : (e) => { e.currentTarget.style.opacity = '0.75'; }}
          onMouseLeave={readOnly ? undefined : (e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {cfg.label}
        </button>
      </td>

      {/* JIRA */}
      <td
        style={{
          fontSize: 11,
          color: '#94A3B8',
          fontFamily: 'var(--font-dm-sans)',
          whiteSpace: 'nowrap',
        }}
      >
        {item.jiraId || '—'}
      </td>
    </tr>
  );
}
