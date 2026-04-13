'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { MessageSquare } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { IDEA_STAGE_CONFIG, type Idea } from '@/lib/idea-data';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";
const CURRENT_USER = 'Jordan Davies';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];
function hashName(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}
function authorColor(name: string) { return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]; }
function authorInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  idea: Idea;
  onClick: () => void;
  onVote: (id: string) => void;
  onPromote: (idea: Idea) => void;
  isDragging?: boolean;
}

export default function IdeaCard({ idea, onClick, onVote, onPromote, isDragging }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';
  const [hovered, setHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged,
  } = useDraggable({ id: idea.id, data: { stage: idea.stage } });

  const stage = IDEA_STAGE_CONFIG[idea.stage];
  const hasVoted = idea.votedBy.includes(CURRENT_USER);

  const txStr = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : null;
  const transformStr = [
    txStr,
    isDragging ? 'rotate(1deg)' : null,
    hovered && !isBeingDragged && !isDragging ? 'translateY(-1px)' : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const visibleTags = idea.tags.slice(0, 3);
  const extraTags = idea.tags.length - visibleTags.length;

  /* ── CYBER ── */
  if (isCyber) {
    return (
      <div
        ref={setNodeRef}
        style={{
          background: '#1A1A28',
          border: `1px solid ${hovered || isDragging ? stage.color : '#2A2A3E'}`,
          borderLeft: `3px solid ${stage.color}`,
          borderRadius: 6,
          padding: 16,
          cursor: isBeingDragged ? 'grabbing' : 'pointer',
          opacity: isDragging ? 0.6 : isBeingDragged ? 0.25 : 1,
          transform: transformStr,
          boxShadow: isDragging
            ? '0 20px 30px rgba(0,0,0,0.5)'
            : hovered
            ? `0 0 16px ${stage.glow}`
            : undefined,
          transition: isBeingDragged ? undefined : 'all 150ms ease',
          userSelect: 'none',
        }}
        {...attributes}
        {...listeners}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Row 1: stage pill + vote */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: stage.color,
              background: stage.bg,
              border: `1px solid ${stage.color}50`,
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {stage.label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onVote(idea.id); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              color: hasVoted ? '#00FF88' : '#4B5563',
              padding: '2px 4px',
              transition: 'color 150ms ease',
            }}
          >
            <span style={{ fontSize: 10 }}>▲</span>
            {idea.votes}
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 13,
            fontWeight: 600,
            color: '#F0FFF4',
            marginTop: 8,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {idea.title}
        </div>

        {/* Problem statement */}
        {idea.problemStatement && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: '#4B5563',
              fontStyle: 'italic',
              marginTop: 4,
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {idea.problemStatement}
          </div>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {visibleTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  background: '#111118',
                  border: '1px solid #2A2A3E',
                  color: '#4B5563',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span style={{ fontFamily: MONO, fontSize: 10, color: '#3B4B3D' }}>
                +{extraTags}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: authorColor(idea.author),
                color: '#FFF',
                fontSize: 7,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {authorInitials(idea.author)}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
              {idea.author.split(' ')[0]}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {idea.comments.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: MONO, fontSize: 10, color: '#4B5563' }}>
                <MessageSquare size={10} />
                {idea.comments.length}
              </span>
            )}
            {idea.stage === 'REFINED' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPromote(idea); }}
                style={{
                  background: 'none',
                  border: '1px solid #00FF88',
                  borderRadius: 4,
                  fontFamily: MONO,
                  fontSize: 10,
                  color: '#00FF88',
                  padding: '2px 8px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,136,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                Promote →
              </button>
            )}
            {idea.stage === 'PROMOTED' && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  background: 'rgba(0,255,136,0.1)',
                  color: '#00FF88',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                On Board ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── DEFAULT ── */
  return (
    <div
      ref={setNodeRef}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hovered || isDragging ? '#2563EB' : '#E2E8F0'}`,
        borderRadius: 8,
        padding: 16,
        cursor: isBeingDragged ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.6 : isBeingDragged ? 0.25 : 1,
        transform: transformStr,
        boxShadow: isDragging
          ? '0 20px 25px rgba(0,0,0,0.2)'
          : hovered
          ? '0 1px 4px rgba(0,0,0,0.08)'
          : undefined,
        transition: isBeingDragged ? undefined : 'all 150ms ease',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Row 1: stage pill + vote */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: stage.color,
            background: stage.bg,
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {stage.label}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onVote(idea.id); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            color: hasVoted ? '#2563EB' : '#94A3B8',
            padding: '2px 4px',
            transition: 'color 150ms ease',
          }}
        >
          <span style={{ fontSize: 10 }}>▲</span>
          {idea.votes}
        </button>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#0F172A',
          marginTop: 8,
          lineHeight: 1.4,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {idea.title}
      </div>

      {/* Problem statement */}
      {idea.problemStatement && (
        <div
          style={{
            fontSize: 11,
            color: '#94A3B8',
            fontStyle: 'italic',
            marginTop: 4,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {idea.problemStatement}
        </div>
      )}

      {/* Tags */}
      {visibleTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                background: '#F1F5F9',
                color: '#475569',
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span style={{ fontSize: 10, color: '#94A3B8' }}>+{extraTags}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: authorColor(idea.author),
              color: '#FFF',
              fontSize: 7,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {authorInitials(idea.author)}
          </div>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>{idea.author.split(' ')[0]}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {idea.comments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#94A3B8' }}>
              <MessageSquare size={10} />
              {idea.comments.length}
            </span>
          )}
          {idea.stage === 'REFINED' && (
            <button
              onClick={(e) => { e.stopPropagation(); onPromote(idea); }}
              style={{
                background: 'none',
                border: '1px solid #2563EB',
                borderRadius: 4,
                fontSize: 11,
                color: '#2563EB',
                padding: '2px 8px',
                cursor: 'pointer',
              }}
            >
              Promote →
            </button>
          )}
          {idea.stage === 'PROMOTED' && (
            <span
              style={{
                fontSize: 10,
                background: '#F0FDF4',
                color: '#16A34A',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              On Board ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
