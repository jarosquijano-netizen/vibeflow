'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { GanttFeature } from './GanttRow';
import { ownerColor, ownerInitials } from './GanttRow';
import GanttChart from './GanttChart';

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */
export const GANTT_FEATURES: GanttFeature[] = [
  { id:'f1',  title:'Carrier rate comparison',    owner:'Jordan Davies', status:'BUILDING',    size:'L',  quarter:'Q2 2026', progress:0.65, jiraEpicId:'FIS-101', startDate:'2026-04-01', endDate:'2026-06-30', aiSuggestedSize:'L',  aiAccepted:true  },
  { id:'f2',  title:'Bulk shipment upload',        owner:'Sara Kim',      status:'PROTOTYPING', size:'M',  quarter:'Q2 2026', progress:0.30, jiraEpicId:'FIS-102', startDate:'2026-05-01', endDate:'2026-06-15', aiSuggestedSize:'S',  aiAccepted:false },
  { id:'f3',  title:'Dynamic pricing API',         owner:'Marcus Bell',   status:'SCOPING',     size:'M',  quarter:'Q2 2026', progress:0.10, jiraEpicId:null,      startDate:'2026-05-15', endDate:'2026-07-31', aiSuggestedSize:'L',  aiAccepted:false },
  { id:'f4',  title:'CO2 emissions report',        owner:'Jordan Davies', status:'IDEA',        size:'S',  quarter:'Q3 2026', progress:0.00, jiraEpicId:null,      startDate:'2026-07-01', endDate:'2026-07-31', aiSuggestedSize:'S',  aiAccepted:true  },
  { id:'f5',  title:'Customs doc generator',       owner:'Sara Kim',      status:'BUILDING',    size:'XL', quarter:'Q2 2026', progress:0.80, jiraEpicId:'FIS-105', startDate:'2026-03-01', endDate:'2026-06-30', aiSuggestedSize:'XL', aiAccepted:true  },
  { id:'f6',  title:'Real-time tracking webhooks', owner:'Marcus Bell',   status:'DONE',        size:'M',  quarter:'Q1 2026', progress:1.00, jiraEpicId:'FIS-106', startDate:'2026-01-15', endDate:'2026-03-31', aiSuggestedSize:'M',  aiAccepted:true  },
  { id:'f7',  title:'Multi-currency rate cards',   owner:'Jordan Davies', status:'SCOPING',     size:'L',  quarter:'Q3 2026', progress:0.05, jiraEpicId:null,      startDate:'2026-07-01', endDate:'2026-09-30', aiSuggestedSize:'M',  aiAccepted:false },
  { id:'f8',  title:'Booking confirmation PDF',    owner:'Sara Kim',      status:'DONE',        size:'S',  quarter:'Q1 2026', progress:1.00, jiraEpicId:'FIS-108', startDate:'2026-02-01', endDate:'2026-03-15', aiSuggestedSize:'S',  aiAccepted:true  },
  { id:'f9',  title:'Carrier onboarding portal',  owner:'Marcus Bell',   status:'IDEA',        size:'L',  quarter:'Q3 2026', progress:0.00, jiraEpicId:null,      startDate:'2026-08-01', endDate:'2026-09-30', aiSuggestedSize:'XL', aiAccepted:false },
  { id:'f10', title:'Lane performance dashboard',  owner:'Jordan Davies', status:'PROTOTYPING', size:'M',  quarter:'Q2 2026', progress:0.45, jiraEpicId:'FIS-110', startDate:'2026-04-15', endDate:'2026-06-30', aiSuggestedSize:'M',  aiAccepted:true  },
  { id:'f11', title:'Detention time alerts',       owner:'Sara Kim',      status:'BUILDING',    size:'S',  quarter:'Q2 2026', progress:0.70, jiraEpicId:'FIS-111', startDate:'2026-05-01', endDate:'2026-06-15', aiSuggestedSize:'S',  aiAccepted:true  },
  { id:'f12', title:'Spot rate request flow',      owner:'Marcus Bell',   status:'IDEA',        size:'M',  quarter:'Q3 2026', progress:0.00, jiraEpicId:null,      startDate:'2026-08-15', endDate:'2026-09-30', aiSuggestedSize:'M',  aiAccepted:true  },
  { id:'f13', title:'Invoice reconciliation tool', owner:'Jordan Davies', status:'PARKED',      size:'XL', quarter:'Q3 2026', progress:0.15, jiraEpicId:'FIS-113', startDate:'2026-09-01', endDate:'2026-12-31', aiSuggestedSize:'L',  aiAccepted:false },
  { id:'f14', title:'Driver mobile check-in',      owner:'Sara Kim',      status:'PARKED',      size:'L',  quarter:'Q3 2026', progress:0.00, jiraEpicId:null,      startDate:'2026-10-01', endDate:'2026-12-31', aiSuggestedSize:'XL', aiAccepted:false },
];

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  IDEA:        { color: '#94A3B8', bg: '#F8FAFC' },
  SCOPING:     { color: '#7C3AED', bg: '#F5F3FF' },
  PROTOTYPING: { color: '#2563EB', bg: '#EFF6FF' },
  BUILDING:    { color: '#D97706', bg: '#FFF7ED' },
  DONE:        { color: '#16A34A', bg: '#F0FDF4' },
  PARKED:      { color: '#DC2626', bg: '#FEF2F2' },
};

