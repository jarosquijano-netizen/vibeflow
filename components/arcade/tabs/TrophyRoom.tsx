'use client';

import { useState } from 'react';
import { TROPHIES, type Trophy } from '@/lib/arcade-data';
import ArcadeHexBadge from '@/components/arcade/ArcadeHexBadge';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

function TrophyModal({ trophy, onClose }: { trophy: Trophy; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111118',
          border: `1px solid ${trophy.color}33`,
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '90%',
          boxShadow: `0 0 60px ${trophy.shadowColor}`,
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#4B5563',
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <ArcadeHexBadge
            icon={trophy.icon}
            color={trophy.color}
            shadowColor={trophy.shadowColor}
            size="lg"
            earned={trophy.earned}
          />
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 900,
            fontSize: 20,
            color: trophy.earned ? trophy.color : '#6B7280',
            textAlign: 'center',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          {trophy.name}
        </div>

        {/* Status pill */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: trophy.earned ? '#00FF88' : '#4B5563',
              background: trophy.earned ? 'rgba(0,255,136,0.1)' : 'rgba(75,85,99,0.15)',
              padding: '3px 10px',
              borderRadius: 2,
            }}
          >
            {trophy.earned ? `EARNED · ${trophy.earnedDate}` : 'LOCKED'}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            color: '#B9CBB9',
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {trophy.description}
        </p>

        {/* How to earn */}
        <div
          style={{
            background: '#0A0A0F',
            border: '1px solid #2A2A3E',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#4B5563',
              marginBottom: 6,
            }}
          >
            // HOW_TO_EARN
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>
            {trophy.howToEarn}
          </div>
        </div>

        {/* Earned by */}
        {trophy.earnedBy && trophy.earnedBy.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#4B5563',
                marginBottom: 8,
              }}
            >
              // EARNED_BY
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {trophy.earnedBy.map((name) => (
                <span
                  key={name}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    color: '#B9CBB9',
                    background: 'rgba(185,203,185,0.08)',
                    border: '1px solid #3B4B3D',
                    padding: '2px 8px',
                    borderRadius: 3,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrophyRoom() {
  const [selected, setSelected] = useState<Trophy | null>(null);

  const earned = TROPHIES.filter((t) => t.earned);
  const locked = TROPHIES.filter((t) => !t.earned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Earned */}
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(0,255,136,0.5)',
            marginBottom: 20,
          }}
        >
          // EARNED_TROPHIES ({earned.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {earned.map((trophy) => (
            <div
              key={trophy.id}
              onClick={() => setSelected(trophy)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <ArcadeHexBadge
                icon={trophy.icon}
                color={trophy.color}
                shadowColor={trophy.shadowColor}
                size="lg"
                earned
                onClick={() => setSelected(trophy)}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: trophy.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  maxWidth: 80,
                }}
              >
                {trophy.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#4B5563',
            marginBottom: 20,
          }}
        >
          // LOCKED_TROPHIES ({locked.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {locked.map((trophy) => (
            <div
              key={trophy.id}
              onClick={() => setSelected(trophy)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <ArcadeHexBadge
                icon={trophy.icon}
                color={trophy.color}
                shadowColor={trophy.shadowColor}
                size="lg"
                earned={false}
                onClick={() => setSelected(trophy)}
              />
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  maxWidth: 80,
                }}
              >
                {trophy.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <TrophyModal trophy={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
