'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Search, Kanban, LayoutList } from 'lucide-react';
import type { Feature } from '@/types';
import FeatureCard, { STATUS_CONFIG } from './FeatureCard';
import FeatureColumn from './FeatureColumn';

/* ------------------------------------------------------------------ */
/*  Sample data                                                         */
/* ------------------------------------------------------------------ */
const SAMPLE_FEATURES: Feature[] = [
  { id: 'f1',  title: 'Carrier rate comparison',    problemStatement: 'PMs cant compare rates across carriers in one view',         status: 'BUILDING',     size: 'L',  quarter: 'Q2 2026', owner: 'Jordan Davies', jiraEpicId: 'FIS-101', prototypeUrl: 'https://v0.dev' },
  { id: 'f2',  title: 'Bulk shipment upload',        problemStatement: 'No way to upload more than one shipment at a time',           status: 'PROTOTYPING',  size: 'M',  quarter: 'Q2 2026', owner: 'Sara Kim',      jiraEpicId: 'FIS-102', prototypeUrl: undefined },
  { id: 'f3',  title: 'Dynamic pricing API',         problemStatement: 'Rate cards are static and cant respond to market changes',    status: 'SCOPING',      size: null, quarter: 'Q2 2026', owner: 'Marcus Bell',   jiraEpicId: undefined, prototypeUrl: undefined },
  { id: 'f4',  title: 'CO2 emissions report',        problemStatement: 'No visibility into carbon footprint per shipment or lane',    status: 'IDEA',         size: 'S',  quarter: 'Q3 2026', owner: 'Jordan Davies', jiraEpicId: undefined, prototypeUrl: undefined },
  { id: 'f5',  title: 'Customs doc generator',       problemStatement: 'Manual customs forms cause delays and compliance risk',       status: 'BUILDING',     size: 'XL', quarter: 'Q2 2026', owner: 'Sara Kim',      jiraEpicId: 'FIS-105', prototypeUrl: 'https://v0.dev' },
  { id: 'f6',  title: 'Real-time tracking webhooks', problemStatement: 'Customers poll our API instead of receiving push updates',    status: 'DONE',         size: 'M',  quarter: 'Q1 2026', owner: 'Marcus Bell',   jiraEpicId: 'FIS-106', prototypeUrl: undefined },
  { id: 'f7',  title: 'Multi-currency rate cards',   problemStatement: 'Rate management only works in USD, blocking EU expansion',   status: 'SCOPING',      size: 'L',  quarter: 'Q3 2026', owner: 'Jordan Davies', jiraEpicId: undefined, prototypeUrl: undefined },
  { id: 'f8',  title: 'Booking confirmation PDF',    problemStatement: 'Customers need a formatted PDF receipt after booking',        status: 'DONE',         size: 'S',  quarter: 'Q1 2026', owner: 'Sara Kim',      jiraEpicId: 'FIS-108', prototypeUrl: undefined },
  { id: 'f9',  title: 'Carrier onboarding portal',   problemStatement: 'New carriers take 2 weeks to onboard due to manual steps',   status: 'IDEA',         size: null, quarter: 'Q3 2026', owner: 'Marcus Bell',   jiraEpicId: undefined, prototypeUrl: undefined },
  { id: 'f10', title: 'Lane performance dashboard',  problemStatement: 'No single view of which lanes are profitable vs at-risk',    status: 'PROTOTYPING',  size: 'M',  quarter: 'Q2 2026', owner: 'Jordan Davies', jiraEpicId: 'FIS-110', prototypeUrl: 'https://v0.dev' },
  { id: 'f11', title: 'Detention time alerts',       problemStatement: 'Drivers waiting at docks have no automated alert system',    status: 'BUILDING',     size: 'S',  quarter: 'Q2 2026', owner: 'Sara Kim',      jiraEpicId: 'FIS-111', prototypeUrl: undefined },
  { id: 'f12', title: 'Spot rate request flow',      problemStatement: 'Shippers requesting spot rates email us manually today',     status: 'IDEA',         size: null, quarter: 'Q3 2026', owner: 'Marcus Bell',   jiraEpicId: undefined, prototypeUrl: undefined },
  { id: 'f13', title: 'Invoice reconciliation tool', problemStatement: 'Finance team manually matches invoices to shipments',        status: 'PARKED',       size: 'XL', quarter: 'Q3 2026', owner: 'Jordan Davies', jiraEpicId: 'FIS-113', prototypeUrl: undefined },
  { id: 'f14', title: 'Driver mobile check-in',      problemStatement: 'Drivers use paper forms at pickup — no digital record',      status: 'PARKED',       size: 'L',  quarter: 'Q3 2026', owner: 'Sara Kim',      jiraEpicId: undefined, prototypeUrl: undefined },
];

