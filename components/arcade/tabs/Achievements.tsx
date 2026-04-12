'use client';

import { useState } from 'react';
import { ACHIEVEMENTS, type Achievement } from '@/lib/arcade-data';
import ArcadeHexBadge from '@/components/arcade/ArcadeHexBadge';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

type Filter = 'ALL' | 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';

const FILTERS: Filter[] = ['ALL', 'UNLOCKED', 'IN_PROGRESS', 'LOCKED'];

const STATUS_COLOR: Record<Achievement['status'], string> = {
  UNLOCKED: '#00FF88',
  IN_PROGRESS: '#FFB800',
  LOCKED: '#4B5563',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const statusColor = STATUS_COLOR[achievement.status];
  const isUnlocked = achievement.status === 'UNLOCKED';
  const isInProgress = achievement.status === 'IN_PROGRESS';

  return (
    <div
      style={{
        background: '#0E0E13',
        border: `1px solid ${isUnlocked ? achievement.color + '33' : '#2A2A3E'}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        gap: 16,
        transition: 'border-color 200ms ease',
        opacity: achievement.status === 'LOCKED' ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          isUnlocked ? achievement.color + '55' : '#3B4B3D';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          isUnlocked ? achievement.color + '33' : '#2A2A3E';
      }}
    >
      {/* Badge */}
      <div style={{ flexShrink: 0 }}>
        <ArcadeHexBadge
          icon={achievement.icon}
          color={achievement.color}
          shadowColor={achievement.color + '4D'}
          size="md"
          earned={isUnlocked}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 12,
              color: isUnlocked ? achievement.color : '#E4E1E9',
              letterSpacing: '0.05em',
            }}
          >
            {achievement.name}
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: statusColor,
              background: statusColor + '15',
              padding: '2px 6px',
              borderRadius: 2,
              flexShrink: 0,
              textTransform: 'uppercase',
            }}
          >
            {achievement.status.replace('_', ' ')}
          </span>
        </div>

        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: 11,
            color: '#6B7280',
            lineHeight: 1.5,
            marginBottom: isInProgress ? 10 : 8,
          }}
        >
          {achievement.description}
        </p>

        {/* Progress bar */}
        {isInProgress && achievement.progress !== undefined && achievement.progressMax !== undefined && (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                height: 3,
                background: 'rgba(59,75,61,0.3)',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.round((achievement.progress / achievement.progressMax) * 100)}%`,
                  background: '#FFB800',
                  borderRadius: 2,
                  transition: 'width 600ms ease',
                }}
              />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#FFB800' }}>
              {achievement.progress} / {achievement.progressMax}
            </span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isUnlocked && achievement.earnedDate && (
            <span style={{ fontFamily: MONO, fontSize: 9, color: '#4B5563' }}>
              {achievement.earnedDate}
            </span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                color: isUnlocked ? '#00FF88' : '#4B5563',
              }}
            >
              +{achievement.xpReward.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Achievements() {
  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered = filter === 'ALL' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const count = f === 'ALL' ? ACHIEVEMENTS.length : ACHIEVEMENTS.filter((a) => a.status === f).length;
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: 4,
                border: active ? '1px solid #00FF88' : '1px solid #3B4B3D',
                background: active ? 'rgba(0,255,136,0.1)' : 'transparent',
                color: active ? '#00FF88' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {f.replace('_', ' ')}
              <span
                style={{
                  background: active ? 'rgba(0,255,136,0.2)' : 'rgba(75,85,99,0.2)',
                  color: active ? '#00FF88' : '#4B5563',
                  borderRadius: 2,
                  padding: '0 4px',
                  fontSize: 9,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
