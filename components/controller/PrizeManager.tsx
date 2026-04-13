'use client';

import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';
import type { Prize } from '@/lib/controller-data';
import type { TShirtSize } from '@/lib/feature-rewards';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";

const SAMPLE_TEAM = [
  'Jordan Davies',
  'Sara Kim',
  'Marcus Bell',
  'Alex Chen',
  'Priya Patel',
];

const SIZE_COLORS: Record<TShirtSize, string> = {
  XS: '#64748B',
  S: '#00FF88',
  M: '#00D4FF',
  L: '#FFB800',
  XL: '#FFD700',
};

const TYPE_COLORS: Record<Prize['type'], { bg: string; border: string; text: string }> = {
  BADGE:    { bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.3)',  text: '#00FF88' },
  TITLE:    { bg: 'rgba(255,215,0,0.1)',  border: 'rgba(255,215,0,0.3)',  text: '#FFD700' },
  XP_BOOST: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)', text: '#00D4FF' },
  CUSTOM:   { bg: 'rgba(191,0,255,0.1)', border: 'rgba(191,0,255,0.3)', text: '#BF00FF' },
};

const AVATAR_PALETTE = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];

interface Props {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
}

const EMPTY_FORM: Partial<Prize> = {
  name: '',
  description: '',
  icon: '',
  type: 'BADGE',
  triggerSize: 'M',
  triggerXP: undefined,
  active: true,
};

