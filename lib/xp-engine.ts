'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
export interface XPEvent {
  id: string;
  label: string;
  amount: number;
  timestamp: number;
}

export interface XPState {
  total: number;
  sessionXP: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  streak: number;
  events: XPEvent[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const LEVEL_TITLES: Record<number, string> = {
  1: 'ROOKIE VIBE CODER',
  2: 'JUNIOR VIBE CODER',
  3: 'VIBE CODER',
  4: 'SENIOR VIBE CODER',
  5: 'VIBE ARCHITECT',
  6: 'VIBE MASTER',
  7: 'VIBE LORD',
};

export const XP_REWARDS = {
  GOAL_WRITTEN:     { label: 'Goal written',         amount: 50  },
  PROTOTYPE_ADDED:  { label: 'Prototype added',       amount: 100 },
  BACKLOG_ITEM:     { label: 'Backlog item created',  amount: 25  },
  NOTE_WRITTEN:     { label: 'Notes added',           amount: 75  },
  PROMPT_LINKED:    { label: 'Prompt linked',         amount: 30  },
  FEATURE_LINKED:   { label: 'Feature linked',        amount: 40  },
  SESSION_CLOSED:   { label: 'Session closed',        amount: 200 },
  AI_SIZE_ACCEPTED: { label: 'AI size accepted',      amount: 100 },
  JIRA_SYNCED:      { label: 'Synced to Jira',        amount: 50  },
};

/* ------------------------------------------------------------------ */
/*  Pure functions                                                      */
/* ------------------------------------------------------------------ */
const THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000, 20000];

export function calculateLevel(totalXP: number): {
  level: number;
  title: string;
  xpToNext: number;
  progress: number;
} {
  let level = 1;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= THRESHOLDS[i]) { level = i + 1; break; }
  }
  const current = THRESHOLDS[level - 1] ?? 0;
  const next = THRESHOLDS[level] ?? 99999;
  return {
    level,
    title: LEVEL_TITLES[level] ?? 'VIBE LORD',
    xpToNext: next - totalXP,
    progress: Math.round(((totalXP - current) / (next - current)) * 100),
  };
}

export function addXPEvent(
  state: XPState,
  reward: { label: string; amount: number },
  eventId?: string,
): XPState {
  const event: XPEvent = {
    id: eventId ?? Date.now().toString(),
    label: reward.label,
    amount: reward.amount,
    timestamp: Date.now(),
  };
  const newTotal = state.total + reward.amount;
  const newSession = state.sessionXP + reward.amount;
  const levelInfo = calculateLevel(newTotal);
  return {
    ...state,
    total: newTotal,
    sessionXP: newSession,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    xpToNextLevel: levelInfo.xpToNext,
    events: [event, ...state.events].slice(0, 20),
  };
}

export function dispatchXPEvent(event: XPEvent): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xp-event', { detail: event }));
  }
}

export const INITIAL_XP_STATE: XPState = {
  total: 2450,
  sessionXP: 450,
  level: 7,
  levelTitle: 'SENIOR VIBE CODER',
  xpToNextLevel: 550,
  streak: 7,
  events: [
    { id: '1', label: 'Goal written',       amount: 50,  timestamp: 0 },
    { id: '2', label: 'Prototype added',    amount: 100, timestamp: 0 },
    { id: '3', label: 'Sprint milestone',   amount: 200, timestamp: 0 },
    { id: '4', label: 'Prototype rendered', amount: 100, timestamp: 0 },
  ],
};

/* ------------------------------------------------------------------ */
/*  XP Context + Provider                                               */
/* ------------------------------------------------------------------ */
interface XPContextValue {
  xpState: XPState;
  addXP: (reward: { label: string; amount: number }) => void;
}

const XPContext = createContext<XPContextValue>({
  xpState: INITIAL_XP_STATE,
  addXP: () => {},
});

export function XPProvider({ children }: { children: ReactNode }) {
  const [xpState, setXpState] = useState<XPState>(INITIAL_XP_STATE);

  const addXP = useCallback((reward: { label: string; amount: number }) => {
    const eventId = Date.now().toString();
    const event: XPEvent = {
      id: eventId,
      label: reward.label,
      amount: reward.amount,
      timestamp: Date.now(),
    };
    setXpState((prev) => addXPEvent(prev, reward, eventId));
    dispatchXPEvent(event);
  }, []);

  return React.createElement(
    XPContext.Provider,
    { value: { xpState, addXP } },
    children,
  );
}

export function useXPContext() {
  return useContext(XPContext);
}
