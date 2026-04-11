'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Prompt } from '@/types';
import PromptCard, { TOOL_CONFIG } from './PromptCard';
import NewPromptPanel from './NewPromptPanel';

/* ------------------------------------------------------------------ */
/*  Sample data                                                         */
/* ------------------------------------------------------------------ */
const SAMPLE_PROMPTS: Prompt[] = [
  {
    id: 'p1',
    title: 'Rate card comparison table',
    body: 'Build a React table component that compares carrier rate cards side by side. Columns: carrier name, lane, base rate, fuel surcharge, transit days, total cost. Add color coding: green if cheapest on that lane, red if most expensive. Include a sticky header and alternating row colors. Use Tailwind CSS.',
    tool: 'v0', outputType: 'UI Component', quality: 5, version: 3,
    tags: ['rates', 'table', 'comparison'],
    usedInFeatures: ['f1', 'f7'],
  },
  {
    id: 'p2',
    title: 'Shipment tracking state machine',
    body: 'Create a TypeScript state machine for shipment lifecycle: PENDING → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED | FAILED. Each transition needs a timestamp and actor. Include guard conditions (cant go DELIVERED from PENDING). Export as a class with transition(), canTransition(), and getHistory() methods.',
    tool: 'Cursor', outputType: 'Backend Logic', quality: 4, version: 2,
    tags: ['tracking', 'state-machine', 'typescript'],
    usedInFeatures: ['f6'],
  },
  {
    id: 'p3',
    title: 'Customs document form validation',
    body: 'Write a Zod schema for customs declaration forms. Fields: HS code (must match regex), country of origin (ISO 3166-1 alpha-2), declared value (positive number, max 999999), currency (enum USD EUR GBP), description (10-500 chars), quantity (positive integer). Include custom error messages for each field.',
    tool: 'Claude', outputType: 'UI Component', quality: 3, version: 1,
    tags: ['customs', 'validation', 'forms'],
    usedInFeatures: ['f5'],
  },
  {
    id: 'p4',
    title: 'CO2 emissions calculator hook',
    body: 'Build a React hook useCarbonEmissions() that takes: distance (km), weight (kg), transport mode (ROAD|AIR|SEA|RAIL). Returns: co2Kg, co2PerKm, grade (A-F), recommendations string[]. Use GLEC Framework emission factors. Memoize results. Include unit tests with Jest.',
    tool: 'Cursor', outputType: 'React Hook', quality: 5, version: 4,
    tags: ['carbon', 'calculator', 'hook'],
    usedInFeatures: ['f4'],
  },
  {
    id: 'p5',
    title: 'Carrier onboarding checklist UI',
    body: 'Design a step-by-step onboarding checklist component for new carrier registration. Steps: Company details → Insurance docs → Rate submission → Bank details → Compliance review → Activation. Each step: status indicator (complete/active/pending), title, description, CTA button. Progress bar at top.',
    tool: 'v0', outputType: 'UI Component', quality: 4, version: 2,
    tags: ['onboarding', 'carriers', 'checklist'],
    usedInFeatures: ['f9'],
  },
  {
    id: 'p6',
    title: 'Invoice matching algorithm',
    body: 'Write a TypeScript function matchInvoicesToShipments(invoices: Invoice[], shipments: Shipment[]): MatchResult[]. Use fuzzy matching on reference numbers, amount tolerance of ±2%, date window of ±3 days. Return confidence score 0-1, match type (EXACT|FUZZY|MANUAL), and unmatched items separately.',
    tool: 'ChatGPT', outputType: 'Backend Logic', quality: 3, version: 1,
    tags: ['invoice', 'matching', 'algorithm'],
    usedInFeatures: ['f13'],
  },
  {
    id: 'p7',
    title: 'Lane performance recharts dashboard',
    body: 'Create a recharts dashboard showing lane performance metrics. Charts: (1) BarChart of top 10 lanes by volume, (2) LineChart of on-time % over 12 months, (3) ScatterPlot of cost vs transit time per lane. All charts share a lane filter dropdown. Use the VibeFlow color palette.',
    tool: 'v0', outputType: 'Dashboard', quality: 4, version: 3,
    tags: ['charts', 'lanes', 'analytics'],
    usedInFeatures: ['f10'],
  },
  {
    id: 'p8',
    title: 'Webhook event handler',
    body: 'Build a Next.js API route that handles carrier webhook events. Validate HMAC-SHA256 signature from header X-Carrier-Signature. Parse event types: PICKUP_CONFIRMED, IN_TRANSIT, DELIVERED, EXCEPTION. Queue events to a Redis list for async processing. Return 200 immediately, process async. Include retry logic.',
    tool: 'Cursor', outputType: 'API Route', quality: 5, version: 2,
    tags: ['webhooks', 'api', 'security'],
    usedInFeatures: ['f6'],
  },
  {
    id: 'p9',
    title: 'Spot rate request email parser',
    body: 'Write a Claude API prompt that extracts structured data from spot rate request emails. Extract: origin city/zip, destination city/zip, pickup date, cargo type, weight, dimensions, special requirements. Return JSON. Handle missing fields gracefully with null. Include few-shot examples for accuracy.',
    tool: 'Claude', outputType: 'AI Prompt', quality: 4, version: 2,
    tags: ['email', 'parsing', 'ai'],
    usedInFeatures: ['f12'],
  },
];

const TOOLS = Object.keys(TOOL_CONFIG) as (keyof typeof TOOL_CONFIG)[];

