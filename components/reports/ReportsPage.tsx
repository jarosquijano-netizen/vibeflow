'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import { vibeToast } from '@/components/polish/toasts';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { GANTT_FEATURES } from '@/components/roadmap/RoadmapPage';
import { ownerColor, ownerInitials, CYBER_STATUS_CONFIG } from '@/components/roadmap/GanttRow';
import { useTheme } from '@/components/providers/ThemeProvider';
import KPICard from './KPICard';
import AISizingReport from './AISizingReport';

/* ------------------------------------------------------------------ */
/*  Config — Default                                                    */
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

/* ------------------------------------------------------------------ */
/*  Chart data — Default                                                */
/* ------------------------------------------------------------------ */
const statusData = [
  { name: 'IDEA',        value: 3,  color: '#94A3B8' },
  { name: 'SCOPING',     value: 2,  color: '#7C3AED' },
  { name: 'PROTOTYPING', value: 3,  color: '#2563EB' },
  { name: 'BUILDING',    value: 6,  color: '#D97706' },
  { name: 'DONE',        value: 8,  color: '#16A34A' },
  { name: 'PARKED',      value: 2,  color: '#DC2626' },
];

const cyberStatusData = [
  { name: 'IDEA',        value: 3,  color: '#6B7280' },
  { name: 'SCOPING',     value: 2,  color: '#BF00FF' },
  { name: 'PROTOTYPING', value: 3,  color: '#00D4FF' },
  { name: 'BUILDING',    value: 6,  color: '#FFB800' },
  { name: 'DONE',        value: 8,  color: '#00FF88' },
  { name: 'PARKED',      value: 2,  color: '#FF4444' },
];

const quarterData = [
  { quarter: 'Q1 2026', done: 8,  building: 0, other: 2  },
  { quarter: 'Q2 2026', done: 2,  building: 6, other: 5  },
  { quarter: 'Q3 2026', done: 0,  building: 0, other: 6  },
];

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Tooltips                                                            */
/* ------------------------------------------------------------------ */
function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-dm-sans)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#0F172A' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {p.value}
        </div>
      ))}
    </div>
  );
}

function CyberBarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D0D17', border: '1px solid #2A2A3E', padding: '6px 10px', fontFamily: MONO, fontSize: 12, borderRadius: 4 }}>
      <div style={{ color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.fill, fontFamily: MONO }}>
          {p.name}: {p.value}
        </div>
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
/*  ReportsPage                                                         */
/* ------------------------------------------------------------------ */
type SortField = 'title' | 'status' | 'size' | 'quarter' | 'progress';

const TABS = [
  { label: 'Roadmap', path: '/dashboard/roadmap' },
  { label: 'Reports', path: '/dashboard/reports' },
];

