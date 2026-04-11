'use client';

import { useEffect } from 'react';

export default function GlobalShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      const isTyping =
        ['input', 'textarea', 'select'].includes(tag) ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new Event('open-command-palette'));
      }

      if (e.key === '?' && !isTyping) {
        window.dispatchEvent(new Event('open-keyboard-shortcuts'));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null;
}
