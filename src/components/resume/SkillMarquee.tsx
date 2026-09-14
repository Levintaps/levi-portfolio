import { useEffect, useRef, useState } from 'react';
import { useMarqueeMotion } from './useMarqueeMotion';
import styles from './SkillMarquee.module.css';

interface SkillMarqueeProps {
  label: string;
  items: string[];
  /** Which way the badges drift: left means right to left. */
  direction: 'left' | 'right';
  /** Drift speed in pixels per second. */
  speed?: number;
}

// A row never needs more than a few runs of its badges to fill the widest
// screen. The ceiling guarantees a bad measurement can never multiply them.
const MAX_COPIES = 6;

function prefersStillness(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * One row of skill badges drifting endlessly, which can also be dragged or
 * flung. The badges are laid down twice, back to back, on one track; the
 * track is only ever positioned within one copy's width, so the seam is never
 * seen whichever way the row moves.
 */
export default function SkillMarquee({ label, items, direction, speed = 30 }: SkillMarqueeProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLUListElement | null>(null);
  const [copies, setCopies] = useState(1);

  useMarqueeMotion(rowRef, trackRef, groupRef, { direction, speed });

  useEffect(() => {
    const row = rowRef.current;
    const group = groupRef.current;
    if (!row || !group || typeof ResizeObserver === 'undefined' || prefersStillness()) return;

    // A short row, like the core stack, would show empty space before its
    // second copy arrived. It repeats inside each half until one half is at
    // least as wide as the row, which keeps the spacing between badges the
    // same as every other row.
    const measure = () => {
      const rendered = Number(group.dataset.copies) || 1;
      const copyWidth = group.offsetWidth / rendered;
      if (copyWidth > 0) {
        setCopies(Math.min(MAX_COPIES, Math.max(1, Math.ceil(row.clientWidth / copyWidth))));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  const badges = (half: 'lead' | 'repeat') =>
    Array.from({ length: copies }, (_, copy) =>
      items.map((item) => (
        <li
          key={`${copy}-${item}`}
          className={styles.badge}
          // Only the first run of the first half is read aloud; every other
          // badge is the same words again.
          aria-hidden={half === 'lead' && copy === 0 ? undefined : true}
        >
          {item}
        </li>
      )),
    );

  return (
    <div ref={rowRef} className={styles.marquee} data-direction={direction}>
      <div ref={trackRef} className={styles.track}>
        <ul ref={groupRef} className={styles.group} aria-label={label} data-copies={copies}>
          {badges('lead')}
        </ul>
        <ul className={styles.group} aria-hidden="true">
          {badges('repeat')}
        </ul>
      </div>
    </div>
  );
}
