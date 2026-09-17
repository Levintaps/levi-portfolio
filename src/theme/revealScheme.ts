import { pickReveal, type Point, type RevealName } from './reveals';

/** The curve a reveal follows unless it names its own. */
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Reveals under way. A second press can start one before the first ends. */
let running = 0;

interface RevealOptions {
  /** The middle of the theme button, for the circle that grows out of it. */
  origin?: Point;
  /** The reveal played last, so this one is different. */
  previous?: RevealName;
}

/**
 * Runs a theme change through one of the reveals in reveals.ts, picked at
 * random and never the one played last. The browser photographs the page
 * before and after `update`, and the reveal moves or uncovers those two
 * photographs. `update` must have put the new theme on the page by the time
 * it returns.
 *
 * Returns the reveal it played. Where the browser has no view transitions, or
 * the visitor prefers less motion, the change simply happens at once and
 * nothing is returned.
 */
export function revealScheme(
  update: () => void,
  { origin, previous }: RevealOptions = {},
): RevealName | undefined {
  const prefersLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || prefersLessMotion) {
    update();
    return undefined;
  }

  const reveal = pickReveal({ previous, origin });

  // Held until every reveal has finished, this switches off the colour
  // transitions around the page, which would otherwise still be easing from
  // the old theme inside the reveal. Its value names the reveal, so base.css
  // can stack the two photographs the other way up for the crumple.
  const root = document.documentElement;
  running += 1;
  root.setAttribute('data-theme-reveal', reveal.name);
  const release = () => {
    running -= 1;
    if (running === 0) root.removeAttribute('data-theme-reveal');
  };

  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(update);
  } catch {
    // A browser that refuses to start one still gets its theme changed.
    release();
    update();
    return undefined;
  }
  transition.finished.then(release, release);
  transition.ready
    .then(() => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      for (const layer of reveal.layers(viewport, origin)) {
        root.animate(layer.keyframes, {
          duration: reveal.duration,
          easing: layer.easing ?? EASE,
          pseudoElement: layer.pseudoElement,
        });
      }
    })
    .catch(() => {
      // A transition cut short by another toggle skips its animation; the
      // theme itself has still changed.
    });

  return reveal.name;
}
