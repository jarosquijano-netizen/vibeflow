'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import type { VibeSession } from '@/types';

interface CyberSessionScoreCardProps {
  session: VibeSession;
  xpEarned: number;
}

function getStarRating(xpEarned: number): number {
  if (xpEarned > 800) return 5;
  if (xpEarned > 600) return 4;
  if (xpEarned > 400) return 3;
  if (xpEarned > 200) return 2;
  return 1;
}

export default function CyberSessionScoreCard({ session, xpEarned }: CyberSessionScoreCardProps) {
  const { theme } = useTheme();

  if (session.status !== 'CLOSED' || theme !== 'cyber') return null;

  const stars = getStarRating(xpEarned);
  const hasPrototype = !!session.prototypeUrl;
  const bonusXP = (hasPrototype ? 150 : 0) + (session.jiraSyncedIds.length > 0 ? 100 : 0);

  return (
    <div
      style={{
        padding: '0 24px 24px',
      }}
    >
      <div
        style={{
          padding: 20,
          background: '#1F1F25',
          border: '1px solid rgba(59,75,61,0.2)',
          borderRadius: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span style={{ color: '#00FF88', fontSize: 12, fontWeight: 700 }}>
            &gt; SESSION_COMPLETE
          </span>
          <span style={{ color: '#00FF88', fontSize: 12 }}>███ 100%</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            &gt; DURATION: {session.duration} HRS
          </div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            &gt; XP_EARNED: +{xpEarned}
          </div>
          {session.jiraSyncedIds.length > 0 && (
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              &gt; BONUS_AI_USED: +100
            </div>
          )}
          {hasPrototype && (
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              &gt; BONUS_PROTOTYPE: +150
            </div>
          )}
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>
            &gt; FINAL_RANK: {stars >= 4 ? 'S' : stars === 3 ? 'A' : stars === 2 ? 'B' : 'C'}
          </div>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(59,75,61,0.2)' }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', marginRight: 4 }}>RATING:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              style={{
                fontSize: 16,
                color: n <= stars ? '#FFB800' : '#2A2A3E',
                textShadow: n <= stars ? '0 0 6px rgba(255,184,0,0.4)' : 'none',
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
