import { coreSkills, supportingSkillGroups } from '../../data/resume';
import { useReveal } from '../../hooks/useReveal';
import styles from './CyberSkills.module.css';

export default function CyberSkills() {
  const { ref, revealed } = useReveal<HTMLElement>();

  return (
    <section className={styles.section} id="cyber-skills" ref={ref} data-revealed={revealed}>
      <header className={styles.header}>
        <span className={styles.tag}>01 / Skills</span>
        <h2 className={styles.title}>Tech arsenal</h2>
      </header>

      <ul className={styles.core} aria-label="Core stack">
        {coreSkills.map((skill) => (
          <li key={skill} className={styles.coreItem}>
            {skill}
          </li>
        ))}
      </ul>

      <div className={styles.grid}>
        {supportingSkillGroups.map((group, index) => (
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
