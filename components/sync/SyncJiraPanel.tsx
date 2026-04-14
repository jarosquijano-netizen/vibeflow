'use client';

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { relativeTime } from '@/lib/reports-engine';

const MONO = "'JetBrains Mono', monospace";

/* Features that have Jira epic IDs */
const JIRA_FEATURES = [
  { id: 'f1',  title: 'Carrier rate comparison',    jiraId: 'FIS-101' },
  { id: 'f2',  title: 'Bulk shipment upload',        jiraId: 'FIS-102' },
  { id: 'f5',  title: 'Customs doc generator',       jiraId: 'FIS-105' },
  { id: 'f6',  title: 'Real-time tracking webhooks', jiraId: 'FIS-106' },
  { id: 'f8',  title: 'Booking confirmation PDF',    jiraId: 'FIS-108' },
  { id: 'f10', title: 'Lane performance dashboard',  jiraId: 'FIS-110' },
  { id: 'f11', title: 'Detention time alerts',       jiraId: 'FIS-111' },
  { id: 'f13', title: 'Invoice reconciliation tool', jiraId: 'FIS-113' },
];

type RowStatus = 'synced' | 'pending' | 'failed';

interface JiraRow {
  id: string;
  title: string;
  jiraId: string;
  lastSynced: string;
  syncStatus: RowStatus;
}

const INITIAL_ROWS: JiraRow[] = JIRA_FEATURES.map((f, i) => ({
  ...f,
  lastSynced: new Date(Date.now() - (i + 1) * 900_000).toISOString(),
  syncStatus: (f.jiraId === 'FIS-113' ? 'failed' : i === 1 ? 'pending' : 'synced') as RowStatus,
}));