export default function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [sortField, setSortField] = useState<SortField>('quarter');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }

  const sorted = [...GANTT_FEATURES].sort((a, b) => {
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

  /* ================================================================ */
  /*  CYBER RENDER                                                     */
  /* ================================================================ */
  if (isCyber) {
    return (
      <div>
        {/* ── TAB SWITCHER — cyber ── */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #2A2A3E', marginBottom: 16 }}>
          {TABS.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                style={{
                  paddingBottom: 8,
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#F8F8F2' : '#4B5563',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #00FF88' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 100ms ease',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#9CA3AF'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#4B5563'; }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── KPI STRIP — cyber ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          <KPICard label="Total Features"      value="24"  delta="+3 this month"     deltaType="positive" />
          <KPICard label="In Building"         value="6"   delta="85% Jira-synced"   deltaType="positive" />
          <KPICard label="Backlog Progress"    value="39%" delta="47 of 120 done"    deltaType="neutral"  />
          <KPICard label="Sessions This Month" value="8"   delta="+2 vs last month"  deltaType="positive" />
          <KPICard label="AI Size Acceptance"  value="72%" delta="18 of 25 features" deltaType="positive" />
        </div>

        {/* ── CHARTS ROW — cyber ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Status Donut — cyber */}
          <div style={{ background: '#111118', border: '1px solid #2A2A3E', borderRadius: 6, padding: 16, height: 240 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, textTransform: 'uppercase', color: '#2A2A3E', letterSpacing: '0.06em', marginBottom: 12 }}>
              Feature Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Donut */}
              <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                <PieChart width={180} height={180}>
                  <Pie
                    data={cyberStatusData}
                    cx={90}
                    cy={90}
                    innerRadius={58}
                    outerRadius={82}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {cyberStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                {/* Center label */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: '#F8F8F2', lineHeight: 1 }}>24</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563', marginTop: 2 }}>total</div>
                </div>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {cyberStatusData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563', flex: 1 }}>{d.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quarter Progress — cyber */}
          <div style={{ background: '#111118', border: '1px solid #2A2A3E', borderRadius: 6, padding: 16, height: 240 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, textTransform: 'uppercase', color: '#2A2A3E', letterSpacing: '0.06em', marginBottom: 12 }}>
              Quarter Progress
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={quarterData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: MONO, fill: '#2A2A3E' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="quarter" width={64} tick={{ fontSize: 11, fontFamily: MONO, fill: '#4B5563' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CyberBarTooltip />} cursor={{ fill: 'rgba(0,255,136,0.03)' }} />
                <Bar dataKey="done"     stackId="a" fill="#00FF88" name="done"     radius={0} />
                <Bar dataKey="building" stackId="a" fill="#FFB800" name="building" radius={0} />
                <Bar dataKey="other"    stackId="a" fill="#2A2A3E" name="other"    radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── FEATURE TABLE — cyber ── */}
        <div style={{ marginBottom: 24, border: '1px solid #1A1A2A', background: '#0A0A0F' }}>
          {/* Table header bar */}
          <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2A2A3E', background: '#0D0D17' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', color: '#2A2A3E', letterSpacing: '0.08em', fontWeight: 700 }}>
              {'// ALL_FEATURES'}
            </span>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: '1px solid #2A2A3E',
                color: '#4B5563',
                fontFamily: MONO,
                fontSize: 12,
                padding: '4px 10px',
                cursor: 'pointer',
                borderRadius: 0,
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00FF88';
                e.currentTarget.style.color = '#00FF88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3E';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ height: 32, borderBottom: '1px solid #1A1A2A' }}>
                {([
                  { label: 'Title',     field: 'title'    as SortField },
                  { label: 'Status',    field: 'status'   as SortField },
                  { label: 'Size',      field: 'size'     as SortField },
                  { label: 'Owner',     field: null },
                  { label: 'Quarter',   field: 'quarter'  as SortField },
                  { label: 'Backlog %', field: 'progress' as SortField },
                  { label: 'Jira',      field: null },
                  { label: 'Updated',   field: null },
                ]).map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={field ? () => toggleSort(field) : undefined}
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      color: '#2A2A3E',
                      fontWeight: 700,
                      textAlign: 'left',
                      paddingLeft: 12,
                      letterSpacing: '0.06em',
                      cursor: field ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                    {field && (
                      <span style={{ marginLeft: 4, color: sortField === field ? '#00FF88' : '#2A2A3E' }}>
                        {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((f, i) => {
                const cyberStatus = CYBER_STATUS_CONFIG[f.status] ?? CYBER_STATUS_CONFIG.IDEA;
                const cyberSizeCol = CYBER_SIZE[f.size] ?? '#64748B';
                return (
                  <tr
                    key={f.id}
                    style={{ height: 34, borderBottom: '1px solid #1A1A2A', background: i % 2 === 1 ? '#0D0D17' : '#0A0A0F' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? '#0D0D17' : '#0A0A0F'; }}
                  >
                    <td style={{ paddingLeft: 12, paddingRight: 8, maxWidth: 180 }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {f.title}
                      </span>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: cyberStatus.color, border: `1px solid ${cyberStatus.color}4D`, background: cyberStatus.bg, padding: '1px 6px', textTransform: 'uppercase' }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: cyberSizeCol, border: `1px solid ${cyberSizeCol}4D`, background: `${cyberSizeCol}1A`, padding: '1px 6px' }}>
                        {f.size}
                      </span>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: ownerColor(f.owner), color: '#FFFFFF', fontSize: 7, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {ownerInitials(f.owner)}
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: '#4B5563' }}>{f.owner}</span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: MONO, fontSize: 11, color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {f.quarter}
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 60, height: 4, background: '#1A1A2A', position: 'relative', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f.progress * 100}%`, background: '#00FF88' }} />
                        </div>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563', whiteSpace: 'nowrap' }}>
                          {Math.round(f.progress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: MONO, fontSize: 11, color: '#4B5563' }}>
                      {f.jiraEpicId ?? '—'}
                    </td>
                    <td style={{ paddingLeft: 12, paddingRight: 8, fontFamily: MONO, fontSize: 11, color: '#4B5563', whiteSpace: 'nowrap' }}>
                      {UPDATED[f.status] ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── AI SIZING REPORT ── */}
        <AISizingReport features={GANTT_FEATURES} />
      </div>
    );
  }

  /* ================================================================ */
  /*  DEFAULT RENDER                                                   */
  /* ================================================================ */
  return (
    <div>
      {/* ── TAB SWITCHER ── */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {TABS.map(({ label, path }) => {
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

      {/* ── KPI STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <KPICard label="Total Features"      value="24"  delta="+3 this month"     deltaType="positive" />
        <KPICard label="In Building"         value="6"   delta="85% Jira-synced"   deltaType="positive" />
        <KPICard label="Backlog Progress"    value="39%" delta="47 of 120 done"    deltaType="neutral"  />
        <KPICard label="Sessions This Month" value="8"   delta="+2 vs last month"  deltaType="positive" />
        <KPICard label="AI Size Acceptance"  value="72%" delta="18 of 25 features" deltaType="positive" />
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Status Donut */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, height: 240 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 12, fontFamily: 'var(--font-dm-sans)' }}>
            Feature Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
              <PieChart width={180} height={180}>
                <Pie
                  data={statusData}
                  cx={90}
                  cy={90}
                  innerRadius={58}
                  outerRadius={82}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center label */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-dm-sans)', lineHeight: 1 }}>24</div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', marginTop: 2 }}>total</div>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {statusData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#475569', flex: 1, fontFamily: 'var(--font-dm-sans)' }}>{d.name}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quarter Progress */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 16, height: 240 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 12, fontFamily: 'var(--font-dm-sans)' }}>
            Quarter Progress
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={quarterData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="quarter" width={64} tick={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)', fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="done"     stackId="a" fill="#16A34A" name="done"     radius={0} />
              <Bar dataKey="building" stackId="a" fill="#D97706" name="building" radius={0} />
              <Bar dataKey="other"    stackId="a" fill="#94A3B8" name="other"    radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── FEATURE TABLE ── */}
      <div style={{ marginBottom: 24, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', fontFamily: 'var(--font-dm-sans)' }}>
            All Features
          </span>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: '1px solid #E2E8F0',
              color: '#475569',
              fontSize: 12,
              padding: '4px 10px',
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ height: 32, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              {([
                { label: 'Title',     field: 'title'    as SortField },
                { label: 'Status',    field: 'status'   as SortField },
                { label: 'Size',      field: 'size'     as SortField },
                { label: 'Owner',     field: null },
                { label: 'Quarter',   field: 'quarter'  as SortField },
                { label: 'Backlog %', field: 'progress' as SortField },
                { label: 'Jira',      field: null },
                { label: 'Updated',   field: null },
              ]).map(({ label, field }) => (
                <th
                  key={label}
                  onClick={field ? () => toggleSort(field) : undefined}
                  style={{
                    fontSize: 11, textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700,
                    textAlign: 'left', paddingLeft: 12, letterSpacing: '0.06em',
                    cursor: field ? 'pointer' : 'default', fontFamily: 'var(--font-dm-sans)',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                  {field && sortField === field && <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const statusCfg = STATUS_CONFIG[f.status] ?? STATUS_CONFIG.IDEA;
              return (
                <tr
                  key={f.id}
                  style={{ height: 32, borderBottom: '1px solid #F1F5F9', background: i % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 1 ? '#F8FAFC' : '#FFFFFF'; }}
                >
                  <td style={{ paddingLeft: 12, paddingRight: 8, maxWidth: 180 }}>
                    <span style={{ fontSize: 13, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontFamily: 'var(--font-dm-sans)' }}>
                      {f.title}
                    </span>
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8, whiteSpace: 'nowrap' }}>
                    <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: 10, fontWeight: 600, padding: '1px 6px', fontFamily: 'var(--font-dm-sans)', textTransform: 'uppercase' }}>
                      {f.status}
                    </span>
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                    <span style={{ background: SIZE_COLORS[f.size] ?? '#94A3B8', color: '#FFFFFF', fontSize: 10, fontWeight: 600, padding: '1px 6px', fontFamily: 'var(--font-dm-sans)' }}>
                      {f.size}
                    </span>
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8, fontSize: 12, color: '#475569', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                    {f.owner}
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8, fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                    {f.quarter}
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, background: '#E2E8F0', position: 'relative', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${f.progress * 100}%`, background: '#16A34A' }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                        {Math.round(f.progress * 100)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8, fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)' }}>
                    {f.jiraEpicId ?? '—'}
                  </td>
                  <td style={{ paddingLeft: 12, paddingRight: 8, fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'nowrap' }}>
                    {UPDATED[f.status] ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── AI SIZING REPORT ── */}
      <AISizingReport features={GANTT_FEATURES} />
    </div>
  );
}
