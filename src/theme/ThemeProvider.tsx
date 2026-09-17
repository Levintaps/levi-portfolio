import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { revealScheme } from './revealScheme';
import type { Point, RevealName } from './reveals';
import { readStoredScheme, resolveScheme, storeScheme, type Scheme } from './scheme';

interface ThemeValue {
  scheme: Scheme;
  /** `origin` is the middle of the button pressed, where one reveal starts. */
  toggle: (origin?: Point) => void;
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
  // The scheme the next toggle starts from. Moved on at the press itself, so
  // a second press before the first change lands still goes the other way.
  const current = useRef(scheme);
  // The reveal played last, which the next press leaves out.
  const lastReveal = useRef<RevealName | undefined>(undefined);

  // Set during the commit rather than after it, so a change flushed inside a
  // view transition has its colours on the page before the browser takes its
  // second photograph.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-scheme', scheme);
  }, [scheme]);

  const toggle = useCallback((origin?: Point) => {
    const next: Scheme = current.current === 'light' ? 'dark' : 'light';
    current.current = next;
    storeScheme(next);
    const played = revealScheme(
      () => {
        flushSync(() => setScheme(next));
      },
      { origin, previous: lastReveal.current },
    );
    if (played) lastReveal.current = played;
  }, []);

  const value = useMemo(() => ({ scheme, toggle }), [scheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useScheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useScheme must be used inside ThemeProvider');
  return value;
}
