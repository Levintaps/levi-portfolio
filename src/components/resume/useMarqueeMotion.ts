import { useEffect } from 'react';
import type { RefObject } from 'react';
import { MarqueeMotion, type PointerKind } from '../../lib/marqueeMotion';

interface MarqueeMotionOptions {
  direction: 'left' | 'right';
  speed: number;
}

/**
 * Drives a marquee row: the drift, dragging by mouse or finger, the fling on
 * release, and the pause under a hovering mouse or a resting finger. The
 * physics live in MarqueeMotion; this hook only connects it to pointer events
 * and to the screen's frames.
 */
export function useMarqueeMotion(
  rowRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  groupRef: RefObject<HTMLElement | null>,
  { direction, speed }: MarqueeMotionOptions,
) {
  useEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    const group = groupRef.current;
    if (!row || !track || !group) return;
    if (typeof ResizeObserver === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
    // Reduced motion gets a still, wrapped layout from the stylesheet instead.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const motion = new MarqueeMotion({ speed, direction });

    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      motion.setSpan(group.offsetWidth + gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);

    let active: number | null = null;

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') motion.hover(true);
    };

    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') motion.hover(false);
    };

    const onDown = (event: PointerEvent) => {
      if (active !== null) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      active = event.pointerId;
      // Keeps the drag alive when the pointer strays off the row mid-swipe.
      // Capture can be refused, and the drag should still work without it.
      try {
        row.setPointerCapture?.(event.pointerId);
      } catch {
        // Moves outside the row simply stop counting until the pointer returns.
      }
      // A mouse press would otherwise start a text selection. Touch is left
      // alone so the browser can still scroll the page vertically.
      if (event.pointerType === 'mouse') event.preventDefault();

      motion.press(event.clientX, performance.now(), event.pointerType as PointerKind);
      row.dataset.dragging = 'true';
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== active) return;
      motion.drag(event.clientX, performance.now());
    };

    const finish = (event: PointerEvent, cancelled: boolean) => {
      if (event.pointerId !== active) return;
      active = null;

      if (cancelled) motion.cancel();
      else motion.release(performance.now());

      delete row.dataset.dragging;
      try {
        if (row.hasPointerCapture?.(event.pointerId)) row.releasePointerCapture(event.pointerId);
      } catch {
        // Already released by the browser.
      }
    };

    const onUp = (event: PointerEvent) => finish(event, false);
    const onCancel = (event: PointerEvent) => finish(event, true);

    row.addEventListener('pointerenter', onEnter);
    row.addEventListener('pointerleave', onLeave);
    row.addEventListener('pointerdown', onDown);
    row.addEventListener('pointermove', onMove);
    row.addEventListener('pointerup', onUp);
    row.addEventListener('pointercancel', onCancel);
    row.addEventListener('lostpointercapture', onUp);

    // The row rests while scrolled out of view and picks up where it left off.
    // MarqueeMotion caps the time one step can cover, so the first frame back
    // never leaps ahead by the whole time away.
    let visible = true;
    let frame = 0;
    const tick = (time: number) => {
      if (!visible) {
        frame = 0;
        return;
      }
      track.style.transform = `translate3d(${motion.step(time)}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const sighting =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) visible = entry.isIntersecting;
              if (visible && frame === 0) frame = requestAnimationFrame(tick);
            },
            { rootMargin: '200px' },
          );
    sighting?.observe(row);

    return () => {
      cancelAnimationFrame(frame);
      sighting?.disconnect();
      observer.disconnect();
      row.removeEventListener('pointerenter', onEnter);
      row.removeEventListener('pointerleave', onLeave);
      row.removeEventListener('pointerdown', onDown);
      row.removeEventListener('pointermove', onMove);
      row.removeEventListener('pointerup', onUp);
      row.removeEventListener('pointercancel', onCancel);
      row.removeEventListener('lostpointercapture', onUp);
      delete row.dataset.dragging;
      track.style.transform = '';
    };
  }, [rowRef, trackRef, groupRef, direction, speed]);
}
