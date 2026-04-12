export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  xp: number;
  streak: number;
  streakPct: number;
  isCurrentUser?: boolean;
  initials: string;
  title: string;
  badge?: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  howToEarn: string;
  icon: string;
  color: string;
  shadowColor: string;
  earned: boolean;
  earnedDate?: string;
  earnedBy?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
  progress?: number;
  progressMax?: number;
  xpReward: number;
  earnedDate?: string;
}

export interface PlayerAttribute {
  name: string;
  value: number;
  color: string;
}

export function getAvatarColor(name: string): string {
  const colors = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#B45309', '#0E7490'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1,  id: 'u1', name: 'V0ID_WALKER',  xp: 142900, streak: 89, streakPct: 0.95, initials: 'VW', title: 'Global Champion',   badge: 'workspace_premium' },
  { rank: 2,  id: 'u2', name: 'PROTO_PUNK',   xp: 88240,  streak: 34, streakPct: 0.60, initials: 'PP', title: 'Vibe Architect' },
  { rank: 3,  id: 'u3', name: 'CYBER_REBEL',  xp: 75510,  streak: 21, streakPct: 0.45, initials: 'CR', title: 'Vibe Master' },
  { rank: 4,  id: 'u4', name: 'BINARY_THIEF', xp: 62800,  streak: 12, streakPct: 0.67, initials: 'BT', title: 'Senior Vibe Coder' },
  { rank: 5,  id: 'u5', name: 'NULL_POINTER', xp: 58100,  streak: 8,  streakPct: 0.40, initials: 'NP', title: 'Vibe Coder' },
  { rank: 6,  id: 'u6', name: 'STACK_GHOST',  xp: 52300,  streak: 15, streakPct: 0.55, initials: 'SG', title: 'Vibe Coder' },
  { rank: 7,  id: 'u7', name: 'FLUX_RIDER',   xp: 49900,  streak: 6,  streakPct: 0.30, initials: 'FR', title: 'Junior Vibe Coder' },
  { rank: 12, id: 'me', name: 'OPERATOR_01',  xp: 45120,  streak: 42, streakPct: 0.90, isCurrentUser: true, initials: 'JD', title: 'Senior Vibe Coder' },
  { rank: 13, id: 'u8', name: 'NEON_X',       xp: 44900,  streak: 2,  streakPct: 0.25, initials: 'NX', title: 'Vibe Coder' },
];

