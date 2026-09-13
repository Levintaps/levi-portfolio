import { useId, useState } from 'react';
import { confidentialNote, projects } from '../../data/resume';
import { demoNoteFor, repoNoteFor } from '../common/projectNotes';
import { useReveal } from '../../hooks/useReveal';
import type { Project } from '../../data/types';
import styles from './CyberProjects.module.css';

function SealedCard({ project }: { project: Project }) {
  return (
    <article className={`${styles.card} ${styles.sealed}`}>
      <div className={styles.blur} aria-hidden="true">
        <span className={styles.blurLine} />
        <span className={styles.blurLine} />
      </div>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.kind}>{project.kind}</p>
      <p className={styles.summary}>{confidentialNote}</p>
    </article>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <article className={styles.card} data-open={open}>
      <p className={styles.meta}>
        <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
        {project.period}
      </p>
      <h3 className={styles.name}>{project.name}</h3>
      <p className={styles.kind}>{project.kind}</p>

      {project.client || project.clientEmail ? (
        <p className={styles.client}>
          {project.client ? <span>{project.client}</span> : null}
          {project.client && project.clientEmail ? (
            <span className={styles.divider} aria-hidden="true">
              /
            </span>
          ) : null}
          {project.clientEmail ? (
            <a href={`mailto:${project.clientEmail}`}>{project.clientEmail}</a>
          ) : null}
        </p>
      ) : null}

      <p className={styles.summary}>{project.summary}</p>

      <button
        className={styles.toggle}
        type="button"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Read less' : 'Read more'}
        <span className={styles.srOnly}>{` about ${project.name}`}</span>
      </button>

      {/* Rendered only while open: a card that keeps its details in the
          document and hides them with CSS would still hand every stack and
          every link to anything reading the page. */}
      {open ? (
        <div className={styles.details} id={detailsId}>
          <ul className={styles.stack}>
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <ul className={styles.highlights}>
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          <div className={styles.links}>
            {project.demoUrl ? (
              <a
                className={styles.link}
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open demo
              </a>
            ) : (
              <span className={styles.private}>{demoNoteFor(project)}</span>
            )}

            {project.repoUrl ? (
              <a
                className={styles.link}
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open code
              </a>
            ) : (
              <span className={styles.private}>{repoNoteFor(project)}</span>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function CyberProjects() {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section className={styles.section} id="cyber-projects" ref={ref} data-revealed={revealed}>
      <header className={styles.header}>
        <span className={styles.tag}>02 / Projects</span>
        <h2 className={styles.title}>Deployed systems</h2>
      </header>

      <div className={styles.grid}>
        {projects.map((project, index) =>
          project.confidential ? (
            <SealedCard key={project.id} project={project} />
          ) : (
            <ProjectCard key={project.id} project={project} index={index} />
          ),
        )}
      </div>
    </section>
  );
}
