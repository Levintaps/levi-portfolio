import { useRef, useState } from 'react';
import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import ProjectCard from './ProjectCard';
import styles from './ProjectCarousel.module.css';

interface ProjectCarouselProps {
  projects: Project[];
  onOpen: (project: Project) => void;
}

export default function ProjectCarousel({ projects, onOpen }: ProjectCarouselProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  function show(index: number) {
    const next = (index + projects.length) % projects.length;
    setActive(next);

    const track = trackRef.current;
    const card = track?.children[next];
    if (!track || !(card instanceof HTMLElement)) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo?.({
      left: card.offsetLeft - track.offsetLeft,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }

  // A swipe or a trackpad scroll moves the track without going through show(),
  // so the dots have to follow the scroll position rather than lead it.
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    if (slides.length === 0) return;

    let nearest = 0;
    let shortest = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (distance < shortest) {
        shortest = distance;
        nearest = index;
      }
    });

    setActive((current) => (current === nearest ? current : nearest));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(active - 1);
    }
  }

  return (
    <div className={styles.carousel}>
      <div
        className={styles.track}
        role="group"
        aria-label="Selected projects"
        tabIndex={0}
        ref={trackRef}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
      >
        {projects.map((project) => (
          <div className={styles.slide} key={project.id}>
            <ProjectCard project={project} onOpen={onOpen} />
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.arrow}
          type="button"
          aria-label="Previous project"
          onClick={() => show(active - 1)}
        >
          <Icon name="arrow" size={18} />
        </button>

        <div className={styles.dots}>
          {projects.map((project, index) => (
            <button
              key={project.id}
              className={styles.dot}
              type="button"
              aria-label={`Go to ${project.name}`}
              aria-current={index === active ? true : undefined}
              onClick={() => show(index)}
            />
          ))}
        </div>

        <button
          className={styles.arrow}
          type="button"
          aria-label="Next project"
          onClick={() => show(active + 1)}
        >
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}
