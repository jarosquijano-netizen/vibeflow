'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * Injects cyber-specific CSS overrides that can't be expressed purely
 * through CSS custom properties (e.g. box-shadow on :hover pseudo-classes,
 * targeted component selectors).
 *
 * Only active when theme === 'cyber'.
 */
export default function CyberOverrides() {
  const { theme } = useTheme();
  if (theme !== 'cyber') return null;

  return (
    <style>{`
      /* ── Sidebar ── */
      [data-theme="cyber"] header {
        background: #1F1F25 !important;
        border-bottom-color: #2A2A3E !important;
      }

      /* ── Search bar ── */
      [data-theme="cyber"] header button[style*="cursor: text"],
      [data-theme="cyber"] header button[style*="cursor:text"] {
        background: #131318 !important;
        border-color: #2A2A3E !important;
      }

      /* ── Quarter / Bell buttons ── */
      [data-theme="cyber"] header button {
        border-color: #2A2A3E !important;
        color: #F8F8F2 !important;
      }
      [data-theme="cyber"] header button:hover {
        background: #1B1B20 !important;
        border-color: #00FF88 !important;
      }

      /* ── + New button ── */
      [data-theme="cyber"] header button[style*="background: rgb(37, 99, 235)"],
      [data-theme="cyber"] header button[style*="background: #2563EB"],
      [data-theme="cyber"] header button[style*="background: rgb(29, 78, 216)"],
      [data-theme="cyber"] header button[style*="background: #1D4ED8"] {
        background: #00FF88 !important;
        color: #0A0A0F !important;
        box-shadow: 0 0 12px rgba(0, 255, 136, 0.4) !important;
      }
      [data-theme="cyber"] header button[style*="background: rgb(37, 99, 235)"]:hover,
      [data-theme="cyber"] header button[style*="background: #2563EB"]:hover {
        background: #00CC6A !important;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.6) !important;
      }

      /* ── Main content area ── */
      [data-theme="cyber"] main {
        background: #0A0A0F !important;
      }

      /* ── Cards / surfaces ── */
      [data-theme="cyber"] [style*="background: #FFFFFF"],
      [data-theme="cyber"] [style*="background: rgb(255, 255, 255)"],
      [data-theme="cyber"] [style*="background: #F8FAFC"],
      [data-theme="cyber"] [style*="background: rgb(248, 250, 252)"] {
        background: #1F1F25 !important;
        border-color: #2A2A3E !important;
      }

      /* ── Table / list rows hover ── */
      [data-theme="cyber"] [style*="background: #F1F5F9"]:not(kbd):not(span),
      [data-theme="cyber"] [style*="background: rgb(241, 245, 249)"]:not(kbd):not(span) {
        background: #1B1B20 !important;
      }

      /* ── Active nav item highlight ── */
      [data-theme="cyber"] nav a[style*="background: #EFF6FF"],
      [data-theme="cyber"] nav [style*="background: #EFF6FF"] {
        background: rgba(0, 255, 136, 0.08) !important;
        border-left: 2px solid #00FF88 !important;
        box-shadow: inset 0 0 12px rgba(0, 255, 136, 0.05) !important;
        color: #00FF88 !important;
      }

      /* ── Accent-colored text ── */
      [data-theme="cyber"] [style*="color: #2563EB"],
      [data-theme="cyber"] [style*="color: rgb(37, 99, 235)"] {
        color: #00FF88 !important;
      }

      /* ── Accent borders ── */
      [data-theme="cyber"] [style*="border-color: #2563EB"],
      [data-theme="cyber"] [style*="border-color: rgb(37, 99, 235)"] {
        border-color: #00FF88 !important;
      }

      /* ── Status badges — keep their semantic colors but adjust backgrounds ── */
      [data-theme="cyber"] [style*="background: #F0FDF4"] {
        background: rgba(0, 255, 136, 0.08) !important;
        border-color: rgba(0, 255, 136, 0.3) !important;
      }
    `}</style>
  );
}
