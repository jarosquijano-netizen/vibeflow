'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  IDEA_STAGE_CONFIG,
  STAGE_ORDER,
  type Idea,
  type IdeaStage,
  type IdeaComment,
} from '@/lib/idea-data';

const MONO = "'JetBrains Mono', monospace";
const DISPLAY = "'Space Grotesk', sans-serif";
const CURRENT_USER = 'Jordan Davies';

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#D97706', '#DC2626'];
function hashName(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}
function avatarColor(name: string) { return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length]; }
function inits(name: string) { return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(); }

interface Props {
  idea: Idea | null;
  onClose: () => void;
  onUpdate: (idea: Idea) => void;
  onPromote: (idea: Idea) => void;
}

export default function IdeaDetailPanel({ idea, onClose, onUpdate, onPromote }: Props) {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  const [title, setTitle]           = useState('');
  const [problem, setProblem]       = useState('');
  const [opportunity, setOpp]       = useState('');
  const [metric, setMetric]         = useState('');
  const [newTag, setNewTag]         = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setProblem(idea.problemStatement);
      setOpp(idea.opportunity);
      setMetric(idea.successMetric);
    }
  }, [idea?.id]);

  if (!idea) return null;

  const stage = IDEA_STAGE_CONFIG[idea.stage];
  const now   = new Date().toISOString().slice(0, 10);

  function save(patch: Partial<Idea>) {
    onUpdate({ ...idea!, ...patch, updatedAt: now });
  }

  function handleStageClick(s: IdeaStage) {
    if (s === idea!.stage) return;
    if (s === 'PROMOTED') { onPromote(idea!); return; }
    save({ stage: s });
  }

  function addTag() {
    const tag = newTag.trim().toLowerCase();
    if (!tag || idea!.tags.includes(tag)) { setNewTag(''); return; }
    save({ tags: [...idea!.tags, tag] });
    setNewTag('');
  }

  function removeTag(tag: string) {
    save({ tags: idea!.tags.filter((t) => t !== tag) });
  }

  function addComment() {
    if (!newComment.trim()) return;
    const comment: IdeaComment = {
      id: `c-${Date.now()}`,
      author: CURRENT_USER,
      text: newComment.trim(),
      createdAt: now,
    };
    save({ comments: [...idea!.comments, comment] });
    setNewComment('');
  }

  /* ── Theme tokens ── */
  const C = {
    panelBg:     isCyber ? '#0D0D17'   : '#FFFFFF',
    border:      isCyber ? '#3B4B3D'   : '#E2E8F0',
    headerBg:    isCyber ? '#111118'   : '#F8FAFC',
    label:       isCyber ? '#4B5563'   : '#64748B',
    textPrimary: isCyber ? '#F0FFF4'   : '#0F172A',
    textMuted:   isCyber ? '#6B7280'   : '#94A3B8',
    inputBg:     isCyber ? '#0A0A0F'   : '#F8FAFC',
    inputBorder: isCyber ? '#2A2A3E'   : '#E2E8F0',
    inputFocus:  isCyber ? '#00FF88'   : '#2563EB',
    inputText:   isCyber ? '#F0FFF4'   : '#0F172A',
    tagBg:       isCyber ? '#111118'   : '#F1F5F9',
    tagText:     isCyber ? '#6B7280'   : '#475569',
    tagBorder:   isCyber ? '#2A2A3E'   : 'transparent',
    commentBg:   isCyber ? '#1A1A28'   : '#F1F5F9',
  };

  const inputBase: React.CSSProperties = {
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 4,
    fontFamily: isCyber ? MONO : 'inherit',
    fontSize: 13,
    color: C.inputText,
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    resize: 'vertical' as const,
  };

  function sectionLabel(text: string, special = false): React.CSSProperties {
    return {
      fontFamily: MONO,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: special && isCyber ? '#00FF88' : C.label,
      marginBottom: 8,
      display: 'block',
    };
  }

  const hasVoted = idea.votedBy.includes(CURRENT_USER);

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: 520,
        background: C.panelBg,
        borderLeft: `1px solid ${C.border}`,
        boxShadow: isCyber ? '-20px 0 60px rgba(0,0,0,0.6)' : '-4px 0 20px rgba(0,0,0,0.08)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slide-in-right 200ms ease',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${C.border}`,
          background: C.headerBg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: stage.color,
              background: stage.bg,
              border: `1px solid ${stage.color}50`,
              padding: '3px 10px',
              borderRadius: 4,
            }}
          >
            {stage.label}
          </span>
          <button
            onClick={() => {
              save({
                votes: hasVoted ? idea.votes - 1 : idea.votes + 1,
                votedBy: hasVoted
                  ? idea.votedBy.filter((u) => u !== CURRENT_USER)
                  : [...idea.votedBy, CURRENT_USER],
              });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: `1px solid ${hasVoted ? (isCyber ? '#00FF88' : '#2563EB') : C.inputBorder}`,
              borderRadius: 4,
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              color: hasVoted ? (isCyber ? '#00FF88' : '#2563EB') : C.textMuted,
              padding: '4px 10px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <span>▲</span>
            <span>{idea.votes} votes</span>
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.textMuted,
            display: 'flex',
            alignItems: 'center',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = C.textMuted; }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => { e.currentTarget.style.borderBottomColor = stage.color; }}
          onBlur={(e) => {
            e.currentTarget.style.borderBottomColor = C.inputBorder;
            if (title !== idea.title) save({ title });
          }}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${C.inputBorder}`,
            fontFamily: isCyber ? DISPLAY : 'inherit',
            fontSize: 20,
            fontWeight: 700,
            color: C.textPrimary,
            width: '100%',
            outline: 'none',
            padding: '4px 0',
            transition: 'border-color 150ms ease',
          }}
        />

        {/* Stage selector */}
        <div>
          <span style={sectionLabel('Stage')}>Stage</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STAGE_ORDER.map((s) => {
              const sc = IDEA_STAGE_CONFIG[s];
              const active = s === idea.stage;
              return (
                <button
                  key={s}
                  onClick={() => handleStageClick(s)}
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '4px 12px',
                    borderRadius: 4,
                    border: `1px solid ${active ? sc.color : C.inputBorder}`,
                    background: active ? sc.bg : 'transparent',
                    color: active ? sc.color : C.textMuted,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = sc.color;
                      e.currentTarget.style.color = sc.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = C.inputBorder;
                      e.currentTarget.style.color = C.textMuted;
                    }
                  }}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Statement */}
        <div>
          <span style={sectionLabel(isCyber ? '// PROBLEM_STATEMENT' : 'Problem Statement')}>
            {isCyber ? '// PROBLEM_STATEMENT' : 'Problem Statement'}
          </span>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.inputBorder;
              if (problem !== idea.problemStatement) save({ problemStatement: problem });
            }}
            rows={3}
            placeholder={
              isCyber
                ? '// what problem does this solve...'
                : 'What problem does this solve for our users?'
            }
            style={inputBase}
          />
        </div>

        {/* Opportunity */}
        <div>
          <span style={sectionLabel(isCyber ? '// OPPORTUNITY' : 'Opportunity')}>
            {isCyber ? '// OPPORTUNITY' : 'Opportunity'}
          </span>
          <textarea
            value={opportunity}
            onChange={(e) => setOpp(e.target.value)}
            onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.inputBorder;
              if (opportunity !== idea.opportunity) save({ opportunity });
            }}
            rows={3}
            placeholder="Why is now the right time? What's the market signal?"
            style={{ ...inputBase, fontFamily: isCyber ? MONO : 'inherit', fontSize: isCyber ? 12 : 13 }}
          />
        </div>

        {/* Success Metric */}
        <div>
          <span style={sectionLabel(isCyber ? '// SUCCESS_METRIC' : 'Success Metric', true)}>
            {isCyber ? '// SUCCESS_METRIC' : 'Success Metric'}
          </span>
          <textarea
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            onFocus={(e) => { e.currentTarget.style.borderColor = isCyber ? '#00FF88' : C.inputFocus; }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.inputBorder;
              if (metric !== idea.successMetric) save({ successMetric: metric });
            }}
            rows={2}
            placeholder="How do we measure success? Be specific."
            style={inputBase}
          />
        </div>

        {/* Tags */}
        <div>
          <span style={sectionLabel('Tags')}>Tags</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {idea.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: MONO,
                  fontSize: 11,
                  background: C.tagBg,
                  color: C.tagText,
                  border: `1px solid ${C.tagBorder}`,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: C.textMuted,
                    fontSize: 13,
                    lineHeight: 1,
                    padding: 0,
                    marginLeft: 2,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.inputBorder; }}
              placeholder="Add tag..."
              style={{ ...inputBase, flex: 1 }}
            />
            <button
              onClick={addTag}
              style={{
                padding: '8px 16px',
                background: isCyber ? '#1A1A28' : '#F1F5F9',
                border: `1px solid ${C.inputBorder}`,
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 11,
                color: isCyber ? '#00FF88' : '#475569',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Discussion */}
        <div>
          <span style={sectionLabel(isCyber ? '// DISCUSSION' : 'Discussion')}>
            {isCyber ? '// DISCUSSION' : 'Discussion'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
            {idea.comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: avatarColor(comment.author),
                    color: '#FFF',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {inits(comment.author)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.textPrimary,
                      }}
                    >
                      {comment.author.split(' ')[0]}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.textMuted }}>
                      {comment.createdAt}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: C.textPrimary,
                      lineHeight: 1.5,
                      background: C.commentBg,
                      padding: '8px 12px',
                      borderRadius: 6,
                    }}
                  >
                    {comment.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  addComment();
                }
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.inputFocus; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.inputBorder; }}
              placeholder="Add a comment... (Cmd+Enter to submit)"
              rows={2}
              style={{ ...inputBase, flex: 1 }}
            />
            <button
              onClick={addComment}
              style={{
                padding: '8px 16px',
                background: isCyber ? '#1A1A28' : '#F1F5F9',
                border: `1px solid ${C.inputBorder}`,
                borderRadius: 4,
                fontFamily: MONO,
                fontSize: 11,
                color: isCyber ? '#00FF88' : '#475569',
                cursor: 'pointer',
                alignSelf: 'flex-end',
                flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ── Promote button (sticky bottom) ── */}
      {idea.stage === 'REFINED' && (
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${C.border}`,
            background: C.panelBg,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onPromote(idea)}
            style={{
              width: '100%',
              height: 44,
              background: isCyber ? '#00FF88' : '#2563EB',
              color: isCyber ? '#000000' : '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontFamily: isCyber ? DISPLAY : 'inherit',
              fontWeight: 900,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'box-shadow 150ms ease',
              boxShadow: isCyber ? '0 0 20px rgba(0,255,136,0.2)' : undefined,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = isCyber
                ? '0 0 30px rgba(0,255,136,0.4)'
                : '0 4px 12px rgba(37,99,235,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isCyber
                ? '0 0 20px rgba(0,255,136,0.2)'
                : 'none';
            }}
          >
            {isCyber ? '⚡ PROMOTE_TO_BOARD' : '⚡ Promote to Feature Board'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