export default function PrizeManager({ prizes, onChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [formData, setFormData] = useState<Partial<Prize>>(EMPTY_FORM);
  const [showAssign, setShowAssign] = useState<Prize | null>(null);
  const [assignSelections, setAssignSelections] = useState<string[]>([]);

  function openNew() {
    setEditingPrize(null);
    setFormData({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(prize: Prize) {
    setEditingPrize(prize);
    setFormData({ ...prize });
    setShowModal(true);
  }

  function openAssign(prize: Prize) {
    setShowAssign(prize);
    setAssignSelections(prize.assignedTo ?? []);
  }

  function saveModal() {
    if (!formData.name?.trim()) return;
    if (editingPrize) {
      onChange(
        prizes.map((p) =>
          p.id === editingPrize.id ? ({ ...editingPrize, ...formData } as Prize) : p
        )
      );
    } else {
      const newPrize: Prize = {
        id: `pr${Date.now()}`,
        name: formData.name!,
        description: formData.description ?? '',
        icon: formData.icon ?? '◆',
        type: formData.type ?? 'CUSTOM',
        triggerSize: formData.triggerSize,
        triggerXP: formData.triggerXP,
        assignedTo: [],
        createdAt: new Date().toISOString().slice(0, 10),
        active: true,
      };
      onChange([...prizes, newPrize]);
    }
    setShowModal(false);
  }

  function saveAssign() {
    if (!showAssign) return;
    onChange(
      prizes.map((p) =>
        p.id === showAssign.id ? { ...p, assignedTo: assignSelections } : p
      )
    );
    setShowAssign(null);
  }

  function deletePrize(prize: Prize) {
    if (window.confirm(`Delete "${prize.name}"?`)) {
      onChange(prizes.filter((p) => p.id !== prize.id));
    }
  }

  function toggleActive(prize: Prize) {
    onChange(prizes.map((p) => (p.id === prize.id ? { ...p, active: !p.active } : p)));
  }

  const inputStyle: React.CSSProperties = {
    background: '#0A0A0F',
    border: '1px solid #3B4B3D',
    borderRadius: 4,
    fontFamily: MONO,
    fontSize: 13,
    color: '#F0FFF4',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
  };

  const focusGreen = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#00FF88';
  };
  const blurGray = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#3B4B3D';
  };

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: '#6B7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 4,
        }}
      >
        // PRIZE_MANAGER
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: '#4B5563',
          marginBottom: 24,
        }}
      >
        Assign special prizes to operators based on feature size or XP milestones.
      </div>

      {/* Prize table */}
      <div
        style={{
          background: '#111118',
          border: '1px solid #3B4B3D',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#16161E',
            borderBottom: '1px solid #3B4B3D',
          }}
        >
          {[
            { label: 'PRIZE',   flex: 1 },
            { label: 'TYPE',    width: 112 },
            { label: 'TRIGGER', width: 128 },
            { label: 'ASSIGNED', width: 200 },
            { label: 'ACTIVE',  width: 64 },
            { label: 'ACTIONS', width: 80 },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                ...(col.flex ? { flex: col.flex } : { width: col.width }),
                fontFamily: MONO,
                fontSize: 10,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Prize rows */}
        {prizes.map((prize) => {
          const tc = TYPE_COLORS[prize.type];
          const assigned = prize.assignedTo ?? [];

          return (
            <div
              key={prize.id}
              className="prize-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid #1A1A28',
              }}
            >
              {/* PRIZE */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#1A1A28',
                    border: '1px solid #3B4B3D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {prize.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#E4E1E9',
                    }}
                  >
                    {prize.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 220,
                    }}
                  >
                    {prize.description}
                  </div>
                </div>
              </div>

              {/* TYPE */}
              <div style={{ width: 112 }}>
                <span
                  style={{
                    background: tc.bg,
                    border: `1px solid ${tc.border}`,
                    color: tc.text,
                    fontFamily: MONO,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {prize.type}
                </span>
              </div>

              {/* TRIGGER */}
              <div style={{ width: 128 }}>
                {prize.triggerSize ? (
                  <span
                    style={{
                      background: `${SIZE_COLORS[prize.triggerSize]}20`,
                      border: `1px solid ${SIZE_COLORS[prize.triggerSize]}`,
                      color: SIZE_COLORS[prize.triggerSize],
                      fontFamily: MONO,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {prize.triggerSize}
                  </span>
                ) : prize.triggerXP ? (
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>
                    +{prize.triggerXP.toLocaleString()} XP
                  </span>
                ) : (
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#3B4B3D' }}>—</span>
                )}
              </div>

              {/* ASSIGNED */}
              <div
                style={{
                  width: 200,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'nowrap',
                }}
              >
                {assigned.length === 0 ? (
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#3B4B3D' }}>
                    Unassigned
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {assigned.slice(0, 3).map((name, i) => (
                      <div
                        key={name}
                        title={name}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: AVATAR_PALETTE[i % AVATAR_PALETTE.length],
                          color: '#FFF',
                          fontSize: 8,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: i === 0 ? 0 : -6,
                          border: '1.5px solid #111118',
                          position: 'relative',
                          zIndex: 3 - i,
                        }}
                      >
                        {name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    ))}
                    {assigned.length > 3 && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: '#6B7280',
                          marginLeft: 6,
                        }}
                      >
                        +{assigned.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => openAssign(prize)}
                  style={{
                    background: 'none',
                    border: '1px solid #3B4B3D',
                    borderRadius: 4,
                    fontFamily: MONO,
                    fontSize: 10,
                    color: '#4B5563',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    transition: 'border-color 150ms ease, color 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00FF88';
                    e.currentTarget.style.color = '#00FF88';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#3B4B3D';
                    e.currentTarget.style.color = '#4B5563';
                  }}
                >
                  + Assign
                </button>
              </div>

              {/* ACTIVE toggle */}
              <div style={{ width: 64 }}>
                <button
                  onClick={() => toggleActive(prize)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 999,
                    background: prize.active ? 'rgba(0,255,136,0.3)' : '#2A2A3E',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 0,
                    transition: 'background 200ms ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: prize.active ? 14 : 2,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: prize.active ? '#00FF88' : '#6B7280',
                      boxShadow: prize.active ? '0 0 6px rgba(0,255,136,0.6)' : 'none',
                      transition:
                        'left 200ms ease, background 200ms ease, box-shadow 200ms ease',
                      display: 'block',
                    }}
                  />
                </button>
              </div>

              {/* ACTIONS */}
              <div
                className="prize-actions"
                style={{ width: 80, display: 'flex', gap: 8, alignItems: 'center' }}
              >
                <button
                  onClick={() => openEdit(prize)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: '#4B5563',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00FF88';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#4B5563';
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deletePrize(prize)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: '#4B5563',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#4B5563';
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add prize row */}
        <button
          onClick={openNew}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            borderTop: '1px solid #2A2A3E',
            padding: '12px',
            textAlign: 'center',
            fontFamily: MONO,
            fontSize: 12,
            color: '#00FF88',
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,136,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          + Add Prize
        </button>
      </div>

      {/* NEW / EDIT MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480,
              background: '#1A1A28',
              border: '1px solid #3B4B3D',
              borderRadius: 8,
              padding: 32,
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#00FF88',
                }}
              >
                {editingPrize ? '// EDIT_PRIZE' : '// NEW_PRIZE'}
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4B5563';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Prize name"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={focusGreen}
                  onBlur={blurGray}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  placeholder="What did they achieve?"
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
                  onFocus={focusGreen}
                  onBlur={blurGray}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Icon
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Emoji or icon"
                    value={formData.icon ?? ''}
                    onChange={(e) => setFormData((f) => ({ ...f, icon: e.target.value }))}
                    style={{ ...inputStyle, flex: 1, width: 'auto' }}
                    onFocus={focusGreen}
                    onBlur={blurGray}
                  />
                  {formData.icon && (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#111118',
                        border: '1px solid #3B4B3D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {formData.icon}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  Type
                </label>
                <select
                  value={formData.type ?? 'BADGE'}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, type: e.target.value as Prize['type'] }))
                  }
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={focusGreen}
                  onBlur={blurGray}
                >
                  {(['BADGE', 'TITLE', 'XP_BOOST', 'CUSTOM'] as Prize['type'][]).map((t) => (
                    <option key={t} value={t} style={{ background: '#0A0A0F' }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.type === 'BADGE' || formData.type === 'TITLE') && (
                <div>
                  <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    Trigger Size
                  </label>
                  <select
                    value={formData.triggerSize ?? 'M'}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, triggerSize: e.target.value as TShirtSize }))
                    }
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={focusGreen}
                    onBlur={blurGray}
                  >
                    {(['XS', 'S', 'M', 'L', 'XL'] as TShirtSize[]).map((s) => (
                      <option key={s} value={s} style={{ background: '#0A0A0F' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'XP_BOOST' && (
                <div>
                  <label style={{ display: 'block', fontFamily: MONO, fontSize: 10, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    XP Threshold
                  </label>
                  <input
                    type="number"
                    placeholder="XP threshold"
                    value={formData.triggerXP ?? ''}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, triggerXP: Number(e.target.value) }))
                    }
                    style={inputStyle}
                    onFocus={focusGreen}
                    onBlur={blurGray}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={saveModal}
                style={{
                  flex: 1,
                  height: 40,
                  background: '#00FF88',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                SAVE PRIZE
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  height: 40,
                  padding: '0 20px',
                  background: 'none',
                  border: '1px solid #3B4B3D',
                  borderRadius: 4,
                  fontFamily: MONO,
                  fontSize: 12,
                  color: '#4B5563',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#6B7280';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#3B4B3D';
                  e.currentTarget.style.color = '#4B5563';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssign && (
        <div
          onClick={() => setShowAssign(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              background: '#1A1A28',
              border: '1px solid #3B4B3D',
              borderRadius: 8,
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#00FF88',
                    marginBottom: 4,
                  }}
                >
                  // ASSIGN_PRIZE
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: '#6B7280',
                  }}
                >
                  {showAssign.name}
                </div>
              </div>
              <button
                onClick={() => setShowAssign(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4B5563';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}
            >
              {SAMPLE_TEAM.map((member) => {
                const checked = assignSelections.includes(member);
                return (
                  <label
                    key={member}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: checked ? 'rgba(0,255,136,0.05)' : 'transparent',
                      border: `1px solid ${checked ? 'rgba(0,255,136,0.2)' : 'transparent'}`,
                      transition: 'all 150ms ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAssignSelections((prev) =>
                          prev.includes(member)
                            ? prev.filter((m) => m !== member)
                            : [...prev, member]
                        );
                      }}
                      style={{ accentColor: '#00FF88' }}
                    />
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontSize: 9,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {member
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: '#E4E1E9',
                      }}
                    >
                      {member}
                    </span>
                  </label>
                );
              })}
            </div>

            <button
              onClick={saveAssign}
              style={{
                width: '100%',
                height: 36,
                background: '#00FF88',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ASSIGN
            </button>
          </div>
        </div>
      )}

      <style>{`
        .prize-actions { opacity: 0; transition: opacity 150ms ease; }
        .prize-row:hover .prize-actions { opacity: 1; }
      `}</style>
    </div>
  );
}
