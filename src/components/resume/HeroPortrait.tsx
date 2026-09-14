import { Suspense, lazy, useEffect, useState } from 'react';
import { profile } from '../../data/resume';
import { useScheme } from '../../theme/ThemeProvider';
import { bandColorFor } from '../lanyard/bandColor';
import styles from './HeroPortrait.module.css';

const Lanyard = lazy(() => import('../lanyard/Lanyard'));

function StaticPortrait() {
  return (
    <div className={styles.still}>
      <picture>
      <source srcSet={profile.portrait.avif} type="image/avif" />
      <source srcSet={profile.portrait.webp} type="image/webp" />
      <img
        className={styles.portrait}
        src={profile.portrait.fallback}
        alt={profile.portrait.alt}
        width={profile.portrait.width}
        height={profile.portrait.height}
        fetchPriority="high"
      />
      </picture>
    </div>
  );
}

// Only mounted once the badge is allowed to run, so the theme is read inside
// the page's provider and never by the still photo.
function ThemedLanyard() {
  const { scheme } = useScheme();

  return (
    <Lanyard
      position={[0, -0.3, 15.9]}
      gravity={[0, -40, 0]}
      fov={22}
      frontImage="/images/id-card.jpg"
      imageFit="cover"
      maxDpr={1.5}
      bandColor={bandColorFor(scheme)}
      lanyardWidth={0.55}
    />
  );
}

// The lanyard costs a three.js and physics bundle, so it only loads for a
// visitor whose device can enjoy it, and never before the page is usable.
function canRunLanyard() {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia('(min-width: 48rem)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  // Several megabytes of model and physics is not a fair thing to spend on a
  // metered connection. Only the explicit data-saver signal is trusted here;
  // the browser's own speed estimate reports slow-2g on a local network.
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HeroPortrait() {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (!canRunLanyard()) return;

    // Idle time is the polite moment to start, but some browsers withhold it
    // from a background tab indefinitely, so a plain timer backs it up.
    const start = () => setInteractive(true);
    const timer = window.setTimeout(start, 1500);
    const handle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(start, { timeout: 1500 })
        : null;

    return () => {
      window.clearTimeout(timer);
      if (handle !== null) window.cancelIdleCallback?.(handle);
    };
  }, []);

  // The canvas is inserted after first paint, and the renderer only measures
  // itself on a resize, so it needs one nudge once it is in the document.
  useEffect(() => {
    if (!interactive) return;

    const nudge = () => window.dispatchEvent(new Event('resize'));
    const frame = requestAnimationFrame(nudge);
    const timer = window.setTimeout(nudge, 400);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [interactive]);

  if (!interactive) return <StaticPortrait />;

  return (
    <>
      {/* Holds the column's height while the card floats above the whole
          hero, so a thrown badge is never clipped by a box. */}
      <div className={styles.spacer} aria-hidden="true" />
      <div className={styles.overlay}>
        <Suspense fallback={null}>
          <ThemedLanyard />
        </Suspense>
      </div>
    </>
  );
}
