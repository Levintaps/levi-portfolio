import { experience } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Experience.module.css';

export default function Experience() {
  return (
    <section className={styles.section} id="experience">
      <SectionHeading title="Inside a corporate IT team" />
      <div className={styles.entries}>
        {experience.map((entry) => (
          <article key={`${entry.company}-${entry.role}`} className={styles.entry}>
            <p className={styles.period}>{`${entry.start} - ${entry.end}`}</p>
            <div className={styles.body}>
              <h3 className={styles.role}>{entry.role}</h3>
              <p className={styles.at}>
                <span className={styles.company}>{entry.company}</span>
                <span className={styles.divider} aria-hidden="true">
                  ·
                </span>
                <span className={styles.kind}>{entry.kind}</span>
              </p>
              <ul className={styles.highlights}>
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
