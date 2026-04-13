'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { VibeSession } from '@/types';
import { getActiveSessions, saveActiveSession } from '@/lib/feature-store';
import SessionList from './SessionList';
import SessionDetail from './SessionDetail';

/* ------------------------------------------------------------------ */
/*  Sample data                                                         */
/* ------------------------------------------------------------------ */
const SAMPLE_SESSIONS: VibeSession[] = [
  {
    id: 's1',
    title: 'Rate card comparison — initial build',
    date: '2026-06-09',
    duration: 3,
    status: 'OPEN',
    goal: 'Build the first working prototype of the carrier rate comparison table with filtering and color coding.',
    linkedFeatureIds: ['f1', 'f7'],
    promptIds: ['p1', 'p7'],
    prototypeUrl: 'https://v0.dev/t/rate-card-v1',
    notes: {
      worked: 'v0 generated the table structure perfectly on first try. Color coding logic was clean. Recharts integration was straightforward.',
      improve: 'Need to handle empty states better. Currency formatting was inconsistent. Should add a sticky header for long tables.',
    },
    backlogItems: [
      { id: 'b1', title: 'Add CSV export to rate table', status: 'TODO', jiraId: 'FIS-201' },
      { id: 'b2', title: 'Fix currency formatting edge cases', status: 'IN_PROGRESS', jiraId: 'FIS-202' },
      { id: 'b3', title: 'Sticky header implementation', status: 'DONE', jiraId: 'FIS-203' },
    ],
    jiraSyncedIds: ['FIS-201', 'FIS-202', 'FIS-203'],
    totalMinutes: 180,
    sessions: [
      {
        id: 'day-s1-1',
        date: '2026-06-07',
        startedAt: '2026-06-07T09:00:00Z',
        endedAt: '2026-06-07T11:00:00Z',
        minutesLogged: 120,
        notesWorked: 'v0 generated the table structure perfectly on first try. Color coding logic was clean.',
        notesToImprove: 'Need to handle empty states better.',
        xpEarned: 300,
      },
      {
        id: 'day-s1-2',
        date: '2026-06-09',
        startedAt: '2026-06-09T10:00:00Z',
        minutesLogged: 60,
        notesWorked: 'Recharts integration was straightforward. Added filtering.',
        notesToImprove: 'Currency formatting was inconsistent. Should add a sticky header for long tables.',
        xpEarned: 200,
      },
    ],
    lastActiveAt: '2026-06-09',
    autoStatusHistory: [],
  },
  {
    id: 's2',
    title: 'Customs doc generator — form validation',
    date: '2026-06-06',
    duration: 2,
    status: 'CLOSED',
    goal: 'Write Zod schemas for the customs declaration form and wire up error messages in the UI.',
    linkedFeatureIds: ['f5'],
    promptIds: ['p3'],
    prototypeUrl: '',
    notes: {
      worked: 'Zod schema covered all the HS code edge cases. Claude prompt for schema generation saved about an hour.',
      improve: 'The error message UX needs work — too many errors shown at once. Need progressive disclosure.',
    },
    backlogItems: [
      { id: 'b4', title: 'Progressive error disclosure', status: 'TODO', jiraId: 'FIS-211' },
      { id: 'b5', title: 'HS code autocomplete', status: 'TODO', jiraId: '' },
    ],
    jiraSyncedIds: ['FIS-211'],
    totalMinutes: 120,
    sessions: [
      {
        id: 'day-s2-1',
        date: '2026-06-06',
        startedAt: '2026-06-06T09:00:00Z',
        endedAt: '2026-06-06T11:00:00Z',
        minutesLogged: 120,
        notesWorked: 'Zod schema covered all the HS code edge cases. Claude prompt for schema generation saved about an hour.',
        notesToImprove: 'The error message UX needs work — too many errors shown at once. Need progressive disclosure.',
        xpEarned: 300,
      },
    ],
    lastActiveAt: '2026-06-06',
    autoStatusHistory: [],
  },
  {
    id: 's3',
    title: 'CO2 emissions calculator hook',
    date: '2026-06-04',
    duration: 1.5,
    status: 'CLOSED',
    goal: 'Build and test the useCarbonEmissions hook using GLEC Framework emission factors.',
    linkedFeatureIds: ['f4'],
    promptIds: ['p4'],
    prototypeUrl: 'https://v0.dev/t/co2-hook-v2',
    notes: {
      worked: 'Emission factor lookup table was clean. Memoization worked perfectly. Grade calculation (A-F) was intuitive.',
      improve: 'Unit tests took longer than expected. Need to add SEA transport mode — missed in first pass.',
    },
    backlogItems: [
      { id: 'b6', title: 'Add SEA transport mode', status: 'IN_PROGRESS', jiraId: 'FIS-221' },
      { id: 'b7', title: 'Add unit test coverage to 90%', status: 'TODO', jiraId: 'FIS-222' },
    ],
    jiraSyncedIds: ['FIS-221'],
    totalMinutes: 90,
    sessions: [
      {
        id: 'day-s3-1',
        date: '2026-06-04',
        startedAt: '2026-06-04T09:00:00Z',
        endedAt: '2026-06-04T10:30:00Z',
        minutesLogged: 90,
        notesWorked: 'Emission factor lookup table was clean. Memoization worked perfectly. Grade calculation (A-F) was intuitive.',
        notesToImprove: 'Unit tests took longer than expected. Need to add SEA transport mode — missed in first pass.',
        xpEarned: 300,
      },
    ],
    lastActiveAt: '2026-06-04',
    autoStatusHistory: [],
  },
  {
    id: 's4',
    title: 'Tracking webhook handler',
    date: '2026-05-29',
    duration: 4,
    status: 'CLOSED',
    goal: 'Implement the carrier webhook event handler with HMAC validation and Redis queuing.',
    linkedFeatureIds: ['f6'],
    promptIds: ['p8'],
    prototypeUrl: '',
    notes: {
      worked: 'HMAC validation was solid. Redis queue pattern worked well. Cursor autocomplete was very helpful here.',
      improve: 'Need better dead letter queue handling. Retry logic needs exponential backoff not fixed intervals.',
    },
    backlogItems: [
      { id: 'b8', title: 'Exponential backoff for retries', status: 'TODO', jiraId: 'FIS-231' },
      { id: 'b9', title: 'Dead letter queue monitoring', status: 'TODO', jiraId: 'FIS-232' },
    ],
    jiraSyncedIds: [],
    totalMinutes: 240,
    sessions: [
      {
        id: 'day-s4-1',
        date: '2026-05-28',
        startedAt: '2026-05-28T09:00:00Z',
        endedAt: '2026-05-28T11:00:00Z',
        minutesLogged: 120,
        notesWorked: 'HMAC validation was solid. Set up the Redis queue structure.',
        notesToImprove: 'Need to handle timeout edge cases.',
        xpEarned: 300,
      },
      {
        id: 'day-s4-2',
        date: '2026-05-29',
        startedAt: '2026-05-29T09:00:00Z',
        endedAt: '2026-05-29T11:00:00Z',
        minutesLogged: 120,
        notesWorked: 'Redis queue pattern worked well. Cursor autocomplete was very helpful here.',
        notesToImprove: 'Need better dead letter queue handling. Retry logic needs exponential backoff not fixed intervals.',
        xpEarned: 300,
      },
    ],
    lastActiveAt: '2026-05-29',
    autoStatusHistory: [],
  },
  {
    id: 's5',
    title: 'Lane performance dashboard',
    date: '2026-05-26',
    duration: 2.5,
    status: 'CLOSED',
    goal: 'Build recharts dashboard showing lane volume, on-time %, and cost vs transit scatter plot.',
    linkedFeatureIds: ['f10'],
    promptIds: ['p7'],
    prototypeUrl: 'https://v0.dev/t/lane-dash-v3',
    notes: {
      worked: 'Scatter plot was the highlight — cost vs transit time tells a clear story. Shared filter state was clean.',
      improve: 'BarChart for top 10 lanes needs better truncation on long lane names. Mobile layout is broken.',
    },
    backlogItems: [
      { id: 'b10', title: 'Fix mobile chart layout', status: 'TODO', jiraId: 'FIS-241' },
      { id: 'b11', title: 'Lane name truncation in BarChart', status: 'DONE', jiraId: 'FIS-242' },
    ],
    jiraSyncedIds: ['FIS-241', 'FIS-242'],
    totalMinutes: 150,
    sessions: [
      {
        id: 'day-s5-1',
        date: '2026-05-26',
        startedAt: '2026-05-26T09:00:00Z',
        endedAt: '2026-05-26T11:30:00Z',
        minutesLogged: 150,
        notesWorked: 'Scatter plot was the highlight — cost vs transit time tells a clear story. Shared filter state was clean.',
        notesToImprove: 'BarChart for top 10 lanes needs better truncation on long lane names. Mobile layout is broken.',
        xpEarned: 300,
      },
    ],
    lastActiveAt: '2026-05-26',
    autoStatusHistory: [],
  },
  {
    id: 's6',
    title: 'Spot rate email parser prompt',
    date: '2026-05-20',
    duration: 1,
    status: 'CLOSED',
    goal: 'Engineer the Claude prompt for extracting structured data from spot rate request emails.',
    linkedFeatureIds: ['f12'],
    promptIds: ['p9'],
    prototypeUrl: '',
    notes: {
      worked: 'Few-shot examples dramatically improved extraction accuracy. Null handling for missing fields worked cleanly.',
      improve: 'Need to handle multi-currency amounts better. Some date formats from EU customers are parsed incorrectly.',
    },
    backlogItems: [
      { id: 'b12', title: 'Multi-currency amount parsing', status: 'IN_PROGRESS', jiraId: '' },
      { id: 'b13', title: 'EU date format support', status: 'TODO', jiraId: '' },
    ],
    jiraSyncedIds: [],
    totalMinutes: 60,
    sessions: [
      {
        id: 'day-s6-1',
        date: '2026-05-20',
        startedAt: '2026-05-20T09:00:00Z',
        endedAt: '2026-05-20T10:00:00Z',
        minutesLogged: 60,
        notesWorked: 'Few-shot examples dramatically improved extraction accuracy. Null handling for missing fields worked cleanly.',
        notesToImprove: 'Need to handle multi-currency amounts better. Some date formats from EU customers are parsed incorrectly.',
        xpEarned: 300,
      },
    ],
    lastActiveAt: '2026-05-20',
    autoStatusHistory: [],
  },
];