export default function SyncJiraPanel() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [rows, setRows] = useState<JiraRow[]>(INITIAL_ROWS);
  const [syncing, setSyncing] = useState<string | null>(null);

  const pendingCount = rows.filter((r) => r.syncStatus !== 'synced').length;

  const cardBg     = isCyber ? '#111118' : '#FFFFFF';
  const cardBorder = isCyber ? '#2A2A3E' : '#E2E8F0';
  const headerBg   = isCyber ? '#12121E' : '#F8FAFC';
  const bodyColor  = isCyber ? '#9CA3AF' : '#0F172A';
  const metaColor  = isCyber ? '#6B7280' : '#94A3B8';
  const altRow     = isCyber ? '#0D0D17' : '#F8FAFC';

  function syncRow(id: string) {
    setSyncing(id);
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, syncStatus: 'synced', lastSynced: new Date().toISOString() }
            : r
        )
      );
      setSyncing(null);
    }, 1400);
  }

  function syncAll() {
    const toSync = rows.filter((r) => r.syncStatus !== 'synced').map((r) => r.id);
    toSync.forEach((id, idx) => {
      setTimeout(() => syncRow(id), idx * 300);
    });
  }

  function StatusBadge({ status }: { status: RowStatus }) {
    const cfg: Record<RowStatus, { label: string; color: string; bg: string }> = {
      synced:  { label: isCyber ? '✓ SYNCED'  : '✓ Synced',  color: isCyber ? '#00FF88' : '#16A34A', bg: isCyber ? 'rgba(0,255,136,0.08)'  : '#F0FDF4' },
      pending: { label: isCyber ? '⏳ PENDING' : '⏳ Pending', color: isCyber ? '#FFB800' : '#D97706', bg: isCyber ? 'rgba(255,184,0,0.08)'  : '#FFFBEB' },
      failed:  { label: isCyber ? '× FAILED'  : '× Failed',  color: isCyber ? '#FF4444' : '#DC2626', bg: isCyber ? 'rgba(255,68,68,0.08)'  : '#FEF2F2' },
    };
    const c = cfg[status];
    return (
      <span
        style={{
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          fontSize: 10,
          fontWeight: 700,
          color: c.color,
          background: c.bg,
          padding: '2px 6px',
          whiteSpace: 'nowrap',
        }}
      >
        {c.label}
      </span>
    );
  }

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 16px',
          background: headerBg,
          borderBottom: `1px solid ${cardBorder}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: isCyber ? 11 : 13,
            fontWeight: 700,
            color: isCyber ? '#6B7280' : '#0F172A',
            textTransform: isCyber ? 'uppercase' : 'none',
            letterSpacing: isCyber ? '0.08em' : 0,
          }}
        >
          {isCyber ? '// JIRA_SYNC_STATUS' : 'Jira Sync Status'}
        </span>

        <button
          onClick={syncAll}
          style={{
            height: 28,
            paddingLeft: 12,
            paddingRight: 12,
            background: isCyber ? 'rgba(0,212,255,0.1)' : '#2563EB',
            border: `1px solid ${isCyber ? '#00D4FF' : 'transparent'}`,
            color: isCyber ? '#00D4FF' : '#FFFFFF',
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 0,
            letterSpacing: isCyber ? '0.04em' : 0,
            transition: 'all 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isCyber ? 'rgba(0,212,255,0.18)' : '#1D4ED8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isCyber ? 'rgba(0,212,255,0.1)' : '#2563EB';
          }}
        >
          {isCyber ? 'SYNC_ALL' : 'Sync All'}
        </button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div
          style={{
            padding: '8px 16px',
            background: isCyber ? 'rgba(255,68,68,0.08)' : '#FEF2F2',
            borderBottom: `1px solid ${isCyber ? 'rgba(255,68,68,0.25)' : '#FECACA'}`,
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 12,
            color: isCyber ? '#FF4444' : '#DC2626',
            flexShrink: 0,
          }}
        >
          {isCyber
            ? `⚠ ${pendingCount}_ITEM${pendingCount !== 1 ? 'S' : ''}_NEED_SYNCING`
            : `⚠ ${pendingCount} item${pendingCount !== 1 ? 's' : ''} need syncing`}
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                height: 30,
                background: headerBg,
                borderBottom: `1px solid ${cardBorder}`,
              }}
            >
              {(['FEATURE', 'JIRA ID', 'LAST SYNC', 'STATUS', '']).map((h) => (
                <th
                  key={h}
                  style={{
                    paddingLeft: 12,
                    paddingRight: 4,
                    textAlign: 'left',
                    fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: metaColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isSyncing = syncing === row.id;
              const rowBg     = i % 2 === 1 ? altRow : cardBg;
              return (
                <tr
                  key={row.id}
                  style={{
                    height: 34,
                    borderBottom: `1px solid ${isCyber ? '#1A1A28' : '#F1F5F9'}`,
                    background: isSyncing
                      ? (isCyber ? 'rgba(0,212,255,0.04)' : '#EFF6FF')
                      : rowBg,
                    transition: 'background 200ms ease',
                  }}
                >
                  {/* Feature title */}
                  <td style={{ paddingLeft: 12, paddingRight: 8, maxWidth: 160 }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        color: bodyColor,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {row.title}
                    </span>
                  </td>

                  {/* Jira ID chip */}
                  <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 10,
                        fontWeight: 700,
                        color: isCyber ? '#00D4FF' : '#2563EB',
                        background: isCyber ? 'rgba(0,212,255,0.08)' : '#EFF6FF',
                        border: `1px solid ${isCyber ? 'rgba(0,212,255,0.3)' : '#BFDBFE'}`,
                        padding: '1px 6px',
                        borderRadius: 3,
                      }}
                    >
                      {row.jiraId}
                    </span>
                  </td>

                  {/* Last synced */}
                  <td
                    style={{
                      paddingLeft: 12,
                      paddingRight: 8,
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      fontSize: 11,
                      color: metaColor,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isSyncing ? (isCyber ? 'SYNCING...' : 'Syncing…') : relativeTime(row.lastSynced)}
                  </td>

                  {/* Status badge */}
                  <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                    <StatusBadge status={isSyncing ? 'pending' : row.syncStatus} />
                  </td>

                  {/* Sync button */}
                  <td style={{ paddingLeft: 8, paddingRight: 12 }}>
                    {row.syncStatus !== 'synced' && !isSyncing && (
                      <button
                        onClick={() => syncRow(row.id)}
                        style={{
                          background: 'none',
                          border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
                          color: metaColor,
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontSize: 11,
                          cursor: 'pointer',
                          padding: '2px 8px',
                          borderRadius: 0,
                          transition: 'all 100ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = isCyber ? '#00D4FF' : '#2563EB';
                          e.currentTarget.style.color = isCyber ? '#00D4FF' : '#2563EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isCyber ? '#3B4B3D' : '#E2E8F0';
                          e.currentTarget.style.color = metaColor;
                        }}
                      >
                        {isCyber ? 'SYNC' : 'Sync'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
