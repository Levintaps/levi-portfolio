import { useEffect, useMemo, useRef } from 'react';
import { findSpawn, launch, step, type Body, type Bounds } from '../lib/bubblePhysics';

export interface BubblePhysics {
  /** For the element the bubbles float in. Its size is the tank's size. */
  tankRef: (element: HTMLElement | null) => (() => void) | undefined;
  /** For one bubble's element, which the loop then moves. */
  attach: (key: number, diameter: number) => (element: HTMLElement | null) => (() => void) | undefined;
  /** A bubble being read stops where it is, and the others bounce off it. */
  hold: (key: number, held: boolean) => void;
  /** A popping bubble stops colliding, leaving room for the next one. */
  fade: (key: number) => void;
}

interface Tracked extends Body {
  key: number;
  element: HTMLElement;
  placed: boolean;
}

function moveTo(body: Tracked) {
  const left = (body.x - body.radius).toFixed(2);
  const top = (body.y - body.radius).toFixed(2);
  body.element.style.transform = `translate3d(${left}px, ${top}px, 0)`;
}

function measure(element: HTMLElement): Bounds {
  return { width: element.clientWidth, height: element.clientHeight };
}

function hasRoom(bounds: Bounds) {
  return bounds.width > 0 && bounds.height > 0;
}

/** Finds a newcomer a clear spot among the bubbles already placed. */
function settle(body: Tracked, all: Tracked[], room: Bounds) {
  const placed = all.filter((other) => other.placed && other !== body);
  Object.assign(body, findSpawn(placed, body.radius, room, Math.random));
  body.placed = true;
}

/**
 * Runs the bubbles' movement on one animation frame loop. Positions live in
 * refs and go straight onto each element's transform, so the motion never
 * re-renders a React component. The loop stops altogether while paused.
 */
export function useBubblePhysics(paused: boolean): BubblePhysics {
  const bodies = useRef<Tracked[]>([]);
  const bounds = useRef<Bounds>({ width: 0, height: 0 });

  const physics = useMemo<BubblePhysics>(() => {
    const find = (key: number) => bodies.current.find((body) => body.key === key);

    return {
      tankRef(element) {
        if (!element) return undefined;
        bounds.current = measure(element);
        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(() => {
          bounds.current = measure(element);
        });
        observer.observe(element);
        return () => observer.disconnect();
      },

      attach(key, diameter) {
        return (element) => {
          if (!element) return undefined;
          const body: Tracked = {
            key,
            element,
            radius: diameter / 2,
            x: 0,
            y: 0,
            ...launch(Math.random),
            held: false,
            ghost: false,
            placed: false,
          };
          bodies.current.push(body);

          // A bubble's element is attached before the tank's, so the tank is
          // measured through its parent. Placing it now, before the browser
          // paints, keeps it from showing for a frame in the corner.
          const room = element.parentElement ? measure(element.parentElement) : bounds.current;
          if (hasRoom(room)) {
            settle(body, bodies.current, room);
            moveTo(body);
          }

          return () => {
            bodies.current = bodies.current.filter((entry) => entry !== body);
          };
        };
      },

      hold(key, held) {
        const body = find(key);
        if (body) body.held = held;
      },

      fade(key) {
        const body = find(key);
        if (body) body.ghost = true;
      },
    };
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    let frame = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      const room = bounds.current;
      if (hasRoom(room)) {
        for (const body of bodies.current) {
          if (!body.placed) settle(body, bodies.current, room);
        }
        // The first frame after starting only sets the clock, so a resume
        // never counts the time spent paused.
        if (last !== null) step(bodies.current, now - last, room);
        for (const body of bodies.current) moveTo(body);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  return physics;
}
