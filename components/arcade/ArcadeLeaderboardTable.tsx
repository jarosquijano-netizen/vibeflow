'use client';

import { LEADERBOARD, getAvatarColor } from '@/lib/arcade-data';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

function MiniAvatar({ initials, name, size = 32 }: { initials: string; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: getAvatarColor(name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: Math.round(size * 0.31),
          color: '#FFFFFF',
          letterSpacing: '0.05em',
        }}
      >
        {initials}
      </span>
    </div>
  );
}

export default function ArcadeLeaderboardTable() {
  const entries = LEADERBOARD;

  // Find where the gap is (rank 7 → rank 12)
  const topEntries = entries.filter((e) => e.rank <= 7);
  const bottomEntries = entries.filter((e) => e.rank > 7);
  const hasGap = topEntries.length > 0 && bottomEntries.length > 0 &&
    bottomEntries[0].rank - topEntries[topEntries.length - 1].rank > 1;

  function formatXP(xp: number) {
    return xp.toLocaleString();
  }

  function StreakBar({ pct }: { pct: number }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            background: 'rgba(59,75,61,0.3)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round(pct * 100)}%`,
              background: pct > 0.8 ? '#00FF88' : pct > 0.5 ? '#FFB800' : '#94A3B8',
              borderRadius: 2,
            }}
          />
        </div>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: pct > 0.8 ? '#00FF88' : pct > 0.5 ? '#FFB800' : '#94A3B8',
            minWidth: 32,
            textAlign: 'right',
          }}
        >
          {Math.round(pct * 100)}%
        </span>
      </div>
    );
  }

  function Row({ entry, dimmed }: { entry: (typeof LEADERBOARD)[0]; dimmed?: boolean }) {
    const isMe = entry.isCurrentUser;
    return (
      <tr
        style={{
          background: isMe
            ? 'rgba(0,255,136,0.06)'
            : dimmed
            ? 'rgba(255,255,255,0.01)'
            : 'transparent',
          borderBottom: '1px solid rgba(59,75,61,0.15)',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (!isMe) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLTableRowElement).style.background = isMe
            ? 'rgba(0,255,136,0.06)'
            : dimmed
            ? 'rgba(255,255,255,0.01)'
            : 'transparent';
        }}
      >
        {/* RANK */}
        <td style={{ padding: '10px 16px', width: 52, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 13,
              color:
                entry.rank === 1
                  ? '#00FF88'
                  : entry.rank === 2
                  ? '#94A3B8'
                  : entry.rank === 3
                  ? '#B45309'
                  : isMe
                  ? '#00FF88'
                  : '#4B5563',
            }}
          >
            #{entry.rank}
          </span>
        </td>

        {/* PLAYER */}
        <td style={{ padding: '10px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MiniAvatar initials={entry.initials} name={entry.name} size={32} />
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 12,
                  color: isMe ? '#00FF88' : '#E4E1E9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {entry.name}
                {isMe && (
                  <span
                    style={{
                      background: 'rgba(0,255,136,0.15)',
                      color: '#00FF88',
                      fontFamily: MONO,
                      fontSize: 8,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 2,
                      letterSpacing: '0.1em',
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 10,
                  color: '#4B5563',
                  marginTop: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {entry.title}
              </div>
            </div>
          </div>
        </td>

        {/* XP */}
        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 900,
              fontSize: 14,
              color: isMe ? '#00FF88' : '#E4E1E9',
              letterSpacing: '-0.02em',
            }}
          >
            {formatXP(entry.xp)}
          </span>
        </td>

        {/* STREAK */}
        <td style={{ padding: '10px 16px', minWidth: 120 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: entry.streak > 30 ? '#00FF88' : entry.streak > 10 ? '#FFB800' : '#94A3B8',
                fontWeight: 700,
              }}
            >
              🔥 {entry.streak}d
            </span>
            <StreakBar pct={entry.streakPct} />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        background: '#0E0E13',
        borderRadius: 12,
        border: '1px solid rgba(59,75,61,0.2)',
        overflow: 'hidden',
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(59,75,61,0.3)' }}>
            {['RANK', 'PLAYER', 'XP', 'STREAK POWER'].map((col, i) => (
              <th
                key={col}
                style={{
                  padding: '12px 16px',
                  textAlign: i === 2 ? 'right' : 'left',
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  background: '#0A0A0F',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topEntries.map((entry) => (
            <Row key={entry.id} entry={entry} />
          ))}

          {hasGap && (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: '6px 16px',
                  textAlign: 'center',
                  fontFamily: MONO,
                  fontSize: 10,
                  color: '#3B4B3D',
                  letterSpacing: '0.2em',
                  borderBottom: '1px solid rgba(59,75,61,0.15)',
                }}
              >
                · · ·
              </td>
            </tr>
          )}

          {bottomEntries.map((entry) => (
            <Row key={entry.id} entry={entry} dimmed />
          ))}
        </tbody>
      </table>
    </div>
  );
}
