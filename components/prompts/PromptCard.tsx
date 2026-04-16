'use client';

import { useState } from 'react';
import { Copy, Link } from 'lucide-react';
import type { Prompt } from '@/types';
import { vibeToast } from '@/components/polish/toasts';
import { useTheme } from '@/components/providers/ThemeProvider';

/* ------------------------------------------------------------------ */
/*  Config — Default                                                    */
/* ------------------------------------------------------------------ */
export const TOOL_CONFIG: Record<string, { color: string; bg: string }> = {
  v0:      { color: '#000000', bg: '#F8FAFC' },
  Cursor:  { color: '#2563EB', bg: '#EFF6FF' },
  Bolt:    { color: '#D97706', bg: '#FFF7ED' },
  ChatGPT: { color: '#10A37F', bg: '#F0FDF9' },
  Claude:  { color: '#D4762A', bg: '#FFF7ED' },
  Other:   { color: '#64748B', bg: '#F8FAFC' },
};

/* ------------------------------------------------------------------ */
/*  Config — Cyber                                                      */
/* ------------------------------------------------------------------ */
export const CYBER_TOOL_CONFIG: Record<string, { color: string; border: string; bg: string }> = {
  v0:      { color: '#F8F8F2', border: 'rgba(248,248,242,0.3)', bg: 'rgba(248,248,242,0.05)' },
  Cursor:  { color: '#00D4FF', border: 'rgba(0,212,255,0.3)',   bg: 'rgba(0,212,255,0.05)'   },
  Bolt:    { color: '#FFB800', border: 'rgba(255,184,0,0.3)',   bg: 'rgba(255,184,0,0.05)'   },
  ChatGPT: { color: '#00FF88', border: 'rgba(0,255,136,0.3)',   bg: 'rgba(0,255,136,0.05)'   },
  Claude:  { color: '#BF00FF', border: 'rgba(191,0,255,0.3)',   bg: 'rgba(191,0,255,0.05)'   },
  Other:   { color: '#4B5563', border: 'rgba(75,85,99,0.3)',    bg: 'rgba(75,85,99,0.05)'    },
};

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  PromptCard                                                          */
/* ------------------------------------------------------------------ */
interface PromptCardProps {
  prompt: Prompt;
  onCopy: (id: string) => void;
  onUseInSession: (id: string) => void;
}

