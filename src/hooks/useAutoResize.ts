import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';

function fit(field: HTMLTextAreaElement, maxHeight: number) {
  // Collapsed first, so scrollHeight reports what the text needs rather than
  // the height the field already has. The borders are added back because the
  // field sizes its border box.
  field.style.height = 'auto';
  const borders = field.offsetHeight - field.clientHeight;
  const needed = field.scrollHeight + borders;
  field.style.height = `${Math.min(needed, maxHeight)}px`;
  field.style.overflowY = needed > maxHeight ? 'auto' : 'hidden';
}

/**
 * Grows a textarea with its text, before the browser paints, up to a height
 * it then scrolls within. It refits when the text changes and when the field
 * gets narrower or wider, since that rewraps every line.
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight: number,
) {
  useLayoutEffect(() => {
    if (ref.current) fit(ref.current, maxHeight);
  }, [ref, value, maxHeight]);

  useLayoutEffect(() => {
    const field = ref.current;
    if (!field || typeof ResizeObserver === 'undefined') return undefined;

    // Setting the height also resizes the field, so only a change of width
    // leads to a refit; otherwise every fit would trigger the next.
    let width = field.clientWidth;
    const observer = new ResizeObserver(() => {
      if (field.clientWidth === width) return;
      width = field.clientWidth;
      fit(field, maxHeight);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [ref, maxHeight]);
}
