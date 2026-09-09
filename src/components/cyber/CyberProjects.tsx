import { projects } from '../../data/resume';
import { useReveal } from './useReveal';
import styles from './CyberProjects.module.css';

export default function CyberProjects() {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section className={styles.section} id="cyber-projects" ref={ref} data-revealed={revealed}>
      <header className={styles.header}>
        <span className={styles.tag}>02 / Projects</span>
        <h2 className={styles.title}>Deployed systems</h2>
      </header>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <article
            key={project.id}
            className={styles.card}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <p className={styles.meta}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              {project.period}
            </p>
            <h3 className={styles.name}>{project.name}</h3>
            <p className={styles.summary}>{project.summary}</p>
            <ul className={styles.stack}>
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
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
              <span className={styles.private}>Client system, access restricted</span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
