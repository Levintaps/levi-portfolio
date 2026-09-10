import { useRef, useState } from 'react';
import { projects, projectsLead } from '../../data/resume';
import type { Project } from '../../data/types';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import ProjectCard from './ProjectCard';
import ProjectCarousel from './ProjectCarousel';
import ProjectPanel from './ProjectPanel';
import styles from './Projects.module.css';

export const CAROUSEL_SIZE = 5;

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [showAll, setShowAll] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  function openProject(project: Project) {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpen(project);
  }

  function closeProject() {
    setOpen(null);
    openerRef.current?.focus();
  }

  return (
    <section className={styles.section} id="projects">
      <SectionHeading index="02 / Projects" title="Selected work" lead={projectsLead} />

      <ProjectCarousel projects={projects.slice(0, CAROUSEL_SIZE)} onOpen={openProject} />

      <button
        className={styles.toggle}
        type="button"
        onClick={() => setShowAll((current) => !current)}
      >
        {showAll ? 'Show less' : `Show all ${projects.length} projects`}
        <Icon name="arrow" size={16} />
      </button>

      {showAll ? (
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={openProject} />
          ))}
        </div>
      ) : null}

      {open ? <ProjectPanel project={open} onClose={closeProject} /> : null}
    </section>
  );
}
