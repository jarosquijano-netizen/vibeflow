'use client';

import GanttRow, { type GanttFeature, LABEL_WIDTH, TIMELINE_WIDTH, ownerColor, ownerInitials } from './GanttRow';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const MONTH_WIDTH = 120;
const HEADER_HEIGHT = 32;
const QUARTER_HEIGHT = 40;
const YEAR_DAYS = 365;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const QUARTERS = [
  { label: 'Q1 2026', key: 'Q1 2026' },
  { label: 'Q2 2026', key: 'Q2 2026' },
  { label: 'Q3 2026', key: 'Q3 2026' },
  { label: 'Q4 2026', key: 'Q4 2026' },
];

/* ------------------------------------------------------------------ */
/*  Today line position                                                 */
/* ------------------------------------------------------------------ */
function getTodayX(): number {
  const today = new Date();
  const jan1 = new Date(2026, 0, 1);
  const dec31 = new Date(2026, 11, 31);
  if (today < jan1 || today > dec31) return -1;
  const days = Math.floor((today.getTime() - jan1.getTime()) / 86400000);
  return (days / YEAR_DAYS) * TIMELINE_WIDTH;
}

/* ------------------------------------------------------------------ */
/*  GanttChart                                                          */
/* ------------------------------------------------------------------ */
interface GanttChartProps {
  features: GanttFeature[];
}

export default function GanttChart({ features }: GanttChartProps) {
  const todayX = getTodayX();
  const totalWidth = LABEL_WIDTH + TIMELINE_WIDTH;

  /* Group features by quarter, preserving QUARTERS order */
  const groupedByQuarter = QUARTERS.map(({ label, key }) => ({
    label,
    key,
    items: features.filter((f) => f.quarter === key),
  })).filter((g) => g.items.length > 0);

  let rowIndex = 0;

  return (
    <div
      className="gantt-scroll-container"
      style={{
        overflowX: 'auto',
        position: 'relative',
        border: '1px solid #E2E8F0',
        background: '#FFFFFF',
      }}
    >
      <div style={{ minWidth: totalWidth, position: 'relative' }}>

        {/* ── TIME AXIS ── */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            height: HEADER_HEIGHT,
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {/* Label zone */}
          <div
            style={{
              width: LABEL_WIDTH,
              flexShrink: 0,
              background: '#F8FAFC',
              borderRight: '1px solid #E2E8F0',
              position: 'sticky',
              left: 0,
              zIndex: 11,
            }}
          />

          {/* Month cells */}
          <div style={{ display: 'flex', width: TIMELINE_WIDTH, flexShrink: 0 }}>
            {MONTHS.map((month, i) => (
              <div
                key={month}
                style={{
                  width: MONTH_WIDTH,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 600,
                  position: 'relative',
                  borderRight: '1px solid #F1F5F9',
                }}
              >
                {month}
                {/* Bi-weekly tick at midpoint */}
                <div
                  style={{
                    position: 'absolute',
                    left: MONTH_WIDTH / 2,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: '#F1F5F9',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── TODAY LINE ── */}
        {todayX >= 0 && (
          <div
            style={{
              position: 'absolute',
              left: LABEL_WIDTH + todayX,
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: '1px dashed #DC2626',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                fontSize: 10,
                color: '#DC2626',
                background: '#FFFFFF',
                padding: '0 4px',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 600,
              }}
            >
              Today
            </span>
          </div>
        )}

        {/* ── QUARTER GROUPS ── */}
        {groupedByQuarter.map(({ label, key, items }) => (
          <div key={key}>
            {/* Quarter header */}
            <div
              style={{
                display: 'flex',
                height: QUARTER_HEIGHT,
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: LABEL_WIDTH,
                  flexShrink: 0,
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 16,
                  paddingRight: 16,
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  borderRight: '1px solid #E2E8F0',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    color: '#475569',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  {label}
                </span>
              </div>
              <div
                style={{
                  width: TIMELINE_WIDTH,
                  flexShrink: 0,
                  background: '#F1F5F9',
                }}
              />
            </div>

            {/* Feature rows */}
            {items.map((feature) => {
              const ri = rowIndex++;
              return (
                <GanttRow
                  key={feature.id}
                  feature={feature}
                  rowIndex={ri}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile: hide gantt */}
      <style>{`
        @media (max-width: 768px) {
          .gantt-scroll-container { display: none; }
        }
      `}</style>
    </div>
  );
}
