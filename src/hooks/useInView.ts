import { useEffect, useState } from 'react';

/**
 * Whether an element is on screen, or near enough to it, so work nobody can
 * see, such as an animation loop, can rest. Counts the element as in view
 * until told otherwise, and wherever the browser cannot tell.
 */
export function useInView(element: Element | null, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === element) setInView(entry.isIntersecting);
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin]);

  return inView;
}
