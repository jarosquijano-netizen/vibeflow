export type IdeaStage = 'RAW' | 'EXPLORING' | 'REFINED' | 'PROMOTED';

export interface IdeaComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  stage: IdeaStage;
  tags: string[];
  votes: number;
  votedBy: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  promotedAt?: string;
  featureId?: string;
  problemStatement: string;
  opportunity: string;
  successMetric: string;
  linkedSessions: string[];
  attachments: string[];
  comments: IdeaComment[];
}

export const IDEA_STAGE_CONFIG = {
  RAW: {
    label: 'RAW',
    description: 'Just captured — needs exploration',
    color: '#94A3B8',
    glow: 'rgba(148,163,184,0.3)',
    bg: 'rgba(148,163,184,0.05)',
    icon: 'lightbulb',
  },
  EXPLORING: {
    label: 'EXPLORING',
    description: 'Being investigated and validated',
    color: '#BF00FF',
    glow: 'rgba(191,0,255,0.3)',
    bg: 'rgba(191,0,255,0.05)',
    icon: 'travel_explore',
  },
  REFINED: {
    label: 'REFINED',
    description: 'Well-defined and ready to promote',
    color: '#00D4FF',
    glow: 'rgba(0,212,255,0.3)',
    bg: 'rgba(0,212,255,0.05)',
    icon: 'diamond',
  },
  PROMOTED: {
    label: 'PROMOTED',
    description: 'On the Feature Board as IDEA status',
    color: '#00FF88',
    glow: 'rgba(0,255,136,0.3)',
    bg: 'rgba(0,255,136,0.05)',
    icon: 'rocket_launch',
  },
} as const;

export const STAGE_ORDER: IdeaStage[] = ['RAW', 'EXPLORING', 'REFINED', 'PROMOTED'];

export const SAMPLE_IDEAS: Idea[] = [
  {
    id: 'idea1',
    title: 'AI-powered carrier scoring',
    description: 'Use ML to score carriers based on historical performance, on-time rates, and damage claims.',
    stage: 'RAW',
    tags: ['ai', 'carriers', 'ml'],
    votes: 3,
    votedBy: ['Sara Kim', 'Marcus Bell'],
    author: 'Jordan Davies',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
    problemStatement: 'PMs have no objective way to rank carriers beyond price.',
    opportunity: 'Could reduce damage claims by 20% by steering toward higher-scored carriers.',
    successMetric: 'Damage claim rate drops 15% within 2 quarters of launch.',
    linkedSessions: [],
    attachments: [],
    comments: [
      {
        id: 'c1',
        author: 'Sara Kim',
        text: 'Love this. We have the data already in our warehouse.',
        createdAt: '2026-06-02',
      },
    ],
  },
  {
    id: 'idea2',
    title: 'Spot rate auction engine',
    description: 'Let multiple carriers bid on spot shipments in real-time, lowest price wins.',
    stage: 'EXPLORING',
    tags: ['pricing', 'carriers', 'real-time'],
    votes: 7,
    votedBy: ['Jordan Davies', 'Sara Kim', 'Marcus Bell'],
    author: 'Marcus Bell',
    createdAt: '2026-05-20',
    updatedAt: '2026-06-05',
    problemStatement: 'Current spot rate process is manual email negotiation taking 2-4 hours.',
    opportunity: 'Could cut spot rate acquisition time from hours to minutes.',
    successMetric: '90% of spot rates acquired in under 10 minutes.',
    linkedSessions: ['s1'],
    attachments: [],
    comments: [],
  },
  {
    id: 'idea3',
    title: 'Predictive delay alerts',
    description: 'ML model predicts shipment delays 24-48hrs in advance based on weather, traffic, carrier patterns.',
    stage: 'EXPLORING',
    tags: ['ml', 'tracking', 'alerts'],
    votes: 5,
    votedBy: ['Jordan Davies', 'Marcus Bell'],
    author: 'Sara Kim',
    createdAt: '2026-05-15',
    updatedAt: '2026-06-01',
    problemStatement: 'Customers only find out about delays when they happen — no proactive communication.',
    opportunity: 'Proactive alerts could reduce inbound WISMO calls by 40%.',
    successMetric: 'WISMO call reduction of 35%+ within 3 months.',
    linkedSessions: [],
    attachments: [],
    comments: [
      {
        id: 'c2',
        author: 'Jordan Davies',
        text: 'We need to validate data quality first before committing.',
        createdAt: '2026-05-18',
      },
      {
        id: 'c3',
        author: 'Marcus Bell',
        text: "Agreed. Let's do a spike in EXPLORING.",
        createdAt: '2026-05-19',
      },
    ],
  },
  {
    id: 'idea4',
    title: 'Driver gamification app',
    description: 'Mobile app for drivers with points, badges, and leaderboards for on-time deliveries.',
    stage: 'REFINED',
    tags: ['mobile', 'gamification', 'drivers'],
    votes: 9,
    votedBy: ['Jordan Davies', 'Sara Kim', 'Marcus Bell'],
    author: 'Jordan Davies',
    createdAt: '2026-05-01',
    updatedAt: '2026-06-05',
    problemStatement: 'Driver on-time performance varies wildly with no incentive structure.',
    opportunity: 'Gamification could improve on-time rates by 10-15% based on competitor case studies.',
    successMetric: 'On-time delivery rate increases 10% within 6 months.',
    linkedSessions: ['s2'],
    attachments: [],
    comments: [],
  },
  {
    id: 'idea5',
    title: 'Customs pre-clearance automation',
    description: 'Auto-submit customs docs to pre-clearance system before shipment arrives at border.',
    stage: 'REFINED',
    tags: ['customs', 'automation', 'compliance'],
    votes: 11,
    votedBy: ['Jordan Davies', 'Sara Kim', 'Marcus Bell'],
    author: 'Marcus Bell',
    createdAt: '2026-04-15',
    updatedAt: '2026-06-01',
    problemStatement: 'Manual customs submission causes 4-6hr delays at border crossings.',
    opportunity: 'Pre-clearance could eliminate most border delays for regular lanes.',
    successMetric: 'Border delay time reduced by 70% on pre-clearance lanes.',
    linkedSessions: [],
    attachments: [],
    comments: [],
  },
  {
    id: 'idea6',
    title: 'Smart route optimization',
    description: 'ML-powered route suggestions that minimize cost, time, and carbon footprint simultaneously.',
    stage: 'PROMOTED',
    tags: ['ml', 'routing', 'sustainability'],
    votes: 14,
    votedBy: ['Jordan Davies', 'Sara Kim', 'Marcus Bell'],
    author: 'Jordan Davies',
    createdAt: '2026-03-01',
    updatedAt: '2026-05-15',
    promotedAt: '2026-05-15',
    featureId: 'f10',
    problemStatement: 'Current routing is cost-only — ignores time and sustainability tradeoffs.',
    opportunity: 'Multi-objective routing could save 8% on costs while reducing CO2 by 12%.',
    successMetric: 'Combined cost+CO2 efficiency score improves 10%.',
    linkedSessions: ['s5'],
    attachments: [],
    comments: [],
  },
];
