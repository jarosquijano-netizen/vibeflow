export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface FeatureReward {
  size: TShirtSize;
  xp: number;
  rank: string;
  badge: string;
  badgeColor: string;
  badgeShadow: string;
  title: string;
  subtitle: string;
  particles: string[];
}

export const DEFAULT_FEATURE_REWARDS: Record<TShirtSize, FeatureReward> = {
  XS: {
    size: 'XS',
    xp: 100,
    rank: 'C',
    badge: 'check_circle',
    badgeColor: '#64748B',
    badgeShadow: 'rgba(100,116,139,0.5)',
    title: 'QUICK WIN',
    subtitle: 'Small but mighty. Feature shipped.',
    particles: ['#64748B', '#94A3B8', '#CBD5E1'],
  },
  S: {
    size: 'S',
    xp: 250,
    rank: 'B',
    badge: 'rocket_launch',
    badgeColor: '#00FF88',
    badgeShadow: 'rgba(0,255,136,0.6)',
    title: 'SHIPPED!',
    subtitle: 'Clean execution. Feature delivered.',
    particles: ['#00FF88', '#00CC6A', '#F0FFF4'],
  },
  M: {
    size: 'M',
    xp: 500,
    rank: 'A',
    badge: 'military_tech',
    badgeColor: '#00D4FF',
    badgeShadow: 'rgba(0,212,255,0.6)',
    title: 'SOLID SHIP',
    subtitle: 'Medium effort, maximum impact.',
    particles: ['#00D4FF', '#0EA5E9', '#F0F9FF'],
  },
  L: {
    size: 'L',
    xp: 1000,
    rank: 'S',
    badge: 'workspace_premium',
    badgeColor: '#FFB800',
    badgeShadow: 'rgba(255,184,0,0.6)',
    title: 'BIG SHIP!',
    subtitle: 'Major feature landed. Legendary.',
    particles: ['#FFB800', '#F59E0B', '#FFF7ED', '#00FF88'],
  },
  XL: {
    size: 'XL',
    xp: 2500,
    rank: 'S+',
    badge: 'crown',
    badgeColor: '#FFD700',
    badgeShadow: 'rgba(255,215,0,0.8)',
    title: 'LEGENDARY SHIP!',
    subtitle: 'Massive delivery. You are the VIBE LORD.',
    particles: ['#FFD700', '#FFB800', '#00FF88', '#BF00FF', '#00D4FF'],
  },
};

export function getFeatureRewards(): Record<TShirtSize, FeatureReward> {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_REWARDS;
  try {
    const stored = localStorage.getItem('vibeflow-feature-rewards');
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = {} as Record<TShirtSize, FeatureReward>;
      for (const size of ['XS', 'S', 'M', 'L', 'XL'] as TShirtSize[]) {
        merged[size] = { ...DEFAULT_FEATURE_REWARDS[size], ...parsed[size] };
      }
      return merged;
    }
  } catch {}
  return DEFAULT_FEATURE_REWARDS;
}

export function saveFeatureRewards(rewards: Record<TShirtSize, FeatureReward>): void {
  localStorage.setItem('vibeflow-feature-rewards', JSON.stringify(rewards));
}
