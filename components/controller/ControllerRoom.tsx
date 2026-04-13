'use client';

import { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { getFeatureRewards, saveFeatureRewards, type FeatureReward, type TShirtSize } from '@/lib/feature-rewards';
import { loadPrizes, savePrizes, type Prize } from '@/lib/controller-data';
import { vibeToast } from '@/components/polish/toasts';
import ControllerStats from './ControllerStats';
import XPRewardEditor from './XPRewardEditor';
import PrizeManager from './PrizeManager';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

type Section = 'XP_CONFIG' | 'PRIZES' | 'STATS';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'XP_CONFIG', label: 'XP CONFIG' },
  { id: 'PRIZES',    label: 'PRIZES' },
  { id: 'STATS',     label: 'STATS' },
];

export default function ControllerRoom() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [rewards, setRewards] = useState<Record<TShirtSize, FeatureReward>>(
    () => getFeatureRewards()
  );
  const [prizes, setPrizes] = useState<Prize[]>(() => loadPrizes());
  const [activeSection, setActiveSection] = useState<Section>('XP_CONFIG');

  // Auth gate state
  const [passphrase, setPassphrase] = useState('');
  const [authError, setAuthError] = useState('');
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('vibeflow-is-admin') === 'true');
  }, []);

  function handleAuth() {
    if (passphrase === 'vibeflow-admin') {
      localStorage.setItem('vibeflow-is-admin', 'true');
      setIsAdmin(true);
      setAuthError('');
      vibeToast.success('Admin access granted');
    } else {
      setAuthError('// INVALID_PASSPHRASE');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  function handleLogout() {
    localStorage.removeItem('vibeflow-is-admin');
    setIsAdmin(false);
    setPassphrase('');
    setAuthError('');
  }

  function handleRewardsChange(newRewards: Record<TShirtSize, FeatureReward>) {
    setRewards(newRewards);
    saveFeatureRewards(newRewards);
    vibeToast.ai('XP config updated — live immediately');
  }

  function handlePrizesChange(newPrizes: Prize[]) {
    setPrizes(newPrizes);
    savePrizes(newPrizes);
  }

  /* ── ACCESS GATE ── */
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 0 30px rgba(255,68,68,0.15)',
          }}
        >
          <Lock size={32} style={{ color: '#FF4444' }} />
        </div>

        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 32,
            fontWeight: 900,
            color: '#FF4444',
            marginBottom: 8,
          }}
        >
          // ACCESS_DENIED
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 32,
          }}
        >
          This area is restricted to super admins.
        </div>

        {/* Admin login */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: '#6B7280',
              marginBottom: 4,
            }}
          >
            Enter admin passphrase:
          </div>

          <div style={{ animation: shaking ? 'shake 0.5s ease' : 'none' }}>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setAuthError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAuth();
              }}
              placeholder="passphrase"
              style={{
                width: 256,
                background: '#0A0A0F',
                border: `1px solid ${authError ? '#FF4444' : '#3B4B3D'}`,
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 14,
                color: '#F0FFF4',
                padding: '10px 16px',
                outline: 'none',
                textAlign: 'center',
                display: 'block',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = authError ? '#FF4444' : '#FF4444';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = authError ? '#FF4444' : '#3B4B3D';
              }}
            />
          </div>

          {authError && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: '#FF4444',
                letterSpacing: '0.05em',
              }}
            >
              {authError}
            </div>
          )}

          <button
            onClick={handleAuth}
            style={{
              height: 36,
              padding: '0 24px',
              background: 'none',
              border: '1px solid #FF4444',
              borderRadius: 4,
              fontFamily: MONO,
              fontSize: 12,
              color: '#FF4444',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            AUTHENTICATE
          </button>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-10px); }
            40%       { transform: translateX(10px); }
            60%       { transform: translateX(-6px); }
            80%       { transform: translateX(6px); }
          }
        `}</style>
      </div>
    );
  }

  /* ── ADMIN UI ── */
  return (
    <div style={{ background: '#0A0A0F', minHeight: '100%', color: '#E4E1E9' }}>
      {/* Admin header */}
      <div
        style={{
          background: '#111118',
          borderBottom: '1px solid rgba(255,68,68,0.3)',
          padding: '24px 32px',
          marginBottom: 32,
          boxShadow: '0 0 30px rgba(255,68,68,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 28,
              fontWeight: 900,
              color: '#FF4444',
              fontStyle: 'italic',
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            // CONTROLLER_ROOM
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: '#FF4444',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            SUPER ADMIN ACCESS
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              background: 'rgba(255,68,68,0.15)',
              border: '1px solid rgba(255,68,68,0.4)',
              color: '#FF4444',
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 4,
              letterSpacing: '0.1em',
            }}
          >
            ADMIN
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: MONO,
              fontSize: 11,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '0 32px 60px' }}>
        {/* Section nav */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 32,
            borderBottom: '1px solid #2A2A3E',
          }}
        >
          {SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #FF4444' : '2px solid transparent',
                  color: active ? '#FF4444' : '#4B5563',
                  fontFamily: MONO,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = '#4B5563';
                }}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeSection === 'XP_CONFIG' && (
          <>
            <ControllerStats />
            <XPRewardEditor rewards={rewards} onChange={handleRewardsChange} />
          </>
        )}
        {activeSection === 'PRIZES' && (
          <PrizeManager prizes={prizes} onChange={handlePrizesChange} />
        )}
        {activeSection === 'STATS' && <ControllerStats />}
      </div>
    </div>
  );
}
