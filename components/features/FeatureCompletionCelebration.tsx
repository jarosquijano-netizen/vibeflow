'use client';

import { useState, useEffect } from 'react';
import type { Feature } from '@/types';
import type { FeatureReward } from '@/lib/feature-rewards';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

/* Deterministic "random" from index — no Math.random for SSR safety */
function dRand(i: number, mod: number): number {
  return ((i * 2654435761) >>> 0) % mod;
}

const ICON_MAP: Record<string, string> = {
  check_circle:      '✓',
  rocket_launch:     '🚀',
  military_tech:     '★',
  workspace_premium: '♦',
  crown:             '♛',
};

interface Props {
  feature: Feature | null;
  reward: FeatureReward | null;
  onDismiss: () => void;
}

export default function FeatureCompletionCelebration({ feature, reward, onDismiss }: Props) {
  const [countdown, setCountdown] = useState(5);
  const [particlesVisible, setParticlesVisible] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [xpVisible, setXpVisible] = useState(false);

  useEffect(() => {
    if (!feature || !reward) return;

    const t1 = setTimeout(() => setParticlesVisible(true), 100);
    const t2 = setTimeout(() => setBadgePulse(true), 300);
    const t3 = setTimeout(() => setXpVisible(true), 200);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feature || !reward) return null;

  const icon = ICON_MAP[reward.badge] ?? '◆';
  const truncTitle = feature.title.length > 40
    ? feature.title.slice(0, 37) + '...'
    : feature.title;

  /* Build 20 deterministic particles */
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = dRand(i, 360) * (Math.PI / 180);
    const dist  = 120 + dRand(i * 7, 300);
    const size  = 4 + dRand(i * 3, 6);
    const color = reward.particles[dRand(i * 5, reward.particles.length)];
    const tx    = Math.round(Math.cos(angle) * dist);
    const ty    = Math.round(Math.sin(angle) * dist);
    const dur   = 800 + dRand(i * 11, 1000);
    const delay = dRand(i * 13, 300);
    return { size, color, tx, ty, dur, delay };
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onDismiss}
    >
      {/* Particle burst */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              /* CSS custom properties for the animation target */
              ['--tx' as string]: `${p.tx}px`,
              ['--ty' as string]: `${p.ty}px`,
              animation: particlesVisible
                ? `particle-burst ${p.dur}ms ${p.delay}ms ease-out both`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* Main panel — stopPropagation so clicking panel doesn't dismiss */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {/* Size chip */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginBottom: 20,
          }}
        >
          {reward.size} FEATURE SHIPPED
        </div>

        {/* Hex badge */}
        <div
          style={{
            width: 128,
            height: 128,
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            background: `linear-gradient(135deg, ${reward.badgeColor} 0%, ${reward.badgeColor}88 100%)`,
            border: `2px solid ${reward.badgeColor}`,
            boxShadow: `0 0 60px ${reward.badgeShadow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: badgePulse ? 'badge-pulse 2s ease-in-out infinite' : 'none',
            marginBottom: 20,
            ['--badge-shadow' as string]: reward.badgeShadow,
          }}
        >
          <span
            style={{
              fontSize: 52,
              color: '#FFFFFF',
              lineHeight: 1,
              textShadow: `0 0 20px ${reward.badgeColor}`,
            }}
          >
            {icon}
          </span>
        </div>

        {/* Rank badge */}
        <div
          style={{
            display: 'inline-block',
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            color: reward.badgeColor,
            background: `${reward.badgeColor}20`,
            border: `1px solid ${reward.badgeColor}`,
            padding: '3px 16px',
            borderRadius: 4,
            marginBottom: 16,
            letterSpacing: '0.1em',
          }}
        >
          RANK {reward.rank}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 56,
            fontWeight: 900,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            textShadow: `0 0 40px ${reward.badgeShadow}`,
            marginBottom: 8,
          }}
        >
          {reward.title}
        </div>

        {/* Feature name */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 14,
            color: '#6B7280',
            fontStyle: 'italic',
            marginBottom: 16,
          }}
        >
          "{truncTitle}"
        </div>

        {/* XP earned */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 72,
            fontWeight: 900,
            color: reward.badgeColor,
            lineHeight: 1,
            textShadow: `0 0 30px ${reward.badgeShadow}`,
            animation: xpVisible ? 'xp-pop 0.4s ease forwards' : 'none',
            opacity: xpVisible ? undefined : 0,
            marginBottom: 12,
          }}
        >
          +{reward.xp.toLocaleString()} XP
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: '#9CA3AF',
            marginBottom: 40,
          }}
        >
          {reward.subtitle}
        </div>

        {/* CTA + countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onDismiss}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '12px 40px',
              background: '#FFFFFF',
              color: '#000000',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = reward.badgeColor;
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = '#000000';
            }}
          >
            CONTINUE MISSION
          </button>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: '#4B5563',
            }}
          >
            Auto-closing in {countdown}s
          </div>
        </div>
      </div>
    </div>
  );
}
