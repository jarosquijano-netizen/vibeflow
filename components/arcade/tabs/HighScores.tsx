'use client';

import ArcadePodium from '@/components/arcade/ArcadePodium';
import ArcadeLeaderboardTable from '@/components/arcade/ArcadeLeaderboardTable';

const MONO = "'JetBrains Mono', monospace";

export default function HighScores() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      {/* Section label */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(0,255,136,0.5)',
          }}
        >
          // WEEKLY_RANKINGS // SEASON_06
        </span>
      </div>

      {/* Podium */}
      <ArcadePodium />

      {/* Full table */}
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(0,255,136,0.5)',
            marginBottom: 16,
            paddingLeft: 4,
          }}
        >
          // FULL_RANKINGS
        </div>
        <ArcadeLeaderboardTable />
      </div>
    </div>
  );
}
