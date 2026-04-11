'use client';

import { Toaster, toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Toaster component — add once to app/layout.tsx                       */
/* ------------------------------------------------------------------ */
export function VibeToaster() {
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
/*  vibeToast helpers                                                    */
/* ------------------------------------------------------------------ */
export const vibeToast = {
  success: (message: string) =>
    toast(message, {
      style: { borderLeft: '3px solid #16A34A' },
      duration: 3000,
    }),

  error: (message: string) =>
    toast(message, {
      style: { borderLeft: '3px solid #DC2626' },
      duration: 6000,
      description: 'View in Sync Monitor →',
    }),

  info: (message: string) =>
    toast(message, {
      style: { borderLeft: '3px solid #2563EB' },
      duration: 3000,
    }),

  ai: (message: string) =>
    toast(`✦ ${message}`, {
      style: { borderLeft: '3px solid #7C3AED', color: '#7C3AED' },
      duration: 3000,
    }),
};
