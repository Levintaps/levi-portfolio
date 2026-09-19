import { useEffect, useState, type ReactNode } from 'react';
import type { Project } from '../../data/types';
import { useInView } from '../../hooks/useInView';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Icon } from '../common/icons';
import ProjectCard from './ProjectCard';
import styles from './ProjectCarousel.module.css';

interface ProjectCarouselProps {
  projects: Project[];
  onOpen: (project: Project) => void;
  /** Shown with the arrows: beside them on a phone, beneath them on wider screens. */
  action?: ReactNode;
}

const PIXELS_PER_SECOND = 26;

/** Where the track shows one card at a time; matches the stylesheet. */
const PHONE = '(max-width: 39.99rem)';
/** On a phone, how long a card rests before the next one slides in. */
const REST_MS = 4500;

/** The index of the slide whose start is nearest the scroll position. */
function nearest(starts: number[], scrollLeft: number): number {
  let best = 0;
  starts.forEach((start, index) => {
    if (Math.abs(start - scrollLeft) < Math.abs(starts[best] - scrollLeft)) best = index;
  });
  return best;
}

/**
 * A phone shows one card at a time, and a card drifting past is never shown
 * whole. So there the track rests on each card and then slides to the next,
 * and a visitor's own swipe restarts the rest.
 */
function stepThrough(track: HTMLDivElement, count: number): () => void {
  let timer = 0;

  const advance = () => {
    const slides = Array.from(track.children) as HTMLElement[];
    const origin = slides[0]?.offsetLeft ?? 0;
    const starts = slides.map((slide) => slide.offsetLeft - origin);
    let index = nearest(starts, track.scrollLeft);

    // Resting on a copy, it first moves onto the identical original, which
    // looks the same, so the slide onward never runs out of cards.
    if (index >= count) {
      index -= count;
      track.scrollTo?.({ left: starts[index], behavior: 'auto' });
    }

    const next = starts[index + 1];
    if (next !== undefined) track.scrollTo?.({ left: next, behavior: 'smooth' });
    rest();
  };

  const rest = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(advance, REST_MS);
  };

  track.addEventListener('scroll', rest, { passive: true });
  rest();

  return () => {
    window.clearTimeout(timer);
    track.removeEventListener('scroll', rest);
  };
}

export default function ProjectCarousel({ projects, onOpen, action }: ProjectCarouselProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  // Scrolled away, the track rests: nobody sees it move.
  const onScreen = useInView(track);
  const phone = useMediaQuery(PHONE);

  useEffect(() => {
    if (!track) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (paused || still.matches || !onScreen) return;

    if (phone) return stepThrough(track, projects.length);

    let frame = 0;
    let last = performance.now();
    // scrollLeft reports whole pixels, so a sub-pixel step would round away to
    // nothing every frame. The position is carried here instead.
    let position = track.scrollLeft;
    let applied = position;

    const step = (now: number) => {
      const elapsed = now - last;
      last = now;

      if (Math.abs(track.scrollLeft - applied) > 2) position = track.scrollLeft;

      // The slides are rendered twice, so rewinding by half the scrollable
      // width lands on the identical card and the loop never shows a seam.
      const half = track.scrollWidth / 2;
      position += (PIXELS_PER_SECOND * elapsed) / 1000;
      if (half > 0 && position >= half) position -= half;

      track.scrollLeft = position;
      applied = track.scrollLeft;

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [track, paused, onScreen, phone, projects.length]);

  function nudge(direction: 1 | -1) {
    if (!track) return;

    const slide = track.firstElementChild;
    const width = slide instanceof HTMLElement ? slide.offsetWidth : track.clientWidth;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.scrollBy?.({ left: width * direction, behavior: reduced ? 'auto' : 'smooth' });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nudge(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      nudge(-1);
    }
  }

  const loop = [...projects, ...projects];

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={styles.track}
        role="group"
        aria-label="Selected projects"
        tabIndex={0}
        ref={setTrack}
        data-paused={paused}
        onKeyDown={onKeyDown}
      >
        {loop.map((project, index) => {
          const duplicate = index >= projects.length;
          return (
            <div
              className={styles.slide}
              key={`${project.id}-${index}`}
              aria-hidden={duplicate || undefined}
            >
              <ProjectCard project={project} onOpen={onOpen} decorative={duplicate} />
            </div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <div className={styles.arrows}>
          <button
            className={styles.arrow}
            type="button"
            aria-label="Previous project"
            onClick={() => nudge(-1)}
          >
            <Icon name="arrow" size={18} />
          </button>
          <button
            className={styles.arrow}
            type="button"
            aria-label="Next project"
            onClick={() => nudge(1)}
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
        {action}
      </div>
    </div>
  );
}
