'use client';

import {
  FeatureCardSkeleton,
  PromptCardSkeleton,
  SessionListItemSkeleton,
  KPICardSkeleton,
  FeatureBoardSkeleton,
} from './skeletons';
import {
  EmptyFeatureBoard,
  EmptyPromptLibrary,
  EmptyVibeSessions,
  EmptySearchResults,
} from './empty-states';
import { vibeToast } from './toasts';

/* ------------------------------------------------------------------ */
/*  Section label                                                        */
/* ------------------------------------------------------------------ */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#94A3B8',
        fontWeight: 600,
        letterSpacing: '0.06em',
        fontFamily: 'var(--font-dm-sans)',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PolishShowcase                                                       */
/* ------------------------------------------------------------------ */
export default function PolishShowcase() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        padding: 48,
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          VibeFlow — Polish Showcase
        </h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, marginBottom: 0 }}>
          Dev reference page for all polish components
        </p>
      </div>

      {/* ── SKELETONS ── */}
      <Section label="Skeleton Loaders">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8, fontFamily: 'var(--font-dm-sans)' }}>
            Feature Board (3 columns)
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, overflow: 'hidden' }}>
            <FeatureBoardSkeleton columns={3} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>Session List Items</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', width: 320 }}>
            <SessionListItemSkeleton />
            <SessionListItemSkeleton />
            <SessionListItemSkeleton />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>KPI Cards</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 200px)', gap: 12 }}>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </div>
        </div>
      </Section>

      {/* ── EMPTY STATES ── */}
      <Section label="Empty States">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <EmptyFeatureBoard onCta={() => vibeToast.success('New feature CTA clicked')} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <EmptyPromptLibrary onCta={() => vibeToast.success('New prompt CTA clicked')} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <EmptyVibeSessions onCta={() => vibeToast.success('New session CTA clicked')} />
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <EmptySearchResults query="rate cards" onClear={() => vibeToast.info('Search cleared')} />
          </div>
        </div>
      </Section>

      {/* ── TOASTS ── */}
      <Section label="Toast Notifications">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Success toast', fn: () => vibeToast.success('Feature saved successfully') },
            { label: 'Error toast',   fn: () => vibeToast.error('Sync failed — check connection') },
            { label: 'Info toast',    fn: () => vibeToast.info('Session reopened') },
            { label: 'AI toast',      fn: () => vibeToast.ai('Size estimated — M with high confidence') },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              style={{
                height: 32,
                paddingLeft: 12,
                paddingRight: 12,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: 13,
                cursor: 'pointer',
                borderRadius: 0,
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── COMMAND PALETTE ── */}
      <Section label="Command Palette">
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
            fontSize: 13,
            cursor: 'pointer',
            borderRadius: 0,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Open ⌘K palette
        </button>
      </Section>

      {/* ── KEYBOARD SHORTCUTS ── */}
      <Section label="Keyboard Shortcuts">
        <button
          onClick={() => window.dispatchEvent(new Event('open-keyboard-shortcuts'))}
          style={{
            height: 32,
            paddingLeft: 12,
            paddingRight: 12,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
            fontSize: 13,
            cursor: 'pointer',
            borderRadius: 0,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Open ? shortcuts
        </button>
      </Section>
    </div>
  );
}
