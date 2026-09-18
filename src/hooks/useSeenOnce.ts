import { useEffect, useState } from 'react';

/**
 * Whether an element has come into view yet, and stays true once it has, for
 * content that reveals itself once rather than every time it passes. Wherever
 * the browser cannot tell, the element counts as seen, so nothing stays hidden.
 */
export function useSeenOnce(element: Element | null, rootMargin = '0px 0px -12% 0px'): boolean {
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (seen || !element || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.target === element && entry.isIntersecting)) setSeen(true);
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin, seen]);

  return seen;
}