/* ------------------------------------------------------------------ */
/*  PromptLibrary                                                       */
/* ------------------------------------------------------------------ */
export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>(SAMPLE_PROMPTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState('ALL');
  const [minQuality, setMinQuality] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Filtering */
  const filtered = prompts
    .filter((p) => activeTool === 'ALL' || p.tool === activeTool)
    .filter((p) => p.quality >= minQuality)
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  /* Handlers */
  function handleCopy(id: string) {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSave(prompt: Prompt) {
    setPrompts((prev) => [prompt, ...prev]);
  }

  function handleUseInSession(id: string) {
    console.log('[PromptLibrary] Use in session:', id);
  }

  function clearFilters() {
    setSearchQuery('');
    setActiveTool('ALL');
    setMinQuality(0);
  }

  const toolColor = activeTool !== 'ALL' ? TOOL_CONFIG[activeTool]?.color : '#0F172A';

  return (
    <div style={{ position: 'relative' }}>
      {/* ── FILTER BAR ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          zIndex: 10,
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginLeft: -24,
          marginRight: -24,
          marginTop: -24,
        }}
      >
        {/* Row 1: Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            style={{
              width: '100%',
              height: 36,
              border: '1px solid #E2E8F0',
              background: '#F1F5F9',
              paddingLeft: 32,
              paddingRight: 56,
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 13,
              outline: 'none',
              borderRadius: 0,
              color: '#0F172A',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
          />
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#E2E8F0',
              color: '#94A3B8',
              fontSize: 10,
              fontFamily: 'var(--font-jetbrains-mono)',
              padding: '2px 6px',
              pointerEvents: 'none',
            }}
          >
            ⌘F
          </span>
        </div>

        {/* Row 2: Tool filters + quality */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* ALL button */}
          <button
            onClick={() => setActiveTool('ALL')}
            style={{
              height: 28,
              paddingLeft: 8,
              paddingRight: 8,
              fontSize: 11,
              textTransform: 'uppercase',
              fontFamily: 'var(--font-dm-sans)',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: 0,
              transition: 'all 100ms ease',
              border: activeTool === 'ALL' ? '1px solid #0F172A' : '1px solid #E2E8F0',
              background: activeTool === 'ALL' ? '#0F172A' : '#FFFFFF',
              color: activeTool === 'ALL' ? '#FFFFFF' : '#475569',
            }}
          >
            ALL
          </button>

          {/* Tool buttons */}
          {TOOLS.map((t) => {
            const cfg = TOOL_CONFIG[t];
            const isActive = activeTool === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTool(isActive ? 'ALL' : t)}
                style={{
                  height: 28,
                  paddingLeft: 8,
                  paddingRight: 8,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderRadius: 0,
                  transition: 'all 100ms ease',
                  border: isActive ? `1px solid ${cfg.color}` : '1px solid #E2E8F0',
                  background: isActive ? cfg.color : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                }}
              >
                {t}
              </button>
            );
          })}

          {/* Separator */}
          <span style={{ color: '#E2E8F0', fontSize: 14, userSelect: 'none' }}>│</span>

          {/* Quality chips */}
          {([3, 4, 5] as const).map((q) => {
            const isActive = minQuality === q;
            return (
              <button
                key={q}
                onClick={() => setMinQuality(isActive ? 0 : q)}
                style={{
                  height: 28,
                  paddingLeft: 8,
                  paddingRight: 8,
                  fontSize: 11,
                  fontFamily: 'var(--font-dm-sans)',
                  cursor: 'pointer',
                  borderRadius: 0,
                  transition: 'all 100ms ease',
                  border: isActive ? '1px solid #D97706' : '1px solid #E2E8F0',
                  background: isActive ? '#FFFBEB' : '#FFFFFF',
                  color: isActive ? '#D97706' : '#475569',
                }}
              >
                ⭐ {q}+
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="prompt-grid" style={{ padding: '24px 24px 24px' }}>
        {filtered.map((p) => (
          <PromptCard
            key={p.id}
            prompt={p}
            onCopy={handleCopy}
            onUseInSession={handleUseInSession}
          />
        ))}
      </div>

      {/* ── EMPTY STATE ── */}
      {filtered.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 96,
            paddingBottom: 96,
          }}
        >
          <svg
            width={64}
            height={64}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="10" y="8" width="44" height="52" rx="2" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="18" y1="22" x2="46" y2="22" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="32" x2="46" y2="32" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="42" x2="34" y2="42" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#475569',
              marginTop: 16,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            No prompts found
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#94A3B8',
              marginTop: 4,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            Try different keywords or clear your filters
          </div>
          <button
            onClick={clearFilters}
            style={{
              marginTop: 16,
              height: 32,
              paddingLeft: 16,
              paddingRight: 16,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: 13,
              cursor: 'pointer',
              borderRadius: 0,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── NEW PROMPT BUTTON ── */}
      <button
        onClick={() => setPanelOpen(true)}
        style={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 20,
          height: 32,
          paddingLeft: 16,
          paddingRight: 16,
          background: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          borderRadius: 0,
          fontFamily: 'var(--font-dm-sans)',
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1D4ED8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#2563EB'; }}
      >
        + New Prompt
      </button>

      {/* ── NEW PROMPT PANEL ── */}
      <NewPromptPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSave={handleSave}
      />

      {/* ── MASONRY GRID CSS ── */}
      <style>{`
        .prompt-grid {
          column-count: 3;
          column-gap: 12px;
        }
        @media (max-width: 1023px) {
          .prompt-grid { column-count: 2; }
        }
        @media (max-width: 639px) {
          .prompt-grid { column-count: 1; }
        }
      `}</style>
    </div>
  );
}
