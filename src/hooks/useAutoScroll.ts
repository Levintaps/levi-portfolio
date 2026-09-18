import { useCallback, useEffect, useRef, useState } from 'react';
import { useDocumentHidden } from './useDocumentHidden';

interface AutoScrollOptions {
  /** How far the page travels each second, in pixels. */
  speed?: number;
  /** How long the page rests at the top before it starts to move. */
  startAfter?: number;
  /** How long the reader must be still before the page moves again. */
  resumeAfter?: number;
}

export interface AutoScroll {
  /** False for a visitor who prefers less motion: the page never moves itself. */
  available: boolean;
  running: boolean;
  /** Stopped by the reader, and stays stopped until they start it again. */
  paused: boolean;
  atEnd: boolean;
  toggle: () => void;
}

// Keys that move the page, which hand control to the reader just as a wheel
// or a touch does.
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/**
 * Scrolls the whole page slowly down, like a story reading itself out. The
 * reader stays in charge: their own scrolling takes over at once and goes as
 * fast as they like, and the page carries on from wherever they stop once they
 * have been still for a moment. It rests while the tab is hidden and stops at
 * the end of the page.
 */
export function useAutoScroll({
  speed = 32,
  startAfter = 1500,
  resumeAfter = 2500,
}: AutoScrollOptions = {}): AutoScroll {
  const [available] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [paused, setPaused] = useState(false);
  // Held back at first, so the top of the page is read before it moves.
  const [yielding, setYielding] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const hidden = useDocumentHidden();
  const timer = useRef<number | undefined>(undefined);

  const running = available && !paused && !yielding && !atEnd && !hidden;

  const handBackAfter = useCallback((delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setYielding(false), delay);
  }, []);

  const takeOver = useCallback(() => {
    setYielding(true);
    // Scrolling back up from the end gives the page somewhere to go again.
    setAtEnd(false);
    handBackAfter(resumeAfter);
  }, [handBackAfter, resumeAfter]);

  useEffect(() => {
    if (!available) return undefined;
    handBackAfter(startAfter);
    return () => window.clearTimeout(timer.current);
  }, [available, handBackAfter, startAfter]);

  useEffect(() => {
    if (!available) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) takeOver();
    };
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchstart', takeOver, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchstart', takeOver);
      window.removeEventListener('keydown', onKey);
    };
  }, [available, takeOver]);

  useEffect(() => {
    if (!running) return undefined;

    let frame = 0;
    let last = performance.now();
    // Carried here rather than read back from the window, which may round a
    // sub-pixel step away to nothing on every frame.
    let position = window.scrollY;
    let applied = position;

    const step = (now: number) => {
      // A move the loop did not make: a drag on the scrollbar, a link, find in
      // page. The reader has taken over.
      if (Math.abs(window.scrollY - applied) > 2) {
        takeOver();
        return;
      }

      // A long pause between frames, a busy tab for instance, is not allowed
      // to turn into a jump.
      const elapsed = Math.min(now - last, 100);
      last = now;

      const end = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      position = Math.min(position + (speed * elapsed) / 1000, end);
      window.scrollTo(0, position);
      applied = window.scrollY;

      if (position >= end) {
        setAtEnd(true);
        return;
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running, speed, takeOver]);

  const toggle = useCallback(() => setPaused((value) => !value), []);

  return { available, running, paused, atEnd, toggle };
}
