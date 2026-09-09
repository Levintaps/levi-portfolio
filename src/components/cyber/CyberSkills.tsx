import { skillGroups } from '../../data/resume';
import { useReveal } from './useReveal';
import styles from './CyberSkills.module.css';

export default function CyberSkills() {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section className={styles.section} id="cyber-skills" ref={ref} data-revealed={revealed}>
      <header className={styles.header}>
        <span className={styles.tag}>01 / Skills</span>
        <h2 className={styles.title}>Tech arsenal</h2>
      </header>

      <div className={styles.grid}>
        {skillGroups.map((group, index) => (
          <article
            key={group.name}
            className={styles.card}
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            <h3 className={styles.cardTitle}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              {group.name}
            </h3>
            <ul className={styles.tags}>
              {group.items.map((item) => (
                <li key={item} className={styles.chip}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
