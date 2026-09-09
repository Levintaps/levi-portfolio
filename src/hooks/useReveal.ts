import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  /**
   * Passed straight through to IntersectionObserver. Defaults to a small
   * negative bottom margin, which suits a scroll-reveal animation (the
   * element must be substantially in view before it "reveals"). Pass a
   * generous positive margin instead when the goal is to trigger something
   * — like a data fetch — before the section is actually visible.
   */
  rootMargin?: string;
}

export function useReveal<T extends HTMLElement>({
  rootMargin = '0px 0px -12% 0px',
}: UseRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, revealed };
}
