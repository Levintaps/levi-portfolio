import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './SkillMarquee.module.css';

interface SkillMarqueeProps {
  label: string;
  items: string[];
  /** Which way the badges travel: left means right to left. */
  direction: 'left' | 'right';
  variant?: 'core' | 'plain';
  /** Pixels per second, so a long row and a short one move at a like pace. */
  speed?: number;
}

const MIN_SECONDS = 12;
const FALLBACK_SECONDS = 45;
// A row never needs more than a few runs of its badges to fill the widest
// screen. The ceiling guarantees a bad measurement can never multiply them.
const MAX_COPIES = 6;

/** How long one full pass of a row should take, as a CSS time. */
export function marqueeDuration(width: number, pixelsPerSecond: number): string {
  if (!Number.isFinite(width) || width <= 0) return `${FALLBACK_SECONDS}s`;
  return `${Math.max(MIN_SECONDS, Math.round(width / pixelsPerSecond))}s`;
}

function prefersStillness(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * One row of skill badges sliding endlessly in one direction. The badges are
 * laid down twice, back to back, and the pair slides by exactly one copy's
 * width before starting over, so the seam is never seen.
 */
export default function SkillMarquee({
  label,
  items,
  direction,
  variant = 'plain',
  speed = 30,
}: SkillMarqueeProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLUListElement | null>(null);
  const [copies, setCopies] = useState(1);
  const [duration, setDuration] = useState(() => marqueeDuration(0, speed));

  useEffect(() => {
    const row = rowRef.current;
    const group = groupRef.current;
    if (!row || !group || typeof ResizeObserver === 'undefined' || prefersStillness()) return;

    const measure = () => {
      const rendered = Number(group.dataset.copies) || 1;
      const copyWidth = group.offsetWidth / rendered;

      // A short row, like the core stack, would leave empty space before its
      // second copy arrives. It is repeated inside each half until one half
      // is at least as wide as the row itself, which keeps the spacing between
      // badges the same as every other row.
      if (copyWidth > 0) {
        setCopies(Math.min(MAX_COPIES, Math.max(1, Math.ceil(row.clientWidth / copyWidth))));
      }
      setDuration(marqueeDuration(group.offsetWidth, speed));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(group);
    return () => observer.disconnect();
  }, [speed]);

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
    <div
      ref={rowRef}
      className={styles.marquee}
      data-direction={direction}
      data-variant={variant}
      style={{ '--duration': duration } as CSSProperties}
    >
      <ul ref={groupRef} className={styles.group} aria-label={label} data-copies={copies}>
        {badges('lead')}
      </ul>
      <ul className={styles.group} aria-hidden="true">
        {badges('repeat')}
      </ul>
    </div>
  );
}
