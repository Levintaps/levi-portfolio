import { useLayoutEffect, useState } from 'react';

/**
 * An element's width in pixels, or null while it has none to report. Read
 * before the first paint, then kept up to date as the element resizes. A
 * change of height alone leaves the value, and so the component, untouched.
 */
export function useElementWidth(element: HTMLElement | null): number | null {
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!element) return undefined;
    const read = () => setWidth(element.clientWidth > 0 ? element.clientWidth : null);
    read();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return width;
}
