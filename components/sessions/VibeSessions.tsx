'use client';

import { useState } from 'react';
import type { VibeSession } from '@/types';
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
  },
  {
    id: 's2',
    title: 'Customs doc generator — form validation',
    date: '2026-06-06',
    duration: 2,
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
  },
  {
    id: 's3',
    title: 'CO2 emissions calculator hook',
    date: '2026-06-04',
    duration: 1.5,
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
  },
  {
    id: 's4',
    title: 'Tracking webhook handler',
    date: '2026-05-29',
    duration: 4,
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
  },
  {
    id: 's5',
    title: 'Lane performance dashboard',
    date: '2026-05-26',
    duration: 2.5,
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
  },
  {
    id: 's6',
    title: 'Spot rate email parser prompt',
    date: '2026-05-20',
    duration: 1,
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
  },
];

/* ------------------------------------------------------------------ */
/*  VibeSessions                                                        */
/* ------------------------------------------------------------------ */
export default function VibeSessions() {
  const [sessions, setSessions] = useState<VibeSession[]>(SAMPLE_SESSIONS);
  const [selectedId, setSelectedId] = useState<string | null>('s1');

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

  function handleUpdate(updated: VibeSession) {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  function handleNew() {
    const today = new Date().toISOString().slice(0, 10);
    const newSession: VibeSession = {
      id: Date.now().toString(),
      title: 'New session',
      date: today,
      duration: 1,
      goal: '',
      linkedFeatureIds: [],
      promptIds: [],
      prototypeUrl: undefined,
      notes: { worked: '', improve: '' },
      backlogItems: [],
      jiraSyncedIds: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setSelectedId(newSession.id);
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
