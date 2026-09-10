import { Suspense, lazy, useEffect, useState } from 'react';
import { profile } from '../../data/resume';
import styles from './HeroPortrait.module.css';

const Lanyard = lazy(() => import('../lanyard/Lanyard'));

function StaticPortrait() {
  return (
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
  );
}

// The lanyard costs a three.js and physics bundle, so it only loads for a
// visitor whose device can enjoy it, and never before the page is usable.
function canRunLanyard() {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia('(min-width: 48rem)').matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  // Several megabytes of model and physics is not a fair thing to spend on a
  // metered or slow connection.
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g|slow/.test(connection.effectiveType)) return false;

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

    const start = () => setInteractive(true);
    const idle = window.requestIdleCallback;
    if (typeof idle === 'function') {
      const handle = idle(start, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(start, 600);
    return () => window.clearTimeout(timer);
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
    <div className={styles.stage}>
      <Suspense fallback={<StaticPortrait />}>
        <Lanyard
          position={[0, -2.3, 9]}
          gravity={[0, -40, 0]}
          fov={22}
          frontImage="/images/id-card.jpg"
          imageFit="cover"
        />
      </Suspense>
    </div>
  );
}
