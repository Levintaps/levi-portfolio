import { projects } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import ProjectCard from './ProjectCard';
import styles from './Projects.module.css';

export default function Projects() {
  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);

  return (
    <section className={styles.section} id="projects">
      <SectionHeading
        index="02 / Projects"
        title="Selected work"
        lead="Systems in production use, built end to end."
      />

      <div className={styles.grid}>
        {featured.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {rest.length > 0 ? (
        <>
          <h3 className={styles.moreHeading}>Also built</h3>
          <div className={styles.grid}>
            {rest.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
