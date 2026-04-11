'use client';

/* ------------------------------------------------------------------ */
/*  Shimmer helper                                                       */
/* ------------------------------------------------------------------ */
const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

function Sh({ w, h, style }: { w?: string | number; h?: string | number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width: w ?? '100%',
        height: h ?? 12,
        flexShrink: 0,
        ...shimmerStyle,
        ...style,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  FeatureCardSkeleton                                                  */
/* ------------------------------------------------------------------ */
export function FeatureCardSkeleton() {
  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderLeft: '3px solid #E2E8F0',
        padding: 12,
        background: '#FFFFFF',
      }}
    >
      <Sh h={12} w="75%" />
      <Sh h={10} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <Sh h={16} w={32} />
        <Sh h={16} w={48} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <Sh h={10} w={48} />
        <div style={{ width: 16, height: 16, borderRadius: '50%', ...shimmerStyle }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PromptCardSkeleton                                                   */
/* ------------------------------------------------------------------ */
export function PromptCardSkeleton() {
  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderTop: '3px solid #E2E8F0',
        padding: 12,
        background: '#FFFFFF',
        marginBottom: 12,
        breakInside: 'avoid',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <Sh h={16} w={48} />
        <Sh h={16} w={64} />
      </div>
      <Sh h={12} w="75%" style={{ marginTop: 8 }} />
      <Sh h={64} style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <Sh h={12} w={32} />
        <Sh h={12} w={32} />
        <Sh h={12} w={32} />
      </div>
      <Sh h={10} w={80} style={{ marginTop: 8 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SessionListItemSkeleton                                              */
/* ------------------------------------------------------------------ */
export function SessionListItemSkeleton() {
  return (
    <div
      style={{
        height: 80,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      <Sh h={12} w="66%" />
      <Sh h={10} w="33%" style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <Sh h={16} w={64} />
        <Sh h={16} w={56} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GanttRowSkeleton                                                     */
/* ------------------------------------------------------------------ */
export function GanttRowSkeleton({ barWidth = 192 }: { barWidth?: number }) {
  return (
    <div
      style={{
        height: 36,
        display: 'flex',
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      {/* Label zone */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          paddingLeft: 16,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRight: '1px solid #F1F5F9',
        }}
      >
        <div style={{ width: 16, height: 16, borderRadius: '50%', ...shimmerStyle, flexShrink: 0 }} />
        <Sh h={12} w={128} />
      </div>
      {/* Gantt zone */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
        <Sh h={24} w={barWidth} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPICardSkeleton                                                      */
/* ------------------------------------------------------------------ */
export function KPICardSkeleton() {
  return (
    <div style={{ border: '1px solid #E2E8F0', padding: 16 }}>
      <Sh h={32} w={64} />
      <Sh h={10} w={96} style={{ marginTop: 8 }} />
      <Sh h={10} w={80} style={{ marginTop: 4 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FeatureBoardSkeleton                                                 */
/* ------------------------------------------------------------------ */
export function FeatureBoardSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} style={{ width: 260, flexShrink: 0 }}>
          <Sh h={20} w={80} style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }, (_, j) => (
              <FeatureCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