const STATUS_ORDER = ['IDEA', 'SCOPING', 'PROTOTYPING', 'BUILDING', 'DONE', 'PARKED'] as const;

/* Avatar colors / initials helpers */
const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];
function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h;
}
function ownerColor(name: string) { return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]; }
function ownerInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

const OWNERS = ['Jordan Davies', 'Sara Kim', 'Marcus Bell'];

/* ------------------------------------------------------------------ */
/*  FeatureBoard                                                        */
/* ------------------------------------------------------------------ */
export default function FeatureBoard() {
  const [features, setFeatures] = useState<Feature[]>(SAMPLE_FEATURES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeFeature = features.find((f) => f.id === activeId) ?? null;

  /* Filtered features */
  const filtered = features.filter((f) => {
    if (ownerFilter && f.owner !== ownerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.problemStatement.toLowerCase().includes(q);
    }
    return true;
  });

  /* DnD handlers */
  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  }, []);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    setOverId(e.over ? String(e.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      setActiveId(null);
      setOverId(null);
      if (!over) return;

      const activeFeatureId = String(active.id);
      const overId = String(over.id);

      // If dropped over a column (status key)
      if (STATUS_ORDER.includes(overId as typeof STATUS_ORDER[number])) {
        setFeatures((prev) =>
          prev.map((f) => f.id === activeFeatureId ? { ...f, status: overId as Feature['status'] } : f)
        );
        return;
      }

      // If dropped over another card — reorder and potentially change column
      const overFeature = features.find((f) => f.id === overId);
      if (!overFeature) return;

      setFeatures((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === activeFeatureId);
        const newIndex = prev.findIndex((f) => f.id === overId);
        const updated = arrayMove(prev, oldIndex, newIndex);
        // Adopt the target card's status
        return updated.map((f) =>
          f.id === activeFeatureId ? { ...f, status: overFeature.status } : f
        );
      });
    },
    [features]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
          flexShrink: 0,
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Feature Board
          </h1>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>
            {filtered.length} feature{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Group by */}
          <button style={secondaryBtn}>Group by: Status ▾</button>

          {/* Owner filter avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {OWNERS.map((owner, i) => (
              <button
                key={owner}
                title={owner}
                onClick={() => setOwnerFilter(ownerFilter === owner ? null : owner)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: ownerColor(owner),
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: ownerFilter === owner ? '2px solid #0F172A' : '2px solid #F8FAFC',
                  marginLeft: i === 0 ? 0 : -6,
                  position: 'relative',
                  zIndex: OWNERS.length - i,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {ownerInitials(owner)}
              </button>
            ))}
          </div>

          {/* Quarter chip */}
          <span
            style={{
              background: '#EFF6FF',
              color: '#2563EB',
              fontSize: 12,
              padding: '2px 8px',
              cursor: 'default',
            }}
          >
            Q2 2026 ×
          </span>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {searchOpen && (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                placeholder="Search…"
                style={{
                  width: 160,
                  height: 32,
                  border: '1px solid #E2E8F0',
                  background: '#F1F5F9',
                  paddingLeft: 10,
                  paddingRight: 10,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              />
            )}
            <button
              style={{ ...iconBtn, background: searchOpen ? '#EFF6FF' : 'none', color: searchOpen ? '#2563EB' : '#475569' }}
              onClick={() => setSearchOpen((v) => !v)}
              title="Search"
            >
              <Search size={14} />
            </button>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid #E2E8F0' }}>
            <button
              style={{
                ...iconBtn,
                background: viewMode === 'kanban' ? '#EFF6FF' : 'none',
                color: viewMode === 'kanban' ? '#2563EB' : '#94A3B8',
                border: 'none',
              }}
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
            >
              <Kanban size={14} />
            </button>
            <button
              style={{
                ...iconBtn,
                background: viewMode === 'list' ? '#EFF6FF' : 'none',
                color: viewMode === 'list' ? '#2563EB' : '#94A3B8',
                border: 'none',
                borderLeft: '1px solid #E2E8F0',
              }}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Board ── */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            overflowY: 'hidden',
            flex: 1,
            paddingBottom: 16,
          }}
        >
          {STATUS_ORDER.map((status) => (
            <FeatureColumn
              key={status}
              status={status}
              features={filtered.filter((f) => f.status === status)}
              isOver={overId === status}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeFeature && (
            <div style={{ width: 244 }}>
              <FeatureCard feature={activeFeature} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared button styles                                                */
/* ------------------------------------------------------------------ */
const secondaryBtn: React.CSSProperties = {
  height: 32,
  paddingLeft: 12,
  paddingRight: 12,
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  color: '#0F172A',
  fontSize: 13,
  fontFamily: 'var(--font-dm-sans)',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: 0,
};

const iconBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  background: 'none',
  border: '1px solid #E2E8F0',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#475569',
  borderRadius: 0,
};
