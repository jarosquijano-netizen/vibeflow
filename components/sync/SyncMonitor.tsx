'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import KPICard from '@/components/reports/KPICard';
import SyncHealthCard from '@/components/sync/SyncHealthCard';
import SyncEventFeed from '@/components/sync/SyncEventFeed';
import SyncJiraPanel from '@/components/sync/SyncJiraPanel';
import { vibeToast } from '@/components/polish/toasts';
import {
  type SyncEvent,
  type SyncIntegration,
  SAMPLE_SYNC_EVENTS,
  INTEGRATIONS,
} from '@/lib/sync-data';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function systemStatus(integrations: SyncIntegration[]): 'ERROR' | 'WARNING' | 'OK' {
  if (integrations.some((i) => i.status === 'ERROR')) return 'ERROR';
  if (integrations.some((i) => i.status === 'WARNING')) return 'WARNING';
  return 'OK';
}

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* ------------------------------------------------------------------ */
/*  SyncMonitor                                                         */
/* ------------------------------------------------------------------ */
export default function SyncMonitor() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [events, setEvents] = useState<SyncEvent[]>(SAMPLE_SYNC_EVENTS);
  const [integrations, setIntegrations] = useState<SyncIntegration[]>(INTEGRATIONS);

  /* ---- Window event listeners ---- */
  useEffect(() => {
    function onXpEvent(e: Event) {
      const detail = (e as CustomEvent).detail ?? {};
      const newEvent: SyncEvent = {
        id: `se-${Date.now()}`,
        type: 'XP_AWARDED',
        title: 'XP awarded',
        detail: detail.message ?? 'XP awarded to engineer',
        status: 'OK',
        timestamp: new Date().toISOString(),
        xpAmount: detail.amount,
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    }

    function onFeatureStatusUpdated(e: Event) {
      const detail = (e as CustomEvent).detail ?? {};
      const newEvent: SyncEvent = {
        id: `se-${Date.now()}`,
        type: 'STATUS_AUTO',
        title: 'Feature auto-advanced',
        detail: detail.message ?? 'Feature status updated automatically',
        status: 'OK',
        timestamp: new Date().toISOString(),
        featureId: detail.featureId,
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    }

    window.addEventListener('xp-event', onXpEvent);
    window.addEventListener('feature-status-updated', onFeatureStatusUpdated);
    return () => {
      window.removeEventListener('xp-event', onXpEvent);
      window.removeEventListener('feature-status-updated', onFeatureStatusUpdated);
    };
  }, []);

  /* ---- Sync handler ---- */
  function handleSync(integrationId: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, status: 'SYNCING' } : i))
    );
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integrationId
            ? { ...i, status: 'OK', lastSync: new Date().toISOString(), errors: 0 }
            : i
        )
      );
      const integration = integrations.find((i) => i.id === integrationId);
      const newEvent: SyncEvent = {
        id: `se-${Date.now()}`,
        type: 'JIRA_SYNC',
        title: `${integration?.name ?? integrationId} sync complete`,
        detail: `Manual sync triggered — all items up to date`,
        status: 'OK',
        timestamp: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 50));
      vibeToast.success(
        isCyber
          ? `${(integration?.name ?? integrationId).toUpperCase().replace(' ', '_')}_SYNCED`
          : `${integration?.name ?? integrationId} synced successfully`
      );
    }, 2000);
  }

  /* ---- KPI computations ---- */
  const todayMs = todayStart();
  const eventsToday = events.filter((e) => new Date(e.timestamp).getTime() >= todayMs).length;
  const autoUpdates = events.filter((e) => e.type === 'STATUS_AUTO').length;
  const jiraSynced = events.filter((e) => e.type === 'JIRA_SYNC' && e.status === 'OK').length;
  const errorCount = events.filter((e) => e.status === 'ERROR').length;

  /* ---- System status ---- */
  const sysStatus = systemStatus(integrations);
  const sysLabel: Record<typeof sysStatus, string> = {
    ERROR:   isCyber ? '× SYSTEM DEGRADED'       : '× System Degraded',
    WARNING: isCyber ? '⚠ DEGRADED'              : '⚠ Degraded',
    OK:      isCyber ? '● ALL SYSTEMS OPERATIONAL' : '● All Systems Operational',
  };
  const sysColor: Record<typeof sysStatus, string> = {
    ERROR:   isCyber ? '#FF4444' : '#DC2626',
    WARNING: isCyber ? '#FFB800' : '#D97706',
    OK:      isCyber ? '#00FF88' : '#16A34A',
  };
  const sysBg: Record<typeof sysStatus, string> = {
    ERROR:   isCyber ? 'rgba(255,68,68,0.08)'   : '#FEF2F2',
    WARNING: isCyber ? 'rgba(255,184,0,0.08)'   : '#FFFBEB',
    OK:      isCyber ? 'rgba(0,255,136,0.06)'   : '#F0FDF4',
  };
  const sysBorder: Record<typeof sysStatus, string> = {
    ERROR:   isCyber ? 'rgba(255,68,68,0.25)'   : '#FECACA',
    WARNING: isCyber ? 'rgba(255,184,0,0.25)'   : '#FDE68A',
    OK:      isCyber ? 'rgba(0,255,136,0.2)'    : '#BBF7D0',
  };

  /* ---- Theme vars ---- */
  const pageBg   = isCyber ? '#080810' : '#F1F5F9';
  const sectionGap = 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {/* ---- System Status Pill ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: sysBg[sysStatus],
          border: `1px solid ${sysBorder[sysStatus]}`,
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: isCyber ? 11 : 13,
            fontWeight: 700,
            color: sysColor[sysStatus],
            letterSpacing: isCyber ? '0.06em' : 0,
            textTransform: isCyber ? 'uppercase' : 'none',
          }}
        >
          {sysLabel[sysStatus]}
        </span>
        <span
          style={{
            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            fontSize: 11,
            color: isCyber ? '#4B5563' : '#94A3B8',
          }}
        >
          {isCyber
            ? `${integrations.length}_INTEGRATIONS_MONITORED`
            : `${integrations.length} integrations monitored`}
        </span>
      </div>

      {/* ---- KPI Row ---- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard
          label={isCyber ? 'EVENTS_TODAY' : 'Events Today'}
          value={String(eventsToday)}
          delta={isCyber ? `${events.length}_TOTAL` : `${events.length} total`}
          deltaType="neutral"
          accent="cyan"
        />
        <KPICard
          label={isCyber ? 'AUTO_UPDATES' : 'Auto Updates'}
          value={String(autoUpdates)}
          delta={isCyber ? 'STATUS_AUTO_EVENTS' : 'Status auto events'}
          deltaType="positive"
          accent="purple"
        />
        <KPICard
          label={isCyber ? 'JIRA_SYNCED' : 'Jira Synced'}
          value={String(jiraSynced)}
          delta={isCyber ? 'SUCCESSFUL_SYNCS' : 'Successful syncs'}
          deltaType="positive"
          accent="green"
        />
        <KPICard
          label={isCyber ? 'ERRORS' : 'Errors'}
          value={String(errorCount)}
          delta={errorCount > 0 ? (isCyber ? 'REQUIRES_ATTENTION' : 'Requires attention') : (isCyber ? 'ALL_CLEAR' : 'All clear')}
          deltaType={errorCount > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* ---- Health Cards Row ---- */}
      <div style={{ display: 'flex', gap: 16 }}>
        {integrations.map((integration) => (
          <SyncHealthCard
            key={integration.id}
            integration={integration}
            onSync={handleSync}
          />
        ))}
      </div>

      {/* ---- Bottom Row: Event Feed + Jira Panel ---- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          minHeight: 420,
        }}
      >
        <SyncEventFeed
          events={events}
          onClear={() => setEvents([])}
        />
        <SyncJiraPanel />
      </div>
    </div>
  );
}
