import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react';
import { profile } from '../../data/resume';
import { useDocumentHidden } from '../../hooks/useDocumentHidden';
import { useInView } from '../../hooks/useInView';
import { useScheme } from '../../theme/ThemeProvider';
import { bandColorFor } from '../lanyard/bandColor';
import { lanyardFrame, type LanyardFrame } from '../lanyard/lanyardFrame';
import styles from './HeroPortrait.module.css';

const Lanyard = lazy(() => import('../lanyard/Lanyard'));

function StaticPortrait() {
  return (
    // Marked so the hero knows it holds the photo, which it may shrink beside
    // the address on a phone, and not the badge, which needs its own column.
    <div className={styles.still} data-portrait="still">
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
function ThemedLanyard({ active, anchorX }: { active: boolean; anchorX: number | null }) {
  const { scheme } = useScheme();

  return (
    <Lanyard
      position={[0, -0.3, 15.9]}
      gravity={[0, -40, 0]}
      fov={22}
      frontImage="/images/id-card.jpg"
      imageFit="cover"
      maxDpr={1.25}
      bandColor={bandColorFor(scheme)}
      lanyardWidth={0.55}
      active={active}
      anchorX={anchorX}
    />
  );
}

// A tablet or anything larger. Width alone would count a phone held sideways,
// so the screen must also be taller than any phone is on its side.
const ROOM_FOR_BADGE = '(min-width: 37.5rem) and (min-height: 30rem)';

// The lanyard costs a three.js and physics bundle, so it only loads for a
// visitor whose device can enjoy it, and never before the page is usable.
function canRunLanyard() {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia(ROOM_FOR_BADGE).matches) return false;
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
  // The badge's renderer and physics rest whenever nobody can see it swing:
  // the hero is scrolled away, or the tab is in the background.
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const onScreen = useInView(overlay);
  const hidden = useDocumentHidden();
  const [frame, setFrame] = useState<LanyardFrame | null>(null);

  // The canvas is sized to the page and the badge placed over the column,
  // measured before paint and again whenever the page or the column resizes.
  // The page itself is watched as well as the window: a scrollbar appearing
  // as the page grows narrows it and slides the column over, and neither the
  // window nor the column changes size when that happens.
  useLayoutEffect(() => {
    const column = overlay?.parentElement;
    if (!column) return undefined;

    const measure = () => {
      const box = column.getBoundingClientRect();
      const next = lanyardFrame({ left: box.left, width: box.width }, document.documentElement.clientWidth);
      setFrame((current) =>
        current &&
        current.start === next.start &&
        current.width === next.width &&
        current.anchorX === next.anchorX
          ? current
          : next,
      );
    };

    measure();
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(column);
    observer?.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [overlay]);

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
      <div
        ref={setOverlay}
        className={styles.overlay}
        style={
          frame
            ? { insetInlineStart: frame.start, insetInlineEnd: 'auto', inlineSize: frame.width }
            : undefined
        }
      >
        <Suspense fallback={null}>
          <ThemedLanyard active={onScreen && !hidden} anchorX={frame?.anchorX ?? null} />
        </Suspense>
      </div>
    </>
  );
}