export default function PromptCard({ prompt, onCopy, onUseInSession }: PromptCardProps) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [copied, setCopied] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);

  const tool = TOOL_CONFIG[prompt.tool] ?? TOOL_CONFIG.Other;
  const cyberTool = CYBER_TOOL_CONFIG[prompt.tool] ?? CYBER_TOOL_CONFIG.Other;
  const previewText = prompt.body.slice(0, 180);
  const hasMore = prompt.body.length > 180;

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    onCopy(prompt.id);
    vibeToast.success('Prompt copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <div
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
        style={{
          position: 'relative',
          background: '#111118',
          borderTop: `3px solid ${cyberTool.color}`,
          borderRight: cardHovered ? `1px solid ${cyberTool.border}` : '1px solid #3B4B3D',
          borderBottom: cardHovered ? `1px solid ${cyberTool.border}` : '1px solid #3B4B3D',
          borderLeft: cardHovered ? `1px solid ${cyberTool.border}` : '1px solid #3B4B3D',
          borderRadius: 6,
          overflow: 'hidden',
          transform: cardHovered ? 'translateY(-1px)' : 'none',
          boxShadow: cardHovered ? `0 0 20px ${cyberTool.border}` : 'none',
          transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
          marginBottom: 12,
          breakInside: 'avoid',
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: '12px 12px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Left: tool badge + output type + stars */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  background: cyberTool.bg,
                  border: `1px solid ${cyberTool.border}`,
                  color: cyberTool.color,
                  fontFamily: MONO,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                }}
              >
                {prompt.tool}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: '#6B7280',
                  marginLeft: 4,
                }}
              >
                {prompt.outputType}
              </span>
            </div>
            {/* Stars */}
            <div style={{ display: 'flex', gap: 2, marginTop: 5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    fontSize: 10,
                    color: star <= prompt.quality ? '#FFB800' : '#3B4B3D',
                    lineHeight: 1,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Right: version badge */}
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: '#6B7280',
              background: '#0E0E13',
              border: '1px solid #3B4B3D',
              padding: '1px 6px',
              flexShrink: 0,
            }}
          >
            v{prompt.version}
          </span>
        </div>

        {/* ── TITLE ── */}
        <div
          style={{
            padding: '0 12px 8px',
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 600,
            color: '#F0FFF4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {prompt.title}
        </div>

        {/* ── BODY PREVIEW ── */}
        <div style={{ padding: '0 12px 8px' }}>
          <div
            style={{
              background: '#111118',
              borderLeft: '2px solid #3B4B3D',
              padding: 8,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: '#6B7280',
                lineHeight: 1.5,
              }}
            >
              {previewText}
              {hasMore && (
                <>
                  {'...'}
                  <span
                    style={{
                      color: '#00D4FF',
                      cursor: 'pointer',
                      fontFamily: MONO,
                      marginLeft: 2,
                    }}
                  >
                    show more
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* ── TAGS ── */}
        <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                background: '#0E0E13',
                border: '1px solid #3B4B3D',
                color: '#6B7280',
                fontFamily: MONO,
                fontSize: 10,
                padding: '1px 6px',
              }}
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span
              style={{
                background: '#0E0E13',
                border: '1px solid #3B4B3D',
                color: '#6B7280',
                fontFamily: MONO,
                fontSize: 10,
                padding: '1px 6px',
              }}
            >
              +{prompt.tags.length - 3} more
            </span>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            padding: '0 12px 44px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563' }}>
            {prompt.usedInFeatures.length > 0
              ? `Used in ${prompt.usedInFeatures.length} feature${prompt.usedInFeatures.length !== 1 ? 's' : ''}`
              : 'Not used yet'}
          </span>

          <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
            {/* Copied tooltip — cyber */}
            {copied && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  background: '#0E0E13',
                  border: '1px solid #00FF88',
                  color: '#00FF88',
                  fontFamily: MONO,
                  fontSize: 10,
                  padding: '3px 8px',
                  marginBottom: 4,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                Copied!
              </div>
            )}

            {/* Copy button — cyber */}
            <button
              onClick={handleCopy}
              onMouseEnter={() => setCopyHovered(true)}
              onMouseLeave={() => setCopyHovered(false)}
              style={{
                width: 28,
                height: 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: copyHovered ? '#00FF88' : '#6B7280',
                boxShadow: copyHovered ? '0 0 8px rgba(0,255,136,0.3)' : 'none',
                padding: 0,
                borderRadius: 0,
                transition: 'color 150ms ease, box-shadow 150ms ease',
              }}
              title="Copy prompt"
            >
              <Copy size={14} />
            </button>

            {/* Link button — cyber */}
            <button
              style={{
                width: 28,
                height: 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                padding: 0,
                borderRadius: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
              title="Link"
            >
              <Link size={14} />
            </button>
          </div>
        </div>

        {/* ── HOVER OVERLAY — cyber ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: '#BF00FF',
            boxShadow: '0 -8px 20px rgba(191,0,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: cardHovered ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 150ms ease',
            cursor: 'pointer',
          }}
          onClick={() => onUseInSession(prompt.id)}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 700,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            ✦ USE_IN_SESSION
          </span>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  DEFAULT RENDER                                                   */
  /* ================================================================ */
  return (
    <div
      className="group"
      style={{
        position: 'relative',
        borderTop: `3px solid ${tool.color}`,
        borderRight: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        borderLeft: '1px solid #E2E8F0',
        background: '#FFFFFF',
        overflow: 'hidden',
        transition: 'border-color 150ms ease, transform 150ms ease',
        marginBottom: 12,
        breakInside: 'avoid',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderRightColor = '#2563EB';
        el.style.borderBottomColor = '#2563EB';
        el.style.borderLeftColor = '#2563EB';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderRightColor = '#E2E8F0';
        el.style.borderBottomColor = '#E2E8F0';
        el.style.borderLeftColor = '#E2E8F0';
        el.style.transform = 'none';
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: '12px 12px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: tool badge + output type + stars */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                background: tool.bg,
                color: tool.color,
                fontSize: 10,
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '2px 6px',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {prompt.tool}
            </span>
            <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
              {prompt.outputType}
            </span>
          </div>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 1, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  fontSize: 11,
                  color: star <= prompt.quality ? '#D97706' : '#E2E8F0',
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Right: version badge */}
        <span
          style={{
            fontSize: 10,
            color: '#94A3B8',
            background: '#F1F5F9',
            padding: '2px 6px',
            flexShrink: 0,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          v{prompt.version}
        </span>
      </div>

      {/* ── TITLE ── */}
      <div
        style={{
          padding: '0 12px 8px',
          fontSize: 14,
          fontWeight: 600,
          color: '#0F172A',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {prompt.title}
      </div>

      {/* ── BODY PREVIEW ── */}
      <div style={{ padding: '0 12px 8px' }}>
        <div
          style={{
            background: '#F8FAFC',
            borderLeft: '2px solid #E2E8F0',
            padding: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 11,
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            {previewText}
            {hasMore && (
              <>
                {'...'}
                <span
                  style={{
                    color: '#2563EB',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-dm-sans)',
                    marginLeft: 2,
                  }}
                >
                  show more
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── TAGS ── */}
      <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {prompt.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              fontSize: 10,
              padding: '2px 6px',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            {tag}
          </span>
        ))}
        {prompt.tags.length > 3 && (
          <span
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              fontSize: 10,
              padding: '2px 6px',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            +{prompt.tags.length - 3} more
          </span>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          padding: '0 12px 44px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
          {prompt.usedInFeatures.length > 0
            ? `Used in ${prompt.usedInFeatures.length} feature${prompt.usedInFeatures.length !== 1 ? 's' : ''}`
            : 'Not used yet'}
        </span>

        <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
          {/* Copied tooltip */}
          {copied && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: 10,
                padding: '4px 8px',
                marginBottom: 4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              Copied!
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              width: 28,
              height: 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              padding: 0,
              borderRadius: 0,
            }}
            title="Copy prompt"
          >
            <Copy size={14} />
          </button>

          {/* Link button */}
          <button
            style={{
              width: 28,
              height: 28,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              padding: 0,
              borderRadius: 0,
            }}
            title="Link"
          >
            <Link size={14} />
          </button>
        </div>
      </div>

      {/* ── HOVER OVERLAY ── */}
      <div
        className="translate-y-full group-hover:translate-y-0"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: '#7C3AED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 150ms ease',
          cursor: 'pointer',
        }}
        onClick={() => onUseInSession(prompt.id)}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          ✦ Use in session
        </span>
      </div>
    </div>
  );
}
