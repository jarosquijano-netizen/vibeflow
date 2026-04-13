import type { VibeSession } from '@/types';

export interface DetectedStatus {
  status: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  xpBonus: number;
}

export function detectFeatureStatus(
  session: VibeSession,
  currentFeatureStatus: string
): DetectedStatus {
  const tasks = session.backlogItems || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const hasPrototype = !!session.prototypeUrl;
  const hasGoal = session.goal && session.goal.length > 20;
  const hasNotes = session.notes?.worked?.length > 10;

  void hasNotes; // used for future scoring

  // All tasks done + prototype = BUILDING or DONE
  if (totalTasks > 0 && doneTasks === totalTasks && hasPrototype) {
    if (currentFeatureStatus === 'BUILDING') {
      return {
        status: 'DONE',
        confidence: 'HIGH',
        reason: 'All tasks complete and prototype delivered.',
        xpBonus: 200,
      };
    }
    return {
      status: 'BUILDING',
      confidence: 'HIGH',
      reason: 'All tasks done and prototype available.',
      xpBonus: 150,
    };
  }

  // Prototype exists = PROTOTYPING (from SCOPING)
  if (hasPrototype && currentFeatureStatus === 'SCOPING') {
    return {
      status: 'PROTOTYPING',
      confidence: 'HIGH',
      reason: 'Prototype URL added — moving to PROTOTYPING.',
      xpBonus: 100,
    };
  }

  // Prototype + tasks in progress = BUILDING
  if (hasPrototype && inProgressTasks > 0) {
    return {
      status: 'BUILDING',
      confidence: 'HIGH',
      reason: 'Active tasks and prototype in progress.',
      xpBonus: 100,
    };
  }

  // Tasks in progress = BUILDING
  if (inProgressTasks > 0 || (doneTasks > 0 && doneTasks < totalTasks)) {
    return {
      status: 'BUILDING',
      confidence: 'MEDIUM',
      reason: 'Tasks are actively being worked on.',
      xpBonus: 75,
    };
  }

  // Tasks defined but none started = SCOPING
  if (totalTasks > 0 && doneTasks === 0 && inProgressTasks === 0) {
    return {
      status: 'SCOPING',
      confidence: 'MEDIUM',
      reason: 'Tasks defined but work not yet started.',
      xpBonus: 50,
    };
  }

  // Goal written but no tasks = SCOPING
  if (hasGoal && totalTasks === 0) {
    return {
      status: 'SCOPING',
      confidence: 'LOW',
      reason: 'Goal captured — ready to scope tasks.',
      xpBonus: 25,
    };
  }

  // Fallback: advance one step
  const STATUS_ORDER = ['IDEA', 'SCOPING', 'PROTOTYPING', 'BUILDING', 'DONE'];
  const currentIdx = STATUS_ORDER.indexOf(currentFeatureStatus);
  const nextStatus = STATUS_ORDER[Math.min(currentIdx + 1, STATUS_ORDER.length - 1)];

  return {
    status: nextStatus,
    confidence: 'LOW',
    reason: 'Moving to next stage based on session completion.',
    xpBonus: 0,
  };
}
