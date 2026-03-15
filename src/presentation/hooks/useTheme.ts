'use client';

import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Syncs the Zustand theme state with the document's data-theme attribute,
 * respecting the OS preference when theme is 'auto'.
 */
export function useTheme() {
  const theme = useStore(s => s.theme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');

    const apply = (isLight: boolean) => {
      document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
    };

    if (theme === 'auto') {
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(theme === 'light');
    }
  }, [theme]);
}