const SIZE_COLORS: Record<string, string> = {
  XS: '#64748B', S: '#16A34A', M: '#2563EB', L: '#D97706', XL: '#DC2626',
};

const UPDATED: Record<string, string> = {
  DONE: '14d ago', BUILDING: '2d ago', PROTOTYPING: '4d ago',
  SCOPING: '1d ago', IDEA: '7d ago', PARKED: '30d ago',
};

const OWNERS = ['Jordan Davies', 'Sara Kim', 'Marcus Bell'];
const ALL_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
type SortField = 'title' | 'status' | 'size' | 'quarter' | 'progress';

/* ------------------------------------------------------------------ */
/*  RoadmapPage                                                         */
/* ------------------------------------------------------------------ */
export default function RoadmapPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeQuarters, setActiveQuarters] = useState<string[]>(ALL_QUARTERS);
  const [buildingOnly, setBuildingOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('quarter');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* Filtering */
  const filtered = GANTT_FEATURES
    .filter((f) => buildingOnly ? f.status === 'BUILDING' : true)
    .filter((f) => {
      const q = f.quarter.split(' ')[0]; // "Q1", "Q2", etc.
      return activeQuarters.includes(q);
    });

  /* Sorting for swimlane table */
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = '';
    let bv: string | number = '';
    if (sortField === 'title')    { av = a.title; bv = b.title; }
    if (sortField === 'status')   { av = a.status; bv = b.status; }
    if (sortField === 'size')     { av = ['XS','S','M','L','XL'].indexOf(a.size); bv = ['XS','S','M','L','XL'].indexOf(b.size); }
    if (sortField === 'quarter')  { av = a.quarter; bv = b.quarter; }
    if (sortField === 'progress') { av = a.progress; bv = b.progress; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  function toggleQuarter(q: string) {
    setActiveQuarters((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  return (
    <div>
      {/* ── TAB SWITCHER ── */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {[{ label: 'Roadmap', path: '/dashboard/roadmap' }, { label: 'Reports', path: '/dashboard/reports' }].map(({ label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              style={{
                paddingBottom: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#0F172A' : '#94A3B8',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)',
                transition: 'color 100ms ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── TOOLBAR ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'var(--font-dm-sans)' }}>
          Roadmap
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Quarter chips */}
          {ALL_QUARTERS.map((q) => {
            const isActive = activeQuarters.includes(q);
            return (
              <button
                key={q}
                onClick={() => toggleQuarter(q)}
                style={{
                  height: 28,
                  paddingLeft: 8,
                  paddingRight: 8,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderRadius: 0,
                  border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: isActive ? '#2563EB' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontFamily: 'var(--font-dm-sans)',
                  transition: 'all 100ms ease',
                }}
              >
                {q}
              </button>
            );
          })}
          <button
            onClick={() => setActiveQuarters(ALL_QUARTERS)}
            style={{
              height: 28,
              paddingLeft: 8,
              paddingRight: 8,
              fontSize: 11,
              textTransform: 'uppercase',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: 0,
              border: activeQuarters.length === 4 ? '1px solid #2563EB' : '1px solid #E2E8F0',
              background: activeQuarters.length === 4 ? '#2563EB' : '#FFFFFF',
              color: activeQuarters.length === 4 ? '#FFFFFF' : '#475569',
              fontFamily: 'var(--font-dm-sans)',
              transition: 'all 100ms ease',
            }}
          >
            Full Year
          </button>

          {/* Owner avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {OWNERS.map((owner, i) => (
              <div
                key={owner}
                title={owner}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: ownerColor(owner),
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #F8FAFC',
                  marginLeft: i === 0 ? 0 : -6,
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: OWNERS.length - i,
                }}
              >
                {ownerInitials(owner)}
              </div>
            ))}
          </div>

          {/* Building only toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--font-dm-sans)' }}>
              Building only
            </span>
            <div
              onClick={() => setBuildingOnly((v) => !v)}
              style={{
                width: 32,
                height: 18,
                borderRadius: 9,
                background: buildingOnly ? '#2563EB' : '#E2E8F0',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: buildingOnly ? 16 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  transition: 'left 150ms ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── GANTT CHART ── */}
      <GanttChart features={filtered} />

      {/* ── SWIMLANE TABLE ── */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            color: '#94A3B8',
            letterSpacing: '0.06em',
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          All Features
        </div>

        <div style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ height: 32, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                {([
                  { label: 'Feature', field: 'title' as SortField },
                  { label: 'Owner', field: null },
                  { label: 'Size', field: 'size' as SortField },
                  { label: 'Quarter', field: 'quarter' as SortField },
                  { label: 'Progress', field: 'progress' as SortField },
                  { label: 'Jira', field: null },
                  { label: 'Updated', field: null },
                ]).map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={field ? () => toggleSort(field) : undefined}
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      color: '#94A3B8',
                      fontWeight: 700,
                      textAlign: 'left',
                      paddingLeft: 12,
                      paddingRight: 12,
                      letterSpacing: '0.06em',
                      cursor: field ? 'pointer' : 'default',
                      fontFamily: 'var(--font-dm-sans)',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                    {field && sortField === field && (
                      <span style={{ marginLeft: 4, fontSize: 12 }}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f, i) => {
                const statusCfg = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.IDEA;
                const sizeColor = SIZE_COLORS[f.size] ?? '#94A3B8';
                return (
                  <tr
                    key={f.id}
                    style={{
                      height: 32,
                      borderBottom: '1px solid #F1F5F9',
                      background: i % 2 === 1 ? '#F8FAFC' : '#FFFFFF',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? '#F8FAFC' : '#FFFFFF'; }}
                  >
                    <td style={{ paddingLeft: 12, paddingRight: 12, maxWidth: 200 }}>
                      <span style={{ fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontFamily: 'var(--font-dm-sans)' }}>
                        {f.title}
                      </span>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: ownerColor(f.owner), color: '#FFFFFF', fontSize: 7, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {ownerInitials(f.owner)}
                        </div>
                        <span style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--font-dm-sans)' }}>{f.owner}</span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12 }}>
                      <span style={{ background: sizeColor, color: '#FFFFFF', fontSize: 10, fontWeight: 600, padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>
                        {f.size}
                      </span>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12, fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                      {f.quarter}
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 80, height: 6, background: '#E2E8F0', position: 'relative', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f.progress * 100}%`, background: '#16A34A' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                          {Math.round(f.progress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12, fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                      {f.jiraEpicId ?? '—'}
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 12, fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                      {UPDATED[f.status] ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
