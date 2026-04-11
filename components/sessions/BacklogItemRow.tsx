'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { BacklogItem } from '@/types';

export const BACKLOG_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'Todo',        color: '#94A3B8', bg: '#F8FAFC' },
  IN_PROGRESS: { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF' },
  DONE:        { label: 'Done',        color: '#16A34A', bg: '#F0FDF4' },
};

interface BacklogItemRowProps {
  item: BacklogItem;
}

export default function BacklogItemRow({ item }: BacklogItemRowProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = BACKLOG_STATUS_CONFIG[item.status] ?? BACKLOG_STATUS_CONFIG.TODO;

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
      <td style={{ paddingRight: 8, maxWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              fontSize: 13,
              color: '#0F172A',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            {item.title}
          </span>
          {hovered && (
            <Pencil size={12} style={{ color: '#94A3B8', flexShrink: 0 }} />
          )}
        </div>
      </td>

      {/* STATUS */}
      <td style={{ paddingRight: 8, whiteSpace: 'nowrap' }}>
        <span
          style={{
            background: cfg.bg,
            color: cfg.color,
            fontSize: 10,
            padding: '2px 6px',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
          }}
        >
          {cfg.label}
        </span>
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
