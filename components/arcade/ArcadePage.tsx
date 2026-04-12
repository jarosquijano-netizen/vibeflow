'use client';

import { useState } from 'react';
import HighScores from '@/components/arcade/tabs/HighScores';
import TrophyRoom from '@/components/arcade/tabs/TrophyRoom';
import Achievements from '@/components/arcade/tabs/Achievements';
import MyStats from '@/components/arcade/tabs/MyStats';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

type Tab = 'HIGH_SCORES' | 'TROPHY_ROOM' | 'ACHIEVEMENTS' | 'MY_STATS';

const TABS: { id: Tab; label: string }[] = [
  { id: 'HIGH_SCORES',  label: 'HIGH SCORES' },
  { id: 'TROPHY_ROOM',  label: 'TROPHY ROOM' },
  { id: 'ACHIEVEMENTS', label: 'ACHIEVEMENTS' },
  { id: 'MY_STATS',     label: 'MY STATS' },
];

export default function ArcadePage() {
  const [activeTab, setActiveTab] = useState<Tab>('HIGH_SCORES');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#E4E1E9',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scanlines overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Ambient background glow */}
      <div
        style={{
          position: 'fixed',
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {/* Pre-label */}
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: 'rgba(0,255,136,0.5)',
              marginBottom: 16,
            }}
          >
            // VIBEFLOW // SEASON_06 // LEADERBOARD_SYSTEM
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: DISPLAY,
              fontSize: 56,
              fontWeight: 900,
              color: '#E4E1E9',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              margin: 0,
              marginBottom: 8,
            }}
          >
            ARCADE
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: '#4B5563',
              letterSpacing: '0.1em',
              marginTop: 12,
            }}
          >
            EARN XP · UNLOCK TROPHIES · DOMINATE THE LEADERBOARD
          </p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 40,
            borderBottom: '1px solid rgba(59,75,61,0.25)',
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '14px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #00FF88' : '2px solid transparent',
                  color: active ? '#00FF88' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'color 150ms ease, border-color 150ms ease',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#B9CBB9';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#4B5563';
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'HIGH_SCORES'  && <HighScores />}
          {activeTab === 'TROPHY_ROOM'  && <TrophyRoom />}
          {activeTab === 'ACHIEVEMENTS' && <Achievements />}
          {activeTab === 'MY_STATS'     && <MyStats />}
        </div>
      </div>

      <style>{`
        @keyframes arcade-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
