export type SyncStatus = 'OK' | 'WARNING' | 'ERROR' | 'SYNCING';
export type SyncEventType =
  | 'JIRA_SYNC'
  | 'STATUS_AUTO'
  | 'FEATURE_PROMOTED'
  | 'SESSION_CLOSED'
  | 'XP_AWARDED'
  | 'ERROR';

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  title: string;
  detail: string;
  status: SyncStatus;
  timestamp: string;
  featureId?: string;
  sessionId?: string;
  jiraId?: string;
  xpAmount?: number;
}

export interface SyncIntegration {
  id: string;
  name: string;
  status: SyncStatus;
  lastSync: string;
  itemsSynced: number;
  errors: number;
  icon: string;
}

export const SAMPLE_SYNC_EVENTS: SyncEvent[] = [
  {
    id: 'se1',
    type: 'JIRA_SYNC',
    title: 'Jira sync complete',
    detail: '3 backlog items synced to FIS project',
    status: 'OK',
    timestamp: new Date(Date.now() - 300_000).toISOString(),
    jiraId: 'FIS-201',
  },
  {
    id: 'se2',
    type: 'STATUS_AUTO',
    title: 'Feature auto-advanced',
    detail: 'Carrier rate comparison: SCOPING → PROTOTYPING',
    status: 'OK',
    timestamp: new Date(Date.now() - 600_000).toISOString(),
    featureId: 'f1',
  },
  {
    id: 'se3',
    type: 'FEATURE_PROMOTED',
    title: 'Idea promoted to board',
    detail: 'Smart route optimization added to IDEA column',
    status: 'OK',
    timestamp: new Date(Date.now() - 900_000).toISOString(),
    featureId: 'f10',
  },
  {
    id: 'se4',
    type: 'XP_AWARDED',
    title: 'XP awarded',
    detail: 'Jordan Davies +450 XP — Session closed',
    status: 'OK',
    timestamp: new Date(Date.now() - 1_200_000).toISOString(),
    xpAmount: 450,
  },
  {
    id: 'se5',
    type: 'ERROR',
    title: 'Jira sync failed',
    detail: 'FIS-113: Authentication token expired',
    status: 'ERROR',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    jiraId: 'FIS-113',
  },
  {
    id: 'se6',
    type: 'SESSION_CLOSED',
    title: 'Session closed',
    detail: 'CO2 emissions calculator hook — 1.5h logged',
    status: 'OK',
    timestamp: new Date(Date.now() - 7_200_000).toISOString(),
    sessionId: 's3',
  },
  {
    id: 'se7',
    type: 'JIRA_SYNC',
    title: 'Jira sync complete',
    detail: '5 items synced across 2 features',
    status: 'OK',
    timestamp: new Date(Date.now() - 10_800_000).toISOString(),
  },
  {
    id: 'se8',
    type: 'ERROR',
    title: 'Status update conflict',
    detail: 'f2: Concurrent edit detected — resolved to PROTOTYPING',
    status: 'WARNING',
    timestamp: new Date(Date.now() - 14_400_000).toISOString(),
    featureId: 'f2',
  },
];

export const INTEGRATIONS: SyncIntegration[] = [
  {
    id: 'jira',
    name: 'Jira',
    status: 'WARNING',
    lastSync: new Date(Date.now() - 300_000).toISOString(),
    itemsSynced: 18,
    errors: 1,
    icon: 'J',
  },
  {
    id: 'vibeflow',
    name: 'VibeFlow Core',
    status: 'OK',
    lastSync: new Date(Date.now() - 60_000).toISOString(),
    itemsSynced: 45,
    errors: 0,
    icon: 'V',
  },
  {
    id: 'xp',
    name: 'XP Engine',
    status: 'OK',
    lastSync: new Date(Date.now() - 30_000).toISOString(),
    itemsSynced: 12,
    errors: 0,
    icon: '⚡',
  },
];

/* ------------------------------------------------------------------ */
/*  Status color helpers                                                */
/* ------------------------------------------------------------------ */
export function statusBorderColor(status: SyncStatus, isCyber: boolean): string {
  const map: Record<SyncStatus, [string, string]> = {
    OK:      ['#16A34A', '#00FF88'],
    WARNING: ['#D97706', '#FFB800'],
    ERROR:   ['#DC2626', '#FF4444'],
    SYNCING: ['#2563EB', '#00D4FF'],
  };
  return map[status][isCyber ? 1 : 0];
}

export function statusTextColor(status: SyncStatus, isCyber: boolean): string {
  return statusBorderColor(status, isCyber);
}
