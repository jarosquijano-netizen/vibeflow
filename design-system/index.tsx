"use client";

import { LayoutDashboard, Package, BarChart3 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94A3B8",
          marginBottom: 12,
          borderBottom: "1px solid #F1F5F9",
          paddingBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  1. STATUS BADGES                                                   */
/* ------------------------------------------------------------------ */
const STATUS_BADGE_STYLES: Record<string, { border: string; color: string; bg: string }> = {
  IDEA:        { border: "#94A3B8", color: "#94A3B8", bg: "#F8FAFC" },
  SCOPING:     { border: "#7C3AED", color: "#7C3AED", bg: "#F5F3FF" },
  PROTOTYPING: { border: "#2563EB", color: "#2563EB", bg: "#EFF6FF" },
  BUILDING:    { border: "#D97706", color: "#D97706", bg: "#FFF7ED" },
  DONE:        { border: "#16A34A", color: "#16A34A", bg: "#F0FDF4" },
  PARKED:      { border: "#DC2626", color: "#DC2626", bg: "#FEF2F2" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE_STYLES[status];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontWeight: 500,
        color: s.color,
        background: s.bg,
        borderLeft: `2px solid ${s.border}`,
        padding: "2px 8px",
      }}
    >
      {status}
    </span>
  );
}

function StatusBadges() {
  return (
    <Section label="Status Badges">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.keys(STATUS_BADGE_STYLES).map((s) => (
          <StatusBadge key={s} status={s} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  2. T-SHIRT SIZE BADGES                                             */
/* ------------------------------------------------------------------ */
const SIZE_COLORS: Record<string, string> = {
  XS: "#64748B",
  S: "#16A34A",
  M: "#2563EB",
  L: "#D97706",
  XL: "#DC2626",
};

function SizeBadge({ size }: { size: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: 600,
        color: "#FFFFFF",
        background: SIZE_COLORS[size],
        padding: "2px 8px",
      }}
    >
      {size}
    </span>
  );
}

function AISizingBadge() {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: 600,
        color: "#FFFFFF",
        background: "#7C3AED",
        padding: "2px 8px",
        animation: "ai-pulse 2s infinite",
      }}
    >
      ✦ AI Sizing…
    </span>
  );
}

