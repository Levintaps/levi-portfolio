import { confidentialNote } from '../../data/resume';
import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  // A duplicated slide exists only to keep the loop seamless, so its control
  // stays out of the tab order.
  decorative?: boolean;
}

export default function ProjectCard({ project, onOpen, decorative = false }: ProjectCardProps) {
  if (project.confidential) {
    return (
      <article className={`${styles.card} ${styles.sealed}`}>
        <div className={styles.blur} data-blurred aria-hidden="true">
          <span className={styles.blurLine} />
          <span className={styles.blurLine} />
          <span className={styles.blurBlock} />
        </div>
        <div className={styles.body}>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.kind}>{project.kind}</p>
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
        <h3 className={styles.name}>{project.name}</h3>
        <p className={styles.kind}>{project.kind}</p>

        {project.client || project.clientEmail ? (
          <p className={styles.client} data-client>
            {project.client ? (
              project.clientUrl ? (
                <a href={project.clientUrl} target="_blank" rel="noreferrer noopener">
                  {project.client}
                </a>
              ) : (
                <span>{project.client}</span>
              )
            ) : null}
            {project.client && project.clientEmail ? (
              <span className={styles.divider} aria-hidden="true">
                |
              </span>
            ) : null}
            {project.clientEmail ? (
              <a href={`mailto:${project.clientEmail}`}>{project.clientEmail}</a>
            ) : null}
          </p>
        ) : null}

        <p className={styles.summary}>{project.summary}</p>

        <button
          className={styles.more}
          type="button"
          onClick={() => onOpen(project)}
          tabIndex={decorative ? -1 : undefined}
        >
          See full details
          <span className={styles.srOnly}>{` about ${project.name}`}</span>
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </article>
  );
}
