import type { VibeSession } from '@/types';

export interface DetectedStatus {
  status: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  xpBonus: number;
}

const STATUS_ORDER = ['IDEA', 'SCOPING', 'PROTOTYPING', 'BUILDING', 'DONE'] as const;

/** True if moving from current → target is a forward advancement (never backward). */
function canAdvanceTo(current: string, target: string): boolean {
  const ci = STATUS_ORDER.indexOf(current as typeof STATUS_ORDER[number]);
  const ti = STATUS_ORDER.indexOf(target as typeof STATUS_ORDER[number]);
  return ti > ci;
}

export function detectFeatureStatus(
  session: VibeSession,
  currentFeatureStatus: string
): DetectedStatus {
  const tasks = session.backlogItems || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  // Prototype requires a real URL (not just any string)
  const hasPrototype =
    typeof session.prototypeUrl === 'string' &&
    session.prototypeUrl.startsWith('http');

  const hasGoal = typeof session.goal === 'string' && session.goal.length > 20;

  // Notes: check across all session days OR the root notes field
  const notesWorked =
    session.notes?.worked ??
    session.sessions?.reduce((acc, d) => acc + (d.notesWorked ?? ''), '') ??
    '';
  const hasNotes = notesWorked.length > 10;

  // ── DONE: strictest gate — ALL conditions required ──────────────────────
  // Must currently be BUILDING, have a real prototype, all tasks done, and
  // notes written. This prevents accidentally jumping to DONE.
  if (
    currentFeatureStatus === 'BUILDING' &&
    hasPrototype &&
    totalTasks > 0 &&
    doneTasks === totalTasks &&
    hasNotes
  ) {
    return {
      status: 'DONE',
      confidence: 'HIGH',
      reason: 'All tasks complete, prototype delivered, and notes captured.',
      xpBonus: 200,
    };
  }

  // ── BUILDING: prototype + tasks in progress ──────────────────────────────
  if (
    hasPrototype &&
    inProgressTasks > 0 &&
    canAdvanceTo(currentFeatureStatus, 'BUILDING')
  ) {
    return {
      status: 'BUILDING',
      confidence: 'HIGH',
      reason: 'Active tasks and prototype in progress.',
      xpBonus: 100,
    };
  }

  // ── BUILDING: tasks actively in progress (no prototype required) ─────────
  if (
    (inProgressTasks > 0 || (doneTasks > 0 && doneTasks < totalTasks)) &&
    canAdvanceTo(currentFeatureStatus, 'BUILDING')
  ) {
    return {
      status: 'BUILDING',
      confidence: 'MEDIUM',
      reason: 'Tasks are actively being worked on.',
      xpBonus: 75,
    };
  }

  // ── PROTOTYPING: prototype URL added while in SCOPING ────────────────────
  if (hasPrototype && currentFeatureStatus === 'SCOPING') {
    return {
      status: 'PROTOTYPING',
      confidence: 'HIGH',
      reason: 'Prototype URL added — moving to PROTOTYPING.',
      xpBonus: 100,
    };
  }

  // ── SCOPING: tasks defined but none started ──────────────────────────────
  if (
    totalTasks > 0 &&
    doneTasks === 0 &&
    inProgressTasks === 0 &&
    canAdvanceTo(currentFeatureStatus, 'SCOPING')
  ) {
    return {
      status: 'SCOPING',
      confidence: 'MEDIUM',
      reason: 'Tasks defined but work not yet started.',
      xpBonus: 50,
    };
  }

  // ── SCOPING: goal written, no tasks ─────────────────────────────────────
  if (
    hasGoal &&
    totalTasks === 0 &&
    canAdvanceTo(currentFeatureStatus, 'SCOPING')
  ) {
    return {
      status: 'SCOPING',
      confidence: 'LOW',
      reason: 'Goal captured — ready to scope tasks.',
      xpBonus: 25,
    };
  }

  // ── Fallback: stay on current status ────────────────────────────────────
  // Never blindly advance — require actual evidence of progress.
  return {
    status: currentFeatureStatus,
    confidence: 'LOW',
    reason: 'Not enough session activity to advance status automatically.',
    xpBonus: 0,
  };
}
