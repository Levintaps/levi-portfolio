import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project }: { project: Project }) {
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
        <div className={styles.top}>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.period}>{project.period}</p>
        </div>

        <p className={styles.kind}>{project.kind}</p>
        <p className={styles.summary}>{project.summary}</p>

        <ul className={styles.stack} aria-label="Technology stack">
          {project.stack.map((item) => (
            <li key={item} className={styles.chip}>
              {item}
            </li>
          ))}
        </ul>

        <ul className={styles.highlights} aria-label="Highlights">
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        {project.demoUrl || project.repoUrl ? (
          <div className={styles.links}>
            {project.demoUrl ? (
              <a
                className={styles.link}
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Visit demo
                <span className={styles.srOnly}>{` for ${project.name}`}</span>
                <Icon name="external" size={16} />
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                className={styles.link}
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Source code
                <span className={styles.srOnly}>{` for ${project.name}`}</span>
                <Icon name="github" size={16} />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
