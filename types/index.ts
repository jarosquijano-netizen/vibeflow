export interface Feature {
  id: string;
  title: string;
  problemStatement: string;
  status: 'IDEA' | 'SCOPING' | 'PROTOTYPING' | 'BUILDING' | 'DONE' | 'PARKED';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | null;
  quarter: string;
  owner: string;
  jiraEpicId?: string;
  prototypeUrl?: string;
  aiSuggestedSize?: string;
  aiConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  aiAccepted?: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  body: string;
  tool: 'v0' | 'Cursor' | 'Bolt' | 'ChatGPT' | 'Claude' | 'Other';
  outputType: string;
  quality: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  version: number;
  usedInFeatures: string[];
}

export interface BacklogItem {
  id: string;
  title: string;
  status: string;
  jiraId?: string;
}

export interface VibeSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  goal: string;
  linkedFeatureIds: string[];
  promptIds: string[];
  prototypeUrl?: string;
  notes: {
    worked: string;
    improve: string;
  };
  backlogItems: BacklogItem[];
  jiraSyncedIds: string[];
}
