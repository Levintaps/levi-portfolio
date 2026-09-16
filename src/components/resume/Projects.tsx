import { useRef, useState } from 'react';
import { projects, projectsLead } from '../../data/resume';
import type { Project } from '../../data/types';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import AllProjectsModal from './AllProjectsModal';
import ProjectCarousel from './ProjectCarousel';
import ProjectPanel from './ProjectPanel';
import styles from './Projects.module.css';

export const CAROUSEL_SIZE = 7;

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const [listing, setListing] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  function openProject(project: Project) {
    openerRef.current = document.activeElement as HTMLElement | null;
    setListing(false);
    setOpen(project);
  }

  function closeProject() {
    setOpen(null);
    openerRef.current?.focus();
  }

  function openListing() {
    openerRef.current = document.activeElement as HTMLElement | null;
    setListing(true);
  }

  function closeListing() {
    setListing(false);
    openerRef.current?.focus();
  }

  return (
    <section className={styles.section} id="projects">
      <SectionHeading index="01 / Projects" title="Selected work" lead={projectsLead} />

      <ProjectCarousel projects={projects.slice(0, CAROUSEL_SIZE)} onOpen={openProject} />

      <button className={styles.toggle} type="button" onClick={openListing}>
        {`Show all ${projects.length} projects`}
        <Icon name="arrow" size={16} />
      </button>

      {listing ? (
        <AllProjectsModal projects={projects} onOpen={openProject} onClose={closeListing} />
      ) : null}

      {open ? <ProjectPanel project={open} onClose={closeProject} /> : null}
    </section>
  );
}
