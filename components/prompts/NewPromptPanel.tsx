'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Prompt } from '@/types';
import { vibeToast } from '@/components/polish/toasts';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface NewPromptPanelProps {
  open: boolean;
  onClose: () => void;
  onSave: (prompt: Prompt) => void;
}

const TOOLS: Prompt['tool'][] = ['v0', 'Cursor', 'Bolt', 'ChatGPT', 'Claude', 'Other'];

/* ------------------------------------------------------------------ */
/*  NewPromptPanel                                                      */
/* ------------------------------------------------------------------ */
export default function NewPromptPanel({ open, onClose, onSave }: NewPromptPanelProps) {
  const [title, setTitle] = useState('');
  const [tool, setTool] = useState<Prompt['tool']>('v0');
  const [outputType, setOutputType] = useState('');
  const [quality, setQuality] = useState<Prompt['quality']>(3);
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');

  function handleSave() {
    if (!title.trim() || !body.trim()) return;
    const prompt: Prompt = {
      id: `p-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      tool,
      outputType: outputType.trim() || 'Other',
      quality,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      version: 1,
      usedInFeatures: [],
    };
    onSave(prompt);
    vibeToast.success('Prompt saved to library');
    /* Reset */
    setTitle('');
    setTool('v0');
    setOutputType('');
    setQuality(3);
    setTags('');
    setBody('');
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 40,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 480,
          background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 200ms ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 56,
            paddingLeft: 24,
            paddingRight: 24,
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#0F172A',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            New Prompt
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              padding: 0,
              borderRadius: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form body */}
        <div
          style={{
            flex: 1,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            paddingBottom: 80,
          }}
        >
          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rate card comparison table"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {/* Tool */}
          <div>
            <label style={labelStyle}>Tool</label>
            <select
              value={tool}
              onChange={(e) => setTool(e.target.value as Prompt['tool'])}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              {TOOLS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Output Type */}
          <div>
            <label style={labelStyle}>Output Type</label>
            <input
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
              placeholder="UI Component, Backend Logic, API Route..."
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {/* Quality */}
          <div>
            <label style={labelStyle}>Quality</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setQuality(star as Prompt['quality'])}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 22,
                    color: star <= quality ? '#D97706' : '#E2E8F0',
                    padding: 0,
                    lineHeight: 1,
                    transition: 'color 100ms ease',
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma separated — rates, table, api"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>

          {/* Prompt Body */}
          <div>
            <label style={labelStyle}>Prompt Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your prompt here..."
              style={{
                width: '100%',
                minHeight: 200,
                border: '1px solid #E2E8F0',
                background: '#F1F5F9',
                padding: '8px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-jetbrains-mono)',
                outline: 'none',
                resize: 'vertical',
                borderRadius: 0,
                color: '#0F172A',
                lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              height: 32,
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: 'var(--font-dm-sans)',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
          >
            Save Prompt
          </button>
          <button
            onClick={onClose}
            style={{
              height: 32,
              paddingLeft: 16,
              paddingRight: 16,
              background: '#FFFFFF',
              color: '#475569',
              border: '1px solid #E2E8F0',
              fontSize: 13,
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                       */
/* ------------------------------------------------------------------ */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#94A3B8',
  marginBottom: 4,
  fontFamily: 'var(--font-dm-sans)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 32,
  border: '1px solid #E2E8F0',
  background: '#F1F5F9',
  paddingLeft: 12,
  paddingRight: 12,
  fontSize: 13,
  fontFamily: 'var(--font-dm-sans)',
  outline: 'none',
  borderRadius: 0,
  color: '#0F172A',
  boxSizing: 'border-box',
};
