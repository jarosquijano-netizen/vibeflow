'use client';

import { LEADERBOARD, getAvatarColor } from '@/lib/arcade-data';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

function Avatar({
  initials,
  name,
  size,
  borderColor,
  grayscale,
}: {
  initials: string;
  name: string;
  size: number;
  borderColor: string;
  grayscale?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: getAvatarColor(name),
        border: `4px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: grayscale ? 'grayscale(1)' : 'none',
        flexShrink: 0,
        transition: 'filter 200ms ease',
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: Math.round(size * 0.28),
          color: '#FFFFFF',
          letterSpacing: '0.05em',
        }}
      >
        {initials}
      </span>
    </div>
  );
}

export default function ArcadePodium() {
  const top3 = LEADERBOARD.slice(0, 3);
  const [first, second, third] = [top3[0], top3[1], top3[2]];

  function formatXP(xp: number) {
    return xp.toLocaleString();
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignItems: 'flex-end',
        maxWidth: 900,
        margin: '0 auto',
        paddingTop: 40,
      }}
    >
      {/* RANK 2 — left */}
      <div
        className="group"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Avatar initials={second.initials} name={second.name} size={128} borderColor="#94A3B8" grayscale />
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              color: '#D1D5DB',
            }}
          >
            {second.name}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              fontWeight: 900,
              color: '#94A3B8',
              letterSpacing: '-0.02em',
            }}
          >
            {formatXP(second.xp)}
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 10,
              color: 'rgba(148,163,184,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}
          >
            {second.title}
          </div>
        </div>

        {/* Podium bar */}
        <div
          style={{
            width: '100%',
            height: 96,
            marginTop: 24,
            background: 'linear-gradient(to bottom, #2A292F, rgba(148,163,184,0.15))',
            borderRadius: '12px 12px 0 0',
            borderTop: '1px solid rgba(148,163,184,0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 10,
          }}
        >
          <div
            style={{
              background: '#94A3B8',
              color: '#0F172A',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 14,
              padding: '2px 16px',
              borderRadius: 4,
            }}
          >
            #2
          </div>
        </div>
      </div>

      {/* RANK 1 — center */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          marginLeft: -16,
          marginRight: -16,
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 200,
            background: 'rgba(0,255,136,0.12)',
            filter: 'blur(40px)',
            borderRadius: '50%',
            animation: 'arcade-pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <Avatar
            initials={first.initials}
            name={first.name}
            size={160}
            borderColor="#00FF88"
          />
          {/* Rank badge */}
          <div
            style={{
              position: 'absolute',
              bottom: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#00FF88',
              color: '#003919',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 14,
              padding: '2px 20px',
              zIndex: 20,
              whiteSpace: 'nowrap',
            }}
          >
            #1
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 18,
              fontWeight: 900,
              color: '#00FF88',
              textShadow: '0 0 10px rgba(0,255,136,0.4)',
            }}
          >
            {first.name}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 48,
              fontWeight: 900,
              color: '#E4E1E9',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {formatXP(first.xp)}
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 10,
              color: 'rgba(0,255,136,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginTop: 4,
            }}
          >
            {first.title}
          </div>
        </div>

        {/* Podium bar */}
        <div
          style={{
            width: '100%',
            height: 160,
            marginTop: 24,
            background: 'linear-gradient(to bottom, #2A292F, rgba(0,255,136,0.15))',
            borderRadius: '12px 12px 0 0',
            borderTop: '1px solid rgba(0,255,136,0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 12,
          }}
        />
      </div>

      {/* RANK 3 — right */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Avatar initials={third.initials} name={third.name} size={128} borderColor="#B45309" grayscale />
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 14,
              fontWeight: 700,
              color: '#D1D5DB',
            }}
          >
            {third.name}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              fontWeight: 900,
              color: '#B45309',
              letterSpacing: '-0.02em',
            }}
          >
            {formatXP(third.xp)}
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 10,
              color: 'rgba(180,83,9,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 2,
            }}
          >
            {third.title}
          </div>
        </div>

        {/* Podium bar */}
        <div
          style={{
            width: '100%',
            height: 64,
            marginTop: 24,
            background: 'linear-gradient(to bottom, #2A292F, rgba(180,83,9,0.15))',
            borderRadius: '12px 12px 0 0',
            borderTop: '1px solid rgba(180,83,9,0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 10,
          }}
        >
          <div
            style={{
              background: '#B45309',
              color: '#FFFFFF',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 14,
              padding: '2px 16px',
              borderRadius: 4,
            }}
          >
            #3
          </div>
        </div>
      </div>
    </div>
  );
}
