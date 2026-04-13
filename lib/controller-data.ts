import type { TShirtSize } from './feature-rewards';

export interface Prize {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'BADGE' | 'TITLE' | 'XP_BOOST' | 'CUSTOM';
  triggerSize?: TShirtSize;
  triggerXP?: number;
  assignedTo?: string[];
  createdAt: string;
  active: boolean;
}

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: 'pr1',
    name: 'Quick Fixer',
    description: 'Awarded for shipping an XS feature',
    icon: '⚡',
    type: 'BADGE',
    triggerSize: 'XS',
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
  {
    id: 'pr2',
    name: 'Steady Shipper',
    description: 'Awarded for shipping an S feature',
    icon: '🚀',
    type: 'BADGE',
    triggerSize: 'S',
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
  {
    id: 'pr3',
    name: 'Core Contributor',
    description: 'Awarded for shipping an M feature',
    icon: '🏅',
    type: 'BADGE',
    triggerSize: 'M',
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
  {
    id: 'pr4',
    name: 'Heavy Lifter',
    description: 'Awarded for shipping an L feature',
    icon: '🏆',
    type: 'BADGE',
    triggerSize: 'L',
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
  {
    id: 'pr5',
    name: 'LEGENDARY VIBE',
    description: 'Awarded for shipping an XL feature. Maximum respect.',
    icon: '👑',
    type: 'TITLE',
    triggerSize: 'XL',
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
  {
    id: 'pr6',
    name: 'XP Surge',
    description: '2x XP multiplier for 24 hours',
    icon: '⚡',
    type: 'XP_BOOST',
    triggerXP: 5000,
    assignedTo: [],
    createdAt: '2026-01-01',
    active: true,
  },
];

export function loadPrizes(): Prize[] {
  if (typeof window === 'undefined') return DEFAULT_PRIZES;
  try {
    const stored = localStorage.getItem('vibeflow-prizes');
    return stored ? JSON.parse(stored) : DEFAULT_PRIZES;
  } catch {
    return DEFAULT_PRIZES;
  }
}

export function savePrizes(prizes: Prize[]): void {
  localStorage.setItem('vibeflow-prizes', JSON.stringify(prizes));
}