function SizeBadges() {
  return (
    <Section label="T-Shirt Size Badges">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {Object.keys(SIZE_COLORS).map((s) => (
          <SizeBadge key={s} size={s} />
        ))}
        <AISizingBadge />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  3. BUTTON VARIANTS                                                 */
/* ------------------------------------------------------------------ */
const btnBase: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontSize: 13,
  fontWeight: 500,
  height: 32,
  borderRadius: 0,
  paddingLeft: 12,
  paddingRight: 12,
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  transition: "all 150ms ease",
};

function Buttons() {
  return (
    <Section label="Button Variants">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* Primary */}
        <button
          style={{ ...btnBase, background: "#2563EB", color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1D4ED8";
            e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2563EB";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Primary
        </button>

        {/* Secondary */}
        <button
          style={{
            ...btnBase,
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
          }}
        >
          Secondary
        </button>

        {/* Ghost */}
        <button
          style={{
            ...btnBase,
            background: "transparent",
            border: "none",
            color: "#475569",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#0F172A";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#475569";
            e.currentTarget.style.textDecoration = "none";
          }}
        >
          Ghost
        </button>

        {/* Danger */}
        <button
          style={{ ...btnBase, background: "#DC2626", color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#B91C1C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#DC2626";
          }}
        >
          Danger
        </button>

        {/* AI */}
        <button
          style={{ ...btnBase, background: "#7C3AED", color: "#FFFFFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6D28D9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#7C3AED";
          }}
        >
          ✦ AI Action
        </button>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  4. INPUT / TEXTAREA                                                */
/* ------------------------------------------------------------------ */
const inputStyle: React.CSSProperties = {
  height: 32,
  border: "1px solid #E2E8F0",
  background: "#F1F5F9",
  paddingLeft: 12,
  paddingRight: 12,
  fontSize: 14,
  fontFamily: "var(--font-dm-sans)",
  outline: "none",
  width: 260,
  color: "#0F172A",
};

function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#2563EB";
}
function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#E2E8F0";
}

function Inputs() {
  return (
    <Section label="Input / Textarea">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
        <input
          type="text"
          placeholder="Placeholder text…"
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <input
          type="text"
          defaultValue="Filled value"
          style={inputStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <textarea
          placeholder="Textarea placeholder…"
          style={{
            ...inputStyle,
            height: "auto",
            minHeight: 80,
            resize: "vertical",
            paddingTop: 8,
            paddingBottom: 8,
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  5. CARD COMPONENT                                                  */
/* ------------------------------------------------------------------ */
function Card({
  headerLabel,
  headerColor,
  children,
}: {
  headerLabel: string;
  headerColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        padding: 16,
        transition: "all 150ms ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#2563EB";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          fontWeight: 700,
          color: "#94A3B8",
          borderLeft: `3px solid ${headerColor}`,
          paddingLeft: 8,
          marginBottom: 8,
        }}
      >
        {headerLabel}
      </div>
      {children}
    </div>
  );
}

function Cards() {
  return (
    <Section label="Card Component">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card headerLabel="Feature" headerColor="#2563EB">
          <p style={{ fontSize: 13, color: "#0F172A", margin: 0 }}>
            Carrier rate comparison engine for multi-modal freight.
          </p>
        </Card>
        <Card headerLabel="In Progress" headerColor="#D97706">
          <p style={{ fontSize: 13, color: "#0F172A", margin: 0 }}>
            Real-time tracking webhooks — event-driven push notifications.
          </p>
        </Card>
        <Card headerLabel="AI Insight" headerColor="#7C3AED">
          <p style={{ fontSize: 13, color: "#0F172A", margin: 0 }}>
            Suggested size: L — based on 3 similar past features.
          </p>
        </Card>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  6. TABLE ROW STYLE                                                 */
/* ------------------------------------------------------------------ */
const tableData = [
  { lane: "SH → LAX", carrier: "Maersk", otd: "97.2%", cost: "$2,340" },
  { lane: "RTM → NYC", carrier: "Hapag-Lloyd", otd: "94.1%", cost: "$1,890" },
  { lane: "HKG → LGB", carrier: "COSCO", otd: "91.8%", cost: "$2,100" },
  { lane: "SIN → SEA", carrier: "ONE", otd: "95.5%", cost: "$2,560" },
];

const thStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  color: "#94A3B8",
  fontWeight: 600,
  textAlign: "left",
  padding: "0 12px",
  height: 32,
  borderBottom: "1px solid #E2E8F0",
};

const tdStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#0F172A",
  padding: "0 12px",
  height: 32,
  borderBottom: "1px solid #E2E8F0",
};

function TableRows() {
  return (
    <Section label="Table Row Style">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Lane</th>
            <th style={thStyle}>Carrier</th>
            <th style={thStyle}>OTD %</th>
            <th style={thStyle}>Cost / TEU</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, i) => (
            <tr
              key={row.lane}
              style={{ background: i % 2 === 0 ? "#FFFFFF" : "#F1F5F9" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EFF6FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#F1F5F9";
              }}
            >
              <td style={tdStyle}>{row.lane}</td>
              <td style={tdStyle}>{row.carrier}</td>
              <td style={tdStyle}>{row.otd}</td>
              <td style={tdStyle}>{row.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  7. NAVIGATION ITEMS                                                */
/* ------------------------------------------------------------------ */
function NavItem({
  icon: Icon,
  label,
  state,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  state: "active" | "hover" | "inactive";
}) {
  const isActive = state === "active";
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 34,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 150ms ease",
    borderLeft: isActive ? "2px solid #2563EB" : "2px solid transparent",
    background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
    color: isActive ? "#FFFFFF" : "#94A3B8",
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.color = "#FFFFFF";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#94A3B8";
        }
      }}
    >
      <Icon size={16} color={isActive ? "#2563EB" : "#475569"} />
      {label}
    </div>
  );
}

function NavigationItems() {
  return (
    <Section label="Navigation Items">
      <div
        style={{
          background: "#0D1B2A",
          padding: "12px 0",
          width: 220,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <NavItem icon={LayoutDashboard} label="Features" state="active" />
        <NavItem icon={Package} label="Prompts" state="hover" />
        <NavItem icon={BarChart3} label="Reports" state="inactive" />
      </div>
      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
        States shown: active · hover (mouseover to see) · inactive
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                        */
/* ------------------------------------------------------------------ */
export default function DesignSystemShowcase() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        padding: 48,
        maxWidth: 960,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 48,
        fontFamily: "var(--font-dm-sans)",
        minHeight: "100vh",
      }}
    >
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", margin: 0 }}>
          VibeFlow Design System
        </h1>
        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
          Internal reference — base component tokens and patterns
        </p>
      </div>

      <StatusBadges />
      <SizeBadges />
      <Buttons />
      <Inputs />
      <Cards />
      <TableRows />
      <NavigationItems />
    </div>
  );
}
