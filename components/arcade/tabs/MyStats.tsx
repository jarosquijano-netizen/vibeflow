'use client';

import { PLAYER, TROPHIES } from '@/lib/arcade-data';
import { getAvatarColor } from '@/lib/arcade-data';
import ArcadeHexBadge from '@/components/arcade/ArcadeHexBadge';
import ArcadeActivityFeed from '@/components/arcade/ArcadeActivityFeed';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

function AttributeBar({ name, value, color }: { name: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6B7280',
          }}
        >
          {name.replace(/_/g, ' ')}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 900,
            color,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: 'rgba(59,75,61,0.25)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${value}%`,
            background: color,
            borderRadius: 2,
            boxShadow: `0 0 8px ${color}66`,
            transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  );
}

export default function MyStats() {
  const xpPct = Math.round((PLAYER.xp / PLAYER.xpToNext) * 100);
  const earnedTrophies = TROPHIES.filter((t) => t.earned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top row: Character card + Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Character card */}
        <div
          style={{
            background: '#0E0E13',
            border: '1px solid rgba(59,75,61,0.25)',
            borderRadius: 16,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 200,
              background: 'rgba(0,255,136,0.06)',
              filter: 'blur(50px)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: getAvatarColor(PLAYER.name),
                border: '3px solid #00FF88',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(0,255,136,0.3)',
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 28,
                  color: '#FFFFFF',
                  letterSpacing: '0.05em',
                }}
              >
                {PLAYER.initials}
              </span>
            </div>
            {/* Level badge */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                background: '#00FF88',
                color: '#003919',
                fontFamily: MONO,
                fontWeight: 900,
                fontSize: 11,
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0A0A0F',
              }}
            >
              {PLAYER.level}
            </div>
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 900,
                fontSize: 16,
                color: '#00FF88',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              {PLAYER.name}
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 10,
                color: 'rgba(0,255,136,0.6)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              {PLAYER.title}
            </div>
          </div>

          {/* XP bar */}
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#4B5563', letterSpacing: '0.1em' }}>
                LVL {PLAYER.level}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#4B5563', letterSpacing: '0.1em' }}>
                LVL {PLAYER.level + 1}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: 'rgba(59,75,61,0.25)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${xpPct}%`,
                  background: 'linear-gradient(to right, #00CC6A, #00FF88)',
                  borderRadius: 3,
                  boxShadow: '0 0 10px rgba(0,255,136,0.5)',
                }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#00FF88', fontWeight: 700 }}>
                {PLAYER.xp.toLocaleString()}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                {' '}/ {PLAYER.xpToNext.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              paddingTop: 12,
              borderTop: '1px solid rgba(59,75,61,0.2)',
            }}
          >
            {[
              { label: 'RANK', value: `#${PLAYER.globalRank}` },
              { label: 'QUESTS', value: PLAYER.questsCompleted },
              { label: 'STREAK', value: `${PLAYER.streak}d` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#E4E1E9',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 8,
                    color: '#4B5563',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attributes panel */}
        <div
          style={{
            background: '#0E0E13',
            border: '1px solid rgba(59,75,61,0.25)',
            borderRadius: 16,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(0,255,136,0.5)',
              marginBottom: 4,
            }}
          >
            // PLAYER_ATTRIBUTES
          </div>
          {PLAYER.attributes.map((attr) => (
            <AttributeBar
              key={attr.name}
              name={attr.name}
              value={attr.value}
              color={attr.color}
            />
          ))}
        </div>
      </div>

      {/* Bottom row: Activity feed + Trophy showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Activity feed */}
        <ArcadeActivityFeed />

        {/* Trophy showcase */}
        <div
          style={{
            background: '#0E0E13',
            border: '1px solid rgba(59,75,61,0.25)',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(0,255,136,0.5)',
              marginBottom: 16,
            }}
          >
            // MY_TROPHIES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {earnedTrophies.map((trophy) => (
              <ArcadeHexBadge
                key={trophy.id}
                icon={trophy.icon}
                color={trophy.color}
                shadowColor={trophy.shadowColor}
                size="sm"
                earned
              />
            ))}
          </div>
          {earnedTrophies.length === 0 && (
            <p style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563' }}>
              No trophies earned yet.
            </p>
          )}
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid rgba(59,75,61,0.2)',
              fontFamily: MONO,
              fontSize: 9,
              color: '#4B5563',
            }}
          >
            {earnedTrophies.length} / {TROPHIES.length} EARNED
          </div>
        </div>
      </div>
    </div>
  );
}
