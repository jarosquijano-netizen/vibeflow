'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { Search, Plus, X, SortAsc } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { SAMPLE_IDEAS, STAGE_ORDER, IDEA_STAGE_CONFIG, type Idea, type IdeaStage } from '@/lib/idea-data';
import { addPromotedFeature } from '@/lib/feature-store';
import { dispatchXPEvent } from '@/lib/xp-engine';
import { vibeToast } from '@/components/polish/toasts';
import type { Feature } from '@/types';
import IdeaColumn from './IdeaColumn';
import IdeaCard from './IdeaCard';
import IdeaDetailPanel from './IdeaDetailPanel';
import PromoteModal from './PromoteModal';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";
const CURRENT_USER = 'Jordan Davies';

type SortBy = 'newest' | 'votes' | 'stage';

interface PromoteFormData {
  id: string;
  quarter: string;
  owner: string;
  size: Feature['size'];
}

export default function IdeaRoom() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [ideas, setIdeas] = useState<Idea[]>(SAMPLE_IDEAS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<Idea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeIdea = useMemo(() => ideas.find((i) => i.id === activeId) ?? null, [ideas, activeId]);
  const selectedIdea = useMemo(() => ideas.find((i) => i.id === selectedIdeaId) ?? null, [ideas, selectedIdeaId]);

  const filteredIdeas = useMemo(() => {
    let result = ideas;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)) ||
          i.author.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'votes') {
      result = [...result].sort((a, b) => b.votes - a.votes);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sortBy === 'stage') {
      result = [...result].sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      );
    }
    return result;
  }, [ideas, searchQuery, sortBy]);

  const ideasByStage = useMemo(() => {
    const map: Record<IdeaStage, Idea[]> = { RAW: [], EXPLORING: [], REFINED: [], PROMOTED: [] };
    for (const idea of filteredIdeas) {
      map[idea.stage].push(idea);
    }
    return map;
  }, [filteredIdeas]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over?.id as string ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || !activeIdea) return;

    const overId = over.id as string;

    // Determine target stage
    let targetStage: IdeaStage | null = null;

    if (STAGE_ORDER.includes(overId as IdeaStage)) {
      // Dropped on a column
      targetStage = overId as IdeaStage;
    } else {
      // Dropped on a card — find that card's stage
      const overCard = ideas.find((i) => i.id === overId);
      if (overCard) targetStage = overCard.stage;
    }

    if (!targetStage || targetStage === activeIdea.stage) return;

    // Dragging to PROMOTED triggers modal instead of direct move
    if (targetStage === 'PROMOTED' && activeIdea.stage !== 'PROMOTED') {
      setPromoteTarget(activeIdea);
      return;
    }

    setIdeas((prev) =>
      prev.map((i) =>
        i.id === activeIdea.id
          ? { ...i, stage: targetStage!, updatedAt: new Date().toISOString().split('T')[0] }
          : i
      )
    );
  }

  function handleVote(id: string) {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        const hasVoted = idea.votedBy.includes(CURRENT_USER);
        return {
          ...idea,
          votes: hasVoted ? idea.votes - 1 : idea.votes + 1,
          votedBy: hasVoted
            ? idea.votedBy.filter((u) => u !== CURRENT_USER)
            : [...idea.votedBy, CURRENT_USER],
        };
      })
    );
  }

  function handlePromote(idea: Idea) {
    setPromoteTarget(idea);
  }

  function handleConfirmPromote(idea: Idea, formData: PromoteFormData) {
    const feature: Feature = {
      id: formData.id || `promoted-${Date.now()}`,
      title: idea.title,
      problemStatement: idea.problemStatement || idea.description,
      status: 'IDEA',
      size: formData.size,
      quarter: formData.quarter || 'Q3 2026',
      owner: formData.owner || idea.author,
    };

    // 1. Save to localStorage
    addPromotedFeature(feature);

    // 2. Dispatch event so same-tab Feature Board updates immediately
    window.dispatchEvent(new CustomEvent('feature-promoted', { detail: { feature } }));

    // 3. Update idea stage in local state
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id
          ? {
              ...i,
              stage: 'PROMOTED',
              promotedAt: new Date().toISOString().split('T')[0],
              featureId: feature.id,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : i
      )
    );

    setPromoteTarget(null);

    // 4. XP + toast
    dispatchXPEvent({
      id: `promote-${Date.now()}`,
      label: `Idea promoted: ${idea.title}`,
      amount: 100,
      timestamp: Date.now(),
    });

    vibeToast.success(`"${idea.title}" is now on the Feature Board!`);

    if (isCyber) {
      vibeToast.ai(`✦ +100 XP — Idea promoted to board`);
    }
  }

  function handleUpdateIdea(updated: Idea) {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleAddIdea(stage: IdeaStage) {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title: 'New idea',
      description: '',
      stage,
      tags: [],
      votes: 0,
      votedBy: [],
      author: CURRENT_USER,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      problemStatement: '',
      opportunity: '',
      successMetric: '',
      linkedSessions: [],
      attachments: [],
      comments: [],
    };
    setIdeas((prev) => [newIdea, ...prev]);
    setSelectedIdeaId(newIdea.id);
  }

  const cycleSortBy = useCallback(() => {
    setSortBy((prev) => {
      if (prev === 'newest') return 'votes';
      if (prev === 'votes') return 'stage';
      return 'newest';
    });
  }, []);

  const sortLabel: Record<SortBy, string> = {
    newest: 'NEWEST',
    votes: 'VOTES',
    stage: 'STAGE',
  };

  /* ── render ── */
  const bg = isCyber ? '#0A0A0F' : '#F8FAFC';
  const borderColor = isCyber ? '#1A2E1C' : '#E2E8F0';
  const textPrimary = isCyber ? '#F0FFF4' : '#0F172A';
  const textMuted = isCyber ? '#4B5563' : '#94A3B8';
  const accentColor = isCyber ? '#00FF88' : '#2563EB';
  const inputBg = isCyber ? '#111118' : '#FFFFFF';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: bg,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: `1px solid ${borderColor}`,
          background: bg,
          gap: 12,
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isCyber ? (
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 16,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: '0.05em',
              }}
            >
              // IDEA_ROOM
            </span>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
              Idea Room
            </span>
          )}
          <span
            style={{
              fontFamily: isCyber ? MONO : 'inherit',
              fontSize: 11,
              color: textMuted,
              background: isCyber ? '#111118' : '#F1F5F9',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {ideas.length} ideas
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Sort */}
          <button
            onClick={cycleSortBy}
            title={`Sort by ${sortLabel[sortBy]}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 12px',
              background: isCyber ? '#111118' : '#FFFFFF',
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: isCyber ? MONO : 'inherit',
              fontSize: 11,
              color: textMuted,
              transition: 'border-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; }}
          >
            <SortAsc size={12} />
            {isCyber ? sortLabel[sortBy] : sortLabel[sortBy].charAt(0) + sortLabel[sortBy].slice(1).toLowerCase()}
          </button>

          {/* Search */}
          {searchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isCyber ? 'search_ideas...' : 'Search ideas...'}
                style={{
                  height: 32,
                  padding: '0 12px',
                  background: inputBg,
                  border: `1px solid ${accentColor}`,
                  borderRadius: 4,
                  fontFamily: isCyber ? MONO : 'inherit',
                  fontSize: 12,
                  color: textPrimary,
                  outline: 'none',
                  width: 200,
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 12px',
                background: isCyber ? '#111118' : '#FFFFFF',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: isCyber ? MONO : 'inherit',
                fontSize: 11,
                color: textMuted,
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; }}
            >
              <Search size={12} />
              {isCyber ? 'SEARCH' : 'Search'}
            </button>
          )}

          {/* New Idea */}
          <button
            onClick={() => handleAddIdea('RAW')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 14px',
              background: accentColor,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: isCyber ? DISPLAY : 'inherit',
              fontWeight: 700,
              fontSize: 12,
              color: isCyber ? '#000000' : '#FFFFFF',
              letterSpacing: isCyber ? '0.05em' : undefined,
              transition: 'box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isCyber
                ? '0 0 16px rgba(0,255,136,0.4)'
                : '0 4px 12px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus size={14} />
            {isCyber ? 'NEW_IDEA' : 'New Idea'}
          </button>
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '16px 20px',
              height: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            {STAGE_ORDER.map((stage) => (
              <IdeaColumn
                key={stage}
                stage={stage}
                ideas={ideasByStage[stage]}
                isOver={overId === stage}
                onCardClick={(idea) => setSelectedIdeaId(idea.id)}
                onVote={handleVote}
                onPromote={handlePromote}
                onAddIdea={handleAddIdea}
              />
            ))}
          </div>

          <DragOverlay>
            {activeIdea ? (
              <IdeaCard
                idea={activeIdea}
                onClick={() => {}}
                onVote={() => {}}
                onPromote={() => {}}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Detail panel */}
      {selectedIdea && (
        <IdeaDetailPanel
          idea={selectedIdea}
          onClose={() => setSelectedIdeaId(null)}
          onUpdate={handleUpdateIdea}
          onPromote={(idea) => {
            setPromoteTarget(idea);
            setSelectedIdeaId(null);
          }}
        />
      )}

      {/* Promote modal */}
      <PromoteModal
        idea={promoteTarget}
        onConfirm={handleConfirmPromote}
        onClose={() => setPromoteTarget(null)}
      />
    </div>
  );
}
