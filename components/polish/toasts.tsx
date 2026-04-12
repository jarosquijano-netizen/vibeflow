'use client';

import { Toaster, toast } from 'sonner';
import { useTheme } from '@/components/providers/ThemeProvider';

const MONO = "'JetBrains Mono', monospace";

/* ------------------------------------------------------------------ */
/*  Toaster component — add once to app/layout.tsx                       */
/* ------------------------------------------------------------------ */
export function VibeToaster() {
  const { theme } = useTheme();
  const isCyber = theme === 'cyber';

  if (isCyber) {
    return (
      <Toaster
        position="bottom-right"
        duration={3000}
        toastOptions={{
          style: {
            fontFamily: MONO,
            fontSize: '12px',
            background: '#0D0D17',
            border: '1px solid #2A2A3E',
            borderRadius: '0',
            padding: '12px 16px',
            color: '#F8F8F2',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          },
        }}
      />
    );
  }

  return (
    <Toaster
      position="bottom-right"
      duration={3000}
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '0',
          padding: '12px 16px',
          color: '#0F172A',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Cyber theme check (for use outside React components)                 */
/* ------------------------------------------------------------------ */
function isCyberTheme(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'cyber';
}

/* ------------------------------------------------------------------ */
/*  vibeToast helpers                                                    */
/* ------------------------------------------------------------------ */
export const vibeToast = {
  success: (message: string) => {
    const cyber = isCyberTheme();
    return toast(message, {
      style: cyber
        ? { borderLeft: '3px solid #00FF88', boxShadow: '0 0 12px rgba(0,255,136,0.15)' }
        : { borderLeft: '3px solid #16A34A' },
      duration: 3000,
    });
  },

  error: (message: string) => {
    const cyber = isCyberTheme();
    return toast(message, {
      style: cyber
        ? { borderLeft: '3px solid #FF4444', boxShadow: '0 0 12px rgba(255,68,68,0.15)' }
        : { borderLeft: '3px solid #DC2626' },
      duration: 6000,
      description: cyber ? '> view in sync monitor' : 'View in Sync Monitor →',
    });
  },

  info: (message: string) => {
    const cyber = isCyberTheme();
    return toast(message, {
      style: cyber
        ? { borderLeft: '3px solid #00D4FF', boxShadow: '0 0 12px rgba(0,212,255,0.15)' }
        : { borderLeft: '3px solid #2563EB' },
      duration: 3000,
    });
  },

  ai: (message: string) => {
    const cyber = isCyberTheme();
    return toast(cyber ? `✦ ${message}` : `✦ ${message}`, {
      style: cyber
        ? { borderLeft: '3px solid #BF00FF', color: '#BF00FF', boxShadow: '0 0 12px rgba(191,0,255,0.15)' }
        : { borderLeft: '3px solid #7C3AED', color: '#7C3AED' },
      duration: 3000,
    });
  },
};
