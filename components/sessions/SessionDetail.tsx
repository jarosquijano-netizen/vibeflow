'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Zap, CheckSquare } from 'lucide-react';
import type { VibeSession, BacklogItem, Feature, SessionDay } from '@/types';
import BacklogItemRow from './BacklogItemRow';
import { vibeToast } from '@/components/polish/toasts';
import { useTheme } from '@/components/providers/ThemeProvider';
import { detectFeatureStatus, type DetectedStatus } from '@/lib/status-detector';
import { getFeatureById, updateFeatureStatus } from '@/lib/session-store';
import { getPromotedFeatures } from '@/lib/feature-store';
import { getFeatureRewards, type FeatureReward, type TShirtSize } from '@/lib/feature-rewards';
import FeatureCompletionCelebration from '../features/FeatureCompletionCelebration';
import { dispatchXPEvent } from '@/lib/xp-engine';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  IDEA:        { label: 'IDEA',        color: '#94A3B8', bg: '#F1F5F9' },
  SCOPING:     { label: 'SCOPING',     color: '#7C3AED', bg: '#EDE9FE' },
  PROTOTYPING: { label: 'PROTOTYPING', color: '#2563EB', bg: '#DBEAFE' },
  BUILDING:    { label: 'BUILDING',    color: '#D97706', bg: '#FEF3C7' },
  DONE:        { label: 'DONE',        color: '#16A34A', bg: '#DCFCE7' },
  PARKED:      { label: 'PARKED',      color: '#DC2626', bg: '#FEE2E2' },
};

const SIZE_CONFIG: Record<string, { color: string }> = {
  XS: { color: '#64748B' },
  S:  { color: '#16A34A' },
  M:  { color: '#2563EB' },
  L:  { color: '#D97706' },
  XL: { color: '#DC2626' },
};

const TOOL_CONFIG: Record<string, { color: string }> = {
  v0:      { color: '#000000' },
  Cursor:  { color: '#2563EB' },
  Bolt:    { color: '#D97706' },
  ChatGPT: { color: '#10A37F' },
  Claude:  { color: '#D4762A' },
  Other:   { color: '#64748B' },
};

/* Inline reference data for feature and prompt lookups */
const FEATURES_LOOKUP: Record<string, { title: string; status: string; size: string | null }> = {
  f1:  { title: 'Carrier rate comparison',     status: 'BUILDING',     size: 'L' },
  f4:  { title: 'CO2 emissions report',        status: 'IDEA',         size: 'S' },
  f5:  { title: 'Customs doc generator',       status: 'BUILDING',     size: 'XL' },
  f6:  { title: 'Real-time tracking webhooks', status: 'DONE',         size: 'M' },
  f7:  { title: 'Multi-currency rate cards',   status: 'SCOPING',      size: 'L' },
  f10: { title: 'Lane performance dashboard',  status: 'PROTOTYPING',  size: 'M' },
  f12: { title: 'Spot rate request flow',      status: 'IDEA',         size: null },
};

const PROMPTS_LOOKUP: Record<string, { title: string; tool: string; quality: number }> = {
  p1: { title: 'Rate card comparison table',          tool: 'v0',     quality: 5 },
  p3: { title: 'Customs document form validation',    tool: 'Claude', quality: 3 },
  p4: { title: 'CO2 emissions calculator hook',       tool: 'Cursor', quality: 5 },
  p7: { title: 'Lane performance recharts dashboard', tool: 'v0',     quality: 4 },
  p8: { title: 'Webhook event handler',               tool: 'Cursor', quality: 5 },
  p9: { title: 'Spot rate request email parser',      tool: 'Claude', quality: 4 },
};

