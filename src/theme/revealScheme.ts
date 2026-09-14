/** How long the new theme takes to spread from the corner across the screen. */
export const REVEAL_MS = 700;

/** Reveals under way. A second press can start one before the first ends. */
let running = 0;

/**
 * Runs a theme change so the new colours grow out from the top left corner
 * of the screen until they cover it. The browser photographs the page before
 * and after `update`, and the circle uncovers the second photograph over the
 * first. `update` must have put the new theme on the page by the time it
 * returns.
 *
 * Where the browser has no view transitions, or the visitor prefers less
 * motion, the change simply happens at once.
 */
export function revealScheme(update: () => void): void {
  const prefersLessMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || prefersLessMotion) {
    update();
    return;
  }

  // Held until every reveal has finished, this switches off the colour
  // transitions around the page, which would otherwise still be easing from
  // the old theme inside the circle. See base.css.
  const root = document.documentElement;
  running += 1;
  root.setAttribute('data-theme-reveal', '');
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
    return;
  }
  transition.finished.then(release, release);
  transition.ready
    .then(() => {
      // Far enough to reach the opposite corner, whatever the screen's shape.
      const radius = Math.hypot(window.innerWidth, window.innerHeight);
      document.documentElement.animate(
        { clipPath: ['circle(0px at 0px 0px)', `circle(${radius}px at 0px 0px)`] },
        {
          duration: REVEAL_MS,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      // A transition cut short by another toggle skips its animation; the
      // theme itself has still changed.
    });
}
