import { useId, useState } from 'react';
import { useDialog } from '../../hooks/useDialog';
import { confidentialNote } from '../../data/resume';
import { demoNoteFor, repoNoteFor } from '../common/projectNotes';
import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import styles from './ProjectPanel.module.css';

interface ProjectPanelProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectPanel({ project, onClose }: ProjectPanelProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const [shownNote, setShownNote] = useState<'demo' | 'repo' | null>(null);
  const downloadDetailId = useId();

  const note =
    shownNote === 'demo'
      ? demoNoteFor(project)
      : shownNote === 'repo'
        ? repoNoteFor(project)
        : null;

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.close} type="button" onClick={onClose}>
          <span className={styles.srOnly}>Close</span>
          <Icon name="close" size={20} />
        </button>

        <p className={styles.kind}>{project.kind}</p>
        <h2 className={styles.name}>{project.name}</h2>

        {project.confidential ? (
          <p className={styles.summary}>{confidentialNote}</p>
        ) : (
          <>
            <p className={styles.meta}>
              {project.period}
              {project.client ? <span className={styles.client}>{project.client}</span> : null}
              {project.clientEmail ? (
                <a className={styles.client} href={`mailto:${project.clientEmail}`}>
                  {project.clientEmail}
                </a>
              ) : null}
            </p>

            <p className={styles.summary}>{project.summary}</p>

            <ul className={styles.highlights} aria-label="Highlights">
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>

            <ul className={styles.stack} aria-label="Technology stack">
              {project.stack.map((item) => (
                <li key={item} className={styles.chip}>
                  {item}
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              {project.download ? (
                <a
                  className={styles.action}
                  href={project.download.url}
                  aria-describedby={downloadDetailId}
                >
                  {project.download.label}
                  <Icon name="download" size={16} />
                </a>
              ) : project.demoUrl ? (
                <a
                  className={styles.action}
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Visit demo
                  <Icon name="external" size={16} />
                </a>
              ) : (
                <button
                  className={styles.action}
                  type="button"
                  onClick={() => setShownNote('demo')}
                >
                  Visit demo
                  <Icon name="external" size={16} />
                </button>
              )}

              {project.repoUrl ? (
                <a
                  className={styles.action}
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source code
                  <Icon name="github" size={16} />
                </a>
              ) : (
                <button
                  className={styles.action}
                  type="button"
                  onClick={() => setShownNote('repo')}
                >
                  Source code
                  <Icon name="github" size={16} />
                </button>
              )}
            </div>

            {project.download ? (
              <p className={styles.detail} id={downloadDetailId}>
                {project.download.detail}
              </p>
            ) : null}

            {note ? (
              <p className={styles.note} role="status">
                {note}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
