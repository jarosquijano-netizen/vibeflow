'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Feature } from '@/types';
import FeatureCard, { STATUS_CONFIG } from './FeatureCard';

/* ------------------------------------------------------------------ */
/*  Sortable card wrapper                                               */
/* ------------------------------------------------------------------ */
function SortableCard({ feature, onClick }: { feature: Feature; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <FeatureCard feature={feature} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FeatureColumn                                                       */
/* ------------------------------------------------------------------ */
interface FeatureColumnProps {
  status: string;
  features: Feature[];
  isOver?: boolean;
  onCardClick?: (id: string) => void;
}

export default function FeatureColumn({ status, features, isOver = false, onCardClick }: FeatureColumnProps) {
  const cfg = STATUS_CONFIG[status];
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      style={{
        width: 260,
        minWidth: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      className="group"
    >
      {/* Column header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: '#F8FAFC',
          zIndex: 10,
          borderTop: `3px solid ${cfg.color}`,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: cfg.color,
              }}
            >
              {cfg.label}
            </span>
            <span
              style={{
                background: cfg.lightBg,
                color: cfg.color,
                fontSize: 10,
                padding: '1px 6px',
                fontWeight: 600,
              }}
            >
              {features.length}
            </span>
          </div>
          {/* + button — visible on column hover */}
          <button
            style={{
              width: 24,
              height: 24,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              fontSize: 18,
              lineHeight: 1,
              opacity: 0,
              transition: 'opacity 150ms ease',
              padding: 0,
            }}
            className="group-hover:opacity-100"
            title={`Add ${status} feature`}
          >
            +
          </button>
        </div>
      </div>

      {/* Column body — droppable */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 16,
          paddingTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          border: isOver ? `2px dashed ${cfg.color}` : '2px solid transparent',
          background: isOver ? `${cfg.lightBg}4D` : 'transparent',
          transition: 'border-color 150ms ease, background 150ms ease',
          minHeight: 120,
        }}
      >
        <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {features.length === 0 ? (
            /* Empty state */
            <div
              style={{
                border: '1px dashed #E2E8F0',
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, color: '#CBD5E1', marginBottom: 6 }}>◫</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 2 }}>
                No {status.toLowerCase()} features
              </div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Drag here or click + to add</div>
            </div>
          ) : (
            features.map((feature) => (
              <SortableCard
                key={feature.id}
                feature={feature}
                onClick={() => onCardClick?.(feature.id)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