/* ------------------------------------------------------------------ */
/*  Save indicator config                                               */
/* ------------------------------------------------------------------ */
const SAVE_MSG = {
  saved:    { text: 'Saved ✓',            color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
  closed:   { text: 'Session closed ✓',   color: '#DC2626', border: '#FECACA', bg: '#FEF2F2' },
  reopened: { text: 'Session reopened ✓', color: '#2563EB', border: '#BFDBFE', bg: '#EFF6FF' },
} as const;

type SaveMsgType = keyof typeof SAVE_MSG;

/* ------------------------------------------------------------------ */
/*  Date helper                                                         */
/* ------------------------------------------------------------------ */
function formatFullDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday}, ${day} ${monthName} ${year}`;
}

/* ------------------------------------------------------------------ */
/*  Shared label style                                                  */
/* ------------------------------------------------------------------ */
function sectionLabel(cyber: boolean): React.CSSProperties {
  return {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 700,
    color: cyber ? '#6B7280' : '#94A3B8',
    letterSpacing: cyber ? '0.15em' : '0.06em',
    marginBottom: 8,
    fontFamily: cyber ? "'JetBrains Mono', monospace" : 'var(--font-dm-sans)',
    display: 'block',
  };
}

/* ------------------------------------------------------------------ */
/*  SessionDetail                                                       */
/* ------------------------------------------------------------------ */
interface SessionDetailProps {
  session: VibeSession | null;
  onUpdate: (updated: VibeSession) => void;
}

export default function SessionDetail({ session, onUpdate }: SessionDetailProps) {
  if (!session) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
        }}
      >
        <Zap size={48} style={{ color: '#CBD5E1' }} />
        <div
          style={{
            fontSize: 14,
            color: '#94A3B8',
            marginTop: 12,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Select a session
        </div>
      </div>
    );
  }

  return <SessionDetailInner session={session} onUpdate={onUpdate} />;
}

/* Inner component — remounted via key when session changes */
function SessionDetailInner({
  session,
  onUpdate,
}: {
  session: VibeSession;
  onUpdate: (updated: VibeSession) => void;
}) {
  const isClosed = session.status === 'CLOSED';
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  /* ── Theme colors ── */
  const C = {
    panelBg:      isCyber ? '#111118'  : '#FFFFFF',
    topBarBg:     isCyber ? '#16161E'  : '#FFFFFF',
    border:       isCyber ? '#3B4B3D'  : '#E2E8F0',
    borderSubtle: isCyber ? '#2A2A3E'  : '#F1F5F9',
    title:        isCyber ? '#F0FFF4'  : '#0F172A',
    body:         isCyber ? '#B9CBB9'  : '#0F172A',
    bodyDim:      isCyber ? '#4B5563'  : '#475569',
    meta:         isCyber ? '#6B7280'  : '#94A3B8',
    inputBg:      isCyber ? '#0E0E16'  : '#F1F5F9',
    inputBgFocus: isCyber ? '#0A0A12'  : '#FFFFFF',
    cardBg:       isCyber ? '#16161E'  : '#F8FAFC',
    cardBorder:   isCyber ? '#3B4B3D'  : '#E2E8F0',
    chipBg:       isCyber ? '#1A1A28'  : '#FFFFFF',
    accent:       isCyber ? '#00D4FF'  : '#2563EB',
    label:        isCyber ? '#6B7280'  : '#94A3B8',
  };

  /* ── Derive current SessionDay ── */
  const currentDay = session.sessions?.length
    ? session.sessions[session.sessions.length - 1]
    : null;

  /* ── Local state ── */
  const [localTitle, setLocalTitle] = useState(session.title);
  const [localGoal, setLocalGoal] = useState(session.goal);
  const [localDuration, setLocalDuration] = useState(String(session.duration));
  const [editingDuration, setEditingDuration] = useState(false);
  const [localProtoUrl, setLocalProtoUrl] = useState(session.prototypeUrl ?? '');
  /* Notes: if OPEN write to current SessionDay; if CLOSED show root summary */
  const [localWorked, setLocalWorked] = useState(
    !isClosed && currentDay ? currentDay.notesWorked : session.notes.worked
  );
  const [localImprove, setLocalImprove] = useState(
    !isClosed && currentDay ? currentDay.notesToImprove : session.notes.improve
  );
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(session.backlogItems);
  const [jiraSyncedIds, setJiraSyncedIds] = useState<string[]>(session.jiraSyncedIds);
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [savedVisible, setSavedVisible] = useState(false);
  const [savedMsgType, setSavedMsgType] = useState<SaveMsgType>('saved');
  const [syncedVisible, setSyncedVisible] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [closeModal, setCloseModal] = useState<{
    open: boolean;
    featureId: string | null;
    featureTitle: string;
    featureSize: Feature['size'];
    detected: DetectedStatus | null;
    selectedStatus: string;
    currentFeatureStatus: string;
  }>({ open: false, featureId: null, featureTitle: '', featureSize: null, detected: null, selectedStatus: 'IDEA', currentFeatureStatus: 'IDEA' });
  const [celebrationFeature, setCelebrationFeature] = useState<Feature | null>(null);
  const [celebrationReward, setCelebrationReward] = useState<FeatureReward | null>(null);
  /* Multi-day state */
  const [sessionTimer, setSessionTimer] = useState(0); // minutes since this component mounted
  const [daysExpanded, setDaysExpanded] = useState(true);
  const [statusHistoryOpen, setStatusHistoryOpen] = useState(false);

  /* ── Compute total time from actual SessionDay records ── */
  const realTotalMinutes = useMemo(() => {
    const daysTotal = (session.sessions ?? []).reduce(
      (sum, d) => sum + (d.minutesLogged ?? 0),
      0
    );
    return Math.max(daysTotal, session.totalMinutes ?? 0);
  }, [session]);

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateCurrentDayTimeRef = useRef<(ticks: number) => void>(() => {});

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    };
  }, []);

  /* ── Timer: increment every minute when session is OPEN ── */
  function updateCurrentDayTime(ticks: number) {
    const days = session.sessions ?? [];
    if (!days.length) return;
    const updatedDays = days.map((d, i) =>
      i === days.length - 1 ? { ...d, minutesLogged: (d.minutesLogged ?? 0) + 5 } : d
    );
    const totalMinutes = updatedDays.reduce((sum, d) => sum + (d.minutesLogged ?? 0), 0);
    onUpdate({ ...session, sessions: updatedDays, totalMinutes, lastActiveAt: new Date().toISOString().slice(0, 10) });
  }

  updateCurrentDayTimeRef.current = updateCurrentDayTime;

  useEffect(() => {
    if (session.status !== 'OPEN') return;
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setSessionTimer(ticks);
      if (ticks % 5 === 0) updateCurrentDayTimeRef.current(ticks);
    }, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  /* ── Show save indicator ── */
  function showSave(type: SaveMsgType) {
    setSavedMsgType(type);
    setSavedVisible(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSavedVisible(false), 3000);
  }

  /* ── Save helper ── */
  function save(overrides: Partial<VibeSession> = {}, msgType: SaveMsgType = 'saved') {
    /* When OPEN, persist notes to the current SessionDay */
    let updatedSessions = session.sessions ?? [];
    if (session.status === 'OPEN' && updatedSessions.length > 0) {
      updatedSessions = updatedSessions.map((d, i) =>
        i === updatedSessions.length - 1
          ? { ...d, notesWorked: localWorked, notesToImprove: localImprove }
          : d
      );
    }
    const updated: VibeSession = {
      ...session,
      title: localTitle,
      goal: localGoal,
      duration: parseFloat(localDuration) || session.duration,
      prototypeUrl: localProtoUrl || undefined,
      notes: { worked: localWorked, improve: localImprove },
      backlogItems,
      jiraSyncedIds,
      sessions: updatedSessions,
      ...overrides,
    };
    onUpdate(updated);
    showSave(msgType);
  }

  /* ── Add backlog item ── */
  function commitNewItem() {
    if (!newItemTitle.trim()) {
      setAddingItem(false);
      setNewItemTitle('');
      return;
    }
    const newItem: BacklogItem = {
      id: `b-${Date.now()}`,
      title: newItemTitle.trim(),
      status: 'TODO',
      jiraId: '',
    };
    const updated = [...backlogItems, newItem];
    setBacklogItems(updated);
    setNewItemTitle('');
    setAddingItem(false);
    save({ backlogItems: updated });
  }

  /* ── Jira sync ── */
  function handleJiraSync() {
    const newIds = backlogItems
      .map((b) => b.jiraId)
      .filter((id): id is string => !!id);
    const merged = Array.from(new Set([...jiraSyncedIds, ...newIds]));
    setJiraSyncedIds(merged);
    save({ jiraSyncedIds: merged });
    setSyncedVisible(true);
    vibeToast.success('Synced to Jira successfully');
    if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
    syncedTimerRef.current = setTimeout(() => setSyncedVisible(false), 3000);
  }

  const saveMsgCfg = SAVE_MSG[savedMsgType];

  /* ── Session status order for the advance modal ── */
  const SESSION_STATUS_ORDER = ['IDEA', 'SCOPING', 'PROTOTYPING', 'BUILDING', 'DONE'] as const;

  const MODAL_STATUS_COLORS: Record<string, { color: string; bg: string; cyberColor: string; cyberBg: string }> = {
    IDEA:        { color: '#64748B', bg: '#F1F5F9', cyberColor: '#94A3B8', cyberBg: 'rgba(148,163,184,0.1)' },
    SCOPING:     { color: '#7C3AED', bg: '#EDE9FE', cyberColor: '#BF00FF', cyberBg: 'rgba(191,0,255,0.1)' },
    PROTOTYPING: { color: '#2563EB', bg: '#DBEAFE', cyberColor: '#00D4FF', cyberBg: 'rgba(0,212,255,0.1)' },
    BUILDING:    { color: '#D97706', bg: '#FEF3C7', cyberColor: '#FFB800', cyberBg: 'rgba(255,184,0,0.1)' },
    DONE:        { color: '#16A34A', bg: '#DCFCE7', cyberColor: '#00FF88', cyberBg: 'rgba(0,255,136,0.1)' },
  };

  const CONFIDENCE_COLORS = {
    HIGH:   { color: '#16A34A', bg: '#DCFCE7',  cyber: '#00FF88' },
    MEDIUM: { color: '#D97706', bg: '#FEF3C7',  cyber: '#FFB800' },
    LOW:    { color: '#64748B', bg: '#F1F5F9',  cyber: '#6B7280' },
  };

  /* ── Reopen session: create a new SessionDay ── */
  function handleReopenSession() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const existingDays = session.sessions ?? [];
    const newDay: SessionDay = {
      id: `day-${session.id}-${existingDays.length + 1}`,
      date: today,
      startedAt: now.toISOString(),
      minutesLogged: 0,
      notesWorked: '',
      notesToImprove: '',
      xpEarned: 0,
    };
    setLocalWorked('');
    setLocalImprove('');
    setSessionTimer(0);
    save(
      {
        status: 'OPEN',
        sessions: [...existingDays, newDay],
        lastActiveAt: today,
      },
      'reopened'
    );
    dispatchXPEvent({ id: `reopen-${Date.now()}`, label: 'Session continued', amount: 25, timestamp: Date.now() });
    vibeToast.info('Session reopened');
    if (isCyber) vibeToast.ai('✦ Session continued — new day logged');
  }

  /* ── Resolve the primary linked feature, applying status overrides ── */
  function getLinkedFeature(): { id: string; title: string; status: string; size: Feature['size'] } | null {
    const featureId = session.linkedFeatureIds?.[0];
    if (!featureId) return null;
    // Use session-store which checks promoted → sample → overrides
    const feat = getFeatureById(featureId);
    if (feat) return { id: feat.id, title: feat.title, status: feat.status, size: feat.size };
    // Fallback to inline lookup for sessions with legacy IDs (f1, f4, etc.)
    const lookup = FEATURES_LOOKUP[featureId];
    if (lookup) {
      try {
        const overrides: Record<string, string> = JSON.parse(
          localStorage.getItem('vibeflow-status-overrides') || '{}'
        );
        return { id: featureId, title: lookup.title, size: lookup.size as Feature['size'], status: overrides[featureId] ?? lookup.status };
      } catch {
        return { id: featureId, title: lookup.title, size: lookup.size as Feature['size'], status: lookup.status };
      }
    }
    return null;
  }

  function handleCloseSession() {
    const primaryFeatureId = session.linkedFeatureIds[0];
    if (primaryFeatureId) {
      const currentFeature = getLinkedFeature();
      const detected = detectFeatureStatus(session, currentFeature?.status ?? 'IDEA');
      setCloseModal({
        open: true,
        featureId: primaryFeatureId,
        featureTitle: currentFeature?.title ?? primaryFeatureId,
        featureSize: currentFeature?.size ?? null,
        detected,
        selectedStatus: detected.status,
        currentFeatureStatus: currentFeature?.status ?? 'IDEA',
      });
    } else {
      save({ status: 'CLOSED', ...finalizeCurrentDay() }, 'closed');
      vibeToast.info('Session closed');
    }
  }

  /* Finalize the current SessionDay when closing */
  function finalizeCurrentDay(): Partial<VibeSession> {
    const now = new Date().toISOString();
    const existingDays = session.sessions ?? [];
    if (!existingDays.length) return {};
    const updatedDays = existingDays.map((d, i) =>
      i === existingDays.length - 1
        ? {
            ...d,
            endedAt: now,
            minutesLogged: (d.minutesLogged ?? 0) + sessionTimer,
            notesWorked: localWorked,
            notesToImprove: localImprove,
          }
        : d
    );
    const totalMinutes = updatedDays.reduce((sum, d) => sum + (d.minutesLogged ?? 0), 0);
    return { sessions: updatedDays, totalMinutes, lastActiveAt: now.slice(0, 10) };
  }

  function handleCloseAndAdvance() {
    const { featureId, detected, selectedStatus, featureSize } = closeModal;
    const sessionXP = Math.round(session.duration * 25);
    const xpBonus = detected?.xpBonus ?? 0;

    save({ status: 'CLOSED', ...finalizeCurrentDay() }, 'closed');

    if (featureId) {
      updateFeatureStatus(featureId, selectedStatus);

      window.dispatchEvent(
        new CustomEvent('feature-status-updated', {
          detail: { featureId, newStatus: selectedStatus },
        })
      );

      dispatchXPEvent({ id: `session-close-${Date.now()}`, label: 'Session completed', amount: sessionXP, timestamp: Date.now() });
      if (xpBonus > 0) {
        dispatchXPEvent({ id: `status-advance-${Date.now()}`, label: `Feature advanced to ${selectedStatus}`, amount: xpBonus, timestamp: Date.now() });
      }

      if (selectedStatus === 'DONE') {
        const features = getPromotedFeatures();
        const feat = features.find((f) => f.id === featureId);
        if (feat && isCyber) {
          const rewards = getFeatureRewards();
          const size = (featureSize ?? 'M') as TShirtSize;
          const reward = rewards[size] ?? rewards['M'];
          setCelebrationFeature({ ...feat, status: 'DONE' });
          setCelebrationReward(reward);
        }
      }
    }

    setCloseModal({ open: false, featureId: null, featureTitle: '', featureSize: null, detected: null, selectedStatus: 'IDEA', currentFeatureStatus: 'IDEA' });
    const isAdvancing = selectedStatus !== closeModal.currentFeatureStatus;
    if (isAdvancing) {
      vibeToast.success(`Session closed · Feature advanced to ${selectedStatus}`);
    } else {
      vibeToast.info('Session closed · Status unchanged');
    }
    if (isCyber) vibeToast.ai(`✦ ${detected?.reason ?? 'Session complete'}`);
  }

  function handleCloseWithoutAdvancing() {
    save({ status: 'CLOSED', ...finalizeCurrentDay() }, 'closed');
    setCloseModal({ open: false, featureId: null, featureTitle: '', featureSize: null, detected: null, selectedStatus: 'IDEA', currentFeatureStatus: 'IDEA' });
    vibeToast.info('Session closed');
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: C.panelBg, position: 'relative' }}>

      {/* ── Saved indicator ── */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 24,
          zIndex: 100,
          background: saveMsgCfg.bg,
          border: `1px solid ${saveMsgCfg.border}`,
          color: saveMsgCfg.color,
          fontSize: 12,
          padding: '4px 12px',
          fontFamily: 'var(--font-dm-sans)',
          opacity: savedVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
          pointerEvents: 'none',
        }}
      >
        {saveMsgCfg.text}
      </div>

      {/* ── Synced toast ── */}
      {syncedVisible && (
        <div
          style={{
            position: 'fixed',
            top: 44,
            right: 24,
            zIndex: 100,
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#2563EB',
            fontSize: 12,
            padding: '4px 12px',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Synced to Jira ✓
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div
        style={{
          padding: '24px 24px 16px',
          background: C.topBarBg,
          borderBottom: `1px solid ${C.borderSubtle}`,
        }}
      >
        {/* Title row + Close/Reopen button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            value={localTitle}
            onChange={(e) => { if (!isClosed) setLocalTitle(e.target.value); }}
            onBlur={() => { if (!isClosed) save({ title: localTitle }); }}
            readOnly={isClosed}
            placeholder="Session title..."
            style={{
              flex: 1,
              fontSize: 20,
              fontWeight: 700,
              color: C.title,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              padding: 0,
              cursor: isClosed ? 'default' : 'text',
            }}
          />

          {/* Status button */}
          {isClosed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 28,
                  paddingLeft: 12,
                  paddingRight: 12,
                  background: C.cardBg,
                  border: `1px solid ${C.border}`,
                  color: C.meta,
                  fontSize: 12,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              >
                ● Closed
              </div>
              <button
                onClick={handleReopenSession}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.accent,
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              >
                Reopen
              </button>
            </div>
          ) : (
            <button
              onClick={handleCloseSession}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 28,
                paddingLeft: 12,
                paddingRight: 12,
                background: closeHovered ? (isCyber ? 'rgba(220,38,38,0.1)' : '#FEF2F2') : C.panelBg,
                border: `1px solid ${closeHovered ? '#DC2626' : C.border}`,
                color: closeHovered ? '#DC2626' : C.bodyDim,
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 0,
                fontFamily: 'var(--font-dm-sans)',
                flexShrink: 0,
                transition: 'all 100ms ease',
              }}
            >
              <CheckSquare size={16} />
              Close Session
            </button>
          )}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 8,
          }}
        >
          {/* Date */}
          <span style={{ fontSize: 12, color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)' }}>
            {formatFullDate(session.date)}
          </span>

          {/* Total time */}
          {realTotalMinutes > 0 && (
            <span style={{ fontSize: 12, color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)' }}>
              {isCyber
                ? `${Math.floor(realTotalMinutes / 60)}H${realTotalMinutes % 60 > 0 ? `${realTotalMinutes % 60}M` : ''}_TOTAL`
                : `${Math.floor(realTotalMinutes / 60)}h ${realTotalMinutes % 60 > 0 ? `${realTotalMinutes % 60}m` : ''} total`}
            </span>
          )}

          {/* Live timer */}
          {!isClosed && sessionTimer > 0 && (
            <span
              style={{
                fontSize: 11,
                color: isCyber ? '#00FF88' : '#16A34A',
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontWeight: 600,
              }}
            >
              {isCyber ? `● LIVE +${sessionTimer}m` : `● Live +${sessionTimer}m`}
            </span>
          )}

          {/* Duration click-to-edit */}
          {!isClosed && editingDuration ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                autoFocus
                type="number"
                min={0.5}
                step={0.5}
                value={localDuration}
                onChange={(e) => setLocalDuration(e.target.value)}
                onBlur={() => {
                  setEditingDuration(false);
                  save({ duration: parseFloat(localDuration) || session.duration });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingDuration(false);
                    save({ duration: parseFloat(localDuration) || session.duration });
                  }
                }}
                style={{
                  width: 60,
                  height: 24,
                  border: `1px solid ${C.border}`,
                  background: C.inputBg,
                  color: C.body,
                  fontSize: 12,
                  paddingLeft: 8,
                  outline: 'none',
                  borderRadius: 0,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              />
              <span style={{ fontSize: 12, color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)' }}>hours</span>
            </span>
          ) : (
            <span
              onClick={() => { if (!isClosed) setEditingDuration(true); }}
              style={{
                fontSize: 12,
                color: C.meta,
                cursor: isClosed ? 'default' : 'text',
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                borderBottom: isClosed ? 'none' : `1px dashed ${C.border}`,
              }}
            >
              {localDuration} hours
            </span>
          )}
        </div>
      </div>

      {/* ── Read-only banner — CLOSED only ── */}
      {isClosed && (
        <div
          style={{
            background: C.cardBg,
            borderBottom: `1px solid ${C.border}`,
            padding: '8px 24px',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: C.meta,
              fontStyle: isCyber ? 'normal' : 'italic',
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
            }}
          >
            {isCyber ? '// SESSION CLOSED — reopen to edit' : 'This session is closed. Reopen to make edits.'}
          </span>
        </div>
      )}

      {/* ── SECTIONS ── */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── SESSION GOAL ── */}
        <div>
          <span style={sectionLabel(isCyber)}>{isCyber ? '// SESSION_GOAL' : 'Session Goal'}</span>
          <textarea
            value={localGoal}
            onChange={(e) => { if (!isClosed) setLocalGoal(e.target.value); }}
            onBlur={() => { if (!isClosed) save({ goal: localGoal }); }}
            readOnly={isClosed}
            placeholder="What are you trying to build in this session?"
            rows={3}
            style={{
              width: '100%',
              minHeight: 72,
              border: 'none',
              borderLeft: `3px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
              outline: 'none',
              resize: 'none',
              paddingLeft: 12,
              paddingTop: 4,
              paddingBottom: 4,
              paddingRight: 0,
              fontSize: 14,
              color: isClosed ? C.bodyDim : C.body,
              lineHeight: 1.6,
              fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
              background: 'transparent',
              cursor: isClosed ? 'default' : 'text',
            }}
          />
        </div>

        {/* ── LINKED FEATURES ── */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ ...sectionLabel(isCyber), margin: 0 }}>{isCyber ? '// LINKED_FEATURES' : 'Linked Features'}</span>
            <button
              onClick={() => setFeaturesOpen((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                color: C.meta,
              }}
            >
              {featuresOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {featuresOpen && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {session.linkedFeatureIds.map((fid) => {
                const feat = FEATURES_LOOKUP[fid];
                if (!feat) return null;
                const statusCfg = STATUS_CONFIG[feat.status] ?? STATUS_CONFIG.IDEA;
                return (
                  <div
                    key={fid}
                    style={{
                      width: 140,
                      flexShrink: 0,
                      border: `1px solid ${C.cardBorder}`,
                      background: isCyber ? C.cardBg : 'transparent',
                      padding: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: isCyber ? statusCfg.color : statusCfg.color,
                        background: isCyber ? `${statusCfg.color}1A` : statusCfg.bg,
                        border: isCyber ? `1px solid ${statusCfg.color}44` : 'none',
                        padding: '1px 6px',
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        borderRadius: isCyber ? 3 : 0,
                      }}
                    >
                      {feat.status}
                    </span>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.body,
                        marginTop: 4,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      }}
                    >
                      {feat.title}
                    </div>
                    {feat.size && (
                      <span
                        style={{
                          fontSize: 10,
                          color: '#FFFFFF',
                          background: SIZE_CONFIG[feat.size]?.color ?? '#94A3B8',
                          padding: '1px 6px',
                          marginTop: 4,
                          display: 'inline-block',
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontWeight: 600,
                        }}
                      >
                        {feat.size}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* + Link feature — hide when closed */}
              {!isClosed && (
                <div
                  style={{
                    width: 120,
                    flexShrink: 0,
                    border: `1px dashed ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: isCyber ? '#00FF88' : C.meta,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  }}
                >
                  + Link feature
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PROMPTS USED ── */}
        <div>
          <span style={sectionLabel(isCyber)}>{isCyber ? '// PROMPTS_USED' : 'Prompts Used'}</span>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {session.promptIds.map((pid) => {
              const prompt = PROMPTS_LOOKUP[pid];
              if (!prompt) return null;
              const toolColor = TOOL_CONFIG[prompt.tool]?.color ?? '#64748B';
              return (
                <div
                  key={pid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    border: `1px solid ${C.cardBorder}`,
                    padding: '6px 8px',
                    background: C.chipBg,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: toolColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: C.body,
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                    }}
                  >
                    {prompt.title.slice(0, 20)}{prompt.title.length > 20 ? '...' : ''}
                  </span>
                  <span style={{ fontSize: 10, flexShrink: 0 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{ color: s <= prompt.quality ? '#D97706' : C.border }}>★</span>
                    ))}
                  </span>
                </div>
              );
            })}

            {/* + Add prompt — hide when closed */}
            {!isClosed && (
              <div
                style={{
                  border: `1px dashed ${C.border}`,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: isCyber ? '#00FF88' : C.meta,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              >
                + Add prompt
              </div>
            )}
          </div>
        </div>

        {/* ── PROTOTYPE OUTPUT ── */}
        <div>
          <span style={sectionLabel(isCyber)}>{isCyber ? '// PROTOTYPE_OUTPUT' : 'Prototype Output'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={localProtoUrl}
              onChange={(e) => { if (!isClosed) setLocalProtoUrl(e.target.value); }}
              onBlur={() => { if (!isClosed) save({ prototypeUrl: localProtoUrl || undefined }); }}
              readOnly={isClosed}
              placeholder="https://v0.dev/t/..."
              style={{
                flex: 1,
                height: 32,
                border: `1px solid ${C.border}`,
                background: isClosed ? 'transparent' : C.inputBg,
                paddingLeft: 12,
                paddingRight: 12,
                fontSize: 13,
                outline: 'none',
                borderRadius: 0,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                color: C.body,
                cursor: isClosed ? 'default' : 'text',
              }}
              onFocus={(e) => { if (!isClosed) e.currentTarget.style.borderColor = C.accent; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = C.border; }}
            />
            <button
              disabled={!localProtoUrl}
              onClick={() => localProtoUrl && window.open(localProtoUrl, '_blank')}
              style={{
                height: 32,
                paddingLeft: 12,
                paddingRight: 12,
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                color: localProtoUrl ? C.body : C.meta,
                fontSize: 13,
                cursor: localProtoUrl ? 'pointer' : 'not-allowed',
                borderRadius: 0,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                flexShrink: 0,
              }}
            >
              Open ↗
            </button>
          </div>

          {/* Browser mockup */}
          {localProtoUrl && (
            <div style={{ marginTop: 8, border: `1px solid ${C.border}` }}>
              <div
                style={{
                  background: C.inputBg,
                  height: 28,
                  paddingLeft: 12,
                  paddingRight: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {['#DC2626', '#D97706', '#16A34A'].map((c) => (
                    <div key={c} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: isCyber ? '#00D4FF' : '#94A3B8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  }}
                >
                  {localProtoUrl}
                </span>
              </div>
              <div
                style={{
                  height: 80,
                  background: C.cardBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 11, color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)' }}>
                  Preview not available
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── SESSION DAYS ── */}
        {(session.sessions?.length ?? 0) > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ ...sectionLabel(isCyber), margin: 0 }}>
                {isCyber ? '// SESSION_DAYS' : `Session Days (${session.sessions!.length})`}
              </span>
              <button
                onClick={() => setDaysExpanded((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: C.meta,
                }}
              >
                {daysExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {daysExpanded && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  borderLeft: `2px solid ${C.borderSubtle}`,
                  paddingLeft: 12,
                }}
              >
                {session.sessions!.map((day, idx) => {
                  const isCurrentDay = idx === session.sessions!.length - 1 && !isClosed;
                  const durationHrs = Math.floor(day.minutesLogged / 60);
                  const durationMins = day.minutesLogged % 60;
                  const durationLabel =
                    isCurrentDay && day.minutesLogged === 0
                      ? (isCyber ? '● ACTIVE' : '● Active')
                      : durationHrs > 0
                        ? `${durationHrs}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
                        : `${durationMins}m`;
                  return (
                    <div
                      key={day.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 0',
                        borderBottom: `1px solid ${C.borderSubtle}`,
                      }}
                    >
                      {/* Date dot */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: isCurrentDay
                            ? (isCyber ? '#00FF88' : '#16A34A')
                            : C.meta,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: isCurrentDay ? (isCyber ? '#F0FFF4' : '#0F172A') : C.meta,
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontWeight: isCurrentDay ? 600 : 400,
                          flex: 1,
                        }}
                      >
                        {day.date}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: C.meta,
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        }}
                      >
                        {isCyber ? durationLabel.replace('h', 'H').replace('m', 'M') : durationLabel}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: isCyber ? '#00FF88' : '#16A34A',
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontWeight: 600,
                        }}
                      >
                        +{day.xpEarned} XP
                      </span>
                      {isCurrentDay && (
                        <span
                          style={{
                            fontSize: 9,
                            color: isCyber ? '#00FF88' : '#16A34A',
                            fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {isCyber ? 'ACTIVE' : 'Active'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SESSION NOTES ── */}
        <div>
          <span style={sectionLabel(isCyber)}>
            {isCyber
              ? (isClosed ? '// FINAL_NOTES' : '// TODAYS_NOTES')
              : (isClosed ? 'Final Notes' : "Today's Notes")}
          </span>
          <div className="notes-grid">
            {/* What worked */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: isCyber ? '#00FF88' : '#16A34A',
                  letterSpacing: isCyber ? '0.15em' : '0.06em',
                  marginBottom: 6,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              >
                {isCyber ? '// WHAT_WORKED' : 'What worked'}
              </span>
              <textarea
                value={localWorked}
                onChange={(e) => { if (!isClosed) setLocalWorked(e.target.value); }}
                onBlur={() => { if (!isClosed) save({ notes: { worked: localWorked, improve: localImprove } }); }}
                readOnly={isClosed}
                placeholder={isCyber ? '// what went well...' : 'What went well...'}
                style={{
                  width: '100%',
                  minHeight: 100,
                  border: 'none',
                  borderLeft: `3px solid ${isCyber ? '#00FF88' : '#16A34A'}`,
                  outline: 'none',
                  resize: 'none',
                  paddingLeft: 12,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingRight: 0,
                  fontSize: 13,
                  color: isClosed ? C.bodyDim : C.body,
                  lineHeight: 1.6,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  background: 'transparent',
                  cursor: isClosed ? 'default' : 'text',
                }}
              />
            </div>

            {/* What to improve */}
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: isCyber ? '#FFB800' : '#D97706',
                  letterSpacing: isCyber ? '0.15em' : '0.06em',
                  marginBottom: 6,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                }}
              >
                {isCyber ? '// WHAT_TO_IMPROVE' : 'What to improve'}
              </span>
              <textarea
                value={localImprove}
                onChange={(e) => { if (!isClosed) setLocalImprove(e.target.value); }}
                onBlur={() => { if (!isClosed) save({ notes: { worked: localWorked, improve: localImprove } }); }}
                readOnly={isClosed}
                placeholder={isCyber ? '// what to do better next time...' : 'What to do better next time...'}
                style={{
                  width: '100%',
                  minHeight: 100,
                  border: 'none',
                  borderLeft: `3px solid ${isCyber ? '#FFB800' : '#D97706'}`,
                  outline: 'none',
                  resize: 'none',
                  paddingLeft: 12,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingRight: 0,
                  fontSize: 13,
                  color: isClosed ? C.bodyDim : C.body,
                  lineHeight: 1.6,
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  background: 'transparent',
                  cursor: isClosed ? 'default' : 'text',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── BACKLOG ITEMS ── */}
        <div>
          {isCyber ? (
            <>
              {/* Cyber section header */}
              <span
                style={{
                  display: 'block',
                  fontFamily: MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#6B7280',
                  marginBottom: 12,
                }}
              >
                // BACKLOG_ITEMS
              </span>

              {/* Cyber table wrapper */}
              <div
                style={{
                  background: '#0E0E16',
                  border: '1px solid #3B4B3D',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                {/* Cyber header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    background: '#16161E',
                    borderBottom: '1px solid #3B4B3D',
                  }}
                >
                  <span style={{ flex: 1, fontFamily: MONO, fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em' }}>TASK</span>
                  <span style={{ width: 112, fontFamily: MONO, fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em', flexShrink: 0 }}>STATUS</span>
                  <span style={{ width: 96, fontFamily: MONO, fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em', flexShrink: 0 }}>JIRA</span>
                  <span style={{ width: 32, flexShrink: 0 }} />
                </div>

                {/* Cyber rows */}
                {backlogItems.map((item) => (
                  <BacklogItemRow
                    key={item.id}
                    item={item}
                    readOnly={isClosed}
                    isCyber
                    onChange={(updated) => {
                      const next = backlogItems.map((b) => b.id === updated.id ? updated : b);
                      setBacklogItems(next);
                      save({ backlogItems: next });
                    }}
                  />
                ))}

                {/* Cyber add row */}
                {!isClosed && (
                  addingItem ? (
                    <div style={{ padding: '12px 16px', borderTop: '1px dashed #2A2A3E' }}>
                      <input
                        autoFocus
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitNewItem();
                          if (e.key === 'Escape') { setAddingItem(false); setNewItemTitle(''); }
                        }}
                        onBlur={commitNewItem}
                        placeholder="// task description..."
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #00FF88',
                          outline: 'none',
                          fontFamily: MONO,
                          fontSize: 13,
                          color: '#F0FFF4',
                          padding: '2px 0',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{ padding: '12px 16px', borderTop: '1px dashed #2A2A3E', cursor: 'pointer' }}
                      onClick={() => setAddingItem(true)}
                    >
                      <span
                        style={{ fontFamily: MONO, fontSize: 12, color: '#00FF88' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '0.7'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '1'; }}
                      >
                        + Create backlog item
                      </span>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <>
              {/* Default section header */}
              <span style={sectionLabel(isCyber)}>Backlog Items</span>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ height: 28, borderBottom: '1px solid #E2E8F0' }}>
                    {['TASK', 'STATUS', 'JIRA'].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                          color: '#94A3B8',
                          fontWeight: 700,
                          textAlign: 'left',
                          fontFamily: 'var(--font-dm-sans)',
                          letterSpacing: '0.06em',
                          paddingBottom: 4,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {backlogItems.map((item) => (
                    <BacklogItemRow
                      key={item.id}
                      item={item}
                      readOnly={isClosed}
                      onChange={(updated) => {
                        const next = backlogItems.map((b) => b.id === updated.id ? updated : b);
                        setBacklogItems(next);
                        save({ backlogItems: next });
                      }}
                    />
                  ))}

                  {/* Add row — hide when closed */}
                  {!isClosed && (
                    addingItem ? (
                      <tr style={{ height: 32 }}>
                        <td colSpan={3}>
                          <input
                            autoFocus
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitNewItem();
                              if (e.key === 'Escape') { setAddingItem(false); setNewItemTitle(''); }
                            }}
                            onBlur={commitNewItem}
                            placeholder="New backlog item title..."
                            style={{
                              width: '100%',
                              height: 28,
                              border: '1px solid #E2E8F0',
                              background: '#F1F5F9',
                              paddingLeft: 8,
                              fontSize: 13,
                              outline: 'none',
                              borderRadius: 0,
                              fontFamily: 'var(--font-dm-sans)',
                              color: '#0F172A',
                            }}
                          />
                        </td>
                      </tr>
                    ) : (
                      <tr style={{ height: 32, borderTop: '1px dashed #E2E8F0' }}>
                        <td colSpan={3}>
                          <button
                            onClick={() => setAddingItem(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 12,
                              color: '#2563EB',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'var(--font-dm-sans)',
                            }}
                          >
                            + Create backlog item
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* ── JIRA SYNC ── */}
        <div>
          {isCyber ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: '#6B7280' }}>
                  {jiraSyncedIds.length > 0
                    ? `${jiraSyncedIds.length} item${jiraSyncedIds.length !== 1 ? 's' : ''} synced to Jira`
                    : 'Not synced yet'}
                </span>
                {!isClosed && (
                  <button
                    onClick={handleJiraSync}
                    style={{
                      background: 'transparent',
                      border: '1px solid #3B4B3D',
                      color: '#6B7280',
                      fontFamily: MONO,
                      fontSize: 12,
                      cursor: 'pointer',
                      borderRadius: 4,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00D4FF';
                      e.currentTarget.style.color = '#00D4FF';
                      e.currentTarget.style.background = 'rgba(0,212,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#3B4B3D';
                      e.currentTarget.style.color = '#6B7280';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        background: '#00D4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#000000', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>J</span>
                    </div>
                    Sync to Jira
                  </button>
                )}
              </div>
              {jiraSyncedIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {jiraSyncedIds.map((id) => (
                    <span
                      key={id}
                      style={{
                        background: 'rgba(0,212,255,0.08)',
                        border: '1px solid rgba(0,212,255,0.3)',
                        color: '#00D4FF',
                        fontFamily: MONO,
                        fontSize: 10,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                  {jiraSyncedIds.length > 0
                    ? `${jiraSyncedIds.length} item${jiraSyncedIds.length !== 1 ? 's' : ''} synced to Jira`
                    : 'Not synced yet'}
                </span>
                {!isClosed && (
                  <button
                    onClick={handleJiraSync}
                    style={{
                      height: 32,
                      paddingLeft: 12,
                      paddingRight: 12,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: 13,
                      cursor: 'pointer',
                      borderRadius: 0,
                      fontFamily: 'var(--font-dm-sans)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        background: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>J</span>
                    </div>
                    Sync to Jira
                  </button>
                )}
              </div>
              {jiraSyncedIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {jiraSyncedIds.map((id) => (
                    <span
                      key={id}
                      style={{
                        background: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: 10,
                        padding: '2px 6px',
                        border: '1px solid #BFDBFE',
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── STATUS HISTORY ── */}
        {(session.autoStatusHistory?.length ?? 0) > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ ...sectionLabel(isCyber), margin: 0 }}>
                {isCyber ? '// STATUS_HISTORY' : 'Status History'}
              </span>
              <button
                onClick={() => setStatusHistoryOpen((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: C.meta,
                }}
              >
                {statusHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {statusHistoryOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {session.autoStatusHistory!.map((entry) => {
                  const fromCfg = STATUS_CONFIG[entry.fromStatus] ?? STATUS_CONFIG.IDEA;
                  const toCfg = STATUS_CONFIG[entry.toStatus] ?? STATUS_CONFIG.IDEA;
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        background: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        fontSize: 11,
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      }}
                    >
                      <span style={{ color: fromCfg.color, fontWeight: 600 }}>{entry.fromStatus}</span>
                      <span style={{ color: C.meta }}>→</span>
                      <span style={{ color: toCfg.color, fontWeight: 600 }}>{entry.toStatus}</span>
                      <span style={{ color: C.meta, flex: 1 }}>{entry.trigger}</span>
                      <span style={{ color: C.meta, fontSize: 10 }}>
                        {entry.automatic ? (isCyber ? '[AUTO]' : 'auto') : (isCyber ? '[MANUAL]' : 'manual')}
                      </span>
                      <span style={{ color: C.meta, fontSize: 10 }}>
                        {entry.timestamp.slice(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom padding */}
        <div style={{ height: 32 }} />
      </div>

      {/* Notes grid CSS */}
      <style>{`
        .notes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .notes-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── STATUS ADVANCE MODAL ── */}
      {closeModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isCyber ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 420,
              background: isCyber ? '#1A1A28' : '#FFFFFF',
              border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
              borderRadius: 8,
              padding: 32,
              boxShadow: isCyber
                ? '0 0 40px rgba(0,255,136,0.1)'
                : '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal header */}
            <div style={{ marginBottom: 20 }}>
              {isCyber ? (
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 900, color: '#00FF88' }}>
                  // SESSION_COMPLETE
                </div>
              ) : (
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Session Complete</div>
              )}
            </div>

            {/* AI detection card */}
            {closeModal.detected && (
              <div
                style={{
                  background: isCyber ? '#111118' : '#F8FAFC',
                  border: `1px solid ${isCyber ? '#2A2A3E' : '#E2E8F0'}`,
                  borderRadius: 6,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: isCyber ? '#6B7280' : '#94A3B8',
                    marginBottom: 10,
                  }}
                >
                  {isCyber ? '// STATUS_DETECTED' : '🤖 AI Status Suggestion'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {/* Detected status badge */}
                  {(() => {
                    const sc = MODAL_STATUS_COLORS[closeModal.detected.status] ?? MODAL_STATUS_COLORS.IDEA;
                    return (
                      <span
                        style={{
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontSize: 12,
                          fontWeight: 700,
                          color: isCyber ? sc.cyberColor : sc.color,
                          background: isCyber ? sc.cyberBg : sc.bg,
                          border: isCyber ? `1px solid ${sc.cyberColor}44` : 'none',
                          padding: '3px 10px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {closeModal.detected.status}
                      </span>
                    );
                  })()}
                  {/* Confidence */}
                  {(() => {
                    const cc = CONFIDENCE_COLORS[closeModal.detected.confidence];
                    return (
                      <span
                        style={{
                          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                          fontSize: 10,
                          color: isCyber ? cc.cyber : cc.color,
                          background: isCyber ? `${cc.cyber}15` : cc.bg,
                          padding: '2px 8px',
                          borderRadius: 12,
                        }}
                      >
                        {closeModal.detected.confidence}
                      </span>
                    );
                  })()}
                </div>

                <div
                  style={{
                    fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                    fontSize: 12,
                    color: isCyber ? '#6B7280' : '#64748B',
                    fontStyle: 'italic',
                  }}
                >
                  {closeModal.detected.reason}
                </div>
                {closeModal.detected.status === closeModal.currentFeatureStatus && (
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      fontSize: 11,
                      color: isCyber ? '#FFB800' : '#D97706',
                      fontWeight: 600,
                    }}
                  >
                    {isCyber ? '⚠ STATUS_UNCHANGED — need more evidence to advance' : '⚠ STATUS_UNCHANGED — more evidence needed to advance'}
                  </div>
                )}
              </div>
            )}

            {/* Move feature to label */}
            <div
              style={{
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 11,
                color: isCyber ? '#6B7280' : '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 8,
              }}
            >
              {isCyber ? '// MOVE_FEATURE_TO:' : 'Move feature to:'}
            </div>

            {/* Status selector chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {SESSION_STATUS_ORDER.map((status) => {
                const sc = MODAL_STATUS_COLORS[status] ?? MODAL_STATUS_COLORS.IDEA;
                const isSelected = closeModal.selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setCloseModal((m) => ({ ...m, selectedStatus: status }))}
                    style={{
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      fontSize: 11,
                      fontWeight: isSelected ? 700 : 400,
                      color: isSelected ? (isCyber ? sc.cyberColor : sc.color) : (isCyber ? '#6B7280' : '#94A3B8'),
                      background: isSelected ? (isCyber ? sc.cyberBg : sc.bg) : 'transparent',
                      border: isSelected
                        ? `1px solid ${isCyber ? sc.cyberColor : sc.color}`
                        : `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
                      borderRadius: 4,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      transition: 'all 100ms ease',
                      textTransform: 'uppercase',
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Size warning for DONE */}
            {closeModal.selectedStatus === 'DONE' && !closeModal.featureSize && (
              <div
                style={{
                  fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                  fontSize: 11,
                  color: isCyber ? '#FFB800' : '#D97706',
                  background: isCyber ? 'rgba(255,184,0,0.08)' : '#FEF3C7',
                  border: `1px solid ${isCyber ? 'rgba(255,184,0,0.3)' : '#FDE68A'}`,
                  borderRadius: 4,
                  padding: '6px 10px',
                  marginBottom: 16,
                }}
              >
                ⚠ Set a T-shirt size on the feature for full XP rewards.
              </div>
            )}

            {/* XP preview */}
            {(() => {
              const sessionXP = Math.round(session.duration * 25);
              const xpBonus = closeModal.detected?.xpBonus ?? 0;
              const total = sessionXP + xpBonus;
              const accentColor = isCyber ? '#00FF88' : '#7C3AED';
              return (
                <div
                  style={{
                    background: isCyber ? '#0A0A0F' : '#F5F3FF',
                    border: `1px solid ${isCyber ? '#3B4B3D' : '#DDD6FE'}`,
                    borderRadius: 6,
                    padding: '10px 14px',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: accentColor,
                      marginBottom: 4,
                    }}
                  >
                    +{total} XP
                  </div>
                  <div
                    style={{
                      fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                      fontSize: 11,
                      color: isCyber ? '#4B5563' : '#7C3AED',
                    }}
                  >
                    Session: {sessionXP} + Status bonus: {xpBonus}
                  </div>
                </div>
              );
            })()}

            {/* Footer */}
            {(() => {
              const isAdvancing = closeModal.selectedStatus !== closeModal.currentFeatureStatus;
              return (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleCloseAndAdvance}
                    style={{
                      flex: 1,
                      height: 40,
                      background: isCyber ? '#00FF88' : '#2563EB',
                      color: isCyber ? '#000000' : '#FFFFFF',
                      border: 'none',
                      borderRadius: 4,
                      fontFamily: isCyber ? "'Space Grotesk', sans-serif" : 'var(--font-dm-sans)',
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'box-shadow 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isCyber
                        ? '0 0 16px rgba(0,255,136,0.4)'
                        : '0 4px 12px rgba(37,99,235,0.3)';
                    }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {isAdvancing
                      ? (isCyber ? 'CLOSE_AND_ADVANCE' : 'Close & Advance')
                      : (isCyber ? 'CLOSE_SESSION' : 'Close Session')}
                  </button>
                  {isAdvancing && (
                    <button
                      onClick={handleCloseWithoutAdvancing}
                      style={{
                        height: 40,
                        padding: '0 16px',
                        background: 'none',
                        border: `1px solid ${isCyber ? '#3B4B3D' : '#E2E8F0'}`,
                        borderRadius: 4,
                        fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                        fontSize: 12,
                        color: isCyber ? '#6B7280' : '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      {isCyber ? 'NO_ADVANCE' : 'Close Without Advancing'}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Feature completion celebration */}
      <FeatureCompletionCelebration
        feature={celebrationFeature}
        reward={celebrationReward}
        onDismiss={() => { setCelebrationFeature(null); setCelebrationReward(null); }}
      />
    </div>
  );
}
