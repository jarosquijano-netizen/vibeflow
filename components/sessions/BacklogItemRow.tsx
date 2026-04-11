'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import type { BacklogItem } from '@/types';

export const BACKLOG_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'Todo',        color: '#94A3B8', bg: '#F8FAFC' },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF' },
  DONE:        { label: 'Done',        color: '#16A34A', bg: '#F0FDF4' },
};

const STATUS_CYCLE: BacklogItem['status'][] = ['TODO', 'IN_PROGRESS', 'DONE'];

interface BacklogItemRowProps {
  item: BacklogItem;
  onChange: (updated: BacklogItem) => void;
}

export default function BacklogItemRow({ item, onChange }: BacklogItemRowProps) {
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
      setTitleDraft(item.title); // revert if empty
    }
  }

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onChange({ ...item, status: next });
  }

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
        {editingTitle ? (
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
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'text' }}
            onClick={() => setEditingTitle(true)}
          >
            <span
              style={{
                fontSize: 13,
                color: '#0F172A',
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
            {hovered && (
              <Pencil size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
            )}
          </div>
        )}
      </td>

      {/* STATUS — click to cycle */}
      <td style={{ paddingRight: 8, whiteSpace: 'nowrap' }}>
        <button
          onClick={cycleStatus}
          title="Click to change status"
          style={{
            background: cfg.bg,
            color: cfg.color,
            fontSize: 10,
            padding: '2px 6px',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            borderRadius: 0,
            transition: 'opacity 100ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
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
