export type ThemeId = 'default' | 'cyber';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // hex color for preview swatch
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'VibeFlow Classic',
    description: 'Clean navy and white. Professional PM tool.',
    preview: '#2563EB',
  },
  {
    id: 'cyber',
    name: 'Cyber Terminal',
    description: 'Dark hacker aesthetic. Neon on black.',
    preview: '#00FF88',
  },
];
