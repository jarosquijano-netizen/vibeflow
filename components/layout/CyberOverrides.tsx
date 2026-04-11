'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * Injects targeted CSS overrides for components that hardcode light-theme
 * colors in inline styles. Header, Sidebar, and main content are handled
 * by their own cyber render paths — this covers everything else.
 */
export default function CyberOverrides() {
  const { theme } = useTheme();
  if (theme !== 'cyber') return null;

  return (
    <style>{`
      /* ── Cards / surfaces that hardcode light colors ── */
      [data-theme="cyber"] [style*="background: #FFFFFF"],
      [data-theme="cyber"] [style*="background: rgb(255, 255, 255)"],
      [data-theme="cyber"] [style*="background: #F8FAFC"],
      [data-theme="cyber"] [style*="background: rgb(248, 250, 252)"] {
        background: #1F1F25 !important;
        border-color: rgba(59,75,61,0.3) !important;
      }

      /* ── List row hover states ── */
      [data-theme="cyber"] [style*="background: #F1F5F9"]:not(kbd):not(span),
      [data-theme="cyber"] [style*="background: rgb(241, 245, 249)"]:not(kbd):not(span) {
        background: #1E1E2E !important;
      }

      /* ── Accent text → remap blue to neon green ── */
      [data-theme="cyber"] [style*="color: #2563EB"],
      [data-theme="cyber"] [style*="color: rgb(37, 99, 235)"] {
        color: #00FF88 !important;
      }

      /* ── Accent borders → remap blue to neon green ── */
      [data-theme="cyber"] [style*="border-color: #2563EB"],
      [data-theme="cyber"] [style*="border-color: rgb(37, 99, 235)"] {
        border-color: #00FF88 !important;
      }

      /* ── Open status badge ── */
      [data-theme="cyber"] [style*="background: #F0FDF4"] {
        background: rgba(0,255,136,0.08) !important;
        border-color: rgba(0,255,136,0.3) !important;
      }

      /* ── Textarea / select fields ── */
      [data-theme="cyber"] textarea,
      [data-theme="cyber"] select {
        background: #1E1E2E !important;
        border-color: rgba(59,75,61,0.3) !important;
        color: #E4E1E9 !important;
      }
    `}</style>
  );
}
