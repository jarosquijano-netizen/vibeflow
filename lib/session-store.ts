/**
 * session-store.ts — canonical data layer for sessions and features.
 * All components should read/write through these helpers so they share
 * the same localStorage keys and merge logic.
 */

import type { Feature, VibeSession } from '@/types';
import { sampleFeatures, sampleVibeSessions } from './sample-data';

/* ------------------------------------------------------------------ */
/*  Sessions                                                            */
/* ------------------------------------------------------------------ */

/** Returns all sessions: localStorage active sessions merged with sample data. */
export function getAllSessions(): VibeSession[] {
  if (typeof window === 'undefined') return sampleVibeSessions;
  try {
    const active: VibeSession[] = JSON.parse(
      localStorage.getItem('vibeflow-active-sessions') || '[]'
    );
    const activeIds = new Set(active.map((s) => s.id));
    const samples = sampleVibeSessions.filter((s) => !activeIds.has(s.id));
    return [...active, ...samples];
  } catch {
    return sampleVibeSessions;
  }
}

/** Upsert a session into localStorage active sessions. */
export function saveSession(session: VibeSession): void {
  if (typeof window === 'undefined') return;
  try {
    const existing: VibeSession[] = JSON.parse(
      localStorage.getItem('vibeflow-active-sessions') || '[]'
    );
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    localStorage.setItem('vibeflow-active-sessions', JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Features                                                            */
/* ------------------------------------------------------------------ */

/** Returns all features: promoted → sample, with status overrides applied. */
export function getAllFeatures(): Feature[] {
  if (typeof window === 'undefined') return sampleFeatures;
  try {
    const promoted: Feature[] = JSON.parse(
      localStorage.getItem('vibeflow-promoted-features') || '[]'
    );
    const overrides: Record<string, string> = JSON.parse(
      localStorage.getItem('vibeflow-status-overrides') || '{}'
    );
    const promotedIds = new Set(promoted.map((f) => f.id));
    const samples = sampleFeatures.filter((f) => !promotedIds.has(f.id));
    return [...promoted, ...samples].map((f) => ({
      ...f,
      status: (overrides[f.id] as Feature['status']) ?? f.status,
    }));
  } catch {
    return sampleFeatures;
  }
}

/** Look up a single feature by ID from the merged promoted+sample list, with overrides. */
export function getFeatureById(id: string): Feature | null {
  if (typeof window === 'undefined') {
    return sampleFeatures.find((f) => f.id === id) ?? null;
  }
  try {
    const promoted: Feature[] = JSON.parse(
      localStorage.getItem('vibeflow-promoted-features') || '[]'
    );
    const overrides: Record<string, string> = JSON.parse(
      localStorage.getItem('vibeflow-status-overrides') || '{}'
    );
    const found =
      promoted.find((f) => f.id === id) ??
      sampleFeatures.find((f) => f.id === id) ??
      null;
    if (!found) return null;
    return {
      ...found,
      status: (overrides[id] as Feature['status']) ?? found.status,
    };
  } catch {
    return sampleFeatures.find((f) => f.id === id) ?? null;
  }
}

/** Write a status override for a feature and update the promoted array. */
export function updateFeatureStatus(featureId: string, newStatus: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Write override (applies to both promoted and sample features)
    const overrides: Record<string, string> = JSON.parse(
      localStorage.getItem('vibeflow-status-overrides') || '{}'
    );
    overrides[featureId] = newStatus;
    localStorage.setItem('vibeflow-status-overrides', JSON.stringify(overrides));

    // Also update promoted array if present
    const promoted: Feature[] = JSON.parse(
      localStorage.getItem('vibeflow-promoted-features') || '[]'
    );
    const updated = promoted.map((f) =>
      f.id === featureId ? { ...f, status: newStatus as Feature['status'] } : f
    );
    localStorage.setItem('vibeflow-promoted-features', JSON.stringify(updated));
  } catch {
    // ignore
  }
}