export const TROPHIES: Trophy[] = [
  {
    id: 't1', name: 'ON FIRE',
    description: 'Maintain 3 vibe sessions in a single week.',
    howToEarn: 'Log 3 sessions in any 7-day period.',
    icon: 'local_fire_department', color: '#FF6B00', shadowColor: 'rgba(255,107,0,0.3)',
    earned: true, earnedDate: 'Jun 1, 2026',
    earnedBy: ['Jordan Davies', 'Sara Kim'],
  },
  {
    id: 't2', name: 'SPEED RUN',
    description: 'Complete a session under 1 hour with a prototype URL.',
    howToEarn: 'Close a session in <1hr with prototypeUrl filled.',
    icon: 'bolt', color: '#FFB800', shadowColor: 'rgba(255,184,0,0.3)',
    earned: true, earnedDate: 'May 20, 2026',
    earnedBy: ['Jordan Davies'],
  },
  {
    id: 't3', name: 'AI WHISPERER',
    description: 'Accept the AI size estimate 5 times in a row.',
    howToEarn: 'Click "Accept suggestion" on 5 consecutive features.',
    icon: 'psychology', color: '#BF00FF', shadowColor: 'rgba(191,0,255,0.3)',
    earned: true, earnedDate: 'May 15, 2026',
    earnedBy: ['Jordan Davies', 'Marcus Bell'],
  },
  {
    id: 't4', name: 'SHIP IT',
    description: 'Move a feature from BUILDING to DONE.',
    howToEarn: 'Drag any feature card into the DONE column.',
    icon: 'rocket_launch', color: '#00FF88', shadowColor: 'rgba(0,255,136,0.3)',
    earned: false, earnedBy: [],
  },
  {
    id: 't5', name: 'GUARDIAN',
    description: 'Maintain a 30-day consecutive session streak.',
    howToEarn: 'Log at least one session every day for 30 days.',
    icon: 'shield', color: '#00D4FF', shadowColor: 'rgba(0,212,255,0.3)',
    earned: false, earnedBy: [],
  },
  {
    id: 't6', name: 'VIBE LORD',
    description: 'Reach the #1 spot on the weekly leaderboard.',
    howToEarn: 'Earn the most XP in a single week.',
    icon: 'star', color: '#FFD700', shadowColor: 'rgba(255,215,0,0.3)',
    earned: false, earnedBy: [],
  },
  {
    id: 't7', name: 'HIVE MIND',
    description: 'Link 10 or more features to vibe sessions.',
    howToEarn: 'Use the "Link feature" button in 10+ sessions.',
    icon: 'hive', color: '#00FF88', shadowColor: 'rgba(0,255,136,0.3)',
    earned: false, earnedBy: [],
  },
  {
    id: 't8', name: 'DEPLOYER',
    description: 'Sync 20 backlog items to Jira successfully.',
    howToEarn: 'Click "Sync to Jira" until 20 items are synced.',
    icon: 'deployed_code', color: '#3CD7FF', shadowColor: 'rgba(60,215,255,0.3)',
    earned: false, earnedBy: [],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1', name: 'COMMAND_LINE_WIZARD',
    description: 'Executed over 1,000 successful deployment scripts without a single failure.',
    icon: 'terminal', color: '#00FF88',
    status: 'UNLOCKED', xpReward: 500, earnedDate: 'NOV 22, 2023',
  },
  {
    id: 'a2', name: 'MENTOR_PROTOCOL',
    description: 'Review 50 pull requests from junior operators in your squad.',
    icon: 'groups', color: '#ECB1FF',
    status: 'IN_PROGRESS', progress: 42, progressMax: 50, xpReward: 750,
  },
  {
    id: 'a3', name: 'BUG_HUNTER_SQUAD',
    description: 'Identified and patched 25 critical security vulnerabilities in the last month.',
    icon: 'shield', color: '#3CD7FF',
    status: 'UNLOCKED', xpReward: 600, earnedDate: 'DEC 05, 2023',
  },
  {
    id: 'a4', name: 'PROMPT_MASTER',
    description: 'Save 10 or more prompts to the prompt library.',
    icon: 'bookmark', color: '#00D4FF',
    status: 'IN_PROGRESS', progress: 7, progressMax: 10, xpReward: 300,
  },
  {
    id: 'a5', name: 'STREAK_HUNTER',
    description: 'Maintain a 30-day consecutive session streak.',
    icon: 'local_fire_department', color: '#FFB800',
    status: 'IN_PROGRESS', progress: 7, progressMax: 30, xpReward: 1000,
  },
  {
    id: 'a6', name: "BULL'S EYE",
    description: 'AI size suggestion matches your final size 5 times in a row.',
    icon: 'target', color: '#FF4444',
    status: 'LOCKED', xpReward: 400,
  },
  {
    id: 'a7', name: 'SPEED_DEMON',
    description: 'Close 3 sessions under 1 hour each in the same week.',
    icon: 'speed', color: '#FFB800',
    status: 'LOCKED', xpReward: 500,
  },
  {
    id: 'a8', name: 'JIRA_SYNC_MASTER',
    description: 'Sync 50 total backlog items to Jira.',
    icon: 'sync', color: '#00D4FF',
    status: 'LOCKED', xpReward: 350,
  },
  {
    id: 'a9', name: 'SHIP_IT_5X',
    description: 'Move 5 features to DONE status.',
    icon: 'rocket_launch', color: '#00FF88',
    status: 'LOCKED', xpReward: 600,
  },
];

export const PLAYER = {
  name: 'OPERATOR_01',
  initials: 'JD',
  level: 7,
  xp: 45120,
  xpToNext: 50000,
  globalRank: 12,
  questsCompleted: 128,
  title: 'SENIOR VIBE CODER',
  streak: 42,
  attributes: [
    { name: 'SHIPPING_VELOCITY', value: 80,  color: '#00FF88' },
    { name: 'AI_MASTERY',        value: 100, color: '#ECB1FF' },
    { name: 'CODE_PURITY',       value: 60,  color: '#00FF88' },
    { name: 'TEAM_COHESION',     value: 90,  color: '#3CD7FF' },
    { name: 'STREAK_POWER',      value: 70,  color: '#FFB800' },
  ] as PlayerAttribute[],
};

export const ACTIVITY_LOG = [
  { time: '14:22:01', type: 'QUEST_COMPLETE',  label: 'QUEST_COMPLETE:',  message: '"Rate card comparison" — +450 XP',                  color: '#E4E1E9' },
  { time: '13:05:44', type: 'TROPHY_UNLOCKED', label: 'TROPHY_UNLOCKED:', message: '"Speed Run" (Silver Rank)',                         color: '#FFB800' },
  { time: '11:10:12', type: 'LOG_ENTRY',       label: 'LOG_ENTRY:',       message: 'V0ID_WALKER passed your rank in SHIPPING_VELOCITY', color: '#B9CBB9' },
  { time: '09:30:19', type: 'DAILY_BONUS',     label: 'DAILY_BONUS:',     message: '+100 XP for 42-day login streak',                  color: '#00FF88' },
  { time: '08:45:33', type: 'SYSTEM',          label: 'SYSTEM:',          message: 'AI_MASTERY attribute increased to MAX',             color: '#3CD7FF' },
];
