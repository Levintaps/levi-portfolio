import { confidentialNote } from '../../data/resume';
import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  if (project.confidential) {
    return (
      <article className={`${styles.card} ${styles.sealed}`}>
        <div className={styles.blur} data-blurred aria-hidden="true">
          <span className={styles.blurLine} />
          <span className={styles.blurLine} />
          <span className={styles.blurBlock} />
        </div>
        <div className={styles.body}>
          <p className={styles.kind}>{project.kind}</p>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.summary}>{confidentialNote}</p>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      {project.screenshot ? (
        <picture>
          <source srcSet={project.screenshot.avif} type="image/avif" />
          <source srcSet={project.screenshot.webp} type="image/webp" />
          <img
            className={styles.shot}
            src={project.screenshot.fallback}
            alt={project.screenshot.alt}
            width={project.screenshot.width}
            height={project.screenshot.height}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : null}

      <div className={styles.body}>
        <p className={styles.kind}>{project.kind}</p>
        <h3 className={styles.name}>{project.name}</h3>
        {project.client ? (
          <p className={styles.client} data-client>
            {project.clientUrl ? (
              <a href={project.clientUrl} target="_blank" rel="noreferrer noopener">
                {project.client}
              </a>
            ) : (
              project.client
            )}
          </p>
        ) : null}
        <p className={styles.summary}>{project.summary}</p>

        <button className={styles.more} type="button" onClick={() => onOpen(project)}>
          View more
          <span className={styles.srOnly}>{` about ${project.name}`}</span>
          <Icon name="arrow" size={16} />
        </button>
      </div>
    </article>
  );
}
