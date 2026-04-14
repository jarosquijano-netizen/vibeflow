'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { GANTT_FEATURES } from '@/components/roadmap/RoadmapPage';
import { ownerColor, ownerInitials, CYBER_STATUS_CONFIG } from '@/components/roadmap/GanttRow';
import { useTheme } from '@/components/providers/ThemeProvider';
import { vibeToast } from '@/components/polish/toasts';
import { sampleVibeSessions } from '@/lib/sample-data';
import { getActiveSessions } from '@/lib/feature-store';
import { calcFeatureMetrics, calcSummary } from '@/lib/reports-engine';
import type { VibeSession, Feature } from '@/types';
import KPICard from './KPICard';
import AISizingReport from './AISizingReport';
import SessionTimeChart from './SessionTimeChart';
import AutoVsManualCard from './AutoVsManualCard';
import FeatureVelocityTable from './FeatureVelocityTable';
import StatusFlowSankey from './StatusFlowSankey';

/* ------------------------------------------------------------------ */
/*  Static config                                                       */
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
const CYBER_SIZE: Record<string, string> = {
  XS: '#64748B', S: '#00FF88', M: '#00D4FF', L: '#FFB800', XL: '#FF4444',
};

const UPDATED: Record<string, string> = {
  DONE: '14d ago', BUILDING: '2d ago', PROTOTYPING: '4d ago',
  SCOPING: '1d ago', IDEA: '7d ago', PARKED: '30d ago',
};

const quarterData = [
  { quarter: 'Q1 2026', done: 8,  building: 0, other: 2 },
  { quarter: 'Q2 2026', done: 2,  building: 6, other: 5 },
  { quarter: 'Q3 2026', done: 0,  building: 0, other: 6 },
];

const MONO = "'JetBrains Mono', monospace";

const ROUTE_TABS = [
  { label: 'Roadmap', path: '/dashboard/roadmap' },
  { label: 'Reports', path: '/dashboard/reports' },
];

/* ------------------------------------------------------------------ */
/*  Tooltip components                                                  */
/* ------------------------------------------------------------------ */
function DefaultBarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-dm-sans)', borderRadius: 4 }}>
      <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {p.value}
        </div>
      ))}
    </div>
  );
}

function CyberBarTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D0D17', border: '1px solid #3B4B3D', padding: '6px 10px', fontFamily: MONO, fontSize: 12, borderRadius: 4 }}>
      <div style={{ color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill, fontFamily: MONO }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CSV export                                                          */
/* ------------------------------------------------------------------ */
function handleExportCSV() {
  const headers = ['Title', 'Status', 'Size', 'Owner', 'Quarter', 'Jira', 'Progress'];
  const rows = GANTT_FEATURES.map((f) => [
    f.title, f.status, f.size, f.owner, f.quarter, f.jiraEpicId ?? '', `${Math.round(f.progress * 100)}%`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vibeflow-features.csv';
  a.click();
  URL.revokeObjectURL(url);
  vibeToast.success('CSV exported successfully');
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type SortField = 'title' | 'status' | 'size' | 'quarter' | 'progress';
type InnerTab  = 'overview' | 'velocity';

/* ------------------------------------------------------------------ */
/*  ReportsPage                                                         */
/* ------------------------------------------------------------------ */
export default function ReportsPage() {
  const router    = useRouter();
  const pathname  = usePathname();
  const { theme } = useTheme();
  const isCyber   = theme === 'cyber';

  /* ── State ── */
  const [activeTab, setActiveTab] = useState<InnerTab>('overview');
  const [sortField, setSortField] = useState<SortField>('quarter');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [sessions,  setSessions]  = useState<VibeSession[]>([...sampleVibeSessions]);

  /* ── Merge localStorage sessions ── */
  useEffect(() => {
    const active = getActiveSessions();
    if (active.length > 0) {
      setSessions((prev) => {
        const ids  = new Set(prev.map((s) => s.id));
        const fresh = active.filter((s) => !ids.has(s.id));
        return fresh.length > 0 ? [...fresh, ...prev] : prev;
      });
    }
  }, []);

  /* ── Computed metrics ── */
  const metrics     = calcFeatureMetrics(GANTT_FEATURES as unknown as Feature[], sessions);
  const summary     = calcSummary(sessions, metrics);
  const autoCount   = sessions.flatMap((s) => (s.autoStatusHistory ?? []).filter((h) => h.automatic)).length;
  const manualCount = sessions.flatMap((s) => (s.autoStatusHistory ?? []).filter((h) => !h.automatic)).length;

  const topFeatures  = [...metrics].sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 3);
  const maxTopHours  = Math.max(topFeatures[0]?.totalHours ?? 1, 1);

  /* ── Table sort ── */
  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }
  const sorted = [...GANTT_FEATURES].sort((a, b) => {
    let av: string | number = '';
    let bv: string | number = '';
    if (sortField === 'title')    { av = a.title;    bv = b.title; }
    if (sortField === 'status')   { av = a.status;   bv = b.status; }
    if (sortField === 'size')     { av = ['XS','S','M','L','XL'].indexOf(a.size); bv = ['XS','S','M','L','XL'].indexOf(b.size); }
    if (sortField === 'quarter')  { av = a.quarter;  bv = b.quarter; }
    if (sortField === 'progress') { av = a.progress; bv = b.progress; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1  : -1;
    return 0;
  });

  /* ── Theme vars ── */
  const C = {
    cardBg:     isCyber ? '#111118'  : '#FFFFFF',
    cardBorder: isCyber ? '#2A2A3E'  : '#E2E8F0',
    tableBg:    isCyber ? '#0A0A0F'  : '#FFFFFF',
    tableAlt:   isCyber ? '#0D0D17'  : '#F8FAFC',
    tableHover: isCyber ? 'rgba(0,255,136,0.03)' : '#EFF6FF',
    headerBg:   isCyber ? '#12121E'  : '#F8FAFC',
    body:       isCyber ? '#9CA3AF'  : '#0F172A',
    meta:       isCyber ? '#6B7280'  : '#94A3B8',
    accent:     isCyber ? '#00FF88'  : '#2563EB',
    tabBorder:  isCyber ? '#3B4B3D'  : '#E2E8F0',
  };

  function InnerTabBtn({ tab, label }: { tab: InnerTab; label: string }) {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        style={{
          height: 30,
          paddingLeft: 14,
          paddingRight: 14,
          fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
          fontSize: 12,
          fontWeight: isActive ? 700 : 400,
          color: isActive ? (isCyber ? '#00FF88' : '#2563EB') : C.meta,
          background: isActive ? (isCyber ? 'rgba(0,255,136,0.08)' : '#EFF6FF') : 'transparent',
          border: `1px solid ${isActive ? (isCyber ? '#00FF88' : '#2563EB') : C.cardBorder}`,
          cursor: 'pointer',
          transition: 'all 100ms ease',
          letterSpacing: isCyber ? '0.05em' : 0,
        }}
      >
        {label}
      </button>
    );
  }

  function sortArrow(field: SortField) {
    if (sortField !== field) return <span style={{ marginLeft: 3, color: C.meta }}>↕</span>;
    return <span style={{ marginLeft: 3, color: C.accent }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div>

      {/* ── Route tabs (Roadmap / Reports) ── */}
      <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${C.tabBorder}`, marginBottom: 16 }}>
        {ROUTE_TABS.map(({ label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              style={{
                paddingBottom: 8,
                fontFamily: isCyber ? MONO : 'var(--font-dm-sans)',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? (isCyber ? '#F0FFF4' : '#0F172A') : C.meta,
                background: 'none',
                border: 'none',
                borderBottom: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 100ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = isCyber ? '#9CA3AF' : '#64748B'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = C.meta; }}
            >
              {isCyber ? label.toUpperCase().replace(' ', '_') : label}
            </button>
          );
        })}
      </div>

      {/* ── Inner tabs (Overview / Velocity) ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <InnerTabBtn tab="overview" label={isCyber ? '// OVERVIEW' : 'Overview'} />
        <InnerTabBtn tab="velocity" label={isCyber ? '// VELOCITY' : 'Velocity'} />
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* OVERVIEW TAB                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* ── Row 1: 5 existing KPI cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 12 }}>
            <KPICard label="Total Features"      value="24"  delta="+3 this month"     deltaType="positive" />
            <KPICard label="In Building"         value="6"   delta="85% Jira-synced"   deltaType="positive" />
            <KPICard label="Backlog Progress"    value="39%" delta="47 of 120 done"    deltaType="neutral"  />
            <KPICard label="Sessions This Month" value="8"   delta="+2 vs last month"  deltaType="positive" />
            <KPICard label="AI Size Acceptance"  value="72%" delta="18 of 25 features" deltaType="positive" />
          </div>

          {/* ── Row 2: 4 new session KPI cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <KPICard
              label="Total Session Hours"
              value={`${summary.totalSessionHours}h`}
              delta={`across ${summary.totalSessions} sessions`}
              deltaType="neutral"
              accent="cyan"
            />
            <KPICard
              label="Avg Session Length"
              value={`${summary.avgSessionMinutes}min`}
              delta="per session"
              deltaType="neutral"
              accent="cyan"
            />
            <KPICard
              label="Auto Status Updates"
              value={`${summary.autoStatusPct}%`}
              delta="of changes are automatic"
              deltaType="positive"
              accent="purple"
            />
            <KPICard
              label="Features Shipped"
              value={`${summary.featuresDone}`}
              delta="this quarter"
              deltaType="positive"
              accent="green"
            />
          </div>

          {/* ── Row 3: SessionTimeChart | StatusDonut | AutoVsManualCard ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '5fr 4fr 3fr',
              gap: 16,
              marginBottom: 16,
              minHeight: 260,
            }}
          >
            <SessionTimeChart />
            <StatusFlowSankey />
            <AutoVsManualCard summary={summary} autoCount={autoCount} manualCount={manualCount} />
          </div>

          {/* ── Row 4: Quarter Progress + Most Active This Week ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* Quarter Progress */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: 16, height: 220 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: isCyber ? '0.1em' : '0.06em', color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontWeight: 700, marginBottom: 12 }}>
                {isCyber ? '// QUARTER_PROGRESS' : 'Quarter Progress'}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={quarterData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fill: C.meta }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="quarter" width={64} tick={{ fontSize: 11, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fill: isCyber ? '#6B7280' : '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip content={isCyber ? <CyberBarTooltip /> : <DefaultBarTooltip />} cursor={{ fill: isCyber ? 'rgba(0,255,136,0.03)' : 'rgba(37,99,235,0.04)' }} />
                  <Bar dataKey="done"     stackId="a" fill={isCyber ? '#00FF88' : '#16A34A'} name="done"     radius={0} />
                  <Bar dataKey="building" stackId="a" fill={isCyber ? '#FFB800' : '#D97706'} name="building" radius={0} />
                  <Bar dataKey="other"    stackId="a" fill={isCyber ? '#2A2A3E' : '#94A3B8'} name="other"    radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Most Active Features */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: 16, height: 220 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: isCyber ? '0.1em' : '0.06em', color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontWeight: 700, marginBottom: 4 }}>
                {isCyber ? '// MOST_ACTIVE_FEATURES' : 'Most Active Features'}
              </div>
              <div style={{ fontSize: 11, color: isCyber ? '#4B5563' : '#CBD5E1', fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', marginBottom: 16 }}>
                {isCyber ? 'BY_TOTAL_SESSION_HOURS' : 'by total session hours'}
              </div>

              {topFeatures.length === 0 ? (
                <div style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 13, color: C.meta }}>
                  {isCyber ? '// No sessions logged yet' : 'No sessions logged yet'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {topFeatures.map((m) => {
                    const feat = GANTT_FEATURES.find((f) => f.id === m.featureId);
                    const barW = Math.max(4, Math.round((m.totalHours / maxTopHours) * 100));
                    return (
                      <div key={m.featureId}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          {feat && (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: ownerColor(feat.owner), color: '#FFFFFF', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {ownerInitials(feat.owner)}
                            </div>
                          )}
                          <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: C.body, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.featureTitle}
                          </span>
                          <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, fontWeight: 700, color: isCyber ? '#00FF88' : '#16A34A', flexShrink: 0 }}>
                            {m.totalHours}h
                          </span>
                        </div>
                        <div style={{ height: 4, background: isCyber ? '#2A2A3E' : '#F1F5F9', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barW}%`, background: isCyber ? '#00FF88' : '#2563EB', transition: 'width 400ms ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Row 5: Roadmap feature table ── */}
          <div style={{ marginBottom: 20, border: `1px solid ${C.cardBorder}`, background: C.tableBg }}>
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.cardBorder}`, background: C.headerBg }}>
              <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: isCyber ? 11 : 13, fontWeight: 700, color: isCyber ? '#6B7280' : '#0F172A', textTransform: isCyber ? 'uppercase' : 'none', letterSpacing: isCyber ? '0.08em' : 0 }}>
                {isCyber ? '// ALL_FEATURES' : 'All Features'}
              </span>
              <button
                onClick={handleExportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.cardBorder}`, color: C.meta, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, padding: '4px 10px', cursor: 'pointer', borderRadius: 0, transition: 'border-color 150ms ease, color 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.color = C.meta; }}
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ height: 32, borderBottom: `1px solid ${isCyber ? '#2A2A3E' : '#E2E8F0'}`, background: C.headerBg }}>
                  {([
                    { label: 'Title',     field: 'title'    as SortField },
                    { label: 'Status',    field: 'status'   as SortField },
                    { label: 'Size',      field: 'size'     as SortField },
                    { label: 'Owner',     field: null },
                    { label: 'Quarter',   field: 'quarter'  as SortField },
                    { label: 'Backlog %', field: 'progress' as SortField },
                    { label: 'Jira',      field: null },
                    { label: 'Updated',   field: null },
                  ] as { label: string; field: SortField | null }[]).map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={field ? () => toggleSort(field) : undefined}
                      style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 10, textTransform: 'uppercase', color: C.meta, fontWeight: 700, textAlign: 'left', paddingLeft: 12, letterSpacing: '0.06em', cursor: field ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      {label}{field ? sortArrow(field) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((f, i) => {
                  const statusCfg   = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.IDEA;
                  const cyberStatus = CYBER_STATUS_CONFIG[f.status] ?? CYBER_STATUS_CONFIG.IDEA;
                  const rowBg       = i % 2 === 1 ? C.tableAlt : C.tableBg;
                  return (
                    <tr
                      key={f.id}
                      style={{ height: 34, borderBottom: `1px solid ${isCyber ? '#2A2A3E' : '#F1F5F9'}`, background: rowBg }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.tableHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = rowBg; }}
                    >
                      <td style={{ paddingLeft: 12, paddingRight: 8, maxWidth: 180 }}>
                        <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 12, color: C.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{f.title}</span>
                      </td>
                      <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                        {isCyber ? (
                          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: cyberStatus.color, border: `1px solid ${cyberStatus.color}4D`, background: cyberStatus.bg, padding: '1px 6px', textTransform: 'uppercase' }}>{f.status}</span>
                        ) : (
                          <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: 10, fontWeight: 600, padding: '1px 6px', fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase' }}>{f.status}</span>
                        )}
                      </td>
                      <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                        {isCyber ? (
                          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: CYBER_SIZE[f.size] ?? '#64748B', border: `1px solid ${CYBER_SIZE[f.size] ?? '#64748B'}4D`, background: `${CYBER_SIZE[f.size] ?? '#64748B'}1A`, padding: '1px 6px' }}>{f.size}</span>
                        ) : (
                          <span style={{ background: SIZE_COLORS[f.size] ?? '#94A3B8', color: '#FFFFFF', fontSize: 10, fontWeight: 600, padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>{f.size}</span>
                        )}
                      </td>
                      <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: ownerColor(f.owner), color: '#FFFFFF', fontSize: 7, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {ownerInitials(f.owner)}
                          </div>
                          <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: C.meta }}>{f.owner}</span>
                        </div>
                      </td>
                      <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: C.meta, whiteSpace: 'nowrap' }}>{f.quarter}</td>
                      <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: isCyber ? 4 : 6, background: isCyber ? '#2A2A3E' : '#E2E8F0', position: 'relative', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f.progress * 100}%`, background: isCyber ? '#00FF88' : '#16A34A' }} />
                          </div>
                          <span style={{ fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 10, color: C.meta, whiteSpace: 'nowrap' }}>{Math.round(f.progress * 100)}%</span>
                        </div>
                      </td>
                      <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: C.meta }}>{f.jiraEpicId ?? '—'}</td>
                      <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: isCyber ? MONO : 'var(--font-dm-sans)', fontSize: 11, color: C.meta, whiteSpace: 'nowrap' }}>{UPDATED[f.status] ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Row 6: AI Sizing Report ── */}
          <AISizingReport features={GANTT_FEATURES} />
        </>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* VELOCITY TAB                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {activeTab === 'velocity' && (
        <>
          {/* ── Row 1: 4 velocity stage KPI cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <KPICard label="Avg hrs to Scoping"    value="2.5h" delta="from idea to scoped"        deltaType="neutral" accent="cyan"   />
            <KPICard label="Avg hrs to Prototype"  value="8h"   delta="from scoping to prototype"  deltaType="neutral" accent="cyan"   />
            <KPICard label="Avg hrs to Building"   value="18h"  delta="from prototype to in build" deltaType="neutral" accent="purple" />
            <KPICard label="Avg hrs to Done"       value="42h"  delta="full feature lifecycle"     deltaType="positive" accent="green" />
          </div>

          {/* ── Row 2: Feature Velocity Table ── */}
          <div style={{ marginBottom: 20 }}>
            <FeatureVelocityTable metrics={metrics} />
          </div>

          {/* ── Row 3: Session time chart ── */}
          <div style={{ height: 260 }}>
            <SessionTimeChart />
          </div>
        </>
      )}

    </div>
  );
}
