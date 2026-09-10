import { useEffect, useRef } from 'react';
import type { Project } from '../../data/types';
import { Icon } from '../common/icons';
import ProjectCard from './ProjectCard';
import styles from './AllProjectsModal.module.css';

interface AllProjectsModalProps {
  projects: Project[];
  onOpen: (project: Project) => void;
  onClose: () => void;
}

export default function AllProjectsModal({ projects, onOpen, onClose }: AllProjectsModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="All projects"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>All projects</h2>
          <button className={styles.close} type="button" onClick={onClose}>
            <span className={styles.srOnly}>Close</span>
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className={styles.grid}>
          {projects.map((project, index) => (
            <div
              className={styles.item}
              key={project.id}
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <ProjectCard project={project} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
