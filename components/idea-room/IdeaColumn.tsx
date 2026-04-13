'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { IDEA_STAGE_CONFIG, type Idea, type IdeaStage } from '@/lib/idea-data';
import IdeaCard from './IdeaCard';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

interface Props {
  stage: IdeaStage;
  ideas: Idea[];
  isOver?: boolean;
  onCardClick: (idea: Idea) => void;
  onVote: (id: string) => void;
  onPromote: (idea: Idea) => void;
  onAddIdea: (stage: IdeaStage) => void;
}

export default function IdeaColumn({
  stage,
  ideas,
  isOver,
  onCardClick,
  onVote,
  onPromote,
  onAddIdea,
}: Props) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [colHovered, setColHovered] = useState(false);

  const { setNodeRef } = useDroppable({ id: stage });
  const cfg = IDEA_STAGE_CONFIG[stage];

  /* ── CYBER ── */
  if (isCyber) {
    return (
      <div
        style={{
          width: 280,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={() => setColHovered(true)}
        onMouseLeave={() => setColHovered(false)}
      >
        {/* Header */}
        <div
          style={{
            paddingBottom: 8,
            borderTop: `3px solid ${cfg.color}`,
            paddingTop: 12,
            background: '#0A0A0F',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </span>
              <span
                style={{
                  background: cfg.bg,
                  color: cfg.color,
                  fontFamily: MONO,
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {ideas.length}
              </span>
            </div>
            <button
              onClick={() => onAddIdea(stage)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: cfg.color,
                display: 'flex',
                alignItems: 'center',
                opacity: colHovered ? 1 : 0,
                transition: 'opacity 150ms ease',
                padding: 2,
              }}
            >
              <Plus size={14} />
            </button>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: '#4B5563',
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            {cfg.description}
          </div>
        </div>

        {/* Body */}
        <div
          ref={setNodeRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingTop: 8,
            paddingLeft: 4,
            paddingRight: 4,
            paddingBottom: 16,
            border: isOver ? `1px dashed ${cfg.color}` : '1px solid transparent',
            borderRadius: 6,
            background: isOver ? cfg.bg : 'transparent',
            transition: 'all 150ms ease',
            minHeight: 80,
          }}
        >
          {ideas.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: 11,
                color: '#3B4B3D',
                textAlign: 'center',
                padding: 24,
              }}
            >
              // no_{stage.toLowerCase()}_ideas
            </div>
          ) : (
            ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => onCardClick(idea)}
                onVote={onVote}
                onPromote={onPromote}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  /* ── DEFAULT ── */
  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={() => setColHovered(true)}
      onMouseLeave={() => setColHovered(false)}
    >
      {/* Header */}
      <div
        style={{
          paddingBottom: 8,
          borderTop: `3px solid ${cfg.color}`,
          paddingTop: 12,
          background: '#F8FAFC',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: cfg.color,
              }}
            >
              {cfg.label}
            </span>
            <span
              style={{
                background: cfg.bg,
                color: cfg.color,
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {ideas.length}
            </span>
          </div>
          <button
            onClick={() => onAddIdea(stage)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              opacity: colHovered ? 1 : 0,
              transition: 'opacity 150ms ease',
              padding: 2,
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 }}>
          {cfg.description}
        </div>
      </div>

      {/* Body */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingTop: 8,
          paddingLeft: 4,
          paddingRight: 4,
          paddingBottom: 16,
          border: isOver ? `1px dashed ${cfg.color}` : '1px solid transparent',
          borderRadius: 6,
          background: isOver ? cfg.bg : 'transparent',
          transition: 'all 150ms ease',
          minHeight: 80,
        }}
      >
        {ideas.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#CBD5E1',
              textAlign: 'center',
              padding: 24,
              border: '1px dashed #E2E8F0',
              borderRadius: 6,
              margin: '4px 0',
            }}
          >
            No ideas yet
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onClick={() => onCardClick(idea)}
              onVote={onVote}
              onPromote={onPromote}
            />
          ))
        )}
      </div>
    </div>
  );
}
