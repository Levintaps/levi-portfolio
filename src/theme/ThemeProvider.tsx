import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { readStoredScheme, resolveScheme, storeScheme, type Scheme } from './scheme';

interface ThemeValue {
  scheme: Scheme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>(() =>
    resolveScheme(
      readStoredScheme(),
      typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    ),
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-scheme', scheme);
  }, [scheme]);

  const toggle = useCallback(() => {
    setScheme((current) => {
      const next: Scheme = current === 'light' ? 'dark' : 'light';
      storeScheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ scheme, toggle }), [scheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useScheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useScheme must be used inside ThemeProvider');
  return value;
}
