import type { Feature, VibeSession } from '@/types';

/* ------------------------------------------------------------------ */
/*  Feature Metrics                                                     */
/* ------------------------------------------------------------------ */
export interface FeatureMetrics {
  featureId: string;
  featureTitle: string;
  status: string;
  size: string | null;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
  sessionDays: number;
  autoAdvances: number;
  manualAdvances: number;
  firstSessionDate: string;
  lastSessionDate: string;
  daysToComplete?: number;
  tasksTotal: number;
  tasksDone: number;
  completionPct: number;
}

export function calcFeatureMetrics(
  features: Feature[],
  sessions: VibeSession[]
): FeatureMetrics[] {
  return features.map((feature) => {
    const linked = sessions.filter((s) =>
      s.linkedFeatureIds.includes(feature.id)
    );
    const totalMins = linked.reduce((sum, s) => sum + (s.totalMinutes ?? 0), 0);
    const allDays = linked.flatMap((s) => s.sessions ?? []);
    const uniqueDays = new Set(allDays.map((d) => d.date.slice(0, 10))).size;
    const autoChanges = linked.flatMap((s) =>
      (s.autoStatusHistory ?? []).filter((h) => h.automatic)
    );
    const manualChanges = linked.flatMap((s) =>
      (s.autoStatusHistory ?? []).filter((h) => !h.automatic)
    );
    const allTasks = linked.flatMap((s) => s.backlogItems ?? []);

    const dates = linked.map((s) => s.date).filter(Boolean).sort();

    return {
      featureId: feature.id,
      featureTitle: feature.title,
      status: feature.status,
      size: feature.size,
      totalMinutes: totalMins,
      totalHours: Math.round(totalMins / 6) / 10,
      sessionCount: linked.length,
      sessionDays: uniqueDays,
      autoAdvances: autoChanges.length,
      manualAdvances: manualChanges.length,
      firstSessionDate: dates[0] ?? '',
      lastSessionDate: dates[dates.length - 1] ?? '',
      tasksTotal: allTasks.length,
      tasksDone: allTasks.filter((t) => t.status === 'DONE').length,
      completionPct:
        allTasks.length > 0
          ? Math.round(
              (allTasks.filter((t) => t.status === 'DONE').length /
                allTasks.length) *
                100
            )
          : 0,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Summary                                                             */
/* ------------------------------------------------------------------ */
export interface ReportsSummary {
  totalSessionMinutes: number;
  totalSessionHours: number;
  avgSessionMinutes: number;
  totalSessions: number;
  featuresInProgress: number;
  featuresDone: number;
  autoStatusPct: number;
  streakDays: number;
  mostActiveFeature: string;
  mostProductiveDay: string;
}

export function calcSummary(
  sessions: VibeSession[],
  metrics: FeatureMetrics[]
): ReportsSummary {
  const totalMins = sessions.reduce((s, sess) => s + (sess.totalMinutes ?? 0), 0);
  const allChanges = sessions.flatMap((s) => s.autoStatusHistory ?? []);
  const autoCount = allChanges.filter((c) => c.automatic).length;
  const mostActive = [...metrics].sort(
    (a, b) => b.totalMinutes - a.totalMinutes
  )[0];

  return {
    totalSessionMinutes: totalMins,
    totalSessionHours: Math.round(totalMins / 6) / 10,
    avgSessionMinutes:
      sessions.length > 0 ? Math.round(totalMins / sessions.length) : 0,
    totalSessions: sessions.length,
    featuresInProgress: metrics.filter(
      (m) => !['DONE', 'PARKED'].includes(m.status)
    ).length,
    featuresDone: metrics.filter((m) => m.status === 'DONE').length,
    autoStatusPct:
      allChanges.length > 0
        ? Math.round((autoCount / allChanges.length) * 100)
        : 0,
    streakDays: 7,
    mostActiveFeature: mostActive?.featureTitle ?? '—',
    mostProductiveDay: 'Tuesday',
  };
}

/* ------------------------------------------------------------------ */
/*  Relative time helper                                               */
/* ------------------------------------------------------------------ */
export function relativeTime(dateStr: string): string {
  if (!dateStr) return '—';
  const then = new Date(dateStr + 'T12:00:00');
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - then.getTime()) / 86400000
  );
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}
