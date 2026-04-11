'use client';

import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface EstimateResult {
  size: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  factors: string[];
  assumptions: string;
}

interface AISizeEstimatorProps {
  featureTitle: string;
  problemStatement: string;
  currentSize: string | null;
  onSizeAccepted: (size: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */
const SIZE_COLORS: Record<string, string> = {
  XS: '#64748B',
  S: '#16A34A',
  M: '#2563EB',
  L: '#D97706',
  XL: '#DC2626',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const MOCK_RESULT: EstimateResult = {
  size: 'M',
  confidence: 'HIGH',
  rationale:
    'This feature requires backend API integration with two carrier systems plus a new UI table component. The data model needs a new RateCard entity with relationships. Integration testing will add overhead. Overall a solid medium-sized feature.',
  factors: ['🔗 API integration', '🖥 New UI screens', '📊 Data model', '⚠ External dependency'],
  assumptions: 'Assumes existing auth, no mobile needed',
};

const CONFIDENCE_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  HIGH:   { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: '● High confidence' },
  MEDIUM: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: '● Medium' },
  LOW:    { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: '● Low' },
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function AISizeEstimator({
  featureTitle,
  problemStatement,
  currentSize,
  onSizeAccepted,
}: AISizeEstimatorProps) {
  const [uiState, setUiState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const [rationaleExpanded, setRationaleExpanded] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';

  /* ── Estimate handler ── */
  async function handleEstimate() {
    setUiState('loading');
    setAccepted(false);
    setOverridden(false);
    try {
      const res = await fetch('/api/estimate-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: featureTitle, problemStatement }),
      });
      const data: EstimateResult = await res.json();
      if ((data as { error?: boolean }).error) throw new Error('API error');
      setResult(data);
      setUiState('result');
    } catch (err) {
      console.error('[AISizeEstimator]', err);
      setUiState('idle');
    }
  }

  /* ── Size selector handler ── */
  function handleSizeClick(size: string) {
    onSizeAccepted(size);
    if (result) setOverridden(true);
  }

  const canEstimate = featureTitle.length >= 3 && problemStatement.length >= 10;

  return (
    <div>
      {/* ── Dev demo toggle ── */}
      {isDev && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
            padding: '4px 8px',
            background: '#F8FAFC',
            border: '1px dashed #E2E8F0',
            fontSize: 11,
            color: '#94A3B8',
          }}
        >
          <span>Demo state:</span>
          {(['idle', 'loading', 'result'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s === 'result') setResult(MOCK_RESULT);
                setUiState(s);
                if (s !== 'result') { setAccepted(false); setOverridden(false); }
              }}
              style={{
                height: 22,
                paddingLeft: 8,
                paddingRight: 8,
                fontSize: 11,
                background: 'none',
                border: `1px solid ${uiState === s ? '#7C3AED' : '#E2E8F0'}`,
                color: uiState === s ? '#7C3AED' : '#94A3B8',
                cursor: 'pointer',
                borderRadius: 0,
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── Size selector ── */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#94A3B8',
            marginBottom: 6,
          }}
        >
          Effort Estimate
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {SIZES.map((size) => {
            const active = currentSize === size;
            return (
              <button
                key={size}
                onClick={() => handleSizeClick(size)}
                style={{
                  width: 40,
                  height: 32,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  background: active ? SIZE_COLORS[size] : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#475569',
                  border: `1px solid ${active ? SIZE_COLORS[size] : '#E2E8F0'}`,
                  cursor: 'pointer',
                  transition: 'all 100ms ease',
                  borderRadius: 0,
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
          XS &lt; 1wk · S 1-2wk · M 2-4wk · L 1-2mo · XL 2mo+
        </div>
        {overridden && result && (
          <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>
            ⚠ Overriding AI suggestion of {result.size}
          </div>
        )}
      </div>

      {/* ── AI Estimate Panel ── */}
      <div
        style={{
          border: '1px solid #E2E8F0',
          borderLeft: '3px solid #7C3AED',
          background: '#FAFAFA',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px 8px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#7C3AED',
            }}
          >
            ✦ AI Size Estimate
          </span>
          <span title="AI analyzes title and problem statement to suggest complexity">
            <Info size={16} style={{ color: '#94A3B8', cursor: 'default', display: 'block' }} />
          </span>
        </div>

        {/* ── IDLE STATE ── */}
        {uiState === 'idle' && (
          <div style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
            {!canEstimate ? (
              <p
                style={{
                  fontSize: 13,
                  color: '#94A3B8',
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                Fill in title and problem statement to enable AI estimation
              </p>
            ) : (
              <>
                <button
                  onClick={handleEstimate}
                  style={{
                    width: '100%',
                    height: 32,
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 0,
                    fontFamily: 'var(--font-dm-sans)',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#6D28D9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#7C3AED'; }}
                >
                  ✦ Estimate with AI
                </button>
                <p
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textAlign: 'center',
                    margin: '6px 0 0',
                  }}
                >
                  Analyzes complexity, integrations, and scope automatically
                </p>
              </>
            )}
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {uiState === 'loading' && (
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {[
              { text: 'Analyzing feature scope…',       delay: '0ms' },
              { text: 'Checking integration complexity…', delay: '800ms' },
              { text: 'Reviewing data model changes…',   delay: '1800ms' },
            ].map(({ text, delay }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: 0,
                  animation: `fadeIn 0.3s ease ${delay} forwards`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#7C3AED',
                    flexShrink: 0,
                    animation: 'ai-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: 12, fontStyle: 'italic', color: '#7C3AED' }}>{text}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── RESULT STATE ── */}
        {uiState === 'result' && result && (
          <div
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              animation: 'fadeIn 0.2s ease forwards',
            }}
          >
            {/* Top row: "AI suggests" + size badge + confidence */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>AI suggests</span>
              <div
                style={{
                  width: 48,
                  height: 40,
                  background: SIZE_COLORS[result.size] ?? '#94A3B8',
                  color: '#FFFFFF',
                  fontSize: 28,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 0,
                }}
              >
                {result.size}
              </div>
              {CONFIDENCE_STYLES[result.confidence] && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: CONFIDENCE_STYLES[result.confidence].bg,
                    color: CONFIDENCE_STYLES[result.confidence].color,
                    border: `1px solid ${CONFIDENCE_STYLES[result.confidence].border}`,
                    padding: '2px 8px',
                  }}
                >
                  {CONFIDENCE_STYLES[result.confidence].label}
                </span>
              )}
            </div>

            {/* Rationale accordion */}
            <div>
              <button
                onClick={() => setRationaleExpanded((v) => !v)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#94A3B8',
                  }}
                >
                  Rationale
                </span>
                {rationaleExpanded ? (
                  <ChevronUp size={14} style={{ color: '#94A3B8' }} />
                ) : (
                  <ChevronDown size={14} style={{ color: '#94A3B8' }} />
                )}
              </button>
              {rationaleExpanded && (
                <p
                  style={{
                    fontSize: 13,
                    color: '#475569',
                    lineHeight: 1.6,
                    margin: '4px 0 0',
                  }}
                >
                  {result.rationale}
                </p>
              )}
            </div>

            {/* Factors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {result.factors.map((f) => (
                <span
                  key={f}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 0,
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Assumptions */}
            <p style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
              Assumes: {result.assumptions}
            </p>

            {/* Action row */}
            {!accepted ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                <button
                  onClick={() => {
                    onSizeAccepted(result.size);
                    setAccepted(true);
                    setOverridden(false);
                  }}
                  style={{
                    flex: 1,
                    height: 32,
                    background: '#FFFFFF',
                    border: '1px solid #16A34A',
                    color: '#16A34A',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: 0,
                    fontFamily: 'var(--font-dm-sans)',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
                >
                  ✓ Accept suggestion
                </button>
                <button
                  onClick={() => setOverridden(true)}
                  style={{
                    height: 32,
                    paddingLeft: 12,
                    paddingRight: 12,
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    fontSize: 13,
                    cursor: 'pointer',
                    borderRadius: 0,
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  Override manually
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#16A34A',
                  fontSize: 12,
                  padding: '6px 12px',
                  marginTop: 2,
                }}
              >
                <span>✦ AI estimate accepted</span>
                <button
                  onClick={() => { setUiState('idle'); setResult(null); setAccepted(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: 12,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  Re-run
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
