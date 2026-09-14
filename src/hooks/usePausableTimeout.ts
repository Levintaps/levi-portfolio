import { useEffect, useRef } from 'react';

/**
 * A timeout that can be paused and resumed without losing the time already
 * spent. A null delay never fires. The latest callback is the one called.
 */
export function usePausableTimeout(callback: () => void, delay: number | null, paused: boolean) {
  const latest = useRef(callback);
  const remaining = useRef<number | null>(delay);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  // A new delay starts a new countdown.
  useEffect(() => {
    remaining.current = delay;
  }, [delay]);

  useEffect(() => {
    if (paused || remaining.current === null) return;

    const startedAt = Date.now();
    const timer = window.setTimeout(() => {
      remaining.current = null;
      latest.current();
    }, remaining.current);

    return () => {
      window.clearTimeout(timer);
      if (remaining.current !== null) {
        remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt));
      }
    };
  }, [delay, paused]);
}
