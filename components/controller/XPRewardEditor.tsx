'use client';

import { useState } from 'react';
import type { Feature } from '@/types';
import { DEFAULT_FEATURE_REWARDS, type FeatureReward, type TShirtSize } from '@/lib/feature-rewards';
import FeatureCompletionCelebration from '@/components/features/FeatureCompletionCelebration';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

const SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL'];
const RANKS = ['C', 'B', 'A', 'S', 'S+'];

const ICON_MAP: Record<string, string> = {
  check_circle:      '✓',
  rocket_launch:     '🚀',
  military_tech:     '★',
  workspace_premium: '♦',
  crown:             '♛',
};

interface Props {
  rewards: Record<TShirtSize, FeatureReward>;
  onChange: (rewards: Record<TShirtSize, FeatureReward>) => void;
}

export default function XPRewardEditor({ rewards, onChange }: Props) {
  const [local, setLocal] = useState<Record<TShirtSize, FeatureReward>>(
    () => ({ ...rewards })
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSize, setPreviewSize] = useState<TShirtSize>('M');
  const [showPreview, setShowPreview] = useState(false);

  function update(size: TShirtSize, field: keyof FeatureReward, value: string | number) {
    setLocal((prev) => ({
      ...prev,
      [size]: { ...prev[size], [field]: value },
    }));
  }

  function resetSize(size: TShirtSize) {
    setLocal((prev) => ({
      ...prev,
      [size]: { ...DEFAULT_FEATURE_REWARDS[size] },
    }));
  }

  const previewReward = local[previewSize];
  const previewFeature: Feature = {
    id: 'ctrl-preview',
    title: 'Preview Feature',
    problemStatement: 'Preview celebration overlay',
    status: 'DONE',
    size: previewSize,
    quarter: 'Q2 2026',
    owner: 'Jordan Davies',
  };

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        // XP_REWARDS_CONFIG
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: '#4B5563',
          marginBottom: 24,
        }}
      >
        Configure XP earned when a feature is shipped by size.
      </div>

      {/* Size reward cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {SIZES.map((size) => {
          const r = local[size];

          const inputBase: React.CSSProperties = {
            background: '#0A0A0F',
            border: '1px solid #3B4B3D',
            borderRadius: 4,
            fontFamily: MONO,
            padding: '8px 12px',
            width: '100%',
            outline: 'none',
          };

          const labelStyle: React.CSSProperties = {
            fontFamily: MONO,
            fontSize: 9,
            color: '#4B5563',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 4,
            display: 'block',
          };

          return (
            <div
              key={size}
              style={{
                background: '#111118',
                border: '1px solid #3B4B3D',
                borderLeft: `4px solid ${r.badgeColor}`,
                borderRadius: 6,
                padding: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 16,
                alignItems: 'center',
              }}
            >
              {/* LEFT — col-span-2 */}
              <div style={{ gridColumn: 'span 2' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: `${r.badgeColor}33`,
                    border: `1px solid ${r.badgeColor}`,
                    color: r.badgeColor,
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                >
                  {size}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    color: '#4B5563',
                    fontStyle: 'italic',
                  }}
                >
                  {r.title}
                </div>
              </div>

              {/* XP INPUT — col-span-2 */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>XP Reward</label>
                <input
                  type="number"
                  value={r.xp}
                  onChange={(e) => update(size, 'xp', Number(e.target.value))}
                  style={{
                    ...inputBase,
                    fontSize: 14,
                    color: r.badgeColor,
                    fontWeight: 700,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = r.badgeColor;
                    e.currentTarget.style.boxShadow = `0 0 8px ${r.badgeShadow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#3B4B3D';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    color: '#4B5563',
                    marginTop: 2,
                  }}
                >
                  XP
                </div>
              </div>

              {/* RANK — col-span-2 */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Rank</label>
                <select
                  value={r.rank}
                  onChange={(e) => update(size, 'rank', e.target.value)}
                  style={{
                    ...inputBase,
                    fontSize: 14,
                    color: r.badgeColor,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = r.badgeColor;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#3B4B3D';
                  }}
                >
                  {RANKS.map((rank) => (
                    <option key={rank} value={rank} style={{ background: '#0A0A0F' }}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE — col-span-3 */}
              <div style={{ gridColumn: 'span 3' }}>
                <label style={labelStyle}>Celebration Title</label>
                <input
                  type="text"
                  value={r.title}
                  onChange={(e) => update(size, 'title', e.target.value)}
                  style={{
                    ...inputBase,
                    fontSize: 13,
                    color: '#F0FFF4',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = r.badgeColor;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#3B4B3D';
                  }}
                />
              </div>

              {/* PREVIEW — col-span-2 */}
              <div
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ ...labelStyle, textAlign: 'center', display: 'block' }}>Preview</div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    background: `${r.badgeColor}33`,
                    border: `1px solid ${r.badgeColor}`,
                    boxShadow: `0 0 12px ${r.badgeShadow}66`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 18, color: r.badgeColor }}>
                    {ICON_MAP[r.badge] ?? '◆'}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: r.badgeColor,
                    fontWeight: 700,
                  }}
                >
                  +{r.xp.toLocaleString()} XP
                </div>
              </div>

              {/* RESET — col-span-1 */}
              <div
                style={{
                  gridColumn: 'span 1',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <button
                  title="Reset to default"
                  onClick={() => resetSize(size)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#4B5563',
                    fontSize: 20,
                    padding: 4,
                    lineHeight: 1,
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#4B5563';
                  }}
                >
                  ↺
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <button
        onClick={() => onChange(local)}
        style={{
          width: '100%',
          height: 40,
          background: '#00FF88',
          color: '#000000',
          border: 'none',
          borderRadius: 4,
          fontFamily: DISPLAY,
          fontWeight: 900,
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          cursor: 'pointer',
          transition: 'box-shadow 150ms ease',
          marginBottom: 24,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,136,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        SAVE XP CONFIG
      </button>

      {/* Live preview box */}
      <div
        style={{
          border: '1px solid #3B4B3D',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setPreviewOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#111118',
            border: 'none',
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: 12,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00FF88';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <span>// PREVIEW_CELEBRATION</span>
          <span>{previewOpen ? '▲' : '▼'}</span>
        </button>

        {previewOpen && (
          <div
            style={{
              padding: '16px 20px',
              background: '#0D0D15',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <label
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: '#6B7280',
                flexShrink: 0,
              }}
            >
              SIZE:
            </label>
            <select
              value={previewSize}
              onChange={(e) => setPreviewSize(e.target.value as TShirtSize)}
              style={{
                background: '#0A0A0F',
                border: '1px solid #3B4B3D',
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 12,
                color: '#F0FFF4',
                padding: '6px 10px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {SIZES.map((s) => (
                <option key={s} value={s} style={{ background: '#0A0A0F' }}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowPreview(true)}
              style={{
                background: '#1A1A28',
                border: '1px solid #3B4B3D',
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 11,
                color: '#00FF88',
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00FF88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#3B4B3D';
              }}
            >
              PREVIEW →
            </button>
          </div>
        )}
      </div>

      {/* Celebration overlay for preview */}
      {showPreview && (
        <FeatureCompletionCelebration
          feature={previewFeature}
          reward={previewReward}
          onDismiss={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
