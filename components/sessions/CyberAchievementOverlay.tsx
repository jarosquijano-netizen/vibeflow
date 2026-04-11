'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  icon: string;
  name: string;
  xp: number;
}

interface CyberAchievementOverlayProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const PARTICLES = [
  { top: '18%', left: '10%',  color: '#00FF88', delay: '0s',    dur: '2.5s' },
  { top: '14%', left: '82%',  color: '#FFB800', delay: '0.3s',  dur: '3.0s' },
  { top: '72%', left: '8%',   color: '#BF00FF', delay: '0.6s',  dur: '2.0s' },
  { top: '76%', left: '88%',  color: '#00FF88', delay: '0.9s',  dur: '3.5s' },
  { top: '42%', left: '5%',   color: '#FFB800', delay: '0.2s',  dur: '2.8s' },
  { top: '36%', left: '93%',  color: '#BF00FF', delay: '0.5s',  dur: '3.2s' },
  { top: '58%', left: '22%',  color: '#00FF88', delay: '0.8s',  dur: '2.2s' },
  { top: '62%', left: '78%',  color: '#FFB800', delay: '0.4s',  dur: '2.6s' },
] as const;

const AUTO_DISMISS_SECS = 5;

export default function CyberAchievementOverlay({
  achievement,
  onDismiss,
}: CyberAchievementOverlayProps) {
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECS);

  useEffect(() => {
    if (!achievement) return;
    setCountdown(AUTO_DISMISS_SECS);
    const id = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(id); onDismiss(); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <>
      {/* Keyframes */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 1; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 0.7; }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(0,255,136,0.5), 0 0 0 4px rgba(0,255,136,0.2); }
          50% { box-shadow: 0 0 60px rgba(0,255,136,0.8), 0 0 0 8px rgba(0,255,136,0.3); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onDismiss}
      >
        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              pointerEvents: 'none',
              animation: `float-particle ${p.dur} ${p.delay} ease-in-out infinite`,
            }}
          />
        ))}

        {/* Main card — stop propagation so clicking card doesn't dismiss */}
        <div
          style={{ textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hexagon badge */}
          <div
            style={{
              width: 128,
              height: 128,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'linear-gradient(135deg, #00FF88, #003919)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'badge-pulse 1.5s ease-in-out infinite',
            }}
          >
            <span style={{ fontSize: 52, lineHeight: 1, userSelect: 'none' }}>🏆</span>
          </div>

          {/* Label */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#FFB800',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            ACHIEVEMENT UNLOCKED
          </div>

          {/* Name */}
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {achievement.name}
          </div>

          {/* XP */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 64,
              fontWeight: 900,
              color: '#00FF88',
              filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.6))',
              lineHeight: 1,
              marginBottom: 32,
            }}
          >
            +{achievement.xp} XP
          </div>

          {/* Continue button */}
          <button
            onClick={onDismiss}
            style={{
              paddingLeft: 32,
              paddingRight: 32,
              paddingTop: 12,
              paddingBottom: 12,
              background: '#FFFFFF',
              border: 'none',
              color: '#000000',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#00FF88';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            CONTINUE
          </button>

          {/* Countdown */}
          <div
            style={{
              marginTop: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#4B5563',
            }}
          >
            Auto-closing in {countdown}s
          </div>
        </div>
      </div>
    </>
  );
}
