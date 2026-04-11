'use client';

/* ------------------------------------------------------------------ */
/*  Base layout                                                          */
/* ------------------------------------------------------------------ */
function EmptyBase({
  icon,
  headline,
  subtext,
  ctaLabel,
  onCta,
}: {
  icon: React.ReactNode;
  headline: string;
  subtext: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 96,
        paddingBottom: 96,
        paddingLeft: 32,
        paddingRight: 32,
        textAlign: 'center',
      }}
    >
      {icon}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#475569',
          marginTop: 16,
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontSize: 13,
          color: '#94A3B8',
          marginTop: 4,
          maxWidth: 320,
          lineHeight: 1.5,
          fontFamily: 'var(--font-dm-sans)',
        }}
      >
        {subtext}
      </div>
      <button
        onClick={onCta}
        style={{
          height: 32,
          paddingLeft: 16,
          paddingRight: 16,
          background: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: 0,
          marginTop: 24,
          fontFamily: 'var(--font-dm-sans)',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyFeatureBoard                                                    */
/* ------------------------------------------------------------------ */
export function EmptyFeatureBoard({ onCta }: { onCta: () => void }) {
  return (
    <EmptyBase
      icon={
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* 3-column kanban */}
          <rect x="4"  y="12" width="16" height="40" />
          <rect x="24" y="12" width="16" height="40" />
          <rect x="44" y="12" width="16" height="40" />
          {/* Cards in column 1 */}
          <rect x="7"  y="16" width="10" height="6" />
          <rect x="7"  y="25" width="10" height="6" />
          {/* Cards in column 2 */}
          <rect x="27" y="16" width="10" height="6" />
          <rect x="27" y="25" width="10" height="6" />
          <rect x="27" y="34" width="10" height="6" />
          {/* Cards in column 3 */}
          <rect x="47" y="16" width="10" height="6" />
        </svg>
      }
      headline="Your feature board is empty"
      subtext="Add your first feature idea to start building your roadmap"
      ctaLabel="+ Add First Feature"
      onCta={onCta}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyPromptLibrary                                                   */
/* ------------------------------------------------------------------ */
export function EmptyPromptLibrary({ onCta }: { onCta: () => void }) {
  return (
    <EmptyBase
      icon={
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* Document outline */}
          <rect x="12" y="8" width="40" height="48" />
          {/* Three text lines */}
          <line x1="20" y1="22" x2="44" y2="22" />
          <line x1="20" y1="30" x2="44" y2="30" />
          <line x1="20" y1="38" x2="36" y2="38" />
          {/* Code angle brackets */}
          <polyline points="20,48 24,44 20,40" />
          <polyline points="30,48 26,44 30,40" />
        </svg>
      }
      headline="No prompts saved yet"
      subtext="Save prompts from your vibe sessions to reuse and improve them"
      ctaLabel="+ Save First Prompt"
      onCta={onCta}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyVibeSessions                                                    */
/* ------------------------------------------------------------------ */
export function EmptyVibeSessions({ onCta }: { onCta: () => void }) {
  return (
    <EmptyBase
      icon={
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* Lightning bolt / zap */}
          <polyline points="38,8 22,34 32,34 26,56 44,28 34,28 38,8" />
        </svg>
      }
      headline="No sessions logged"
      subtext="Start a vibe session when you sit down to build"
      ctaLabel="+ Start Session"
      onCta={onCta}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  EmptySearchResults                                                   */
/* ------------------------------------------------------------------ */
export function EmptySearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyBase
      icon={
        <svg width={64} height={64} viewBox="0 0 64 64" fill="none" stroke="#CBD5E1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* Magnifying glass */}
          <circle cx="28" cy="28" r="16" />
          <line x1="40" y1="40" x2="56" y2="56" />
          {/* X inside the circle */}
          <line x1="22" y1="22" x2="34" y2="34" />
          <line x1="34" y1="22" x2="22" y2="34" />
        </svg>
      }
      headline={`No results for "${query}"`}
      subtext="Try fewer keywords or clear your filters"
      ctaLabel="Clear search"
      onCta={onClear}
    />
  );
}
