'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { useTheme } from '@/components/providers/ThemeProvider';
import FeatureCard, { STATUS_CONFIG } from './FeatureCard';
import FeatureColumn from './FeatureColumn';
import FeatureDetailPanel from './FeatureDetailPanel';
import FeatureCompletionCelebration from './FeatureCompletionCelebration';
import { getFeatureRewards, type FeatureReward, type TShirtSize } from '@/lib/feature-rewards';
import { dispatchXPEvent } from '@/lib/xp-engine';
import { vibeToast } from '@/components/polish/toasts';
import { getPromotedFeatures, updateFeatureStatus } from '@/lib/feature-store';

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

/* Avatar helpers */
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
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [features, setFeatures] = useState<Feature[]>(SAMPLE_FEATURES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [celebrationFeature, setCelebrationFeature] = useState<Feature | null>(null);
  const [celebrationReward, setCelebrationReward] = useState<FeatureReward | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  /* ── Merge promoted features on mount + storage events ── */
  function mergeWithPromoted(current: Feature[], promoted: Feature[]): Feature[] {
    const ids = new Set(current.map((f) => f.id));
    const newOnes = promoted.filter((f) => !ids.has(f.id));
    return newOnes.length > 0 ? [...newOnes, ...current] : current;
  }

  useEffect(() => {
    const promoted = getPromotedFeatures();
    if (promoted.length > 0) {
      setFeatures((prev) => {
        const merged = mergeWithPromoted(prev, promoted);
        if (merged.length > prev.length) {
          const added = merged.length - prev.length;
          vibeToast.success(`⚡ ${added} idea${added !== 1 ? 's' : ''} promoted to board`);
        }
        return merged;
      });
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === 'vibeflow-promoted-features') {
        const promoted = getPromotedFeatures();
        setFeatures((prev) => {
          const merged = mergeWithPromoted(prev, promoted);
          if (merged.length > prev.length) {
            vibeToast.success('⚡ New idea promoted to board');
          }
          return merged;
        });
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /* ── Listen for feature status updates from Session close ── */
  useEffect(() => {
    function handleStatusUpdate(e: CustomEvent) {
      const { featureId, newStatus } = e.detail as { featureId: string; newStatus: string };
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, status: newStatus as Feature['status'] } : f))
      );
      updateFeatureStatus(featureId, newStatus);
    }

    window.addEventListener('feature-status-updated', handleStatusUpdate as EventListener);
    return () => window.removeEventListener('feature-status-updated', handleStatusUpdate as EventListener);
  }, []);

  const activeFeature = features.find((f) => f.id === activeId) ?? null;
  const selectedFeature = features.find((f) => f.id === selectedFeatureId) ?? null;

  function handleSizeAccepted(featureId: string, size: string) {
    setFeatures((prev) =>
      prev.map((f) => f.id === featureId ? { ...f, size: size as Feature['size'] } : f)
    );
  }

  const filtered = features.filter((f) => {
    if (ownerFilter && f.owner !== ownerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.problemStatement.toLowerCase().includes(q);
    }
    return true;
  });

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
      const targetId = String(over.id);

      const dragged = features.find((f) => f.id === activeFeatureId);

      if (STATUS_ORDER.includes(targetId as typeof STATUS_ORDER[number])) {
        const newStatus = targetId as Feature['status'];
        setFeatures((prev) =>
          prev.map((f) => f.id === activeFeatureId ? { ...f, status: newStatus } : f)
        );
        if (dragged && newStatus === 'DONE' && dragged.status !== 'DONE') {
          triggerCelebration(dragged, newStatus);
        }
        return;
      }

      const overFeature = features.find((f) => f.id === targetId);
      if (!overFeature) return;

      setFeatures((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === activeFeatureId);
        const newIndex = prev.findIndex((f) => f.id === targetId);
        const updated = arrayMove(prev, oldIndex, newIndex);
        return updated.map((f) =>
          f.id === activeFeatureId ? { ...f, status: overFeature.status } : f
        );
      });
      if (dragged && overFeature.status === 'DONE' && dragged.status !== 'DONE') {
        triggerCelebration(dragged, overFeature.status);
      }
    },
    [features]
  );

  function triggerCelebration(feature: Feature, _newStatus: string) {
    const rewards = getFeatureRewards();
    const size = (feature.size ?? 'M') as TShirtSize;
    const reward = rewards[size] ?? rewards['M'];
    dispatchXPEvent({
      id: Date.now().toString(),
      label: `Feature shipped: ${feature.title}`,
      amount: reward.xp,
      timestamp: Date.now(),
    });
    if (isCyber) {
      setCelebrationFeature({ ...feature, status: 'DONE' });
      setCelebrationReward(reward);
    } else {
      vibeToast.success(`✓ ${feature.title} shipped! +${reward.xp} XP`);
    }
  }

  /* ── Cyber toolbar button base ── */
  const cyberBtn: React.CSSProperties = {
    height: 28,
    paddingLeft: 12,
    paddingRight: 12,
    background: '#0E0E13',
    border: '1px solid #2A2A3E',
    color: '#4B5563',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    cursor: 'pointer',
    borderRadius: 4,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>

      {/* ── Toolbar ── */}
      {isCyber ? (
        /* Cyber toolbar */
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: '1px solid #2A2A3E',
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#F8F8F2',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              FEATURE_BOARD
            </h1>
            <span
              style={{
                color: '#00FF88',
                marginLeft: 2,
                animation: 'blink 1s step-end infinite',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
              }}
            >
              |
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#00FF88',
                marginLeft: 12,
              }}
            >
              [ {filtered.length} features ]
            </span>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Group by */}
            <button
              style={cyberBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00FF88';
                e.currentTarget.style.color = '#00FF88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2A2A3E';
                e.currentTarget.style.color = '#4B5563';
              }}
            >
              Group by: Status ▾
            </button>

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
                    border: ownerFilter === owner ? '2px solid #00FF88' : '2px solid #1A1A2A',
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
                ...cyberBtn,
                color: '#3CD7FF',
                border: '1px solid rgba(60,215,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                cursor: 'default',
                fontSize: 11,
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
                  placeholder="search_features..."
                  style={{
                    width: 160,
                    height: 28,
                    background: '#0E0E13',
                    border: '1px solid #2A2A3E',
                    borderRadius: 4,
                    paddingLeft: 10,
                    paddingRight: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: '#E4E1E9',
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#00FF88'; }}
                  onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#2A2A3E'; }}
                />
              )}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                style={{
                  ...cyberBtn,
                  width: 28,
                  paddingLeft: 0,
                  paddingRight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: searchOpen ? 'rgba(0,255,136,0.1)' : '#0E0E13',
                  borderColor: searchOpen ? '#00FF88' : '#2A2A3E',
                  color: searchOpen ? '#00FF88' : '#4B5563',
                }}
              >
                <Search size={13} />
              </button>
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid #2A2A3E', borderRadius: 4, overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  ...cyberBtn,
                  border: 'none',
                  borderRadius: 0,
                  width: 28,
                  paddingLeft: 0,
                  paddingRight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: viewMode === 'kanban' ? 'rgba(0,255,136,0.1)' : '#0E0E13',
                  color: viewMode === 'kanban' ? '#00FF88' : '#4B5563',
                }}
              >
                <Kanban size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  ...cyberBtn,
                  border: 'none',
                  borderLeft: '1px solid #2A2A3E',
                  borderRadius: 0,
                  width: 28,
                  paddingLeft: 0,
                  paddingRight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: viewMode === 'list' ? 'rgba(0,255,136,0.1)' : '#0E0E13',
                  color: viewMode === 'list' ? '#00FF88' : '#4B5563',
                }}
              >
                <LayoutList size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Default toolbar */
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
            <button style={defaultSecondaryBtn}>Group by: Status ▾</button>

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
                style={{
                  ...defaultIconBtn,
                  background: searchOpen ? '#EFF6FF' : 'none',
                  color: searchOpen ? '#2563EB' : '#475569',
                }}
                onClick={() => setSearchOpen((v) => !v)}
                title="Search"
              >
                <Search size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', border: '1px solid #E2E8F0' }}>
              <button
                style={{
                  ...defaultIconBtn,
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
                  ...defaultIconBtn,
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
      )}

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
              onCardClick={(id) => setSelectedFeatureId(id)}
            />
          ))}
        </div>

        {/* Drag overlay — FeatureCard handles its own cyber styling */}
        <DragOverlay>
          {activeFeature && (
            <div style={{ width: 244 }}>
              <FeatureCard feature={activeFeature} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Feature detail panel */}
      <FeatureDetailPanel
        feature={selectedFeature}
        onClose={() => setSelectedFeatureId(null)}
        onSizeAccepted={handleSizeAccepted}
      />

      {/* Feature completion celebration overlay */}
      <FeatureCompletionCelebration
        feature={celebrationFeature}
        reward={celebrationReward}
        onDismiss={() => {
          setCelebrationFeature(null);
          setCelebrationReward(null);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default theme button styles                                         */
/* ------------------------------------------------------------------ */
const defaultSecondaryBtn: React.CSSProperties = {
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

const defaultIconBtn: React.CSSProperties = {
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