/* ------------------------------------------------------------------ */
/*  VibeSessions                                                        */
/* ------------------------------------------------------------------ */
export default function VibeSessions() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get('session');

  const [sessions, setSessions] = useState<VibeSession[]>(SAMPLE_SESSIONS);
  const [selectedId, setSelectedId] = useState<string | null>('s1');

  /* Merge localStorage sessions on mount and handle URL param */
  useEffect(() => {
    const active = getActiveSessions();
    if (active.length > 0) {
      setSessions((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = active.filter((s) => !existingIds.has(s.id));
        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
    }

    if (sessionParam) {
      // Find in active sessions or sample
      const found = active.find((s) => s.id === sessionParam);
      if (found) {
        setSessions((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          return existingIds.has(found.id) ? prev : [found, ...prev];
        });
        setSelectedId(sessionParam);
      }
    }
  }, [sessionParam]);

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

  function handleUpdate(updated: VibeSession) {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    // Persist if it's an active session
    saveActiveSession(updated);
  }

  function handleNew() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const id = Date.now().toString();
    const newSession: VibeSession = {
      id,
      title: 'New session',
      date: today,
      duration: 1,
      status: 'OPEN',
      goal: '',
      linkedFeatureIds: [],
      promptIds: [],
      prototypeUrl: undefined,
      notes: { worked: '', improve: '' },
      backlogItems: [],
      jiraSyncedIds: [],
      totalMinutes: 0,
      sessions: [
        {
          id: `day-${id}-1`,
          date: today,
          startedAt: now.toISOString(),
          minutesLogged: 0,
          notesWorked: '',
          notesToImprove: '',
          xpEarned: 0,
        },
      ],
      lastActiveAt: today,
      autoStatusHistory: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setSelectedId(newSession.id);
    saveActiveSession(newSession);
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', width: '100%' }}>
      <SessionList
        sessions={sessions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={handleNew}
      />
      <SessionDetail
        key={selectedSession?.id ?? 'empty'}
        session={selectedSession}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
